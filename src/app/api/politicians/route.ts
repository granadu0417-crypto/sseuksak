import { NextRequest, NextResponse } from "next/server";
import { getDB, paginate, validateSortField, ALLOWED_SORT_FIELDS } from "@/lib/db";
import type { PoliticianWithParty, ApiResponse, PaginatedResponse } from "@/lib/types";

// GET /api/politicians - 정치인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 파싱
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const partyId = searchParams.get("party");
    const region = searchParams.get("region");
    const search = searchParams.get("search");
    const trending = searchParams.get("trending");
    const sort = validateSortField(
      searchParams.get("sort") || "name",
      ALLOWED_SORT_FIELDS.politicians
    );
    const order = searchParams.get("order") === "desc" ? "DESC" : "ASC";

    const { offset } = paginate(page, limit);

    // WHERE 조건 구성
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (partyId && partyId !== "all") {
      conditions.push("pol.party_id = ?");
      params.push(partyId);
    }

    if (region && region !== "all") {
      conditions.push("pol.region = ?");
      params.push(region);
    }

    if (search) {
      conditions.push("(pol.name LIKE ? OR pol.region LIKE ? OR pol.position LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (trending === "true") {
      conditions.push("pol.is_trending = 1");
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM politicians pol
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // 정치인 목록 조회
    const query = `
      SELECT
        pol.*,
        p.name as party_name,
        p.color as party_color
      FROM politicians pol
      LEFT JOIN parties p ON pol.party_id = p.id
      ${whereClause}
      ORDER BY pol.${sort} ${order}
      LIMIT ? OFFSET ?
    `;

    const politicians = await db.prepare(query)
      .bind(...params, limit, offset)
      .all<PoliticianWithParty>();

    // 각 정치인의 태그 조회
    const politiciansWithTags = await Promise.all(
      (politicians.results || []).map(async (politician: PoliticianWithParty) => {
        const tagsResult = await db.prepare(
          "SELECT tag FROM politician_tags WHERE politician_id = ?"
        ).bind(politician.id).all<{ tag: string }>();

        return {
          ...politician,
          tags: (tagsResult.results || []).map((t: { tag: string }) => t.tag)
        };
      })
    );

    const response: ApiResponse<PaginatedResponse<PoliticianWithParty>> = {
      success: true,
      data: {
        items: politiciansWithTags,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/politicians error:", error);
    return NextResponse.json(
      { success: false, error: "정치인 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
