import { 
  auth, 
  db, 
  doc, 
  getDoc, 
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
        // Automatically sync pending moderators from owner's privileged session
        moderatorsService.syncPendingModeratorsByOwner().catch(err => {
          console.warn('Auto-sync moderators caught:', err);
        });
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
      const modData: AdminRecord = {
        uid: effectiveUser.uid,
        displayName: effectiveUser.displayName || 'مشرف أكاديمي معتمد',
        email: effectiveUser.email || userEmail,
        role: 'moderator',
        status: 'active',
        isOwner: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Register check-in signal and attempt direct self-provisioning
      try {
        await moderatorsService.registerModeratorCheckIn(
          effectiveUser.uid, 
          userEmail, 
          effectiveUser.displayName || undefined
        );
      } catch (e) {
        console.warn('Moderator check-in caught:', e);
      }

      try {
        await setDoc(adminDocRef, modData, { merge: true });
      } catch (e) {
        console.warn('Auto-provisioning moderator doc in /admins caught:', e);
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
