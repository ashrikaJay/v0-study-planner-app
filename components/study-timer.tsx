'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Pause, RotateCcw, Timer, Coffee, BookOpen, Clock, Volume2, VolumeX } from 'lucide-react'
import { TIMER_PRESETS, TimerMode } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StudyTimerProps {
  roadmapId?: string
  onSessionComplete?: (minutes: number) => void
  compact?: boolean
}

export function StudyTimer({ roadmapId, onSessionComplete, compact = false }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('study')
  const [studyMinutes, setStudyMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [customMinutes, setCustomMinutes] = useState(30)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number>(0)

  const playSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }, [soundEnabled])

  const logStudySession = useCallback(async (minutes: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || minutes < 1) return

    // Log study session
    await supabase.from('study_sessions').insert({
      user_id: user.id,
      roadmap_id: roadmapId || null,
      duration_minutes: minutes,
      date: new Date().toISOString().split('T')[0],
    })

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (streak) {
      const lastDate = streak.last_study_date
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      let newStreak = streak.current_streak
      if (lastDate === yesterday) {
        newStreak += 1
      } else if (lastDate !== today) {
        newStreak = 1
      }

      await supabase
        .from('streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_study_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    onSessionComplete?.(minutes)
  }, [roadmapId, onSessionComplete])

  const handleTimerComplete = useCallback(() => {
    playSound()
    
    if (mode === 'exam' || mode === 'custom') {
      toast.success('Time is up!', { description: 'Your session has ended.' })
      const minutesStudied = Math.round((Date.now() - startTimeRef.current) / 60000)
      logStudySession(minutesStudied)
      setIsRunning(false)
      return
    }

    if (isBreak) {
      toast.success('Break over!', { description: 'Time to focus again.' })
      setIsBreak(false)
      setTimeRemaining(studyMinutes * 60)
    } else {
      setSessionsCompleted(prev => prev + 1)
      logStudySession(studyMinutes)
      toast.success('Session complete!', { description: 'Take a break.' })
      setIsBreak(true)
      setTimeRemaining(breakMinutes * 60)
    }
  }, [mode, isBreak, studyMinutes, breakMinutes, playSound, logStudySession])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, handleTimerComplete])

  const startTimer = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now()
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    if (mode === 'custom') {
      setTimeRemaining(customMinutes * 60)
    } else if (mode === 'exam') {
      setTimeRemaining(studyMinutes * 60)
    } else {
      setTimeRemaining(studyMinutes * 60)
    }
  }

  const selectPreset = (preset: typeof TIMER_PRESETS[0]) => {
    setMode(preset.mode)
    setStudyMinutes(preset.studyMinutes)
    setBreakMinutes(preset.breakMinutes)
    setTimeRemaining(preset.studyMinutes * 60)
    setIsRunning(false)
    setIsBreak(false)
  }

  const setCustomTimer = (minutes: number) => {
    setMode('custom')
    setCustomMinutes(minutes)
    setTimeRemaining(minutes * 60)
    setIsRunning(false)
    setIsBreak(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (() => {
    const total = isBreak ? breakMinutes * 60 : 
                  mode === 'custom' ? customMinutes * 60 : 
                  studyMinutes * 60
    return ((total - timeRemaining) / total) * 100
  })()

  if (compact) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">Timer</span>
            {isRunning && (
              <Badge variant="secondary" className="ml-1 font-mono">
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Study Timer</DialogTitle>
          </DialogHeader>
          <TimerContent
            mode={mode}
            isBreak={isBreak}
            isRunning={isRunning}
            timeRemaining={timeRemaining}
            progress={progress}
            sessionsCompleted={sessionsCompleted}
            soundEnabled={soundEnabled}
            studyMinutes={studyMinutes}
            breakMinutes={breakMinutes}
            customMinutes={customMinutes}
            formatTime={formatTime}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            resetTimer={resetTimer}
            selectPreset={selectPreset}
            setCustomTimer={setCustomTimer}
            setSoundEnabled={setSoundEnabled}
            setStudyMinutes={setStudyMinutes}
            setBreakMinutes={setBreakMinutes}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TimerContent
          mode={mode}
          isBreak={isBreak}
          isRunning={isRunning}
          timeRemaining={timeRemaining}
          progress={progress}
          sessionsCompleted={sessionsCompleted}
          soundEnabled={soundEnabled}
          studyMinutes={studyMinutes}
          breakMinutes={breakMinutes}
          customMinutes={customMinutes}
          formatTime={formatTime}
          startTimer={startTimer}
          pauseTimer={pauseTimer}
          resetTimer={resetTimer}
          selectPreset={selectPreset}
          setCustomTimer={setCustomTimer}
          setSoundEnabled={setSoundEnabled}
          setStudyMinutes={setStudyMinutes}
          setBreakMinutes={setBreakMinutes}
        />
      </CardContent>
    </Card>
  )
}

interface TimerContentProps {
  mode: TimerMode
  isBreak: boolean
  isRunning: boolean
  timeRemaining: number
  progress: number
  sessionsCompleted: number
  soundEnabled: boolean
  studyMinutes: number
  breakMinutes: number
  customMinutes: number
  formatTime: (seconds: number) => string
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  selectPreset: (preset: typeof TIMER_PRESETS[0]) => void
  setCustomTimer: (minutes: number) => void
  setSoundEnabled: (enabled: boolean) => void
  setStudyMinutes: (minutes: number) => void
  setBreakMinutes: (minutes: number) => void
}

function TimerContent({
  mode,
  isBreak,
  isRunning,
  timeRemaining,
  progress,
  sessionsCompleted,
  soundEnabled,
  studyMinutes,
  breakMinutes,
  customMinutes,
  formatTime,
  startTimer,
  pauseTimer,
  resetTimer,
  selectPreset,
  setCustomTimer,
  setSoundEnabled,
  setStudyMinutes,
  setBreakMinutes,
}: TimerContentProps) {
  const [customInput, setCustomInput] = useState(customMinutes.toString())

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <div className="relative">
        <div 
          className={cn(
            "text-center py-6 rounded-lg transition-colors",
            isBreak ? "bg-blue-500/10" : mode === 'exam' ? "bg-rose-500/10" : "bg-primary/10"
          )}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isBreak ? (
              <Coffee className="h-5 w-5 text-blue-400" />
            ) : mode === 'exam' ? (
              <Clock className="h-5 w-5 text-rose-400" />
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isBreak ? "text-blue-400" : mode === 'exam' ? "text-rose-400" : "text-primary"
            )}>
              {isBreak ? 'Break Time' : mode === 'exam' ? 'Exam Mode' : 'Focus Time'}
            </span>
          </div>
          <div className="text-5xl font-mono font-bold text-foreground">
            {formatTime(timeRemaining)}
          </div>
          {sessionsCompleted > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              {sessionsCompleted} session{sessionsCompleted > 1 ? 's' : ''} completed
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-b-lg overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              isBreak ? "bg-blue-500" : mode === 'exam' ? "bg-rose-500" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {isRunning ? (
          <Button onClick={pauseTimer} variant="outline" size="lg" className="gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        ) : (
          <Button onClick={startTimer} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            {timeRemaining === (mode === 'custom' ? customMinutes : studyMinutes) * 60 ? 'Start' : 'Resume'}
          </Button>
        )}
        <Button onClick={resetTimer} variant="outline" size="lg">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          variant="ghost" 
          size="lg"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {TIMER_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => selectPreset(preset)}
              className={cn(
                "text-xs",
                mode === preset.mode && studyMinutes === preset.studyMinutes && "border-primary text-primary"
              )}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Timer */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Custom Timer</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            max="180"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Minutes"
            className="w-24"
          />
          <Button 
            variant="outline" 
            onClick={() => setCustomTimer(parseInt(customInput) || 30)}
          >
            Set Custom
          </Button>
        </div>
      </div>

      {/* Pomodoro Settings (only for study mode) */}
      {mode === 'study' && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Study (min)</Label>
            <Select 
              value={studyMinutes.toString()} 
              onValueChange={(v) => {
                setStudyMinutes(parseInt(v))
                if (!isRunning) setCustomTimer(parseInt(v))
              }}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 20, 25, 30, 45, 50, 60].map((m) => (
                  <SelectItem key={m} value={m.toString()}>{m} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Break (min)</Label>
            <Select 
              value={breakMinutes.toString()} 
              onValueChange={(v) => setBreakMinutes(parseInt(v))}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 5, 10, 15, 20].map((m) => (
                  <SelectItem key={m} value={m.toString()}>{m} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
