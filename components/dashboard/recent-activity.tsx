'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Clock, BookOpen } from 'lucide-react'
import type { StudySession, Resource, Roadmap } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityProps {
  sessions: StudySession[]
  resources: Resource[]
  roadmaps: Roadmap[]
}

export function RecentActivity({ sessions, resources, roadmaps }: RecentActivityProps) {
  const getResourceTitle = (resourceId: string | null) => {
    if (!resourceId) return 'Unknown resource'
    const resource = resources.find(r => r.id === resourceId)
    return resource?.title || 'Unknown resource'
  }

  const getRoadmapTopic = (roadmapId: string | null) => {
    if (!roadmapId) return null
    const roadmap = roadmaps.find(r => r.id === roadmapId)
    return roadmap?.topic || null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No activity yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                Start studying to track your progress
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.slice(0, 5).map((session) => {
              const roadmapTopic = getRoadmapTopic(session.roadmap_id)
              
              return (
                <div
                  key={session.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {session.resource_id 
                        ? getResourceTitle(session.resource_id)
                        : roadmapTopic || 'Study session'
                      }
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.duration_minutes} min</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
