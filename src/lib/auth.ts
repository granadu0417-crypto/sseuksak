// 인증 관련 유틸리티 함수들

// 비밀번호 해싱 (Web Crypto API - Cloudflare Workers 호환)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // SHA-256 해시 생성
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // salt 추가 (간단한 방식)
  const salt = crypto.randomUUID().slice(0, 16);
  const saltedData = encoder.encode(salt + hashHex);
  const finalHashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const finalHashArray = Array.from(new Uint8Array(finalHashBuffer));
  const finalHashHex = finalHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${salt}:${finalHashHex}`;
}

// 비밀번호 검증
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // 원본 비밀번호의 SHA-256 해시
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // salt와 결합하여 최종 해시
  const saltedData = encoder.encode(salt + hashHex);
  const finalHashBuffer = await crypto.subtle.digest('SHA-256', saltedData);
  const finalHashArray = Array.from(new Uint8Array(finalHashBuffer));
  const finalHashHex = finalHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hash === finalHashHex;
}

// 복구 코드 생성 (XXXX-XXXX-XXXX 형식)
export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되는 문자 제외 (0, O, 1, I)
  const segments: string[] = [];

  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      segment += chars[randomIndex];
    }
    segments.push(segment);
  }

  return segments.join('-');
}

// 세션 토큰 생성
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// 사용자 ID 생성
export function generateUserId(): string {
  return `user_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

// 닉네임 유효성 검사
export function validateNickname(nickname: string): { valid: boolean; error?: string } {
  if (!nickname || nickname.trim().length < 2) {
    return { valid: false, error: '닉네임은 2자 이상이어야 합니다.' };
  }
  if (nickname.length > 20) {
    return { valid: false, error: '닉네임은 20자 이하여야 합니다.' };
  }
  // 한글, 영문, 숫자, 언더스코어만 허용
  const validPattern = /^[가-힣a-zA-Z0-9_]+$/;
  if (!validPattern.test(nickname)) {
    return { valid: false, error: '닉네임은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.' };
  }
  return { valid: true };
}

// 비밀번호 유효성 검사
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: '비밀번호는 8자 이상이어야 합니다.' };
  }
  if (password.length > 100) {
    return { valid: false, error: '비밀번호는 100자 이하여야 합니다.' };
  }
  return { valid: true };
}
