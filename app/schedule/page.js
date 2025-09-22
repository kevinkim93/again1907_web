export default function SchedulePage() {
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

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 타이틀 */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12">
          일정 안내
        </h1>

        {/* 데스크탑 테이블 */}
        <div className="hidden md:block bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full border border-gray-300 text-sm text-center">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="border border-gray-300 p-3">시간</th>
                {days.map((d, idx) => (
                  <th key={idx} className="border border-gray-300 p-3">
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
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium text-gray-700">
                    {time}
                  </td>
                  {days.map((d, dIdx) => {
                    const session = d.sessions.find((s) => s.time === time);
                    return (
                      <td
                        key={dIdx}
                        className="border border-gray-300 p-3 align-top text-gray-800"
                      >
                        {session ? (
                          <div>
                            <div className="font-semibold">{session.title}</div>
                            {session.detail && (
                              <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">
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
          {days.map((d, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200"
            >
              <h2 className="bg-blue-600 text-white px-4 py-2 text-lg font-bold">
                {d.day} <span className="text-sm opacity-90">{d.date}</span>
              </h2>
              <ul className="divide-y divide-gray-200">
                {d.sessions.map((s, sIdx) => (
                  <li key={sIdx} className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {s.time} — {s.title}
                    </div>
                    {s.detail && (
                      <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">
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
