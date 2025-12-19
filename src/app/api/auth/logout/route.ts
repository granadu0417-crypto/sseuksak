import { NextResponse } from 'next/server';
import { deleteSession, getTokenFromRequest } from '@/lib/auth';
import type { ApiResponse } from '@/types';

// POST /api/auth/logout - 로그아웃
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json<ApiResponse<{ message: string }>>(
      {
        success: true,
        data: { message: '로그아웃되었습니다.' },
      },
      { status: 200 }
    );

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
