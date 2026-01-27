'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function RoomsPage() {
  const pathname = usePathname();
  const [rooms, setRooms] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    start: '',
    end: '',
    startDate: '',
    endDate: '',
    group: '전부',
    capacity: 4,
    buildingName: ''
  });
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); // 모달용
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fetchingRef = useRef(false); // 중복 fetch 방지

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    setSettings(data.settings);
  };

  const fetchRooms = async () => {
    const res = await fetch('/api/admin/rooms', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    const data = await res.json();
    setRooms(data.rooms || []);
    setSelectedRooms([]);
  };

  const fetchAllParticipants = useCallback(async () => {
    // 모든 폼의 참가자를 병렬로 가져옴
    try {
      const formsRes = await fetch('/api/admin/forms');
      const formsData = await formsRes.json();
      const forms = formsData.forms || [];

      // 병렬로 모든 폼의 참가자 데이터 fetch
      const fetchPromises = forms.map(async (form) => {
        const collectionName = `participants_${form.id}`;
        const res = await fetch(`/api/admin/participants/all?collectionName=${collectionName}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        const participants = data.participants || [];

        // 이름과 전화번호 필드 찾기
        const nameField = form.fields?.find(f => f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명')));
        const phoneField = form.fields?.find(f => f.type === 'tel');

        // 참가자 데이터에 name과 phone 속성 추가
        return participants.map(p => ({
          ...p,
          name: nameField ? p[nameField.id] : '이름 없음',
          phone: phoneField ? p[phoneField.id] : '',
          totalPeople: p.totalPeople || 1
        }));
      });

      const results = await Promise.all(fetchPromises);
      const allParts = results.flat();

      setAllParticipants(allParts);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setAllParticipants([]);
    }
  }, []);

  // 데이터 로드 함수 (중복 방지)
  const loadData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);

    try {
      await Promise.all([
        fetchSettings(),
        fetchRooms(),
        fetchAllParticipants()
      ]);
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchAllParticipants]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createRooms = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ start: '', end: '', startDate: '', endDate: '', group: '전부', capacity: 4, buildingName: '' });
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

  // 참가자-방 매핑을 메모이제이션하여 O(1) 조회
  const participantsByRoom = useMemo(() => {
    const map = new Map();

    allParticipants.forEach(p => {
      // roomAssignments 기반 매핑 (날짜별 배정)
      if (p.roomAssignments && typeof p.roomAssignments === 'object') {
        for (const dateKey in p.roomAssignments) {
          const assignment = p.roomAssignments[dateKey];
          const assignmentDate = assignment.standardDate || dateKey;
          const key = `${assignment.roomId}_${assignmentDate}`;

          if (!map.has(key)) map.set(key, []);
          map.get(key).push(p);
        }
      }

      // 기존 roomId 기반 매핑 (하위 호환성)
      if (p.roomId) {
        const legacyKey = `${p.roomId}_legacy`;
        if (!map.has(legacyKey)) map.set(legacyKey, []);
        map.get(legacyKey).push(p);
      }
    });

    return map;
  }, [allParticipants]);

  // 특정 방(날짜별)에 배정된 참가자들 - O(1) 조회
  const getParticipantsForRoom = useCallback((roomId, roomDate) => {
    if (roomDate) {
      return participantsByRoom.get(`${roomId}_${roomDate}`) || [];
    }
    // roomDate가 없으면 기존 방식 (하위 호환성)
    return participantsByRoom.get(`${roomId}_legacy`) || [];
  }, [participantsByRoom]);

  // 방 번호 + 숙소 이름으로 그룹화
  const groupedRooms = {};
  rooms.forEach(room => {
    const roomNum = room.roomNumber || room.name?.replace(/[^\d]/g, '');
    const building = room.buildingName || '';
    const groupKey = building ? `${building}|${roomNum}` : roomNum;
    if (!groupedRooms[groupKey]) {
      groupedRooms[groupKey] = [];
    }
    groupedRooms[groupKey].push(room);
  });

  // 숙소 이름 → 방 번호 순으로 정렬
  const sortedRoomNumbers = Object.keys(groupedRooms).sort((a, b) => {
    const [buildingA, numA] = a.includes('|') ? a.split('|') : ['', a];
    const [buildingB, numB] = b.includes('|') ? b.split('|') : ['', b];
    // 먼저 숙소 이름으로 정렬
    if (buildingA !== buildingB) {
      return buildingA.localeCompare(buildingB);
    }
    // 같은 숙소면 방 번호로 정렬
    return parseInt(numA) - parseInt(numB);
  });

  // 숙박 가능 날짜 목록 (마지막 날 제외)
  const accommodationDates = settings?.dates?.slice(0, -1) || [];

  // 방 상세 정보 보기
  const openRoomDetail = (room) => {
    setSelectedRoom(room);
  };

  const closeRoomDetail = () => {
    setSelectedRoom(null);
  };

  const handleRefresh = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsRefreshing(true);

    try {
      await Promise.all([
        fetchRooms(),
        fetchAllParticipants()
      ]);
    } finally {
      fetchingRef.current = false;
      setIsRefreshing(false);
    }
  };

  // 초기 로딩 화면
  if (isLoading && rooms.length === 0) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6">방 관리</h1>
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">방 관리</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
          {isRefreshing ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {/* 방 생성 */}
      <form onSubmit={createRooms} className="bg-white shadow rounded-lg p-6 mb-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">방 생성</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">숙소 이름 (선택)</label>
          <input
            type="text"
            value={form.buildingName}
            onChange={(e) => setForm(f => ({ ...f, buildingName: e.target.value }))}
            className="w-full border border-gray-300 rounded-md p-2"
            placeholder="예: A동, 본관, 별관 (비워두면 호수만 표시)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">시작 방번호</label>
            <input
              type="number"
              value={form.start}
              onChange={(e) => setForm(f => ({ ...f, start: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="예: 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">끝 방번호</label>
            <input
              type="number"
              value={form.end}
              onChange={(e) => setForm(f => ({ ...f, end: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="예: 110"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">시작 날짜</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">끝 날짜</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">배정 그룹</label>
            <select
              value={form.group}
              onChange={(e) => setForm(f => ({ ...f, group: e.target.value }))}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>탈북민</option>
              <option>목회자</option>
              <option>평신도</option>
              <option>전부</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">가용 인원</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 text-sm text-blue-800">
          <strong>생성될 방:</strong> {
            form.start && form.end && form.startDate && form.endDate
              ? (() => {
                  const roomCount = parseInt(form.end) - parseInt(form.start) + 1;
                  const startD = new Date(form.startDate);
                  const endD = new Date(form.endDate);
                  const dayCount = Math.floor((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
                  const prefix = form.buildingName ? `${form.buildingName} ` : '';
                  const exampleName = `${prefix}${form.start}호 ~ ${prefix}${form.end}호`;
                  return `${exampleName} (${roomCount}개 방 × ${dayCount}일 = 총 ${roomCount * dayCount}개)`;
                })()
              : '정보를 입력하세요'
          }
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          방 생성
        </button>
      </form>

      {/* 전체 선택 + 삭제 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRooms.length === rooms.length && rooms.length > 0}
              onChange={toggleSelectAll}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">전체 선택</span>
          </label>
          <span className="text-sm text-gray-600">
            전체 {rooms.length}개 방
          </span>
        </div>

        {selectedRooms.length > 0 && (
          <button
            onClick={deleteSelected}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
          >
            선택한 {selectedRooms.length}개 방 삭제
          </button>
        )}
      </div>

      {/* 방 목록 (방 번호 기준 그룹화) */}
      {rooms.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center text-gray-500">
          <p className="text-lg">생성된 방이 없습니다.</p>
          <p className="text-sm mt-2">위 폼에서 방을 생성해주세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRoomNumbers.map(groupKey => {
            const roomsByDate = groupedRooms[groupKey];
            // 날짜 순으로 정렬
            roomsByDate.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

            const firstRoom = roomsByDate[0];
            const roomNumber = firstRoom.roomNumber || groupKey.split('|').pop();
            const allRoomIds = roomsByDate.map(r => r.id);
            const allSelected = allRoomIds.every(id => selectedRooms.includes(id));

            return (
              <div key={groupKey} className="bg-white shadow rounded-lg overflow-hidden">
                {/* 방 번호 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => {
                        if (allSelected) {
                          setSelectedRooms(prev => prev.filter(id => !allRoomIds.includes(id)));
                        } else {
                          setSelectedRooms(prev => [...new Set([...prev, ...allRoomIds])]);
                        }
                      }}
                      className="h-5 w-5"
                    />
                    <h3 className="text-xl font-bold text-white">
                      {firstRoom.buildingName ? `${firstRoom.buildingName} ${roomNumber}호` : `${roomNumber}호`}
                    </h3>
                    <span className="text-blue-100 text-sm">
                      {firstRoom.group} | 정원 {firstRoom.capacity}명
                    </span>
                  </div>
                  <span className="text-blue-100 text-sm">
                    {roomsByDate.length}일 등록됨
                  </span>
                </div>

                {/* 날짜별 상태 */}
                <div className="p-4">
                  <div className="space-y-2">
                    {roomsByDate.map(room => {
                      const participants = getParticipantsForRoom(room.id, room.date);
                      const totalPeople = participants.reduce((sum, p) => sum + (p.totalPeople || 0), 0);
                      const isOverCapacity = totalPeople > room.capacity;
                      const isSelected = selectedRooms.includes(room.id);

                      return (
                        <div
                          key={room.id}
                          className={`border rounded-lg p-3 transition ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(room.id)}
                                className="h-4 w-4"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  📅 {room.date}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  배정: {totalPeople}명 / {room.capacity}명
                                  {isOverCapacity && (
                                    <span className="ml-2 text-red-600 font-semibold">⚠️ 초과</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {participants.length > 0 ? (
                                <div className="text-xs text-gray-700 text-right">
                                  {participants.slice(0, 2).map(p => (
                                    <div key={p.id}>{p.name} ({p.totalPeople}명)</div>
                                  ))}
                                  {participants.length > 2 && (
                                    <div className="text-blue-600 font-medium">
                                      +{participants.length - 2}명 더 보기
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">배정 없음</span>
                              )}

                              <button
                                onClick={() => openRoomDetail(room)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition whitespace-nowrap"
                              >
                                상세
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 방 상세 정보 모달 */}
      {selectedRoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeRoomDetail}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-600">{selectedRoom.group} | 정원 {selectedRoom.capacity}명</p>
              </div>
              <button
                onClick={closeRoomDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {getParticipantsForRoom(selectedRoom.id, selectedRoom.date).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>배정된 참가자가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getParticipantsForRoom(selectedRoom.id, selectedRoom.date).map(participant => (
                    <div
                      key={participant.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{participant.name}</h3>
                          <p className="text-sm text-gray-600">{participant.phone}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {participant.totalPeople}명
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">숙박 날짜</p>
                          {participant.accommodationDates && participant.accommodationDates.length > 0 ? (
                            <div className="space-y-1">
                              {participant.accommodationDates.map((date, idx) => (
                                <div key={idx} className="bg-gray-50 px-2 py-1 rounded text-xs">
                                  {date}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">신청 안함</p>
                          )}
                        </div>

                        <div>
                          <p className="text-gray-600 mb-1">방 타입</p>
                          <p className="font-medium">{participant.roomType || '-'}</p>

                          {participant.extraCounts && (
                            <div className="mt-2">
                              <p className="text-gray-600 mb-1">인원 구성</p>
                              <div className="text-xs space-y-1">
                                <p>성인: {participant.extraCounts.adult || 0}명</p>
                                <p>8세↑: {participant.extraCounts.minor8plus || 0}명</p>
                                <p>8세↓: {participant.extraCounts.minorUnder8 || 0}명</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {participant.accommodationAmount && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">숙박비</span>
                            <span className="font-semibold text-lg text-green-700">
                              {participant.accommodationAmount.total.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
