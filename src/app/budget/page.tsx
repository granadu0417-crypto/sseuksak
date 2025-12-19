'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Dialog 제거 - 아코디언 형태로 변경
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Users,
  Leaf,
  Music,
  Lightbulb,
  GraduationCap,
  Car,
  Shield,
  Briefcase,
  Home,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  UserCheck,
  Target,
  ChevronRight,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

// 세부 사업 데이터
import budgetDetails from '@/data/budget-details.json';

// 표준 분류 코드 시스템
import {
  inferSectionCode,
  SECTION_CODES,
  FIELD_CODES,
  type SectionCode,
} from '@/lib/budget-classification';

// 검증된 매핑 시스템
import {
  verifyBudgetItemMatch,
  getAllVerifiedMappings,
  getAllRejectedMappings,
  getBudgetItemInfo,
} from '@/lib/verified-budget-matcher';

// 카테고리 코드 → 한글 매핑
const categoryCodeToName: Record<string, string> = {
  WELFARE: '복지',
  ADMIN: '행정/인건비',
  ENVIRONMENT: '환경/청소',
  CULTURE: '문화체육',
  HOUSING: '주거/도시',
  ECONOMY: '경제/일자리',
  EDUCATION: '교육',
  TRAFFIC: '교통/도로',
  SAFETY: '안전/방재',
  SMART: '스마트/혁신',
};

const categoryNameToCode: Record<string, string> = {
  '복지': 'WELFARE',
  '행정/인건비': 'ADMIN',
  '환경/청소': 'ENVIRONMENT',
  '문화체육': 'CULTURE',
  '주거/도시': 'HOUSING',
  '경제/일자리': 'ECONOMY',
  '교육': 'EDUCATION',
  '교통/도로': 'TRAFFIC',
  '안전/방재': 'SAFETY',
  '스마트/혁신': 'SMART',
};

// 분석 데이터 (SQLite에서 추출한 실제 데이터)
const budgetData = {
  성동구: {
    code: '11040',
    totalBudget: 741400000000,
    totalExpenditure: 144400000000,
    executionRate: 19.5,
    projectCount: 993,
    population: 280000,
    perCapita: 2647868,
    subsidyRatio: 53,
    categories: [
      { name: '복지', icon: Users, amount: 433800000000, color: 'bg-green-500', code: 'WELFARE' },
      { name: '행정/인건비', icon: Building2, amount: 244600000000, color: 'bg-gray-500', code: 'ADMIN' },
      { name: '환경/청소', icon: Leaf, amount: 66100000000, color: 'bg-blue-500', code: 'ENVIRONMENT' },
      { name: '문화체육', icon: Music, amount: 40500000000, color: 'bg-purple-500', code: 'CULTURE' },
      { name: '주거/도시', icon: Home, amount: 30300000000, color: 'bg-amber-500', code: 'HOUSING' },
      { name: '경제/일자리', icon: Briefcase, amount: 27200000000, color: 'bg-cyan-500', code: 'ECONOMY' },
      { name: '교육', icon: GraduationCap, amount: 17300000000, color: 'bg-indigo-500', code: 'EDUCATION' },
      { name: '교통/도로', icon: Car, amount: 15400000000, color: 'bg-orange-500', code: 'TRAFFIC' },
      { name: '안전/방재', icon: Shield, amount: 7900000000, color: 'bg-red-500', code: 'SAFETY' },
      { name: '스마트/혁신', icon: Lightbulb, amount: 5400000000, color: 'bg-yellow-500', code: 'SMART' },
    ],
    highlights: [
      { title: '성동 4차산업혁명체험센터 운영', amount: 2030000000 },
      { title: '성동형 공유오피스 건립', amount: 1670000000 },
      { title: '성동형 스마트쉼터 운영', amount: 620000000 },
      { title: '스마트도시 통합운영센터 운영', amount: 1140000000 },
    ],
  },
  마포구: {
    code: '11140',
    totalBudget: 813400000000,
    totalExpenditure: 157900000000,
    executionRate: 19.4,
    projectCount: 818,
    population: 370000,
    perCapita: 2198422,
    subsidyRatio: 65,
    categories: [
      { name: '복지', icon: Users, amount: 502800000000, color: 'bg-green-500', code: 'WELFARE' },
      { name: '행정/인건비', icon: Building2, amount: 256600000000, color: 'bg-gray-500', code: 'ADMIN' },
      { name: '환경/청소', icon: Leaf, amount: 51700000000, color: 'bg-blue-500', code: 'ENVIRONMENT' },
      { name: '주거/도시', icon: Home, amount: 43600000000, color: 'bg-amber-500', code: 'HOUSING' },
      { name: '경제/일자리', icon: Briefcase, amount: 28300000000, color: 'bg-cyan-500', code: 'ECONOMY' },
      { name: '문화체육', icon: Music, amount: 26200000000, color: 'bg-purple-500', code: 'CULTURE' },
      { name: '교육', icon: GraduationCap, amount: 20400000000, color: 'bg-indigo-500', code: 'EDUCATION' },
      { name: '교통/도로', icon: Car, amount: 11100000000, color: 'bg-orange-500', code: 'TRAFFIC' },
      { name: '안전/방재', icon: Shield, amount: 5300000000, color: 'bg-red-500', code: 'SAFETY' },
      { name: '스마트/혁신', icon: Lightbulb, amount: 500000000, color: 'bg-yellow-500', code: 'SMART' },
    ],
    highlights: [
      { title: '서대문문화체육시설 운영', amount: 4700000000 },
      { title: '문화타운 재개발 추진', amount: 1440000000 },
      { title: '다양한 문화생활 제공', amount: 1280000000 },
      { title: '스마트인프라구축 및 운영', amount: 290000000 },
    ],
  },
};

// 비교 인사이트
const insights = [
  {
    title: '스마트/혁신 투자',
    description: '성동구가 마포구보다 10배 이상 투자',
    winner: '성동구',
    diff: '+49억',
    icon: Lightbulb,
  },
  {
    title: '문화체육 예산',
    description: '성동구가 마포구보다 약 2배 투자',
    winner: '성동구',
    diff: '+143억',
    icon: Music,
  },
  {
    title: '1인당 예산',
    description: '인구 대비 예산 효율성',
    winner: '성동구',
    diff: '+45만원',
    icon: Users,
  },
  {
    title: '복지 예산',
    description: '마포구가 복지에 더 집중',
    winner: '마포구',
    diff: '+690억',
    icon: Users,
  },
];

function formatBillion(amount: number): string {
  const billion = amount / 100000000;
  if (billion >= 1) {
    return `${billion.toLocaleString(undefined, { maximumFractionDigits: 0 })}억`;
  }
  return `${(amount / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만`;
}

function formatMillion(amount: number): string {
  return `${(amount / 10000).toLocaleString()}만`;
}

// 비율 포맷 (소수점 2자리까지, 0.01% 미만은 <0.01%로 표시)
function formatPercent(amount: number, total: number): string {
  if (amount === 0) return '-';
  const percent = (amount / total) * 100;
  if (percent < 0.01) return '<0.01%';
  if (percent < 0.1) return `${percent.toFixed(2)}%`;
  if (percent < 1) return `${percent.toFixed(1)}%`;
  return `${percent.toFixed(1)}%`;
}

// 비율 데이터 계산
function calculateRatioData() {
  const sd = budgetData['성동구'];
  const mp = budgetData['마포구'];

  return sd.categories.map((cat) => {
    const mpCat = mp.categories.find((c) => c.name === cat.name);
    const mpAmount = mpCat?.amount || 0;

    const sdRatio = (cat.amount / sd.totalBudget) * 100;
    const mpRatio = (mpAmount / mp.totalBudget) * 100;

    return {
      name: cat.name,
      icon: cat.icon,
      code: cat.code,
      sdRatio: Math.round(sdRatio * 10) / 10,
      mpRatio: Math.round(mpRatio * 10) / 10,
      sdAmount: cat.amount,
      mpAmount: mpAmount,
      ratioDiff: Math.round((sdRatio - mpRatio) * 10) / 10,
    };
  });
}

// 1인당 데이터 계산
function calculatePerCapitaData() {
  const sd = budgetData['성동구'];
  const mp = budgetData['마포구'];

  return sd.categories.map((cat) => {
    const mpCat = mp.categories.find((c) => c.name === cat.name);
    const mpAmount = mpCat?.amount || 0;

    const sdPerCapita = cat.amount / sd.population;
    const mpPerCapita = mpAmount / mp.population;

    return {
      name: cat.name,
      icon: cat.icon,
      code: cat.code,
      sdPerCapita: Math.round(sdPerCapita),
      mpPerCapita: Math.round(mpPerCapita),
      diff: Math.round(sdPerCapita - mpPerCapita),
      diffPercent: Math.round(((sdPerCapita - mpPerCapita) / mpPerCapita) * 100),
    };
  });
}

