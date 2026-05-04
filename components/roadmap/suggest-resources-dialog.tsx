'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { Sparkles, ExternalLink, BookOpen, Video, GraduationCap, Book, Code } from 'lucide-react'
import { toast } from 'sonner'
import type { Roadmap, Resource, SuggestedResource, Stage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SuggestResourcesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadmap: Roadmap
  onResourceAdded: (resource: Resource) => void
}

const typeIcons: Record<string, React.ElementType> = {
  article: BookOpen,
  video: Video,
  course: GraduationCap,
  book: Book,
  tutorial: Code,
}

const stageColors: Record<Stage, string> = {
  'Beginner': 'bg-emerald-500/10 text-emerald-400',
  'Intermediate': 'bg-blue-500/10 text-blue-400',
  'Advanced': 'bg-amber-500/10 text-amber-400',
  'Expert': 'bg-rose-500/10 text-rose-400',
}

export function SuggestResourcesDialog({
  open,
  onOpenChange,
  roadmap,
  onResourceAdded,
}: SuggestResourcesDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestedResource[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const supabase = createClient()

  const generateSuggestions = async () => {
    setLoading(true)
    setSuggestions([])
    setSelected(new Set())

    try {
      const response = await fetch('/api/suggest-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: roadmap.topic,
          stages: roadmap.stages,
        }),
      })

      if (!response.ok) throw new Error('Failed to get suggestions')

      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error('Failed to generate suggestions')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelected(newSelected)
  }

  const addSelected = async () => {
    if (selected.size === 0) return

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const selectedSuggestions = Array.from(selected).map(i => suggestions[i])

      for (const suggestion of selectedSuggestions) {
        const { data, error } = await supabase
          .from('resources')
          .insert({
            user_id: user.id,
            roadmap_id: roadmap.id,
            title: suggestion.title,
            url: suggestion.searchUrl ?? suggestion.url,
            stage: suggestion.stage,
            priority: 'Read Later',
            reasoning: suggestion.description,
          })
          .select()
          .single()

        if (error) throw error
        onResourceAdded(data)
      }

      toast.success(`Added ${selected.size} resource${selected.size > 1 ? 's' : ''}!`)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding resources:', error)
      toast.error('Failed to add resources')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Resource Suggestions
          </DialogTitle>
          <DialogDescription>
            Get personalized resource recommendations for your {roadmap.topic} learning path.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              {loading ? (
                <>
                  <Spinner className="h-8 w-8 mb-4" />
                  <p className="text-muted-foreground">Finding the best resources...</p>
                </>
              ) : (
                <>
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click below to get AI-powered resource suggestions
                  </p>
                  <Button onClick={generateSuggestions}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              {suggestions.map((suggestion, index) => {
                const Icon = typeIcons[suggestion.type] || BookOpen
                const isSelected = selected.has(index)

                return (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-lg border transition-colors cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    )}
                    onClick={() => toggleSelect(index)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <h4 className="font-medium text-foreground">
                              {suggestion.title}
                            </h4>
                          </div>
                          <Badge className={cn('shrink-0', stageColors[suggestion.stage])}>
                            {suggestion.stage}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                        <a
                          href={suggestion.searchUrl ?? suggestion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Search for this resource
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={generateSuggestions} disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Regenerate
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={addSelected}
                disabled={selected.size === 0 || saving}
              >
                {saving ? <Spinner className="mr-2" /> : null}
                Add {selected.size > 0 ? `(${selected.size})` : ''} Selected
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
