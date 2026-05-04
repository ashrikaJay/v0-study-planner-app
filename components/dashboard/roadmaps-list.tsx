'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Plus, Route, ChevronRight, Globe, Lock } from 'lucide-react'
import type { Roadmap, Resource } from '@/lib/types'

interface RoadmapsListProps {
  roadmaps: Roadmap[]
  resources: Resource[]
  onCreateNew: () => void
  onRefresh: () => void
}

export function RoadmapsList({ roadmaps, resources, onCreateNew }: RoadmapsListProps) {
  const getProgress = (roadmapId: string) => {
    const roadmapResources = resources.filter(r => r.roadmap_id === roadmapId)
    if (roadmapResources.length === 0) return 0
    const completed = roadmapResources.filter(r => r.is_completed).length
    return Math.round((completed / roadmapResources.length) * 100)
  }

  const getResourceCount = (roadmapId: string) => {
    return resources.filter(r => r.roadmap_id === roadmapId).length
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between py-3 sm:py-4">
        <CardTitle className="text-foreground text-base sm:text-lg">My Roadmaps</CardTitle>
        <Button onClick={onCreateNew} size="sm" className="h-8 text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden xs:inline">New </span>Roadmap
        </Button>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {roadmaps.length === 0 ? (
          <Empty className="py-6 sm:py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Route className="h-5 w-5 sm:h-6 sm:w-6" />
              </EmptyMedia>
              <EmptyTitle className="text-sm sm:text-base">No roadmaps yet</EmptyTitle>
              <EmptyDescription className="text-xs sm:text-sm">
                Create your first learning roadmap to get started
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={onCreateNew} className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Roadmap
            </Button>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2 sm:gap-3">
            {roadmaps.map((roadmap) => {
              const progress = getProgress(roadmap.id)
              const resourceCount = getResourceCount(roadmap.id)
              
              return (
                <Link
                  key={roadmap.id}
                  href={`/dashboard/roadmap/${roadmap.id}`}
                  className="block"
                >
                  <div className="p-3 sm:p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors active:bg-secondary/60">
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                            {roadmap.topic}
                          </h3>
                          {roadmap.is_public ? (
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 shrink-0">
                              <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">Public</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 shrink-0">
                              <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          {roadmap.stages.length} stages · {resourceCount} resources
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Progress value={progress} className="flex-1 h-1.5 sm:h-2" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
