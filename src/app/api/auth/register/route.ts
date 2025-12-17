import { NextRequest, NextResponse } from "next/server";
import { getDB, now } from "@/lib/db";
import {
  hashPassword,
  generateRecoveryCode,
  generateUserId,
  validateNickname,
  validatePassword,
} from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

// POST /api/auth/register - 회원가입
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json() as {
      nickname?: string;
      password?: string;
      passwordConfirm?: string;
    };

    const { nickname, password, passwordConfirm } = body;

    // 입력 검증
    if (!nickname || !password || !passwordConfirm) {
      return NextResponse.json(
        { success: false, error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 닉네임 유효성 검사
    const nicknameValidation = validateNickname(nickname);
    if (!nicknameValidation.valid) {
      return NextResponse.json(
        { success: false, error: nicknameValidation.error },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { success: false, error: "비밀번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 닉네임 중복 확인
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE nickname = ?"
    ).bind(nickname.trim()).first();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "이미 사용 중인 닉네임입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 복구 코드 생성
    const recoveryCode = generateRecoveryCode();
    const hashedRecoveryCode = await hashPassword(recoveryCode);

    // 사용자 생성
    const userId = generateUserId();
    const timestamp = now();

    await db.prepare(`
      INSERT INTO users (
        id, email, username, nickname, password_hash, recovery_code,
        level, exp, points, role, is_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      '', // email은 빈 값
      nickname.trim().toLowerCase(), // username
      nickname.trim(), // nickname
      hashedPassword,
      hashedRecoveryCode,
      1, // level
      0, // exp
      0, // points
      'user', // role
      0, // is_verified
      timestamp,
      timestamp
    ).run();

    const response: ApiResponse<{ userId: string; recoveryCode: string }> = {
      success: true,
      data: {
        userId,
        recoveryCode, // 한 번만 보여줌!
      },
      message: "회원가입이 완료되었습니다.",
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: "회원가입에 실패했습니다." },
      { status: 500 }
    );
  }
}
