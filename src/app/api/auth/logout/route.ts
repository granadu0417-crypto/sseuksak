import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

// POST /api/auth/logout - 로그아웃
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const sessionToken = request.cookies.get('session_token')?.value;

    if (sessionToken) {
      // 세션 삭제
      await db.prepare(
        "DELETE FROM sessions WHERE token = ?"
      ).bind(sessionToken).run();
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "로그아웃되었습니다.",
    };

    const res = NextResponse.json(response);

    // 쿠키 삭제
    res.cookies.set('session_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return res;

  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json(
      { success: false, error: "로그아웃에 실패했습니다." },
      { status: 500 }
    );
  }
}