// 레이더 차트용 데이터 (행정/인건비 포함 8개)
function getRadarData() {
  const ratioData = calculateRatioData();
  // 주요 8개 카테고리 (복지+행정 제외하면 의미 없으므로 포함)
  const mainCategories = ['복지', '행정/인건비', '환경/청소', '문화체육', '교육', '스마트/혁신', '경제/일자리', '안전/방재'];

  return ratioData
    .filter((d) => mainCategories.includes(d.name))
    .map((d) => ({
      category: d.name,
      성동구: d.sdRatio,
      마포구: d.mpRatio,
    }));
}

// 매칭 신뢰도 타입
type MatchConfidence = 'high' | 'medium' | 'low' | 'none';

interface BudgetComparisonItem {
  name: string;
  sdBudget: number;
  mpBudget: number;
  mpName: string | null;
  matchConfidence: MatchConfidence;
  sectionCode: SectionCode | null;
  sectionName: string;
}

// 부문별 그룹 인터페이스
interface BudgetSectionGroup {
  sectionCode: SectionCode | null;
  sectionName: string;
  sdTotal: number;
  mpTotal: number;
  items: BudgetComparisonItem[];
}

// 비대칭 분류된 비교 데이터 (양쪽 모두 / 한쪽만)
interface CategorizedBudgetComparison {
  // 양쪽 모두 있는 항목 (정확한 비교 가능)
  bothSides: BudgetComparisonItem[];
  bothSidesTotal: { sd: number; mp: number };
  // 성동구에만 있는 항목
  sdOnly: BudgetComparisonItem[];
  sdOnlyTotal: number;
  // 마포구에만 있는 항목
  mpOnly: BudgetComparisonItem[];
  mpOnlyTotal: number;
}

/**
 * 향상된 세부 사업 비교 데이터 가져오기
 * 표준 분류 코드 기반 매칭 → 키워드 매칭 → 미매칭 순으로 처리
 */
function getDetailComparison(categoryCode: string): BudgetComparisonItem[] {
  const sdDetails = (budgetDetails as any)['성동구'][categoryCode] || [];
  const mpDetails = (budgetDetails as any)['마포구'][categoryCode] || [];

  // 마포구 항목별 부문코드 미리 계산
  const mpItemsWithCode = mpDetails.map((mp: any) => ({
    ...mp,
    ...inferSectionCode(mp.name),
  }));

  // 이미 매칭된 마포구 항목 추적
  const matchedMpNames = new Set<string>();

  // 성동구 기준으로 비교 데이터 생성
  const comparison: BudgetComparisonItem[] = sdDetails.map((sd: any) => {
    const sdCodeResult = inferSectionCode(sd.name);
    let matchedMp: any = null;
    let matchConfidence: MatchConfidence = 'none';

    // 1차: 부문코드 매칭 (가장 신뢰도 높음)
    if (sdCodeResult.code) {
      // 같은 부문코드를 가진 마포구 항목 찾기 (아직 매칭되지 않은 것 중)
      const codeMatches = mpItemsWithCode.filter(
        (mp: any) => mp.code === sdCodeResult.code && !matchedMpNames.has(mp.name)
      );

      if (codeMatches.length > 0) {
        // 부문코드가 같은 항목 중 이름이 가장 비슷한 것 선택
        matchedMp = codeMatches.reduce((best: any, curr: any) => {
          const bestSimilarity = getNameSimilarity(sd.name, best.name);
          const currSimilarity = getNameSimilarity(sd.name, curr.name);
          return currSimilarity > bestSimilarity ? curr : best;
        });

        // 신뢰도 결정: 부문코드 일치 + 이름 유사도
        const nameSimilarity = getNameSimilarity(sd.name, matchedMp.name);
        if (sdCodeResult.confidence >= 0.7 && nameSimilarity >= 0.5) {
          matchConfidence = 'high';
        } else if (sdCodeResult.confidence >= 0.4 || nameSimilarity >= 0.3) {
          matchConfidence = 'medium';
        } else {
          matchConfidence = 'low';
        }
      }
    }

    // 2차: 키워드 매칭 (부문코드 매칭 실패 시)
    if (!matchedMp) {
      const keywords = sd.name
        .replace(/\(.*?\)/g, '')
        .split(/[\s,]+/)
        .filter((w: string) => w.length > 1);

      const keywordMatch = mpDetails.find(
        (m: any) =>
          !matchedMpNames.has(m.name) &&
          keywords.some((kw: string) => m.name.includes(kw))
      );

      if (keywordMatch) {
        matchedMp = keywordMatch;
        matchConfidence = 'low'; // 키워드만으로 매칭은 낮은 신뢰도
      }
    }

    // 매칭된 항목 기록
    if (matchedMp) {
      matchedMpNames.add(matchedMp.name);
    }

    return {
      name: sd.name.replace(/\(보조\).*/, '').trim(),
      sdBudget: sd.budget,
      mpBudget: matchedMp?.budget || 0,
      mpName: matchedMp?.name || null,
      matchConfidence,
      sectionCode: sdCodeResult.code,
      sectionName: sdCodeResult.code
        ? SECTION_CODES[sdCodeResult.code].name
        : '미분류',
    };
  });

  // 마포구에만 있는 사업 추가
  mpDetails.forEach((mp: any) => {
    if (!matchedMpNames.has(mp.name)) {
      const mpCodeResult = inferSectionCode(mp.name);
      comparison.push({
        name: mp.name.replace(/\(보조\).*/, '').trim(),
        sdBudget: 0,
        mpBudget: mp.budget,
        mpName: mp.name,
        matchConfidence: 'none',
        sectionCode: mpCodeResult.code,
        sectionName: mpCodeResult.code
          ? SECTION_CODES[mpCodeResult.code].name
          : '미분류',
      });
    }
  });

  return comparison
    .sort((a, b) => b.sdBudget + b.mpBudget - (a.sdBudget + a.mpBudget))
    .slice(0, 12);
}

/**
 * 두 이름의 유사도 계산 (0-1)
 * 공통 키워드 비율 기반
 */
function getNameSimilarity(name1: string, name2: string): number {
  const clean1 = name1.replace(/\(.*?\)/g, '').toLowerCase();
  const clean2 = name2.replace(/\(.*?\)/g, '').toLowerCase();

  const words1 = new Set(clean1.split(/[\s,]+/).filter((w) => w.length > 1));
  const words2 = new Set(clean2.split(/[\s,]+/).filter((w) => w.length > 1));

  if (words1.size === 0 || words2.size === 0) return 0;

  let commonCount = 0;
  for (const word of words1) {
    if (words2.has(word)) commonCount++;
  }

  return commonCount / Math.max(words1.size, words2.size);
}

/**
 * 매칭 신뢰도에 따른 아이콘과 색상
 */
function getMatchIndicator(confidence: MatchConfidence) {
  switch (confidence) {
    case 'high':
      return { icon: CheckCircle2, color: 'text-green-400', label: '정확' };
    case 'medium':
      return { icon: HelpCircle, color: 'text-yellow-400', label: '추정' };
    case 'low':
      return { icon: AlertCircle, color: 'text-orange-400', label: '불확실' };
    case 'none':
    default:
      return { icon: Minus, color: 'text-zinc-500', label: '미매칭' };
  }
}

/**
 * 비대칭 분류된 세부 사업 비교 데이터
 * 양쪽 모두 있는 항목 / 성동만 / 마포만 분리
 */
