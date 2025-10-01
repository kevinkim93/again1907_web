import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || "1907";
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

export async function POST(req) {
  try {
    let password = "";

    // formData 시도
    try {
      const formData = await req.formData();
      password = formData.get("password") || "";
    } catch (err) {
      console.error("⚠️ formData 파싱 실패, JSON 시도:", err);
      const body = await req.json().catch(() => ({}));
      password = body.password || "";
    }

    if (password !== (process.env.ADMIN_PASSWORD || "1907")) {
      return new NextResponse("비밀번호가 올바르지 않습니다.", { status: 401 });
    }

    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const redirectUrl = `${proto}://${host}/admin`;

    const res = NextResponse.redirect(new URL('/admin/dashboard', req.url));
    res.cookies.set('admin_token', expectedToken(), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
    });
return res;
  } catch (err) {
    console.error("🔥 로그인 라우트 에러:", err);
    return new NextResponse("서버 에러", { status: 500 });
  }
}
