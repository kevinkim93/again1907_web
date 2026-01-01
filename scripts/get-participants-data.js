/**
 * 파이어베이스에서 숙박 및 집회 등록 인원 데이터 가져오기 스크립트
 *
 * 사용법:
 *   node scripts/get-participants-data.js
 *   node scripts/get-participants-data.js --formId=form_001
 *   node scripts/get-participants-data.js --output=participants-data.json
 */

// 환경 변수 로드 (Next.js 없이 독립 실행)
const fs = require('fs');
const path = require('path');

// .env.local 파일 수동 로드
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // 따옴표 제거
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
}

const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// 커맨드라인 인자 파싱
const args = process.argv.slice(2);
const options = {};
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value || true;
  }
});

// Firebase Admin 초기화
let adminDb;
if (getApps().length) {
  adminDb = getFirestore(getApps()[0]);
} else {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

  const app = initializeApp({
    credential: cert(serviceAccount),
    project_id: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
  });

  adminDb = getFirestore(app);
}

// 금액 포맷팅 함수
function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
}

// 날짜 포맷팅 함수
function formatDate(dateStr) {
  if (!dateStr) return '-';
  if (typeof dateStr === 'object' && dateStr.toDate) {
    return dateStr.toDate().toISOString().split('T')[0];
  }
  return dateStr;
}

// 폼 목록 가져오기
async function getForms() {
  const doc = await adminDb.collection('settings').doc('current').get();
  const settings = doc.exists ? doc.data() : {};
  return settings.forms || [];
}

// 참가자 데이터 가져오기
async function getParticipants(formId) {
  const collectionName = `participants_${formId}`;
  const snapshot = await adminDb.collection(collectionName).get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate()?.toISOString() || data.createdAt || null,
    };
  });
}

// 참가자 데이터 가공
function processParticipant(participant, formFields) {
  // 기본 정보
  const result = {
    id: participant.id,
    registeredAt: formatDate(participant.registeredAt || participant.createdAt),
    paymentStatus: participant.paymentStatus || 'unpaid',
  };

  // 인원 정보
  result.totalPeople = participant.totalPeople || 1;
  result.accommodationPeople = participant.accommodationAmount?.peopleCount || 0;

  // 금액 정보
  const participationFee = participant.amount?.total || 0;
  const accommodationFee = participant.accommodationAmount?.total || 0;

  result.participationFee = participationFee;
  result.accommodationFee = accommodationFee;
  result.totalAmount = participationFee + accommodationFee;

  // 그룹 정보
  result.isGroupRegistration = !!participant.groupId;
  result.isRepresentative = participant.isRepresentative || false;
  result.groupId = participant.groupId || null;
  result.totalGroupMembers = participant.totalGroupMembers || 0;

  // 기타 정보
  result.roomType = participant.roomType || null;

  // 날짜 정보 (payment-calculator 또는 accommodation-calculator에서)
  const paymentField = formFields?.find(f => f.type === 'payment-calculator');
  const accomField = formFields?.find(f => f.type === 'accommodation-calculator');

  if (paymentField) {
    result.dates = participant[`${paymentField.id}_dates`] || participant.partialDates || [];
  }

  if (accomField) {
    result.accommodationDates = participant[`${accomField.id}_dates`] || [];
  }

  // 폼 데이터 (동적 필드)
  result.formData = {};
  formFields?.forEach(field => {
    const value = participant[field.id];
    if (value !== undefined && value !== null) {
      // payment-calculator, accommodation-calculator 관련 필드는 제외
      if (!field.id.includes('_dates') &&
          !field.id.includes('_free') &&
          !field.id.includes('_totalAmount') &&
          !field.id.includes('_roomType') &&
          !field.id.includes('_roomOptions') &&
          !field.id.includes('_mealOptions')) {
        result.formData[field.label || field.id] = value;
      }
    }
  });

  return result;
}

