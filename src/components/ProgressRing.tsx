export function ProgressRing({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div className="progress-ring" aria-label={`${label} ${safeValue}%`}>
      <span style={{ '--progress': `${safeValue}%` } as React.CSSProperties}>{safeValue}%</span>
    </div>
  )
}
