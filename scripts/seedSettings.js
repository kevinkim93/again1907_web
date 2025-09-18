import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function main() {
  const settings = {
    eventName: '어게인1907',
    dbName: 'participants_again1907',
    dates: ['2025-10-03','2025-10-04','2025-10-05'],
    openRegistration: true,

    // 🔹 등록 기간 + 요금 정책 (fullPrice, partialPrice 포함)
    registrationPeriods: [
      {
        label: '1차',
        startDate: '2025-09-01',
        endDate: '2025-09-15',
        fullPrice: { adult: 100000, minor8plus: 50000, minorUnder8: 0 },
        partialPrice: { adult: 40000, minor8plus: 20000, minorUnder8: 0 }
      },
      {
        label: '2차',
        startDate: '2025-09-16',
        endDate: '2025-09-30',
        fullPrice: { adult: 120000, minor8plus: 60000, minorUnder8: 10000 },
        partialPrice: { adult: 50000, minor8plus: 30000, minorUnder8: 5000 }
      }
    ],

    transportOptions: ['자차','대중교통','도보'],
    howDidYouHearOptions: ['교회 공지','지인','SNS','기타'],

    extraQuestions: [
      { id: 'allergy', label: '알레르기 여부', type: 'text', required: false },
      { id: 'note', label: '추가 메모', type: 'textarea', required: false }
    ]
  };

  await db.collection('settings').doc('current').set(settings);
  console.log('✅ Firestore settings/current 문서가 성공적으로 저장되었습니다.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
