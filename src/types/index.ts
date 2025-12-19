// 정치인 관련 타입
export interface Politician {
  id: string;
  name: string;
  party: string;
  region: string;
  position: string;
  imageUrl?: string;
  stats: PoliticianStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliticianStats {
  trustScore: number;      // 신뢰도 (0-100)
  activityScore: number;   // 활동성 (0-100)
  promiseRate: number;     // 공약 이행률 (0-100)
  attendanceRate: number;  // 출석률 (0-100)
  billsProposed: number;   // 발의 법안 수
  billsPassed: number;     // 통과 법안 수
}

// 정당 타입
export interface Party {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
  seats: number;
}

// 공약 타입
export interface Promise {
  id: string;
  politicianId: string;
  title: string;
  description: string;
  category: PromiseCategory;
  status: PromiseStatus;
  progress: number;
  startDate: Date;
  targetDate?: Date;
  evidence?: string[];
}

export type PromiseCategory =
  | 'economy'
  | 'welfare'
  | 'education'
  | 'environment'
  | 'security'
  | 'diplomacy'
  | 'culture'
  | 'infrastructure'
  | 'other';

export type PromiseStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'modified';

// 팩트체크 타입
export interface FactCheck {
  id: string;
  claim: string;
  claimSource: string;
  verdict: FactCheckVerdict;
  explanation: string;
  sources: string[];
  createdAt: Date;
  votes: {
    agree: number;
    disagree: number;
  };
}

export type FactCheckVerdict =
  | 'true'
  | 'mostly_true'
  | 'half_true'
  | 'mostly_false'
  | 'false'
  | 'unverifiable';

// 사용자 타입
export interface User {
  id: string;
  nickname: string;
  region?: string;
  level: number;
  exp: number;
  badges: Badge[];
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: Date;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
