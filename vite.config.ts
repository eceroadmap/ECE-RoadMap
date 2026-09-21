import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Ensure PRIMARY VITE_FIREBASE_* config points to eceroadmap2027
const primaryFirebaseConfig = {
  VITE_FIREBASE_PROJECT_ID: 'eceroadmap2027',
  VITE_FIREBASE_AUTH_DOMAIN: 'eceroadmap2027.firebaseapp.com',
  VITE_FIREBASE_STORAGE_BUCKET: 'eceroadmap2027.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '23606413805',
  VITE_FIREBASE_APP_ID: '1:23606413805:web:1532dd0867824f616fbfe4',
  VITE_FIREBASE_API_KEY: 'AIzaSyDwZSfg8xfSnm0WSZkT64UnJjq4vcQci6w',
  VITE_FIREBASE_FIRESTORE_DATABASE_ID: '',
};

for (const [key, val] of Object.entries(primaryFirebaseConfig)) {
  process.env[key] = val;
}

export default defineConfig(() => {
  return {
    base: '/',
    define: {
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_APP_ID),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID': JSON.stringify(primaryFirebaseConfig.VITE_FIREBASE_FIRESTORE_DATABASE_ID),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? __dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
