'use client';

import { useEffect, useState } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ start: '', end: '', group: '전부', capacity: 4 });
  const [selectedRooms, setSelectedRooms] = useState([]);

  const fetchRooms = async () => {
    const res = await fetch('/api/admin/rooms');
    const data = await res.json();
    setRooms(data.rooms || []);
    setSelectedRooms([]);
  };

  useEffect(() => {
    fetchRooms();
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
            <ul className="text-sm list-disc pl-4">
              {(r.participants || []).map(p => (
                <li key={p.id}>
                  {p.name} ({p.totalPeople}명) — {p.extraAnswers?.identity?.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
