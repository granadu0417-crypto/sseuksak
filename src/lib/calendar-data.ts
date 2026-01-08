export type EventCategory = 'tax' | 'certification' | 'support' | 'insurance' | 'education';

export interface CalendarEvent {
  month: number;
  day?: number;
  endDay?: number;
  title: string;
  description: string;
  category: EventCategory;
  relatedPost?: string;
  important?: boolean;
}

export const categoryLabels: Record<EventCategory, string> = {
  tax: '세금',
  certification: '자격증',
  support: '지원금',
  insurance: '보험',
  education: '학사',
};

export const categoryColors: Record<EventCategory, { bg: string; text: string; border: string }> = {
  tax: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  certification: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  support: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  insurance: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  education: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

export const calendarEvents: CalendarEvent[] = [
  // 1월
  {
    month: 1,
    day: 15,
    title: '연말정산 간소화 서비스 오픈',
    description: '국세청 홈택스에서 소득/세액공제 자료 조회 가능',
    category: 'tax',
    relatedPost: 'year-end-tax-settlement-2026',
    important: true,
  },
  {
    month: 1,
    title: '자동차보험 갱신 시즌',
    description: '만기 전 3개 이상 보험사 비교견적 필수',
    category: 'insurance',
    relatedPost: 'car-insurance-renewal-guide-2026',
  },
  {
    month: 1,
    day: 26,
    title: '4분기 부가세 확정신고 마감',
    description: '개인/법인사업자 부가가치세 신고 기한 (1/25 일요일 → 1/26 연장)',
    category: 'tax',
    relatedPost: 'self-employed-tax-guide-2026',
  },

  // 1월 - 기사 1회 필기 원서접수 추가
  {
    month: 1,
    day: 12,
    endDay: 15,
    title: '기사/산업기사 1회 필기 원서접수',
    description: '기사/산업기사 1회 필기시험 접수 기간',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 1,
    day: 30,
    title: '기사/산업기사 1회 필기시험 시작',
    description: '1회 필기시험 시행 (1/30~3/3)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },

  // 2월
  {
    month: 3,
    day: 2,
    title: '연말정산 신고 마감',
    description: '근로소득자 연말정산 제출 기한 (2/28 토요일 → 3/2 연장)',
    category: 'tax',
    relatedPost: 'year-end-tax-settlement-2026',
    important: true,
  },

  // 3월
  {
    month: 3,
    day: 11,
    title: '기사/산업기사 1회 필기 합격자 발표',
    description: '1회 필기시험 합격예정자 발표',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 3,
    day: 23,
    endDay: 26,
    title: '기사/산업기사 1회 실기 원서접수',
    description: '1회 실기시험 접수 기간',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 3,
    day: 25,
    title: '1분기 부가세 예정신고 마감',
    description: '법인사업자 부가세 예정신고 기한',
    category: 'tax',
    relatedPost: 'self-employed-tax-guide-2026',
  },
  {
    month: 3,
    title: '청년내일저축계좌 상반기 모집',
    description: '근로소득 청년 대상 저축 지원사업',
    category: 'support',
    relatedPost: 'youth-policy-2026',
  },

  // 4월
  {
    month: 4,
    day: 18,
    title: '기사/산업기사 1회 실기시험 시작',
    description: '1회 실기시험 시행 (4/18~5/6)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 4,
    day: 20,
    endDay: 23,
    title: '기사/산업기사 2회 필기 원서접수',
    description: '2회 필기시험 접수 기간',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 4,
    title: '건강보험료 연말정산',
    description: '직장가입자 건강보험료 정산 (4월 급여에서 차감/환급)',
    category: 'insurance',
    relatedPost: 'health-insurance-premium-2026',
  },

  // 5월
  {
    month: 5,
    day: 9,
    title: '기사/산업기사 2회 필기시험 시작',
    description: '2회 필기시험 시행 (5/9~5/29)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 6,
    day: 1,
    title: '종합소득세 신고 마감',
    description: '개인사업자/프리랜서 종합소득세 신고 기한 (5/31 일요일 → 6/1 연장)',
    category: 'tax',
    relatedPost: 'self-employed-tax-guide-2026',
    important: true,
  },
  {
    month: 5,
    title: '근로장려금/자녀장려금 신청',
    description: '저소득 근로자 대상 장려금 정기 신청 기간',
    category: 'support',
  },

  // 6월
  {
    month: 6,
    day: 5,
    title: '기사/산업기사 1회 최종 합격자 발표',
    description: '1회 실기시험 최종 합격자 발표',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 6,
    day: 10,
    title: '기사/산업기사 2회 필기 합격자 발표',
    description: '2회 필기시험 합격예정자 발표',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 6,
    day: 22,
    endDay: 25,
    title: '기사/산업기사 2회 실기 원서접수',
    description: '2회 실기시험 접수 기간',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 6,
    title: '자동차세 1기분 납부',
    description: '상반기 자동차세 납부 기한 (6/16~6/30)',
    category: 'tax',
  },

  // 7월
  {
    month: 7,
    day: 18,
    title: '기사/산업기사 2회 실기시험 시작',
    description: '2회 실기시험 시행 (7/18~8/5)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 7,
    day: 20,
    endDay: 23,
    title: '기사/산업기사 3회 필기 원서접수',
    description: '3회 필기시험 접수 기간',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 7,
    day: 27,
    title: '2분기 부가세 확정신고 마감',
    description: '개인/법인사업자 부가가치세 확정신고 기한 (7/25 토요일 → 7/27 연장)',
    category: 'tax',
    relatedPost: 'self-employed-tax-guide-2026',
    important: true,
  },
  {
    month: 7,
    title: '재산세 1기분 납부',
    description: '주택/건축물 재산세 납부 기한 (7/16~7/31)',
    category: 'tax',
    relatedPost: 'real-estate-tax-guide-2026',
  },

  // 8월
  {
    month: 8,
    day: 7,
    title: '기사/산업기사 3회 필기시험 시작',
    description: '3회 필기시험 시행 (8/7~9/1)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 8,
    title: '청년 지원금 하반기 신청',
    description: '청년내일채움공제, 청년도약계좌 등 하반기 모집',
    category: 'support',
    relatedPost: 'youth-policy-2026',
  },

  // 9월
  {
    month: 9,
    day: 4,
    title: '기사/산업기사 2회 최종 합격자 발표',
    description: '2회 실기시험 최종 합격자 발표',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 9,
    day: 9,
    title: '기사/산업기사 3회 필기 합격자 발표',
    description: '3회 필기시험 합격예정자 발표',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 9,
    day: 21,
    endDay: 28,
    title: '기사/산업기사 3회 실기 원서접수',
    description: '3회 실기시험 접수 기간 (9/21~23, 9/28)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 9,
    title: '재산세 2기분 납부',
    description: '토지분 재산세 납부 기한 (9/16~9/30)',
    category: 'tax',
    relatedPost: 'real-estate-tax-guide-2026',
  },
  {
    month: 9,
    title: '독감 예방접종 시작',
    description: '고위험군/어르신 무료접종 시작',
    category: 'support',
    relatedPost: 'flu-vaccination-2026',
  },

  // 10월
  {
    month: 10,
    day: 24,
    title: '기사/산업기사 3회 실기시험 시작',
    description: '3회 실기시험 시행 (10/24~11/13)',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 10,
    day: 26,
    title: '3분기 부가세 예정신고 마감',
    description: '법인사업자 부가세 예정신고 기한 (10/25 일요일 → 10/26 연장)',
    category: 'tax',
    relatedPost: 'self-employed-tax-guide-2026',
  },

  // 11월
  {
    month: 11,
    day: 14,
    title: '대학수학능력시험',
    description: '2027학년도 수능 시험일',
    category: 'education',
    important: true,
  },
  {
    month: 11,
    title: '연말정산 미리보기 서비스',
    description: '국세청 연말정산 예상세액 미리 확인',
    category: 'tax',
    relatedPost: 'year-end-tax-settlement-2026',
  },

  // 12월
  {
    month: 12,
    day: 11,
    title: '기사/산업기사 3회 최종 합격자 발표',
    description: '3회 실기시험 최종 합격자 발표',
    category: 'certification',
    relatedPost: 'national-technical-exam-schedule-2026',
  },
  {
    month: 12,
    title: '연말정산 준비',
    description: '소득/세액공제 증빙자료 준비 시작',
    category: 'tax',
    relatedPost: 'year-end-tax-settlement-2026',
    important: true,
  },
  {
    month: 12,
    title: '자동차세 2기분 납부',
    description: '하반기 자동차세 납부 기한 (12/16~12/31)',
    category: 'tax',
  },
  {
    month: 12,
    title: '건강보험 피부양자 자격 점검',
    description: '소득/재산 요건 확인 및 자격 유지 점검',
    category: 'insurance',
    relatedPost: 'health-insurance-premium-2026',
  },
];

export function getEventsByMonth(month: number): CalendarEvent[] {
  return calendarEvents.filter((event) => event.month === month);
}

export function getEventsByCategory(category: EventCategory): CalendarEvent[] {
  return calendarEvents.filter((event) => event.category === category);
}

export function getAllCategories(): EventCategory[] {
  return ['tax', 'certification', 'support', 'insurance', 'education'];
}
