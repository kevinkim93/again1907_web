export const scheduleDays = [
  { id: 'mon', label: '월요일', shortLabel: '월', date: '1.25', dateTime: '2027-01-25' },
  { id: 'tue', label: '화요일', shortLabel: '화', date: '1.26', dateTime: '2027-01-26' },
  { id: 'wed', label: '수요일', shortLabel: '수', date: '1.27', dateTime: '2027-01-27' },
  { id: 'thu', label: '목요일', shortLabel: '목', date: '1.28', dateTime: '2027-01-28' },
  { id: 'fri', label: '금요일', shortLabel: '금', date: '1.29', dateTime: '2027-01-29' },
  { id: 'sat', label: '토요일', shortLabel: '토', date: '1.30', dateTime: '2027-01-30' },
];

export const gatheringSpeakers = [
  { name: '고성준 목사', affiliation: '수원하나교회', photo: '/images/speakers/go-seongjun.webp' },
  { name: '장승민 목사', affiliation: '장춘단교회', photo: '/images/speakers/jang-seungmin.webp' },
  { name: '이호 목사', affiliation: '금란교회', photo: '/images/speakers/lee-ho.webp' },
  { name: 'Yohannes Nahuway 목사', affiliation: 'Mawar saron교회', photo: '/images/speakers/yohannes-nahuway.webp' },
  { name: '김권능 목사', affiliation: '인천한나라은혜교회', photo: '/images/speakers/kim-gwonneung.webp' },
  { name: '김정민 목사', affiliation: '금란교회', photo: '/images/speakers/kim-jeongmin.webp' },
  { name: '이에녹 형제', affiliation: '성경통독 100독학교', photo: '/images/speakers/lee-enoch.webp' },
  { name: '최광 목사', affiliation: '황금종교회', photo: '/images/speakers/choi-gwang.webp' },
  { name: '조지훈 목사', affiliation: '기쁨이 있는 교회', photo: '/images/speakers/cho-jihoon.webp' },
  { name: '임성일 선교사', affiliation: '신촌하나교회', photo: '/images/speakers/lim-seongil.webp' },
  { name: '성현경 목사', affiliation: '의현교회', photo: '/images/speakers/sung-hyunkyung.webp' },
  { name: '최상훈 목사', affiliation: '화양교회', photo: '/images/speakers/choi-sanghoon.webp' },
];

const speakerAffiliations = Object.fromEntries(gatheringSpeakers.map(({ name, affiliation }) => [name, affiliation]));

const session = (time, title, person, note = speakerAffiliations[person]) => ({ time, title, person, note });
const meal = (time, title) => [session(time, title)];

function morning(team, person, title = '설교') {
  return [
    session('09:30–10:00', '찬양', team),
    session('10:00–11:40', title, person),
  ];
}

function afternoon(team, person) {
  return [
    session('14:00–15:00', '찬양', team),
    session('15:00–17:00', '설교', person),
  ];
}

function evening(team, person, closingTitle = '기도') {
  return [
    session('19:30–20:30', '찬양', team),
    session('20:30–22:00', '설교', person),
    session('22:00–23:00', closingTitle, person),
  ];
}

// The supplied timetable is a working programme, not a confirmed speaker roster.
// Use clock times rather than the conflicting duration labels in the source.
export const scheduleRows = [
  {
    id: 'breakfast', label: '아침금식', kind: 'meal',
    days: {
      mon: null,
      tue: meal(null, '아침금식'),
      wed: meal(null, '아침금식'),
      thu: meal(null, '아침금식'),
      fri: meal(null, '아침금식'),
      sat: meal(null, '아침금식'),
    },
  },
  {
    id: 'morning', label: '오전예배', kind: 'worship',
    days: {
      mon: null,
      tue: morning('수원하나교회', '장승민 목사'),
      wed: morning('금란교회', null, '간증'),
      thu: morning('기쁨이 있는 교회', '이에녹 형제', '탈북민 간증'),
      fri: morning('화양교회', '임성일 선교사'),
      sat: [
        session('09:30–10:00', '찬양', '화양교회'),
        session('10:00–11:30', '간증', '참가자', '응답·치유·축사 등의 간증'),
        session('11:30–12:00', '폐회 예배', '최광 목사'),
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
      sat: null,
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
      thu: afternoon('기쁨이 있는 교회', '최광 목사'),
      fri: afternoon('화양교회', '성현경 목사'),
      sat: null,
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
        {
          ...session('19:30–21:30', '뮤지컬', '평양의 그날, 우리의 그날', '하나무브먼트'),
          videoUrl: 'https://www.youtube.com/watch?v=ZkFnuxlPKlI',
        },
        session('21:30–23:00', '설교', '고성준 목사'),
      ],
      tue: evening('수원하나교회', 'Yohannes Nahuway 목사'),
      wed: evening('금란교회', '김정민 목사'),
      thu: evening('기쁨이 있는 교회', '조지훈 목사'),
      fri: evening('화양교회', '최상훈 목사'),
      sat: null,
    },
  },
  {
    id: 'night-rest', label: '휴식', kind: 'rest',
    days: {
      mon: meal('23:00–23:30', '휴식'),
      tue: meal('23:00–23:30', '휴식'),
      wed: meal('23:00–23:30', '휴식'),
      thu: meal('23:00–23:30', '휴식'),
      fri: meal('23:00–23:30', '휴식'),
      sat: null,
    },
  },
  {
    id: 'night-prayer', label: '철야기도', kind: 'worship',
    days: {
      mon: [session('23:30–02:00', '철야기도', null)],
      tue: [session('23:30–02:00', '철야기도', null)],
      wed: [session('23:30–02:00', '철야기도', null)],
      thu: [session('23:30–02:00', '철야기도', null)],
      fri: [session('23:30–02:00', '철야기도', null)],
      sat: null,
    },
  },
];
