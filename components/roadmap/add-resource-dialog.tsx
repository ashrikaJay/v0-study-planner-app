'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import type { Roadmap, Resource, Stage, Priority } from '@/lib/types'

interface AddResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadmap: Roadmap
  defaultStage: Stage | null
  onResourceAdded: (resource: Resource) => void
}

export function AddResourceDialog({
  open,
  onOpenChange,
  roadmap,
  defaultStage,
  onResourceAdded,
}: AddResourceDialogProps) {
  const [mode, setMode] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [title, setTitle] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (!open) {
      setUrl('')
      setContent('')
      setTitle('')
      setMode('url')
    }
  }, [open])

  // Auto-fetch URL metadata
  useEffect(() => {
    const fetchMeta = async () => {
      if (!url || !url.startsWith('http')) return
      
      setFetchingMeta(true)
      try {
        const response = await fetch('/api/fetch-url-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.title) setTitle(data.title)
        }
      } catch {
        // Silently fail
      } finally {
        setFetchingMeta(false)
      }
    }

    const debounce = setTimeout(fetchMeta, 500)
    return () => clearTimeout(debounce)
  }, [url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const inputContent = mode === 'url' ? url : content
    if (!inputContent.trim()) return

    setLoading(true)

    try {
      // Classify with AI
      const response = await fetch('/api/classify-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputContent,
          roadmap: {
            topic: roadmap.topic,
            stages: roadmap.stages,
          },
          preferredStage: defaultStage,
        }),
      })

      if (!response.ok) throw new Error('Failed to classify')

      const { stage, priority, reasoning, extractedTitle } = await response.json() as {
        stage: Stage
        priority: Priority
        reasoning: string
        extractedTitle?: string
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const resourceTitle = title || extractedTitle || (mode === 'url' ? url : content.slice(0, 50))

      const { data, error } = await supabase
        .from('resources')
        .insert({
          user_id: user.id,
          roadmap_id: roadmap.id,
          title: resourceTitle,
          url: mode === 'url' ? url : null,
          content: mode === 'text' ? content : null,
          stage: defaultStage || stage,
          priority,
          reasoning,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Resource added!')
      onResourceAdded(data)
    } catch (error) {
      console.error('Error adding resource:', error)
      toast.error('Failed to add resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Add a URL or paste text content. AI will classify it for your roadmap.
            {defaultStage && (
              <span className="block mt-1 text-primary">
                Adding to: {defaultStage}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="url" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="url">Resource URL</FieldLabel>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-secondary border-border"
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="title">
                    Title {fetchingMeta && <Spinner className="inline ml-2 h-3 w-3" />}
                  </FieldLabel>
                  <Input
                    id="title"
                    placeholder="Resource title (auto-detected)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-secondary border-border"
                    disabled={loading}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="content">Content</FieldLabel>
                  <Textarea
                    id="content"
                    placeholder="Paste article text, notes, or any learning content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-secondary border-border min-h-32"
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="textTitle">Title</FieldLabel>
                  <Input
                    id="textTitle"
                    placeholder="Give this content a title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-secondary border-border"
                    disabled={loading}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || (mode === 'url' ? !url : !content)}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2" />
                    Classifying...
                  </>
                ) : (
                  'Add Resource'
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
