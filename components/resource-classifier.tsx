'use client'

import { useState } from 'react'
import { Link2, FileText, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import type { RoadmapStage, Stage, Priority } from '@/lib/types'
import { cn } from '@/lib/utils'

const stageColors: Record<Stage, string> = {
  beginner: 'bg-[oklch(0.7_0.15_165/0.15)] text-[oklch(0.7_0.15_165)] border-[oklch(0.7_0.15_165/0.3)]',
  intermediate: 'bg-[oklch(0.65_0.15_200/0.15)] text-[oklch(0.65_0.15_200)] border-[oklch(0.65_0.15_200/0.3)]',
  advanced: 'bg-[oklch(0.65_0.15_45/0.15)] text-[oklch(0.65_0.15_45)] border-[oklch(0.65_0.15_45/0.3)]',
  expert: 'bg-[oklch(0.55_0.18_330/0.15)] text-[oklch(0.55_0.18_330)] border-[oklch(0.55_0.18_330/0.3)]',
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  'read-first': { label: 'Read First', color: 'bg-primary/15 text-primary border-primary/30' },
  'read-later': { label: 'Read Later', color: 'bg-secondary text-secondary-foreground border-border' },
  optional: { label: 'Optional', color: 'bg-muted text-muted-foreground border-border' },
}

interface Classification {
  title: string
  stage: Stage
  priority: Priority
  reasoning: string
}

interface ResourceClassifierProps {
  roadmapStages: RoadmapStage[]
  onClassified: (classification: Classification, content: string, url?: string) => void
}

export function ResourceClassifier({
  roadmapStages,
  onClassified,
}: ResourceClassifierProps) {
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<Classification | null>(null)

  const handleClassify = async () => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/classify-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          roadmapStages,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('[v0] Failed to classify resource:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    if (result) {
      onClassified(result, content.trim(), url.trim() || undefined)
      setContent('')
      setUrl('')
      setResult(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL (optional)"
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste text content, article excerpt, or describe the resource..."
            className="pl-10 min-h-[120px] bg-card border-border resize-none"
          />
        </div>

        <Button
          onClick={handleClassify}
          disabled={!content.trim() || isLoading}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
        >
          {isLoading ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Classify Resource
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="p-4 rounded-lg bg-card border border-border space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <h4 className="font-semibold text-foreground">{result.title}</h4>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize border',
                    stageColors[result.stage]
                  )}
                >
                  {result.stage}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn('border', priorityConfig[result.priority].color)}
                >
                  {priorityConfig[result.priority].label}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{result.reasoning}</p>

          <Button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4 mr-2" />
            Add to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}
