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
  url: string
  type: 'article' | 'video' | 'course' | 'book' | 'tutorial'
  stage: Stage
  description: string
}
