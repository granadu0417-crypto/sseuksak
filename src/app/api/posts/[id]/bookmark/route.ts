import { NextRequest, NextResponse } from "next/server";
import { getDB, generateId, now } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/posts/[id]/bookmark - 북마크 토글
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const db = getDB();
    const body = await request.json() as { user_id?: string };
    
    // TODO: 인증 확인
    const userId = body.user_id || "user_test1";
    
    // 게시글 존재 확인
    const post = await db.prepare(
      "SELECT id FROM posts WHERE id = ?"
    ).bind(postId).first();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 기존 북마크 확인
    const existing = await db.prepare(`
      SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?
    `).bind(userId, postId).first<{ id: string }>();
    
    let bookmarked: boolean;
    
    if (existing) {
      // 북마크 해제
      await db.prepare(
        "DELETE FROM bookmarks WHERE id = ?"
      ).bind(existing.id).run();
      bookmarked = false;
    } else {
      // 북마크 추가
      await db.prepare(`
        INSERT INTO bookmarks (id, user_id, post_id, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(generateId(), userId, postId, now()).run();
      bookmarked = true;
    }
    
    return NextResponse.json({
      success: true,
      data: { bookmarked },
      message: bookmarked ? "북마크에 추가되었습니다." : "북마크가 해제되었습니다."
    });
    
  } catch (error) {
    console.error("POST /api/posts/[id]/bookmark error:", error);
    return NextResponse.json(
      { success: false, error: "북마크 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/bookmark - 북마크 상태 확인
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const db = getDB();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get("user_id") || "user_test1";
    
    const bookmark = await db.prepare(`
      SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?
    `).bind(userId, postId).first();
    
    return NextResponse.json({
      success: true,
      data: { bookmarked: !!bookmark }
    });
    
  } catch (error) {
    console.error("GET /api/posts/[id]/bookmark error:", error);
    return NextResponse.json(
      { success: false, error: "북마크 상태를 확인할 수 없습니다." },
      { status: 500 }
    );
  }
}
