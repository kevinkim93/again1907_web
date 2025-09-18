import { adminDb } from '@/lib/firebaseAdmin';

export default async function AdminDashboard() {
  // settings에서 이벤트 이름과 dbName 가져오기
  const settingsSnap = await adminDb.collection('settings').doc('current').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : { eventName: '집회', dbName: 'participants_default' };
  const collectionName = settings.dbName || 'participants_default';

  // 참가자 데이터 불러오기
  const [pSnap, rSnap] = await Promise.all([
    adminDb.collection(collectionName).get(),
    adminDb.collection('rooms').get(),
  ]);
  const participants = pSnap.docs.map(d => d.data());
  const totalPeople = participants.reduce((s, p) => s + (p.totalPeople || 1), 0);
  const male = participants.filter(p => p.gender === '남').length;
  const female = participants.filter(p => p.gender === '여').length;

  // 날짜별 부분참석 집계
  const byDate = {};
  for (const p of participants) {
    (p.partialDates || []).forEach(d => {
      byDate[d] = (byDate[d] || 0) + 1;
    });
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          대시보드 — {settings.eventName}
        </h1>
        <p className="mt-2 text-gray-600">참가자 및 집회 현황 요약</p>
      </div>

      {/* 주요 카드 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">신청서 수</p>
          <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">총 인원</p>
          <p className="text-2xl font-bold text-gray-900">{totalPeople}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">남자</p>
          <p className="text-2xl font-bold text-blue-600">{male}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">여자</p>
          <p className="text-2xl font-bold text-pink-600">{female}</p>
        </div>
      </div>

      {/* 부분참석 현황 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">부분참석 현황</h2>
        {Object.keys(byDate).length === 0 ? (
          <p className="text-gray-500">부분참석 데이터가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(byDate).map(([d, c]) => (
              <li key={d} className="flex justify-between border-b pb-1">
                <span className="text-gray-700">{d}</span>
                <span className="font-medium">{c}명</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 방 현황 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">방 현황</h2>
        <p className="text-gray-700">총 방 개수: {rSnap.size}</p>
      </div>
    </div>
  );
}
