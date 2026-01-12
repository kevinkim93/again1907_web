/**
 * groupId 필드 체크 스크립트
 *
 * groupId 필드가 없는 참가자를 찾습니다.
 */

const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin 초기화
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized\n');
  } catch (error) {
    console.error('❌ Error loading service account key:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function checkGroupId() {
  try {
    console.log('🔍 groupId 필드 체크 시작...\n');

    // 숙박 등록 폼 데이터 가져오기
    const collectionName = 'participants_form_1760381290629';
    const snapshot = await db.collection(collectionName).get();

    console.log(`📊 DB 총 인원: ${snapshot.size}명\n`);

    const withGroupId = [];
    const withoutGroupId = [];
    const groupIdNull = [];
    const groupIdEmpty = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();

      if (data.groupId === undefined) {
        withoutGroupId.push({
          id: doc.id,
          registeredAt: data.registeredAt,
          isRepresentative: data.isRepresentative,
        });
      } else if (data.groupId === null) {
        groupIdNull.push({
          id: doc.id,
          groupId: data.groupId,
          registeredAt: data.registeredAt,
        });
      } else if (data.groupId === '') {
        groupIdEmpty.push({
          id: doc.id,
          groupId: data.groupId,
          registeredAt: data.registeredAt,
        });
      } else {
        withGroupId.push({
          id: doc.id,
          groupId: data.groupId,
          registeredAt: data.registeredAt,
        });
      }
    });

    console.log('📊 groupId 필드 통계:\n');
    console.log(`   groupId가 있는 참가자: ${withGroupId.length}명`);
    console.log(`   groupId 필드 자체가 없음 (undefined): ${withoutGroupId.length}명`);
    console.log(`   groupId가 null: ${groupIdNull.length}명`);
    console.log(`   groupId가 빈 문자열: ${groupIdEmpty.length}명`);
    console.log('');

    const problematic = withoutGroupId.length + groupIdNull.length + groupIdEmpty.length;
    console.log('='.repeat(80));
    console.log(`\n🚨 문제될 수 있는 참가자: ${problematic}명`);
    console.log(`   (Firestore orderBy('groupId')는 groupId 필드가 없는 문서를 제외함)\n`);
    console.log('='.repeat(80));
    console.log('\n');

    if (problematic === 6) {
      console.log('✅ 정확히 6명 차이! 이것이 원인입니다.\n');
    }

    // 상세 목록
    if (withoutGroupId.length > 0) {
      console.log(`📋 groupId 필드가 없는 참가자 (${withoutGroupId.length}명):\n`);
      withoutGroupId.forEach((p, idx) => {
        console.log(`${idx + 1}. ID: ${p.id}`);
        console.log(`   등록일: ${p.registeredAt}`);
        console.log(`   isRepresentative: ${p.isRepresentative}`);
        console.log('');
      });
    }

    if (groupIdNull.length > 0) {
      console.log(`📋 groupId가 null인 참가자 (${groupIdNull.length}명):\n`);
      groupIdNull.forEach((p, idx) => {
        console.log(`${idx + 1}. ID: ${p.id}`);
        console.log(`   등록일: ${p.registeredAt}`);
        console.log('');
      });
    }

    if (groupIdEmpty.length > 0) {
      console.log(`📋 groupId가 빈 문자열인 참가자 (${groupIdEmpty.length}명):\n`);
      groupIdEmpty.forEach((p, idx) => {
        console.log(`${idx + 1}. ID: ${p.id}`);
        console.log(`   등록일: ${p.registeredAt}`);
        console.log('');
      });
    }

    console.log('🔧 해결 방법:\n');
    console.log('1. API 수정: orderBy 조건에서 groupId 필드가 없는 경우도 포함되도록 변경');
    console.log('   → 복합 정렬을 제거하거나, 클라이언트에서 정렬하도록 변경');
    console.log('');
    console.log('2. 데이터 수정: groupId가 없는 참가자에게 null 대신 빈 문자열 또는 특정 값 설정');
    console.log('   → 하지만 이는 데이터 일관성을 해칠 수 있음\n');

    console.log('✅ 완료\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// 실행
checkGroupId()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
