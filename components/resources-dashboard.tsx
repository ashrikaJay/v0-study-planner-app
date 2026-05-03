'use client'

import { BookOpen, Layers, Rocket, Crown, ExternalLink, Check } from 'lucide-react'
import type { Resource, Stage, Priority } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

const stageConfig: Record<
  Stage,
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  beginner: {
    icon: BookOpen,
    label: 'Beginner',
    color: 'text-[oklch(0.7_0.15_165)]',
    bgColor: 'bg-[oklch(0.7_0.15_165/0.1)] border-[oklch(0.7_0.15_165/0.3)]',
  },
  intermediate: {
    icon: Layers,
    label: 'Intermediate',
    color: 'text-[oklch(0.65_0.15_200)]',
    bgColor: 'bg-[oklch(0.65_0.15_200/0.1)] border-[oklch(0.65_0.15_200/0.3)]',
  },
  advanced: {
    icon: Rocket,
    label: 'Advanced',
    color: 'text-[oklch(0.65_0.15_45)]',
    bgColor: 'bg-[oklch(0.65_0.15_45/0.1)] border-[oklch(0.65_0.15_45/0.3)]',
  },
  expert: {
    icon: Crown,
    label: 'Expert',
    color: 'text-[oklch(0.55_0.18_330)]',
    bgColor: 'bg-[oklch(0.55_0.18_330/0.1)] border-[oklch(0.55_0.18_330/0.3)]',
  },
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  'read-first': { label: 'Read First', color: 'bg-primary/15 text-primary' },
  'read-later': { label: 'Read Later', color: 'bg-secondary text-secondary-foreground' },
  optional: { label: 'Optional', color: 'bg-muted text-muted-foreground' },
}

interface ResourcesDashboardProps {
  resources: Resource[]
  onToggleComplete: (id: string) => void
}

export function ResourcesDashboard({
  resources,
  onToggleComplete,
}: ResourcesDashboardProps) {
  const stages: Stage[] = ['beginner', 'intermediate', 'advanced', 'expert']

  const getResourcesByStage = (stage: Stage) => {
    return resources
      .filter((r) => r.stage === stage)
      .sort((a, b) => {
        const priorityOrder = { 'read-first': 0, 'read-later': 1, optional: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }

  const getProgress = (stage: Stage) => {
    const stageResources = resources.filter((r) => r.stage === stage)
    if (stageResources.length === 0) return 0
    const completed = stageResources.filter((r) => r.completed).length
    return Math.round((completed / stageResources.length) * 100)
  }

  if (resources.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No resources yet</EmptyTitle>
          <EmptyDescription>
            Use the Resource Classifier to add learning materials to your dashboard
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {stages.map((stage) => {
        const config = stageConfig[stage]
        const Icon = config.icon
        const stageResources = getResourcesByStage(stage)
        const progress = getProgress(stage)

        return (
          <div
            key={stage}
            className={cn(
              'p-4 rounded-lg border',
              config.bgColor
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon className={cn('h-5 w-5', config.color)} />
                <h3 className={cn('font-semibold', config.color)}>
                  {config.label}
                </h3>
              </div>
              {stageResources.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', config.color.replace('text-', 'bg-'))}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {progress}%
                  </span>
                </div>
              )}
            </div>

            {stageResources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No resources added
              </p>
            ) : (
              <div className="space-y-2">
                {stageResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 transition-opacity',
                      resource.completed && 'opacity-60'
                    )}
                  >
                    <Checkbox
                      checked={resource.completed}
                      onCheckedChange={() => onToggleComplete(resource.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={cn(
                            'font-medium text-sm text-foreground',
                            resource.completed && 'line-through'
                          )}
                        >
                          {resource.title}
                        </h4>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'mt-1 text-xs border-0',
                          priorityConfig[resource.priority].color
                        )}
                      >
                        {priorityConfig[resource.priority].label}
                      </Badge>
                    </div>
                    {resource.completed && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
