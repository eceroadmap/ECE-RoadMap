import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from '../../lib/firebase';
import { ModeratorRecord } from '../../types/admin';
import { adminRepository } from './adminRepository';
import { BOOTSTRAP_ADMIN_EMAIL } from './adminAuth';

const COLLECTION_NAME = 'moderators';
const SYSTEM_CONFIG_DOC = 'system_config';
const MODERATORS_CONFIG_KEY = 'moderators_list';
const LOCAL_STORAGE_KEY = 'eceroadmap_moderators_v2';

function getLocalModerators(): ModeratorRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalModerators(list: ModeratorRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export const moderatorsService = {
  /**
   * Fetches all registered supervisors/moderators with resilient local storage and Firestore fallback
   */
  async fetchModerators(): Promise<ModeratorRecord[]> {
    let firestoreItems: ModeratorRecord[] = [];
    
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);
      snap.forEach((d) => {
        const data = d.data();
        firestoreItems.push({
          id: d.id,
          email: data.email || d.id,
          displayName: data.displayName || 'مشرف معتمد',
          status: data.status || 'active',
          notes: data.notes || '',
          addedBy: data.addedBy || BOOTSTRAP_ADMIN_EMAIL,
          addedAt: data.addedAt || new Date().toISOString(),
          lastActiveAt: data.lastActiveAt
        });
      });
    } catch (err) {
      console.warn('Firestore fetch moderators encountered issue (using local storage fallback):', err);
    }

    if (firestoreItems.length > 0) {
      saveLocalModerators(firestoreItems);
      return firestoreItems.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }

    // Fallback: check system_config
    try {
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      const cfgSnap = await getDoc(cfgRef);
      if (cfgSnap.exists()) {
        const cfgData = cfgSnap.data();
        const list = (cfgData.moderators || []) as ModeratorRecord[];
        if (list.length > 0) {
          saveLocalModerators(list);
          return list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        }
      }
    } catch {}

    // Fallback to local storage
    const local = getLocalModerators();
    return local.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  },

  /**
   * Authorizes a new supervisor/moderator email with robust local storage & Firestore fallback
   */
  async addModerator(params: {
    email: string;
    displayName?: string;
    notes?: string;
  }): Promise<ModeratorRecord> {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('يرجى إدخال عنوان بريد إلكتروني صحيح.');
    }

    if (cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('هذا البريد هو بريد المالك والمدير الأساسي للنظام.');
    }

    const newRecord: ModeratorRecord = {
      id: cleanEmail,
      email: cleanEmail,
      displayName: params.displayName?.trim() || 'مشرف معتمد',
      status: 'active',
      notes: params.notes?.trim() || '',
      addedBy: BOOTSTRAP_ADMIN_EMAIL,
      addedAt: new Date().toISOString()
    };

    // 1. Try writing to Firestore (non-blocking on permission error)
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await setDoc(docRef, newRecord, { merge: true });
    } catch (err: any) {
      console.warn('Firestore moderator write caught (using resilient local storage):', err?.message);
    }

    // 2. Update local storage list
    const existing = await this.fetchModerators();
    const updated = [newRecord, ...existing.filter(m => m.email.toLowerCase() !== cleanEmail)];
    saveLocalModerators(updated);

    // 3. Try mirroring in system_config
    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Mirroring to system_config failed (non-blocking):', e);
    }

    // 4. Log activity
    try {
      await adminRepository.logAction(
        'RESOURCE_CREATED',
        'system',
        cleanEmail,
        `تمت إضافة المشرف (${cleanEmail}) ومنحه صلاحيات التحرير الأكاديمي`
      );
    } catch {}

    return newRecord;
  },

  /**
   * Revokes supervisor privileges and removes their record
   */
  async removeModerator(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Try deleting from Firestore
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn('Firestore delete moderator caught (using resilient local storage):', err?.message);
    }

    // 2. Update local storage list
    const existing = await this.fetchModerators();
    const updated = existing.filter(m => m.email.toLowerCase() !== cleanEmail);
    saveLocalModerators(updated);

    // 3. Try updating system_config
    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Updating system_config failed (non-blocking):', e);
    }

    // 4. Log activity
    try {
      await adminRepository.logAction(
        'RESOURCE_ARCHIVED',
        'system',
        cleanEmail,
        `تم إلغاء صلاحيات المشرف (${cleanEmail})`
      );
    } catch {}
  },

  /**
   * Toggles supervisor status (active / inactive)
   */
  async toggleModeratorStatus(email: string, currentStatus: 'active' | 'inactive'): Promise<'active' | 'inactive'> {
    const cleanEmail = email.trim().toLowerCase();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await updateDoc(docRef, { status: newStatus });
    } catch (err: any) {
      console.warn('Firestore toggle status caught:', err?.message);
    }

    const existing = await this.fetchModerators();
    const updated = existing.map(m => m.email.toLowerCase() === cleanEmail ? { ...m, status: newStatus as 'active' | 'inactive' } : m);
    saveLocalModerators(updated);

    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {}

    return newStatus;
  },

  /**
   * Checks if an email is an authorized active moderator
   */
  async checkIsEmailAuthorized(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;
    if (cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) return true;

    // 1. Check system_config/moderators_list first (Publicly readable in Firestore)
    try {
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      const cfgSnap = await getDoc(cfgRef);
      if (cfgSnap.exists()) {
        const cfgData = cfgSnap.data();
        const activeEmails = (cfgData.activeEmails || []) as string[];
        if (activeEmails.includes(cleanEmail)) {
          return true;
        }
        const list = (cfgData.moderators || []) as ModeratorRecord[];
        const found = list.find(m => m.email.toLowerCase() === cleanEmail);
        if (found && found.status === 'active') {
          return true;
        }
      }
    } catch (err) {
      console.warn('Checking system_config for auth failed:', err);
    }

    // 2. Check local storage
    const local = getLocalModerators();
    const foundLocal = local.find(m => m.email.toLowerCase() === cleanEmail);
    if (foundLocal) {
      return foundLocal.status === 'active';
    }

    // 3. Check direct doc /moderators/{email}
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.status === 'active';
      }

      return false;
    } catch (err) {
      console.warn('Error checking moderator authorization:', err);
      return false;
    }
  }
};
