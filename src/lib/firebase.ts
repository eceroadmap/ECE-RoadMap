import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
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

export const GOOGLE_OAUTH_CLIENT_ID = (firebaseConfig as any).oAuthClientId || "23606413805-fd53oevs7u3rrkmq4bu6qfj9ipad9p1r.apps.googleusercontent.com";

export async function signInWithGoogleDirect(): Promise<User | null> {
  try {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (pErr) {
      console.warn('Set persistence note:', pErr);
    }

    // Check if Google Identity Services (GIS) library is available
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      return new Promise<User | null>((resolve, reject) => {
        let isSettled = false;

        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_OAUTH_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (response: any) => {
            if (isSettled) return;

            if (response?.error) {
              console.warn('GIS Token Callback Error:', response.error);
              isSettled = true;
              reject(new Error(response.error));
              return;
            }

            if (response?.access_token) {
              isSettled = true;
              try {
                const credential = GoogleAuthProvider.credential(null, response.access_token);
                const userCredential = await signInWithCredential(auth, credential);
                resolve(userCredential.user);
              } catch (credErr) {
                console.warn('Credential Sign-In Error:', credErr);
                reject(credErr);
              }
            } else {
              isSettled = true;
              reject(new Error('NO_ACCESS_TOKEN'));
            }
          },
          error_callback: (err: any) => {
            if (isSettled) return;
            isSettled = true;
            reject(err);
          }
        });

        // Trigger native Google token request
        client.requestAccessToken({ prompt: 'select_account' });
      });
    }

    // Fallback if GSI script isn't loaded yet
    return await signInWithGoogle();
  } catch (err: any) {
    console.warn('Direct Google Sign-In Fallback:', err);
    // Fallback to standard popup if direct GIS is not completed or cancelled
    if (err?.message !== 'popup-closed-by-user' && err?.code !== 'auth/popup-closed-by-user') {
      return await signInWithGoogle();
    }
    throw err;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (pErr) {
      console.warn('Set persistence note:', pErr);
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error('SIGNIN_TIMEOUT');
        (timeoutError as any).code = 'auth/popup-timeout';
        reject(timeoutError);
      }, 35000);
    });

    const result = await Promise.race([
      signInWithPopup(auth, googleProvider),
      timeoutPromise
    ]);
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
