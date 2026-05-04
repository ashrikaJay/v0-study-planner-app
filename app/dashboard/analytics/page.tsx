'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, TrendingUp, Clock, CheckCircle, Flame, BookOpen, Target, Calendar, Trophy } from 'lucide-react'
import Link from 'next/link'
import type { Profile, Roadmap, Resource, Streak, StudySession, Stage, ConceptProgress } from '@/lib/types'
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
  AreaChart,
  Area
} from 'recharts'
import { subDays, format, eachDayOfInterval } from 'date-fns'

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
  const [conceptProgress, setConceptProgress] = useState<ConceptProgress[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, roadmapsRes, resourcesRes, streakRes, sessionsRes, conceptRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('roadmaps').select('*').eq('user_id', user.id),
        supabase.from('resources').select('*').eq('user_id', user.id),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('study_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('concept_progress').select('*').eq('user_id', user.id),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (roadmapsRes.data) setRoadmaps(roadmapsRes.data)
      if (resourcesRes.data) setResources(resourcesRes.data)
      if (streakRes.data) setStreak(streakRes.data)
      if (sessionsRes.data) setSessions(sessionsRes.data)
      if (conceptRes.data) setConceptProgress(conceptRes.data)
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

  const totalConcepts = roadmaps.reduce((acc, r) => acc + r.stages.reduce((a, s) => a + s.concepts.length, 0), 0)
  const completedConcepts = conceptProgress.filter(c => c.is_completed).length
  const conceptCompletionRate = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0

  const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration_minutes, 0)
  const avgSessionTime = sessions.length > 0 ? Math.round(totalStudyTime / sessions.length) : 0

  // Today's study time
  const today = new Date().toISOString().split('T')[0]
  const todayStudyTime = sessions.filter(s => s.date === today).reduce((acc, s) => acc + s.duration_minutes, 0)

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
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayMinutes = sessions
      .filter(s => s.date === dayStr)
      .reduce((acc, s) => acc + s.duration_minutes, 0)
    
    return {
      day: format(day, 'EEE'),
      fullDay: format(day, 'MMM d'),
      minutes: dayMinutes,
    }
  })

  // Last 30 days for trend
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  })

  const trendData = last30Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayMinutes = sessions
      .filter(s => s.date === dayStr)
      .reduce((acc, s) => acc + s.duration_minutes, 0)
    
    return {
      day: format(day, 'MMM d'),
      minutes: dayMinutes,
    }
  })

  // Priority distribution
  const priorityData = [
    { name: 'Read First', value: resources.filter(r => r.priority === 'Read First').length, color: '#ef4444' },
    { name: 'Read Later', value: resources.filter(r => r.priority === 'Read Later').length, color: '#f59e0b' },
    { name: 'Optional', value: resources.filter(r => r.priority === 'Optional').length, color: '#6b7280' },
  ].filter(p => p.value > 0)

  // Concept progress by stage
  const conceptStageData = (['Beginner', 'Intermediate', 'Advanced', 'Expert'] as Stage[]).map(stage => {
    const stageConcepts = roadmaps.reduce((acc, r) => {
      const stageObj = r.stages.find(s => s.name === stage)
      return acc + (stageObj?.concepts.length || 0)
    }, 0)
    const stageCompleted = conceptProgress.filter(c => c.stage === stage && c.is_completed).length
    return {
      name: stage,
      total: stageConcepts,
      completed: stageCompleted,
      color: stageColors[stage],
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Track your learning progress</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{conceptCompletionRate}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Concepts Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10 shrink-0">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{streak?.current_streak || 0}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Study</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{completedConcepts}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Concepts Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for mobile */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs sm:text-sm">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Weekly Study Activity */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickMargin={8} />
                        <YAxis stroke="#6b7280" fontSize={10} width={30} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [`${value} min`, 'Study Time']}
                          labelFormatter={(label, payload) => payload[0]?.payload?.fullDay || label}
                        />
                        <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 30-day Trend */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    30-Day Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickMargin={8} interval="preserveStartEnd" />
                        <YAxis stroke="#6b7280" fontSize={10} width={30} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: number) => [`${value} min`, 'Study Time']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="minutes" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{todayStudyTime}m</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{avgSessionTime}m</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Session</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{sessions.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Sessions</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{streak?.longest_streak || 0}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Best Streak</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Concept Progress by Stage */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Concepts by Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {conceptStageData.map(stage => (
                      <div key={stage.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-foreground">{stage.name}</span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {stage.completed}/{stage.total}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: stage.total > 0 ? `${(stage.completed / stage.total) * 100}%` : '0%',
                              backgroundColor: stage.color 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resources by Stage */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Resources by Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {stageData.map(stage => (
                      <div key={stage.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm font-medium text-foreground">{stage.name}</span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {stage.completed}/{stage.total}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: stage.total > 0 ? `${(stage.completed / stage.total) * 100}%` : '0%',
                              backgroundColor: stage.color 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              {priorityData.length > 0 && (
                <Card className="bg-card border-border lg:col-span-2">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-foreground text-sm sm:text-base">Resource Priorities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="h-40 sm:h-48 w-40 sm:w-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={priorityData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
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
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-3 sm:gap-2">
                        {priorityData.map(p => (
                          <div key={p.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                            <span className="text-xs sm:text-sm text-muted-foreground">{p.name} ({p.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-foreground text-sm sm:text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
                    title="7-Day Streak" 
                    achieved={(streak?.current_streak || 0) >= 7}
                    description="Maintain a 7-day study streak"
                  />
                  <MilestoneItem 
                    title="30-Day Streak" 
                    achieved={(streak?.current_streak || 0) >= 30}
                    description="Maintain a 30-day study streak"
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
                  <MilestoneItem 
                    title="10 Hour Scholar" 
                    achieved={totalStudyTime >= 600}
                    description="Study for a total of 10 hours"
                  />
                  <MilestoneItem 
                    title="Concept Master" 
                    achieved={completedConcepts >= 50}
                    description="Complete 50 concepts"
                  />
                  <MilestoneItem 
                    title="Roadmap Pro" 
                    achieved={roadmaps.length >= 5}
                    description="Create 5 learning roadmaps"
                  />
                  <MilestoneItem 
                    title="Daily Devotion" 
                    achieved={todayStudyTime >= 30}
                    description="Study 30+ minutes today"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
    <div className={`p-2.5 sm:p-3 rounded-lg border ${achieved ? 'bg-primary/5 border-primary/30' : 'bg-secondary/30 border-border'}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`p-1 sm:p-1.5 rounded-full shrink-0 ${achieved ? 'bg-primary' : 'bg-muted'}`}>
          <CheckCircle className={`h-3 w-3 sm:h-4 sm:w-4 ${achieved ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>
        <div className="min-w-0">
          <h4 className={`text-xs sm:text-sm font-medium truncate ${achieved ? 'text-foreground' : 'text-muted-foreground'}`}>
            {title}
          </h4>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </div>
    </div>
  )
}
