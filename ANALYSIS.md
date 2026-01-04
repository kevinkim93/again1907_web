# Again1907 Web - 코드베이스 분석 및 문서

## 1. 서비스 개요

**Again1907**은 한국의 종교 집회(어게인1907) 참가자 등록 및 관리 시스템입니다.

### 핵심 기능
- 참가자 온라인 신청 접수
- 연령대별 요금 자동 계산
- 관리자 대시보드 (통계, 인원관리, 방 배정)
- CSV 내보내기

### 기술 스택
| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15.5.3, React 19.1.0 |
| Styling | Tailwind CSS 3.4.17 |
| Database | Firebase Firestore |
| Auth | Cookie 기반 (SHA256 해싱) |
| Hosting | Firebase Hosting |

---

## 2. 프로젝트 구조

```
again1907_web/
├── app/
│   ├── page.js                           # 홈페이지
│   ├── register/page.js                  # 참가 신청
│   ├── attendees/page.js                 # 참가자 목록 (공개)
│   ├── admin/
│   │   ├── login/page.js                 # 관리자 로그인
│   │   └── (protected)/
│   │       ├── page.js                   # 대시보드
│   │       ├── attendees/page.js         # 인원 관리
│   │       ├── rooms/page.js             # 방 관리
│   │       └── layout.js                 # 보호된 레이아웃
│   └── api/
│       ├── register/route.js             # 참가 신청 API
│       └── admin/
│           ├── _auth.js                  # 인증 미들웨어
│           ├── login/route.js            # 로그인 API
│           ├── rooms/route.js            # 방 CRUD API
│           ├── assign/route.js           # 방 배정 API
│           ├── payment/route.js          # 결제 상태 API
│           ├── settings/route.js         # 설정 API
│           └── unassigned/route.js       # 미배정 참가자 API
├── components/
│   ├── RegistrationForm.js               # 신청 폼 컴포넌트
│   └── AttendeesTable.js                 # 참가자 테이블 컴포넌트
└── lib/
    ├── firebaseClient.js                 # 클라이언트 Firebase
    └── firebaseAdmin.js                  # 서버 Firebase Admin
```

---

## 3. 기능별 상세 분석

### 3.1 참가 신청 (`/register`)

**흐름:**
1. 사용자가 폼 작성 (이름, 성별, 생년월일, 연락처, 소속 등)
2. 부분참석 선택 시 날짜 선택 가능
3. 추가 인원 입력 (성인, 8세 이상, 8세 미만)
4. 제출 시 `/api/register`로 POST

**요금 계산 로직:**
- 출생년도 기준 나이 계산 (한국 나이)
- 연령대 분류: 성인(19+), 8세 이상 미성년(8-18), 8세 미만
- 전체참석: 단가 × 인원
- 부분참석: 단가 × 인원 × 날짜 수

### 3.2 관리자 인증 (`/admin/login`)

**메커니즘:**
- 비밀번호 기반 단순 인증
- SHA256(비밀번호) → HttpOnly 쿠키로 저장
- 쿠키 유효시간: 8시간
- 기본 비밀번호: `1907` (환경변수로 변경 가능)

### 3.3 대시보드 (`/admin`)

**표시 정보:**
- 총 신청서 수
- 총 인원 (동반자 포함)
- 성별 통계 (남/여)
- 부분참석 날짜별 현황
- 등록된 방 개수

### 3.4 인원 관리 (`/admin/attendees`)

**기능:**
- 참가자 목록 테이블
- 결제 상태 토글 (paid/unpaid)
- 방 배정 드롭다운
- CSV 다운로드

### 3.5 방 관리 (`/admin/rooms`)

**기능:**
- 방 일괄 생성 (시작번호 ~ 끝번호)
- 그룹 설정 (탈북민, 목회자, 평신도, 전부)
- 정원 설정
- 선택된 방 일괄 삭제
- 방별 배정 현황 표시

---

## 4. 데이터베이스 스키마 (Firestore)

