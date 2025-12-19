import { NextRequest, NextResponse } from "next/server";
import { getDB, generateId, now } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/posts/[id]/vote - 게시글 좋아요/싫어요
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const db = getDB();
    const body = await request.json() as { 
      user_id?: string; 
      vote_type?: string 
    };
    
    // TODO: 인증 확인
    const userId = body.user_id || "user_test1";
    const voteType = body.vote_type; // 'like' or 'dislike'
    
    // 입력 검증
    if (!voteType || !['like', 'dislike'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: "올바른 투표 유형을 선택해주세요." },
        { status: 400 }
      );
    }
    
    // 게시글 존재 확인
    const post = await db.prepare(
      "SELECT id, like_count, dislike_count FROM posts WHERE id = ?"
    ).bind(postId).first<{ id: string; like_count: number; dislike_count: number }>();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 기존 투표 확인
    const existingVote = await db.prepare(`
      SELECT id, vote_type FROM votes 
      WHERE user_id = ? AND target_type = 'post' AND target_id = ?
    `).bind(userId, postId).first<{ id: string; vote_type: string }>();
    
    let newLikeCount = post.like_count;
    let newDislikeCount = post.dislike_count;
    let action: 'added' | 'removed' | 'changed' = 'added';
    
    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // 같은 투표 취소
        await db.prepare(
          "DELETE FROM votes WHERE id = ?"
        ).bind(existingVote.id).run();
        
        if (voteType === 'like') {
          newLikeCount--;
        } else {
          newDislikeCount--;
        }
        action = 'removed';
      } else {
        // 다른 투표로 변경
        await db.prepare(
          "UPDATE votes SET vote_type = ?, created_at = ? WHERE id = ?"
        ).bind(voteType, now(), existingVote.id).run();
        
        if (voteType === 'like') {
          newLikeCount++;
          newDislikeCount--;
        } else {
          newLikeCount--;
          newDislikeCount++;
        }
        action = 'changed';
      }
    } else {
      // 새 투표 추가
      await db.prepare(`
        INSERT INTO votes (id, user_id, target_type, target_id, vote_type, created_at)
        VALUES (?, ?, 'post', ?, ?, ?)
      `).bind(generateId(), userId, postId, voteType, now()).run();
      
      if (voteType === 'like') {
        newLikeCount++;
      } else {
        newDislikeCount++;
      }
    }
    
    // 게시글 투표 수 업데이트
    await db.prepare(`
      UPDATE posts SET like_count = ?, dislike_count = ? WHERE id = ?
    `).bind(newLikeCount, newDislikeCount, postId).run();
    
    // HOT 게시글 판정 (좋아요 10개 이상)
    if (newLikeCount >= 10) {
      await db.prepare(
        "UPDATE posts SET is_hot = 1 WHERE id = ?"
      ).bind(postId).run();
    }
    
    const response: ApiResponse<{
      like_count: number;
      dislike_count: number;
      user_vote: string | null;
      action: string;
    }> = {
      success: true,
      data: {
        like_count: newLikeCount,
        dislike_count: newDislikeCount,
        user_vote: action === 'removed' ? null : voteType,
        action
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("POST /api/posts/[id]/vote error:", error);
    return NextResponse.json(
      { success: false, error: "투표 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/vote - 현재 사용자의 투표 상태 확인
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: postId } = await params;
    const db = getDB();
    const { searchParams } = new URL(request.url);
    
    // TODO: 인증에서 사용자 ID 가져오기
    const userId = searchParams.get("user_id") || "user_test1";
    
    const vote = await db.prepare(`
      SELECT vote_type FROM votes 
      WHERE user_id = ? AND target_type = 'post' AND target_id = ?
    `).bind(userId, postId).first<{ vote_type: string }>();
    
    return NextResponse.json({
      success: true,
      data: {
        user_vote: vote?.vote_type || null
      }
    });
    
  } catch (error) {
    console.error("GET /api/posts/[id]/vote error:", error);
    return NextResponse.json(
      { success: false, error: "투표 상태를 확인할 수 없습니다." },
      { status: 500 }
    );
  }
}
