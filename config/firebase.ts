import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import Constants from 'expo-constants';

console.log('[Firebase] Environment variables check:');
console.log('  API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✓ loaded' : '✗ missing');
console.log('  AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ loaded' : '✗ missing');
console.log('  PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✓ loaded' : '✗ missing');
console.log('  STORAGE_BUCKET:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ loaded' : '✗ missing');
console.log('  MESSAGING_SENDER_ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ loaded' : '✗ missing');
console.log('  APP_ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? '✓ loaded' : '✗ missing');

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const validateFirebaseConfig = () => {
  const requiredFields = [
    { key: 'apiKey', value: firebaseConfig.apiKey },
    { key: 'projectId', value: firebaseConfig.projectId },
    { key: 'appId', value: firebaseConfig.appId },
  ];

  const missingFields = requiredFields.filter(field => !field.value);

  if (missingFields.length > 0) {
    const missing = missingFields.map(f => f.key).join(', ');
    console.error('[Firebase] ❌ Critical configuration missing:', missing);
    console.error('[Firebase] 💡 Solution:');
    console.error('  1. Create .env file in project root');
    console.error('  2. Add: EXPO_PUBLIC_FIREBASE_API_KEY=your_key');
    console.error('  3. Restart Metro bundler (npx expo start --clear)');
    console.error('  4. Or add to app.json under "extra" field');
    
    return false;
  }

  console.log('[Firebase] ✓ Configuration validated');
  return true;
};

let app: ReturnType<typeof initializeApp> | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (validateFirebaseConfig()) {
  try {
    console.log('[Firebase] Initializing Firebase app...');
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('[Firebase] ✓ Firebase initialized successfully');
  } catch (error) {
    console.error('[Firebase] ❌ Initialization failed:', error);
    console.error('[Firebase] App will continue with limited functionality');
  }
} else {
  console.warn('[Firebase] ⚠️ Firebase not initialized - using fallback mode');
}

export { app, db, auth };
