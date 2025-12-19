import { NextRequest, NextResponse } from "next/server";
import { getDB, generateId, now } from "@/lib/db";
import type { CommentWithAuthor, ApiResponse } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]/comments - 댓글 목록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const db = getDB();
    
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
    
    // 댓글 조회 (부모 댓글만)
    const comments = await db.prepare(`
      SELECT 
        c.*,
        u.nickname as author_nickname,
        u.avatar_url as author_avatar,
        u.level as author_level
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ? AND c.parent_id IS NULL AND c.is_deleted = 0
      ORDER BY c.created_at ASC
    `).bind(postId).all<CommentWithAuthor>();
    
    // 대댓글 조회
    const commentsWithReplies = await Promise.all(
      (comments.results || []).map(async (comment: CommentWithAuthor) => {
        const replies = await db.prepare(`
          SELECT 
            c.*,
            u.nickname as author_nickname,
            u.avatar_url as author_avatar,
            u.level as author_level
          FROM comments c
          LEFT JOIN users u ON c.author_id = u.id
          WHERE c.parent_id = ? AND c.is_deleted = 0
          ORDER BY c.created_at ASC
        `).bind(comment.id).all<CommentWithAuthor>();
        
        return {
          ...comment,
          replies: replies.results || []
        };
      })
    );
    
    const response: ApiResponse<CommentWithAuthor[]> = {
      success: true,
      data: commentsWithReplies
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { success: false, error: "댓글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - 댓글 작성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const db = getDB();
    const body = await request.json() as { 
      author_id?: string; 
      content?: string; 
      parent_id?: string 
    };
    
    // TODO: 인증 확인
    const authorId = body.author_id || "user_test1";
    
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
    
    const { content, parent_id } = body;
    
    // 입력 검증
    if (!content || content.trim().length < 1) {
      return NextResponse.json(
        { success: false, error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }
    
    if (content.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: "댓글은 1000자 이내로 작성해주세요." },
        { status: 400 }
      );
    }
    
    // 부모 댓글 확인 (대댓글인 경우)
    if (parent_id) {
      const parentComment = await db.prepare(
        "SELECT id, post_id FROM comments WHERE id = ? AND is_deleted = 0"
      ).bind(parent_id).first<{ id: string; post_id: string }>();
      
      if (!parentComment || parentComment.post_id !== postId) {
        return NextResponse.json(
          { success: false, error: "부모 댓글을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }
    
    // 댓글 생성
    const commentId = generateId();
    const timestamp = now();
    
    await db.prepare(`
      INSERT INTO comments (id, post_id, author_id, parent_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      commentId, 
      postId, 
      authorId, 
      parent_id || null, 
      content.trim(), 
      timestamp, 
      timestamp
    ).run();
    
    // 게시글 댓글 수 증가
    await db.prepare(
      "UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?"
    ).bind(postId).run();
    
    return NextResponse.json({
      success: true,
      data: { id: commentId },
      message: "댓글이 작성되었습니다."
    }, { status: 201 });
    
  } catch (error) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return NextResponse.json(
      { success: false, error: "댓글 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}
