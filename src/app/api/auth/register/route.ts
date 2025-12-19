import { NextResponse } from 'next/server';
import { getDB, generateId, now } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import type { ApiResponse } from '@/types';

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  nickname: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
    nickname: string;
  };
  token: string;
}

// POST /api/auth/register - 회원가입
export async function POST(request: Request) {
  try {
    const body = await request.json() as RegisterRequest;
    const { email, username, password, nickname } = body;

    // 필수 필드 검증
    if (!email || !username || !password || !nickname) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 사용자명 검증 (3-20자, 영문/숫자/언더스코어)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '사용자명은 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증 (8자 이상)
    if (password.length < 8) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 닉네임 검증 (2-20자)
    if (nickname.length < 2 || nickname.length > 20) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '닉네임은 2-20자여야 합니다.' },
        { status: 400 }
      );
    }

    const db = getDB();

    // 이메일 중복 확인
    const existingEmail = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingEmail) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 사용자명 중복 확인
    const existingUsername = await db.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind(username).first();

    if (existingUsername) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '이미 사용 중인 사용자명입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해시
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const userId = generateId();
    const timestamp = now();

    await db.prepare(`
      INSERT INTO users (id, email, username, password_hash, nickname, level, exp, points, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, 0, 100, 'user', 0, ?, ?)
    `).bind(userId, email, username, passwordHash, nickname, timestamp, timestamp).run();

    // 세션 생성
    const token = await createSession(userId);

    const response = NextResponse.json<ApiResponse<RegisterResponse>>(
      {
        success: true,
        data: {
          user: { id: userId, email, username, nickname },
          token,
        },
      },
      { status: 201 }
    );

    // 쿠키 설정 (7일)
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