function getCategorizedDetailComparison(categoryCode: string): CategorizedBudgetComparison {
  const sdDetails = (budgetDetails as any)['성동구'][categoryCode] || [];
  const mpDetails = (budgetDetails as any)['마포구'][categoryCode] || [];

  const bothSides: BudgetComparisonItem[] = [];
  const sdOnly: BudgetComparisonItem[] = [];
  const mpOnly: BudgetComparisonItem[] = [];

  // 마포구 항목별 부문코드 미리 계산
  const mpItemsWithCode = mpDetails.map((mp: any) => ({
    ...mp,
    ...inferSectionCode(mp.name),
    matched: false,
  }));

  // 성동구 기준으로 매칭 시도
  sdDetails.forEach((sd: any) => {
    const sdCodeResult = inferSectionCode(sd.name);
    let matchedMp: any = null;
    let matchConfidence: MatchConfidence = 'none';

    // 1. 검증된 매핑 확인
    const verifiedInfo = getBudgetItemInfo(sd.name);

    // 2. 부문코드 매칭
    if (sdCodeResult.code) {
      const codeMatches = mpItemsWithCode.filter(
        (mp: any) => mp.code === sdCodeResult.code && !mp.matched
      );

      if (codeMatches.length > 0) {
        matchedMp = codeMatches.reduce((best: any, curr: any) => {
          const bestSim = getNameSimilarity(sd.name, best.name);
          const currSim = getNameSimilarity(sd.name, curr.name);
          return currSim > bestSim ? curr : best;
        });

        const nameSim = getNameSimilarity(sd.name, matchedMp.name);
        if (sdCodeResult.confidence >= 0.7 && nameSim >= 0.5) {
          matchConfidence = 'high';
        } else if (sdCodeResult.confidence >= 0.4 || nameSim >= 0.3) {
          matchConfidence = 'medium';
        } else {
          matchConfidence = 'low';
        }
        matchedMp.matched = true;
      }
    }

    const itemName = sd.name.replace(/\(보조\).*/, '').trim();

    if (matchedMp && matchedMp.budget > 0) {
      // 양쪽 모두 있음
      bothSides.push({
        name: itemName,
        sdBudget: sd.budget,
        mpBudget: matchedMp.budget,
        mpName: matchedMp.name.replace(/\(보조\).*/, '').trim(),
        matchConfidence,
        sectionCode: sdCodeResult.code,
        sectionName: sdCodeResult.code ? SECTION_CODES[sdCodeResult.code].name : '미분류',
      });
    } else {
      // 성동구에만 있음
      sdOnly.push({
        name: itemName,
        sdBudget: sd.budget,
        mpBudget: 0,
        mpName: null,
        matchConfidence: 'none',
        sectionCode: sdCodeResult.code,
        sectionName: sdCodeResult.code ? SECTION_CODES[sdCodeResult.code].name : '미분류',
      });
    }
  });

  // 마포구에만 있는 항목
  mpItemsWithCode.forEach((mp: any) => {
    if (!mp.matched) {
      const mpCodeResult = inferSectionCode(mp.name);
      mpOnly.push({
        name: mp.name.replace(/\(보조\).*/, '').trim(),
        sdBudget: 0,
        mpBudget: mp.budget,
        mpName: mp.name.replace(/\(보조\).*/, '').trim(),
        matchConfidence: 'none',
        sectionCode: mpCodeResult.code,
        sectionName: mpCodeResult.code ? SECTION_CODES[mpCodeResult.code].name : '미분류',
      });
    }
  });

  // 예산 순 정렬
  bothSides.sort((a, b) => (b.sdBudget + b.mpBudget) - (a.sdBudget + a.mpBudget));
  sdOnly.sort((a, b) => b.sdBudget - a.sdBudget);
  mpOnly.sort((a, b) => b.mpBudget - a.mpBudget);

  return {
    bothSides,
    bothSidesTotal: {
      sd: bothSides.reduce((sum, item) => sum + item.sdBudget, 0),
      mp: bothSides.reduce((sum, item) => sum + item.mpBudget, 0),
    },
    sdOnly,
    sdOnlyTotal: sdOnly.reduce((sum, item) => sum + item.sdBudget, 0),
    mpOnly,
    mpOnlyTotal: mpOnly.reduce((sum, item) => sum + item.mpBudget, 0),
  };
}

/**
 * 부문별로 그룹핑된 세부 사업 비교 데이터
 * 같은 분류(부문)의 항목들을 묶어서 소계 표시
 */
function getGroupedDetailComparison(categoryCode: string): BudgetSectionGroup[] {
  const sdDetails = (budgetDetails as any)['성동구'][categoryCode] || [];
  const mpDetails = (budgetDetails as any)['마포구'][categoryCode] || [];

  // 모든 항목을 부문코드와 함께 수집
  const allItems: BudgetComparisonItem[] = [];

  // 성동구 항목 처리
  sdDetails.forEach((sd: any) => {
    const codeResult = inferSectionCode(sd.name);
    allItems.push({
      name: sd.name.replace(/\(보조\).*/, '').trim(),
      sdBudget: sd.budget,
      mpBudget: 0, // 나중에 매칭
      mpName: null,
      matchConfidence: codeResult.code ? (codeResult.confidence >= 0.5 ? 'high' : 'medium') : 'none',
      sectionCode: codeResult.code,
      sectionName: codeResult.code ? SECTION_CODES[codeResult.code].name : '미분류',
    });
  });

  // 마포구 항목 - 같은 부문에 합산하거나 새로 추가
  mpDetails.forEach((mp: any) => {
    const mpCodeResult = inferSectionCode(mp.name);
    const mpSectionCode = mpCodeResult.code;
    const mpName = mp.name.replace(/\(보조\).*/, '').trim();

    // 같은 부문코드를 가진 성동구 항목 찾기
    let matched = false;
    if (mpSectionCode) {
      // 같은 부문 내에서 가장 유사한 이름 찾기
      const sameSectionItems = allItems.filter(
        (item) => item.sectionCode === mpSectionCode && item.mpBudget === 0
      );

      if (sameSectionItems.length > 0) {
        // 이름 유사도가 가장 높은 항목에 매칭
        let bestMatch = sameSectionItems[0];
        let bestSimilarity = getNameSimilarity(mp.name, bestMatch.name);

        for (const item of sameSectionItems) {
          const similarity = getNameSimilarity(mp.name, item.name);
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestMatch = item;
          }
        }

        // 유사도가 0.2 이상이면 매칭
        if (bestSimilarity >= 0.2) {
          bestMatch.mpBudget = mp.budget;
          bestMatch.mpName = mpName;
          matched = true;
        }
      }
    }

    // 매칭 안 된 경우 별도 항목으로 추가
    if (!matched) {
      allItems.push({
        name: mpName,
        sdBudget: 0,
        mpBudget: mp.budget,
        mpName: mpName,
        matchConfidence: mpCodeResult.code ? 'medium' : 'none',
        sectionCode: mpCodeResult.code,
        sectionName: mpCodeResult.code ? SECTION_CODES[mpCodeResult.code].name : '미분류',
      });
    }
  });

  // 부문별로 그룹핑
  const groupMap = new Map<string, BudgetSectionGroup>();

  for (const item of allItems) {
    const key = item.sectionCode || 'none';

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        sectionCode: item.sectionCode,
        sectionName: item.sectionName,
        sdTotal: 0,
        mpTotal: 0,
        items: [],
      });
    }

    const group = groupMap.get(key)!;
    group.sdTotal += item.sdBudget;
    group.mpTotal += item.mpBudget;
    group.items.push(item);
  }

  // 그룹 내 항목 정렬 (예산 합계 순)
  for (const group of groupMap.values()) {
    group.items.sort((a, b) => (b.sdBudget + b.mpBudget) - (a.sdBudget + a.mpBudget));
  }

  // 그룹을 총액 순으로 정렬
  return Array.from(groupMap.values())
    .sort((a, b) => (b.sdTotal + b.mpTotal) - (a.sdTotal + a.mpTotal));
}

// ============================================================
// 표준 분류 비교 (54개 부문 기준 - 완벽 일치 비교)
// ============================================================

interface StandardSectionData {
  code: SectionCode;
  name: string;
  fieldCode: string;
  fieldName: string;
  sdTotal: number;
  mpTotal: number;
  sdItems: { name: string; budget: number }[];
  mpItems: { name: string; budget: number }[];
}

/**
 * 모든 예산 항목을 54개 표준 부문으로 집계
 * 이름이 달라도 같은 부문이면 합산되어 완벽한 비교 가능
 */
