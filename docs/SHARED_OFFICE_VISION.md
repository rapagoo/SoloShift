# SoloShift Shared Office Vision

Last updated: 2026-04-10

## 목적

SoloShift를 단순한 개인 생산성 대시보드에서, "온라인 오피스에 출근해서 일하는 경험"으로 확장한다.

핵심 변화는 다음과 같다.

- 기존 MVP는 `혼자 하루를 운영하는 도구`였다.
- 다음 단계는 `공간`, `존재감`, `대화`, `상호작용`을 추가해서 실제 사무실처럼 느껴지게 만드는 것이다.
- 장기적으로는 다른 실제 유저가 같은 오피스 안에서 함께 움직이고 반응하는 구조를 목표로 한다.

## 제품 방향

### 유지할 것

- 현재의 출근, 상태 변경, 집중 세션, 작업 보드, 퇴근 회고 흐름
- 일간/주간 기록과 활동 피드
- 시간대 기반 하루 묶음과 개인 기록 축

### 새로 추가할 것

- 오피스라는 공유 공간 개념
- 방(room) 단위 구조
- NPC 동료 / 상사 / 팀원
- 다른 실제 유저의 접속 상태와 위치감
- 대화 스레드와 반응
- 활동 피드를 공간 경험과 연결하는 구조

## 화면 전략

### 추천 1안: 대시보드 유지 + 오피스 추가

초기에는 현재 홈 대시보드를 유지한다.

- `/` : 생산성 대시보드
- `/office` : 오피스 화면
- `/history` : 기록 화면

이 방식의 장점:

- 이미 안정화된 MVP 흐름을 깨지 않는다.
- 오피스 레이어를 점진적으로 붙일 수 있다.
- QA와 롤백이 쉽다.

### 장기 방향

오피스 경험이 충분히 좋아지면, 나중에는 `/office`가 실제 메인 홈이 되고 현재 대시보드는 오른쪽 패널 또는 보조 화면으로 내려갈 수 있다.

## 단계별 확장 전략

### Phase 3A: 싱글 플레이 오피스 + NPC

목표:

- 사용자는 `/office`로 들어간다.
- 오피스에는 방이 2~3개 있다.
- NPC 2~3명이 배치된다.
- 오늘의 활동(task / focus / check-out)에 따라 NPC 반응이 달라진다.

범위:

- 실시간 멀티플레이 없음
- 이동은 룸 전환 수준으로 단순화
- 대화는 규칙형 또는 템플릿형

현재 진행 상태:

- `/office` 첫 화면 구현 완료
- 룸 전환, NPC 카드, 규칙형 대화, 오피스 펄스 패널 구현 완료
- 아직 DB 영속 저장, Realtime, 유저 간 상호작용은 없음

### Phase 3B: 실시간 존재감 추가

목표:

- 실제 유저가 접속 중인지 보인다.
- 누가 어느 방에 있는지 보인다.
- 간단한 상태 표시가 실시간으로 바뀐다.

범위:

- 아직 자유 이동까지는 아님
- 우선 room-level presence만 지원
- 채팅은 최소화하거나 읽기 전용 반응 위주

현재 진행 상태:

- `/office`에 Presence 기반 온라인 패널 구현 완료
- 같은 오피스 내 온라인 유저 수, 방별 인원 수, 현재 방 동료 목록 표시
- 아직 private channel authorization, 채팅, room event persistence는 없음

### Phase 3C: 실시간 상호작용

목표:

- 방 이동이 실시간으로 보인다.
- 간단한 대화/반응이 가능하다.
- 같은 공간을 공유하는 감각이 생긴다.

범위:

- 가벼운 메시지
- 짧은 상호작용
- 단순한 아바타/아이콘 수준의 표현

### Phase 3D: 진짜 공유 오피스

목표:

- 여러 사람이 동시에 같은 오피스에서 활동한다.
- 공간 중심 UX가 대시보드보다 앞에 온다.
- NPC와 실제 유저가 같은 세계 안에서 동작한다.

## Supabase 중심 기술 방향

