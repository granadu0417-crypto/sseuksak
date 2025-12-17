import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface UserInfo {
  id: string;
  nickname: string;
  avatar_url: string | null;
  level: number;
  exp: number;
  points: number;
  role: string;
  created_at: string;
}

// GET /api/auth/me - 현재 사용자 정보
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 세션 조회 및 유효성 검사
    const session = await db.prepare(`
      SELECT s.user_id, s.expires_at
      FROM sessions s
      WHERE s.token = ?
    `).bind(sessionToken).first<{ user_id: string; expires_at: string }>();

    if (!session) {
      const res = NextResponse.json(
        { success: false, error: "유효하지 않은 세션입니다." },
        { status: 401 }
      );
      // 잘못된 쿠키 삭제
      res.cookies.set('session_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    // 세션 만료 확인
    if (new Date(session.expires_at) < new Date()) {
      // 만료된 세션 삭제
      await db.prepare("DELETE FROM sessions WHERE token = ?").bind(sessionToken).run();

      const res = NextResponse.json(
        { success: false, error: "세션이 만료되었습니다. 다시 로그인해주세요." },
        { status: 401 }
      );
      res.cookies.set('session_token', '', { maxAge: 0, path: '/' });
      return res;
    }

    // 사용자 정보 조회
    const user = await db.prepare(`
      SELECT id, nickname, avatar_url, level, exp, points, role, created_at
      FROM users
      WHERE id = ?
    `).bind(session.user_id).first<UserInfo>();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const response: ApiResponse<{ user: UserInfo }> = {
      success: true,
      data: { user },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, error: "사용자 정보를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
