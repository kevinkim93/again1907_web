import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { name, phone } = await req.json();

    if (!name || !phone) {
      return new NextResponse("이름과 전화번호가 필요합니다.", { status: 400 });
    }

    // settings에서 dbName 가져오기
    const settingsSnap = await adminDb.collection("settings").doc("current").get();
    const settings = settingsSnap.exists ? settingsSnap.data() : { dbName: "participants_default" };
    const collectionName = settings.dbName || "participants_default";

    // Firestore 조회
    const snap = await adminDb
      .collection(collectionName)
      .where("name", "==", name)
      .where("phone", "==", phone)
      .get();

    if (snap.empty) {
      return NextResponse.json({ participant: null });
    }

    const participant = { id: snap.docs[0].id, ...snap.docs[0].data() };

    return NextResponse.json({ participant });
  } catch (err) {
    console.error("조회 에러:", err);
    return new NextResponse("조회 실패", { status: 500 });
  }
}
