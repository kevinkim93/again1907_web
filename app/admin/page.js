import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export default async function AdminDashboard() {
  // 인증 체크
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (token !== expectedToken()) {
    redirect('/admin/login');
  }

  // settings에서 폼 목록 가져오기
  const settingsSnap = await adminDb.collection('settings').doc('current').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : { eventName: '집회', forms: [] };
  const forms = settings.forms || [];

  // 각 폼별 참가자 데이터 불러오기
  const formsWithParticipants = await Promise.all(
    forms.map(async (form) => {
      const collectionName = `participants_${form.id}`;
      const pSnap = await adminDb.collection(collectionName).get();
      const participants = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { ...form, participants };
    })
  );

  // 방 데이터 불러오기
  const rSnap = await adminDb.collection('rooms').get();
  const rooms = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 전체 통계 계산
  const totalParticipants = formsWithParticipants.reduce((sum, form) => sum + form.participants.length, 0);
  const totalPeople = formsWithParticipants.reduce((sum, form) => {
    return sum + form.participants.reduce((s, p) => s + (p.totalPeople || 1), 0);
  }, 0);

  // 날짜별 폼별 등록 인원 집계
  const dateFormStats = {};
  formsWithParticipants.forEach(form => {
    form.participants.forEach(participant => {
      // accommodationDates 또는 partialDates 사용
      const dates = participant.accommodationDates || participant.partialDates || [];
      dates.forEach(date => {
        if (!dateFormStats[date]) {
          dateFormStats[date] = {};
        }
        if (!dateFormStats[date][form.name]) {
          dateFormStats[date][form.name] = 0;
        }
        dateFormStats[date][form.name] += 1;
      });
    });
  });

  // 방 배정 현황
  const roomStats = {
    totalRooms: rooms.length,
    assignedRooms: 0,
    emptyRooms: 0,
    totalCapacity: 0,
    occupiedCapacity: 0,
  };

  rooms.forEach(room => {
    roomStats.totalCapacity += room.capacity || 0;
    const assigned = room.assignedParticipants?.length || 0;
    if (assigned > 0) {
      roomStats.assignedRooms += 1;
      roomStats.occupiedCapacity += assigned;
    } else {
      roomStats.emptyRooms += 1;
    }
  });

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 사이드바 */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">관리자</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="/admin" className="block rounded-md px-3 py-2 bg-blue-100 text-blue-700 font-medium">
            대시보드
          </a>
          <a href="/admin/forms" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            폼 관리
          </a>
          <a href="/admin/attendees" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            인원 관리
          </a>
          <a href="/admin/rooms" className="block rounded-md px-3 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700">
            방 관리
          </a>
        </nav>
        <div className="px-4 py-4 border-t">
          <a href="/admin/login?logout=1" className="block w-full text-left rounded-md px-3 py-2 text-red-600 hover:bg-red-100">
            로그아웃
          </a>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">
        <div className="space-y-8">
          {/* 헤더 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              대시보드 — {settings.eventName}
            </h1>
            <p className="mt-2 text-gray-600">참가자 및 집회 현황 요약</p>
          </div>

          {/* 주요 카드 요약 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">총 신청서 수</p>
              <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">총 인원</p>
              <p className="text-2xl font-bold text-gray-900">{totalPeople}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-500">등록 폼 수</p>
              <p className="text-2xl font-bold text-blue-600">{forms.length}</p>
            </div>
          </div>

          {/* 등록 폼별 등록 인원 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">등록 폼별 등록 인원</h2>
            {formsWithParticipants.length === 0 ? (
              <p className="text-gray-500">등록된 폼이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {formsWithParticipants.map(form => {
                  const totalPeopleInForm = form.participants.reduce((sum, p) => sum + (p.totalPeople || 1), 0);
                  return (
                    <div key={form.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <span className="text-gray-700 font-medium">{form.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({form.participants.length}건)
                        </span>
                      </div>
                      <span className="font-bold text-lg text-blue-600">{totalPeopleInForm}명</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 방 배정 현황 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">방 배정 현황</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">총 방 개수</p>
                <p className="text-xl font-bold text-gray-900">{roomStats.totalRooms}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">배정된 방</p>
                <p className="text-xl font-bold text-green-600">{roomStats.assignedRooms}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-500">빈 방</p>
                <p className="text-xl font-bold text-yellow-600">{roomStats.emptyRooms}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">배정률</p>
                <p className="text-xl font-bold text-blue-600">
                  {roomStats.totalCapacity > 0
                    ? Math.round((roomStats.occupiedCapacity / roomStats.totalCapacity) * 100)
                    : 0}%
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>총 수용 인원: {roomStats.totalCapacity}명</p>
              <p>배정된 인원: {roomStats.occupiedCapacity}명</p>
            </div>
          </div>

          {/* 날짜별 폼별 등록 인원 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">날짜별 폼별 등록 인원</h2>
            {Object.keys(dateFormStats).length === 0 ? (
              <p className="text-gray-500">날짜별 데이터가 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left font-medium text-gray-700">날짜</th>
                      {forms.map(form => (
                        <th key={form.id} className="border p-3 text-center font-medium text-gray-700">
                          {form.name}
                        </th>
                      ))}
                      <th className="border p-3 text-center font-medium text-gray-700 bg-blue-50">합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(dateFormStats).sort().map(date => {
                      const dateData = dateFormStats[date];
                      const totalForDate = Object.values(dateData).reduce((sum, count) => sum + count, 0);
                      return (
                        <tr key={date} className="hover:bg-gray-50">
                          <td className="border p-3 font-medium text-gray-700">{date}</td>
                          {forms.map(form => (
                            <td key={form.id} className="border p-3 text-center">
                              {dateData[form.name] || 0}
                            </td>
                          ))}
                          <td className="border p-3 text-center font-bold text-blue-600 bg-blue-50">
                            {totalForDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
