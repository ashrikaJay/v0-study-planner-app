export type Stage = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type Priority = 'read-first' | 'read-later' | 'optional'

export interface Concept {
  name: string
  description: string
}

export interface RoadmapStage {
  stage: Stage
  title: string
  concepts: Concept[]
}

export interface Roadmap {
  id: string
  topic: string
  stages: RoadmapStage[]
  createdAt: Date
}

export interface Resource {
  id: string
  roadmapId: string
  title: string
  content: string
  url?: string
  stage: Stage
  priority: Priority
  completed: boolean
  createdAt: Date
}
