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

  // 방 배정
  const assignRoom = async (participantId, roomId) => {
    const roomName = rooms.find(r => r.id === roomId)?.name || null;
    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId, roomId, roomName }),
    });
    setParticipants(prev =>
      prev.map(p => (p.id === participantId ? { ...p, roomId, roomName } : p))
    );
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
          {participants.map(r => {
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
                    value={r.roomId || ''}
                    onChange={(e) => assignRoom(r.id, e.target.value)}
                    className="border rounded p-1 text-sm"
                  >
                    <option value="">미배정</option>
                    {rooms.map(rm => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name} ({rm.group})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  {r.isPartial
                    ? (r.partialDates || []).map(d => d.slice(5).replace('-', '/')).join(', ')
                    : '전체 참석'}
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
