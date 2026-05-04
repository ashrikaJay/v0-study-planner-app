'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, PartyPopper, BookOpen, Play } from 'lucide-react'
import type { Roadmap, Resource, Stage, Priority } from '@/lib/types'

interface TodaysFocusProps {
  roadmaps: Roadmap[]
  resources: Resource[]
  onStartTimer: () => void
}

const stageOrder: Record<Stage, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  Expert: 3,
}

const priorityOrder: Record<Priority, number> = {
  'Read First': 0,
  'Read Later': 1,
  'Optional': 2,
}

const stageColors: Record<Stage, string> = {
  Beginner: 'bg-[oklch(0.7_0.15_165/0.2)] text-[oklch(0.7_0.15_165)]',
  Intermediate: 'bg-[oklch(0.65_0.15_200/0.2)] text-[oklch(0.65_0.15_200)]',
  Advanced: 'bg-[oklch(0.65_0.15_45/0.2)] text-[oklch(0.65_0.15_45)]',
  Expert: 'bg-[oklch(0.55_0.18_330/0.2)] text-[oklch(0.55_0.18_330)]',
}

const priorityColors: Record<Priority, string> = {
  'Read First': 'bg-primary/20 text-primary',
  'Read Later': 'bg-muted text-muted-foreground',
  'Optional': 'bg-secondary text-secondary-foreground',
}

export function TodaysFocus({ roadmaps, resources, onStartTimer }: TodaysFocusProps) {
  // Find first uncompleted resource sorted by stage then priority
  const uncompletedResources = resources
    .filter(r => !r.is_completed)
    .sort((a, b) => {
      const stageCompare = stageOrder[a.stage as Stage] - stageOrder[b.stage as Stage]
      if (stageCompare !== 0) return stageCompare
      return priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
    })

  const focusResource = uncompletedResources[0]

  // Find roadmap name for the focus resource
  const focusRoadmap = focusResource
    ? roadmaps.find(r => r.id === focusResource.roadmap_id)
    : null

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Today&apos;s Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="flex flex-col items-center text-center py-4">
            <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Add resources to your roadmap to get a daily focus.
            </p>
          </div>
        ) : !focusResource ? (
          <div className="flex flex-col items-center text-center py-4">
            <PartyPopper className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              Congratulations!
            </p>
            <p className="text-sm text-muted-foreground">
              You&apos;ve completed all your resources. Time to add more or create a new roadmap!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-foreground text-sm sm:text-base line-clamp-2">
                {focusResource.title}
              </h4>
              {focusRoadmap && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  from {focusRoadmap.topic}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${stageColors[focusResource.stage as Stage]}`}
              >
                {focusResource.stage}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-xs ${priorityColors[focusResource.priority as Priority]}`}
              >
                {focusResource.priority}
              </Badge>
            </div>
            <Button 
              onClick={onStartTimer} 
              size="sm" 
              className="w-full mt-2"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Study Timer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
