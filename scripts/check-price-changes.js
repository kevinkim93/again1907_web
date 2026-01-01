/**
 * 가격 재계산 내역 확인 스크립트
 *
 * 사용법:
 *   node scripts/check-price-changes.js --formId=form_1760377750717
 */

// 환경 변수 로드
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
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

function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  if (typeof dateStr === 'object' && dateStr.toDate) {
    return dateStr.toDate().toISOString().split('T')[0];
  }
  return dateStr.split('T')[0];
}

async function main() {
  try {
    if (!options.formId) {
      console.error('❌ --formId 옵션이 필요합니다.');
      console.log('\n사용법: node scripts/check-price-changes.js --formId=form_1760377750717');
      process.exit(1);
    }

    const formId = options.formId;
    const collectionName = `participants_${formId}`;

    console.log('\n' + '='.repeat(70));
    console.log('가격 재계산 내역 확인');
    console.log('='.repeat(70));
    console.log(`폼 ID: ${formId}\n`);

    // 참가자 데이터 가져오기
    const snapshot = await adminDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log('참가자가 없습니다.\n');
      process.exit(0);
    }

    const participants = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      participants.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });

    // 최근 재계산된 참가자 찾기
    const recalculated = participants.filter(p => p.priceRecalculatedAt);
    const notRecalculated = participants.filter(p => !p.priceRecalculatedAt);

    console.log(`📊 전체 참가자: ${participants.length}명`);
    console.log(`✅ 재계산됨: ${recalculated.length}명`);
    console.log(`⏸️  재계산 안됨: ${notRecalculated.length}명`);

    if (recalculated.length === 0) {
      console.log('\n아직 가격 재계산을 실행하지 않았습니다.');
      console.log('폼 편집 페이지에서 "💰 가격 재계산" 버튼을 클릭하세요.\n');
      process.exit(0);
    }

    // 최근 재계산 시간
    const latestRecalculation = recalculated
      .map(p => new Date(p.priceRecalculatedAt))
      .sort((a, b) => b - a)[0];

    console.log(`\n⏰ 마지막 재계산: ${latestRecalculation.toLocaleString('ko-KR')}\n`);

    // 재계산된 참가자 목록 (최근 순)
    const sortedRecalculated = recalculated
      .sort((a, b) => new Date(b.priceRecalculatedAt) - new Date(a.priceRecalculatedAt))
      .slice(0, 20); // 최근 20명만

    console.log('='.repeat(70));
    console.log('재계산된 참가자 목록 (최근 20명)');
    console.log('='.repeat(70) + '\n');

    sortedRecalculated.forEach((p, idx) => {
      const name = p.field_1760378476899 || p.name || '이름 없음';
      const participationFee = p.amount?.total || 0;
      const accommodationFee = p.accommodationAmount?.total || 0;
      const totalAmount = participationFee + accommodationFee;
      const recalculatedAt = formatDate(p.priceRecalculatedAt);

      console.log(`${idx + 1}. ${name}`);
      console.log(`   재계산 시간: ${recalculatedAt}`);
      console.log(`   등록일: ${formatDate(p.registeredAt)}`);
      console.log(`   참가비: ${formatCurrency(participationFee)}`);

      if (accommodationFee > 0) {
        console.log(`   숙박비: ${formatCurrency(accommodationFee)}`);
      }

      console.log(`   총 금액: ${formatCurrency(totalAmount)}`);
      console.log(`   결제상태: ${p.paymentStatus === 'paid' ? '✅ 납부완료' : '⏳ 미납'}`);

      if (p.groupId) {
        console.log(`   그룹: ${p.isRepresentative ? '👤 대표자' : '👥 구성원'} (${p.groupId})`);
      }

      console.log('');
    });

    // 통계
    console.log('='.repeat(70));
    console.log('금액 통계 (재계산된 참가자 기준)');
    console.log('='.repeat(70) + '\n');

    const totalParticipationFee = recalculated.reduce((sum, p) => {
      if (p.groupId && !p.isRepresentative) return sum;
      return sum + (p.amount?.total || 0);
    }, 0);

    const totalAccommodationFee = recalculated.reduce((sum, p) => {
      if (p.groupId && !p.isRepresentative) return sum;
      return sum + (p.accommodationAmount?.total || 0);
    }, 0);

    const paidCount = recalculated.filter(p => {
      if (p.groupId && !p.isRepresentative) return false;
      return p.paymentStatus === 'paid';
    }).length;

    const unpaidCount = recalculated.filter(p => {
      if (p.groupId && !p.isRepresentative) return false;
      return p.paymentStatus === 'unpaid';
    }).length;

    console.log(`총 참가비: ${formatCurrency(totalParticipationFee)}`);
    console.log(`총 숙박비: ${formatCurrency(totalAccommodationFee)}`);
    console.log(`총 금액: ${formatCurrency(totalParticipationFee + totalAccommodationFee)}`);
    console.log(`\n납부 현황:`);
    console.log(`  ✅ 납부완료: ${paidCount}건`);
    console.log(`  ⏳ 미납: ${unpaidCount}건`);

    console.log('\n' + '='.repeat(70) + '\n');

    // 옵션: 상세 내역 JSON 저장
    if (options.output) {
      const outputPath = path.resolve(process.cwd(), options.output);
      const outputData = {
        formId,
        totalParticipants: participants.length,
        recalculated: recalculated.length,
        notRecalculated: notRecalculated.length,
        latestRecalculation: latestRecalculation.toISOString(),
        statistics: {
          totalParticipationFee,
          totalAccommodationFee,
          totalAmount: totalParticipationFee + totalAccommodationFee,
          paidCount,
          unpaidCount
        },
        participants: recalculated.map(p => ({
          id: p.id,
          name: p.field_1760378476899 || p.name || 'Unknown',
          registeredAt: formatDate(p.registeredAt),
          priceRecalculatedAt: p.priceRecalculatedAt,
          participationFee: p.amount?.total || 0,
          accommodationFee: p.accommodationAmount?.total || 0,
          totalAmount: (p.amount?.total || 0) + (p.accommodationAmount?.total || 0),
          paymentStatus: p.paymentStatus,
          isGroupRegistration: !!p.groupId,
          isRepresentative: p.isRepresentative || false
        }))
      };

      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
      console.log(`✅ 상세 내역이 ${outputPath} 파일로 저장되었습니다.\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

main();
