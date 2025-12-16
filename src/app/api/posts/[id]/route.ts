import { NextRequest, NextResponse } from "next/server";
import { getDB, now } from "@/lib/db";
import type { PostWithAuthor, ApiResponse } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id] - 게시글 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDB();
    
    // 게시글 조회
    const post = await db.prepare(`
      SELECT 
        p.*,
        u.nickname as author_nickname,
        u.avatar_url as author_avatar,
        u.level as author_level
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).bind(id).first<PostWithAuthor>();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 조회수 증가
    await db.prepare(
      "UPDATE posts SET view_count = view_count + 1 WHERE id = ?"
    ).bind(id).run();
    
    // 태그 조회
    const tagsResult = await db.prepare(
      "SELECT tag FROM post_tags WHERE post_id = ?"
    ).bind(id).all<{ tag: string }>();
    
    const response: ApiResponse<PostWithAuthor> = {
      success: true,
      data: {
        ...post,
        view_count: post.view_count + 1,
        tags: (tagsResult.results || []).map((t: { tag: string }) => t.tag)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "게시글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 게시글 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDB();
    const body = await request.json() as { 
      user_id?: string; 
      title?: string; 
      content?: string; 
      category?: string; 
      tags?: string[] 
    };
    
    // TODO: 인증 확인 및 작성자 검증
    const userId = body.user_id || "user_test1";
    
    // 게시글 존재 및 권한 확인
    const existingPost = await db.prepare(
      "SELECT author_id FROM posts WHERE id = ?"
    ).bind(id).first<{ author_id: string }>();
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { success: false, error: "수정 권한이 없습니다." },
        { status: 403 }
      );
    }
    
    const { title, content, category, tags } = body;
    
    // 입력 검증
    if (title && title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "제목은 2자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    
    if (content && content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "내용은 10자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    
    // 업데이트할 필드 구성
    const updates: string[] = ["updated_at = ?"];
    const values: (string | number)[] = [now()];
    
    if (title) {
      updates.push("title = ?");
      values.push(title.trim());
    }
    if (content) {
      updates.push("content = ?");
      values.push(content.trim());
    }
    if (category) {
      updates.push("category = ?");
      values.push(category);
    }
    
    values.push(id);
    
    await db.prepare(`
      UPDATE posts SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    
    // 태그 업데이트
    if (tags && Array.isArray(tags)) {
      // 기존 태그 삭제
      await db.prepare("DELETE FROM post_tags WHERE post_id = ?").bind(id).run();
      
      // 새 태그 추가
      const validTags = tags.slice(0, 5).filter(t => t && t.trim().length > 0);
      for (const tag of validTags) {
        await db.prepare(`
          INSERT INTO post_tags (id, post_id, tag)
          VALUES (?, ?, ?)
        `).bind(crypto.randomUUID(), id, tag.trim()).run();
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "게시글이 수정되었습니다."
    });
    
  } catch (error) {
    console.error("PUT /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "게시글 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 게시글 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDB();
    
    // TODO: 인증 확인
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || "user_test1";
    
    // 게시글 존재 및 권한 확인
    const existingPost = await db.prepare(
      "SELECT author_id FROM posts WHERE id = ?"
    ).bind(id).first<{ author_id: string }>();
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    if (existingPost.author_id !== userId) {
      return NextResponse.json(
        { success: false, error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }
    
    // 관련 데이터 삭제 (CASCADE 설정되어 있지만 명시적으로)
    await db.prepare("DELETE FROM post_tags WHERE post_id = ?").bind(id).run();
    await db.prepare("DELETE FROM comments WHERE post_id = ?").bind(id).run();
    await db.prepare("DELETE FROM votes WHERE target_type = 'post' AND target_id = ?").bind(id).run();
    await db.prepare("DELETE FROM bookmarks WHERE post_id = ?").bind(id).run();
    await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    
    return NextResponse.json({
      success: true,
      message: "게시글이 삭제되었습니다."
    });
    
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "게시글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
