"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [data, setData] = useState({});
  const [activeTabId, setActiveTabId] = useState("");

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/schedule");
        if (!res.ok) throw new Error("스케줄 조회 실패");
        const json = await res.json();
        const schedules = json.schedules || { tabs: [], data: {} };
        setTabs(schedules.tabs || []);
        setData(schedules.data || {});
        setActiveTabId((schedules.tabs && schedules.tabs[0]?.id) || "");
      } catch (e) {
        console.error(e);
        alert("스케줄을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const days = useMemo(() => data[activeTabId] || [], [data, activeTabId]);

  const ensureTabData = (tabId) => {
    setData((prev) => ({ ...prev, [tabId]: prev[tabId] || [] }));
  };

  const handleAddTab = () => {
    const id = prompt("탭 ID (영문/숫자):", "main");
    if (!id) return;
    const name = prompt("탭 이름:", "메인");
    if (!name) return;
    if (tabs.some((t) => t.id === id)) {
      alert("이미 존재하는 탭 ID 입니다.");
      return;
    }
    const newTabs = [...tabs, { id, name }];
    setTabs(newTabs);
    ensureTabData(id);
    setActiveTabId(id);
  };

  const handleRenameTab = (tab) => {
    const name = prompt("새 탭 이름:", tab.name);
    if (!name) return;
    setTabs((prev) => prev.map((t) => (t.id === tab.id ? { ...t, name } : t)));
  };

  const handleDeleteTab = (tab) => {
    if (!confirm(`탭 '${tab.name}' 을(를) 삭제하시겠습니까?`)) return;
    const filtered = tabs.filter((t) => t.id !== tab.id);
    setTabs(filtered);
    setData((prev) => {
      const next = { ...prev };
      delete next[tab.id];
      return next;
    });
    if (activeTabId === tab.id) {
      setActiveTabId(filtered[0]?.id || "");
    }
  };

  const handleAddDay = () => {
    if (!activeTabId) return alert("먼저 탭을 선택하거나 생성하세요.");
    const day = prompt("DAY 라벨 (예: DAY 1)", "DAY 1") || "DAY 1";
    const date = prompt("날짜 (예: 1/6 (월))", "1/6 (월)") || "";
    setData((prev) => ({
      ...prev,
      [activeTabId]: [...(prev[activeTabId] || []), { day, date, sessions: [] }],
    }));
  };

  const handleEditDay = (index) => {
    const d = days[index];
    const day = prompt("DAY 라벨", d.day) || d.day;
    const date = prompt("날짜", d.date) || d.date;
    setData((prev) => ({
      ...prev,
      [activeTabId]: prev[activeTabId].map((it, i) => (i === index ? { ...it, day, date } : it)),
    }));
  };

  const handleDeleteDay = (index) => {
    if (!confirm("해당 일자를 삭제하시겠습니까?")) return;
    setData((prev) => ({
      ...prev,
      [activeTabId]: prev[activeTabId].filter((_, i) => i !== index),
    }));
  };

  const moveDay = (index, dir) => {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= days.length) return;
    const copy = [...days];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, item);
    setData((prev) => ({ ...prev, [activeTabId]: copy }));
  };

  const handleDuplicateDay = (index) => {
    const source = days[index];
    if (!source) return;
  
    // 깊은 복사로 세션까지 복제
    const clone = {
      day: source.day,
      date: source.date,
      sessions: (source.sessions || []).map((s) => ({ ...s })),
    };
  
    const next = [...days];
    next.splice(index + 1, 0, clone);
  
    setData((prev) => ({ ...prev, [activeTabId]: next }));
  };

  const handleAddSession = (dayIndex) => {
    const time = prompt("시간 (예: 19:30-23:00)", "");
    const title = prompt("제목", "");
    const detail = prompt("세부 내용 (선택)", "") || "";
    if (!time || !title) return alert("시간과 제목은 필수입니다.");
    const updated = days.map((d, i) =>
      i === dayIndex ? { ...d, sessions: [...d.sessions, { time, title, detail }] } : d
    );
    setData((prev) => ({ ...prev, [activeTabId]: updated }));
  };

  const handleEditSession = (dayIndex, sessionIndex) => {
    const s = days[dayIndex].sessions[sessionIndex];
    const time = prompt("시간", s.time) || s.time;
    const title = prompt("제목", s.title) || s.title;
    const detail = prompt("세부 내용", s.detail || "") || "";
    const updated = days.map((d, i) =>
      i === dayIndex
        ? {
            ...d,
            sessions: d.sessions.map((ss, j) => (j === sessionIndex ? { time, title, detail } : ss)),
          }
        : d
    );
    setData((prev) => ({ ...prev, [activeTabId]: updated }));
  };

  const handleDeleteSession = (dayIndex, sessionIndex) => {
    if (!confirm("세션을 삭제하시겠습니까?")) return;
    const updated = days.map((d, i) =>
      i === dayIndex
        ? { ...d, sessions: d.sessions.filter((_, j) => j !== sessionIndex) }
        : d
    );
    setData((prev) => ({ ...prev, [activeTabId]: updated }));
  };

  const moveSession = (dayIndex, sessionIndex, dir) => {
    const d = days[dayIndex];
    const nextIndex = sessionIndex + dir;
    if (nextIndex < 0 || nextIndex >= d.sessions.length) return;
    const sessions = [...d.sessions];
    const [item] = sessions.splice(sessionIndex, 1);
    sessions.splice(nextIndex, 0, item);
    const updated = days.map((it, i) => (i === dayIndex ? { ...it, sessions } : it));
    setData((prev) => ({ ...prev, [activeTabId]: updated }));
  };

  const handleSave = async () => {
    if (!tabs.length) return alert("최소 1개 이상의 탭이 필요합니다.");
    for (const t of tabs) {
      if (!t.id || !t.name) return alert("모든 탭에는 ID와 이름이 필요합니다.");
      if (!Array.isArray(data[t.id])) return alert(`탭 '${t.name}' 데이터가 비어있습니다.`);
      for (const d of data[t.id]) {
        if (!d.day || !d.date) return alert("모든 일자에 day와 date가 필요합니다.");
        if (!Array.isArray(d.sessions)) return alert("sessions는 배열이어야 합니다.");
        for (const s of d.sessions) {
          if (!s.time || !s.title) return alert("모든 세션에 시간과 제목이 필요합니다.");
        }
      }
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedules: { tabs, data } }),
      });
      if (!res.ok) throw new Error("스케줄 저장 실패");
      alert("스케줄이 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("스케줄 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleBootstrapFromCurrent = async () => {
    // 초기 하드코드 기반 기본값 (필요 시 수정 가능)
    const defaultTabs = [
      { id: "main", name: "메인" },
      { id: "kids", name: "키즈" },
    ];
    const defaultData = {
      main: [
        {
          day: "DAY 1",
          date: "1/6 (월)",
          sessions: [
            { time: "19:30-23:00", title: "개회예배", detail: "" },
          ],
        },
      ],
      kids: [
        {
          day: "DAY 1",
          date: "1/6 (월)",
          sessions: [
            { time: "19:30-23:00", title: "개회 프로그램", detail: "어린이 환영식" },
          ],
        },
      ],
    };
    setTabs(defaultTabs);
    setData(defaultData);
    setActiveTabId("main");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">스케줄 관리</h1>

      <div className="mb-4 flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTabId(t.id)}
            className={`px-3 py-1 rounded border ${
              activeTabId === t.id ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {t.name}
          </button>
        ))}
        <button onClick={handleAddTab} className="px-3 py-1 rounded border">+ 탭 추가</button>
        {activeTabId && (
          <>
            <button
              onClick={() => handleRenameTab(tabs.find((t) => t.id === activeTabId))}
              className="px-3 py-1 rounded border"
            >
              탭 이름 변경
            </button>
            <button
              onClick={() => handleDeleteTab(tabs.find((t) => t.id === activeTabId))}
              className="px-3 py-1 rounded border text-red-600"
            >
              탭 삭제
            </button>
          </>
        )}
        <button onClick={handleBootstrapFromCurrent} className="ml-auto px-3 py-1 rounded border">
          기존 페이지에서 가져오기
        </button>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-medium">일자 목록</h2>
          <button onClick={handleAddDay} className="px-3 py-1 rounded border">+ 일자 추가</button>
        </div>

        {!activeTabId ? (
          <p>탭을 선택하거나 추가해 주세요.</p>
        ) : days.length === 0 ? (
          <p>일자가 없습니다. 상단의 "+ 일자 추가" 버튼을 눌러 추가하세요.</p>
        ) : (
          <ul className="space-y-3">
            {days.map((d, i) => (
              <li key={i} className="border rounded p-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold mr-2">{d.day}</span>
                  <span className="text-gray-600">{d.date}</span>
                  <button onClick={() => moveDay(i, -1)} className="ml-2 px-2 py-1 border rounded">↑</button>
                  <button onClick={() => moveDay(i, 1)} className="px-2 py-1 border rounded">↓</button>
                  <button onClick={() => handleEditDay(i)} className="px-2 py-1 border rounded">수정</button>
                  <button onClick={() => handleDuplicateDay(i)} className="px-2 py-1 border rounded">복사</button>
                  <button onClick={() => handleDeleteDay(i)} className="px-2 py-1 border rounded text-red-600">삭제</button>
                  <button onClick={() => handleAddSession(i)} className="ml-auto px-2 py-1 border rounded">+ 세션</button>
                </div>
                <ul className="mt-3 space-y-2">
                  {d.sessions.map((s, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="w-32">{s.time}</span>
                      <span className="font-medium">{s.title}</span>
                      {s.detail ? <span className="text-gray-600">/ {s.detail}</span> : null}
                      <button onClick={() => moveSession(i, j, -1)} className="ml-auto px-2 py-1 border rounded">↑</button>
                      <button onClick={() => moveSession(i, j, 1)} className="px-2 py-1 border rounded">↓</button>
                      <button onClick={() => handleEditSession(i, j)} className="px-2 py-1 border rounded">수정</button>
                      <button onClick={() => handleDeleteSession(i, j)} className="px-2 py-1 border rounded text-red-600">삭제</button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded border ${saving ? 'opacity-60' : ''}`}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}


