import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function expectedToken() {
  const pwd = process.env.ADMIN_PASSWORD || "1907";
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const password = body.password || "";

    if (password !== (process.env.ADMIN_PASSWORD || "1907")) {
      return new NextResponse("비밀번호가 올바르지 않습니다.", { status: 401 });
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const redirectUrl = `${protocol}://${host}/admin`;

    const res = NextResponse.redirect(redirectUrl);
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
