export type Stage = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
export type Priority = 'Read First' | 'Read Later' | 'Optional'

export interface Concept {
  name: string
  description: string
  timeEstimate?: number
}

export interface RoadmapStage {
  name: Stage
  concepts: Concept[]
  timeEstimate?: number
}

export interface Roadmap {
  id: string
  user_id: string
  topic: string
  stages: RoadmapStage[]
  is_public: boolean
  share_code: string | null
  total_time_estimate: number
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  user_id: string
  roadmap_id: string | null
  title: string
  url: string | null
  content: string | null
  stage: Stage
  priority: Priority
  reasoning: string | null
  notes: string | null
  is_completed: boolean
  time_spent: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  user_id: string
  resource_id: string | null
  roadmap_id: string | null
  duration_minutes: number
  date: string
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  created_at: string
  updated_at: string
}

export interface SuggestedResource {
  title: string
  searchQuery: string
  searchUrl: string
  url?: string // deprecated, kept for backward compatibility
  type: 'article' | 'video' | 'course' | 'book' | 'tutorial'
  stage: Stage
  description: string
}

export interface ConceptProgress {
  id: string
  user_id: string
  roadmap_id: string
  stage: Stage
  concept_name: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

export interface DailyGoal {
  id: string
  user_id: string
  daily_minutes_goal: number
  created_at: string
  updated_at: string
}

export type TimerMode = 'study' | 'break' | 'exam' | 'custom'

export interface TimerPreset {
  label: string
  studyMinutes: number
  breakMinutes: number
  mode: TimerMode
}

export const TIMER_PRESETS: TimerPreset[] = [
  { label: 'Pomodoro', studyMinutes: 25, breakMinutes: 5, mode: 'study' },
  { label: 'Long Focus', studyMinutes: 50, breakMinutes: 10, mode: 'study' },
  { label: 'Quick Session', studyMinutes: 15, breakMinutes: 3, mode: 'study' },
  { label: 'Exam Prep (30 min)', studyMinutes: 30, breakMinutes: 0, mode: 'exam' },
  { label: 'Exam Prep (60 min)', studyMinutes: 60, breakMinutes: 0, mode: 'exam' },
]

export const STAGE_COLORS: Record<Stage, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Advanced: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Expert: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

export const STAGE_BG_COLORS: Record<Stage, string> = {
  Beginner: 'bg-emerald-500',
  Intermediate: 'bg-blue-500',
  Advanced: 'bg-amber-500',
  Expert: 'bg-rose-500',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Read First': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Read Later': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Optional': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}
