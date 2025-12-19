// D1 데이터베이스 유틸리티
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB(): D1Database {
  const ctx = getCloudflareContext();
  return (ctx.env as any).DB as D1Database;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return { offset, limit };
}

// SQL 인젝션 방지를 위한 허용된 정렬 필드
export const ALLOWED_SORT_FIELDS = {
  posts: ['created_at', 'view_count', 'like_count', 'comment_count'],
  comments: ['created_at', 'like_count'],
  politicians: ['name', 'approval_rating', 'bill_count', 'attendance_rate'],
  factchecks: ['created_at', 'view_count', 'agree_count'],
  predictions: ['created_at', 'end_date', 'total_participants'],
} as const;

export function isValidSortField(table: keyof typeof ALLOWED_SORT_FIELDS, field: string): boolean {
  const fields = ALLOWED_SORT_FIELDS[table] as readonly string[];
  return fields.includes(field);
}
