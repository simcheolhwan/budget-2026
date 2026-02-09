import { useCallback, useMemo, useState } from "react"
import { IconQuestionMark } from "@tabler/icons-react"
import { ExpenseFormDialog } from "./ExpenseFormDialog"
import { ProjectDetailDialog } from "./ProjectDetailDialog"
import { ProjectBadge } from "./ProjectBadge"
import { ConfirmDialog } from "./ConfirmDialog"
import styles from "./ProjectsPage.module.css"
import type { ExpenseItem, ProjectExpense, ProjectItem, YearData } from "@/schemas"
import { useFirebaseData } from "@/contexts/FirebaseDataContext"
import { formatNumber, getProjectItems, isProjectExpense } from "@/lib/utils"
import { sumAmounts } from "@/lib/calculations"
import { sourcePath } from "@/lib/paths"
import { removeItem, updateSortedItem } from "@/lib/database"
import { useCrudDialogs } from "@/hooks/useCrudDialogs"

// CRUD를 위한 원본 위치 정보를 포함한 프로젝트 항목
interface ProjectEntry {
  source: "personal" | "family"
  year: number
  project: ProjectExpense
  path: string
  items: Array<ExpenseItem>
  originalIndex: number
}

function collectProjects(
  data: Record<string, YearData> | null,
  source: "personal" | "family",
): Array<ProjectEntry> {
  if (!data) return []
  const results: Array<ProjectEntry> = []

  for (const [yearStr, yearData] of Object.entries(data)) {
    const year = Number(yearStr)
    const items = yearData.expenses?.items ?? []
    const path = sourcePath(source, year, "expenses", "items")

    items.forEach((item, index) => {
      if (isProjectExpense(item)) {
        results.push({ source, year, project: item, path, items, originalIndex: index })
      }
    })
  }

  return results.sort((a, b) => b.year - a.year)
}

// 폼 자동완성을 위한 프로젝트 분류 수집
function collectCategories(entries: Array<ProjectEntry>): Array<string> {
  const set = new Set<string>()
  for (const entry of entries) {
    if (entry.project.category) set.add(entry.project.category)
  }
  return [...set].sort()
}

// 섹션 헤더용 연도별 그룹핑
function groupByYear(entries: Array<ProjectEntry>): Array<[number, Array<ProjectEntry>]> {
  const map = new Map<number, Array<ProjectEntry>>()
  for (const entry of entries) {
    const group = map.get(entry.year)
    if (group) group.push(entry)
    else map.set(entry.year, [entry])
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0])
}

