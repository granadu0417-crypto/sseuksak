import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

// 정치인 상세 정보 타입
interface PoliticianDetail {
  id: string;
  name: string;
  party_id: string | null;
  party_name: string | null;
  party_color: string | null;
  region: string | null;
  position: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  education: string | null;
  career: string | null;
  contact_email: string | null;
  website_url: string | null;
  sns_twitter: string | null;
  sns_facebook: string | null;
  sns_instagram: string | null;
  attendance_rate: number;
  bill_count: number;
  promise_count: number;
  promise_completed: number;
  approval_rating: number;
  is_trending: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  activities: Activity[];
  promises: PoliticianPromise[];
  activity_stats: ActivityStats;
  recent_bills: BillSponsorship[];
  recent_votes: VotingRecord[];
  committee_activities: CommitteeActivity[];
  election_history: ElectionHistory[];
  election_promises: ElectionPromise[];
  asset_summary: AssetSummary | null;
  contribution_summary: ContributionSummary | null;
  party_positions: PartyPosition[];
}

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  source_url: string | null;
  activity_date: string;
}

interface PoliticianPromise {
  id: string;
  category: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  target_date: string | null;
}

// 활동 통계
interface ActivityStats {
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  absent_votes: number;
  bills_sponsored: number;
  bills_cosponsored: number;
  bills_passed: number;
  plenary_attendance_rate: number;
  committee_attendance_rate: number;
}

// 발의 법안
interface BillSponsorship {
  id: string;
  bill_name: string;
  sponsor_type: string;
  propose_date: string | null;
  committee: string | null;
  proc_result: string | null;
}

// 표결 기록
interface VotingRecord {
  id: string;
  bill_name: string | null;
  vote_result: string;
  vote_date: string | null;
}

// 위원회 활동
interface CommitteeActivity {
  id: string;
  committee_name: string;
  position: string | null;
  is_current: number;
}

// 선거 이력
interface ElectionHistory {
  id: string;
  election_id: string;
  election_type: string;
  election_date: string;
  constituency: string | null;
  party_name: string | null;
  vote_count: number | null;
  vote_rate: number | null;
  is_elected: number;
  assembly_age: number | null;
}

// 선거 공약
interface ElectionPromise {
  id: string;
  promise_no: number;
  category: string | null;
  title: string;
  content: string | null;
  status: string;
  progress: number;
}

// 자산 요약 (OpenWatch)
interface AssetSummary {
  total_assets: number;
  total_real_estate: number;
  total_securities: number;
  total_deposits: number;
  total_debts: number;
  asset_change: number | null;
  asset_change_rate: number | null;
  latest_report_date: string | null;
}

// 후원금 요약 (OpenWatch)
interface ContributionSummary {
  total_contributions: number;
  total_donors: number;
  latest_year: number | null;
  latest_amount: number | null;
  avg_yearly_amount: number | null;
  max_single_donation: number | null;
}

// 당직 정보 (Phase 4)
interface PartyPosition {
  id: string;
  party_name: string;
  party_color: string | null;
  position_type: string;
  position_level: number;
  position_name: string;
  term_number: number | null;
  appointment_type: string;
  start_date: string | null;
  region: string | null;
}

