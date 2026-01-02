import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app;
let db;

function getAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  try {
    // 환경 변수가 있으면 사용
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }
    // 개별 환경 변수가 있으면 사용
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }
    // Firebase Hosting 환경에서는 Application Default Credentials 사용
    else {
      console.log('Using Application Default Credentials for Firebase Admin');
      return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'again1907-web',
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

function getAdminDb() {
  if (!app) {
    app = getAdminApp();
  }

  if (!app) {
    throw new Error('Firebase Admin is not initialized. Make sure environment variables are set.');
  }

  if (!db) {
    db = getFirestore(app);
  }

  return db;
}

// Lazy initialization with Proxy
export const adminDb = new Proxy({}, {
  get(target, prop) {
    const dbInstance = getAdminDb();
    return dbInstance[prop];
  }
});
