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
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import type { Roadmap, RoadmapStage } from '@/lib/types'

interface CreateRoadmapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (roadmap: Roadmap) => void
}

export function CreateRoadmapDialog({ open, onOpenChange, onCreated }: CreateRoadmapDialogProps) {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)

    try {
      // Generate roadmap using AI
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate roadmap')
      }

      const { stages } = await response.json() as { stages: RoadmapStage[] }

      // Calculate total time estimate
      const totalTime = stages.reduce((acc, stage) => {
        const stageTime = stage.concepts.reduce((sum, c) => sum + (c.timeEstimate || 30), 0)
        return acc + stageTime
      }, 0)

      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate share code
      const shareCode = Math.random().toString(36).substring(2, 10)

      // Save to database
      const { data, error } = await supabase
        .from('roadmaps')
        .insert({
          user_id: user.id,
          topic: topic.trim(),
          stages,
          total_time_estimate: totalTime,
          share_code: shareCode,
          is_public: false,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Roadmap created successfully!')
      setTopic('')
      onCreated(data)
    } catch (error) {
      console.error('Error creating roadmap:', error)
      toast.error('Failed to create roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Roadmap</DialogTitle>
          <DialogDescription>
            Enter a topic and AI will generate a personalized learning roadmap for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="topic">What do you want to learn?</FieldLabel>
              <Input
                id="topic"
                placeholder="e.g., Machine Learning, Web Development, Piano..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-secondary border-border"
                disabled={loading}
              />
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !topic.trim()}>
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  Generating...
                </>
              ) : (
                'Create Roadmap'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
