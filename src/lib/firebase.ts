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

export const resolvedFirebaseConfig = {
  apiKey: (!isOldProject && env.VITE_FIREBASE_API_KEY) || firebaseConfig.apiKey || '',
  authDomain: (!isOldProject && env.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfig.authDomain || '',
  projectId: (!isOldProject && env.VITE_FIREBASE_PROJECT_ID) || firebaseConfig.projectId || 'eceroadmap2027',
  storageBucket: (!isOldProject && env.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfig.storageBucket || '',
  messagingSenderId: (!isOldProject && env.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfig.messagingSenderId || '',
  appId: (!isOldProject && env.VITE_FIREBASE_APP_ID) || firebaseConfig.appId || '',
  firestoreDatabaseId: (!isOldProject && env.VITE_FIREBASE_FIRESTORE_DATABASE_ID) || (firebaseConfig as any).firestoreDatabaseId || undefined
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

// Initialize Firestore with persistent local cache and fallback
export const db = (function() {
  try {
    const cache = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
    return resolvedFirebaseConfig.firestoreDatabaseId
      ? initializeFirestore(app, { localCache: cache }, resolvedFirebaseConfig.firestoreDatabaseId)
      : initializeFirestore(app, { localCache: cache });
  } catch (err) {
    return resolvedFirebaseConfig.firestoreDatabaseId
      ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// Default Firestore instance fallback for (default) database
export const defaultDb = getFirestore(app);

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
