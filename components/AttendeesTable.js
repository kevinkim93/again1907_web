'use client';

import { useState } from 'react';

export default function AttendeesTable({ rows, rooms, collectionName }) {
  const [participants, setParticipants] = useState(rows);

  // 방 배정
  const assignRoom = async (participantId, roomId) => {
    const roomName = rooms.find(r => r.id === roomId)?.name || null;
    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId, roomId, roomName }),
    });
    setParticipants(prev =>
      prev.map(p => p.id === participantId ? { ...p, roomId, roomName } : p)
    );
  };

  // 결제 상태 변경
  const togglePayment = async (participantId, current) => {
    const next = current === 'paid' ? 'unpaid' : 'paid';
    await fetch('/api/admin/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionName, participantId, status: next }),
    });
    setParticipants(prev =>
      prev.map(p => p.id === participantId ? { ...p, paymentStatus: next } : p)
    );
  };

  return (
    <table className="mt-6 w-full border-collapse border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">이름</th>
          <th className="border p-2">성별</th>
          <th className="border p-2">연락처</th>
          <th className="border p-2">총 인원</th>
          <th className="border p-2">등록기간</th>
          <th className="border p-2">금액 합계</th>
          <th className="border p-2">결제 상태</th>
          <th className="border p-2">방</th>
        </tr>
      </thead>
      <tbody>
        {participants.map(r => (
          <tr key={r.id}>
            <td className="border p-2">{r.name}</td>
            <td className="border p-2">{r.gender}</td>
            <td className="border p-2">{r.phone}</td>
            <td className="border p-2">{r.totalPeople || 1}</td>
            <td className="border p-2">{r.registrationPeriod}</td>
            <td className="border p-2 text-right">{r.amount?.total?.toLocaleString() || 0}원</td>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
