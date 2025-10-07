'use client';

import { useState } from 'react';

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'kids'

  const days = [
    {
      day: "DAY 1",
      date: "1/6 (월)",
      sessions: [
        {
          time: "19:30-23:00",
          title: "개회예배",
          detail: "개회: 최창묵 목사 / 설교: 김관호 목사 / 기도: 이호준 목사",
        },
      ],
    },
    {
      day: "DAY 2",
      date: "1/7 (화)",
      sessions: [
        { time: "08:00-09:30", title: "아침식사" },
        {
          time: "09:30-12:30",
          title: "오전예배",
          detail: "간증: 하현일 목사 / 설교: 장광우 목사",
        },
        { time: "12:30-13:50", title: "점심식사" },
        { time: "13:50-14:30", title: "휴식" },
        { time: "14:30-17:30", title: "오후예배", detail: "설교: 최광 목사" },
        { time: "17:30-18:50", title: "저녁식사" },
        { time: "18:50-19:30", title: "휴식" },
        {
          time: "19:30-23:00",
          title: "저녁예배",
          detail: "뮤지컬 <십자가의 아이들> / 설교: 김요한 목사",
        },
      ],
    },
    {
      day: "DAY 3",
      date: "1/7 (화)",
      sessions: [
        { time: "08:00-09:30", title: "아침식사" },
        {
          time: "09:30-12:30",
          title: "오전예배",
          detail: "간증: 하현일 목사 / 설교: 장광우 목사",
        },
        { time: "12:30-13:50", title: "점심식사" },
        { time: "13:50-14:30", title: "휴식" },
        { time: "14:30-17:30", title: "오후예배", detail: "설교: 최광 목사" },
        { time: "17:30-18:50", title: "저녁식사" },
        { time: "18:50-19:30", title: "휴식" },
        {
          time: "19:30-23:00",
          title: "저녁예배",
          detail: "뮤지컬 <십자가의 아이들> / 설교: 김요한 목사",
        },
      ],
    },
    {
      day: "DAY 4",
      date: "1/7 (화)",
      sessions: [
        { time: "08:00-09:30", title: "아침식사" },
        {
          time: "09:30-12:30",
          title: "오전예배",
          detail: "간증: 하현일 목사 / 설교: 장광우 목사",
        },
        { time: "12:30-13:50", title: "점심식사" },
        { time: "13:50-14:30", title: "휴식" },
        { time: "14:30-17:30", title: "오후예배", detail: "설교: 최광 목사" },
        { time: "17:30-18:50", title: "저녁식사" },
        { time: "18:50-19:30", title: "휴식" },
        {
          time: "19:30-23:00",
          title: "저녁예배",
          detail: "뮤지컬 <십자가의 아이들> / 설교: 김요한 목사",
        },
      ],
    },
    {
      day: "DAY 5",
      date: "1/7 (화)",
      sessions: [
        { time: "08:00-09:30", title: "아침식사" },
        {
          time: "09:30-12:30",
          title: "오전예배",
          detail: "간증: 하현일 목사 / 설교: 장광우 목사",
        },
        { time: "12:30-13:50", title: "점심식사" },
        { time: "13:50-14:30", title: "휴식" },
        { time: "14:30-17:30", title: "오후예배", detail: "설교: 최광 목사" },
        { time: "17:30-18:50", title: "저녁식사" },
        { time: "18:50-19:30", title: "휴식" },
        {
          time: "19:30-23:00",
          title: "저녁예배",
          detail: "뮤지컬 <십자가의 아이들> / 설교: 김요한 목사",
        },
      ],
    },
    // DAY3~DAY6 생략 (동일 구조로 채우면 됨)
  ];

  const kidsDays = [
    {
      day: "DAY 1",
      date: "1/6 (월)",
      sessions: [
        { time: "19:30-23:00", title: "개회 프로그램", detail: "어린이 환영식" },
      ],
    },
    {
      day: "DAY 2",
      date: "1/7 (화)",
      sessions: [
        { time: "09:30-12:30", title: "오전 프로그램", detail: "성경 놀이" },
        { time: "14:30-17:30", title: "오후 프로그램", detail: "찬양 배우기" },
        { time: "19:30-23:00", title: "저녁 프로그램", detail: "특별 공연" },
      ],
    },
    // 추가 날짜...
  ];

  const currentSchedule = activeTab === 'main' ? days : kidsDays;

  return (
    <section className="bg-black text-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 타이틀 */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-8">
          일정 안내
        </h1>

        {/* 탭 버튼 */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('main')}
            className={`w-40 px-8 py-3 font-semibold text-base rounded-lg transition-all ${
              activeTab === 'main'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            집회 일정
          </button>
          <button
            onClick={() => setActiveTab('kids')}
            className={`w-40 px-8 py-3 font-semibold text-base rounded-lg transition-all ${
              activeTab === 'kids'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            어린이<br/>프로그램
          </button>
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
              {[
                "08:00-09:30",
                "09:30-12:30",
                "12:30-13:50",
                "13:50-14:30",
                "14:30-17:30",
                "17:30-18:50",
                "18:50-19:30",
                "19:30-23:00",
              ].map((time, idx) => (
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
