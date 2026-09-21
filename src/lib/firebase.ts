import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  getDocs,
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  limit,
  orderBy, 
  addDoc, 
  arrayUnion, 
  arrayRemove,
  increment,
  writeBatch,
  runTransaction,
  serverTimestamp,
  setLogLevel
} from 'firebase/firestore';

// Suppress benign internal SDK connection warning logs in sandboxed iframe previews
try {
  setLogLevel('silent');
} catch {}

import firebaseConfig from '../../firebase-applet-config.json';

// Resolve environment variables with development fallback
const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};

// Filter out any stale references to the old project from container OS environment if present
const rawProjectId = env.VITE_FIREBASE_PROJECT_ID;
const isOldProject = rawProjectId === 'gen-lang-client-0992899684';

export const TARGET_FIRESTORE_DB_ID = 'ai-studio-eceroadmap-92942c14-153e-4944-ad7d-20e5ea4add92';

export const resolvedFirebaseConfig = {
  apiKey: (!isOldProject && env.VITE_FIREBASE_API_KEY) || firebaseConfig.apiKey || '',
  authDomain: (!isOldProject && env.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfig.authDomain || '',
  projectId: (!isOldProject && env.VITE_FIREBASE_PROJECT_ID) || firebaseConfig.projectId || 'eceroadmap2027',
  storageBucket: (!isOldProject && env.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfig.storageBucket || '',
  messagingSenderId: (!isOldProject && env.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfig.messagingSenderId || '',
  appId: (!isOldProject && env.VITE_FIREBASE_APP_ID) || firebaseConfig.appId || '',
  firestoreDatabaseId: TARGET_FIRESTORE_DB_ID
};

// Global Production Canonical URL
export const CANONICAL_PRODUCTION_URL = 'https://www.eceroadmap.workers.dev/';

export function getProductionAppUrl(): string {
  return CANONICAL_PRODUCTION_URL;
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  projectId: resolvedFirebaseConfig.projectId,
  appId: resolvedFirebaseConfig.appId,
  apiKey: resolvedFirebaseConfig.apiKey,
  authDomain: resolvedFirebaseConfig.authDomain,
  storageBucket: resolvedFirebaseConfig.storageBucket,
  messagingSenderId: resolvedFirebaseConfig.messagingSenderId,
});

// Initialize Firestore strictly targeting ai-studio-eceroadmap-92942c14-153e-4944-ad7d-20e5ea4add92
// Enabling experimentalForceLongPolling solves WebChannel streaming timeout/connection errors in sandboxed preview environments
export const db = (function() {
  try {
    const cache = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
    return initializeFirestore(app, {
      localCache: cache,
      experimentalForceLongPolling: true,
    }, TARGET_FIRESTORE_DB_ID);
  } catch (err) {
    try {
      return initializeFirestore(app, {
        experimentalForceLongPolling: true,
      }, TARGET_FIRESTORE_DB_ID);
    } catch {
      return getFirestore(app, TARGET_FIRESTORE_DB_ID);
    }
  }
})();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'site_stats', 'visitors'));
    return snap.exists();
  } catch (error: any) {
    console.info('Firestore operating with cached storage or waiting for connection.');
    return false;
  }
}

// Test initial connection asynchronously on boot
testFirestoreConnection();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider configured with standard scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google sign-in attempt warning:', error?.code, error?.message || error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export async function getOrCreateFirebaseUser(): Promise<User> {
  console.log('AUTH CHECK:', {
    'currentUser before': auth.currentUser ? { uid: auth.currentUser.uid, isAnonymous: auth.currentUser.isAnonymous } : null
  });

  if (auth.currentUser) {
    console.log('AUTH CHECK:', {
      'using existing currentUser': true,
      uid: auth.currentUser.uid
    });
    return auth.currentUser;
  }
  try {
    console.log('AUTH CHECK:', { 'anonymous sign in attempted': true });
    const cred = await signInAnonymously(auth);
    if (!cred.user) {
      throw new Error('FAILED_TO_GENERATE_ANONYMOUS_FIREBASE_USER');
    }
    const curr = auth.currentUser as User | null;
    console.log('AUTH CHECK:', {
      'currentUser after': curr ? { uid: curr.uid, isAnonymous: curr.isAnonymous } : null,
      uid: cred.user.uid
    });
    return cred.user;
  } catch (err: any) {
    console.error('Failed to get or create Firebase user:', err);
    throw new Error(err?.message || 'FIREBASE_AUTH_USER_UNAVAILABLE');
  }
}

export async function ensureFirebaseAuth(): Promise<User | null> {
  try {
    return await getOrCreateFirebaseUser();
  } catch (err) {
    console.warn('Anonymous auth fallback warning:', err);
    return null;
  }
}

export { 
  doc, 
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  limit,
  orderBy, 
  addDoc, 
  arrayUnion, 
  arrayRemove,
  increment,
  writeBatch,
  runTransaction,
  serverTimestamp,
  onAuthStateChanged 
};
export type { User };
