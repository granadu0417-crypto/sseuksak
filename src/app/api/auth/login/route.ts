import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import type { ApiResponse } from '@/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    nickname: string;
    avatar_url: string | null;
    level: number;
    points: number;
    role: string;
  };
  token: string;
}

// POST /api/auth/login - 로그인
export async function POST(request: Request) {
  try {
    const body = await request.json() as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const db = getDB();

    const user = await db.prepare(`
      SELECT id, email, username, password_hash, nickname, avatar_url, level, exp, points, role, is_verified
      FROM users WHERE email = ?
    `).bind(email).first();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash as string);
    if (!isValid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 마지막 로그인 시간 업데이트
    await db.prepare(`
      UPDATE users SET last_login_at = datetime('now') WHERE id = ?
    `).bind(user.id).run();

    const token = await createSession(user.id as string);

    const response = NextResponse.json<ApiResponse<LoginResponse>>(
      {
        success: true,
        data: {
          user: {
            id: user.id as string,
            email: user.email as string,
            username: user.username as string,
            nickname: user.nickname as string,
            avatar_url: user.avatar_url as string | null,
            level: user.level as number,
            points: user.points as number,
            role: user.role as string,
          },
          token,
        },
      },
      { status: 200 }
    );

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
