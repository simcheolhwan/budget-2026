# 가계부

개인/가족 가계부 웹앱. Firebase Realtime Database 기반 단일 사용자 서비스.

## 기술 스택

- **Core:** React 19, TypeScript, Vite
- **라우팅:** TanStack Router (파일 기반)
- **상태:** Zustand (UI), Firebase Realtime Database (데이터)
- **폼/검증:** React Hook Form, Zod
- **UI:** Base UI, Tabler Icons, CSS Modules (다크 모드 전용)
- **DnD:** dnd-kit (항목 순서 변경)

## 시작하기

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 Firebase 설정값과 VITE_ALLOWED_UID 입력

# 개발 서버
pnpm dev
```

## 스크립트

| 명령어           | 설명                 |
| ---------------- | -------------------- |
| `pnpm dev`       | 개발 서버            |
| `pnpm build`     | 프로덕션 빌드        |
| `pnpm test`      | 테스트 실행          |
| `pnpm lint`      | ESLint               |
| `pnpm typecheck` | TypeScript 타입 체크 |

## 프로젝트 구조

```
src/
├── routes/          # TanStack Router 파일 기반 라우팅
├── components/      # React 컴포넌트
│   ├── layout/      # 레이아웃 (헤더, 사이드바, 드로어)
│   ├── personal/    # 개인 가계부
│   ├── family/      # 가족 가계부, 예산 분석
│   └── shared/      # 공용 컴포넌트 (테이블, 폼, 다이얼로그)
├── hooks/           # 커스텀 훅 (Firebase 동기화, CRUD, DnD)
├── lib/             # 유틸리티, Firebase, 계산 로직
├── schemas/         # Zod 스키마 (데이터 모델)
├── stores/          # Zustand 스토어 (UI 상태)
└── styles/          # 글로벌 CSS, CSS 변수
```

## Firebase 보안 규칙

`database.rules.json`의 `YOUR_UID_HERE`를 본인 Firebase UID로 교체:

```json
{
  "rules": {
    ".read": "auth != null && auth.uid === 'YOUR_UID_HERE'",
    ".write": "auth != null && auth.uid === 'YOUR_UID_HERE'"
  }
}
```
