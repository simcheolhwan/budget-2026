# Budget App

개인/가족 가계부. Firebase Realtime Database 기반 단일 사용자 웹앱.

## Commands

- `pnpm dev` — 개발 서버
- `pnpm build` — 프로덕션 빌드
- `pnpm test` — 테스트 실행
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript 타입 체크

## Environment

`.env.example` → `.env` 복사 후 Firebase 설정값 입력. `VITE_ALLOWED_UID`로 단일 사용자 제한.

## Architecture

- `src/routes/` — TanStack Router 파일 기반 라우팅
- `src/components/` — React 컴포넌트 (layout, budget, shared)
- `src/contexts/` — React Context (FirebaseDataProvider: 루트 구독 3개)
- `src/hooks/` — 커스텀 훅 (Firebase 동기화, CRUD 다이얼로그, DnD)
- `src/lib/` — 유틸리티, Firebase, 계산 로직
- `src/schemas/` — Zod 스키마 (데이터 모델, 폼 검증)
- `src/stores/` — Zustand 스토어 (UI 상태)
- `src/styles/` — 글로벌 CSS, CSS 변수

## Key Patterns

- 커밋 메시지: `type(scope): 한국어 설명` (conventional commits, 본문 한국어)
- CSS Modules: 컴포넌트와 같은 디렉터리에 `*.module.css` 배치
- 아이콘: `@tabler/icons-react`
- UI 라이브러리: Base UI (`@base-ui/react`), React 19
- Firebase 실시간 동기화: `useSyncExternalStore` + 모듈 레벨 상태 (`useFirebaseSync`, `useAuth`)
- 폼: React Hook Form + Zod + Base UI Dialog
- 상태: Zustand (UI 상태), Firebase (데이터)
- 테이블 숫자 셀: 오차 기반 편집 모드 (자동/편집 메뉴)
- 정렬: 저장 시 month 오름차순, 같은 월 내 category 가나다순 자동 정렬 (`addSortedItem`/`updateSortedItem`)
- DnD 순서 변경: dnd-kit (`useSortableList` → `reorderItems`)
- 검색: `⌘K` 전체 검색 (`buildSearchIndex` → `searchItems`)
- 키보드 단축키: `Alt+1/2/3` 라우트, `Alt+←/→` 연도 이동
- Union 타입 분기: `ExpenseItem = TransactionItem | ProjectExpense` → `isProjectExpense()`

## Gotchas

- Firebase RTDB는 빈 배열(`[]`)을 자동 삭제함 → `removeItem`은 빈 배열 대신 `null` 저장, `isProjectExpense`는 `items` 부재도 처리
- Firebase는 `undefined` 값을 허용하지 않음 → `stripUndefined` 적용
- `addSortedItem`/`updateSortedItem`은 저장 전 `sortByMonth` 자동 정렬, DnD는 `reorderItems`로 정렬 없이 저장
- 렌더 중 Zustand 스토어 변경 금지 → `useEffect`로 지연 처리
