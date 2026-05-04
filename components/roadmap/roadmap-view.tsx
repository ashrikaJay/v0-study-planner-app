'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { ChevronDown, Plus, Clock, CheckCircle } from 'lucide-react'
import type { Roadmap, Resource, Stage, ConceptProgress } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RoadmapViewProps {
  roadmap: Roadmap
  resources: Resource[]
  conceptProgress: ConceptProgress[]
  onAddToStage: (stage: Stage) => void
  onProgressUpdate?: () => void
}

const stageColors: Record<Stage, { bg: string; text: string; border: string }> = {
  'Beginner': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Intermediate': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Advanced': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Expert': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export function RoadmapView({ roadmap, resources, conceptProgress, onAddToStage, onProgressUpdate }: RoadmapViewProps) {
  const [openStages, setOpenStages] = useState<string[]>(
    roadmap.stages.map(s => s.name)
  )
  const [localProgress, setLocalProgress] = useState<Record<string, boolean>>({})
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const progressMap: Record<string, boolean> = {}
    conceptProgress.forEach((cp) => {
      progressMap[`${cp.stage}-${cp.concept_name}`] = cp.is_completed
    })
    setLocalProgress(progressMap)
  }, [conceptProgress])

  const toggleStage = (stageName: string) => {
    setOpenStages(prev =>
      prev.includes(stageName)
        ? prev.filter(s => s !== stageName)
        : [...prev, stageName]
    )
  }

  const getStageProgress = (stageName: Stage) => {
    const stageResources = resources.filter(r => r.stage === stageName)
    if (stageResources.length === 0) return 0
    const completed = stageResources.filter(r => r.is_completed).length
    return Math.round((completed / stageResources.length) * 100)
  }

  const getConceptProgress = (stageName: Stage, concepts: { name: string }[]) => {
    const completed = concepts.filter(c => localProgress[`${stageName}-${c.name}`]).length
    return {
      completed,
      total: concepts.length,
      percentage: concepts.length > 0 ? Math.round((completed / concepts.length) * 100) : 0
    }
  }

  const getStageResourceCount = (stageName: Stage) => {
    return resources.filter(r => r.stage === stageName).length
  }

  const getStageCompletedCount = (stageName: Stage) => {
    return resources.filter(r => r.stage === stageName && r.is_completed).length
  }

  const toggleConcept = async (stageName: Stage, conceptName: string) => {
    const key = `${stageName}-${conceptName}`
    const currentValue = localProgress[key] || false
    const newValue = !currentValue
    
    setLocalProgress(prev => ({ ...prev, [key]: newValue }))
    setUpdating(key)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in')
        setLocalProgress(prev => ({ ...prev, [key]: currentValue }))
        return
      }

      if (newValue) {
        await supabase.from('concept_progress').upsert({
          user_id: user.id,
          roadmap_id: roadmap.id,
          stage: stageName,
          concept_name: conceptName,
          is_completed: true,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,roadmap_id,stage,concept_name'
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

        toast.success('Concept completed!', { description: conceptName })
      } else {
        await supabase
          .from('concept_progress')
          .update({ is_completed: false, completed_at: null })
          .eq('user_id', user.id)
          .eq('roadmap_id', roadmap.id)
          .eq('stage', stageName)
          .eq('concept_name', conceptName)
      }

      onProgressUpdate?.()
    } catch (error) {
      setLocalProgress(prev => ({ ...prev, [key]: currentValue }))
      toast.error('Failed to update progress')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-lg">Learning Path</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line - hidden on mobile */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

          <div className="flex flex-col gap-3 sm:gap-4">
            {roadmap.stages.map((stage, index) => {
              const colors = stageColors[stage.name]
              const resourceProgress = getStageProgress(stage.name)
              const conceptProg = getConceptProgress(stage.name, stage.concepts)
              const resourceCount = getStageResourceCount(stage.name)
              const completedCount = getStageCompletedCount(stage.name)
              const isOpen = openStages.includes(stage.name)
              const timeEstimate = stage.timeEstimate || stage.concepts.reduce((acc, c) => acc + (c.timeEstimate || 30), 0)
              const hours = Math.floor(timeEstimate / 60)
              const minutes = timeEstimate % 60

              return (
                <Collapsible
                  key={stage.name}
                  open={isOpen}
                  onOpenChange={() => toggleStage(stage.name)}
                >
                  <div className="relative sm:pl-12">
                    {/* Timeline dot - hidden on mobile */}
                    <div
                      className={cn(
                        'absolute left-4 top-4 w-5 h-5 rounded-full border-2 bg-background z-10 hidden sm:flex items-center justify-center',
                        colors.border,
                        conceptProg.percentage === 100 && 'bg-primary border-primary'
                      )}
                    >
                      {conceptProg.percentage === 100 && (
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>

                    <div className={cn('rounded-lg border p-3 sm:p-4', colors.border, colors.bg)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Badge variant="outline" className={cn('font-mono text-xs', colors.text)}>
                                {index + 1}
                              </Badge>
                              <div>
                                <h3 className={cn('font-semibold text-sm sm:text-base', colors.text)}>
                                  {stage.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {conceptProg.completed}/{conceptProg.total} concepts
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 ml-8 sm:ml-0">
                              <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="hidden xs:inline">
                                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                                </span>
                                <span className="xs:hidden">
                                  {hours > 0 ? `${hours}h` : `${minutes}m`}
                                </span>
                              </div>
                              {resourceCount > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {completedCount}/{resourceCount} resources
                                </div>
                              )}
                              <ChevronDown
                                className={cn(
                                  'h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform',
                                  isOpen && 'rotate-180'
                                )}
                              />
                            </div>
                          </div>
                          <Progress value={conceptProg.percentage} className="mt-2 sm:mt-3 h-1.5" />
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-3 sm:mt-4">
                        <div className="flex flex-col gap-2">
                          {stage.concepts.map((concept, cIndex) => {
                            const key = `${stage.name}-${concept.name}`
                            const isCompleted = localProgress[key] || false
                            const isUpdating = updating === key

                            return (
                              <div
                                key={cIndex}
                                className={cn(
                                  "p-2 sm:p-3 rounded-md border transition-colors",
                                  isCompleted 
                                    ? "bg-primary/5 border-primary/30" 
                                    : "bg-background/50 border-border/50 hover:border-border"
                                )}
                              >
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <Checkbox
                                    id={key}
                                    checked={isCompleted}
                                    onCheckedChange={() => toggleConcept(stage.name, concept.name)}
                                    disabled={isUpdating}
                                    className="mt-0.5 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label htmlFor={key} className="flex-1 cursor-pointer min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className={cn(
                                        "font-medium text-foreground text-xs sm:text-sm break-words",
                                        isCompleted && "line-through text-muted-foreground"
                                      )}>
                                        {concept.name}
                                      </h4>
                                      {concept.timeEstimate && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                          ~{concept.timeEstimate}m
                                        </span>
                                      )}
                                    </div>
                                    <p className={cn(
                                      "text-xs mt-1 break-words",
                                      isCompleted ? "text-muted-foreground/60" : "text-muted-foreground"
                                    )}>
                                      {concept.description}
                                    </p>
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full text-xs sm:text-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddToStage(stage.name)
                          }}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Add Resource
                        </Button>
                      </CollapsibleContent>
                    </div>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
