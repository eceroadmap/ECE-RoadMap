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

export const moderatorsService = {
  /**
   * Fetches all registered supervisors/moderators
   */
  async fetchModerators(): Promise<ModeratorRecord[]> {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);
      const items: ModeratorRecord[] = [];

      snap.forEach((d) => {
        const data = d.data();
        items.push({
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

      // If collection returned items, return sorted by addedAt descending
      if (items.length > 0) {
        return items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      }

      // Fallback: check system_config
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      const cfgSnap = await getDoc(cfgRef);
      if (cfgSnap.exists()) {
        const cfgData = cfgSnap.data();
        const list = (cfgData.moderators || []) as ModeratorRecord[];
        return list;
      }

      return [];
    } catch (err) {
      console.warn('Could not fetch moderators from Firestore collection, attempting config fallback:', err);
      try {
        const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
        const cfgSnap = await getDoc(cfgRef);
        if (cfgSnap.exists()) {
          const cfgData = cfgSnap.data();
          return (cfgData.moderators || []) as ModeratorRecord[];
        }
      } catch (inner) {
        console.warn('Config fallback also failed:', inner);
      }
      return [];
    }
  },

  /**
   * Authorizes a new supervisor/moderator email (Owner only)
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

    // 1. Save in /moderators/{email}
    const docRef = doc(db, COLLECTION_NAME, cleanEmail);
    await setDoc(docRef, newRecord, { merge: true });

    // 2. Also mirror in system_config for resilient checks
    try {
      const existing = await this.fetchModerators();
      const updated = [newRecord, ...existing.filter(m => m.email.toLowerCase() !== cleanEmail)];
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Mirroring to system_config failed (non-blocking):', e);
    }

    // 3. Log activity
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
   * Revokes supervisor privileges and removes their record (Owner only)
   */
  async removeModerator(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Delete from /moderators/{email}
    const docRef = doc(db, COLLECTION_NAME, cleanEmail);
    await deleteDoc(docRef);

    // 2. Remove from system_config
    try {
      const existing = await this.fetchModerators();
      const updated = existing.filter(m => m.email.toLowerCase() !== cleanEmail);
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Updating system_config failed (non-blocking):', e);
    }

    // 3. Log activity
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

    const docRef = doc(db, COLLECTION_NAME, cleanEmail);
    await updateDoc(docRef, { status: newStatus });

    try {
      const existing = await this.fetchModerators();
      const updated = existing.map(m => m.email.toLowerCase() === cleanEmail ? { ...m, status: newStatus } : m);
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

    try {
      // 1. Check direct doc /moderators/{email}
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.status === 'active';
      }

      // 2. Fallback check in system_config
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      const cfgSnap = await getDoc(cfgRef);
      if (cfgSnap.exists()) {
        const cfgData = cfgSnap.data();
        const list = (cfgData.moderators || []) as ModeratorRecord[];
        const found = list.find(m => m.email.toLowerCase() === cleanEmail);
        return found ? found.status === 'active' : false;
      }

      return false;
    } catch (err) {
      console.warn('Error checking moderator authorization:', err);
      return false;
    }
  }
};
