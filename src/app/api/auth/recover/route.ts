import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  generateRecoveryCode,
  validatePassword,
} from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

// POST /api/auth/recover - 복구 코드로 비밀번호 재설정
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json() as {
      nickname?: string;
      recoveryCode?: string;
      newPassword?: string;
      newPasswordConfirm?: string;
    };

    const { nickname, recoveryCode, newPassword, newPasswordConfirm } = body;

    // 입력 검증
    if (!nickname || !recoveryCode || !newPassword || !newPasswordConfirm) {
      return NextResponse.json(
        { success: false, error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // 비밀번호 확인
    if (newPassword !== newPasswordConfirm) {
      return NextResponse.json(
        { success: false, error: "새 비밀번호가 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await db.prepare(
      "SELECT id, recovery_code FROM users WHERE nickname = ?"
    ).bind(nickname.trim()).first<{ id: string; recovery_code: string | null }>();

    if (!user || !user.recovery_code) {
      return NextResponse.json(
        { success: false, error: "닉네임 또는 복구 코드가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 복구 코드 검증
    const normalizedCode = recoveryCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formattedCode = normalizedCode.match(/.{1,4}/g)?.join('-') || normalizedCode;

    const isValidCode = await verifyPassword(formattedCode, user.recovery_code);
    if (!isValidCode) {
      return NextResponse.json(
        { success: false, error: "닉네임 또는 복구 코드가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 새 비밀번호 해싱
    const newHashedPassword = await hashPassword(newPassword);

    // 새 복구 코드 생성 (기존 코드는 무효화)
    const newRecoveryCode = generateRecoveryCode();
    const newHashedRecoveryCode = await hashPassword(newRecoveryCode);

    // 비밀번호 및 복구 코드 업데이트
    await db.prepare(`
      UPDATE users
      SET password_hash = ?, recovery_code = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newHashedPassword, newHashedRecoveryCode, user.id).run();

    // 기존 세션 모두 삭제 (보안)
    await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id).run();

    const response: ApiResponse<{ newRecoveryCode: string }> = {
      success: true,
      data: {
        newRecoveryCode, // 새 복구 코드 (한 번만 보여줌!)
      },
      message: "비밀번호가 재설정되었습니다. 새 복구 코드를 안전하게 보관하세요.",
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("POST /api/auth/recover error:", error);
    return NextResponse.json(
      { success: false, error: "비밀번호 재설정에 실패했습니다." },
      { status: 500 }
    );
  }
}
