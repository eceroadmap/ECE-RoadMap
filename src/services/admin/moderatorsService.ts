import { 
  db, 
  auth,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from '../../lib/firebase';
import { ModeratorRecord, AdminRecord } from '../../types/admin';
import { adminRepository } from './adminRepository';
import { BOOTSTRAP_ADMIN_EMAIL } from './adminAuth';

const COLLECTION_NAME = 'moderators';
const SYSTEM_CONFIG_DOC = 'system_config';
const MODERATORS_CONFIG_KEY = 'moderators_list';
const LOCAL_STORAGE_KEY = 'eceroadmap_moderators_v2';
const GUEST_VISITORS_COLLECTION = 'guest_visitors';

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
          email: (data.email || d.id).toLowerCase(),
          uid: data.uid,
          displayName: data.displayName || 'مشرف معتمد',
          status: data.status || 'active',
          notes: data.notes || '',
          addedBy: data.addedBy || BOOTSTRAP_ADMIN_EMAIL,
          addedAt: data.addedAt || new Date().toISOString(),
          lastActiveAt: data.lastActiveAt,
          firestoreSynced: !!data.firestoreSynced
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
    uid?: string;
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

    const cleanUid = params.uid?.trim() || undefined;

    const newRecord: ModeratorRecord = {
      id: cleanEmail,
      email: cleanEmail,
      uid: cleanUid,
      displayName: params.displayName?.trim() || 'مشرف معتمد',
      status: 'active',
      notes: params.notes?.trim() || '',
      addedBy: BOOTSTRAP_ADMIN_EMAIL,
      addedAt: new Date().toISOString(),
      firestoreSynced: !!cleanUid
    };

    // 1. Try writing to Firestore /moderators/{cleanEmail}
    try {
      const docRef = doc(db, COLLECTION_NAME, cleanEmail);
      await setDoc(docRef, newRecord, { merge: true });
    } catch (err: any) {
      console.warn('Firestore moderator write caught:', err?.message);
    }

    // 2. If UID is provided, provision in /admins/{cleanUid} immediately if owner
    if (cleanUid) {
      try {
        const adminDocRef = doc(db, 'admins', cleanUid);
        const adminData: AdminRecord = {
          uid: cleanUid,
          email: cleanEmail,
          displayName: newRecord.displayName || 'مشرف معتمد',
          role: 'moderator',
          status: 'active',
          isOwner: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(adminDocRef, adminData, { merge: true });
      } catch (err) {
        console.warn('Direct admin doc creation caught:', err);
      }
    }

    // 3. Update local storage list
    const existing = await this.fetchModerators();
    const updated = [newRecord, ...existing.filter(m => m.email.toLowerCase() !== cleanEmail)];
    saveLocalModerators(updated);

    // 4. Mirror in system_config
    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Mirroring to system_config failed:', e);
    }

    // 5. Log activity
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
   * Manually assigns or updates a moderator's UID and directly provisions their /admins doc
   */
  async assignUidToModerator(email: string, uid: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUid = uid.trim();
    if (!cleanEmail || !cleanUid) return;

    // 1. Provision /admins/{cleanUid} directly
    try {
      const adminDocRef = doc(db, 'admins', cleanUid);
      const adminData: AdminRecord = {
        uid: cleanUid,
        email: cleanEmail,
        displayName: 'مشرف معتمد',
        role: 'moderator',
        status: 'active',
        isOwner: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(adminDocRef, adminData, { merge: true });
    } catch (e) {
      console.warn('Provisioning /admins doc caught:', e);
    }

    // 2. Update /moderators/{cleanEmail}
    try {
      const modDocRef = doc(db, COLLECTION_NAME, cleanEmail);
      await setDoc(modDocRef, { uid: cleanUid, firestoreSynced: true, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Updating /moderators doc caught:', e);
    }

    // 3. Update local storage & system_config
    const existing = await this.fetchModerators();
    const updated = existing.map(m => m.email.toLowerCase() === cleanEmail ? { ...m, uid: cleanUid, firestoreSynced: true } : m);
    saveLocalModerators(updated);

    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch {}
  },

  /**
   * Called when a supervisor logs into the application.
   * Emits a check-in signal so the owner or backend can auto-provision their /admins document.
   */
  async registerModeratorCheckIn(uid: string, email: string, displayName?: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !uid) return;

    // 1. Save UID in local storage for this moderator
    const local = getLocalModerators();
    const existingMod = local.find(m => m.email.toLowerCase() === cleanEmail);
    if (existingMod) {
      existingMod.uid = uid;
      existingMod.lastActiveAt = new Date().toISOString();
      saveLocalModerators(local);
    }

    // 2. Write check-in to guest_visitors (a collection where all authenticated users have create permission)
    try {
      const checkinId = `mod_checkin_${uid}`;
      const checkinRef = doc(db, GUEST_VISITORS_COLLECTION, checkinId);
      await setDoc(checkinRef, {
        guestId: checkinId,
        type: 'moderator_checkin',
        uid,
        email: cleanEmail,
        displayName: displayName || 'مشرف أكاديمي',
        timestamp: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Moderator check-in signal caught:', e);
    }

    // 3. Attempt direct self-provisioning in /admins/{uid}
    try {
      const adminDocRef = doc(db, 'admins', uid);
      const modRecord: AdminRecord = {
        uid,
        email: cleanEmail,
        displayName: displayName || 'مشرف معتمد',
        role: 'moderator',
        status: 'active',
        isOwner: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(adminDocRef, modRecord, { merge: true });
    } catch (e) {
      console.warn('Moderator direct self-provisioning caught (will sync on owner session):', e);
    }
  },

  /**
   * Run by the OWNER to scan check-ins and auto-provision all moderators into /admins/{uid}.
   * Because the OWNER possesses supreme write permissions, this succeeds unconditionally.
   */
  async syncPendingModeratorsByOwner(): Promise<number> {
    let syncedCount = 0;
    try {
      // 1. Fetch current moderators list
      const mods = await this.fetchModerators();
      const activeMods = mods.filter(m => m.status === 'active');
      if (activeMods.length === 0) return 0;

      // 2. Fetch any pending check-ins from guest_visitors
      const checkinsMap: Record<string, string> = {}; // email -> uid
      try {
        const snap = await getDocs(collection(db, GUEST_VISITORS_COLLECTION));
        snap.forEach((d) => {
          const data = d.data();
          if (data.type === 'moderator_checkin' && data.email && data.uid) {
            checkinsMap[data.email.toLowerCase()] = data.uid;
          }
        });
      } catch (e) {
        console.warn('Scanning check-in signals caught:', e);
      }

      // 3. For each active moderator, resolve UID and write /admins/{uid}
      const updatedMods: ModeratorRecord[] = [];
      for (const mod of mods) {
        const cleanEmail = mod.email.toLowerCase();
        const resolvedUid = mod.uid || checkinsMap[cleanEmail];

        if (resolvedUid && mod.status === 'active') {
          try {
            const adminDocRef = doc(db, 'admins', resolvedUid);
            const adminData: AdminRecord = {
              uid: resolvedUid,
              email: cleanEmail,
              displayName: mod.displayName || 'مشرف معتمد',
              role: 'moderator',
              status: 'active',
              isOwner: false,
              createdAt: mod.addedAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(adminDocRef, adminData, { merge: true });
            syncedCount++;
            updatedMods.push({ ...mod, uid: resolvedUid, firestoreSynced: true });
          } catch (err) {
            console.warn(`Failed writing /admins/${resolvedUid} for ${cleanEmail}:`, err);
            updatedMods.push(mod);
          }
        } else {
          updatedMods.push(mod);
        }
      }

      // 4. Update mirrors
      saveLocalModerators(updatedMods);
      try {
        const activeEmails = updatedMods.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
        const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
        await setDoc(cfgRef, { moderators: updatedMods, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
      } catch {}

    } catch (err) {
      console.warn('syncPendingModeratorsByOwner encountered error:', err);
    }
    return syncedCount;
  },

  /**
   * Checks whether a specific moderator UID has an active document in /admins/{uid}
   */
  async checkModeratorFirestoreStatus(uid?: string): Promise<'active_in_db' | 'not_in_db'> {
    if (!uid) return 'not_in_db';
    try {
      const snap = await getDoc(doc(db, 'admins', uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.role === 'moderator' && data.status === 'active') {
          return 'active_in_db';
        }
      }
      return 'not_in_db';
    } catch {
      return 'not_in_db';
    }
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
      console.warn('Firestore delete moderator caught:', err?.message);
    }

    // 2. Update local storage list
    const existing = await this.fetchModerators();
    const removedMod = existing.find(m => m.email.toLowerCase() === cleanEmail);
    const updated = existing.filter(m => m.email.toLowerCase() !== cleanEmail);
    saveLocalModerators(updated);

    // 3. If UID exists, deactivate in /admins/{uid}
    if (removedMod?.uid) {
      try {
        await deleteDoc(doc(db, 'admins', removedMod.uid));
      } catch (e) {
        console.warn('Deleting /admins doc caught:', e);
      }
    }

    // 4. Try updating system_config
    try {
      const activeEmails = updated.filter(m => m.status === 'active').map(m => m.email.toLowerCase());
      const cfgRef = doc(db, SYSTEM_CONFIG_DOC, MODERATORS_CONFIG_KEY);
      await setDoc(cfgRef, { moderators: updated, activeEmails, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn('Updating system_config failed:', e);
    }

    // 5. Log activity
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
    const targetMod = existing.find(m => m.email.toLowerCase() === cleanEmail);
    const updated = existing.map(m => m.email.toLowerCase() === cleanEmail ? { ...m, status: newStatus as 'active' | 'inactive' } : m);
    saveLocalModerators(updated);

    if (targetMod?.uid) {
      try {
        await updateDoc(doc(db, 'admins', targetMod.uid), { status: newStatus });
      } catch (e) {
        console.warn('Toggling status in /admins caught:', e);
      }
    }

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
        if (activeEmails.some(e => e.toLowerCase() === cleanEmail)) {
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
