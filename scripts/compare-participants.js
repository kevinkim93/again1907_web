/**
 * 데이터베이스와 화면 인원 비교 스크립트
 *
 * 누락된 참가자를 찾고 원인을 분석합니다.
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

async function compareParticipants() {
  try {
    console.log('📊 참가자 데이터 비교 시작...\n');

    // Settings에서 폼 정보 가져오기
    const settingsSnap = await db.collection('settings').doc('current').get();
    if (!settingsSnap.exists) {
      console.error('❌ Settings not found');
      return;
    }

    const settings = settingsSnap.data();
    const forms = settings.forms || [];

    console.log(`📁 총 ${forms.length}개의 폼 발견\n`);

    let totalDB = 0;
    const allParticipants = [];
    const issuesByForm = {};

    // 각 폼별로 참가자 조회
    for (const form of forms) {
      const collectionName = `participants_${form.id}`;
      console.log(`🔍 폼: ${form.name} (${collectionName})`);

      const snapshot = await db.collection(collectionName).get();
      const formParticipants = [];

      // 이름 필드 찾기
      const nameField = form.fields?.find(f =>
        f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명'))
      );
      const phoneField = form.fields?.find(f => f.type === 'tel');

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const participant = {
          id: doc.id,
          formId: form.id,
          formName: form.name,
          name: nameField ? data[nameField.id] : null,
          phone: phoneField ? data[phoneField.id] : null,
          hasNameField: nameField ? !!data[nameField.id] : null,
          hasFormId: !!data.formId,
          hasRegisteredAt: !!data.registeredAt,
          registeredAt: data.registeredAt,
          groupId: data.groupId,
          isRepresentative: data.isRepresentative,
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          paymentStatus: data.paymentStatus,
        };

        formParticipants.push(participant);
        allParticipants.push(participant);
      });

      console.log(`   DB 인원: ${formParticipants.length}명`);
      totalDB += formParticipants.length;

      // 문제가 있는 참가자 찾기
      const issues = {
        missingName: formParticipants.filter(p => !p.hasNameField),
        missingFormId: formParticipants.filter(p => !p.hasFormId),
        missingRegisteredAt: formParticipants.filter(p => !p.hasRegisteredAt),
      };

      issuesByForm[form.id] = {
        formName: form.name,
        total: formParticipants.length,
        issues: issues,
      };

      if (issues.missingName.length > 0) {
        console.log(`   ⚠️  이름 필드 없음: ${issues.missingName.length}명`);
      }
      if (issues.missingFormId.length > 0) {
        console.log(`   ⚠️  formId 없음: ${issues.missingFormId.length}명`);
      }
      if (issues.missingRegisteredAt.length > 0) {
        console.log(`   ⚠️  registeredAt 없음: ${issues.missingRegisteredAt.length}명`);
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log(`\n📊 전체 DB 인원: ${totalDB}명\n`);
    console.log('='.repeat(80));
    console.log('\n');

    // 전체 문제 요약
    const allIssues = {
      missingName: allParticipants.filter(p => !p.hasNameField),
      missingFormId: allParticipants.filter(p => !p.hasFormId),
      missingRegisteredAt: allParticipants.filter(p => !p.hasRegisteredAt),
    };

    console.log('🔍 전체 문제 요약:\n');

    if (allIssues.missingName.length > 0) {
      console.log(`❌ 이름 필드가 없는 참가자: ${allIssues.missingName.length}명`);
      console.log('   → 이 사람들은 화면에 표시되지 않을 수 있습니다.');
      console.log('   → lookup 페이지에서 수정하면 해결됩니다.\n');
    }

    if (allIssues.missingFormId.length > 0) {
      console.log(`❌ formId가 없는 참가자: ${allIssues.missingFormId.length}명`);
      console.log('   → 이 사람들은 필터링될 수 있습니다.\n');
    }

    if (allIssues.missingRegisteredAt.length > 0) {
      console.log(`❌ registeredAt이 없는 참가자: ${allIssues.missingRegisteredAt.length}명`);
      console.log('   → 정렬 시 문제가 발생할 수 있습니다.\n');
    }

    // 화면에 표시되지 않을 가능성이 있는 참가자 수
    const problematicCount = new Set([
      ...allIssues.missingName.map(p => p.id),
      ...allIssues.missingFormId.map(p => p.id),
      ...allIssues.missingRegisteredAt.map(p => p.id),
    ]).size;

    console.log('='.repeat(80));
    console.log(`\n📊 예상 화면 표시 인원: ${totalDB - problematicCount}명`);
    console.log(`   (DB ${totalDB}명 - 문제 있는 참가자 ${problematicCount}명)\n`);
    console.log('='.repeat(80));
    console.log('\n');

    // 상세 목록 출력 (옵션)
    const printDetails = process.argv.includes('--details') || process.argv.includes('-d');

    if (printDetails && problematicCount > 0) {
      console.log('📋 문제 있는 참가자 상세 목록:\n');

      const problematicParticipants = allParticipants.filter(p =>
        !p.hasNameField || !p.hasFormId || !p.hasRegisteredAt
      );

      problematicParticipants.forEach((p, idx) => {
        console.log(`${idx + 1}. ID: ${p.id}`);
        console.log(`   폼: ${p.formName}`);
        console.log(`   전화번호: ${p.phone || '-'}`);

        const problems = [];
        if (!p.hasNameField) problems.push('이름 필드 없음');
        if (!p.hasFormId) problems.push('formId 없음');
        if (!p.hasRegisteredAt) problems.push('registeredAt 없음');

        console.log(`   문제: ${problems.join(', ')}`);

        if (p.groupId) {
          console.log(`   그룹: ${p.groupId} ${p.isRepresentative ? '(대표자)' : '(구성원)'}`);
        }
        if (p.roomNumber) {
          console.log(`   방: ${p.roomNumber}호 (${p.roomType})`);
        }

        console.log('');
      });
    } else if (problematicCount > 0) {
      console.log('💡 상세 목록을 보려면 --details 또는 -d 옵션을 추가하세요.');
      console.log('   예: node scripts/compare-participants.js --details\n');
    }

    // 해결 방법 안내
    if (problematicCount > 0) {
      console.log('🔧 해결 방법:\n');
      console.log('1. lookup 페이지에서 각 참가자를 조회하여 "수정하기" 클릭');
      console.log('   (아무것도 변경하지 않아도 됨 - 저장만 하면 필드가 자동으로 채워짐)');
      console.log('');
      console.log('2. 또는 Firebase Console에서 직접 누락된 필드 추가');
      console.log('   - 이름 필드: field_XXXXXXXXX');
      console.log('   - formId: form_XXXXXXXXX');
      console.log('   - registeredAt: YYYY-MM-DD 형식\n');
    } else {
      console.log('✅ 모든 참가자의 데이터가 정상입니다!\n');
    }

    console.log('✅ 완료\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// 실행
compareParticipants()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
