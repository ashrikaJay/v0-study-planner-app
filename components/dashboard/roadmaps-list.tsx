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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">My Roadmaps</CardTitle>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Roadmap
        </Button>
      </CardHeader>
      <CardContent>
        {roadmaps.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Route className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No roadmaps yet</EmptyTitle>
              <EmptyDescription>
                Create your first learning roadmap to get started
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Create Roadmap
            </Button>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {roadmaps.map((roadmap) => {
              const progress = getProgress(roadmap.id)
              const resourceCount = getResourceCount(roadmap.id)
              
              return (
                <Link
                  key={roadmap.id}
                  href={`/dashboard/roadmap/${roadmap.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {roadmap.topic}
                          </h3>
                          {roadmap.is_public ? (
                            <Badge variant="outline" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {roadmap.stages.length} stages · {resourceCount} resources
                        </p>
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground w-10">
                            {progress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
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
