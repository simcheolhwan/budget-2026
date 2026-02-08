import { useCallback, useMemo, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { ScrollArea } from "@base-ui/react/scroll-area"
import { IconSearch } from "@tabler/icons-react"
import styles from "./SearchDialog.module.css"
import type { SearchResult } from "@/lib/search"
import { useFirebaseData } from "@/contexts/FirebaseDataContext"
import { buildSearchIndex, searchItems } from "@/lib/search"
import { formatNumber } from "@/lib/utils"

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

const SOURCE_LABELS: Record<string, string> = {
  personal: "나",
  family: "가족",
}

// 검색 결과 한 줄 표시
function SearchResultRow({ result }: { result: SearchResult }) {
  return (
    <li className={styles.resultItem}>
      <div className={styles.resultLeft}>
        <span className={styles.resultName}>{result.name}</span>
        <span className={styles.resultMeta}>
          <span className={styles.sourceBadge} data-source={result.source}>
            {SOURCE_LABELS[result.source]}
          </span>
          <span>
            {result.year}년{result.month ? ` ${result.month}월` : ""}
          </span>
          {result.category && (
            <span className={styles.metaLabel}>
              분류 <span className={styles.metaValue}>{result.category}</span>
            </span>
          )}
          {result.projectName && (
            <span className={styles.metaLabel}>
              프로젝트 <span className={styles.metaValue}>{result.projectName}</span>
            </span>
          )}
          {result.memo && (
            <span className={styles.metaLabel}>
              메모 <span className={styles.metaValue}>{result.memo}</span>
            </span>
          )}
        </span>
      </div>
      <span className={styles.resultAmount}>{formatNumber(result.amount)}</span>
    </li>
  )
}

// 검색 다이얼로그 (⌘K)
export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("")

  const { personal, family } = useFirebaseData()

  const index = useMemo(
    () => buildSearchIndex(personal.data, family.data),
    [personal.data, family.data],
  )

  const results = useMemo(() => searchItems(query, index), [query, index])

  const handleClose = useCallback(() => {
    setQuery("")
    onClose()
  }, [onClose])

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup} role="dialog" aria-label="검색">
          <div className={styles.searchHeader}>
            <IconSearch size={20} aria-hidden />
            <input
              className={styles.searchInput}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="항목 검색…"
              aria-label="검색어"
              autoFocus
            />
          </div>

          <ScrollArea.Root className={styles.scrollRoot}>
            <ScrollArea.Viewport>
              <ScrollArea.Content>
                {query.trim() === "" ? null : results.length === 0 ? (
                  <p className={styles.empty}>검색 결과가 없습니다</p>
                ) : (
                  <ul className={styles.results} role="list">
                    {results.map((result, i) => (
                      <SearchResultRow key={i} result={result} />
                    ))}
                  </ul>
                )}
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
