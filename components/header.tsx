'use client'

import { GraduationCap, ChevronDown } from 'lucide-react'
import { useStudyStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function Header() {
  const { roadmaps, activeRoadmapId, setActiveRoadmap } = useStudyStore()
  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              StudyPath
            </span>
          </div>

          {roadmaps.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-secondary border-border text-foreground"
                >
                  {activeRoadmap?.topic || 'Select Roadmap'}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {roadmaps.map((roadmap) => (
                  <DropdownMenuItem
                    key={roadmap.id}
                    onClick={() => setActiveRoadmap(roadmap.id)}
                    className={
                      roadmap.id === activeRoadmapId
                        ? 'bg-accent'
                        : ''
                    }
                  >
                    {roadmap.topic}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
