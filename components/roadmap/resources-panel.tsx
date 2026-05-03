'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  BookOpen, 
  ChevronDown, 
  ExternalLink, 
  Trash2, 
  StickyNote,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import type { Resource, Roadmap, Stage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ResourcesPanelProps {
  resources: Resource[]
  roadmap: Roadmap
  onResourceUpdated: (resource: Resource) => void
  onResourceDeleted: (resourceId: string) => void
}

const priorityColors: Record<string, string> = {
  'Read First': 'bg-red-500/10 text-red-400 border-red-500/30',
  'Read Later': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Optional': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
}

const stages: Stage[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

export function ResourcesPanel({ 
  resources, 
  roadmap, 
  onResourceUpdated, 
  onResourceDeleted 
}: ResourcesPanelProps) {
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const supabase = createClient()

  const toggleComplete = async (resource: Resource) => {
    const { data, error } = await supabase
      .from('resources')
      .update({ is_completed: !resource.is_completed })
      .eq('id', resource.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update resource')
      return
    }

    onResourceUpdated(data)
  }

  const handleDelete = async (resourceId: string) => {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (error) {
      toast.error('Failed to delete resource')
      return
    }

    onResourceDeleted(resourceId)
    toast.success('Resource deleted')
  }

  const saveNote = async (resource: Resource) => {
    const { data, error } = await supabase
      .from('resources')
      .update({ notes: noteContent })
      .eq('id', resource.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to save note')
      return
    }

    onResourceUpdated(data)
    setEditingNote(null)
    toast.success('Note saved')
  }

  const startEditingNote = (resource: Resource) => {
    setEditingNote(resource.id)
    setNoteContent(resource.notes || '')
  }

  const groupedResources = stages.reduce((acc, stage) => {
    acc[stage] = resources.filter(r => r.stage === stage)
    return acc
  }, {} as Record<Stage, Resource[]>)

  const hasResources = resources.length > 0

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Resources</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasResources ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No resources yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                Add resources or let AI suggest some
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {stages.map(stage => {
              const stageResources = groupedResources[stage]
              if (stageResources.length === 0) return null

              return (
                <Collapsible key={stage} defaultOpen>
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <span className="text-sm font-medium text-foreground">
                        {stage}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {stageResources.length}
                        </Badge>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="flex flex-col gap-2">
                      {stageResources.map(resource => (
                        <div
                          key={resource.id}
                          className={cn(
                            'p-3 rounded-lg border border-border bg-secondary/20',
                            resource.is_completed && 'opacity-60'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={resource.is_completed}
                              onCheckedChange={() => toggleComplete(resource)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={cn(
                                  'text-sm font-medium text-foreground',
                                  resource.is_completed && 'line-through'
                                )}>
                                  {resource.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={cn('text-xs shrink-0', priorityColors[resource.priority])}
                                >
                                  {resource.priority}
                                </Badge>
                              </div>
                              
                              {resource.reasoning && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {resource.reasoning}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                {resource.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    asChild
                                  >
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Open
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => {
                                    if (expandedNotes === resource.id) {
                                      setExpandedNotes(null)
                                    } else {
                                      setExpandedNotes(resource.id)
                                      if (!editingNote) startEditingNote(resource)
                                    }
                                  }}
                                >
                                  <StickyNote className="h-3 w-3 mr-1" />
                                  Notes
                                </Button>
                                {resource.time_spent > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {resource.time_spent}m
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive ml-auto"
                                  onClick={() => handleDelete(resource.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              {expandedNotes === resource.id && (
                                <div className="mt-3">
                                  {editingNote === resource.id ? (
                                    <div className="flex flex-col gap-2">
                                      <Textarea
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        placeholder="Add your notes..."
                                        className="text-sm bg-background"
                                        rows={3}
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => saveNote(resource)}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingNote(null)
                                            setExpandedNotes(null)
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className="p-2 rounded bg-background text-sm text-muted-foreground cursor-pointer"
                                      onClick={() => startEditingNote(resource)}
                                    >
                                      {resource.notes || 'Click to add notes...'}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
