import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForBuildEnv1234567890',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0322601470.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0322601470',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0322601470.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '54288665517',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:54288665517:web:9b4c93c849f449019ba9d7',
};

const databaseId = import.meta.env.VITE_FIREBASE_DB_ID || 'ai-studio-9b4c93c8-49f4-4901-9ba9-d7014844a3c9';

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);