function getStandardizedComparison(): StandardSectionData[] {
  const sectionMap = new Map<SectionCode, StandardSectionData>();

  // 부문 코드 초기화
  for (const [code, info] of Object.entries(SECTION_CODES)) {
    const fieldName = FIELD_CODES[info.field as keyof typeof FIELD_CODES] || '기타';
    sectionMap.set(code as SectionCode, {
      code: code as SectionCode,
      name: info.name,
      fieldCode: info.field,
      fieldName,
      sdTotal: 0,
      mpTotal: 0,
      sdItems: [],
      mpItems: [],
    });
  }

  // 성동구 데이터 집계
  const sdData = budgetDetails as any;
  for (const categoryCode of Object.keys(sdData['성동구'] || {})) {
    const items = sdData['성동구'][categoryCode] || [];
    for (const item of items) {
      const result = inferSectionCode(item.name);
      if (result.code) {
        const section = sectionMap.get(result.code);
        if (section) {
          section.sdTotal += item.budget;
          section.sdItems.push({ name: item.name, budget: item.budget });
        }
      }
    }
  }

  // 마포구 데이터 집계
  for (const categoryCode of Object.keys(sdData['마포구'] || {})) {
    const items = sdData['마포구'][categoryCode] || [];
    for (const item of items) {
      const result = inferSectionCode(item.name);
      if (result.code) {
        const section = sectionMap.get(result.code);
        if (section) {
          section.mpTotal += item.budget;
          section.mpItems.push({ name: item.name, budget: item.budget });
        }
      }
    }
  }

  // 예산이 있는 부문만 필터링하고 총액 순 정렬
  return Array.from(sectionMap.values())
    .filter(s => s.sdTotal > 0 || s.mpTotal > 0)
    .sort((a, b) => (b.sdTotal + b.mpTotal) - (a.sdTotal + a.mpTotal));
}

/**
 * 분야(Field) 단위로 그룹핑 (더 큰 단위)
 */
function getFieldComparison(): { fieldCode: string; fieldName: string; sdTotal: number; mpTotal: number; sections: StandardSectionData[] }[] {
  const standardData = getStandardizedComparison();
  const fieldMap = new Map<string, { fieldCode: string; fieldName: string; sdTotal: number; mpTotal: number; sections: StandardSectionData[] }>();

  for (const section of standardData) {
    if (!fieldMap.has(section.fieldCode)) {
      fieldMap.set(section.fieldCode, {
        fieldCode: section.fieldCode,
        fieldName: section.fieldName,
        sdTotal: 0,
        mpTotal: 0,
        sections: [],
      });
    }
    const field = fieldMap.get(section.fieldCode)!;
    field.sdTotal += section.sdTotal;
    field.mpTotal += section.mpTotal;
    field.sections.push(section);
  }

  return Array.from(fieldMap.values())
    .sort((a, b) => (b.sdTotal + b.mpTotal) - (a.sdTotal + a.mpTotal));
}

