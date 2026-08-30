interface FilterBarProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  label: string
}

export function FilterBar({ value, onChange, options, label }: FilterBarProps) {
  return (
    <div className="filter-bar" aria-label={label}>
      <span className="filter-label">{label}</span>
      <button className={value === '全部' ? 'filter-chip active' : 'filter-chip'} onClick={() => onChange('全部')}>全部</button>
      {options.map((option) => (
        <button key={option} className={value === option ? 'filter-chip active' : 'filter-chip'} onClick={() => onChange(option)}>{option}</button>
      ))}
    </div>
  )
}
