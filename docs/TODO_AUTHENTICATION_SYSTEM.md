# 전문가 인증 시스템 구현 계획

> **상태**: 미구현 (차후 구현 예정)
> **작성일**: 2025-12-10
> **우선순위**: 높음 (서비스 신뢰성의 핵심)

---

## 왜 필요한가?

현재 "쓱싹" 플랫폼은 누구나 서비스를 등록할 수 있어 **사기 위험**이 있음.
실제 서비스 운영 시 사용자 보호를 위해 전문가 인증 시스템이 필수.

---

## 경쟁사 분석 요약

### 숨고
| 서비스 유형 | 사업자등록증 | 자격증 | 심사 |
|-------------|-------------|--------|------|
| **필수인증 서비스** (법적 자격 필요) | ✅ 필수 | ✅ 필수 | ✅ 담당부서 검수 후 승인 |
| **비필수 서비스** (일반 서비스) | ❌ 선택 | ❌ 선택 | ❌ 즉시 활동 가능 |

- 필수인증 서비스: 법률상담, 세무/회계, 의료관련, 전기공사 등
- 참고: https://help.soomgo.com/hc/ko/articles/360002512392

### 크몽
| 유형 | 필요 서류 | 심사 기간 |
|------|----------|----------|
| **개인 전문가** | 본인인증 + 계좌정보 | 즉시 승인 |
| **기업 전문가** | 사업자등록증 + 통장사본 | 최대 5일 |
| **서비스 등록** | 서비스 내용 검토 | 3~5일 |

- 학력/자격증 증빙 시 인증 뱃지 표시
- 서비스 등록 심사가 꽤 까다로움
- 참고: https://support.kmong.com/hc/ko/articles/35271260624153

---

## 구현 로드맵

### Phase 1: 기본 인증 (MVP) - 비용 낮음

#### 1.1 본인인증
- [ ] 휴대폰 본인인증 연동
  - PASS 인증 (SKT, KT, LG)
  - KCB 본인인증
  - **예상 비용**: 건당 50~100원

#### 1.2 서비스 심사 시스템
- [ ] 서비스 상태 필드 추가 (pending → approved/rejected)
- [ ] 관리자 대시보드 구현
- [ ] 승인/반려 알림 (이메일, 푸시)
- **예상 비용**: 개발 비용만 (무료)

#### 1.3 인증 뱃지 표시
- [ ] 프로필에 인증 상태 표시
  - 본인인증 완료
  - 사업자 인증
  - 자격증 보유
- **예상 비용**: 개발 비용만 (무료)

### Phase 2: 사업자/자격증 인증 - 비용 중간

#### 2.1 사업자등록증 검증
- [ ] 사업자등록증 이미지 업로드
- [ ] 국세청 API 연동 (사업자 진위확인)
  - https://www.data.go.kr (공공데이터포털)
  - **예상 비용**: 무료 (공공 API)

#### 2.2 자격증 검증
- [ ] 자격증 이미지 업로드
- [ ] 국가자격증 진위확인 API
  - https://www.q-net.or.kr (한국산업인력공단)
  - **예상 비용**: 무료~저렴

#### 2.3 카테고리별 필수 인증
- [ ] 법적 자격 필요 서비스 분류
- [ ] 카테고리별 필수 서류 정의
- [ ] 미인증 시 서비스 등록 차단

### Phase 3: 안전결제 (에스크로) - 비용 높음

#### 3.1 PG사 연동
- [ ] 토스페이먼츠 / KG이니시스 / NHN KCP 중 선택
- [ ] 에스크로 결제 구현
- [ ] 서비스 완료 후 정산 시스템
- **예상 비용**:
  - 가입비: 무료~50만원
  - 수수료: 결제금액의 2.5~3.5%

#### 3.2 분쟁 해결 시스템
- [ ] 환불 요청 기능
- [ ] 분쟁 중재 프로세스
- [ ] 관리자 개입 시스템

### Phase 4: 고급 보안 - 비용 높음

#### 4.1 AI 이상탐지
- [ ] 비정상 패턴 탐지 (동일 IP 다중 가입 등)
- [ ] 사기 의심 계정 자동 플래그
- **예상 비용**: 자체 개발 또는 외부 서비스

#### 4.2 신고 시스템
- [ ] 사용자 신고 기능
- [ ] 신고 접수 및 처리 프로세스
- [ ] 계정 정지/영구차단 시스템

---

## DB 스키마 변경 필요

```sql
-- profiles 테이블에 인증 관련 필드 추가
ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN business_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN business_registration_url TEXT;
ALTER TABLE profiles ADD COLUMN business_number VARCHAR(20);

-- services 테이블에 심사 상태 추가
ALTER TABLE services ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending';
-- pending, approved, rejected

-- 자격증 테이블 (새로 생성)
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type VARCHAR(50), -- 'business', 'license', 'education'
  name VARCHAR(100),
  issuer VARCHAR(100),
  issue_date DATE,
  image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 참고 자료

### 공식 문서
- [숨고 사업자등록증 안내](https://help.soomgo.com/hc/ko/articles/17645151408153)
- [숨고 필수인증 서비스](https://help.soomgo.com/hc/ko/articles/360002512392)
- [크몽 전문가 인증 방법](https://support.kmong.com/hc/ko/articles/35271260624153)
- [크몽 전문가 등록](https://support.kmong.com/hc/ko/articles/4405515534745)

### API/서비스
- [공공데이터포털 - 사업자등록 진위확인](https://www.data.go.kr)
- [Q-Net - 국가자격증 진위확인](https://www.q-net.or.kr)
- [토스페이먼츠](https://www.tosspayments.com)
- [KG이니시스](https://www.inicis.com)
- [구매안전서비스 안내](https://blog.tosspayments.com/articles/semo-4)

---

## 우선순위 권장

1. **지금 당장**: 기본 기능 완성 (이미지 업로드, 채팅, 검색 등)
2. **베타 출시 전**: Phase 1 (본인인증, 서비스 심사)
3. **정식 출시 전**: Phase 2 (사업자/자격증 인증)
4. **유료 서비스 시작 시**: Phase 3 (에스크로 결제)
5. **규모 확대 시**: Phase 4 (AI 이상탐지, 고급 보안)

---

*이 문서는 차후 인증 시스템 구현 시 참고용으로 작성되었습니다.*
