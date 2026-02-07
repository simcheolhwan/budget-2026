# Budget App

개인/가족 가계부. Firebase Realtime Database 기반 단일 사용자 웹앱.

## Commands

- `pnpm dev` — 개발 서버
- `pnpm build` — 프로덕션 빌드
- `pnpm test` — 테스트 실행
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript 타입 체크

## Architecture

- `src/routes/` — TanStack Router 파일 기반 라우팅
- `src/components/` — React 컴포넌트 (layout, personal, family, shared)
- `src/hooks/` — 커스텀 훅 (Firebase 동기화, CRUD 다이얼로그, DnD)
- `src/lib/` — 유틸리티, Firebase, 계산 로직
- `src/schemas/` — Zod 스키마 (데이터 모델, 폼 검증)
- `src/stores/` — Zustand 스토어 (UI 상태)
- `src/styles/` — 글로벌 CSS, CSS 변수

## Key Patterns

- Firebase 실시간 동기화: `useSyncExternalStore` (`useFirebaseSync`, `useAuth`)
- 폼: React Hook Form + Zod + Base UI Dialog
- 상태: Zustand (UI 상태), Firebase (데이터)
- 테이블 숫자 셀: 오차 기반 편집 모드 (자동/편집 메뉴)
- 정렬: 저장 시 month 기준 자동 정렬 (`addItem`/`updateItem`)
- DnD 순서 변경: dnd-kit (`useSortableList` → `reorderItems`)
- 검색: `⌘K` 전체 검색 (`buildSearchIndex` → `searchItems`)
- 키보드 단축키: `Alt+1/2/3` 라우트, `Alt+←/→` 연도 이동
- Union 타입 분기: `ExpenseItem = TransactionItem | ProjectExpense` → `isProjectExpense()`
