import styles from "./CategoryPills.module.css"

interface CategoryPillsProps {
  value: string
  onChange: (value: string) => void
  categories: Array<string>
  readOnly?: boolean
}

// 분류 선택 (자유 입력 + pill 목록)
export function CategoryPills({ value, onChange, categories, readOnly }: CategoryPillsProps) {
  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="분류…"
        aria-label="분류"
        autoFocus={!readOnly}
        readOnly={readOnly}
      />
      {categories.length > 0 && (
        <div className={styles.pills}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              tabIndex={-1}
              className={styles.pill}
              data-active={value === category || undefined}
              onClick={() => onChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
