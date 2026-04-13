# SoloShift Shared Office Vision

Last updated: 2026-04-13

## 핵심 정의

SoloShift는 더 이상 "혼자 하루를 운영하는 대시보드"가 아니다.

현재 방향은 다음 문장으로 정리한다.

**같은 책상 줄에서 서로가 일하고 있는지 느끼게 해주는 작은 온라인 오피스**

즉, 생산성 기능은 여전히 중요하지만, 이제 메인 경험은:

- 출근해서
- 자리에 앉고
- 같은 오피스를 공유하는 사람들을 보고
- 그 존재감 덕분에 집중을 유지하는 것

이다.

## 현재 제품 결정

### 메인 화면

- `/office`가 메인 진입 화면
- `/dashboard`는 세부 업무 조작 화면
- `/history`는 기록 화면

현재 레이아웃 원칙:

- 오피스 캔버스가 화면의 대부분을 차지한다
- 세부 정보와 빠른 조작은 오른쪽 사이드바로 보낸다
- 오피스가 먼저 보이고, 기능은 그 다음에 보인다

### 오피스 구조

- 메인 오피스는 하나만 둔다
- 공간은 작고 밀도 있게 유지한다
- 초기 좌석은 4개만 둔다

이유:

- 사람이 적을 때도 텅 비어 보이지 않는다
- 실제 사용 테스트를 2인 정도로 바로 해볼 수 있다
- "같은 공간에 있다"는 감각을 가장 적은 복잡도로 검증할 수 있다

### 공간 철학

초기엔 "많이 걸어다니는 공간"보다 "같이 자리에 앉아 있는 공간"이 더 중요하다.

즉, 이번 기준에서는:

- 자유 이동보다 고정 자리
- room switching보다 책상 점유
- 큰 오피스보다 작은 팀 공간

이 더 맞다.

## 지금까지 만든 것

- office-first 진입 구조
- private authenticated realtime presence
- shared office activity timeline
- privacy-safe office pulse
- one main office with four desks
- large office canvas + right sidebar layout

## 다음 경험 원칙

### 1. 이동보다 자리

이전 프로토타입에서는 방을 옮기거나 자유 클릭 이동이 가능했지만, 사용 이유가 약했다.

앞으로는:

- 내 자리
- 빈 자리
- 다른 사람이 앉은 자리

이 핵심이다.

### 2. 감시는 직접이 아니라 은은하게

이 제품의 힘은 "누가 나를 보고 있다"는 과한 긴장보다,

- 누가 자리에 앉아 있고
- 누가 집중 중이고
- 누가 아직 일하는 중인지

를 은은하게 느끼게 하는 데 있다.

### 3. 기능은 자리 위에 올라간다

업무 기능은 따로 떨어진 앱 느낌이 아니라, 오피스 안의 자리와 연결되어야 한다.

예:

- 자리 위 작은 상태 배지
- 자리 위 집중 타이머
- 자리 위 away 표시
- 자리 위 check-out 표시

## 가까운 다음 단계

### Phase A: 자리 기반 가시성 강화

목표:

- 각 자리 위에 현재 상태를 보여준다
- 집중 세션 중이면 타이머 또는 집중 표시를 보여준다
- away / checked-out 상태를 시각적으로 구분한다

### Phase B: 가벼운 사회적 반응

목표:

- 채팅 대신 짧은 반응을 넣는다
- 예:
  - 파이팅
  - 수고 중
  - 잘하고 있어요

### Phase C: 자리 영속화

목표:

- 사용자는 항상 같은 책상을 쓴다는 감각을 갖는다
- 지금의 deterministic assignment를 persistent assignment로 올릴지 판단한다

후보:

- 단순 deterministic desk rule 유지
- `office_memberships`를 도입해 desk ownership 저장

### Phase D: 더 풍부한 아바타

목표:

- 지금의 자리/이름 중심 표현을 더 살아있는 캐릭터 표현으로 확장한다
- 단, 생산성 흐름을 가리는 방향은 피한다

## 데이터 방향 메모

당장은 private Presence + shared office activity만으로 충분하다.

다음 저장 모델이 필요해지는 시점은:

- 고정 자리 저장이 필요할 때
- 초대형/비공개 오피스가 필요할 때
- 여러 오피스를 지원할 때

그때 후보는:

- `office_memberships`
- `desk_assignments`
- `office_reactions`

## 결론

SoloShift의 다음 핵심 가설은 이것이다.

**작은 공유 오피스 안에서 서로의 존재감을 보는 것만으로도 혼자 할 때보다 집중이 올라가는가**

현재 제품은 그 가설을 검증하기 위한 가장 작은 형태로 수렴하고 있다:

- 메인 오피스 1개
- 책상 4개
- office-first 진입
- private realtime presence
- privacy-safe shared office feed