현재 구조는 계속 `Next.js + Supabase`를 유지한다.

실시간 계층은 Supabase Realtime 기준으로 설계한다.

- `Presence`: 누가 온라인인지, 어느 방에 있는지 같은 실시간 상태 표현
- `Broadcast`: 이동, 반응, 가벼운 이벤트, 즉시성 있는 메시지 전달
- `Postgres`: 영속 데이터 저장
  - 오피스 구조
  - 대화 이력
  - 활동 이력
  - 관계 수치

검증 기준으로 참고한 문서:

- Presence: connected client state 공유
- Broadcast: 저지연 메시지 전달
- Realtime overview: Presence / Broadcast / Postgres changes 구분

## Realtime 보안 메모

실제 멀티플레이 단계에서는 private channel을 기본값으로 잡는 것이 좋다.

- Presence와 Broadcast는 같은 오피스/방 topic 안에서 동작하게 한다.
- 인증된 사용자만 참여해야 하는 topic은 Realtime Authorization과 RLS 정책으로 제한한다.
- 공개 테스트 전에는 `realtime.messages` 기준의 권한 모델을 따로 점검한다.

즉, 초기 데모는 단순하게 시작하더라도 정식 공유 오피스 단계에서는 "아무나 모든 방에 들어가는 구조"를 기본값으로 두지 않는다.

## 데이터 모델 초안

### 기존 테이블 유지

- `profiles`
- `workdays`
- `status_logs`
- `focus_sessions`
- `point_events`
- `tasks`
- `activity_feed`

### 새 테이블 제안

#### `offices`

- `id`
- `slug`
- `name`
- `description`
- `theme`
- `created_at`

용도:

- 하나의 공유 사무실 단위

#### `office_rooms`

- `id`
- `office_id`
- `slug`
- `name`
- `room_type`
- `sort_order`
- `created_at`

예시:

- lobby
- focus-room
- lounge
- meeting-room

#### `office_memberships`

- `office_id`
- `user_id`
- `role`
- `home_room_id`
- `joined_at`

용도:

- 어떤 유저가 어떤 오피스 소속인지 관리

#### `npc_profiles`

- `id`
- `office_id`
- `code`
- `name`
- `archetype`
- `home_room_id`
- `persona_seed`
- `created_at`

예시 archetype:

- manager
- teammate
- quiet-designer
- overworked-dev

#### `npc_relationships`

- `npc_id`
- `user_id`
- `affinity`
- `trust_score`
- `last_interaction_at`

용도:

- NPC와 유저의 관계 진척도 저장

#### `conversation_threads`

- `id`
- `office_id`
- `room_id`
- `started_by_user_id`
- `counterpart_type`
- `counterpart_user_id`
- `counterpart_npc_id`
- `created_at`

용도:

- NPC 또는 실제 유저와의 대화 스레드

#### `conversation_messages`

- `id`
- `thread_id`
- `sender_type`
- `sender_user_id`
- `sender_npc_id`
- `message_kind`
- `body`
- `meta`
- `created_at`

용도:

- 대화 메시지 저장

#### `office_activity_events`

- `id`
- `office_id`
- `room_id`
- `actor_type`
- `actor_user_id`
- `actor_npc_id`
- `event_type`
- `payload`
- `created_at`

용도:

- 공간 안에서 일어난 이벤트 저장
- 기존 `activity_feed`는 개인 workday 중심 로그
- `office_activity_events`는 공간/관계 중심 로그

## Presence / Broadcast 역할 분리

이 단계에서 중요한 건 "무엇을 DB에 저장하고, 무엇을 실시간 메모리 상태로만 다룰지"를 분리하는 것이다.

### DB에 저장할 것

- 대화 메시지
- 방 구조
- 오피스 소속
- 관계 수치
- 중요한 공간 이벤트
- 개인 activity feed와 연결되는 영속 이벤트

### Realtime Presence로만 다룰 것

- 누가 온라인인지
- 누가 어느 방에 있는지
- 현재 어떤 상태인지의 가벼운 표현

### Broadcast로만 다룰 것

