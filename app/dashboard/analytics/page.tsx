'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Clock, CheckCircle, Flame, BookOpen, Target } from 'lucide-react'
import Link from 'next/link'
import type { Profile, Roadmap, Resource, Streak, StudySession, Stage } from '@/lib/types'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns'

const stageColors: Record<Stage, string> = {
  'Beginner': '#10b981',
  'Intermediate': '#3b82f6',
  'Advanced': '#f59e0b',
  'Expert': '#ec4899',
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, roadmapsRes, resourcesRes, streakRes, sessionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('roadmaps').select('*').eq('user_id', user.id),
        supabase.from('resources').select('*').eq('user_id', user.id),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (roadmapsRes.data) setRoadmaps(roadmapsRes.data)
      if (resourcesRes.data) setResources(resourcesRes.data)
      if (streakRes.data) setStreak(streakRes.data)
      if (sessionsRes.data) setSessions(sessionsRes.data)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Calculate stats
  const totalResources = resources.length
  const completedResources = resources.filter(r => r.is_completed).length
  const completionRate = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0

  const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration_minutes, 0)
  const avgSessionTime = sessions.length > 0 ? Math.round(totalStudyTime / sessions.length) : 0

  // Resources by stage
  const stageData = (['Beginner', 'Intermediate', 'Advanced', 'Expert'] as Stage[]).map(stage => ({
    name: stage,
    total: resources.filter(r => r.stage === stage).length,
    completed: resources.filter(r => r.stage === stage && r.is_completed).length,
    color: stageColors[stage],
  }))

  // Study activity over last 7 days
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  })

  const activityData = last7Days.map(day => {
    const dayStart = startOfDay(day)
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayMinutes = sessions
      .filter(s => s.date === dayStr)
      .reduce((acc, s) => acc + s.duration_minutes, 0)
    
    return {
      day: format(day, 'EEE'),
      minutes: dayMinutes,
    }
  })

  // Priority distribution
  const priorityData = [
    { name: 'Read First', value: resources.filter(r => r.priority === 'Read First').length, color: '#ef4444' },
    { name: 'Read Later', value: resources.filter(r => r.priority === 'Read Later').length, color: '#f59e0b' },
    { name: 'Optional', value: resources.filter(r => r.priority === 'Optional').length, color: '#6b7280' },
  ].filter(p => p.value > 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your learning progress</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{streak?.current_streak || 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{Math.floor(totalStudyTime / 60)}h</p>
                  <p className="text-xs text-muted-foreground">Total Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedResources}</p>
                  <p className="text-xs text-muted-foreground">Resources Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Activity Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Study Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Resources by Stage */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Progress by Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {stageData.map(stage => (
                  <div key={stage.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{stage.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {stage.completed}/{stage.total}
                      </span>
                    </div>
                    <Progress 
                      value={stage.total > 0 ? (stage.completed / stage.total) * 100 : 0} 
                      className="h-2"
                      style={{ '--progress-color': stage.color } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          {priorityData.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Resource Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {priorityData.map(p => (
                    <div key={p.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-muted-foreground">{p.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <MilestoneItem 
                  title="First Roadmap" 
                  achieved={roadmaps.length >= 1}
                  description="Create your first learning roadmap"
                />
                <MilestoneItem 
                  title="Resource Collector" 
                  achieved={totalResources >= 10}
                  description="Add 10 resources to your library"
                />
                <MilestoneItem 
                  title="Consistent Learner" 
                  achieved={(streak?.current_streak || 0) >= 7}
                  description="Maintain a 7-day study streak"
                />
                <MilestoneItem 
                  title="Stage Master" 
                  achieved={stageData.some(s => s.total > 0 && s.completed === s.total)}
                  description="Complete all resources in a stage"
                />
                <MilestoneItem 
                  title="Hour Scholar" 
                  achieved={totalStudyTime >= 60}
                  description="Study for a total of 1 hour"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function MilestoneItem({ 
  title, 
  description, 
  achieved 
}: { 
  title: string
  description: string
  achieved: boolean 
}) {
  return (
    <div className={`p-3 rounded-lg border ${achieved ? 'bg-primary/5 border-primary/30' : 'bg-secondary/30 border-border'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-full ${achieved ? 'bg-primary' : 'bg-muted'}`}>
          <CheckCircle className={`h-4 w-4 ${achieved ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <h4 className={`text-sm font-medium ${achieved ? 'text-foreground' : 'text-muted-foreground'}`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
