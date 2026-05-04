'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RoadmapsList } from '@/components/dashboard/roadmaps-list'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { CreateRoadmapDialog } from '@/components/dashboard/create-roadmap-dialog'
import { DailyGoal } from '@/components/daily-goal'
import { StudyTimer } from '@/components/study-timer'
import { QuickActions } from '@/components/quick-actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Roadmap, Resource, Profile, Streak, StudySession } from '@/lib/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)

  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, roadmapsRes, resourcesRes, streakRes, sessionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('roadmaps').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('resources').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (roadmapsRes.data) setRoadmaps(roadmapsRes.data)
    if (resourcesRes.data) setResources(resourcesRes.data)
    if (streakRes.data) setStreak(streakRes.data)
    if (sessionsRes.data) setSessions(sessionsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRoadmapCreated = (newRoadmap: Roadmap) => {
    setRoadmaps([newRoadmap, ...roadmaps])
    setCreateDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 border-b border-border bg-card">
          <div className="container mx-auto px-4 h-full flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <div className="flex flex-col gap-4 sm:gap-8">
            {/* Stats row - 5 cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 sm:h-28 rounded-lg" />
              ))}
            </div>
            
            {/* 2/3 + 1/3 grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-80 sm:h-96 rounded-lg" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-48 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <DashboardHeader profile={profile} />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="flex flex-col gap-4 sm:gap-8">
          {/* Mobile daily goal */}
          <div className="sm:hidden">
            <DailyGoal />
          </div>

          <StatsOverview 
            roadmaps={roadmaps} 
            resources={resources} 
            streak={streak}
            sessions={sessions}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-8">
              <RoadmapsList 
                roadmaps={roadmaps} 
                resources={resources}
                onCreateNew={() => setCreateDialogOpen(true)}
                onRefresh={fetchData}
              />
            </div>
            <div className="space-y-4 sm:space-y-6">
              {/* Desktop daily goal & timer */}
              <div className="hidden sm:block space-y-4">
                <DailyGoal />
                <StudyTimer onSessionComplete={fetchData} />
              </div>
              <RecentActivity 
                sessions={sessions} 
                resources={resources}
                roadmaps={roadmaps}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Quick Actions */}
      <QuickActions
        onOpenTimer={() => setTimerOpen(true)}
        onAddResource={() => {}}
        onCreateRoadmap={() => setCreateDialogOpen(true)}
      />

      {/* Mobile Timer Dialog */}
      <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Study Timer</DialogTitle>
          </DialogHeader>
          <StudyTimer onSessionComplete={() => { fetchData(); setTimerOpen(false); }} />
        </DialogContent>
      </Dialog>

      <CreateRoadmapDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleRoadmapCreated}
      />
    </div>
  )
}
