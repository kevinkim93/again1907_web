'use client';

import { useState } from 'react';

export default function AttendeesTable({ rows, rooms, collectionName }) {
  const [participants, setParticipants] = useState(rows);
  const [editing, setEditing] = useState(null); // 수정 중인 참가자

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
          <th className="border p-2">참가 일정</th>
          <th className="border p-2">액션</th>
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
            
            <td className="border p-2">
              {r.isPartial
                ? (r.partialDates || []).map(d => d.slice(5).replace('-', '/')).join(', ')
                : '전체 참석'}
            </td>
            <td className="border p-2 space-x-2">
              <button
                onClick={() => setEditing(r)}
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
        ))}
      </tbody>
    </table>

  );
}
