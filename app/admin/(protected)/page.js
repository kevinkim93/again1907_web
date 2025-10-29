import { adminDb } from '@/lib/firebaseAdmin';

export default async function AdminDashboard() {
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

  // 1. 등록 폼별 등록 인원 통계
  const formStats = formsWithParticipants.map(form => ({
    name: form.name,
    id: form.id,
    totalRegistrations: form.participants.length,
    totalPeople: form.participants.reduce((sum, p) => sum + (p.totalPeople || 1), 0),
  }));

  // 2. 방 배정 현황 통계
  // 숙박 등록 폼 찾기
  const accommodationForm = formsWithParticipants.find(f =>
    f.fields?.some(field => field.type === 'accommodation-calculator')
  );

  // 숙박 등록한 총 인원 (그룹 포함)
  const totalAccommodationParticipants = accommodationForm?.participants.length || 0;

  // 방 배정 완료된 인원 (roomNumber가 있는 참가자)
  const assignedParticipants = accommodationForm?.participants.filter(p => p.roomNumber) || [];
  const totalAssignedParticipants = assignedParticipants.length;

  // 날짜별 방 통계
  const dateRoomStats = {};

  // 먼저 모든 날짜의 방 개수 세기
  rooms.forEach(room => {
    const date = room.date;
    if (!date) return;

    if (!dateRoomStats[date]) {
      dateRoomStats[date] = {
        totalRooms: 0,
        assignedRooms: 0,
        assignedRoomIds: new Set(), // 중복 방지를 위한 Set
      };
    }

    dateRoomStats[date].totalRooms += 1;
  });

  // 참가자의 roomAssignments를 확인하여 배정된 방 세기
  accommodationForm?.participants.forEach(participant => {
    const roomAssignments = participant.roomAssignments || {};

    Object.keys(roomAssignments).forEach(dateKey => {
      const assignment = roomAssignments[dateKey];
      const roomId = assignment.roomId;
      const standardDate = assignment.standardDate; // 표준 날짜 형식

      if (roomId && standardDate && dateRoomStats[standardDate]) {
        dateRoomStats[standardDate].assignedRoomIds.add(roomId);
      }
    });
  });

  // Set을 배열 길이로 변환
  Object.keys(dateRoomStats).forEach(date => {
    dateRoomStats[date].assignedRooms = dateRoomStats[date].assignedRoomIds.size;
    delete dateRoomStats[date].assignedRoomIds; // 불필요한 Set 제거
  });

  // 3. 날짜별 폼별 등록 인원 집계
  const dateFormStats = {};
  formsWithParticipants.forEach(form => {
    form.participants.forEach(participant => {
      // payment-calculator의 날짜 필드 찾기
      const paymentField = form.fields?.find(f => f.type === 'payment-calculator');
      const paymentDateFieldId = paymentField ? `${paymentField.id}_dates` : null;

      // accommodation-calculator의 날짜 필드 찾기
      const accomField = form.fields?.find(f => f.type === 'accommodation-calculator');
      const accomDateFieldId = accomField ? `${accomField.id}_dates` : null;

      // 날짜 배열 가져오기 (우선순위: payment dates > accommodation dates > partialDates)
      const dates = (paymentDateFieldId && participant[paymentDateFieldId]) ||
                    (accomDateFieldId && participant[accomDateFieldId]) ||
                    participant.partialDates ||
                    [];

      if (Array.isArray(dates) && dates.length > 0) {
        dates.forEach(date => {
          if (!dateFormStats[date]) {
            dateFormStats[date] = {};
          }
          if (!dateFormStats[date][form.name]) {
            dateFormStats[date][form.name] = 0;
          }
          dateFormStats[date][form.name] += 1;
        });
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          대시보드 — {settings.eventName}
        </h1>
        <p className="mt-2 text-gray-600">참가자 및 집회 현황 요약</p>
      </div>

      {/* 1. 등록 폼별 등록 인원 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 등록 폼별 등록 인원</h2>
        {formStats.length === 0 ? (
          <p className="text-gray-500">등록된 폼이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {formStats.map(stat => (
              <div key={stat.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <span className="text-gray-700 font-medium">{stat.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({stat.totalRegistrations}건)
                  </span>
                </div>
                <span className="font-bold text-lg text-blue-600">{stat.totalPeople}명</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. 방 배정 현황 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🏠 방 배정 현황</h2>

        {/* 인원 배정 현황 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">인원 배정 현황</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">숙박 등록 인원</span>
            <span className="font-bold text-2xl text-gray-900">{totalAccommodationParticipants}명</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">방 배정 완료</span>
            <span className="font-bold text-2xl text-green-600">{totalAssignedParticipants}명</span>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">배정률</span>
              <span className="font-bold text-xl text-blue-600">
                {totalAccommodationParticipants > 0
                  ? Math.round((totalAssignedParticipants / totalAccommodationParticipants) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* 날짜별 방 배정 현황 */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">날짜별 방 배정 현황</h3>
          {Object.keys(dateRoomStats).length === 0 ? (
            <p className="text-gray-500 text-sm">방 데이터가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {Object.keys(dateRoomStats).sort().map(date => {
                const stats = dateRoomStats[date];
                const percentage = stats.totalRooms > 0
                  ? Math.round((stats.assignedRooms / stats.totalRooms) * 100)
                  : 0;
                return (
                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{date}</span>
                      <div className="text-sm text-gray-600 mt-1">
                        생성: {stats.totalRooms}개 / 배정: {stats.assignedRooms}개
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-lg ${percentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. 날짜별 폼별 등록 인원 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📅 날짜별 폼별 등록 인원</h2>
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
  );
}
