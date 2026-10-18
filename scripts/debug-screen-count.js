/**
 * 화면 표시 인원 디버깅 스크립트
 *
 * 화면에서 보이는 346명과 DB 352명의 차이를 정확히 찾습니다.
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

async function debugScreenCount() {
  try {
    console.log('🔍 화면 표시 인원 디버깅 시작...\n');

    // 숙박 등록 폼 데이터 가져오기
    const collectionName = 'participants_form_1760381290629';
    const snapshot = await db.collection(collectionName).get();

    console.log(`📊 DB 총 인원: ${snapshot.size}명\n`);

    const allParticipants = [];
    const issues = {
      missingRequiredFields: [],
      hasIssues: []
    };

    // Settings에서 폼 정보 가져오기
    const settingsSnap = await db.collection('settings').doc('current').get();
    const settings = settingsSnap.data();
    const form = settings.forms.find(f => f.id === 'form_1760381290629');

    // 이름 필드 찾기
    const nameField = form.fields?.find(f =>
      f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명'))
    );

    console.log(`🔍 이름 필드 ID: ${nameField?.id}\n`);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const participant = {
        id: doc.id,
        name: nameField ? data[nameField.id] : null,
        hasName: nameField ? !!data[nameField.id] : false,
        hasFormId: !!data.formId,
        hasRegisteredAt: !!data.registeredAt,
        registeredAt: data.registeredAt,
        roomType: data.roomType,
        roomNumber: data.roomNumber,
        paymentStatus: data.paymentStatus,
        groupId: data.groupId,
        isRepresentative: data.isRepresentative,
        representativeName: data.representativeName,
      };

      allParticipants.push(participant);

      // 화면에 표시되지 않을 가능성이 있는 참가자
      const problemList = [];
      if (!participant.hasName) problemList.push('이름 없음');
      if (!participant.hasFormId) problemList.push('formId 없음');
      if (!participant.hasRegisteredAt) problemList.push('registeredAt 없음');

      if (problemList.length > 0) {
        issues.missingRequiredFields.push({
          ...participant,
          problems: problemList
        });
      }
    });

    console.log('📊 필드 누락 통계:\n');
    console.log(`   이름 없음: ${allParticipants.filter(p => !p.hasName).length}명`);
    console.log(`   formId 없음: ${allParticipants.filter(p => !p.hasFormId).length}명`);
    console.log(`   registeredAt 없음: ${allParticipants.filter(p => !p.hasRegisteredAt).length}명`);
    console.log('');

    // 화면 표시 가능한 참가자 (이름이 있는 경우만)
    const displayableParticipants = allParticipants.filter(p => p.hasName);

    console.log('='.repeat(80));
    console.log(`\n📺 화면 표시 가능 인원: ${displayableParticipants.length}명`);
    console.log(`❌ 화면 표시 불가 인원: ${allParticipants.length - displayableParticipants.length}명\n`);
    console.log('='.repeat(80));
    console.log('\n');

    // 표시되지 않는 참가자 상세
    if (issues.missingRequiredFields.length > 0) {
      console.log(`📋 화면에 표시되지 않는 참가자 (${issues.missingRequiredFields.length}명):\n`);

      issues.missingRequiredFields.forEach((p, idx) => {
        console.log(`${idx + 1}. ID: ${p.id}`);
        console.log(`   문제: ${p.problems.join(', ')}`);
        console.log(`   등록일: ${p.registeredAt || '없음'}`);
        console.log(`   방 타입: ${p.roomType || '없음'}`);
        console.log(`   방 번호: ${p.roomNumber || '없음'}`);
        if (p.groupId) {
          console.log(`   그룹: ${p.groupId} ${p.isRepresentative ? '(대표자)' : '(구성원)'}`);
        }
        if (p.representativeName) {
          console.log(`   대표자명: ${p.representativeName}`);
        }
        console.log('');
      });

      console.log('🔧 해결 방법:\n');
      console.log('1. lookup 페이지에서 각 참가자를 조회하여 "수정하기" 클릭');
      console.log('   (아무것도 변경하지 않아도 됨 - 저장만 하면 필드가 자동으로 채워짐)\n');
      console.log('2. 또는 Firebase Console에서 직접 누락된 필드 추가');
      console.log(`   - 이름 필드: ${nameField?.id}`);
      console.log('   - formId: form_1760381290629');
      console.log('   - registeredAt: YYYY-MM-DD 형식\n');
    } else {
      console.log('✅ 모든 참가자가 화면에 표시 가능합니다!\n');
    }

    // 방 배정 통계
    console.log('🏠 방 배정 통계:\n');
    const assigned = allParticipants.filter(p => p.roomNumber && p.roomNumber !== '미배정').length;
    console.log(`   배정 완료: ${assigned}명`);
    console.log(`   미배정: ${allParticipants.length - assigned}명\n`);

    console.log('✅ 완료\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// 실행
debugScreenCount()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
