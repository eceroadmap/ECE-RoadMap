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

/**
 * Verifies whether the specified Firebase User possesses administrator privileges.
 * Validation priority:
 * 1. Checks Firestore `admins/{uid}` document existence.
 * 2. Checks if user is the bootstrapped verified project owner email.
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user || user.isAnonymous) {
    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  }

  const userEmail = user.email?.toLowerCase().trim();
  const isBootstrapOwner = userEmail === BOOTSTRAP_ADMIN_EMAIL;

  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);

    if (snap.exists()) {
      const data = snap.data() as AdminRecord;
      if (data.status === 'active') {
        currentAdminStatus = true;
        currentAdminRecord = data;
        notifyAdminListeners();
        return true;
      }
    }

    // Fallback: If bootstrapped project owner, auto-provision their /admins/{uid} doc
    if (isBootstrapOwner) {
      const adminData: AdminRecord = {
        uid: user.uid,
        displayName: user.displayName || 'مشرف المنصة الرئيسي',
        email: user.email || BOOTSTRAP_ADMIN_EMAIL,
        role: 'super_admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(adminDocRef, adminData, { merge: true });
        currentAdminRecord = adminData;
      } catch {
        // Even if write is delayed, they are recognized as admin in-memory
        currentAdminRecord = adminData;
      }

      currentAdminStatus = true;
      notifyAdminListeners();
      return true;
    }

    currentAdminStatus = false;
    currentAdminRecord = null;
    notifyAdminListeners();
    return false;
  } catch (err: any) {
    // If permission denied or network failure
    if (isBootstrapOwner) {
      currentAdminStatus = true;
      currentAdminRecord = {
        uid: user.uid,
        displayName: user.displayName || 'مشرف المنصة',
        email: user.email || BOOTSTRAP_ADMIN_EMAIL,
        role: 'super_admin',
        status: 'active',
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
  checkIsAdmin,
  subscribe: subscribeAdminAuth
};
