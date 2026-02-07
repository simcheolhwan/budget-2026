import { Select } from "@base-ui/react/select"
import { IconChevronDown } from "@tabler/icons-react"
import styles from "./YearSelect.module.css"
import { formatNumber } from "@/lib/utils"
import { useAltKey } from "@/hooks/useAltKey"

interface YearSelectProps {
  years: Array<number>
  currentYear: number
  balance: number
  onYearChange: (year: number) => void
}

// 연도 선택 드롭다운 (트리거 = 연도 텍스트)
export function YearSelect({ years, currentYear, balance, onYearChange }: YearSelectProps) {
  const altPressed = useAltKey()

  const currentIndex = years.indexOf(currentYear)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex >= 0 && currentIndex < years.length - 1

  return (
    <div className={styles.wrapper}>
      <Select.Root
        value={currentYear}
        onValueChange={(val) => {
          if (val !== null) onYearChange(val)
        }}
      >
        <Select.Trigger className={styles.trigger} aria-label="연도 선택">
          {altPressed && canGoPrev && (
            <kbd className={styles.yearBadge} aria-hidden>
              ←
            </kbd>
          )}
          <Select.Value>{currentYear}</Select.Value>
          {altPressed && canGoNext && (
            <kbd className={styles.yearBadge} aria-hidden>
              →
            </kbd>
          )}
          <Select.Icon className={styles.triggerIcon}>
            <IconChevronDown size={16} aria-hidden />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner
            className={styles.positioner}
            align="start"
            side="bottom"
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <Select.Popup className={styles.popup}>
              <Select.List>
                {years.map((year) => (
                  <Select.Item className={styles.item} key={year} value={year}>
                    <Select.ItemText>{year}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>

      <span data-balance className={styles.balance} aria-label="수지">
        {formatNumber(balance)}
      </span>
    </div>
  )
}
