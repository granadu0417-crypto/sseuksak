import { NextResponse } from 'next/server';
import { requireAuth, SessionUser } from '@/lib/auth';
import { getDB } from '@/lib/db';
import type { ApiResponse } from '@/types';

interface UserProfile extends SessionUser {
  created_at: string;
  badges: Array<{
    type: string;
    name: string;
    earned_at: string;
  }>;
  prediction_stats: {
    total_predictions: number;
    correct_predictions: number;
    accuracy: number;
    current_streak: number;
    best_streak: number;
    rank: number;
  } | null;
}

// GET /api/auth/me - 현재 로그인 사용자 정보
export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const db = getDB();

    // 사용자 뱃지 조회
    const badgesResult = await db.prepare(`
      SELECT badge_type, badge_name, earned_at
      FROM user_badges WHERE user_id = ?
      ORDER BY earned_at DESC
    `).bind(user.id).all();

    const badges = badgesResult.results.map((b: Record<string, unknown>) => ({
      type: b.badge_type as string,
      name: b.badge_name as string,
      earned_at: b.earned_at as string,
    }));

    // 예측 통계 조회
    const predictionStats = await db.prepare(`
      SELECT total_predictions, correct_predictions, current_streak, best_streak, rank
      FROM user_prediction_stats WHERE user_id = ?
    `).bind(user.id).first();

    // 계정 생성일 조회
    const userDetails = await db.prepare(
      'SELECT created_at FROM users WHERE id = ?'
    ).bind(user.id).first();

    const profile: UserProfile = {
      ...user,
      created_at: userDetails?.created_at as string || '',
      badges,
      prediction_stats: predictionStats ? {
        total_predictions: predictionStats.total_predictions as number,
        correct_predictions: predictionStats.correct_predictions as number,
        accuracy: predictionStats.total_predictions
          ? Math.round((predictionStats.correct_predictions as number / (predictionStats.total_predictions as number)) * 100)
          : 0,
        current_streak: predictionStats.current_streak as number,
        best_streak: predictionStats.best_streak as number,
        rank: predictionStats.rank as number,
      } : null,
    };

    return NextResponse.json<ApiResponse<UserProfile>>(
      { success: true, data: profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/me - 프로필 수정
export async function PUT(request: Request) {
  try {
    const user = await requireAuth(request);

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json() as { nickname?: string; avatar_url?: string };
    const { nickname, avatar_url } = body;

    if (nickname !== undefined && (nickname.length < 2 || nickname.length > 20)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '닉네임은 2-20자여야 합니다.' },
        { status: 400 }
      );
    }

    const db = getDB();
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }

    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    updates.push("updated_at = datetime('now')");
    values.push(user.id);

    await db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    return NextResponse.json<ApiResponse<{ message: string }>>(
      { success: true, data: { message: '프로필이 수정되었습니다.' } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
