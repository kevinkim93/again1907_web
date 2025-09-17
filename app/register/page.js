// app/register/page.js
import { adminDb } from '@/lib/firebaseAdmin';
import RegistrationForm from '@/components/RegistrationForm';

export default async function RegisterPage() {
  let settings;
  try {
    const snap = await adminDb.collection('settings').doc('current').get();
    settings = snap.exists ? snap.data() : { eventName: '어게인1907', dbName: 'participants_default' };
  } catch (err) {
    console.error('Firestore error:', err);
    settings = { eventName: '어게인1907', dbName: 'participants_default', openRegistration: false };
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {settings.eventName} 참가 신청
          </h1>
        </div>
        <div className="bg-white shadow-md rounded-xl p-8">
          <RegistrationForm settings={settings} disabled={!settings.openRegistration}/>
        </div>
      </div>
    </main>
  );
}
