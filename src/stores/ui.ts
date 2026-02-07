// UI 전역 상태 (Zustand). 데이터가 아닌 표시 상태만 관리한다.
// - viewMode: raw(전체) / monthly(월별) / category(분류별) 필터링 모드
// - sortVisible: DnD 정렬 UI 활성화 여부. true이면 드래그 핸들 표시, 행 클릭 편집 비활성화.
// - year: 현재 조회 중인 연도. 라우트 진입 시 resetYear로 현재 연도로 리셋.
import { create } from "zustand"
import { getCurrentYear } from "@/lib/utils"

export type ViewMode = "raw" | "monthly" | "category"

interface UIState {
  viewMode: ViewMode
  sortVisible: boolean
  year: number
  setViewMode: (mode: ViewMode) => void
  toggleSort: () => void
  setYear: (year: number) => void
  resetYear: () => void
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "category",
  sortVisible: false,
  year: getCurrentYear(),
  setViewMode: (viewMode) => set({ viewMode }),
  toggleSort: () => set((state) => ({ sortVisible: !state.sortVisible })),
  setYear: (year) => set({ year }),
  resetYear: () => set({ year: getCurrentYear() }),
}))
