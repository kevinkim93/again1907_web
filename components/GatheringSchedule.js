'use client';

import { useEffect, useRef, useState } from 'react';
import { scheduleDays, scheduleRows } from '@/lib/gathering-schedule';
import './GatheringSchedule.css';

export default function GatheringSchedule() {
  // All six columns remain visible on desktop. Mobile starts with Monday.
  const [selectedDay, setSelectedDay] = useState('mon');
  const timetableRef = useRef(null);

  useEffect(() => {
    timetableRef.current.dataset.enhanced = 'true';
  }, []);

  return (
    <div ref={timetableRef} className="gathering-timetable" data-selected-day={selectedDay}>
      <div className="timetable-day-picker" role="group" aria-label="시간표 요일 선택">
        {scheduleDays.map((day) => (
          <button key={day.id} type="button" aria-pressed={selectedDay === day.id} aria-controls="gathering-timetable" onClick={() => setSelectedDay(day.id)}>
            <span>{day.label}</span><span>{day.date}</span>
          </button>
        ))}
        <button className="timetable-all-days" type="button" aria-pressed={selectedDay === 'all'} aria-controls="gathering-timetable" onClick={() => setSelectedDay('all')}>한 주 전체 보기</button>
      </div>
      <p className="timetable-scroll-hint" id="timetable-scroll-hint">표가 화면보다 넓으면 좌우로 밀어 확인하세요.</p>
      <div className="timetable-scroll" role="region" aria-label="집회 시간표" aria-describedby="timetable-scroll-hint" tabIndex={0}>
        <table id="gathering-timetable" className="timetable">
          <caption className="sr-only">제6차 Again 1907 집회 시간표 예정안 · 2027년 1월 25일 월요일부터 30일 토요일까지</caption>
          <thead>
            <tr>
              <th scope="col" className="timetable-period">구분</th>
              {scheduleDays.map((day) => (
                <th key={day.id} scope="col" data-day={day.id}>
                  <span className="timetable-day">{day.label}</span>
                  <time dateTime={day.dateTime}>{day.date}</time>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleRows.map((row) => (
              <tr key={row.id} className={`timetable-row timetable-row-${row.kind}`}>
                <th scope="row" className="timetable-period">{row.label}</th>
                {scheduleDays.map((day) => (
                  <td key={day.id} data-day={day.id}>
                    {row.days[day.id] ? (
                      <ul className="timetable-sessions">
                        {row.days[day.id].map((entry, index) => (
                          <li key={`${entry.title}-${index}`}>
                            {entry.time && <span className="timetable-time">{entry.time}</span>}
                            <strong className="timetable-session-title">{entry.title}</strong>
                            {entry.person && <span className="timetable-person">{entry.person}</span>}
                            {entry.note && <span className="timetable-note">{entry.note}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : <span className="timetable-empty"><span aria-hidden="true">—</span><span className="sr-only">예정된 일정 없음</span></span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="timetable-notes">
        <p>금요일 밤 기도는 새벽까지 이어질 예정입니다. 세부 진행 시각은 추후 안내합니다.</p>
        <p>월요일 오후 일정, 토요일 강사와 일부 찬양팀은 정해지는 대로 안내하겠습니다.</p>
      </div>
    </div>
  );
}
