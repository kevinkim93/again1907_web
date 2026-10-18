import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { name, phone } = await req.json();

    if (!name || !phone) {
      return new NextResponse("이름과 전화번호가 필요합니다.", { status: 400 });
    }

    // settings 가져오기
    const settingsSnap = await adminDb.collection("settings").doc("current").get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};

    // 모든 폼 목록 가져오기
    const forms = settings.forms || [];

    // 모든 폼에서 해당 사용자의 등록 내역 찾기
    const allRegistrations = [];

    for (const form of forms) {
      const collectionName = `participants_${form.id}`;

      // 이름 필드 찾기
      const nameField = form.fields?.find(f =>
        f.type === 'text' && (f.label?.includes('이름') || f.label?.includes('성명'))
      );

      // 전화번호 필드 찾기
      const phoneField = form.fields?.find(f => f.type === 'tel');

      if (!nameField || !phoneField) continue;

      // Firestore 조회 (전화번호로만 먼저 조회)
      const snap = await adminDb
        .collection(collectionName)
        .where(phoneField.id, "==", phone)
        .get();

      // 해당 폼에서 찾은 등록 내역 중 이름이 일치하는 것만 추가
      snap.docs.forEach(doc => {
        const data = doc.data();
        const storedName = data[nameField.id] || '';

        // " - 등록:" 문자열이 있으면 앞부분만 추출
        const actualName = storedName.includes(' - 등록:')
          ? storedName.split(' - 등록:')[0]
          : storedName;

        // 이름 비교 시 띄어쓰기 제거하여 비교 (예: "홍길동" == "홍 길동")
        const normalizedInput = name.replace(/\s/g, '');
        const normalizedStored = actualName.replace(/\s/g, '');

        // 이름이 일치하는 경우만 추가
        if (normalizedStored === normalizedInput) {
          allRegistrations.push({
            id: doc.id,
            ...data,
            formId: form.id,
            formName: form.name,
            formFields: form.fields, // 필드 정의 포함
            collectionName
          });
        }
      });
    }

    if (allRegistrations.length === 0) {
      return NextResponse.json({ registrations: [] });
    }

    return NextResponse.json({ registrations: allRegistrations, settings });
  } catch (err) {
    console.error("조회 에러:", err);
    return new NextResponse("조회 실패", { status: 500 });
  }
}
