'use client';

import { useEffect, useState } from 'react';

export default function AttendeesPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  // 폼 목록 가져오기
  const fetchForms = async () => {
    const res = await fetch('/api/admin/forms');
    const data = await res.json();
    setForms(data.forms || []);
    if (data.forms?.length > 0 && !selectedFormId) {
      setSelectedFormId(data.forms[0].id);
    }
  };

  // Settings 가져오기
  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    setSettings(data.settings);
  };

  // 방 목록 가져오기
  const fetchRooms = async () => {
    const res = await fetch('/api/admin/rooms');
    const data = await res.json();
    setRooms(data.rooms || []);
  };

  // 선택된 폼의 참가자 가져오기
  const fetchParticipants = async (formId) => {
    if (!formId) return;

    const collectionName = `participants_${formId}`;
    const res = await fetch(`/api/admin/participants?collectionName=${collectionName}`);
    const data = await res.json();
    setParticipants(data.participants || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchForms();
      await fetchSettings();
      await fetchRooms();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      fetchParticipants(selectedFormId);
    }
  }, [selectedFormId]);

  // 참가자 삭제
  const deleteParticipant = async (participantId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const collectionName = `participants_${selectedFormId}`;
    await fetch('/api/admin/attendees/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId }),
    });

    fetchParticipants(selectedFormId);
  };

  // 결제 상태 토글
  const togglePaymentStatus = async (participantId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    const collectionName = `participants_${selectedFormId}`;

    await fetch('/api/admin/attendees/payment-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionName,
        participantId,
        paymentStatus: newStatus
      }),
    });

    fetchParticipants(selectedFormId);
  };

  // 방 배정
  const assignRoom = async (participantId, roomId) => {
    const collectionName = `participants_${selectedFormId}`;
    const participant = participants.find(p => p.id === participantId);

    // 배정 해제
    if (!roomId || roomId === null) {
      if (!confirm('방 배정을 해제하시겠습니까?')) return;

      await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName,
          participantId,
          roomId: null,
          roomName: null,
        }),
      });

      fetchParticipants(selectedFormId);
      return;
    }

    // 방 배정
    const room = rooms.find(r => r.id === roomId);

    // 숙박 날짜가 있는지 확인
    const accommodationDates = participant?.accommodationDates || [];
    if (accommodationDates.length === 0) {
      if (!confirm(`${participant?.name || '이 참가자'}님은 숙박 신청을 하지 않았습니다. 그래도 배정하시겠습니까?`)) {
        return;
      }
    }

    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionName,
        participantId,
        roomId,
        roomName: room?.name || null,
      }),
    });

    fetchParticipants(selectedFormId);
  };

  // 방 배정 페이지로 이동
  const goToRoomAssignment = () => {
    window.location.href = '/admin/rooms';
  };

  if (loading) {
    return (
      <main className="p-6">
        <p>로딩 중...</p>
      </main>
    );
  }

  if (forms.length === 0) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">인원 관리</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">등록된 폼이 없습니다.</p>
          <a
            href="/admin/forms"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            폼 관리 페이지로 이동
          </a>
        </div>
      </main>
    );
  }

  const currentForm = forms.find(f => f.id === selectedFormId);

  // 현재 폼에 accommodation-calculator가 있는지 확인
  const hasAccommodation = currentForm?.fields?.some(f => f.type === 'accommodation-calculator');

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">인원 관리</h1>

      {/* 폼 선택 */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">등록 폼 선택</label>
        <select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-md p-2"
        >
          {forms.map(form => (
            <option key={form.id} value={form.id}>
              {form.name} ({participants.filter(p => p.formId === form.id).length || 0}명)
            </option>
          ))}
        </select>
      </div>

      {/* 참가자 목록 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {currentForm?.name} 참가자 목록 ({participants.length}명)
          </h2>
          {hasAccommodation && participants.length > 0 && (
            <button
              onClick={goToRoomAssignment}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
            >
              방 배정 관리
            </button>
          )}
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 참가자가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {currentForm?.fields.map(field => (
                    <th key={field.id} className="border p-2">{field.label}</th>
                  ))}
                  <th className="border p-2">등록일</th>
                  <th className="border p-2">결제상태</th>
                  {hasAccommodation && <th className="border p-2">방 배정</th>}
                  <th className="border p-2">액션</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
                  <tr key={participant.id}>
                    {currentForm?.fields.map(field => (
                      <td key={field.id} className="border p-2">
                        {renderFieldValue(field, participant[field.id], participant)}
                      </td>
                    ))}
                    <td className="border p-2">{participant.registeredAt || '-'}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => togglePaymentStatus(participant.id, participant.paymentStatus)}
                        className={`px-3 py-1 rounded text-xs font-medium transition hover:opacity-80 ${
                          participant.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {participant.paymentStatus === 'paid' ? '납부완료' : '미납'}
                      </button>
                    </td>
                    {hasAccommodation && (
                      <td className="border p-2">
                        {participant.roomName ? (
                          <div className="text-xs">
                            <div className="font-semibold text-blue-700">{participant.roomName}</div>
                            <button
                              onClick={() => assignRoom(participant.id, null)}
                              className="text-red-600 hover:text-red-800 text-[10px] underline mt-1"
                            >
                              배정 해제
                            </button>
                          </div>
                        ) : (
                          <select
                            value=""
                            onChange={(e) => assignRoom(participant.id, e.target.value)}
                            className="w-full border border-gray-300 rounded p-1 text-xs"
                          >
                            <option value="">방 선택</option>
                            {rooms
                              .filter(room => {
                                // 참가자의 방 타입과 일치하는 방만 표시
                                const participantRoomType = participant.roomType;
                                if (!participantRoomType) return true; // 방 타입이 없으면 모든 방 표시

                                // roomType 예: "2인실", "30인실"
                                // capacity 예: 2, 30
                                // roomType에서 숫자 추출
                                const typeMatch = participantRoomType.match(/(\d+)인실/);
                                if (!typeMatch) return true; // 패턴이 맞지 않으면 모든 방 표시

                                const requiredCapacity = parseInt(typeMatch[1]);
                                return room.capacity === requiredCapacity;
                              })
                              .sort((a, b) => {
                                // 방 이름에서 숫자 추출하여 정렬
                                const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
                                const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
                                return numA - numB;
                              })
                              .map(room => (
                                <option key={room.id} value={room.id}>
                                  {room.name} ({room.capacity}명)
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                    )}
                    <td className="border p-2">
                      <button
                        onClick={() => deleteParticipant(participant.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

// 필드 값 렌더링 헬퍼
function renderFieldValue(field, value, participant) {
  // payment-calculator와 accommodation-calculator는 value가 없어도 처리
  const skipValueCheck = ['payment-calculator', 'accommodation-calculator'].includes(field.type);

  if (!skipValueCheck && (value === null || value === undefined)) {
    return '-';
  }

  switch (field.type) {
    case 'checkbox':
      return value ? '✓' : '✗';

    case 'checkbox-multiple':
    case 'select-multiple':
      return Array.isArray(value) ? value.join(', ') : value;

    case 'checkbox-dates':
      // payment-calculator에서 선택한 집회 참석 날짜 표시
      const dateFieldId = `${field.id}_dates`;
      const attendanceDates = participant[dateFieldId];
      if (Array.isArray(attendanceDates) && attendanceDates.length > 0) {
        return attendanceDates.join(', ');
      }
      return '-';

    case 'people-count':
      // 추가 인원 + 대표자 포함 총 인원 표시
      const extraAdult = (typeof value === 'object') ? (value.adult || 0) : 0;
      const extraMinor8plus = (typeof value === 'object') ? (value.minor8plus || 0) : 0;
      const extraMinorUnder8 = (typeof value === 'object') ? (value.minorUnder8 || 0) : 0;

      const totalAdult = participant.extraCounts?.adult || 0;
      const totalMinor8plus = participant.extraCounts?.minor8plus || 0;
      const totalMinorUnder8 = participant.extraCounts?.minorUnder8 || 0;
      const totalPeople = participant.totalPeople || 0;

      return (
        <div className="text-sm">
          <div className="text-gray-600 text-xs  pt-1">
            총 {totalPeople}명 (성인 {totalAdult}, 8세↑ {totalMinor8plus}, 8세↓ {totalMinorUnder8})
          </div>
        </div>
      );

    case 'date-of-birth':
      if (!value) return '-';
      const birthYear = new Date(value).getFullYear();
      const thisYear = new Date().getFullYear();
      const age = thisYear - birthYear;
      return `${value} (만 ${age}세)`;

    case 'payment-calculator':
      // 참석 날짜와 참가비 표시
      const paymentDateFieldId = `${field.id}_dates`;
      const paymentDates = participant[paymentDateFieldId];

      if (!Array.isArray(paymentDates) || paymentDates.length === 0) {
        const amountOnly = participant.amount?.total
          ? `${participant.amount.total.toLocaleString()}원`
          : '-';
        return amountOnly;
      }

      const amountDisplay = participant.amount?.total
        ? `${participant.amount.total.toLocaleString()}원`
        : '-';

      return (
        <div className="whitespace-pre-line">
          {paymentDates.map((date, idx) => (
            <div key={idx}>{date}</div>
          ))}
          <div className="font-semibold mt-1 pt-1 border-t">{amountDisplay}</div>
        </div>
      );

    case 'accommodation-calculator':
      // 숙박 날짜, 방 타입, 숙박비 표시
      const accomDates = participant.accommodationDates;
      const roomType = participant.roomType || '-';
      const accomAmount = participant.accommodationAmount?.total
        ? `${participant.accommodationAmount.total.toLocaleString()}원`
        : '-';

      if (!Array.isArray(accomDates) || accomDates.length === 0) {
        return `${roomType} / ${accomAmount}`;
      }

      return (
        <div className="whitespace-pre-line">
          {accomDates.map((date, idx) => (
            <div key={idx}>{date}</div>
          ))}
          <div className="font-semibold mt-1 pt-1 border-t">
            {roomType} / {accomAmount}
          </div>
        </div>
      );

    default:
      return value.toString();
  }
}
