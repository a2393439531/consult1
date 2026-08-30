import { useEffect, useState } from 'react'
import { elapsedSeconds } from '../domain/exam'
import type { ExamSession } from '../domain/types'

export function ExamTimer({ session, durationMinutes }: { session: ExamSession; durationMinutes: number }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (session.status !== 'active') return
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [session.status])
  const remaining = Math.max(0, durationMinutes * 60 - elapsedSeconds(session))
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60
  return <div className={remaining < 600 ? 'exam-timer urgent' : 'exam-timer'} aria-label={`剩余时间 ${hours} 小时 ${minutes} 分 ${seconds} 秒`}><span>剩余时间</span><strong>{hours > 0 ? `${hours}:` : ''}{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong></div>
}
