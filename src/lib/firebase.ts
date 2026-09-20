import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  setPersistence,
  browserLocalPersistence,
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

export const resolvedFirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || '',
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || '',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId || undefined
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

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider configured with standard scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Handle redirect result on page load
if (typeof window !== 'undefined') {
  getRedirectResult(auth).then((result) => {
    if (result?.user) {
      console.log('Successfully signed in via redirect:', result.user.email);
    }
  }).catch((err) => {
    console.warn('Redirect result note:', err);
  });
}

export const GOOGLE_OAUTH_CLIENT_ID = (firebaseConfig as any).oAuthClientId || "23606413805-88fmosta6m2kslrr1ctospidfjtqjq9e.apps.googleusercontent.com";

export async function signInWithGoogleDirect(): Promise<User | null> {
  try {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (pErr) {
      console.warn('Set persistence note:', pErr);
    }

    // Use signInWithRedirect for bulletproof iframe & browser compatibility (avoids gsi/transform freeze & storage partitioning)
    await signInWithRedirect(auth, googleProvider);
    return null;
  } catch (err: any) {
    console.warn('Google Redirect Sign-In Error:', err);
    throw err;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  return await signInWithGoogleDirect();
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
