'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Target, Settings, Flame, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DailyGoalProps {
  compact?: boolean
}

export function DailyGoal({ compact = false }: DailyGoalProps) {
  const [goalMinutes, setGoalMinutes] = useState(30)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState('30')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Load daily goal
      const { data: goalData } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (goalData) {
        setGoalMinutes(goalData.daily_minutes_goal)
        setNewGoal(goalData.daily_minutes_goal.toString())
      }

      // Load today's study sessions
      const today = new Date().toISOString().split('T')[0]
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .eq('date', today)

      if (sessions) {
        const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0)
        setTodayMinutes(totalMinutes)
      }

      // Load streak
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (streakData) {
        setStreak(streakData.current_streak)
        setLongestStreak(streakData.longest_streak)
      }
    } catch (error) {
      console.error('Error loading daily goal data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateGoal = async () => {
    const minutes = parseInt(newGoal) || 30
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      await supabase.from('daily_goals').upsert({
        user_id: user.id,
        daily_minutes_goal: minutes,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

      setGoalMinutes(minutes)
      setDialogOpen(false)
      toast.success('Daily goal updated!')
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  const progress = Math.min(Math.round((todayMinutes / goalMinutes) * 100), 100)
  const goalReached = todayMinutes >= goalMinutes

  if (loading) {
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Target className={cn("h-4 w-4", goalReached ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm">
            {todayMinutes}/{goalMinutes}m
          </span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-amber-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">{streak}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Daily Goal
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Set Daily Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="5"
                    max="480"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">minutes per day</span>
                </div>
                <Button onClick={updateGoal} className="w-full">
                  Save Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today&apos;s progress</span>
            <span className={cn("font-medium", goalReached && "text-primary")}>
              {todayMinutes}/{goalMinutes} min
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
            <Flame className={cn("h-5 w-5", streak > 0 ? "text-amber-500" : "text-muted-foreground")} />
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="font-semibold">{streak} day{streak !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
            <Trophy className={cn("h-5 w-5", longestStreak > 0 ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className="text-xs text-muted-foreground">Best Streak</p>
              <p className="font-semibold">{longestStreak} day{longestStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {goalReached && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 rounded-lg text-primary text-sm">
            <Trophy className="h-4 w-4" />
            Goal reached! Great job!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
