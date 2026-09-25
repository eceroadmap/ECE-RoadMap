import { 
  db, 
  auth,
  ensureFirebaseAuth,
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
      console.log("CURRENT AUTH USER", auth.currentUser);
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);
      snap.forEach((d) => {
        const data = d.data() as Partial<ModeratorRecord>;
        firestoreItems.push({
          ...data,
          id: d.id,
          email: (data.email || d.id).toLowerCase().trim(),
          displayName: data.displayName || 'مشرف معتمد',
          role: data.role || 'moderator',
          status: data.status || 'active',
          notes: data.notes || '',
          addedBy: data.addedBy || BOOTSTRAP_ADMIN_EMAIL,
          addedAt: data.addedAt || new Date().toISOString(),
          updatedAt: data.updatedAt || data.addedAt || new Date().toISOString(),
          lastActiveAt: data.lastActiveAt
        });
      });
      console.log("MODERATOR LIST FETCH", firestoreItems);
    } catch (err: any) {
      console.error("MODERATOR LIST FETCH FAILED", err);
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
    } catch (cfgErr) {
      console.warn("System config fallback check error:", cfgErr);
    }

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
    role?: 'moderator' | 'super_admin' | 'admin';
    status?: 'active' | 'inactive';
    notes?: string;
  }): Promise<ModeratorRecord> {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('يرجى إدخال عنوان بريد Google إلكتروني صحيح.');
    }

    if (cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('هذا البريد هو بريد المالك والمدير الأساسي للنظام.');
    }

    // Fetch current list to check for existing entries
    const existing = await this.fetchModerators();
    const existingIndex = existing.findIndex(m => m.email.toLowerCase() === cleanEmail);

    const now = new Date().toISOString();
    const newRecord: ModeratorRecord = {
      id: cleanEmail,
      email: cleanEmail,
      displayName: params.displayName?.trim() || 'مشرف معتمد',
      role: params.role || 'moderator',
      status: params.status || 'active',
      notes: params.notes?.trim() || '',
      addedBy: auth.currentUser?.email || BOOTSTRAP_ADMIN_EMAIL,
      addedAt: existingIndex >= 0 ? (existing[existingIndex].addedAt || now) : now,
      updatedAt: now
    };

    console.log("MODERATOR CREATE REQUEST", newRecord);

    // 1. Ensure authenticated Firebase session
    try {
      await ensureFirebaseAuth();
      if (auth.currentUser) {
        const currentEmail = (auth.currentUser.email || BOOTSTRAP_ADMIN_EMAIL).toLowerCase().trim();
        if (currentEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
          try {
            await setDoc(doc(db, 'admins', auth.currentUser.uid), {
              uid: auth.currentUser.uid,
              email: BOOTSTRAP_ADMIN_EMAIL,
              displayName: 'المهندسة مروة (مدير المنصة والمالك)',
              role: 'super_admin',
              status: 'active',
              isOwner: true,
              updatedAt: now
            }, { merge: true });
          } catch {}
        }
      }
    } catch {}

    // 2. Write to Firestore moderators collection
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await setDoc(docRef, newRecord, { merge: true });
    } catch (err: any) {
      console.warn("Firestore setDoc on moderators warning (falling back to config & cache):", err);
    }

    // 3. Update local storage list immediately
    const updated = [newRecord, ...existing.filter(m => m.email.toLowerCase() !== cleanEmail)];
    saveLocalModerators(updated);

    // 4. Mirror in system_config
    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: now }, { merge: true });
    } catch (e) {
      console.warn('Mirroring to system_config warning:', e);
    }

    // 5. Log action
    try {
      await adminRepository.logAction(
        'RESOURCE_CREATED',
        'system',
        cleanEmail,
        `تمت إضافة المشرف (${cleanEmail}) ومنحه صلاحيات التحرير الأكاديمي (${newRecord.role})`
      );
    } catch (logErr) {
      console.warn('Logging moderator action caught:', logErr);
    }

    console.log("MODERATOR CREATE SUCCESS", cleanEmail);
    return newRecord;
  },

  /**
   * Updates an existing moderator's details (Name, Role, Status, Notes)
   */
  async updateModerator(email: string, updates: Partial<ModeratorRecord>): Promise<ModeratorRecord> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('عنوان البريد غير صالح.');

    console.log("MODERATOR UPDATE", cleanEmail, updates);

    const existing = await this.fetchModerators();
    const target = existing.find(m => m.email.toLowerCase() === cleanEmail);
    if (!target) {
      throw new Error('لم يتم العثور على المشرف المطلوب تعديله.');
    }

    const now = new Date().toISOString();
    const updatedRecord: ModeratorRecord = {
      ...target,
      ...updates,
      email: cleanEmail,
      id: cleanEmail,
      updatedAt: now
    };

    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await setDoc(docRef, updatedRecord, { merge: true });
    } catch (err: any) {
      console.warn("Firestore updateDoc warning (falling back to config & cache):", err);
    }

    const updatedList = existing.map(m => m.email.toLowerCase() === cleanEmail ? updatedRecord : m);
    saveLocalModerators(updatedList);

    try {
      const activeEmails = updatedList.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updatedList, activeEmails, updatedAt: now }, { merge: true });
    } catch (e) {
      console.warn('Mirroring updated moderator to system_config warning:', e);
    }

    try {
      await adminRepository.logAction(
        'RESOURCE_UPDATED',
        'system',
        cleanEmail,
        `تم تحديث بيانات المشرف (${cleanEmail}): الاسم: ${updatedRecord.displayName} - الحالة: ${updatedRecord.status} - الدور: ${updatedRecord.role || 'moderator'}`
      );
    } catch {}

    console.log("MODERATOR UPDATE SUCCESS", cleanEmail);
    return updatedRecord;
  },

  /**
   * Revokes supervisor privileges and removes their record
   */
  async removeModerator(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    console.log("MODERATOR DELETE", cleanEmail);
    
    // 1. Delete from Firestore
    try {
      await ensureFirebaseAuth();
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn("Firestore deleteDoc warning (falling back to config & cache):", err);
    }

    // 2. Update local storage list
    const existing = await this.fetchModerators();
    const updated = existing.filter(m => m.email.toLowerCase() !== cleanEmail);
    saveLocalModerators(updated);

    // 3. Update system_config
    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Updating system_config on delete failed:', e);
    }

    // 4. Log activity
    try {
      await adminRepository.logAction(
        'RESOURCE_ARCHIVED',
        'system',
        cleanEmail,
        `تم إلغاء وحذف صلاحيات المشرف (${cleanEmail})`
      );
    } catch {}

    console.log("MODERATOR DELETE SUCCESS", cleanEmail);
  },

  /**
   * Toggles supervisor status (active / inactive)
   */
  async toggleModeratorStatus(email: string, currentStatus: 'active' | 'inactive'): Promise<'active' | 'inactive'> {
    const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    await this.updateModerator(email, { status: newStatus });
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

    // 2. Check direct doc /moderators/{email}
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.status === 'active';
      }
    } catch (err) {
      console.warn('Error checking moderator authorization in Firestore:', err);
    }

    // 3. Check local storage fallback
    const local = getLocalModerators();
    const foundLocal = local.find(m => m.email.toLowerCase() === cleanEmail);
    if (foundLocal) {
      return foundLocal.status === 'active';
    }

    return false;
  }
};

