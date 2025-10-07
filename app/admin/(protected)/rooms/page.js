'use client';

import { useEffect, useState } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]); // 전체 참가자 목록
  const [form, setForm] = useState({ start: '', end: '', group: '전부', capacity: 4 });
  const [selectedRooms, setSelectedRooms] = useState([]);

  const fetchRooms = async () => {
    const res = await fetch('/api/admin/rooms');
    const data = await res.json();
    setRooms(data.rooms || []);
    setSelectedRooms([]);
  };

  const fetchAllParticipants = async () => {
    const res = await fetch('/api/admin/unassigned');
    const data = await res.json();
    setAllParticipants(data.participants || []);
  };

  useEffect(() => {
    fetchRooms();
    fetchAllParticipants();
  }, []);

  const createRooms = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ start: '', end: '', group: '전부', capacity: 4 });
    fetchRooms();
  };

  const deleteSelected = async () => {
    if (selectedRooms.length === 0) return;
    if (!confirm(`선택한 ${selectedRooms.length}개 방을 삭제하시겠습니까?`)) return;

    await fetch('/api/admin/rooms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomIds: selectedRooms }),
    });
    fetchRooms();
  };

  const toggleSelect = (id) => {
    setSelectedRooms(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([]); // 전체 해제
    } else {
      setSelectedRooms(rooms.map(r => r.id)); // 전체 선택
    }
  };

  // 참가자 방 배정 (방 관리 페이지에서)
  const assignParticipantToRoom = async (roomId, participantId) => {
    const room = rooms.find(r => r.id === roomId);
    const roomName = room?.name || null;

    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionName: 'participants_default', // 또는 settings에서 가져오기
        participantId,
        roomId,
        roomName,
      }),
    });

    // 양쪽 목록 모두 새로고침
    fetchRooms();
    fetchAllParticipants();
  };

  // 참가자 방 해제
  const removeParticipantFromRoom = async (participantId) => {
    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionName: 'participants_default',
        participantId,
        roomId: '',
        roomName: null,
      }),
    });

    fetchRooms();
    fetchAllParticipants();
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">방 관리</h1>

      {/* 방 생성 */}
      <form onSubmit={createRooms} className="bg-white shadow p-4 rounded mb-6 space-y-3 max-w-xl">
        <div className="flex gap-4">
          <label className="flex flex-col">
            시작 방번호
            <input
              type="number"
              value={form.start}
              onChange={(e) => setForm(f => ({ ...f, start: e.target.value }))}
              required
              className="border rounded p-1"
            />
          </label>
          <label className="flex flex-col">
            끝 방번호
            <input
              type="number"
              value={form.end}
              onChange={(e) => setForm(f => ({ ...f, end: e.target.value }))}
              required
              className="border rounded p-1"
            />
          </label>
        </div>

        <label className="flex flex-col">
          배정 그룹
          <select
            value={form.group}
            onChange={(e) => setForm(f => ({ ...f, group: e.target.value }))}
            className="border rounded p-1"
          >
            <option>탈북민</option>
            <option>목회자</option>
            <option>평신도</option>
            <option>전부</option>
          </select>
        </label>

        <label className="flex flex-col">
          가용 인원
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
            required
            className="border rounded p-1"
          />
        </label>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          방 생성
        </button>
      </form>

      {/* 전체 선택 + 삭제 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selectedRooms.length === rooms.length && rooms.length > 0}
            onChange={toggleSelectAll}
            className="hidden peer"
          />
          <span className="w-5 h-5 flex items-center justify-center border rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600">
            <svg
              className="w-3 h-3 text-white hidden peer-checked:block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5.293 11.879a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="ml-2 text-sm text-gray-700">전체 선택</span>
        </label>

        {selectedRooms.length > 0 && (
          <button
            onClick={deleteSelected}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            선택한 {selectedRooms.length}개 방 삭제
          </button>
        )}
      </div>

      {/* 방 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map(r => (
          <div
            key={r.id}
            className={`bg-white shadow rounded p-4 border ${
              selectedRooms.includes(r.id) ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">{r.name} ({r.group})</h2>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  className="hidden peer"
                />
                <span className="w-5 h-5 flex items-center justify-center border rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600">
                  <svg
                    className="w-3 h-3 text-white hidden peer-checked:block"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5.293 11.879a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              정원 {r.capacity}명 / 현재 {r.currentPeople || 0}명
            </p>

            {/* 배정된 참가자 목록 */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">배정된 참가자:</p>
              {(r.participants || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">없음</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {(r.participants || []).map(p => (
                    <li key={p.id} className="flex justify-between items-center">
                      <span>
                        {p.name} ({p.totalPeople}명) — {p.extraAnswers?.identity?.join(', ')}
                      </span>
                      <button
                        onClick={() => removeParticipantFromRoom(p.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        해제
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 참가자 추가 드롭다운 */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">참가자 추가:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    assignParticipantToRoom(r.id, e.target.value);
                    e.target.value = ''; // 리셋
                  }
                }}
                className="w-full border rounded p-1 text-xs"
              >
                <option value="">선택하세요</option>
                {allParticipants
                  .filter(p => !p.roomId) // 미배정 참가자만
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.totalPeople}명) - {p.phone}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
