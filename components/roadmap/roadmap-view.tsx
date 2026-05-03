'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { ChevronDown, Plus, Clock, CheckCircle } from 'lucide-react'
import type { Roadmap, Resource, Stage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RoadmapViewProps {
  roadmap: Roadmap
  resources: Resource[]
  onAddToStage: (stage: Stage) => void
}

const stageColors: Record<Stage, { bg: string; text: string; border: string }> = {
  'Beginner': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Intermediate': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Advanced': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Expert': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

export function RoadmapView({ roadmap, resources, onAddToStage }: RoadmapViewProps) {
  const [openStages, setOpenStages] = useState<string[]>(
    roadmap.stages.map(s => s.name)
  )

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

  const getStageResourceCount = (stageName: Stage) => {
    return resources.filter(r => r.stage === stageName).length
  }

  const getStageCompletedCount = (stageName: Stage) => {
    return resources.filter(r => r.stage === stageName && r.is_completed).length
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Learning Path</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="flex flex-col gap-4">
            {roadmap.stages.map((stage, index) => {
              const colors = stageColors[stage.name]
              const progress = getStageProgress(stage.name)
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
                  <div className="relative pl-12">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute left-4 top-4 w-5 h-5 rounded-full border-2 bg-background z-10',
                        colors.border,
                        progress === 100 && 'bg-primary border-primary'
                      )}
                    >
                      {progress === 100 && (
                        <CheckCircle className="h-4 w-4 text-primary-foreground absolute -top-0.5 -left-0.5" />
                      )}
                    </div>

                    <div className={cn('rounded-lg border p-4', colors.border, colors.bg)}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={cn('font-mono', colors.text)}>
                                {index + 1}
                              </Badge>
                              <div>
                                <h3 className={cn('font-semibold', colors.text)}>
                                  {stage.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {stage.concepts.length} concepts
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                              </div>
                              {resourceCount > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {completedCount}/{resourceCount} done
                                </div>
                              )}
                              <ChevronDown
                                className={cn(
                                  'h-5 w-5 text-muted-foreground transition-transform',
                                  isOpen && 'rotate-180'
                                )}
                              />
                            </div>
                          </div>
                          {resourceCount > 0 && (
                            <Progress value={progress} className="mt-3 h-1.5" />
                          )}
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-4">
                        <div className="flex flex-col gap-2">
                          {stage.concepts.map((concept, cIndex) => (
                            <div
                              key={cIndex}
                              className="p-3 rounded-md bg-background/50 border border-border/50"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-medium text-foreground text-sm">
                                    {concept.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {concept.description}
                                  </p>
                                </div>
                                {concept.timeEstimate && (
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    ~{concept.timeEstimate}m
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddToStage(stage.name)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Resource to {stage.name}
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
