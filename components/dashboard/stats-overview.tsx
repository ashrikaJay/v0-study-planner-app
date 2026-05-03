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
      label: 'Active Roadmaps',
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
      value: `${completedResources} (${completionRate}%)`,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      label: 'Current Streak',
      value: `${streak?.current_streak || 0} days`,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    {
      label: 'Study Time',
      value: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