### settings/current
```javascript
{
  eventName: "어게인1907",
  dbName: "participants_default",
  openRegistration: true,
  dates: ["2024-01-15", "2024-01-16"],
  transportOptions: ["자가용", "버스"],
  howDidYouHearOptions: ["교회", "지인"],
  registrationPeriods: [{
    label: "1차 신청",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    fullPrice: { adult: 50000, minor8plus: 35000, minorUnder8: 0 },
    partialPrice: { adult: 20000, minor8plus: 15000, minorUnder8: 0 }
  }],
  extraQuestions: [{
    id: "identity",
    label: "신분",
    type: "checkbox",
    options: ["탈북민", "목회자", "평신도"],
    required: true
  }]
}
```

### participants (또는 dbName 설정값)
```javascript
{
  name: "홍길동",
  gender: "남",
  dob: "1990-01-15",
  phone: "010-1234-5678",
  churchOrRegion: "서울교회",
  ageGroup: "adult",
  isPartial: false,
  partialDates: [],
  transport: "자가용",
  discovery: "교회 공지",
  extraCounts: { adult: 2, minor8plus: 1, minorUnder8: 0 },
  totalPeople: 3,
  registrationPeriod: "1차 신청",
  amount: {
    type: "full",
    unitPrice: { adult: 50000, minor8plus: 35000, minorUnder8: 0 },
    total: 135000
  },
  paymentStatus: "unpaid",
  roomId: null,
  roomName: null,
  extraAnswers: { identity: ["평신도"] },
  createdAt: Timestamp
}
```

### rooms
```javascript
{
  name: "101호",
  capacity: 4,
  group: "평신도",
  createdAt: Timestamp
}
```

---

## 5. API 엔드포인트 정리

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/register` | X | 참가 신청 |
| POST | `/api/admin/login` | X | 로그인 |
| DELETE | `/api/admin/login` | O | 로그아웃 |
| GET | `/api/admin/rooms` | O | 방 목록 + 현황 |
| POST | `/api/admin/rooms` | O | 방 일괄 생성 |
| DELETE | `/api/admin/rooms` | O | 방 일괄 삭제 |
| POST | `/api/admin/assign` | O | 방 배정 |
| POST | `/api/admin/payment` | O | 결제 상태 변경 |
| POST | `/api/admin/settings` | O | 설정 저장 |
| GET | `/api/admin/unassigned` | O | 미배정 참가자 |
| GET | `/api/admin` | O | 관리자 목록 |
| POST | `/api/admin` | O | 관리자 추가 |

---

## 6. 발견된 코드 문제점 및 해결 방안

### 6.1 보안 문제

#### 문제 1: 취약한 인증 시스템
**현재 상태:**
- 단일 비밀번호로 모든 관리자 인증
- 비밀번호가 환경변수에 평문 저장
- 기본 비밀번호가 `1907`로 하드코딩

**위험도:** 높음

**해결 방안:**
1. Firebase Auth 또는 NextAuth.js 도입
2. 개별 관리자 계정 시스템 구현
3. 비밀번호 해싱 (bcrypt) 사용
4. 로그인 시도 제한 (rate limiting) 추가

#### 문제 2: CSRF 보호 부재
**현재 상태:**
- sameSite: 'lax'만 설정되어 있음
- CSRF 토큰 미사용

**해결 방안:**
- API 라우트에 CSRF 토큰 검증 추가

#### 문제 3: 입력값 검증 부족
**현재 상태:**
- Zod 라이브러리가 설치되어 있지만 사용되지 않음
- 서버 사이드 입력 검증이 최소화됨

**해결 방안:**
```javascript
// 예시: register API에 Zod 스키마 적용
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  gender: z.enum(['남', '여']),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().regex(/^01[0-9]-\d{3,4}-\d{4}$/),
  // ...
});
```

### 6.2 코드 품질 문제

#### 문제 4: 타입 안정성 부재
**현재 상태:**
- JavaScript 사용 (TypeScript 미사용)
- 런타임 에러 발생 가능성 높음

**해결 방안:**
- TypeScript 마이그레이션 권장
- 최소한 JSDoc 타입 주석 추가

#### 문제 5: 코드 중복
**현재 상태:**
- `expectedToken()` 함수가 두 곳에서 중복 정의됨
  - `app/api/admin/_auth.js`
  - `app/admin/(protected)/layout.js`

**해결 방안:**
```javascript
// lib/auth.js로 통합
export function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || '1907';
  return crypto.createHash('sha256').update(pwd).digest('hex');
}
```

#### 문제 6: 에러 처리 불충분
**현재 상태:**
- 일부 API에서 try-catch가 없음
- 사용자에게 구체적인 에러 메시지 미제공

**해결 방안:**
- 모든 API에 일관된 에러 처리 추가
- 에러 로깅 시스템 도입 (예: Sentry)

### 6.3 성능 문제

#### 문제 7: 비효율적인 데이터 조회
**현재 상태:**
- `/api/admin/rooms` GET에서 모든 참가자를 메모리에 로드 후 필터링

**위험도:** 중간 (참가자 수 증가 시 성능 저하)

**해결 방안:**
```javascript
// 개선: Firestore 쿼리로 필터링
const assignedParticipants = await adminDb
  .collection(collectionName)
  .where('roomId', '!=', null)
  .get();
