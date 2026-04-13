# SoloShift Office Asset Checklist

Last updated: 2026-04-13

이 문서는 메인 공유 오피스에 붙일 픽셀 아트 에셋 체크리스트입니다.

기본 원칙:

- 투명 배경 PNG 권장
- 정사각 타일보다는 “오브젝트 단위” 스프라이트 권장
- 현재 오피스는 작은 4인 공유 오피스이므로 과한 오브젝트 수보다 선명한 책상/캐릭터가 더 중요
- 우선은 데스크톱 웹 기준

## 슬롯 파일 위치

코드 기준 에셋 슬롯은 [assets.ts](C:/Users/ghdtj/.codex/worktrees/c2fe/SoloShift/src/lib/office/assets.ts) 에서 연결합니다.

추천 폴더:

- `public/assets/office/background/`
- `public/assets/office/props/`
- `public/assets/office/avatars/`

## 필수 에셋

### 1. 메인 오피스 배경

- 슬롯 키: `office-background`
- 추천 파일명: `main-office.png`
- 추천 용도: 넓은 오피스 바닥, 벽, 창문, 복도, 기본 분위기
- 추천 크기:
  - 1600x1000 이상
  - 가능하면 1920x1200
- 메모:
  - 현재 화면 비율은 대략 `16:10`
  - 책상과 캐릭터가 또렷하게 올라오도록 배경 디테일은 과하지 않게

### 2. 책상

- 슬롯 키: `desk`
- 추천 파일명: `desk.png`
- 추천 용도: 책상 상판 + 모니터 + 기본 소품이 포함된 메인 책상 오브젝트
- 추천 크기:
  - 256x192
  - 또는 320x224
- 메모:
  - 현재 오피스에는 책상 4개가 필요
  - 1개 마스터 스프라이트로도 시작 가능

### 3. 의자

- 슬롯 키: `chair`
- 추천 파일명: `chair.png`
- 추천 용도: 책상 아래에 놓이는 의자
- 추천 크기:
  - 128x128
  - 또는 160x128
- 메모:
  - 책상과 분리하면 나중에 아바타/의자 레이어를 다루기 편함

### 4. 기본 아바타

- 슬롯 키: `avatar`
- 추천 파일명: `avatar-idle-front.png`
- 추천 용도: 현재 온라인 사용자 표시
- 추천 크기:
  - 64x96
  - 또는 96x128
- 메모:
  - 우선은 정면 idle 1장만 있어도 붙일 수 있음
  - 나중에 걷기 애니메이션으로 확장 가능

## 강력 추천 에셋

### 5. 화이트보드

- 슬롯 키: `whiteboard`
- 추천 파일명: `whiteboard.png`
- 추천 크기: 240x160

### 6. 창문 스트립

- 슬롯 키: `window-strip`
- 추천 파일명: `window-strip.png`
- 추천 크기: 720x180

### 7. 식물

- 슬롯 키: `plant`
- 추천 파일명: `plant-tall.png`
- 추천 크기: 96x128

### 8. 수납장 / 락커

- 슬롯 키: `locker`
- 추천 파일명: `locker.png`
- 추천 크기: 220x160

### 9. 커피 바

- 슬롯 키: `coffee-bar`
- 추천 파일명: `coffee-bar.png`
- 추천 크기: 240x140

## 있으면 좋은 추가 에셋

### 10. 걷기 애니메이션

- 현재 코드에 바로 필수는 아님
- 하지만 이동감이 살아나려면 나중에 추천
- 추천 방향:
  - 정면 idle
  - 좌/우 이동 2~3프레임
  - 후면 idle 또는 후면 이동

### 11. 책상 변형

- 창가 책상
- 복도 쪽 책상
- 소품이 다른 책상

지금은 1종으로 시작해도 충분하지만, 2종 이상 있으면 훨씬 덜 반복적으로 보입니다.

## 스타일 가이드

- 2D 픽셀 오피스
- 너무 채도가 높지 않은 따뜻한 톤
- 작은 팀이 쓰는 조용한 코워킹 오피스 느낌
- 책상과 캐릭터가 배경보다 먼저 읽히게

## 가장 먼저 준비하면 좋은 우선순위

1. `office-background`
2. `desk`
3. `chair`
4. `avatar`
5. `whiteboard`
6. `coffee-bar`

## 적용 방법

에셋 준비 후 이 파일만 수정하면 됩니다:

- [assets.ts](C:/Users/ghdtj/.codex/worktrees/c2fe/SoloShift/src/lib/office/assets.ts)

예시:

```ts
export const OFFICE_ASSET_PATHS = {
  "office-background": "/assets/office/background/main-office.png",
  desk: "/assets/office/props/desk.png",
  chair: "/assets/office/props/chair.png",
  whiteboard: "/assets/office/props/whiteboard.png",
  "window-strip": "/assets/office/props/window-strip.png",
  plant: "/assets/office/props/plant-tall.png",
  locker: "/assets/office/props/locker.png",
  "coffee-bar": "/assets/office/props/coffee-bar.png",
  avatar: "/assets/office/avatars/avatar-idle-front.png",
};
```

## 현재 코드 기준 바로 붙는 요소

- 오피스 배경
- 고정 소품
- 책상
- 의자
- 아바타

현재는 자산이 없으면 플레이스홀더 그래픽이 보이고, 자산이 생기면 같은 위치 슬롯에 이미지가 바로 올라오게 되어 있습니다.
