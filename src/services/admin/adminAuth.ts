import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  getDocs,
  collection,
  setDoc, 
  onAuthStateChanged, 
  User 
} from '../../lib/firebase';
import { AdminRecord } from '../../types/admin';
import { moderatorsService } from './moderatorsService';
import { firebaseSyncService } from '../firebaseSync';

// The verified initial project administrator email (from project environment)
export const BOOTSTRAP_ADMIN_EMAIL = 'marwa.mgd.shmdeen@gmail.com';

let currentAdminStatus = false;
let currentAdminRecord: AdminRecord | null = null;
const adminListeners: Set<(isAdmin: boolean, record: AdminRecord | null) => void> = new Set();

function notifyAdminListeners() {
  adminListeners.forEach(cb => cb(currentAdminStatus, currentAdminRecord));
}

export function getIsOwner(): boolean {
  if (currentAdminRecord?.isOwner === true) return true;
  const currentEmail = (auth.currentUser?.email || firebaseSyncService.getUser()?.email)?.toLowerCase().trim();
  return currentEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
}

/**
 * Verifies whether the specified Firebase User possesses administrator privileges.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  const syncUser = firebaseSyncService.getUser();
  const effectiveUser = user || (syncUser ? { uid: syncUser.uid, email: syncUser.email, displayName: syncUser.displayName, isAnonymous: false } as User : null);

  if (!effectiveUser || effectiveUser.isAnonymous) {
    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  }

  const userEmail = effectiveUser.email?.toLowerCase().trim() || '';
  if (!userEmail) {
    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  }

  const isBootstrapOwner = userEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  try {
    const adminDocRef = doc(db, 'admins', effectiveUser.uid);

    // Priority 1: Bootstrapped project owner (Super Admin)
    if (isBootstrapOwner) {
      const ownerData: AdminRecord = {
        uid: effectiveUser.uid,
        displayName: effectiveUser.displayName || 'المهندسة مروة (مدير المنصة والمالك)',
        email: effectiveUser.email || BOOTSTRAP_ADMIN_EMAIL,
        role: 'super_admin',
        status: 'active',
        isOwner: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(adminDocRef, ownerData, { merge: true });
        
        // As Owner, scan and auto-provision any active moderator sessions into /admins
        try {
          const cfgSnap = await getDoc(doc(db, 'system_config', 'moderators_list'));
          const activeEmails = new Set(((cfgSnap.data()?.activeEmails || []) as string[]).map(e => e.toLowerCase()));
          const sessionsSnap = await getDocs(collection(db, 'site_stats')).catch(() => null);
          if (sessionsSnap) {
            sessionsSnap.forEach((d) => {
              if (d.id.startsWith('mod_session_')) {
                const sData = d.data();
                if (sData.uid && sData.email && activeEmails.has(sData.email.toLowerCase())) {
                  setDoc(doc(db, 'admins', sData.uid), {
                    uid: sData.uid,
                    email: sData.email,
                    displayName: sData.displayName || 'مشرف معتمد',
                    role: sData.role || 'moderator',
                    status: 'active',
                    isOwner: false,
                    updatedAt: new Date().toISOString()
                  }, { merge: true }).catch(() => null);
                }
              }
            });
          }
        } catch {}
      } catch (e) {
        console.warn('Saving owner admin doc caught:', e);
      }

      currentAdminStatus = true;
      currentAdminRecord = ownerData;
      notifyAdminListeners();
      return true;
    }

    // Priority 2: Check if email is in the authorized moderators collection
    const isAuthorizedMod = await moderatorsService.checkIsEmailAuthorized(userEmail);
    if (isAuthorizedMod) {
      const modList = await moderatorsService.fetchModerators();
      const modRecord = modList.find(m => m.email.toLowerCase() === userEmail);
      const assignedRole = (modRecord?.role as any) === 'super_admin' ? 'super_admin' : 'moderator';

      const modData: AdminRecord = {
        uid: effectiveUser.uid,
        displayName: effectiveUser.displayName || modRecord?.displayName || 'مشرف أكاديمي معتمد',
        email: effectiveUser.email || userEmail,
        role: assignedRole,
        status: modRecord?.status || 'active',
        isOwner: assignedRole === 'super_admin',
        createdAt: modRecord?.addedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Broadcast session to site_stats so owner can promote UID to /admins
      try {
        await setDoc(doc(db, 'site_stats', 'mod_session_' + effectiveUser.uid), {
          uid: effectiveUser.uid,
          email: userEmail,
          displayName: modData.displayName,
          role: assignedRole,
          timestamp: new Date().toISOString()
        }, { merge: true });
      } catch {}

      // 2. Attempt direct write to /admins (succeeds if rules allow)
      try {
        await setDoc(adminDocRef, modData, { merge: true });
      } catch (e) {
        console.warn('Auto-provisioning moderator doc in /admins caught (session broadcasted):', e);
      }

      currentAdminStatus = true;
      currentAdminRecord = modData;
      notifyAdminListeners();
      return true;
    }

    // Priority 3: Check Firestore /admins/{uid}
    try {
      const snap = await getDoc(adminDocRef);
      if (snap.exists()) {
        const data = snap.data() as AdminRecord;
        if (data.status === 'active') {
          const isOwner = data.role === 'super_admin' || userEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
          currentAdminStatus = true;
          currentAdminRecord = { ...data, isOwner };
          notifyAdminListeners();
          return true;
        }
      }
    } catch (e) {
      console.warn('Checking /admins doc caught:', e);
    }

    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  } catch (err: any) {
    if (isBootstrapOwner) {
      const ownerData: AdminRecord = {
        uid: effectiveUser.uid,
        displayName: effectiveUser.displayName || 'المهندسة مروة (مدير المنصة)',
        email: effectiveUser.email || BOOTSTRAP_ADMIN_EMAIL,
        role: 'super_admin',
        status: 'active',
        isOwner: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      currentAdminStatus = true;
      currentAdminRecord = ownerData;
      notifyAdminListeners();
      return true;
    }

    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  }
}

/**
 * Sign out administrator
 */
export function logoutAdmin() {
  currentAdminStatus = false;
  currentAdminRecord = null;
  notifyAdminListeners();
}

/**
 * Real-time subscription to administrator authorization state
 */
export function subscribeAdminAuth(
  callback: (isAdmin: boolean, record: AdminRecord | null) => void
): () => void {
  adminListeners.add(callback);
  callback(currentAdminStatus, currentAdminRecord);

  const unsubAuth = onAuthStateChanged(auth, async (user) => {
    const syncUser = firebaseSyncService.getUser();
    const effectiveUser = user || (syncUser ? { uid: syncUser.uid, email: syncUser.email, displayName: syncUser.displayName, isAnonymous: false } as User : null);
    await checkIsAdmin(effectiveUser);
  });

  const unsubSync = firebaseSyncService.subscribeAuth(async (syncUser) => {
    const authUser = auth.currentUser;
    const effectiveUser = authUser || (syncUser ? { uid: syncUser.uid, email: syncUser.email, displayName: syncUser.displayName, isAnonymous: false } as User : null);
    await checkIsAdmin(effectiveUser);
  });

  return () => {
    adminListeners.delete(callback);
    unsubAuth();
    unsubSync();
  };
}

export const adminAuthService = {
  getIsAdmin: () => currentAdminStatus,
  getAdminRecord: () => currentAdminRecord,
  getIsOwner,
  checkIsAdmin,
  logout: logoutAdmin,
  subscribe: subscribeAdminAuth
};
