'use client';

import { useState } from 'react';

// ✨ 금액 계산 함수
function calcPeriodTotal(period, extraCounts, isPartial, days) {
  if (!period) return 0;
  const price = isPartial ? period.partialPrice : period.fullPrice;
  if (!price) return 0;

  const a = Math.max(0, extraCounts?.adult ?? 0);
  const m8 = Math.max(0, extraCounts?.minor8plus ?? 0);
  const mu8 = Math.max(0, extraCounts?.minorUnder8 ?? 0);

  const multiplier = isPartial ? Math.max(0, days) : 1;
  return (
    price.adult * a +
    price.minor8plus * m8 +
    price.minorUnder8 * mu8
  ) * multiplier;
}

function calcTwoPhaseAmounts(participant, settings) {
  const periods = settings?.registrationPeriods || [];
  const first = periods[0] || null;
  const second = periods[1] || null;

  const isPartial = !!participant.isPartial;
  const days = isPartial ? (participant.partialDates?.length || 0) : 1;

  const extraCounts = {
    adult: participant.extraCounts?.adult ?? 0,
    minor8plus: participant.extraCounts?.minor8plus ?? 0,
    minorUnder8: participant.extraCounts?.minorUnder8 ?? 0,
  };

  const firstTotal = calcPeriodTotal(first, extraCounts, isPartial, days);
  const secondTotal = calcPeriodTotal(second, extraCounts, isPartial, days);

  return { firstTotal, secondTotal };
}