// 프로젝트 한 컬럼 (개인 또는 가족)
function ProjectColumn({
  label,
  entries,
  categories,
}: {
  label: string
  entries: Array<ProjectEntry>
  categories: Array<string>
}) {
  const { editIndex, deleteIndex, openEdit, closeEdit, requestDelete, closeDelete } =
    useCrudDialogs()

  const [projectDetail, setProjectDetail] = useState<{
    entryIndex: number
    entry: ProjectEntry
  } | null>(null)

  const yearGroups = useMemo(() => groupByYear(entries), [entries])
  const total = useMemo(
    () => entries.reduce((sum, e) => sum + sumAmounts(getProjectItems(e.project)), 0),
    [entries],
  )

  // 행 클릭 → 수정 모달
  const handleRowClick = useCallback((entryIndex: number) => openEdit(entryIndex), [openEdit])

  // 금액 클릭 → 프로젝트 상세 모달
  const handleAmountClick = useCallback(
    (entryIndex: number) => {
      setProjectDetail({ entryIndex, entry: entries[entryIndex] })
    },
    [entries],
  )

  // 수정 제출
  const handleEdit = useCallback(
    async (item: ExpenseItem) => {
      if (editIndex === null) return
      const entry = entries[editIndex]
      await updateSortedItem(entry.path, entry.items, entry.originalIndex, item)
    },
    [entries, editIndex],
  )

  // 삭제 확인
  const handleDelete = useCallback(async () => {
    if (deleteIndex === null) return
    const entry = entries[deleteIndex]
    await removeItem(entry.path, entry.items, entry.originalIndex)
    closeDelete()
  }, [entries, deleteIndex, closeDelete])

  // 프로젝트 하위 항목 갱신
  const handleProjectUpdate = useCallback(
    async (subItems: Array<ProjectItem>) => {
      if (!projectDetail) return
      const { entry } = projectDetail
      const updated = { ...entry.project, items: subItems }
      await updateSortedItem(entry.path, entry.items, entry.originalIndex, updated)
      setProjectDetail({
        ...projectDetail,
        entry: { ...entry, project: updated },
      })
    },
    [projectDetail],
  )

  if (entries.length === 0) {
    return (
      <section className={styles.column} data-items>
        <h3 className={styles.columnTitle}>{label}</h3>
        <p data-empty>프로젝트 없음</p>
      </section>
    )
  }

  // Track flat index across year groups
  let flatIndex = 0

  return (
    <section className={styles.column} data-items>
      <h3 className={styles.columnTitle}>{label}</h3>

      <table>
        <thead>
          <tr>
            <th className={styles.yearCol}>연도</th>
            <th className={styles.catCol}>분류</th>
            <th>항목</th>
            <th>메모</th>
            <th>{formatNumber(total)}</th>
          </tr>
        </thead>
        <tbody>
          {yearGroups.map(([year, group]) => {
            const startIndex = flatIndex
            flatIndex += group.length
            return group.map((entry, i) => {
              const entryIndex = startIndex + i
              const subItems = getProjectItems(entry.project)
              const amount = sumAmounts(subItems)

              return (
                <tr key={`${year}-${i}`} onClick={() => handleRowClick(entryIndex)} data-clickable>
                  {i === 0 && (
                    <td rowSpan={group.length} className={styles.yearCell}>
                      {year}
                    </td>
                  )}
                  <td data-placeholder={!entry.project.category || undefined}>
                    {entry.project.category || <IconQuestionMark size={14} />}
                  </td>
                  <td>
                    {entry.project.name}
                    <ProjectBadge />
                  </td>
                  <td data-memo>{entry.project.memo}</td>
                  <td
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAmountClick(entryIndex)
                    }}
                  >
                    {formatNumber(amount)}
                  </td>
                </tr>
              )
            })
          })}
        </tbody>
      </table>

      {/* Edit dialog */}
      <ExpenseFormDialog
        open={editIndex !== null}
        onClose={closeEdit}
        mode="edit"
        defaultValues={editIndex !== null ? entries[editIndex].project : undefined}
        categories={categories}
        onSubmit={handleEdit}
        onDelete={() => {
          if (editIndex !== null) requestDelete(editIndex)
        }}
      />

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteIndex !== null}
        onClose={closeDelete}
        onConfirm={handleDelete}
        title="항목 삭제"
        description="이 항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
      />

      {/* Project detail dialog */}
      {projectDetail && (
        <ProjectDetailDialog
          open
          onClose={() => setProjectDetail(null)}
          project={projectDetail.entry.project}
          onUpdate={handleProjectUpdate}
        />
      )}
    </section>
  )
}

// Projects page: left (personal) + right (family)
export function ProjectsPage() {
  const { personal, family } = useFirebaseData()

  const personalEntries = useMemo(() => collectProjects(personal.data, "personal"), [personal.data])

  const familyEntries = useMemo(() => collectProjects(family.data, "family"), [family.data])

  const personalCategories = useMemo(() => collectCategories(personalEntries), [personalEntries])

  const familyCategories = useMemo(() => collectCategories(familyEntries), [familyEntries])

  const loading = personal.loading || family.loading
  if (loading) return <div data-loading>로딩 중…</div>

  return (
    <div className={styles.layout}>
      <div className={styles.columnsSection}>
        <ProjectColumn label="나" entries={personalEntries} categories={personalCategories} />
        <ProjectColumn label="가족" entries={familyEntries} categories={familyCategories} />
      </div>
    </div>
  )
}
