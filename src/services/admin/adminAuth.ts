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

// The verified initial project administrator email (from project environment)
export const BOOTSTRAP_ADMIN_EMAIL = 'marwa.mgd.shmdeen@gmail.com';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Admin Auth Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let currentAdminStatus = false;
let currentAdminRecord: AdminRecord | null = null;
const adminListeners: Set<(isAdmin: boolean, record: AdminRecord | null) => void> = new Set();

function notifyAdminListeners() {
  adminListeners.forEach(cb => cb(currentAdminStatus, currentAdminRecord));
}

export function getIsOwner(): boolean {
  if (currentAdminRecord?.isOwner === true) return true;
  const currentEmail = auth.currentUser?.email?.toLowerCase().trim();
  return currentEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
}

/**
 * Verifies whether the specified Firebase User possesses administrator privileges.
 * Validation priority:
 * 1. Checks if user is the bootstrapped verified project owner email.
 * 2. Checks Firestore `admins/{uid}` document existence.
 * 3. Checks if user email is authorized in `moderators` list.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user || user.isAnonymous) {
    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  }

  const userEmail = user.email?.toLowerCase().trim() || '';
  const isBootstrapOwner = userEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  try {
    const adminDocRef = doc(db, 'admins', user.uid);

    // Priority 1: Bootstrapped project owner (Super Admin)
    if (isBootstrapOwner) {
      const ownerData: AdminRecord = {
        uid: user.uid,
        displayName: user.displayName || 'مدير المنصة (المالك)',
        email: user.email || BOOTSTRAP_ADMIN_EMAIL,
        role: 'super_admin',
        status: 'active',
        isOwner: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(adminDocRef, ownerData, { merge: true });
        currentAdminRecord = ownerData;
      } catch {
        currentAdminRecord = ownerData;
      }

      currentAdminStatus = true;
      notifyAdminListeners();
      return true;
    }

    // Priority 2: Check Firestore /admins/{uid}
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

    // Priority 3: Check if email is in the authorized moderators list
    const isAuthorizedMod = await moderatorsService.checkIsEmailAuthorized(userEmail);
    if (isAuthorizedMod) {
      const modData: AdminRecord = {
        uid: user.uid,
        displayName: user.displayName || 'مشرف معتمد',
        email: user.email || userEmail,
        role: 'moderator',
        status: 'active',
        isOwner: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

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

    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  } catch (err: any) {
    // If error occurs, check if owner
    if (isBootstrapOwner) {
      currentAdminStatus = true;
      currentAdminRecord = {
        uid: user.uid,
        displayName: user.displayName || 'مدير المنصة',
        email: user.email || BOOTSTRAP_ADMIN_EMAIL,
        role: 'super_admin',
        status: 'active',
        isOwner: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
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
 * Real-time subscription to administrator authorization state
 */
export function subscribeAdminAuth(
  callback: (isAdmin: boolean, record: AdminRecord | null) => void
): () => void {
  adminListeners.add(callback);
  callback(currentAdminStatus, currentAdminRecord);

  const unsubAuth = onAuthStateChanged(auth, async (user) => {
    await checkIsAdmin(user);
  });

  return () => {
    adminListeners.delete(callback);
    unsubAuth();
  };
}

export const adminAuthService = {
  getIsAdmin: () => currentAdminStatus,
  getAdminRecord: () => currentAdminRecord,
  getIsOwner,
  checkIsAdmin,
  subscribe: subscribeAdminAuth
};