```

#### 문제 8: 캐싱 부재
**현재 상태:**
- settings를 매 요청마다 Firestore에서 조회

**해결 방안:**
- Next.js 캐싱 또는 Redis 도입
- `unstable_cache` 또는 ISR 활용

### 6.4 UX 문제

#### 문제 9: 부분참석 날짜 검증 부족
**현재 상태:**
- 부분참석 체크 시 날짜를 선택하지 않아도 제출 가능
- `required` 속성이 각 체크박스에 있지만, 하나도 선택하지 않으면 통과됨

**해결 방안:**
```javascript
// 폼 제출 전 검증 추가
const submit = async (e) => {
  e.preventDefault();
  if (form.isPartial && form.partialDates.length === 0) {
    setError('부분참석 시 최소 1개 이상의 날짜를 선택해주세요.');
    return;
  }
  // ...
};
```

#### 문제 10: 로딩 상태 표시 부족
**현재 상태:**
- 방 관리 페이지에서 데이터 로딩 중 스켈레톤 UI 없음

**해결 방안:**
- 로딩 스피너 또는 스켈레톤 UI 추가

### 6.5 데이터 무결성 문제

#### 문제 11: 방 삭제 시 참가자 배정 정보 미처리
**현재 상태:**
- 방 삭제 시 해당 방에 배정된 참가자의 roomId/roomName이 그대로 유지됨
- 고아 참조(orphan reference) 발생

**해결 방안:**
```javascript
// DELETE rooms API 개선
export async function DELETE(req) {
  // ... 기존 코드

  // 해당 방에 배정된 참가자들의 roomId를 null로 업데이트
  const batch = adminDb.batch();
  for (const roomId of roomIds) {
    const participants = await adminDb
      .collection(collectionName)
      .where('roomId', '==', roomId)
      .get();

    participants.forEach(doc => {
      batch.update(doc.ref, { roomId: null, roomName: null });
    });

    batch.delete(adminDb.collection('rooms').doc(roomId));
  }
  await batch.commit();
}
```

#### 문제 12: 등록 기간 외 신청 가능
**현재 상태:**
- `openRegistration` 플래그가 클라이언트에서만 체크됨
- API에서 등록 기간/상태 검증 없음

**해결 방안:**
```javascript
// register API에 검증 추가
if (!settings.openRegistration) {
  return new NextResponse('등록이 마감되었습니다.', { status: 400 });
}
```

---

## 7. 권장 개선사항 우선순위

### 긴급 (보안)
1. 입력값 검증 (Zod 활용)
2. 등록 기간/상태 서버 검증
3. 방 삭제 시 참가자 배정 정보 처리

### 중요 (품질)
4. expectedToken() 함수 통합
5. 에러 처리 일관성 확보
6. 부분참석 날짜 검증 추가

### 개선 (성능/UX)
7. Firestore 쿼리 최적화
8. 로딩 상태 UI 개선
9. TypeScript 마이그레이션

### 장기 (확장성)
10. 인증 시스템 강화 (Firebase Auth/NextAuth)
11. 캐싱 시스템 도입
12. 에러 모니터링 도입

---

## 8. 결론

이 프로젝트는 Next.js와 Firebase를 활용한 이벤트 관리 시스템으로, 기본적인 기능은 잘 구현되어 있습니다. 하지만 보안, 입력 검증, 데이터 무결성 측면에서 개선이 필요합니다. 특히 서버 사이드 검증 강화와 방 삭제 시 참가자 배정 정보 처리가 우선적으로 수정되어야 합니다.
