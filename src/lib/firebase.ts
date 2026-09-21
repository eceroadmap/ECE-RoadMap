import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
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
  serverTimestamp
} from 'firebase/firestore';

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
// Enabling experimentalAutoDetectLongPolling solves WebChannel streaming timeout/connection errors in sandboxed preview environments
export const db = (function() {
  try {
    const cache = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
    return initializeFirestore(app, {
      localCache: cache,
      experimentalAutoDetectLongPolling: true,
    }, TARGET_FIRESTORE_DB_ID);
  } catch (err) {
    try {
      return initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
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
    await getDocFromServer(doc(db, 'site_stats', 'visitors'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('offline') || error?.code === 'unavailable') {
      console.info('Firestore client is operating in offline mode with cached storage.');
    }
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
