import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app;
let db;

// 빌드 시점인지 확인
const isBuildTime = typeof window === 'undefined' && !process.env.FIREBASE_PROJECT_ID && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

function getAdminApp() {
  // 빌드 시점에는 초기화하지 않음
  if (isBuildTime) {
    return null;
  }

  if (getApps().length) {
    return getApps()[0];
  }

  // 환경 변수에서 Service Account 정보 읽기
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  // project_id가 없으면 초기화하지 않음
  if (!serviceAccount.project_id) {
    console.warn('Firebase Admin not initialized: missing project_id');
    return null;
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

function getAdminDb() {
  // 빌드 시점에는 null 반환
  if (isBuildTime) {
    return null;
  }

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

    // 빌드 시점에는 빈 객체 반환 (에러 방지)
    if (!dbInstance) {
      return () => ({
        get: () => Promise.resolve({ exists: false }),
        where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
        limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
        orderBy: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
      });
    }

    return dbInstance[prop];
  }
});
