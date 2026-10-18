/**
 * 숙박 인원 출력 스크립트
 *
 * Firebase에서 숙박 정보가 있는 모든 참가자를 출력합니다.
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
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Error loading service account key:', error.message);
    console.error('   Please ensure serviceAccountKey.json exists in the project root');
    process.exit(1);
  }
}

const db = admin.firestore();

async function printAccommodationParticipants() {
  try {
    console.log('\n📋 숙박 인원 조회 시작...\n');

    // 모든 폼 가져오기
    const settingsSnap = await db.collection('settings').doc('current').get();
    if (!settingsSnap.exists) {
      console.error('❌ Settings not found');
      return;
    }

    const settings = settingsSnap.data();
    const forms = settings.forms || [];
    console.log(`📁 총 ${forms.length}개의 폼 발견\n`);

    let totalAccommodation = 0;
    let allAccommodationParticipants = [];

    // 각 폼별로 참가자 조회
    for (const form of forms) {
      const collectionName = `participants_${form.id}`;
      console.log(`🔍 폼: ${form.name} (${collectionName})`);

      const snapshot = await db.collection(collectionName).get();

      // 숙박 정보가 있는 참가자만 필터링
      const accommodationParticipants = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();

        // roomType이 있거나 accommodationDates가 있으면 숙박 참가자
        if (data.roomType || (data.accommodationDates && data.accommodationDates.length > 0)) {
          // 이름 필드 찾기
          const nameField = form.fields?.find(f =>
            f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명'))
          );
          const phoneField = form.fields?.find(f => f.type === 'tel');

          const participantInfo = {
            id: doc.id,
            formName: form.name,
            name: nameField ? data[nameField.id] : '이름 없음',
            phone: phoneField ? data[phoneField.id] : '',
            roomType: data.roomType || '미정',
            roomNumber: data.roomNumber || '미배정',
            roomName: data.roomName || '미배정',
            accommodationDates: data.accommodationDates || [],
            gender: data.gender || '미정',
            totalPeople: data.totalPeople || 1,
            paymentStatus: data.paymentStatus || 'unpaid',
            registeredAt: data.registeredAt || '',
            representativeName: data.representativeName || '',
            groupId: data.groupId || '',
          };

          accommodationParticipants.push(participantInfo);
        }
      });

      console.log(`   ✅ 숙박 인원: ${accommodationParticipants.length}명`);
      totalAccommodation += accommodationParticipants.length;
      allAccommodationParticipants.push(...accommodationParticipants);
    }

    console.log(`\n📊 총 숙박 인원: ${totalAccommodation}명\n`);
    console.log('='.repeat(100));
    console.log('\n');

    // 상세 정보 출력
    if (allAccommodationParticipants.length === 0) {
      console.log('숙박 인원이 없습니다.');
      return;
    }

    // --assigned 옵션: 방 배정된 사람만 필터링
    const assignedOnly = process.argv.includes('--assigned') || process.argv.includes('-a');
    let displayParticipants = allAccommodationParticipants;

    if (assignedOnly) {
      displayParticipants = allAccommodationParticipants.filter(p =>
        p.roomNumber && p.roomNumber !== '미배정'
      );
      console.log(`🏠 방 배정된 사람만 필터링: ${displayParticipants.length}명\n`);
      console.log('='.repeat(100));
      console.log('\n');

      if (displayParticipants.length === 0) {
        console.log('방 배정된 사람이 없습니다.');
        return;
      }
    }

    // 방 타입별로 그룹화 (필터링된 데이터 사용)
    const byRoomType = {};
    displayParticipants.forEach(p => {
      if (!byRoomType[p.roomType]) {
        byRoomType[p.roomType] = [];
      }
      byRoomType[p.roomType].push(p);
    });

    console.log('📊 방 타입별 통계:');
    Object.keys(byRoomType).forEach(roomType => {
      console.log(`   ${roomType}: ${byRoomType[roomType].length}명`);
    });
    console.log('\n');

    // 성별 통계 (단체실만)
    const dormitoryParticipants = displayParticipants.filter(p => p.roomType === '단체실');
    if (dormitoryParticipants.length > 0) {
      const maleCount = dormitoryParticipants.filter(p => p.gender === 'male').length;
      const femaleCount = dormitoryParticipants.filter(p => p.gender === 'female').length;
      const unknownCount = dormitoryParticipants.filter(p => !p.gender || p.gender === '미정').length;

      console.log('👥 단체실 성별 통계:');
      console.log(`   남: ${maleCount}명`);
      console.log(`   여: ${femaleCount}명`);
      if (unknownCount > 0) {
        console.log(`   미정: ${unknownCount}명`);
      }
      console.log('\n');
    }

    // 방 배정 통계 (전체 기준으로 유지)
    if (!assignedOnly) {
      const assigned = allAccommodationParticipants.filter(p => p.roomNumber && p.roomNumber !== '미배정').length;
      const unassigned = totalAccommodation - assigned;
      console.log('🏠 방 배정 통계:');
      console.log(`   배정 완료: ${assigned}명`);
      console.log(`   미배정: ${unassigned}명`);
      console.log('\n');
    }

    // 결제 통계 (필터링된 데이터 사용)
    const paid = displayParticipants.filter(p => p.paymentStatus === 'paid').length;
    const unpaid = displayParticipants.length - paid;
    console.log('💰 결제 통계:');
    console.log(`   납부완료: ${paid}명`);
    console.log(`   미납: ${unpaid}명`);
    console.log('\n');

    console.log('='.repeat(100));
    console.log('\n');

    // 상세 목록 출력 (옵션)
    const printDetails = process.argv.includes('--details') || process.argv.includes('-d');

    if (printDetails) {
      console.log('📋 상세 목록:\n');

      // 방 번호로 정렬
      displayParticipants.sort((a, b) => {
        if (a.roomNumber === '미배정' && b.roomNumber !== '미배정') return 1;
        if (a.roomNumber !== '미배정' && b.roomNumber === '미배정') return -1;
        if (a.roomNumber === '미배정' && b.roomNumber === '미배정') return 0;
        return parseInt(a.roomNumber) - parseInt(b.roomNumber);
      });

      displayParticipants.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`);
        console.log(`   폼: ${p.formName}`);
        console.log(`   연락처: ${p.phone || '-'}`);
        console.log(`   방 타입: ${p.roomType}`);
        console.log(`   방 번호: ${p.roomNumber}`);
        if (p.roomType === '단체실') {
          console.log(`   성별: ${p.gender === 'male' ? '남' : p.gender === 'female' ? '여' : '미정'}`);
        }
        console.log(`   숙박 날짜: ${p.accommodationDates.join(', ')}`);
        console.log(`   인원: ${p.totalPeople}명`);
        console.log(`   결제: ${p.paymentStatus === 'paid' ? '완료' : '미납'}`);
        if (p.representativeName) {
          console.log(`   대표자: ${p.representativeName}`);
        }
        console.log('');
      });
    } else {
      console.log('💡 상세 목록을 보려면 --details 또는 -d 옵션을 추가하세요.');
      console.log('   예: node scripts/print-accommodation.js --details');
      if (!assignedOnly) {
        console.log('\n💡 방 배정된 사람만 보려면 --assigned 또는 -a 옵션을 추가하세요.');
        console.log('   예: node scripts/print-accommodation.js --assigned');
        console.log('   예: node scripts/print-accommodation.js --assigned --details');
      }
      console.log('');
    }

    console.log('✅ 완료\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// 실행
printAccommodationParticipants()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