export default function BudgetPage() {
  // 여러 카테고리를 동시에 펼칠 수 있도록 Set 사용
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const sd = budgetData['성동구'];
  const mp = budgetData['마포구'];
  const ratioData = calculateRatioData();
  const perCapitaData = calculatePerCapitaData();
  const radarData = getRadarData();

  // 카테고리 클릭 시 토글 (펼치기/접기)
  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // 카테고리가 펼쳐져 있는지 확인
  const isCategoryExpanded = (categoryName: string) => expandedCategories.has(categoryName);

  // 펼쳐진 카테고리의 그룹핑된 세부 사업 데이터 가져오기
  const getCategoryGroupedDetails = (categoryName: string): BudgetSectionGroup[] => {
    const code = categoryNameToCode[categoryName];
    return code ? getGroupedDetailComparison(code) : [];
  };

  // 펼쳐진 카테고리의 비대칭 분류된 데이터 가져오기 (신규)
  const getCategorizedDetails = (categoryName: string): CategorizedBudgetComparison => {
    const code = categoryNameToCode[categoryName];
    if (!code) {
      return {
        bothSides: [], bothSidesTotal: { sd: 0, mp: 0 },
        sdOnly: [], sdOnlyTotal: 0,
        mpOnly: [], mpOnlyTotal: 0,
      };
    }
    return getCategorizedDetailComparison(code);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            BETA
          </Badge>
          <Badge variant="outline">2025년 예산</Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">우리 동네 예산 비교</h1>
        <p className="text-muted-foreground">
          서울시 구별 예산을 비교하고, 내 세금이 어디에 쓰이는지 확인하세요
        </p>
      </div>

      {/* 안내 배너 */}
      <div className="mb-6 space-y-3">
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-400 mb-1">예산 구조 안내</p>
              <p className="text-muted-foreground">
                지자체 예산은 <strong className="text-foreground">복지(50-60%)</strong>와
                <strong className="text-foreground"> 행정/인건비(30%)</strong>가
                전체의 약 90%를 차지합니다. 이는 전국 모든 구가 비슷하며, 나머지 10%에서 각 구의 특색이 드러납니다.
                <span className="text-blue-400 ml-1">카테고리를 클릭하면 세부 사업을 볼 수 있어요!</span>
              </p>
            </div>
          </div>
        </div>

        {/* 경고 배너 - 데이터 해석 주의사항 */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-400 mb-1">⚠️ 비교 시 주의사항</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong className="text-foreground">항목명이 달라도 같은 사업</strong>일 수 있습니다 (예: "체육시설 운영" vs "주민센터 체육관")</li>
                <li>• <strong className="text-foreground">"-" 표시는 안 하는 게 아닙니다</strong> - 다른 이름으로 예산이 편성되어 있을 수 있어요</li>
                <li>• 같은 부문끼리 합산하여 비교하면 더 정확합니다 (세부 클릭 시 부문별 합계 제공)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 탭: 절대 비교 / 상대 비교 / 표준 비교 / 검증된 비교 */}
      <Tabs defaultValue="absolute" className="mb-8">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="absolute" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            절대 비교
          </TabsTrigger>
          <TabsTrigger value="relative" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            상대 비교
          </TabsTrigger>
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            표준 비교
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            검증된 비교
          </TabsTrigger>
        </TabsList>

        {/* 절대 비교 탭 */}
        <TabsContent value="absolute" className="mt-6">
          {/* 총괄 비교 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 성동구 */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    성동구
                  </CardTitle>
                  <Badge>서울시</Badge>
                </div>
                <CardDescription>인구 약 28만명</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">총 예산</span>
                    <span className="font-bold text-2xl">{formatBillion(sd.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">집행률</span>
                    <span>{sd.executionRate}%</span>
                  </div>
                  <Progress value={sd.executionRate} className="h-2 mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">1인당 예산</p>
                    <p className="font-semibold text-lg text-green-400">
                      {formatMillion(sd.perCapita)}원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">사업 수</p>
                    <p className="font-semibold text-lg">{sd.projectCount.toLocaleString()}개</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">자체재원</p>
                    <p className="font-semibold">{100 - sd.subsidyRatio}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">보조금</p>
                    <p className="font-semibold">{sd.subsidyRatio}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 마포구 */}
            <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    마포구
                  </CardTitle>
                  <Badge>서울시</Badge>
                </div>
                <CardDescription>인구 약 37만명</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">총 예산</span>
                    <span className="font-bold text-2xl">{formatBillion(mp.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">집행률</span>
                    <span>{mp.executionRate}%</span>
                  </div>
                  <Progress value={mp.executionRate} className="h-2 mt-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">1인당 예산</p>
                    <p className="font-semibold text-lg">{formatMillion(mp.perCapita)}원</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">사업 수</p>
                    <p className="font-semibold text-lg">{mp.projectCount.toLocaleString()}개</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">자체재원</p>
                    <p className="font-semibold">{100 - mp.subsidyRatio}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">보조금</p>
                    <p className="font-semibold">{mp.subsidyRatio}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 인사이트 카드 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                핵심 비교 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <insight.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{insight.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={
                          insight.winner === '성동구'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-purple-500/20 text-purple-400'
                        }
                      >
                        {insight.winner}
                      </Badge>
                      <span
                        className={`text-sm font-bold ${
                          insight.diff.startsWith('+') ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {insight.diff}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 비교 - 클릭 가능 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                카테고리별 예산 비교
              </CardTitle>
              <CardDescription>
                각 분야별 예산을 비교해보세요. <span className="text-primary">클릭하면 세부 사업을 볼 수 있어요!</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sd.categories.map((cat) => {
                  const mpCat = mp.categories.find((c) => c.name === cat.name);
                  const mpAmount = mpCat?.amount || 0;
                  const diff = cat.amount - mpAmount;
                  const maxAmount = Math.max(cat.amount, mpAmount);
                  const sdPercent = (cat.amount / maxAmount) * 100;
                  const mpPercent = (mpAmount / maxAmount) * 100;
                  const isExpanded = isCategoryExpanded(cat.name);
                  const categorized = isExpanded ? getCategorizedDetails(cat.name) : null;

                  return (
                    <div
                      key={cat.name}
                      className={`rounded-lg border transition-all ${
                        isExpanded
                          ? 'border-primary/50 bg-zinc-800/30'
                          : 'border-transparent hover:border-zinc-700/50 hover:bg-zinc-800/50'
                      }`}
                    >
                      {/* 카테고리 헤더 (클릭 가능) */}
                      <div
                        className="p-3 cursor-pointer"
                        onClick={() => handleCategoryClick(cat.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{cat.name}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-primary transition-transform" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {diff > 0 ? (
                              <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                성동 +{formatBillion(diff)}
                              </Badge>
                            ) : diff < 0 ? (
                              <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                마포 +{formatBillion(Math.abs(diff))}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Minus className="h-3 w-3 mr-1" />
                                동일
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-primary">성동구</span>
                              <span>{formatBillion(cat.amount)}</span>
                            </div>
                            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${sdPercent}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-purple-400">마포구</span>
                              <span>{formatBillion(mpAmount)}</span>
                            </div>
                            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all"
                                style={{ width: `${mpPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 세부 사업 목록 - 비대칭 분류 (펼쳐진 경우만 표시) */}
                      {isExpanded && categorized && (
                        <div className="px-3 pb-3 border-t border-zinc-700/50 mt-2 pt-3 space-y-4">

                          {/* 🟢 양쪽 모두 있는 항목 (정확한 비교 가능) */}
                          {categorized.bothSides.length > 0 && (
                            <div className="rounded-lg bg-green-500/5 border border-green-500/20 overflow-hidden">
                              <div className="px-3 py-2 bg-green-500/10 border-b border-green-500/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    <span className="font-medium text-sm text-green-400">양쪽 모두 있는 항목</span>
                                    <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                                      정확한 비교
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    성동 {formatBillion(categorized.bothSidesTotal.sd)} / 마포 {formatBillion(categorized.bothSidesTotal.mp)}
                                  </div>
                                </div>
                              </div>
                              <div className="px-3 py-2 space-y-2">
                                {categorized.bothSides.slice(0, 8).map((item, i) => {
                                  const itemMax = Math.max(item.sdBudget, item.mpBudget);
                                  const winner = item.sdBudget > item.mpBudget ? 'sd' : item.mpBudget > item.sdBudget ? 'mp' : null;
                                  const itemInfo = getBudgetItemInfo(item.name);
                                  return (
                                    <div key={i} className="p-2 rounded bg-zinc-900/50">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium">{item.name}</span>
                                            {item.mpName && item.mpName !== item.name && (
                                              <span className="text-[10px] text-purple-400">= {item.mpName}</span>
                                            )}
                                          </div>
                                          {itemInfo && (
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                                              {itemInfo.definition}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${(item.sdBudget / itemMax) * 100}%` }} />
                                          </div>
                                          <span className={`text-xs font-semibold min-w-[50px] text-right ${winner === 'sd' ? 'text-primary' : 'text-zinc-400'}`}>
                                            {formatBillion(item.sdBudget)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(item.mpBudget / itemMax) * 100}%` }} />
                                          </div>
                                          <span className={`text-xs font-semibold min-w-[50px] text-right ${winner === 'mp' ? 'text-purple-400' : 'text-zinc-400'}`}>
                                            {formatBillion(item.mpBudget)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {categorized.bothSides.length > 8 && (
                                  <div className="text-[10px] text-zinc-500 text-center pt-1">
                                    외 {categorized.bothSides.length - 8}개 항목
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 🟡 성동구에만 있는 항목 */}
                          {categorized.sdOnly.length > 0 && (
                            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 overflow-hidden">
                              <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400" />
                                    <span className="font-medium text-sm text-amber-400">성동구에만 있는 항목</span>
                                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                                      {categorized.sdOnly.length}개
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    총 {formatBillion(categorized.sdOnlyTotal)}
                                  </div>
                                </div>
                              </div>
                              <div className="px-3 py-2">
                                <p className="text-[10px] text-amber-400/80 mb-2">
                                  ⚠️ 마포구에는 다른 이름으로 있거나, 실제로 해당 사업이 없을 수 있습니다
                                </p>
                                <div className="space-y-1">
                                  {categorized.sdOnly.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-800/30 last:border-0">
                                      <span className="text-xs text-zinc-400">{item.name}</span>
                                      <span className="text-xs font-semibold text-primary">{formatBillion(item.sdBudget)}</span>
                                    </div>
                                  ))}
                                  {categorized.sdOnly.length > 5 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">
                                      외 {categorized.sdOnly.length - 5}개 항목
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 🟣 마포구에만 있는 항목 */}
                          {categorized.mpOnly.length > 0 && (
                            <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 overflow-hidden">
                              <div className="px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-purple-400" />
                                    <span className="font-medium text-sm text-purple-400">마포구에만 있는 항목</span>
                                    <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                                      {categorized.mpOnly.length}개
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    총 {formatBillion(categorized.mpOnlyTotal)}
                                  </div>
                                </div>
                              </div>
                              <div className="px-3 py-2">
                                <p className="text-[10px] text-purple-400/80 mb-2">
                                  ⚠️ 성동구에는 다른 이름으로 있거나, 실제로 해당 사업이 없을 수 있습니다
                                </p>
                                <div className="space-y-1">
                                  {categorized.mpOnly.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-1 border-b border-zinc-800/30 last:border-0">
                                      <span className="text-xs text-zinc-400">{item.name}</span>
                                      <span className="text-xs font-semibold text-purple-400">{formatBillion(item.mpBudget)}</span>
                                    </div>
                                  ))}
                                  {categorized.mpOnly.length > 5 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">
                                      외 {categorized.mpOnly.length - 5}개 항목
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 특색 사업 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  성동구 특색 사업
                </CardTitle>
                <CardDescription>스마트시티, 4차산업 집중 투자</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sd.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                    >
                      <span className="text-sm">{h.title}</span>
                      <Badge variant="secondary">{formatBillion(h.amount)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  마포구 특색 사업
                </CardTitle>
                <CardDescription>문화시설, 재개발 집중</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mp.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                    >
                      <span className="text-sm">{h.title}</span>
                      <Badge variant="secondary">{formatBillion(h.amount)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 상대 비교 탭 */}
        <TabsContent value="relative" className="mt-6">
          {/* 레이더 차트 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                예산 배분 비교 (레이더 차트)
              </CardTitle>
              <CardDescription>
                각 분야가 전체 예산의 몇 %를 차지하는지 비교합니다.
                <span className="text-primary ml-1">바깥쪽일수록 해당 분야에 집중</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 'auto']}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Radar
                      name="성동구"
                      dataKey="성동구"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="마포구"
                      dataKey="마포구"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>해석 팁:</strong> 복지와 행정/인건비가 대부분(90%)을 차지하는 건 정상입니다.
                  나머지 분야에서 성동구는 스마트/혁신, 문화체육에 더 집중하고,
                  마포구는 복지, 주거/도시에 더 집중합니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 비율 비교 - 클릭 가능 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                예산 비율 비교
              </CardTitle>
              <CardDescription>
                전체 예산 대비 각 분야의 비율 (%)을 비교합니다. <span className="text-primary">클릭하면 세부 사업!</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ratioData.map((item) => {
                  const Icon = item.icon;
                  const winner = item.ratioDiff > 0 ? '성동' : item.ratioDiff < 0 ? '마포' : null;
                  const isExpanded = isCategoryExpanded(item.name);
                  const categorized = isExpanded ? getCategorizedDetails(item.name) : null;

                  return (
                    <div
                      key={item.name}
                      className={`rounded-lg border transition-all ${
                        isExpanded
                          ? 'border-primary/50 bg-zinc-800/30'
                          : 'border-transparent hover:border-zinc-700/50 hover:bg-zinc-800/50'
                      }`}
                    >
                      {/* 헤더 (클릭 가능) */}
                      <div
                        className="space-y-2 p-3 cursor-pointer"
                        onClick={() => handleCategoryClick(item.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.name}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-primary transition-transform" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                            )}
                          </div>
                          {winner && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                winner === '성동'
                                  ? 'text-primary border-primary/30'
                                  : 'text-purple-400 border-purple-400/30'
                              }`}
                            >
                              {winner} +{Math.abs(item.ratioDiff)}%p
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-primary">성동구</span>
                              <span className="font-semibold">{item.sdRatio}%</span>
                            </div>
                            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/80 rounded-full transition-all flex items-center justify-end pr-2"
                                style={{ width: `${Math.min(item.sdRatio * 1.5, 100)}%` }}
                              >
                                {item.sdRatio >= 10 && (
                                  <span className="text-[10px] font-medium text-white">{item.sdRatio}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-purple-400">마포구</span>
                              <span className="font-semibold">{item.mpRatio}%</span>
                            </div>
                            <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500/80 rounded-full transition-all flex items-center justify-end pr-2"
                                style={{ width: `${Math.min(item.mpRatio * 1.5, 100)}%` }}
                              >
                                {item.mpRatio >= 10 && (
                                  <span className="text-[10px] font-medium text-white">{item.mpRatio}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 세부 사업 - 3개 섹션 방식 (상대평가: 비율 기준) */}
                      {isExpanded && categorized && (
                        <div className="px-3 pb-3 border-t border-zinc-700/50 mt-2 pt-3">
                          <div className="text-xs text-muted-foreground mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3 text-primary" />
                              <span className="text-primary font-medium">전체 예산 대비 비율</span>로 비교 (공정한 비교)
                            </div>
                          </div>
                          <div className="space-y-4">
                            {/* 🟢 양쪽 모두 있는 항목 */}
                            {categorized.bothSides.length > 0 && (
                              <div className="rounded-lg bg-green-500/5 border border-green-500/30 overflow-hidden">
                                <div className="px-3 py-2 bg-green-500/10 border-b border-green-500/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                                      <span className="font-medium text-sm text-green-400">양쪽 모두 있는 항목</span>
                                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
                                        {categorized.bothSides.length}개
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="text-primary font-medium">{formatPercent(categorized.bothSidesTotal.sd, sd.totalBudget)}</span>
                                      <span className="text-zinc-500">vs</span>
                                      <span className="text-purple-400 font-medium">{formatPercent(categorized.bothSidesTotal.mp, mp.totalBudget)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-3 py-2 space-y-1">
                                  {categorized.bothSides.slice(0, 8).map((detailItem, i) => {
                                    const sdItemPercent = (detailItem.sdBudget / sd.totalBudget) * 100;
                                    const mpItemPercent = (detailItem.mpBudget / mp.totalBudget) * 100;
                                    const itemPercentMax = Math.max(sdItemPercent, mpItemPercent);
                                    const detailWinner = sdItemPercent > mpItemPercent ? '성동' : mpItemPercent > sdItemPercent ? '마포' : null;
                                    return (
                                      <div key={i} className="grid grid-cols-12 gap-2 items-center text-xs py-1 border-b border-green-500/10 last:border-0">
                                        <div className="col-span-6 flex items-center gap-1.5" title={detailItem.name}>
                                          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-400" />
                                          <span className="truncate text-zinc-300">{detailItem.name}</span>
                                        </div>
                                        <div className="col-span-3">
                                          <div className="flex items-center gap-1">
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                              <div className="h-full bg-primary/70 rounded-full" style={{ width: itemPercentMax > 0 ? `${(sdItemPercent / itemPercentMax) * 100}%` : '0%' }} />
                                            </div>
                                            <span className={`w-12 text-right text-[10px] ${detailWinner === '성동' ? 'text-primary font-medium' : 'text-zinc-500'}`}>
                                              {formatPercent(detailItem.sdBudget, sd.totalBudget)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="col-span-3">
                                          <div className="flex items-center gap-1">
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                              <div className="h-full bg-purple-500/70 rounded-full" style={{ width: itemPercentMax > 0 ? `${(mpItemPercent / itemPercentMax) * 100}%` : '0%' }} />
                                            </div>
                                            <span className={`w-12 text-right text-[10px] ${detailWinner === '마포' ? 'text-purple-400 font-medium' : 'text-zinc-500'}`}>
                                              {formatPercent(detailItem.mpBudget, mp.totalBudget)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {categorized.bothSides.length > 8 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">외 {categorized.bothSides.length - 8}개 항목</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 🟡 성동구에만 있는 항목 */}
                            {categorized.sdOnly.length > 0 && (
                              <div className="rounded-lg bg-amber-500/5 border border-amber-500/30 overflow-hidden">
                                <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-amber-400" />
                                      <span className="font-medium text-sm text-amber-400">성동구에만 있는 항목</span>
                                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                                        {categorized.sdOnly.length}개
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-primary font-medium">{formatPercent(categorized.sdOnlyTotal, sd.totalBudget)}</span>
                                  </div>
                                  <p className="text-[10px] text-amber-400/70 mt-1">마포구에는 다른 이름으로 있거나, 해당 사업이 없을 수 있습니다</p>
                                </div>
                                <div className="px-3 py-2 space-y-1">
                                  {categorized.sdOnly.slice(0, 5).map((detailItem, i) => {
                                    const sdItemPercent = (detailItem.sdBudget / sd.totalBudget) * 100;
                                    return (
                                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-amber-500/10 last:border-0">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                          <span className="truncate text-zinc-300">{detailItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/70 rounded-full" style={{ width: `${Math.min(sdItemPercent * 20, 100)}%` }} />
                                          </div>
                                          <span className="text-primary font-medium w-12 text-right">{formatPercent(detailItem.sdBudget, sd.totalBudget)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {categorized.sdOnly.length > 5 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">외 {categorized.sdOnly.length - 5}개 항목</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 🟣 마포구에만 있는 항목 */}
                            {categorized.mpOnly.length > 0 && (
                              <div className="rounded-lg bg-purple-500/5 border border-purple-500/30 overflow-hidden">
                                <div className="px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-purple-400" />
                                      <span className="font-medium text-sm text-purple-400">마포구에만 있는 항목</span>
                                      <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                                        {categorized.mpOnly.length}개
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-purple-400 font-medium">{formatPercent(categorized.mpOnlyTotal, mp.totalBudget)}</span>
                                  </div>
                                  <p className="text-[10px] text-purple-400/70 mt-1">성동구에는 다른 이름으로 있거나, 해당 사업이 없을 수 있습니다</p>
                                </div>
                                <div className="px-3 py-2 space-y-1">
                                  {categorized.mpOnly.slice(0, 5).map((detailItem, i) => {
                                    const mpItemPercent = (detailItem.mpBudget / mp.totalBudget) * 100;
                                    return (
                                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-purple-500/10 last:border-0">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                          <span className="truncate text-zinc-300">{detailItem.mpName || detailItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500/70 rounded-full" style={{ width: `${Math.min(mpItemPercent * 20, 100)}%` }} />
                                          </div>
                                          <span className="text-purple-400 font-medium w-12 text-right">{formatPercent(detailItem.mpBudget, mp.totalBudget)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {categorized.mpOnly.length > 5 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">외 {categorized.mpOnly.length - 5}개 항목</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 1인당 비교 - 아코디언 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                1인당 예산 비교
              </CardTitle>
              <CardDescription>
                주민 1인당 얼마나 쓰이는지 비교합니다 (인구: 성동 28만, 마포 37만). <span className="text-primary">클릭하면 세부 사업!</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {perCapitaData.map((item) => {
                  const Icon = item.icon;
                  const winner = item.diff > 0 ? '성동' : item.diff < 0 ? '마포' : null;
                  const isExpanded = isCategoryExpanded(item.name);
                  const categorized = isExpanded ? getCategorizedDetails(item.name) : null;

                  return (
                    <div
                      key={item.name}
                      className={`rounded-lg border transition-all ${
                        isExpanded
                          ? 'border-primary/50 bg-zinc-800/30'
                          : 'border-transparent bg-zinc-800/30 hover:border-zinc-700/50 hover:bg-zinc-800/50'
                      }`}
                    >
                      {/* 헤더 (클릭 가능) */}
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => handleCategoryClick(item.name)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-primary transition-transform" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">성동구</p>
                            <p className={`font-semibold ${winner === '성동' ? 'text-primary' : ''}`}>
                              {(item.sdPerCapita / 10000).toFixed(1)}만원
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">마포구</p>
                            <p className={`font-semibold ${winner === '마포' ? 'text-purple-400' : ''}`}>
                              {(item.mpPerCapita / 10000).toFixed(1)}만원
                            </p>
                          </div>
                          {winner && (
                            <Badge
                              variant="outline"
                              className={`text-xs min-w-[80px] justify-center ${
                                winner === '성동'
                                  ? 'text-green-400 border-green-400/30'
                                  : 'text-purple-400 border-purple-400/30'
                              }`}
                            >
                              {winner === '성동' ? (
                                <><ArrowUpRight className="h-3 w-3 mr-1" />+{item.diffPercent}%</>
                              ) : (
                                <><ArrowUpRight className="h-3 w-3 mr-1" />+{Math.abs(item.diffPercent)}%</>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 세부 사업 - 3개 섹션 방식 (1인당 비교: 금액 기준) */}
                      {isExpanded && categorized && (
                        <div className="px-3 pb-3 border-t border-zinc-700/50 mt-2 pt-3">
                          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            세부 항목별 예산 비교 (금액 기준)
                          </div>
                          <div className="space-y-4">
                            {/* 🟢 양쪽 모두 있는 항목 */}
                            {categorized.bothSides.length > 0 && (
                              <div className="rounded-lg bg-green-500/5 border border-green-500/30 overflow-hidden">
                                <div className="px-3 py-2 bg-green-500/10 border-b border-green-500/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                                      <span className="font-medium text-sm text-green-400">양쪽 모두 있는 항목</span>
                                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/30">
                                        {categorized.bothSides.length}개
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="text-primary font-medium">{formatBillion(categorized.bothSidesTotal.sd)}</span>
                                      <span className="text-zinc-500">vs</span>
                                      <span className="text-purple-400 font-medium">{formatBillion(categorized.bothSidesTotal.mp)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="px-3 py-2 space-y-1">
                                  {categorized.bothSides.slice(0, 8).map((detailItem, i) => {
                                    const itemMax = Math.max(detailItem.sdBudget, detailItem.mpBudget);
                                    const detailWinner = detailItem.sdBudget > detailItem.mpBudget ? '성동' : detailItem.mpBudget > detailItem.sdBudget ? '마포' : null;
                                    return (
                                      <div key={i} className="grid grid-cols-12 gap-2 items-center text-xs py-1 border-b border-green-500/10 last:border-0">
                                        <div className="col-span-6 flex items-center gap-1.5" title={detailItem.name}>
                                          <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-green-400" />
                                          <span className="truncate text-zinc-300">{detailItem.name}</span>
                                        </div>
                                        <div className="col-span-3">
                                          <div className="flex items-center gap-1">
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                              <div className="h-full bg-primary/70 rounded-full" style={{ width: itemMax > 0 ? `${(detailItem.sdBudget / itemMax) * 100}%` : '0%' }} />
                                            </div>
                                            <span className={`w-12 text-right text-[10px] ${detailWinner === '성동' ? 'text-primary font-medium' : 'text-zinc-500'}`}>
                                              {formatBillion(detailItem.sdBudget)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="col-span-3">
                                          <div className="flex items-center gap-1">
                                            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                              <div className="h-full bg-purple-500/70 rounded-full" style={{ width: itemMax > 0 ? `${(detailItem.mpBudget / itemMax) * 100}%` : '0%' }} />
                                            </div>
                                            <span className={`w-12 text-right text-[10px] ${detailWinner === '마포' ? 'text-purple-400 font-medium' : 'text-zinc-500'}`}>
                                              {formatBillion(detailItem.mpBudget)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {categorized.bothSides.length > 8 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">외 {categorized.bothSides.length - 8}개 항목</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 🟡 성동구에만 있는 항목 */}
                            {categorized.sdOnly.length > 0 && (
                              <div className="rounded-lg bg-amber-500/5 border border-amber-500/30 overflow-hidden">
                                <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-amber-400" />
                                      <span className="font-medium text-sm text-amber-400">성동구에만 있는 항목</span>
                                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                                        {categorized.sdOnly.length}개
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-primary font-medium">{formatBillion(categorized.sdOnlyTotal)}</span>
                                  </div>
                                  <p className="text-[10px] text-amber-400/70 mt-1">마포구에는 다른 이름으로 있거나, 해당 사업이 없을 수 있습니다</p>
                                </div>
                                <div className="px-3 py-2 space-y-1">
                                  {categorized.sdOnly.slice(0, 5).map((detailItem, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-amber-500/10 last:border-0">
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                        <span className="truncate text-zinc-300">{detailItem.name}</span>
                                      </div>
                                      <span className="text-primary font-medium ml-2">{formatBillion(detailItem.sdBudget)}</span>
                                    </div>
                                  ))}
                                  {categorized.sdOnly.length > 5 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">외 {categorized.sdOnly.length - 5}개 항목</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 🟣 마포구에만 있는 항목 */}
                            {categorized.mpOnly.length > 0 && (
                              <div className="rounded-lg bg-purple-500/5 border border-purple-500/30 overflow-hidden">
                                <div className="px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4 text-purple-400" />
                                      <span className="font-medium text-sm text-purple-400">마포구에만 있는 항목</span>
                                      <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                                        {categorized.mpOnly.length}개
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-purple-400 font-medium">{formatBillion(categorized.mpOnlyTotal)}</span>
                                  </div>
                                  <p className="text-[10px] text-purple-400/70 mt-1">성동구에는 다른 이름으로 있거나, 해당 사업이 없을 수 있습니다</p>
                                </div>
                                <div className="px-3 py-2 space-y-1">
                                  {categorized.mpOnly.slice(0, 5).map((detailItem, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-purple-500/10 last:border-0">
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                        <span className="truncate text-zinc-300">{detailItem.mpName || detailItem.name}</span>
                                      </div>
                                      <span className="text-purple-400 font-medium ml-2">{formatBillion(detailItem.mpBudget)}</span>
                                    </div>
                                  ))}
                                  {categorized.mpOnly.length > 5 && (
                                    <div className="text-[10px] text-zinc-500 pt-1">외 {categorized.mpOnly.length - 5}개 항목</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 상대 비교 인사이트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                상대 비교 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <h4 className="font-semibold text-primary mb-2">성동구 강점</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 스마트/혁신 비율 <strong className="text-primary">0.7%</strong> (마포 0.06%)</li>
                    <li>• 문화체육 비율 <strong className="text-primary">5.5%</strong> (마포 3.2%)</li>
                    <li>• 1인당 예산 <strong className="text-primary">265만원</strong> (마포 220만원)</li>
                    <li>• 자체재원 비율 <strong className="text-primary">47%</strong> (마포 35%)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <h4 className="font-semibold text-purple-400 mb-2">마포구 강점</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 복지 비율 <strong className="text-purple-400">61.8%</strong> (성동 58.5%)</li>
                    <li>• 주거/도시 비율 <strong className="text-purple-400">5.4%</strong> (성동 4.1%)</li>
                    <li>• 총 예산 규모 <strong className="text-purple-400">8,134억</strong> (성동 7,414억)</li>
                    <li>• 인구 <strong className="text-purple-400">37만명</strong> (성동 28만명)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 표준 비교 탭 - 54개 부문 기준 완벽 일치 */}
        <TabsContent value="standard" className="mt-6">
          {/* 설명 카드 */}
          <Card className="mb-6 border-green-500/30 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-400 mb-2">표준 분류 비교란?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    지방재정법에 따른 <strong className="text-foreground">54개 표준 부문</strong>으로 예산을 분류하여 비교합니다.
                    항목명이 달라도 같은 부문이면 합산되므로 <strong className="text-foreground">100% 정확한 비교</strong>가 가능합니다.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      ✓ 항목명 달라도 OK
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      ✓ 표준 분류 코드 기준
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      ✓ 모든 지자체 동일 기준
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 분야별 비교 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <CardTitle>분야별 예산 비교 (14분야)</CardTitle>
              </div>
              <CardDescription>
                지방재정법 표준 분류체계 기준. 클릭하면 세부 부문을 볼 수 있어요!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFieldComparison().map((field) => {
                  const isExpanded = expandedCategories.has(`field-${field.fieldCode}`);
                  const total = field.sdTotal + field.mpTotal;
                  const sdPercent = total > 0 ? (field.sdTotal / total) * 100 : 50;
                  const winner = field.sdTotal > field.mpTotal ? '성동' : field.mpTotal > field.sdTotal ? '마포' : null;
                  const diff = Math.abs(field.sdTotal - field.mpTotal);

                  return (
                    <div key={field.fieldCode} className="border border-zinc-700/50 rounded-lg overflow-hidden">
                      {/* 분야 헤더 */}
                      <div
                        className="p-4 bg-zinc-800/30 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                        onClick={() => handleCategoryClick(`field-${field.fieldCode}`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                              {field.fieldCode}
                            </Badge>
                            <span className="font-medium">{field.fieldName}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          {winner && (
                            <Badge variant="outline" className={winner === '성동' ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-400'}>
                              {winner} +{formatBillion(diff)}
                            </Badge>
                          )}
                        </div>

                        {/* 비교 바 */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-16 text-right text-primary font-medium">{formatBillion(field.sdTotal)}</span>
                          <div className="flex-1 h-3 bg-zinc-700 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${sdPercent}%` }}
                            />
                            <div
                              className="h-full bg-purple-500 transition-all"
                              style={{ width: `${100 - sdPercent}%` }}
                            />
                          </div>
                          <span className="w-16 text-purple-400 font-medium">{formatBillion(field.mpTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>성동구</span>
                          <span>마포구</span>
                        </div>
                      </div>

                      {/* 세부 부문 (펼쳐진 경우) */}
                      {isExpanded && (
                        <div className="p-4 border-t border-zinc-700/50 bg-zinc-900/30">
                          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                            <span className="text-green-400 font-medium">표준 부문별 비교</span> - 항목명이 달라도 정확히 비교됨
                          </div>
                          <div className="space-y-2">
                            {field.sections.map((section) => {
                              const sectionTotal = section.sdTotal + section.mpTotal;
                              const sectionSdPercent = sectionTotal > 0 ? (section.sdTotal / sectionTotal) * 100 : 50;
                              const sectionWinner = section.sdTotal > section.mpTotal ? '성동' : section.mpTotal > section.sdTotal ? '마포' : null;

                              return (
                                <div key={section.code} className="bg-zinc-800/30 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs font-mono">
                                        {section.code}
                                      </Badge>
                                      <span className="text-sm font-medium">{section.name}</span>
                                    </div>
                                    {sectionWinner && (
                                      <span className={`text-xs ${sectionWinner === '성동' ? 'text-primary' : 'text-purple-400'}`}>
                                        {sectionWinner} 우위
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="w-14 text-right text-primary">{formatBillion(section.sdTotal)}</span>
                                    <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden flex">
                                      <div className="h-full bg-primary" style={{ width: `${sectionSdPercent}%` }} />
                                      <div className="h-full bg-purple-500" style={{ width: `${100 - sectionSdPercent}%` }} />
                                    </div>
                                    <span className="w-14 text-purple-400">{formatBillion(section.mpTotal)}</span>
                                  </div>
                                  {/* 포함된 항목 수 */}
                                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>({section.sdItems.length}개 사업)</span>
                                    <span>({section.mpItems.length}개 사업)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 인사이트 카드 */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <CardTitle>표준 분류 인사이트</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2">왜 표준 분류인가?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 지방재정법 제60조에 따른 <strong>법정 분류</strong></li>
                    <li>• 전국 모든 지자체가 <strong>동일한 코드</strong> 사용</li>
                    <li>• "체육시설 운영" = "스포츠센터 관리" → <strong>같은 063</strong></li>
                    <li>• 항목명 달라도 <strong>정확한 비교</strong> 가능</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <h4 className="font-semibold text-blue-400 mb-2">분류 구조</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>14개 분야</strong>: 일반공공행정, 사회복지 등</li>
                    <li>• <strong>54개 부문</strong>: 체육, 문화예술, 기초생활보장 등</li>
                    <li>• 분야 → 부문 → 정책사업 → 세부사업</li>
                    <li>• 부문 단위에서 <strong>완벽 매칭</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 검증된 비교 탭 */}
        <TabsContent value="verified" className="mt-6">
          {/* 설명 배너 */}
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <UserCheck className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-400 mb-1">검증된 예산 항목 매핑</h3>
                <p className="text-sm text-muted-foreground">
                  법령과 조례를 조사하여 <strong>같은 사업임이 확인된</strong> 항목들만 매칭합니다.
                  불확실한 경우는 매칭하지 않아 <strong>거짓 정보 제공을 방지</strong>합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 검증된 매핑 목록 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <CardTitle>검증된 동일 사업</CardTitle>
              </div>
              <CardDescription>
                법적 근거를 통해 같은 사업임이 확인된 항목들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAllVerifiedMappings().map((mapping) => {
                  // 해당 매핑에서 성동구와 마포구 데이터 찾기
                  const sdAlias = mapping.aliases.find(a => a.foundIn.includes('성동구'));
                  const mpAlias = mapping.aliases.find(a => a.foundIn.includes('마포구'));

                  // budgetDetails에서 실제 예산 찾기
                  let sdBudget = 0;
                  let mpBudget = 0;
                  const bdData = budgetDetails as any;

                  // 성동구 예산 찾기
                  if (sdAlias) {
                    for (const cat of Object.keys(bdData['성동구'] || {})) {
                      const found = bdData['성동구'][cat]?.find((item: any) =>
                        item.name.includes(sdAlias.name.replace(/\(보조\).*/, '').trim().slice(0, 10))
                      );
                      if (found) {
                        sdBudget = found.budget;
                        break;
                      }
                    }
                  }

                  // 마포구 예산 찾기
                  if (mpAlias) {
                    for (const cat of Object.keys(bdData['마포구'] || {})) {
                      const found = bdData['마포구'][cat]?.find((item: any) =>
                        item.name.includes(mpAlias.name.replace(/\(보조\).*/, '').trim().slice(0, 10))
                      );
                      if (found) {
                        mpBudget = found.budget;
                        break;
                      }
                    }
                  }

                  const total = sdBudget + mpBudget;

                  return (
                    <div key={mapping.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                            {mapping.confidence}% 확신
                          </Badge>
                          <h4 className="font-semibold">{mapping.canonicalName}</h4>
                        </div>
                        <Badge variant="secondary">{mapping.sectionName}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{mapping.definition}</p>

                      {/* 이름 비교 */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="p-2 rounded bg-primary/10 border border-primary/30">
                          <div className="text-xs text-muted-foreground mb-1">성동구 표기</div>
                          <div className="text-sm font-medium">{sdAlias?.name || '-'}</div>
                          {sdBudget > 0 && (
                            <div className="text-xs text-primary mt-1">{formatBillion(sdBudget)}</div>
                          )}
                        </div>
                        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                          <div className="text-xs text-muted-foreground mb-1">마포구 표기</div>
                          <div className="text-sm font-medium">{mpAlias?.name || '-'}</div>
                          {mpBudget > 0 && (
                            <div className="text-xs text-blue-400 mt-1">{formatBillion(mpBudget)}</div>
                          )}
                        </div>
                      </div>

                      {/* 법적 근거 */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Info className="h-3 w-3" />
                        <span>법적 근거: {mapping.legalBasis}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 거부된 매핑 (절대 매칭하면 안 되는 항목) */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <CardTitle>매칭 금지 항목</CardTitle>
              </div>
              <CardDescription>
                이름이 비슷하지만 <strong>완전히 다른 사업</strong>이므로 매칭하면 안 되는 항목들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAllRejectedMappings().map((rejection) => (
                  <div key={rejection.id} className="p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">매칭 금지</Badge>
                      <span className="font-semibold">{rejection.item1}</span>
                      <span className="text-muted-foreground">≠</span>
                      <span className="font-semibold">{rejection.item2}</span>
                    </div>
                    <p className="text-sm text-red-400 mb-3">{rejection.reason}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(rejection.explanation).map(([key, value]) => (
                        <div key={key} className="p-2 rounded bg-zinc-800/50">
                          <div className="text-xs font-medium text-muted-foreground mb-1">{key}</div>
                          <div className="text-sm">{value as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 검증 방법론 설명 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                <CardTitle>검증 방법론</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <h4 className="font-semibold mb-2 text-emerald-400">1. 법령 조사</h4>
                  <p className="text-sm text-muted-foreground">
                    관련 법률, 시행령, 조례를 확인하여 사업의 법적 정의와 범위를 파악합니다.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <h4 className="font-semibold mb-2 text-blue-400">2. 항목명 분석</h4>
                  <p className="text-sm text-muted-foreground">
                    각 구에서 사용하는 항목명을 비교하고, 분담비율 표기 등 형식 차이를 구분합니다.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <h4 className="font-semibold mb-2 text-amber-400">3. 신뢰도 분류</h4>
                  <p className="text-sm text-muted-foreground">
                    법적 근거가 명확한 경우만 100% 확신으로 매핑. 불확실한 경우 매핑하지 않습니다.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-emerald-400">
                  <strong>원칙:</strong> "거짓 없이 팩트로만" - 확인되지 않은 정보는 제공하지 않습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 데이터 출처 */}
      <div className="mt-8 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
        <p className="text-xs text-muted-foreground">
          <strong>데이터 출처:</strong> 서울재정포털 (openfinance.seoul.go.kr) | 2025년 일반회계 기준 |
          마지막 업데이트: 2025년 12월 18일
        </p>
      </div>
    </div>
  );
}
