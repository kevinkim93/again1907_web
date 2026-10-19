export const scheduleDays = [
  { id: 'mon', label: '월요일', shortLabel: '월', date: '1.25', dateTime: '2027-01-25' },
  { id: 'tue', label: '화요일', shortLabel: '화', date: '1.26', dateTime: '2027-01-26' },
  { id: 'wed', label: '수요일', shortLabel: '수', date: '1.27', dateTime: '2027-01-27' },
  { id: 'thu', label: '목요일', shortLabel: '목', date: '1.28', dateTime: '2027-01-28' },
  { id: 'fri', label: '금요일', shortLabel: '금', date: '1.29', dateTime: '2027-01-29' },
  { id: 'sat', label: '토요일', shortLabel: '토', date: '1.30', dateTime: '2027-01-30' },
];

const session = (time, title, person, note) => ({ time, title, person, note });
const meal = (time, title) => [session(time, title)];

function morning(team, person, title = '설교') {
  return [
    session('09:30–10:00', '찬양', team),
    session('10:00–11:40', title, person),
    session('11:40–11:55', '찬양', team),
    session('11:55–12:00', '광고'),
  ];
}

function afternoon(team, person) {
  return [
    session('14:00–15:00', '찬양', team),
    session('15:00–17:00', '설교', person),
    session('17:00–17:20', '찬양', team),
    session('17:20–17:30', '광고'),
  ];
}

function evening(team, person, church) {
  return [
    session('19:30–20:30', '찬양', team),
    session('20:30–22:00', '설교', person, church),
    session('22:00–23:00', '기도', person),
    session('23:00–23:10', '광고'),
  ];
}

// The supplied timetable is a working programme, not a confirmed speaker roster.
// Use clock times rather than the conflicting duration labels in the source.
export const scheduleRows = [
  {
    id: 'breakfast', label: '아침식사', kind: 'meal',
    days: {
      mon: null,
      tue: meal('07:30–09:00', '아침식사'),
      wed: meal('07:30–09:00', '아침식사'),
      thu: meal('07:30–09:00', '아침식사'),
      fri: meal('07:30–09:00', '아침식사'),
      sat: meal('07:30–09:00', '아침식사'),
    },
  },
  {
    id: 'morning', label: '오전예배', kind: 'worship',
    days: {
      mon: null,
      tue: morning('수원하나교회', '신경미 전도사'),
      wed: morning('금란교회', '로만 목사 · 압둘자바르 목사'),
      thu: morning('조이풀처치', '이에녹 형제', '탈북민 간증'),
      fri: morning('찬양팀 추후 안내', '임성일 선교사'),
      sat: [
        session('09:30–10:00', '찬양', '찬양팀 추후 안내'),
        session('10:00–11:00', '간증', '추후 안내'),
        session('11:00–12:20', '설교 · 기도', '추후 안내'),
        session('12:20–12:30', '광고'),
        session('12:30', '축도'),
      ],
    },
  },
  {
    id: 'lunch', label: '점심식사', kind: 'meal',
    days: {
      mon: null,
      tue: meal('12:00–13:30', '점심식사'),
      wed: meal('12:00–13:30', '점심식사'),
      thu: meal('12:00–13:30', '점심식사'),
      fri: meal('12:00–13:30', '점심식사'),
      sat: [session(null, '축도 후 점심', null, '점심 후 종료 · 시각 추후 안내')],
    },
  },
  {
    id: 'afternoon-rest', label: '휴식', kind: 'rest',
    days: {
      mon: null,
      tue: meal('13:30–14:00', '휴식'),
      wed: meal('13:30–14:00', '휴식'),
      thu: meal('13:30–14:00', '휴식'),
      fri: meal('13:30–14:00', '휴식'),
      sat: null,
    },
  },
  {
    id: 'afternoon', label: '오후예배', kind: 'worship',
    days: {
      mon: null,
      tue: afternoon('수원하나교회', '이호 목사'),
      wed: afternoon('금란교회', '김권능 목사'),
      thu: afternoon('조이풀처치', '장성민 목사'),
      fri: afternoon('찬양팀 추후 안내', '성현경 목사'),
      sat: [session(null, '집회 마침')],
    },
  },
  {
    id: 'registration', label: '등록', kind: 'registration',
    days: {
      mon: [session('15:00', '등록 시작')],
      tue: null,
      wed: null,
      thu: null,
      fri: null,
      sat: null,
    },
  },
  {
    id: 'dinner', label: '저녁식사', kind: 'meal',
    days: {
      mon: null,
      tue: meal('17:30–19:00', '저녁식사'),
      wed: meal('17:30–19:00', '저녁식사'),
      thu: meal('17:30–19:00', '저녁식사'),
      fri: meal('17:30–19:00', '저녁식사'),
      sat: null,
    },
  },
  {
    id: 'evening-rest', label: '휴식', kind: 'rest',
    days: {
      mon: null,
      tue: meal('19:00–19:30', '휴식'),
      wed: meal('19:00–19:30', '휴식'),
      thu: meal('19:00–19:30', '휴식'),
      fri: meal('19:00–19:30', '휴식'),
      sat: null,
    },
  },
  {
    id: 'evening', label: '저녁예배', kind: 'worship',
    days: {
      mon: [
        session('19:30–21:30', '뮤지컬', '하나무브먼트', '인터미션 20분 포함'),
        session('21:30–23:00', '설교', '고성준 목사', '수원하나교회'),
        session('23:00–24:00', '기도', '최광 목사'),
        session('00:00–00:10', '광고', null, '다음 날'),
      ],
      tue: evening('수원하나교회', '김다위 목사', '선한목자교회'),
      wed: evening('금란교회', '김정민 목사', '금란교회'),
      thu: evening('조이풀처치', '조지훈 목사', '조이풀교회'),
      fri: evening('찬양팀 추후 안내', '최상훈 목사', '화양교회'),
      sat: null,
    },
  },
];
