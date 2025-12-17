import { NextRequest, NextResponse } from "next/server";
import { getDB, generateId, now } from "@/lib/db";
import { verifyPassword, generateSessionToken } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

// POST /api/auth/login - 로그인
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json() as {
      nickname?: string;
      password?: string;
    };

    const { nickname, password } = body;

    // 입력 검증
    if (!nickname || !password) {
      return NextResponse.json(
        { success: false, error: "닉네임과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await db.prepare(
      "SELECT id, nickname, password_hash, level, role FROM users WHERE nickname = ?"
    ).bind(nickname.trim()).first<{
      id: string;
      nickname: string;
      password_hash: string;
      level: number;
      role: string;
    }>();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "닉네임 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "닉네임 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 세션 생성
    const sessionId = generateId();
    const sessionToken = generateSessionToken();
    const timestamp = now();

    // 세션 만료: 7일
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(sessionId, user.id, sessionToken, expiresAt, timestamp).run();

    // 마지막 로그인 시간 업데이트
    await db.prepare(
      "UPDATE users SET last_login_at = ? WHERE id = ?"
    ).bind(timestamp, user.id).run();

    // 응답 생성
    const response: ApiResponse<{
      user: { id: string; nickname: string; level: number; role: string };
    }> = {
      success: true,
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          level: user.level,
          role: user.role,
        },
      },
      message: "로그인되었습니다.",
    };

    // 쿠키에 세션 토큰 설정
    const res = NextResponse.json(response);
    res.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    return res;

  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "로그인에 실패했습니다." },
      { status: 500 }
    );
  }
}
