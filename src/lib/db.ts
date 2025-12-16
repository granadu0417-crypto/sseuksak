import { getCloudflareContext } from "@opennextjs/cloudflare";

// D1 데이터베이스 인스턴스 가져오기
export function getDB(): D1Database {
  const ctx = getCloudflareContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx.env as any).DB as D1Database;
}

// UUID 생성 유틸리티
export function generateId(): string {
  return crypto.randomUUID();
}

// 현재 시간 (ISO 문자열)
export function now(): string {
  return new Date().toISOString();
}

// 페이지네이션 헬퍼
export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { offset, limit };
}

// SQL 인젝션 방지를 위한 허용된 정렬 필드
export const ALLOWED_SORT_FIELDS = {
  posts: ['created_at', 'view_count', 'like_count', 'comment_count'],
  politicians: ['name', 'attendance_rate', 'bill_count', 'approval_rating'],
} as const;

// 정렬 필드 검증
export function validateSortField(
  field: string, 
  allowedFields: readonly string[]
): string {
  return allowedFields.includes(field) ? field : allowedFields[0];
}
