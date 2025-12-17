import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import type { Party, ApiResponse } from "@/lib/types";

// GET /api/parties - 정당 목록 조회
export async function GET() {
  try {
    const db = getDB();

    const parties = await db.prepare(`
      SELECT id, name, short_name, color, logo_url, description, member_count
      FROM parties
      ORDER BY member_count DESC
    `).all<Party>();

    const response: ApiResponse<Party[]> = {
      success: true,
      data: parties.results || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/parties error:", error);
    return NextResponse.json(
      { success: false, error: "정당 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
