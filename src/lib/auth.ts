// 인증 관련 유틸리티
import { getDB, generateId, now } from './db';

// 세션 만료 시간 (7일)
const SESSION_EXPIRY_DAYS = 7;

// 비밀번호 해시 함수 (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'politica_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// 세션 토큰 생성
export function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + crypto.randomUUID();
}

// 세션 만료 시간 계산
export function getSessionExpiry(): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + SESSION_EXPIRY_DAYS);
  return expiry.toISOString().replace('T', ' ').slice(0, 19);
}

// 세션 생성
export async function createSession(userId: string): Promise<string> {
  const db = getDB();
  const sessionId = generateId();
  const token = generateSessionToken();
  const expiresAt = getSessionExpiry();

  await db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(sessionId, userId, token, expiresAt, now()).run();

  return token;
}

// 세션 검증 및 사용자 정보 반환
export async function validateSession(token: string): Promise<SessionUser | null> {
  const db = getDB();

  const result = await db.prepare(`
    SELECT
      u.id,
      u.email,
      u.username,
      u.nickname,
      u.avatar_url,
      u.level,
      u.exp,
      u.points,
      u.role,
      u.is_verified,
      s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).bind(token).first();

  if (!result) return null;

  // 만료 확인
  const expiresAt = new Date(result.expires_at as string);
  if (expiresAt < new Date()) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return null;
  }

  return {
    id: result.id as string,
    email: result.email as string,
    username: result.username as string,
    nickname: result.nickname as string,
    avatar_url: result.avatar_url as string | null,
    level: result.level as number,
    exp: result.exp as number,
    points: result.points as number,
    role: result.role as 'user' | 'moderator' | 'admin',
    is_verified: result.is_verified as number === 1,
  };
}

// 세션 삭제 (로그아웃)
export async function deleteSession(token: string): Promise<void> {
  const db = getDB();
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

// 세션 사용자 타입
export interface SessionUser {
  id: string;
  email: string;
  username: string;
  nickname: string;
  avatar_url: string | null;
  level: number;
  exp: number;
  points: number;
  role: 'user' | 'moderator' | 'admin';
  is_verified: boolean;
}

// 요청에서 세션 토큰 추출
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = request.headers.get('Cookie');
  if (cookies) {
    const match = cookies.match(/session_token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

// 인증 미들웨어 헬퍼
export async function requireAuth(request: Request): Promise<SessionUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return validateSession(token);
}

// 권한 확인
export function isAdmin(user: SessionUser): boolean {
  return user.role === 'admin';
}

export function isModerator(user: SessionUser): boolean {
  return user.role === 'admin' || user.role === 'moderator';
}
