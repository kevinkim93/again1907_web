'use client';

import { useEffect, useState } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ start: '', end: '', group: '전부', capacity: 4 });
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(''); // 선택된 날짜

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    setSettings(data.settings);
    // 첫 번째 숙박 가능 날짜를 기본 선택
    if (data.settings?.dates?.length > 1 && !selectedDate) {
      setSelectedDate(data.settings.dates[0]);
    }
  };

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
    fetchSettings();
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
      setSelectedRooms([]);
    } else {
      setSelectedRooms(rooms.map(r => r.id));
    }
  };

  // 특정 날짜에 특정 방을 사용하는 참가자 목록
  const getParticipantsForRoomAndDate = (roomId, date) => {
    return allParticipants.filter(p => {
      const assignment = p.roomAssignments?.[date];
      return assignment?.roomId === roomId;
    });
  };

  // 특정 날짜에 방을 필요로 하지만 배정되지 않은 참가자 목록
  const getUnassignedParticipantsForDate = (date) => {
    return allParticipants.filter(p => {
      const needsRoom = p.accommodationDates?.includes(date);
      const hasAssignment = p.roomAssignments?.[date];
      return needsRoom && !hasAssignment;
    });
  };

  // 참가자에게 방 배정 (숙박 기간 전체)
  const assignParticipantToRoom = async (roomId, participantId) => {
    const room = rooms.find(r => r.id === roomId);
    const roomName = room?.name || null;
    const participant = allParticipants.find(p => p.id === participantId);

    if (!participant) return;

    // 숙박 날짜가 없으면 경고 후 계속 진행
    const accommodationDates = participant.accommodationDates || [];
    if (accommodationDates.length === 0) {
      if (!confirm(`${participant.name}님은 숙박 신청을 하지 않았습니다. 그래도 배정하시겠습니까?`)) {
        return;
      }
    }

    // 날짜별 정원 체크 (경고만, 차단 안 함)
    if (selectedDate && accommodationDates.length > 0) {
      const participantsInRoom = getParticipantsForRoomAndDate(roomId, selectedDate);
      const currentOccupancy = participantsInRoom.reduce((sum, p) => sum + (p.totalPeople || 0), 0);
      const afterOccupancy = currentOccupancy + (participant.totalPeople || 0);

      if (afterOccupancy > room.capacity) {
        if (!confirm(`정원 초과 경고!\n\n방: ${roomName}\n날짜: ${selectedDate}\n정원: ${room.capacity}명\n현재: ${currentOccupancy}명\n배정 후: ${afterOccupancy}명\n\n그래도 배정하시겠습니까?`)) {
          return;
        }
      }
    }

    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionName: 'participants_default',
        participantId,
        roomId,
        roomName,
      }),
    });

    fetchRooms();
    fetchAllParticipants();
  };

  // 참가자의 방 배정 해제
  const removeParticipantFromRoom = async (participantId) => {
    await fetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collectionName: 'participants_default',
        participantId,
        roomId: null,
        roomName: null,
      }),
    });

    fetchRooms();
    fetchAllParticipants();
  };

  // 숙박 가능 날짜 목록 (마지막 날 제외)
  const accommodationDates = settings?.dates?.slice(0, -1) || [];

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">방 관리 (날짜별)</h1>

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
            className="mr-2"
          />
          <span className="text-sm text-gray-700">전체 선택</span>
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

      {/* 날짜 선택 탭 */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">날짜 선택</h3>
        <div className="flex flex-wrap gap-2">
          {accommodationDates.map(date => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                selectedDate === date
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 날짜의 미배정 참가자 */}
      {selectedDate && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-yellow-900">
            {selectedDate} 미배정 참가자 ({getUnassignedParticipantsForDate(selectedDate).length}명)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {getUnassignedParticipantsForDate(selectedDate).map(p => (
              <div key={p.id} className="text-sm text-gray-700 bg-white rounded p-2 border border-yellow-300">
                <div className="font-semibold">{p.name} ({p.totalPeople}명)</div>
                <div className="text-xs text-gray-600">{p.phone}</div>
                <div className="text-xs text-gray-500">
                  숙박: {p.accommodationDates?.join(', ') || '신청 안함'}
                </div>
              </div>
            ))}
            {getUnassignedParticipantsForDate(selectedDate).length === 0 && (
              <div className="text-sm text-gray-500 italic">모두 배정되었습니다</div>
            )}
          </div>
        </div>
      )}

      {/* 디버그 정보 */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm">Settings 로드: {settings ? '✅' : '❌'}</p>
        <p className="text-sm">전체 날짜: {settings?.dates?.join(', ') || '없음'}</p>
        <p className="text-sm">숙박 가능 날짜: {accommodationDates.join(', ') || '없음'}</p>
        <p className="text-sm">참가자 수: {allParticipants.length}명</p>
        <p className="text-sm">방 수: {rooms.length}개</p>
      </div>

      {/* 방 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(r => {
          return (
            <div
              key={r.id}
              className={`bg-white shadow rounded p-4 border ${
                selectedRooms.includes(r.id) ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-lg">{r.name} ({r.group})</h2>
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  className="h-4 w-4"
                />
              </div>

              <p className="text-sm text-gray-600 mb-3">정원: {r.capacity}명</p>

              {/* 날짜별 할당 현황 */}
              {accommodationDates.length === 0 ? (
                <p className="text-xs text-gray-400 italic">날짜 설정이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {accommodationDates.map(date => {
                  const participantsForDate = getParticipantsForRoomAndDate(r.id, date);
                  const currentCount = participantsForDate.reduce((sum, p) => sum + (p.totalPeople || 0), 0);
                  const availableSpace = r.capacity - currentCount;
                  const isSelected = selectedDate === date;

                  return (
                    <div
                      key={date}
                      className={`border rounded-lg p-3 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700">{date}</p>
                        <p className={`text-xs font-semibold ${
                          currentCount > r.capacity ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {currentCount}/{r.capacity}명
                          {currentCount > r.capacity && ' (초과!)'}
                        </p>
                      </div>

                      {participantsForDate.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">배정 없음</p>
                      ) : (
                        <div className="space-y-1">
                          {participantsForDate.map(p => (
                            <div key={p.id} className="text-xs bg-white rounded p-2 flex justify-between items-center">
                              <span className="font-medium">{p.name} ({p.totalPeople}명)</span>
                              <button
                                onClick={() => removeParticipantFromRoom(p.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 참가자 추가 드롭다운 (항상 표시) */}
                      <div className="mt-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignParticipantToRoom(r.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full border rounded p-1 text-xs bg-white"
                        >
                          <option value="">+ 참가자 추가</option>
                          {allParticipants
                            .filter(p => !p.roomId)
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.totalPeople}명)
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
