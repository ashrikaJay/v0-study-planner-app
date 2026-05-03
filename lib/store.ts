import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Roadmap, Resource, Stage, Priority } from './types'

interface StudyStore {
  roadmaps: Roadmap[]
  resources: Resource[]
  activeRoadmapId: string | null
  
  // Roadmap actions
  addRoadmap: (roadmap: Roadmap) => void
  setActiveRoadmap: (id: string | null) => void
  getActiveRoadmap: () => Roadmap | null
  
  // Resource actions
  addResource: (resource: Resource) => void
  toggleResourceComplete: (id: string) => void
  getResourcesByStage: (roadmapId: string, stage: Stage) => Resource[]
  getResourcesByRoadmap: (roadmapId: string) => Resource[]
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      roadmaps: [],
      resources: [],
      activeRoadmapId: null,
      
      addRoadmap: (roadmap) => {
        set((state) => ({
          roadmaps: [...state.roadmaps, roadmap],
          activeRoadmapId: roadmap.id,
        }))
      },
      
      setActiveRoadmap: (id) => {
        set({ activeRoadmapId: id })
      },
      
      getActiveRoadmap: () => {
        const state = get()
        return state.roadmaps.find((r) => r.id === state.activeRoadmapId) ?? null
      },
      
      addResource: (resource) => {
        set((state) => ({
          resources: [...state.resources, resource],
        }))
      },
      
      toggleResourceComplete: (id) => {
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, completed: !r.completed } : r
          ),
        }))
      },
      
      getResourcesByStage: (roadmapId, stage) => {
        const state = get()
        return state.resources.filter(
          (r) => r.roadmapId === roadmapId && r.stage === stage
        )
      },
      
      getResourcesByRoadmap: (roadmapId) => {
        const state = get()
        return state.resources.filter((r) => r.roadmapId === roadmapId)
      },
    }),
    {
      name: 'studypath-storage',
    }
  )
)
