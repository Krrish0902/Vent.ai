import { initializeApp } from 'firebase/app';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Read env vars (supports both Vite and process.env)
const getEnv = (key: string): string | undefined => {
  const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const fromVite = viteEnv[key] || viteEnv[`VITE_${key}`];
  const fromNode = (typeof process !== 'undefined' && (process as any).env)
    ? ((process as any).env[key] || (process as any).env[`VITE_${key}`])
    : undefined;
  return (fromVite as string | undefined) ?? (fromNode as string | undefined);
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY') as string,
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN') as string,
  databaseURL: getEnv('FIREBASE_DATABASE_URL') as string,
  projectId: getEnv('FIREBASE_PROJECT_ID') as string,
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET') as string,
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID') as string,
  appId: getEnv('FIREBASE_APP_ID') as string,
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID') as string
};

// Basic validation to help during setup
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
  // eslint-disable-next-line no-console
  console.warn('[firebase] Missing Firebase env configuration. Please set your .env values.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Auth (optional, for future user management)
export const auth = getAuth(app);

// Connect to emulators in development
const isDev = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'development') ||
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')
);

if (isDev) {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectDatabaseEmulator(db, 'localhost', 9000);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export default app;
