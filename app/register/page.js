import { adminDb } from '@/lib/firebaseAdmin';
import RegistrationForm from '@/components/RegistrationForm';

export default async function RegisterPage() {
  let settings;
  try {
    const snap = await adminDb.collection('settings').doc('current').get();
    settings = snap.exists ? snap.data() : {
      eventName: '어게인1907',
      dates: [],
      openRegistration: false,
      transportOptions: ['자차','대중교통','도보'],
      howDidYouHearOptions: ['교회 공지','지인','SNS','기타'],
      extraQuestions: [],
    };
  } catch (err) {
    console.error('Firestore error:', err);
    settings = { eventName: '어게인1907', openRegistration: false };
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* 상단 안내 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {settings.eventName} 참가 신청
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            아래 신청서를 작성해주세요.
          </p>
        </div>

        {/* 신청 마감 안내 */}
        {!settings.openRegistration && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700 border border-red-200 text-center">
            현재 신청이 마감되었습니다.
          </div>
        )}

        {/* 신청 폼 */}
        <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
          <RegistrationForm
            settings={settings}
            disabled={!settings.openRegistration}
          />
        </div>
      </div>
    </main>
  );
}
