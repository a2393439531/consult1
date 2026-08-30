import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ExamSession, Mastery } from '../domain/types'

interface StudyState {
  drafts: Record<string, string>
  bookmarks: Record<string, boolean>
  mastery: Record<string, Mastery>
  lastLocation?: string
  exams: Record<string, ExamSession>
  setDraft: (questionId: string, value: string) => void
  toggleBookmark: (questionId: string) => void
  setMastery: (questionId: string, value: Mastery) => void
  setLastLocation: (location: string) => void
  startExam: (examId: string, now?: number) => void
  setExamDraft: (examId: string, questionId: string, value: string) => void
  setExamIndex: (examId: string, index: number) => void
  setExamMastery: (examId: string, questionId: string, value: Mastery) => void
  submitExam: (examId: string, now?: number) => void
  resetLocalData: () => void
}

const initialState = {
  drafts: {},
  bookmarks: {},
  mastery: {},
  lastLocation: undefined,
  exams: {}
}

const memoryStorage = new Map<string, string>()
const storage = {
  getItem: (name: string) => memoryStorage.get(name) ?? null,
  setItem: (name: string, value: string) => { memoryStorage.set(name, value) },
  removeItem: (name: string) => { memoryStorage.delete(name) }
}

const persistentStorage = () => {
  if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') return localStorage
  return storage
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      ...initialState,
      setDraft: (questionId, value) => set((state) => ({ drafts: { ...state.drafts, [questionId]: value } })),
      toggleBookmark: (questionId) => set((state) => ({ bookmarks: { ...state.bookmarks, [questionId]: !state.bookmarks[questionId] } })),
      setMastery: (questionId, value) => set((state) => ({ mastery: { ...state.mastery, [questionId]: value } })),
      setLastLocation: (lastLocation) => set({ lastLocation }),
      startExam: (examId, now = Date.now()) => set((state) => ({
        exams: {
          ...state.exams,
          [examId]: state.exams[examId]?.status === 'active'
            ? state.exams[examId]
            : { examId, startedAt: now, status: 'active', currentIndex: 0, drafts: {}, mastery: {} }
        }
      })),
      setExamDraft: (examId, questionId, value) => set((state) => {
        const session = state.exams[examId]
        if (!session || session.status !== 'active') return state
        return { exams: { ...state.exams, [examId]: { ...session, drafts: { ...session.drafts, [questionId]: value } } } }
      }),
      setExamIndex: (examId, currentIndex) => set((state) => {
        const session = state.exams[examId]
        if (!session) return state
        return { exams: { ...state.exams, [examId]: { ...session, currentIndex } } }
      }),
      setExamMastery: (examId, questionId, value) => set((state) => {
        const session = state.exams[examId]
        if (!session || session.status !== 'submitted') return state
        return { exams: { ...state.exams, [examId]: { ...session, mastery: { ...session.mastery, [questionId]: value } } } }
      }),
      submitExam: (examId, now = Date.now()) => set((state) => {
        const session = state.exams[examId]
        if (!session || session.status !== 'active') return state
        return { exams: { ...state.exams, [examId]: { ...session, status: 'submitted', submittedAt: now } } }
      }),
      resetLocalData: () => set(initialState)
    }),
    {
      name: 'consult-practice-study-v2',
      version: 2,
      storage: createJSONStorage(persistentStorage),
      partialize: (state) => ({
        drafts: state.drafts,
        bookmarks: state.bookmarks,
        mastery: state.mastery,
        lastLocation: state.lastLocation,
        exams: state.exams
      })
    }
  )
)
