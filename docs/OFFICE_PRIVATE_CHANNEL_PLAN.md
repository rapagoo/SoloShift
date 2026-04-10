# SoloShift Office Private Channel Plan

Last updated: 2026-04-10

## 목적

현재 `/office`의 실시간 존재감은 빠른 QA를 위한 public presence preview 방식이다.

이 문서는 이를 운영 가능한 구조로 올리기 위해:

- 왜 private channel이 필요한지
- SoloShift에서는 무엇을 보호해야 하는지
- 어떤 단계로 전환하는 것이 안전한지

를 정리한다.

## 현재 상태

현재 구현은 다음 전제를 가진다.

- `/office`는 Supabase Realtime Presence를 사용한다.
- 채널은 하나의 공유 topic을 사용한다.
- 누구나 앱에 로그인하고 해당 topic에 붙으면 Presence를 주고받을 수 있다.
- DB 마이그레이션 없이 빠르게 존재감을 확인하는 것이 우선이었다.

장점:

- 빠르게 붙는다.
- QA가 쉽다.
- 멀티 브라우저 테스트가 편하다.

한계:

- 권한 모델이 느슨하다.
- 오피스가 여러 개 생기면 분리가 어렵다.
- 특정 팀/그룹/초대 기반 공간으로 가기 어렵다.
- 운영 단계에서 다른 공간의 Presence를 차단하기 어렵다.

## private channel + authorization이 의미하는 것

Supabase 기준으로 private channel은:

- 채널을 `private: true`로 생성하고
- `realtime.messages`에 RLS 정책을 두어
- 누가 어떤 topic에 join / read / write 할 수 있는지 제한하는 방식이다.

SoloShift 관점에서는 이것을 이렇게 이해하면 된다.

- 지금: "로그인하면 오피스 preview 채널에 붙을 수 있음"
- 나중: "권한이 있는 사용자만 자기 오피스 채널에 붙을 수 있음"

즉, private channel 전환은 단순한 옵션 변경이 아니라:

- 채널 구조 설계
- 멤버십 데이터 설계
- Realtime 권한 정책 설계

까지 포함하는 보안 단계다.

## SoloShift에서 보호해야 하는 것

나중에 진짜 공유 오피스가 되면 보호 대상은 아래와 같다.

1. 오피스 단위 Presence
- 누가 어느 오피스에 접속 중인지

2. 방 단위 Presence
- 누가 어느 방에 있는지

3. 대화 / 상호작용
- 같은 오피스에 속한 사람만 같은 공간 대화에 접근 가능해야 함

4. 향후 오피스 이벤트
- 특정 오피스에 소속되지 않은 사용자가 해당 공간 이벤트를 구독하면 안 됨

## 권장 전환 전략

### 1단계: 최소 보안 전환

목표:

- public preview를 private channel로 바꾼다.
- 최소 기준은 "로그인한 사용자만 join 가능"이다.

이 단계의 특징:

- 아직 office membership 테이블은 없어도 된다.
- 모든 authenticated 사용자가 같은 오피스에 들어오는 구조를 임시 유지할 수 있다.

장점:

- 구현이 빠르다.
- 현재 코드와 가장 가깝다.
- 운영용 최소 보안선으로는 public preview보다 낫다.

한계:

- 오피스가 여러 개가 되면 바로 한계가 온다.

### 2단계: membership 기반 authorization

목표:

- `office_memberships` 기준으로 사용자별 허용 오피스를 제한한다.

필요한 것:

- `offices`
- `office_memberships`

이 단계부터는:

- A 오피스 멤버는 B 오피스 Presence를 볼 수 없음
- 초대/팀/그룹 단위 오피스가 가능

### 3단계: room scope 세분화

목표:

- 오피스 전체 topic과 room topic을 필요에 따라 분리한다.

예시:

- `office:soloshift-commons:presence`
- `office:soloshift-commons:room:lobby`
- `office:soloshift-commons:room:focus-room`

이 단계는 나중에:

- 방 단위 이벤트
- 방 채팅
- 더 세밀한 room authorization

