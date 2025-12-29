import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app;

if (getApps().length) {
  app = getApps()[0];
} else {
  // 환경 변수에서 Service Account 정보 읽기
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID,
  });
}

export const adminDb = getFirestore(app);
