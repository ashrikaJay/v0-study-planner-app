'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Route, BookOpen, CheckCircle, Flame, Clock } from 'lucide-react'
import type { Roadmap, Resource, Streak, StudySession } from '@/lib/types'

interface StatsOverviewProps {
  roadmaps: Roadmap[]
  resources: Resource[]
  streak: Streak | null
  sessions: StudySession[]
}

export function StatsOverview({ roadmaps, resources, streak, sessions }: StatsOverviewProps) {
  const completedResources = resources.filter(r => r.is_completed).length
  const totalResources = resources.length
  const completionRate = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0

  const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration_minutes, 0)
  const hours = Math.floor(totalStudyTime / 60)
  const minutes = totalStudyTime % 60

  const stats = [
    {
      label: 'Roadmaps',
      value: roadmaps.length,
      icon: Route,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Resources',
      value: totalResources,
      icon: BookOpen,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Completed',
      value: `${completedResources}`,
      subValue: `${completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      label: 'Streak',
      value: streak?.current_streak || 0,
      subValue: 'days',
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    {
      label: 'Study Time',
      value: hours > 0 ? `${hours}h` : `${minutes}m`,
      subValue: hours > 0 ? `${minutes}m` : undefined,
      icon: Clock,
      color: 'text-violet-400',
      bgColor: 'bg-violet-400/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} shrink-0`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{stat.value}</p>
                  {stat.subValue && (
                    <span className="text-xs sm:text-sm text-muted-foreground">{stat.subValue}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
