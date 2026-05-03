'use client'

import { BookOpen, Layers, Rocket, Crown, ChevronDown } from 'lucide-react'
import type { RoadmapStage, Stage } from '@/lib/types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const stageConfig: Record<
  Stage,
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string }
> = {
  beginner: {
    icon: BookOpen,
    color: 'text-[oklch(0.7_0.15_165)]',
    bgColor: 'bg-[oklch(0.7_0.15_165/0.1)]',
    borderColor: 'border-[oklch(0.7_0.15_165/0.3)]',
  },
  intermediate: {
    icon: Layers,
    color: 'text-[oklch(0.65_0.15_200)]',
    bgColor: 'bg-[oklch(0.65_0.15_200/0.1)]',
    borderColor: 'border-[oklch(0.65_0.15_200/0.3)]',
  },
  advanced: {
    icon: Rocket,
    color: 'text-[oklch(0.65_0.15_45)]',
    bgColor: 'bg-[oklch(0.65_0.15_45/0.1)]',
    borderColor: 'border-[oklch(0.65_0.15_45/0.3)]',
  },
  expert: {
    icon: Crown,
    color: 'text-[oklch(0.55_0.18_330)]',
    bgColor: 'bg-[oklch(0.55_0.18_330/0.1)]',
    borderColor: 'border-[oklch(0.55_0.18_330/0.3)]',
  },
}

interface RoadmapDisplayProps {
  stages: RoadmapStage[]
  topic: string
}

export function RoadmapDisplay({ stages, topic }: RoadmapDisplayProps) {
  const [openStages, setOpenStages] = useState<Set<Stage>>(new Set(['beginner']))

  const toggleStage = (stage: Stage) => {
    setOpenStages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stage)) {
        newSet.delete(stage)
      } else {
        newSet.add(stage)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-8 bg-primary rounded-full" />
        <h2 className="text-xl font-semibold text-foreground">{topic}</h2>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {stages.map((stageData, index) => {
            const config = stageConfig[stageData.stage]
            const Icon = config.icon
            const isOpen = openStages.has(stageData.stage)

            return (
              <Collapsible
                key={stageData.stage}
                open={isOpen}
                onOpenChange={() => toggleStage(stageData.stage)}
              >
                <div className="relative">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute left-0 w-12 h-12 rounded-full flex items-center justify-center border-2 z-10',
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>

                  <div className="ml-16">
                    <CollapsibleTrigger className="w-full">
                      <div
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer',
                          'bg-card hover:bg-accent/50',
                          config.borderColor
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'text-xs font-medium uppercase tracking-wider px-2 py-1 rounded',
                              config.bgColor,
                              config.color
                            )}
                          >
                            Stage {index + 1}
                          </span>
                          <h3 className="font-semibold text-foreground">
                            {stageData.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {stageData.concepts.length} concepts
                          </span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 text-muted-foreground transition-transform',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="mt-2 ml-1 space-y-2 pb-2">
                        {stageData.concepts.map((concept, cIndex) => (
                          <div
                            key={cIndex}
                            className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                          >
                            <h4 className="font-medium text-foreground text-sm">
                              {concept.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {concept.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </div>
    </div>
  )
}