// 통계 계산
function calculateStats(participants) {
  const stats = {
    totalRegistrations: 0,
    totalPeople: 0,
    totalAccommodation: 0,
    totalParticipationFee: 0,
    totalAccommodationFee: 0,
    totalAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
  };

  participants.forEach(p => {
    // 그룹 구성원은 제외 (대표자만 카운트)
    if (p.groupId && !p.isRepresentative) {
      return;
    }

    stats.totalRegistrations++;

    // 그룹 대표자는 totalGroupMembers 사용, 아니면 totalPeople 사용
    const peopleCount = p.isRepresentative && p.totalGroupMembers
      ? p.totalGroupMembers
      : p.totalPeople;

    stats.totalPeople += peopleCount;
    stats.totalAccommodation += p.accommodationPeople || 0;
    stats.totalParticipationFee += p.participationFee;
    stats.totalAccommodationFee += p.accommodationFee;
    stats.totalAmount += p.totalAmount;

    if (p.paymentStatus === 'paid') {
      stats.paidCount++;
    } else {
      stats.unpaidCount++;
    }
  });

  return stats;
}

// 콘솔에 출력
function printResults(formsData) {
  console.log('\n' + '='.repeat(60));
  console.log('파이어베이스 참가자 데이터 조회 결과');
  console.log('='.repeat(60) + '\n');

  formsData.forEach(formData => {
    console.log('='.repeat(60));
    console.log(`폼: ${formData.formName} (${formData.formId})`);
    console.log('='.repeat(60));

    const stats = formData.stats;
    console.log('\n📊 통계');
    console.log(`- 총 등록: ${stats.totalRegistrations}건`);
    console.log(`- 총 집회 참가 인원: ${stats.totalPeople}명`);
    console.log(`- 총 숙박 인원: ${stats.totalAccommodation}명`);
    console.log(`- 총 참가비: ${formatCurrency(stats.totalParticipationFee)}`);
    console.log(`- 총 숙박비: ${formatCurrency(stats.totalAccommodationFee)}`);
    console.log(`- 총 금액: ${formatCurrency(stats.totalAmount)}`);
    console.log(`- 납부 완료: ${stats.paidCount}건 / 미납: ${stats.unpaidCount}건`);

    console.log('\n📋 참가자 목록 (처음 10건)\n');

    formData.participants.slice(0, 10).forEach((p, idx) => {
      const name = p.formData['이름'] || p.formData['성명'] || p.formData['대표자 이름'] || '이름 없음';

      console.log(`${idx + 1}. ${name} (등록일: ${p.registeredAt})`);
      console.log(`   - 집회 인원: ${p.totalPeople}명 / 숙박 인원: ${p.accommodationPeople}명`);
      console.log(`   - 참가비: ${formatCurrency(p.participationFee)} / 숙박비: ${formatCurrency(p.accommodationFee)}`);
      console.log(`   - 총액: ${formatCurrency(p.totalAmount)} / 상태: ${p.paymentStatus === 'paid' ? '납부완료' : '미납'}`);

      if (p.roomType) {
        console.log(`   - 방 타입: ${p.roomType}`);
      }

      if (p.isGroupRegistration) {
        const groupInfo = p.isRepresentative
          ? `대표자 (그룹원 ${p.totalGroupMembers}명)`
          : `구성원 (그룹 ID: ${p.groupId})`;
        console.log(`   - 그룹: ${groupInfo}`);
      }

      console.log('');
    });

    if (formData.participants.length > 10) {
      console.log(`... 외 ${formData.participants.length - 10}건\n`);
    }
  });

  console.log('='.repeat(60) + '\n');
}

// 메인 실행 함수
async function main() {
  try {
    console.log('📥 데이터 가져오는 중...\n');

    // 폼 목록 가져오기
    const forms = await getForms();

    // 특정 폼만 조회하는 경우
    const targetForms = options.formId
      ? forms.filter(f => f.id === options.formId)
      : forms;

    if (targetForms.length === 0) {
      console.error('❌ 폼을 찾을 수 없습니다.');
      process.exit(1);
    }

    // 각 폼별 데이터 수집
    const results = [];

    for (const form of targetForms) {
      console.log(`📋 ${form.name} (${form.id}) 데이터 수집 중...`);

      const participants = await getParticipants(form.id);
      const processedParticipants = participants.map(p => processParticipant(p, form.fields));
      const stats = calculateStats(processedParticipants);

      results.push({
        formId: form.id,
        formName: form.name,
        stats,
        participants: processedParticipants,
      });
    }

    // 결과 출력
    printResults(results);

    // JSON 파일로 저장 옵션
    if (options.output) {
      const outputPath = path.resolve(process.cwd(), options.output);
      const outputData = {
        exportedAt: new Date().toISOString(),
        forms: results,
      };

      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
      console.log(`✅ 데이터가 ${outputPath} 파일로 저장되었습니다.\n`);
    }

    console.log('✅ 완료!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
