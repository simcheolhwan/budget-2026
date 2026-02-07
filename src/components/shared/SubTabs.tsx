import { Tabs } from "@base-ui/react/tabs"
import { IconLayoutGrid, IconQuestionMark } from "@tabler/icons-react"
import styles from "./SubTabs.module.css"

interface SubTabsProps {
  tabs: Array<number | string | undefined>
  activeTab: number | string | undefined | null
  onTabChange: (value: number | string | undefined | null) => void
  labelFn?: (tab: number | string | undefined) => string
}

// 월별/분류별 하위 탭
export function SubTabs({ tabs, activeTab, onTabChange, labelFn }: SubTabsProps) {
  // 빈 탭: 레이아웃 쉬프트 방지를 위해 높이 유지
  if (tabs.length === 0) return <div className={styles.placeholder} />

  const hasUndefined = tabs.includes(undefined)
  const definedTabs = tabs.filter((t) => t !== undefined)

  return (
    <Tabs.Root
      value={activeTab === null ? "all" : String(activeTab)}
      onValueChange={(val) => {
        if (val === "all") {
          onTabChange(null)
          return
        }
        if (val === "undefined") {
          onTabChange(undefined)
          return
        }
        // 숫자(월)인지 문자열(분류)인지 판별
        const num = Number(val)
        onTabChange(Number.isNaN(num) ? val : num)
      }}
    >
      <Tabs.List className={styles.list} activateOnFocus>
        <Tabs.Tab className={styles.iconTab} value="all" aria-label="모두">
          <IconLayoutGrid size={16} aria-hidden />
        </Tabs.Tab>

        {hasUndefined && (
          <Tabs.Tab className={styles.iconTab} value="undefined" aria-label="미지정">
            <IconQuestionMark size={16} aria-hidden />
          </Tabs.Tab>
        )}

        {definedTabs.map((tab) => (
          <Tabs.Tab className={styles.tab} key={String(tab)} value={String(tab)}>
            {labelFn ? labelFn(tab) : typeof tab === "number" ? `${tab}월` : tab}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
