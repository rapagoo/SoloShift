# SoloShift MVP 개발 계획

## Summary

- 현재 저장소는 문서 중심의 기획 단계에서 출발했고, 1차 구현 목표는 문서 기준 MVP를 실제로 사용할 수 있는 웹앱으로 세우는 것이었다.
- 제품 방향은 `웹 우선 + 개인형 중심 + 최소 게임화`로 고정한다.
- 기술 선택은 `Next.js App Router + TypeScript + Tailwind CSS + Supabase Auth/Postgres + Vercel`을 기준으로 한다.

## MVP Scope

첫 구현 범위는 아래 하루 운영 흐름 전체다.

- 출근
- 상태 변경
- 집중 세션
- 퇴근 회고
- 일간/주간 기록 조회

게임화는 최소 범위만 포함한다.

- 사용자 설정 출근 시각
- 정시/지각 판정
- 짧은 캐릭터 대사
- 포인트 적립과 기록

## UX Direction

- 첫 실행 온보딩에서 `nickname`, `timezone`, `default_check_in_time`을 받는다.
- 홈 `/`을 메인 대시보드로 사용한다.
- 기록 화면은 `/history` 단일 라우트로 분리한다.
- 입력 UI는 홈 중심으로 유지하고, `출근`, `상태 변경`, `집중 세션`, `퇴근`은 모달 또는 슬라이드오버로 처리한다.
- 모바일에서도 `조회`, `출근/퇴근`, `상태 변경`은 가능해야 한다.

## Data Access

- 초기 조회는 Server Component
- 변경은 Server Action
- 별도 공개 REST API는 만들지 않는다.

핵심 액션 인터페이스는 다음 기준으로 설계한다.

- `checkIn`
- `changeStatus`
- `startFocusSession`
- `finishFocusSession`
- `checkOut`
- `getTodayDashboard`
- `getWeeklySummary`

## Auth And Time Rules

- 인증은 Supabase Auth 이메일 로그인 기준으로 시작한다.
- MVP에서는 소셜 로그인과 익명 모드는 제외한다.
- 시간 저장은 모두 UTC로 한다.
- `profiles.timezone` 기준으로 `local_date`를 계산해 하루 단위 기록을 묶는다.

## Data Model

### `profiles`

- `id`
- `nickname`
- `timezone`
- `default_check_in_time`
- `created_at`

### `workdays`

- `user_id`
- `local_date`
- `check_in_at`
- `check_out_at`
- `today_goal`
- `today_first_task`
- `tomorrow_first_task`
- `daily_review`
- `goal_completed`
- `total_work_minutes`
- `total_focus_minutes`
- `total_points`

### `status_logs`

- `workday_id`
- `status_type`
- `start_at`
- `end_at`
- `memo`

### `focus_sessions`

- `workday_id`
- `status_log_id`
- `start_at`
- `end_at`
- `duration_minutes`
- `memo`
- `is_completed`

### `point_events`

- `workday_id`
- `event_type`
- `points`
- `meta`
- `created_at`

## Workday Rules

- 상태값은 `study_algorithm`, `portfolio`, `resume`, `break`, `meal`, `away`부터 시작한다.
- 하루에 하나의 `workday`만 생성 가능하게 한다.
- 중복 출근은 막는다.
- 상태 변경 시 이전 `status_log`는 자동 종료되고 새 상태가 열린다.
- `break`, `meal`, `away`는 기록되지만 집중 시간에는 포함하지 않는다.
- 집중 세션은 `출근 후, 퇴근 전, 동시에 1개만` 허용한다.
- 퇴근 시 열려 있는 상태/세션을 정리하고 같은 날의 추가 수정은 막는다.

## Character And Point Rules

캐릭터 대사는 AI 생성 없이 규칙형 템플릿으로 구현한다.

지원 이벤트:

- 정시 출근
- 지각 출근
- 집중 세션 완료
- 목표 달성 퇴근
- 일반 퇴근

포인트 규칙:

- 정시 출근 `+10`
- 10분 이내 지각 `+5`
- 그 외 지각 `+0`
- 집중 세션 완료 `+5`
- 오늘 목표 달성 `+15`
- 퇴근 회고 작성 `+5`
- 5일 연속 퇴근 기록 `+20`

## Out Of Scope For MVP

- 포인트 사용처
- 꾸미기
- 랭킹
- 친구
- NPC 동료
- 도전 모드
- 확장형 사무실/세계 시스템

## Delivery Order

1. Next.js 앱 스캐폴딩, Tailwind, Supabase 연결, 인증, 공통 타입, RLS 정책을 먼저 만든다.
2. 온보딩과 홈 대시보드, 출근/상태 변경/집중 세션/퇴근 흐름을 하나의 세로 슬라이스로 완성한다.
3. 일간 기록, 주간 요약, 포인트 이벤트 기록, 캐릭터 반응을 붙여 문서상 MVP를 닫는다.
4. 빈 상태, 예외 처리, 세션 중 새로고침 복원, 배포 설정까지 마무리한다.

## Test Plan

- 단위 테스트로 `포인트 계산`, `정시/지각 판정`, `연속 기록 계산`, `상태 전이 가드`를 검증한다.
- 통합 테스트로 `중복 출근 방지`, `상태 자동 종료`, `집중 세션 완료/중단`, `퇴근 후 수정 잠금`을 검증한다.
- E2E 테스트로 `정상 출근 하루`, `지각 출근 하루`, `휴식/자리비움이 섞인 하루`를 검증한다.
- 수용 기준은 `신규 사용자가 가입 -> 출근 기준 시각 설정 -> 하루 운영 완료 -> 기록 화면에서 일/주간 요약과 포인트 확인`까지 끊김 없이 되는 것이다.

## Assumptions

- MVP는 로컬 프로토타입이 아니라 실제 저장이 되는 Supabase 기반 서비스 구조로 시작한다.
- 게임화는 흐름을 돕는 장치일 뿐 핵심 작업을 가리거나 방해하지 않는다.
- 첫 구현에서는 AI 에셋 생성 없이 플레이스홀더 이미지와 정적 문구로 충분하다.
- 모바일은 완전한 운영 앱이 아니라 기본 사용과 조회가 가능한 보조 화면 수준으로 맞춘다.

## Post-MVP Direction

- MVP 이후 확장 방향은 docs/SHARED_OFFICE_VISION.md를 기준으로 진행한다.
- 추천 진행 순서는 오피스/NPC 단일 사용자 버전 -> 실시간 존재감 -> 공유 오피스다.

