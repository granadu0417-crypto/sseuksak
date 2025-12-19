import { NextRequest, NextResponse } from "next/server";
import { getDB, generateId, now, paginate, validateSortField, ALLOWED_SORT_FIELDS } from "@/lib/db";
import type { PostWithAuthor, ApiResponse, PaginatedResponse } from "@/lib/types";

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = validateSortField(
      searchParams.get("sort") || "created_at",
      ALLOWED_SORT_FIELDS.posts
    );
    const order = searchParams.get("order") === "asc" ? "ASC" : "DESC";
    
    const { offset } = paginate(page, limit);
    
    // WHERE 조건 구성
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    
    if (category && category !== "all") {
      conditions.push("p.category = ?");
      params.push(category);
    }
    
    if (search) {
      conditions.push("(p.title LIKE ? OR p.content LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(" AND ")}` 
      : "";
    
    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM posts p 
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // 게시글 목록 조회
    const query = `
      SELECT 
        p.*,
        u.nickname as author_nickname,
        u.avatar_url as author_avatar,
        u.level as author_level
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.is_pinned DESC, p.${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    
    const posts = await db.prepare(query)
      .bind(...params, limit, offset)
      .all<PostWithAuthor>();
    
    // 각 게시글의 태그 조회
    const postsWithTags = await Promise.all(
      (posts.results || []).map(async (post: PostWithAuthor) => {
        const tagsResult = await db.prepare(
          "SELECT tag FROM post_tags WHERE post_id = ?"
        ).bind(post.id).all<{ tag: string }>();
        
        return {
          ...post,
          tags: (tagsResult.results || []).map((t: { tag: string }) => t.tag)
        };
      })
    );
    
    const response: ApiResponse<PaginatedResponse<PostWithAuthor>> = {
      success: true,
      data: {
        items: postsWithTags,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { success: false, error: "게시글 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/posts - 게시글 작성
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const body = await request.json() as { 
      author_id?: string; 
      title?: string; 
      content?: string; 
      category?: string; 
      tags?: string[] 
    };
    
    // TODO: 인증 확인 (임시로 테스트 유저 사용)
    const authorId = body.author_id || "user_test1";
    
    // 입력 검증
    const { title, content, category, tags } = body;
    
    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "제목은 2자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    
    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "내용은 10자 이상이어야 합니다." },
        { status: 400 }
      );
    }
    
    const validCategories = ["free", "debate", "info", "humor"];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: "올바른 카테고리를 선택해주세요." },
        { status: 400 }
      );
    }
    
    // 게시글 생성
    const postId = generateId();
    const timestamp = now();
    
    await db.prepare(`
      INSERT INTO posts (id, author_id, category, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(postId, authorId, category, title.trim(), content.trim(), timestamp, timestamp).run();
    
    // 태그 저장 (최대 5개)
    if (tags && Array.isArray(tags)) {
      const validTags = tags.slice(0, 5).filter(t => t && t.trim().length > 0);
      for (const tag of validTags) {
        await db.prepare(`
          INSERT INTO post_tags (id, post_id, tag)
          VALUES (?, ?, ?)
        `).bind(generateId(), postId, tag.trim()).run();
      }
    }
    
    return NextResponse.json({
      success: true,
      data: { id: postId },
      message: "게시글이 작성되었습니다."
    }, { status: 201 });
    
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { success: false, error: "게시글 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}
