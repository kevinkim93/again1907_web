# 스크립트 모음

## get-participants-data.js

파이어베이스 데이터베이스에서 숙박 인원과 집회 등록 인원 데이터를 가져오는 스크립트입니다.

### 기능

- 모든 폼의 참가자 데이터 조회
- 숙박 인원과 집회 등록 인원 구분
- 그룹 등록 처리 (대표자/구성원 구분)
- 금액 정보 (참가비, 숙박비, 총액)
- 통계 계산 및 콘솔 출력
- JSON 파일로 저장 옵션

### 사용법

#### 1. 기본 실행 (모든 폼 조회)

```bash
node scripts/get-participants-data.js
```

#### 2. 특정 폼만 조회

```bash
node scripts/get-participants-data.js --formId=form_1760377750717
```

#### 3. JSON 파일로 저장

```bash
node scripts/get-participants-data.js --output=participants-data.json
```

#### 4. 특정 폼 + JSON 저장

```bash
node scripts/get-participants-data.js --formId=form_1760377750717 --output=data.json
```

### 출력 형식

#### 콘솔 출력

```
============================================================
폼: 예배 및 식사 등록 (form_1760377750717)
============================================================

📊 통계
- 총 등록: 122건
- 총 집회 참가 인원: 269명
- 총 숙박 인원: 0명
- 총 참가비: ₩11,725,000
- 총 숙박비: ₩0
- 총 금액: ₩11,725,000
- 납부 완료: 102건 / 미납: 20건

📋 참가자 목록 (처음 10건)

1. 홍길동 (등록일: 2025-12-07)
   - 집회 인원: 3명 / 숙박 인원: 2명
   - 참가비: ₩150,000 / 숙박비: ₩80,000
   - 총액: ₩230,000 / 상태: 미납
   - 방 타입: 2인실
   - 그룹: 대표자 (그룹원 3명)
```

#### JSON 파일 구조

```json
{
  "exportedAt": "2025-01-01T12:00:00.000Z",
  "forms": [
    {
      "formId": "form_001",
      "formName": "예배 및 식사 등록",
      "stats": {
        "totalRegistrations": 122,
        "totalPeople": 269,
        "totalAccommodation": 0,
        "totalParticipationFee": 11725000,
        "totalAccommodationFee": 0,
        "totalAmount": 11725000,
        "paidCount": 102,
        "unpaidCount": 20
      },
      "participants": [
        {
          "id": "doc_id",
          "registeredAt": "2025-12-07",
          "paymentStatus": "paid",
          "totalPeople": 3,
          "accommodationPeople": 2,
          "participationFee": 150000,
          "accommodationFee": 80000,
          "totalAmount": 230000,
          "isGroupRegistration": true,
          "isRepresentative": true,
          "groupId": "group_...",
          "totalGroupMembers": 3,
          "roomType": "2인실",
          "dates": ["2025-01-20", "2025-01-21"],
          "accommodationDates": ["2025-01-20"],
          "formData": {
            "이름": "홍길동",
            "전화번호": "010-1234-5678"
          }
        }
      ]
    }
  ]
}
```

### 데이터 설명

#### 인원 정보
- `totalPeople`: 집회 참가 인원 (나이별 인원 합계)
- `accommodationPeople`: 숙박 인원 (실제 숙박하는 인원)

#### 금액 정보
- `participationFee`: 참가비 (amount.total)
- `accommodationFee`: 숙박비 (accommodationAmount.total)
- `totalAmount`: 총 납부 금액 (참가비 + 숙박비)

#### 그룹 정보
- `isGroupRegistration`: 그룹 등록 여부
- `isRepresentative`: 대표자 여부
- `groupId`: 그룹 ID
- `totalGroupMembers`: 그룹 총 인원

#### 통계 계산 규칙
- 그룹 구성원은 등록 건수에 포함되지 않음 (대표자만 카운트)
- 그룹 대표자의 경우 `totalGroupMembers`를 인원수로 사용
- 일반 등록자는 `totalPeople`을 인원수로 사용

### 요구사항

- Node.js 20 이상
- Firebase Admin SDK 설정 (.env.local에 환경 변수 필요)

### 환경 변수

스크립트는 `.env.local` 파일에서 다음 환경 변수를 읽습니다:

```
FIREBASE_SERVICE_ACCOUNT_KEY={"project_id":"...","private_key":"...","client_email":"..."}
```

또는

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```