// GET /api/politicians/[id] - 정치인 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDB();
    const { id } = await params;

    // 정치인 기본 정보 조회
    const politician = await db.prepare(`
      SELECT
        pol.*,
        p.name as party_name,
        p.color as party_color
      FROM politicians pol
      LEFT JOIN parties p ON pol.party_id = p.id
      WHERE pol.id = ?
    `).bind(id).first<PoliticianDetail>();

    if (!politician) {
      return NextResponse.json(
        { success: false, error: "정치인을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 태그 조회
    const tagsResult = await db.prepare(
      "SELECT tag FROM politician_tags WHERE politician_id = ?"
    ).bind(id).all<{ tag: string }>();
    const tags = (tagsResult.results || []).map(t => t.tag);

    // 최근 활동 조회 (최대 10개)
    const activitiesResult = await db.prepare(`
      SELECT id, activity_type, title, description, source_url, activity_date
      FROM politician_activities
      WHERE politician_id = ?
      ORDER BY activity_date DESC
      LIMIT 10
    `).bind(id).all<Activity>();
    const activities = activitiesResult.results || [];

    // 공약 조회
    const promisesResult = await db.prepare(`
      SELECT id, category, title, description, status, progress, target_date
      FROM promises
      WHERE politician_id = ?
      ORDER BY
        CASE status
          WHEN 'in_progress' THEN 1
          WHEN 'not_started' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'failed' THEN 4
          ELSE 5
        END,
        progress DESC
    `).bind(id).all<PoliticianPromise>();
    const promises = promisesResult.results || [];

    // 활동 통계 조회 (국회 API 기반)
    const activityStats = await db.prepare(`
      SELECT
        COALESCE(total_votes, 0) as total_votes,
        COALESCE(yes_votes, 0) as yes_votes,
        COALESCE(no_votes, 0) as no_votes,
        COALESCE(abstain_votes, 0) as abstain_votes,
        COALESCE(absent_votes, 0) as absent_votes,
        COALESCE(bills_sponsored, 0) as bills_sponsored,
        COALESCE(bills_cosponsored, 0) as bills_cosponsored,
        COALESCE(bills_passed, 0) as bills_passed,
        COALESCE(plenary_attendance_rate, 0) as plenary_attendance_rate,
        COALESCE(committee_attendance_rate, 0) as committee_attendance_rate
      FROM politician_activity_stats
      WHERE politician_id = ?
    `).bind(id).first<ActivityStats>();

    // 최근 발의 법안 조회 (최대 10개)
    const recentBillsResult = await db.prepare(`
      SELECT id, bill_name, sponsor_type, propose_date, committee, proc_result
      FROM bill_sponsorships
      WHERE politician_id = ?
      ORDER BY propose_date DESC
      LIMIT 10
    `).bind(id).all<BillSponsorship>();
    const recentBills = recentBillsResult.results || [];

    // 최근 표결 기록 조회 (최대 10개)
    const recentVotesResult = await db.prepare(`
      SELECT id, bill_name, vote_result, vote_date
      FROM voting_records
      WHERE politician_id = ?
      ORDER BY vote_date DESC
      LIMIT 10
    `).bind(id).all<VotingRecord>();
    const recentVotes = recentVotesResult.results || [];

    // 위원회 활동 조회
    const committeeActivitiesResult = await db.prepare(`
      SELECT id, committee_name, position, is_current
      FROM committee_activities
      WHERE politician_id = ? AND is_current = 1
      ORDER BY
        CASE position
          WHEN '위원장' THEN 1
          WHEN '간사' THEN 2
          WHEN '위원' THEN 3
          ELSE 4
        END
    `).bind(id).all<CommitteeActivity>();
    const committeeActivities = committeeActivitiesResult.results || [];

    // 선거 이력 조회 (최근 5개)
    const electionHistoryResult = await db.prepare(`
      SELECT id, election_id, election_type, election_date,
             constituency, party_name, vote_count, vote_rate,
             is_elected, assembly_age
      FROM election_history
      WHERE politician_id = ?
      ORDER BY election_date DESC
      LIMIT 5
    `).bind(id).all<ElectionHistory>();
    const electionHistory = electionHistoryResult.results || [];

    // 선거 공약 조회 (최근 선거의 공약)
    const electionPromisesResult = await db.prepare(`
      SELECT id, promise_no, category, title, content, status, progress
      FROM election_promises
      WHERE politician_id = ?
      ORDER BY election_id DESC, promise_no ASC
      LIMIT 20
    `).bind(id).all<ElectionPromise>();
    const electionPromises = electionPromisesResult.results || [];

    // 자산 요약 조회 (OpenWatch)
    const assetSummary = await db.prepare(`
      SELECT
        COALESCE(total_assets, 0) as total_assets,
        COALESCE(total_real_estate, 0) as total_real_estate,
        COALESCE(total_securities, 0) as total_securities,
        COALESCE(total_deposits, 0) as total_deposits,
        COALESCE(total_debts, 0) as total_debts,
        asset_change,
        asset_change_rate,
        latest_report_date
      FROM politician_asset_summary
      WHERE politician_id = ?
    `).bind(id).first<AssetSummary>();

    // 후원금 요약 조회 (OpenWatch)
    const contributionSummary = await db.prepare(`
      SELECT
        COALESCE(total_contributions, 0) as total_contributions,
        COALESCE(total_donors, 0) as total_donors,
        latest_year,
        latest_amount,
        avg_yearly_amount,
        max_single_donation
      FROM politician_contribution_summary
      WHERE politician_id = ?
    `).bind(id).first<ContributionSummary>();

    // 당직 정보 조회 (현직만)
    const partyPositionsResult = await db.prepare(`
      SELECT
        pp.id,
        p.name as party_name,
        p.color as party_color,
        ppt.name as position_type,
        ppt.level as position_level,
        pp.position_name,
        pp.term_number,
        pp.appointment_type,
        pp.start_date,
        pp.region
      FROM party_positions pp
      JOIN parties p ON pp.party_id = p.id
      JOIN party_position_types ppt ON pp.position_type_id = ppt.id
      WHERE pp.politician_id = ? AND pp.is_current = 1
      ORDER BY ppt.level
    `).bind(id).all<PartyPosition>();
    const partyPositions = partyPositionsResult.results || [];

    // bill_count 업데이트 (실제 발의 수로)
    const totalBills = activityStats
      ? activityStats.bills_sponsored + activityStats.bills_cosponsored
      : politician.bill_count;

    const response: ApiResponse<PoliticianDetail> = {
      success: true,
      data: {
        ...politician,
        bill_count: totalBills,
        tags,
        activities,
        promises,
        activity_stats: activityStats || {
          total_votes: 0,
          yes_votes: 0,
          no_votes: 0,
          abstain_votes: 0,
          absent_votes: 0,
          bills_sponsored: 0,
          bills_cosponsored: 0,
          bills_passed: 0,
          plenary_attendance_rate: 0,
          committee_attendance_rate: 0
        },
        recent_bills: recentBills,
        recent_votes: recentVotes,
        committee_activities: committeeActivities,
        election_history: electionHistory,
        election_promises: electionPromises,
        asset_summary: assetSummary || null,
        contribution_summary: contributionSummary || null,
        party_positions: partyPositions
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/politicians/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "정치인 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
