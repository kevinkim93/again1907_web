/**
 * 폼의 가격 설정 정보 조회 스크립트
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

async function main() {
  try {
    // 폼 설정 가져오기
    const doc = await adminDb.collection('settings').doc('current').get();
    const settings = doc.exists ? doc.data() : {};
    const forms = settings.forms || [];

    console.log('\n' + '='.repeat(60));
    console.log('폼 가격 설정 정보');
    console.log('='.repeat(60) + '\n');

    forms.forEach(form => {
      console.log(`\n폼: ${form.name} (${form.id})`);
      console.log('-'.repeat(60));

      // payment-calculator 필드 찾기
      const paymentField = form.fields?.find(f => f.type === 'payment-calculator');

      if (paymentField) {
        console.log('\n📊 참가비 설정:');
        console.log('  필드 ID:', paymentField.id);

        // 1차 등록 가격
        if (paymentField.pricing?.phase1) {
          console.log('\n  ✅ 1차 등록 (마감:', paymentField.phase1Deadline || '미설정', ')');

          // 전체 참석 가격
          if (paymentField.pricing.phase1.full) {
            console.log('    [전체 참석]');
            console.log('      - 성인 (만 19세 이상):', paymentField.pricing.phase1.full.adult?.toLocaleString() || 0, '원');
            console.log('      - 청소년 (만 8-18세):', paymentField.pricing.phase1.full.minor8plus?.toLocaleString() || 0, '원');
            console.log('      - 어린이 (만 8세 미만):', paymentField.pricing.phase1.full.minorUnder8?.toLocaleString() || 0, '원');
          }

          // 날짜별 가격
          if (paymentField.pricing.phase1.perDate) {
            console.log('    [부분 참석 - 날짜별 가격]');
            Object.entries(paymentField.pricing.phase1.perDate).forEach(([date, prices]) => {
              console.log(`      ${date}:`);
              console.log('        - 성인:', prices.adult?.toLocaleString() || 0, '원');
              console.log('        - 청소년:', prices.minor8plus?.toLocaleString() || 0, '원');
              console.log('        - 어린이:', prices.minorUnder8?.toLocaleString() || 0, '원');
            });
          }
        }

        // 2차 등록 가격
        if (paymentField.pricing?.phase2) {
          console.log('\n  ✅ 2차 등록');

          // 전체 참석 가격
          if (paymentField.pricing.phase2.full) {
            console.log('    [전체 참석]');
            console.log('      - 성인 (만 19세 이상):', paymentField.pricing.phase2.full.adult?.toLocaleString() || 0, '원');
            console.log('      - 청소년 (만 8-18세):', paymentField.pricing.phase2.full.minor8plus?.toLocaleString() || 0, '원');
            console.log('      - 어린이 (만 8세 미만):', paymentField.pricing.phase2.full.minorUnder8?.toLocaleString() || 0, '원');
          }

          // 날짜별 가격
          if (paymentField.pricing.phase2.perDate) {
            console.log('    [부분 참석 - 날짜별 가격]');
            Object.entries(paymentField.pricing.phase2.perDate).forEach(([date, prices]) => {
              console.log(`      ${date}:`);
              console.log('        - 성인:', prices.adult?.toLocaleString() || 0, '원');
              console.log('        - 청소년:', prices.minor8plus?.toLocaleString() || 0, '원');
              console.log('        - 어린이:', prices.minorUnder8?.toLocaleString() || 0, '원');
            });
          }
        }
      } else {
        console.log('\n  ℹ️  참가비 계산 필드 없음');
      }

      // accommodation-calculator 필드 찾기
      const accomField = form.fields?.find(f => f.type === 'accommodation-calculator');

      if (accomField) {
        console.log('\n\n🏠 숙박비 설정:');
        console.log('  필드 ID:', accomField.id);

        // 1차 등록 가격
        if (accomField.accommodationPricing?.phase1) {
          console.log('\n  ✅ 1차 등록 (마감:', accomField.phase1Deadline || '미설정', ')');
          Object.entries(accomField.accommodationPricing.phase1).forEach(([roomType, price]) => {
            console.log(`    ${roomType}: ${price?.toLocaleString() || 0}원 / 박`);
          });
        }

        // 2차 등록 가격
        if (accomField.accommodationPricing?.phase2) {
          console.log('\n  ✅ 2차 등록');
          Object.entries(accomField.accommodationPricing.phase2).forEach(([roomType, price]) => {
            console.log(`    ${roomType}: ${price?.toLocaleString() || 0}원 / 박`);
          });
        }
      } else {
        console.log('\n  ℹ️  숙박비 계산 필드 없음');
      }

      console.log('\n');
    });

    console.log('='.repeat(60) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

main();
