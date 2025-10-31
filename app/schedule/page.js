'use client';

import { useEffect, useMemo, useState } from 'react';

export default function SchedulePage() {
  const [tabs, setTabs] = useState([]);
  const [data, setData] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/schedule/public');
        if (!res.ok) throw new Error('스케줄을 불러오지 못했습니다.');
        const json = await res.json();
        setTabs(json.tabs || []);
        setData(json.data || {});
        const initial = (json.tabs && json.tabs[0]?.id) || '';
        setActiveTab(initial);
      } catch (e) {
        console.error(e);
        setError('스케줄을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const currentSchedule = useMemo(() => (activeTab ? (data[activeTab] || []) : []), [data, activeTab]);
  const timeRows = useMemo(() => {
    const seen = new Set();
    const rows = [];
    for (const day of currentSchedule) {
      for (const s of day.sessions || []) {
        if (s.time && !seen.has(s.time)) {
          seen.add(s.time);
          rows.push(s.time);
        }
      }
    }
    // 필요 시 정렬 규칙을 바꿀 수 있습니다. (예: 문자열 정렬)
    return rows;
  }, [currentSchedule]);
  return (
    <section className="bg-black text-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 타이틀 */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8">
          일정 안내
        </h1>

        {/* 탭 버튼 */}
        <div className="flex justify-center gap-4 mb-12">
          {loading ? (
            <div className="text-gray-300">불러오는 중...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-40 px-8 py-3 font-semibold text-base rounded-lg transition-all ${
                  activeTab === t.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.name}
              </button>
            ))
          )}
        </div>

        {/* 데스크탑 테이블 */}
        <div className="hidden md:block bg-gray-800 shadow-md rounded-xl overflow-hidden border border-gray-700">
          <table className="min-w-full border border-gray-700 text-sm text-center">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="border border-gray-700 p-3">시간</th>
                {currentSchedule.map((d, idx) => (
                  <th key={idx} className="border border-gray-700 p-3">
                    <div className="font-semibold">{d.day}</div>
                    <div className="text-xs opacity-90">{d.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
            {timeRows.map((time, idx) => (
                <tr key={idx} className="odd:bg-gray-800 even:bg-gray-750">
                  <td className="border border-gray-700 p-3 font-medium text-gray-300">
                    {time}
                  </td>
                  {currentSchedule.map((d, dIdx) => {
                    const session = d.sessions.find((s) => s.time === time);
                    return (
                      <td
                        key={dIdx}
                        className="border border-gray-700 p-3 align-top text-gray-200"
                      >
                        {session ? (
                          <div>
                            <div className="font-semibold">{session.title}</div>
                            {session.detail && (
                              <div className="text-xs text-gray-400 mt-1 whitespace-pre-line">
                                {session.detail}
                              </div>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 */}
        <div className="md:hidden space-y-6">
          {currentSchedule.map((d, idx) => (
            <div
              key={idx}
              className="bg-gray-800 shadow-md rounded-xl overflow-hidden border border-gray-700"
            >
              <h2 className="bg-red-600 text-white px-4 py-2 text-lg font-bold">
                {d.day} <span className="text-sm opacity-90">{d.date}</span>
              </h2>
              <ul className="divide-y divide-gray-700">
                {d.sessions.map((s, sIdx) => (
                  <li key={sIdx} className="px-4 py-3">
                    <div className="font-medium text-gray-200">
                      {s.time} — {s.title}
                    </div>
                    {s.detail && (
                      <div className="text-xs text-gray-400 mt-1 whitespace-pre-line">
                        {s.detail}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