export default function AttendeesTable({ rows, rooms, collectionName, settings }) {
  const [participants, setParticipants] = useState(rows);
  const [editing, setEditing] = useState(null); // 수정 중인 참가자 (state에 복사)

  // 필터 및 검색 상태
  const [filters, setFilters] = useState({
    nameSearch: '',
    phoneSearch: '',
    paymentStatus: '', // 'paid', 'unpaid', ''
    roomStatus: '', // 'assigned', 'unassigned', ''
    attendDate: '', // 특정 날짜
  });

  // 필터링된 참가자 목록
  const filteredParticipants = participants.filter(p => {
    // 이름 검색
    if (filters.nameSearch && !p.name?.includes(filters.nameSearch)) {
      return false;
    }

    // 전화번호 부분 검색
    if (filters.phoneSearch) {
      const phoneDigits = p.phone?.replace(/[^\d]/g, '') || '';
      const searchDigits = filters.phoneSearch.replace(/[^\d]/g, '');
      if (!phoneDigits.includes(searchDigits)) {
        return false;
      }
    }

    // 결제 상태 필터
    if (filters.paymentStatus) {
      if (filters.paymentStatus === 'paid' && p.paymentStatus !== 'paid') return false;
      if (filters.paymentStatus === 'unpaid' && p.paymentStatus === 'paid') return false;
    }

    // 방 배정 상태 필터
    if (filters.roomStatus) {
      if (filters.roomStatus === 'assigned' && !p.roomId) return false;
      if (filters.roomStatus === 'unassigned' && p.roomId) return false;
    }

    // 참가 일정 필터
    if (filters.attendDate) {
      if (p.isPartial) {
        if (!p.partialDates?.includes(filters.attendDate)) return false;
      }
      // 전체 참석인 경우는 모든 날짜 포함으로 간주
    }

    return true;
  });

  // 참가자 삭제
  const deleteParticipant = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch('/api/admin/attendees/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId: id }),
    });
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  // 참가자 업데이트
  const updateParticipant = async (id, updates) => {
    await fetch('/api/admin/attendees/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId: id, updates }),
    });
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    setEditing(null);
  };

  // 방 번호로 그룹화
  const roomNumbersSet = new Set();
  rooms.forEach(room => {
    const roomNum = room.roomNumber || room.name?.replace(/[^\d]/g, '');
    if (roomNum) roomNumbersSet.add(roomNum);
  });
  const uniqueRoomNumbers = Array.from(roomNumbersSet).sort((a, b) => parseInt(a) - parseInt(b));

  // 방 배정 (방 번호 기반)
  const assignRoom = async (participantId, roomNumber) => {
    const participant = participants.find(p => p.id === participantId);

    if (!participant) return;

    // 미배정으로 변경하는 경우
    if (!roomNumber || roomNumber === '') {
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName, participantId, roomNumber: null }),
      });
      const data = await res.json();
      if (data.ok && data.participant) {
        setParticipants(prev =>
          prev.map(p => p.id === participantId ? { ...p, ...data.participant } : p)
        );
      }
      return;
    }

    // 숙박 신청 안 한 경우 경고
    const accommodationDates = participant.accommodationDates || [];
    if (accommodationDates.length === 0) {
      if (!confirm(`${participant.name}님은 숙박 신청을 하지 않았습니다. 그래도 배정하시겠습니까?`)) {
        return;
      }
    }

    // 정원 초과 경고 (각 날짜별로 체크)
    if (accommodationDates.length > 0) {
      for (const date of accommodationDates) {
        // 해당 날짜의 방 문서 찾기
        const roomOnDate = rooms.find(r =>
          (r.roomNumber === roomNumber || r.name?.replace(/[^\d]/g, '') === roomNumber) &&
          r.date === date
        );

        if (roomOnDate) {
          // 해당 날짜에 이미 배정된 참가자 찾기
          const participantsInRoomOnDate = participants.filter(p => {
            if (p.id === participantId) return false;
            return p.roomAssignments?.[date]?.roomId === roomOnDate.id;
          });

          const currentOccupancy = participantsInRoomOnDate.reduce((sum, p) => sum + (p.totalPeople || 0), 0);
          const afterOccupancy = currentOccupancy + (participant.totalPeople || 0);

          if (afterOccupancy > roomOnDate.capacity) {
            if (!confirm(`정원 초과 경고!\n\n방: ${roomNumber}호\n날짜: ${date}\n정원: ${roomOnDate.capacity}명\n현재: ${currentOccupancy}명\n배정 후: ${afterOccupancy}명\n\n그래도 배정하시겠습니까?`)) {
              return;
            }
            break; // 한 번만 경고
          }
        }
      }
    }

    const res = await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId, roomNumber }),
    });

    // 로컬 상태 업데이트 (깜빡거림 방지)
    const data = await res.json();
    if (data.ok && data.participant) {
      setParticipants(prev =>
        prev.map(p => p.id === participantId ? { ...p, ...data.participant } : p)
      );
    }
  };

  // 결제 상태 변경 (+ 입금 날짜 기록)
  const togglePayment = async (participantId, current) => {
    const next = current === 'paid' ? 'unpaid' : 'paid';
    const paidAt = next === 'paid'
      ? new Date().toISOString().split('T')[0]
      : null;
    await fetch('/api/admin/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId, status: next, paidAt }),
    });
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId ? { ...p, paymentStatus: next, paidAt } : p
      )
    );
  };

  return (
    <>
      {/* 검색 및 필터 UI */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">검색 및 필터</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 이름 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 검색</label>
            <input
              type="text"
              placeholder="이름 입력"
              value={filters.nameSearch}
              onChange={(e) => setFilters(f => ({ ...f, nameSearch: e.target.value }))}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>

          {/* 전화번호 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 검색</label>
            <input
              type="text"
              placeholder="전화번호 일부 입력 (예: 7979)"
              value={filters.phoneSearch}
              onChange={(e) => setFilters(f => ({ ...f, phoneSearch: e.target.value }))}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>

          {/* 결제 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">결제 상태</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">전체</option>
              <option value="paid">납부완료</option>
              <option value="unpaid">미납</option>
            </select>
          </div>

          {/* 방 배정 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">방 배정 상태</label>
            <select
              value={filters.roomStatus}
              onChange={(e) => setFilters(f => ({ ...f, roomStatus: e.target.value }))}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">전체</option>
              <option value="assigned">배정됨</option>
              <option value="unassigned">미배정</option>
            </select>
          </div>

          {/* 참가 일정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">참가 일정</label>
            <select
              value={filters.attendDate}
              onChange={(e) => setFilters(f => ({ ...f, attendDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">전체</option>
              {settings?.dates?.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>

          {/* 초기화 버튼 */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                nameSearch: '',
                phoneSearch: '',
                paymentStatus: '',
                roomStatus: '',
                attendDate: '',
              })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md text-sm"
            >
              필터 초기화
            </button>
          </div>
        </div>

        {/* 검색 결과 수 */}
        <div className="mt-3 text-sm text-gray-600">
          총 {filteredParticipants.length}명 / {participants.length}명
        </div>
      </div>

      <table className="mt-6 w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">이름</th>
            <th className="border p-2">성별</th>
            <th className="border p-2">연락처</th>
            <th className="border p-2">총 인원</th>
            <th className="border p-2">1차 금액</th>
            <th className="border p-2">2차 금액</th>
            <th className="border p-2">등록 날짜</th>
            <th className="border p-2">결제 상태</th>
            <th className="border p-2">입금 날짜</th>
            <th className="border p-2">방</th>
            <th className="border p-2">참가 일정</th>
            <th className="border p-2">비고</th>
            <th className="border p-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {filteredParticipants.map(r => {
            const { firstTotal, secondTotal } = calcTwoPhaseAmounts(r, settings);
            const a = r.extraCounts?.adult ?? 0;
            const m8 = r.extraCounts?.minor8plus ?? 0;
            const mu8 = r.extraCounts?.minorUnder8 ?? 0;
            const tp = a + m8 + mu8 || r.totalPeople || 1;
            return (
              <tr key={r.id}>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.gender}</td>
                <td className="border p-2">{r.phone}</td>
                <td className="border p-2">
                  {tp} (성인 {a} / 8세 이상 {m8} / 8세 미만 {mu8})
                </td>
                <td className="border p-2 text-right">{firstTotal.toLocaleString()}원</td>
                <td className="border p-2 text-right">{secondTotal.toLocaleString()}원</td>
                <td className="border p-2">{r.registeredAt || '-'}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => togglePayment(r.id, r.paymentStatus || 'unpaid')}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      r.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {r.paymentStatus === 'paid' ? '납부완료' : '미납'}
                  </button>
                </td>
                <td className="border p-2">
                  <input
                    type="date"
                    value={r.paidAt || ''}
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      await fetch('/api/admin/payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          collectionName,
                          participantId: r.id,
                          status: r.paymentStatus || 'unpaid',
                          paidAt: newDate || null,
                        }),
                      });
                      setParticipants(prev =>
                        prev.map(p =>
                          p.id === r.id ? { ...p, paidAt: newDate || null } : p
                        )
                      );
                    }}
                    className="border rounded p-1 text-sm"
                  />
                </td>

                <td className="border p-2">
                  <select
                    value={r.roomNumber || ''}
                    onChange={(e) => assignRoom(r.id, e.target.value)}
                    className="border rounded p-1 text-sm w-full"
                  >
                    <option value="">미배정</option>
                    {uniqueRoomNumbers.map(roomNum => {
                      const sampleRoom = rooms.find(rm =>
                        rm.roomNumber === roomNum || rm.name?.replace(/[^\d]/g, '') === roomNum
                      );
                      return (
                        <option key={roomNum} value={roomNum}>
                          {roomNum}호 ({sampleRoom?.group || '전부'})
                        </option>
                      );
                    })}
                  </select>
                </td>
                <td className="border p-2">
                  {r.isPartial
                    ? (r.partialDates || []).map(d => d.slice(5).replace('-', '/')).join(', ')
                    : (settings?.dates || []).map(d => d.slice(5).replace('-', '/')).join(', ')}
                </td>
                <td className="border p-2">{r.remark || ''}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => setEditing({ ...r })} // state 복사
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteParticipant(r.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 수정 모달 */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">참가자 수정</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updates = { ...editing };
                // 금액 및 총인원 다시 계산
                const { firstTotal, secondTotal } = calcTwoPhaseAmounts(editing, settings);
                updates.amount = { first: firstTotal, second: secondTotal };
                updates.totalPeople =
                  (editing.extraCounts?.adult ?? 0) +
                  (editing.extraCounts?.minor8plus ?? 0) +
                  (editing.extraCounts?.minorUnder8 ?? 0);
                updateParticipant(editing.id, updates);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1">이름</label>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">성별</label>
                <select
                  value={editing.gender}
                  onChange={(e) => setEditing({ ...editing, gender: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">연락처</label>
                <input
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm">성인</label>
                  <input
                    type="number"
                    value={editing.extraCounts?.adult ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        extraCounts: {
                          ...editing.extraCounts,
                          adult: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">8세 이상</label>
                  <input
                    type="number"
                    value={editing.extraCounts?.minor8plus ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        extraCounts: {
                          ...editing.extraCounts,
                          minor8plus: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">8세 미만</label>
                  <input
                    type="number"
                    value={editing.extraCounts?.minorUnder8 ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        extraCounts: {
                          ...editing.extraCounts,
                          minorUnder8: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">등록 날짜</label>
                <input
                  type="date"
                  value={editing.registeredAt || ''}
                  onChange={(e) => setEditing({ ...editing, registeredAt: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">입금 날짜</label>
                <input
                  type="date"
                  value={editing.paidAt || ''}
                  onChange={(e) => setEditing({ ...editing, paidAt: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm mb-1">
                  <input
                    type="checkbox"
                    checked={editing.isPartial}
                    onChange={(e) =>
                      setEditing({ ...editing, isPartial: e.target.checked, partialDates: e.target.checked ? editing.partialDates : [] })
                    }
                  />
                  부분참석 여부
                </label>

                {editing.isPartial && (
                  <div className="space-y-1">
                    {settings.dates?.map(d => (
                      <label key={d} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editing.partialDates?.includes(d)}
                          onChange={(e) => {
                            let arr = editing.partialDates || [];
                            if (e.target.checked) arr = [...arr, d];
                            else arr = arr.filter(x => x !== d);
                            setEditing({ ...editing, partialDates: arr });
                          }}
                        />
                        {d}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">비고</label>
                <input
                  value={editing.remark || ''}
                  onChange={(e) => setEditing({ ...editing, remark: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              {/* 실시간 금액 미리보기 */}
              <div className="bg-gray-50 p-2 rounded text-sm">
                {(() => {
                  const { firstTotal, secondTotal } = calcTwoPhaseAmounts(editing, settings);
                  return (
                    <p>
                      1차 금액: {firstTotal.toLocaleString()}원 / 2차 금액: {secondTotal.toLocaleString()}원
                    </p>
                  );
                })()}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
