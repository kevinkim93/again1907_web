let adminApp;
let adminDbInstance;

// Dynamic import를 사용하여 빌드 시점 초기화 방지
export async function getAdminDb() {
  if (adminDbInstance) {
    return adminDbInstance;
  }

  // Firebase Admin SDK를 동적으로 import
  const { getApps, initializeApp, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  // 이미 초기화된 앱이 있으면 사용
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    adminDbInstance = getFirestore(adminApp);
    return adminDbInstance;
  }

  try {
    // 환경 변수가 있으면 사용
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
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
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    }
    // Firebase Hosting 환경에서는 Application Default Credentials 사용
    else {
      console.log('Using Application Default Credentials for Firebase Admin');
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'again1907-web',
      });
    }

    adminDbInstance = getFirestore(adminApp);
    return adminDbInstance;
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// 하위 호환성을 위한 export (기존 코드가 adminDb를 직접 사용하는 경우)
export const adminDb = {
  collection: (path) => {
    return {
      get: async () => {
        const db = await getAdminDb();
        return db.collection(path).get();
      },
      doc: (id) => {
        return {
          get: async () => {
            const db = await getAdminDb();
            return db.collection(path).doc(id).get();
          },
          set: async (data, options) => {
            const db = await getAdminDb();
            return db.collection(path).doc(id).set(data, options);
          },
          update: async (data) => {
            const db = await getAdminDb();
            return db.collection(path).doc(id).update(data);
          },
          delete: async () => {
            const db = await getAdminDb();
            return db.collection(path).doc(id).delete();
          },
        };
      },
      where: (...args) => {
        return {
          get: async () => {
            const db = await getAdminDb();
            return db.collection(path).where(...args).get();
          },
          where: (...moreArgs) => {
            return {
              get: async () => {
                const db = await getAdminDb();
                return db.collection(path).where(...args).where(...moreArgs).get();
              },
            };
          },
        };
      },
      orderBy: (...args) => {
        return {
          get: async () => {
            const db = await getAdminDb();
            return db.collection(path).orderBy(...args).get();
          },
          limit: (n) => {
            return {
              get: async () => {
                const db = await getAdminDb();
                return db.collection(path).orderBy(...args).limit(n).get();
              },
            };
          },
        };
      },
      limit: (n) => {
        return {
          get: async () => {
            const db = await getAdminDb();
            return db.collection(path).limit(n).get();
          },
        };
      },
      add: async (data) => {
        const db = await getAdminDb();
        return db.collection(path).add(data);
      },
    };
  },
  batch: async () => {
    const db = await getAdminDb();
    return db.batch();
  },
};