이 필요할 때 도입한다.

## 권장 topic 전략

지금 SoloShift에는 아래 순서가 가장 좋다.

### 현재 preview topic

- `office:soloshift-commons`

### 다음 운영형 topic

- `office:soloshift-commons:presence`

이렇게 분리해두면 나중에:

- `broadcast`
- `messages`
- `room events`

를 topic 이름으로 자연스럽게 확장할 수 있다.

권장 네이밍 패턴:

- `scope:entity:feature`

예:

- `office:soloshift-commons:presence`
- `office:soloshift-commons:broadcast`
- `office:soloshift-commons:room:lobby`

## SoloShift 기준 권장 구현 순서

### Phase 3B.1

목표:

- 지금 Presence preview를 private channel로 전환
- `authenticated` 사용자만 join 가능

변경 포인트:

- 클라이언트에서 `private: true`
- Realtime Settings에서 public access 비활성화
- `realtime.messages` 정책 추가

이 단계는 빠르고, 현재 기능을 거의 그대로 유지한다.

### Phase 3B.2

목표:

- `office_memberships` 추가
- topic 접근을 멤버십 기준으로 제한

변경 포인트:

- Supabase 스키마 추가
- membership 기반 select / insert 정책
- 추후 초대 기반 오피스 구조 준비

### Phase 3C 이후

목표:

- Broadcast / room event / lightweight chat 확장

변경 포인트:

- Presence와 Broadcast를 분리
- room-level topic 고려
- 메시지 타입별 정책 세분화

## 정책 방향 초안

### 최소 전환 정책

가장 작은 운영형 전환은 아래 기준이다.

- authenticated 사용자는 Presence를 읽을 수 있음
- authenticated 사용자는 Presence를 쓸 수 있음
- topic은 private channel로 강제

이 단계는 아직 "같은 프로젝트 사용자 전체가 같은 오피스에 들어올 수 있음"을 허용한다.

### membership 기반 정책

그다음부터는 아래 형태가 된다.

- `office_memberships.user_id = auth.uid()`
- `office_memberships.office_slug = realtime.topic()` 또는 topic에서 office slug를 파싱한 값과 일치

실무적으로는 topic 전체를 그대로 비교하거나,
`office_presence_topics` 같은 매핑 규칙을 두는 방식 둘 다 가능하다.

SoloShift에는 우선:

- 하나의 office slug
- 하나의 presence topic

으로 시작하고,
오피스가 2개 이상 생기는 시점에 membership 기반으로 올리는 것이 적절하다.

## 코드 변경 범위

### 현재 구현에서 private 전환 시 바뀌는 부분

1. `/office` Presence 패널
- `supabase.channel(topic, { config: { private: true, presence: { key } } })`

2. Supabase Dashboard
- Realtime Settings에서 public access 해제

3. SQL 정책
- `realtime.messages`에 Presence read / write 정책 추가

### membership 단계에서 추가되는 부분

1. 새 마이그레이션
- `offices`
- `office_memberships`

2. topic 규칙 정리
- office slug와 topic naming을 맞춤

3. 정책 강화
- topic 접근을 membership 기준으로 제한

## 추천 결론

지금 SoloShift는 아래 순서가 가장 안전하다.

1. 현재 public presence preview로 QA 계속
2. 다음 보안 패스에서 `private + authenticated-only` 전환
3. 그다음 office membership 도입
4. 이후 진짜 공유 오피스 확장

즉, 지금 당장 membership까지 한 번에 넣기보다:

- 먼저 private channel로 보안 기본선 올리고
- 그다음 오피스 데이터 모델이 생길 때 membership으로 확장

이 가장 현실적이다.

## 성공 기준

이 문서 기준 다음 전환이 성공했다고 볼 조건은 아래다.

- `/office` Presence가 public access 없이 동작한다.
- 로그인하지 않은 사용자는 office channel에 join할 수 없다.
- 나중에 office membership 정책으로 올릴 수 있는 topic naming이 정리되어 있다.
- 현재 UI와 QA 흐름을 크게 깨지 않는다.
