import type { SourceRef } from '../domain/types'

export function SourceNote({ sources }: { sources: SourceRef[] }) {
  return (
    <div className="source-note">
      <span className="source-icon" aria-hidden="true">↗</span>
      <span>来源：{sources.map((source) => `${source.file_name}（第 ${source.pages[0] ?? 1} 页${source.pages.length > 1 ? `–${source.pages[source.pages.length - 1]}` : ''}）`).join('；')}</span>
    </div>
  )
}
