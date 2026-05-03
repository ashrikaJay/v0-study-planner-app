'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RoadmapsList } from '@/components/dashboard/roadmaps-list'
import { StatsOverview } from '@/components/dashboard/stats-overview'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { CreateRoadmapDialog } from '@/components/dashboard/create-roadmap-dialog'
import type { Roadmap, Resource, Profile, Streak, StudySession } from '@/lib/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-8">
          <StatsOverview 
            roadmaps={roadmaps} 
            resources={resources} 
            streak={streak}
            sessions={sessions}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RoadmapsList 
                roadmaps={roadmaps} 
                resources={resources}
                onCreateNew={() => setCreateDialogOpen(true)}
                onRefresh={fetchData}
              />
            </div>
            <div>
              <RecentActivity 
                sessions={sessions} 
                resources={resources}
                roadmaps={roadmaps}
              />
            </div>
          </div>
        </div>
      </main>

      <CreateRoadmapDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleRoadmapCreated}
      />
    </div>
  )
}