- 이동 애니메이션
- 빠른 반응
- 단기 이벤트
- 즉시성 중심의 UI 반영

초기에는 좌표 기반 자유 이동보다, `현재 room` 단위로만 표현하는 것이 훨씬 안전하다.

## 현재 MVP와의 연결 방식

현재 SoloShift의 중심 데이터는 그대로 유지한다.

연결 규칙:

- `workdays`, `tasks`, `focus_sessions`, `activity_feed`는 개인 업무 레이어
- `offices`, `office_rooms`, `npc_profiles`, `conversation_*`는 공간/관계 레이어

예시 연결:

- 사용자가 작업을 완료하면 `activity_feed`에 기록된다.
- 같은 이벤트를 보고 NPC가 반응 대사를 만든다.
- 그 반응이 `conversation_messages` 또는 `office_activity_events`로 이어질 수 있다.

즉, 기존 MVP를 버리지 않고 그 위에 오피스 세계를 얹는다.

## 첫 구현 추천 범위

가장 좋은 첫 세로 슬라이스는 아래다.

1. `/office` 페이지 추가
2. 오피스 1개, 방 3개
3. NPC 2명 이상
4. 오늘 활동을 기반으로 한 NPC 반응
5. 유저는 방을 전환할 수 있음
6. 현재 방에 있는 NPC 목록을 볼 수 있음
7. NPC와 짧은 규칙형 대화를 시작할 수 있음

이 범위면:

- 화면이 실제로 달라지고
- 세계관 감각이 생기고
- 아직 멀티플레이를 안 넣어도 충분히 의미가 있다.

현재 코드베이스는 이 추천 범위를 "DB 추가 없이, 기존 workday/task/activity feed를 재조합하는 방식"으로 1차 달성한 상태다.

## 멀티플레이를 바로 넣지 않는 이유

사용자가 상상한 최종 방향은 `실제 다른 사람들이 돌아다니는 오피스`다.
그 방향은 맞지만, 처음부터 거기로 바로 가면 위험이 크다.

리스크:

- 동시성 이슈
- UI 복잡도 급증
- 실시간 동기화 버그
- MVP 핵심 가치가 흐려질 가능성

그래서 추천은:

- 먼저 NPC 기반으로 공간 감각 완성
- 그다음 실제 유저 presence 추가
- 마지막에 실시간 이동/상호작용 확대

## 브랜치 전략 추천

이 단계부터는 별도 브랜치를 쓰는 것이 좋다.

이유:

- 화면 구조가 바뀔 수 있다.
- 스키마가 늘어난다.
- 실시간 기능은 실험과 롤백이 자주 필요하다.
- 현재 안정화된 MVP 기준선을 보존해야 한다.

추천 브랜치 이름:

- `codex/phase3-shared-office`
- `codex/office-foundation`

문서 작업만 할 때는 꼭 필요하지 않지만, 실제 스키마/라우트/UI 구현에 들어갈 때는 브랜치를 따는 편이 맞다.

## 다음 구현 순서

1. shared office 방향 문서 확정
2. 오피스/룸/NPC 최소 스키마 초안 작성
3. `/office` 페이지 와이어프레임 구현
4. NPC 반응 시스템 연결
5. 그 다음에 Realtime presence 도입 여부 결정

현재 코드베이스는 4번과 5번의 첫 미니 슬라이스까지 완료한 상태다. 다음 결정 지점은 `public presence preview를 유지할지` 혹은 `private channel + authorization policy`로 올릴지다.

private channel 전환을 위한 상세 계획은 `docs/OFFICE_PRIVATE_CHANNEL_PLAN.md`를 기준으로 본다.

## 성공 기준

이 단계의 성공 기준은 아래다.

- 사용자가 `/office`에 들어가면 "일하러 출근한 공간" 느낌을 받는다.
- 오늘의 작업과 활동이 공간 안의 반응으로 이어진다.
- 기존 대시보드 흐름을 깨지 않는다.
- 나중에 실제 멀티플레이를 붙일 수 있는 구조가 된다.
