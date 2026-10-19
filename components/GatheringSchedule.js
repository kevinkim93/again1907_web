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
      <div className="timetable-day-picker" role="group" aria-label="일정 요일 선택">
        {scheduleDays.map((day) => (
          <button key={day.id} type="button" aria-label={`${day.label} ${day.date}`} aria-pressed={selectedDay === day.id} aria-controls="gathering-timetable" onClick={() => setSelectedDay(day.id)}>
            {day.shortLabel}
          </button>
        ))}
      </div>
      <p className="timetable-scroll-hint" id="timetable-scroll-hint">좌우로 보기</p>
      <div className="timetable-scroll" role="region" aria-label="집회 일정" aria-describedby="timetable-scroll-hint" tabIndex={0}>
        <table id="gathering-timetable" className="timetable">
          <caption className="sr-only">제6차 Again 1907 집회 시간표 예정안 · 2027년 1월 25일 월요일부터 30일 토요일까지</caption>
          <thead>
            <tr>
              <th scope="col" className="timetable-period">구분</th>
              {scheduleDays.map((day) => (
                <th key={day.id} scope="col" data-day={day.id}>
                  <span className="timetable-day">{day.shortLabel}</span>{' '}
                  <time dateTime={day.dateTime}>({day.date})</time>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleRows.map((row) => (
              <tr key={row.id} className={`timetable-row timetable-row-${row.kind}`} data-active={Boolean(row.days[selectedDay]?.length)}>
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
        <p>금요일 밤 기도: 새벽까지 예정</p>
      </div>
    </div>
  );
}
