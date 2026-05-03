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
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Copy, Check, Globe, Lock } from 'lucide-react'
import { toast } from 'sonner'
import type { Roadmap } from '@/lib/types'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roadmap: Roadmap
  onRoadmapUpdated: (roadmap: Roadmap) => void
}

export function ShareDialog({
  open,
  onOpenChange,
  roadmap,
  onRoadmapUpdated,
}: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(roadmap.is_public)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/shared/${roadmap.share_code}`
    : ''

  const togglePublic = async (value: boolean) => {
    setIsPublic(value)

    const { data, error } = await supabase
      .from('roadmaps')
      .update({ is_public: value })
      .eq('id', roadmap.id)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update sharing settings')
      setIsPublic(!value)
      return
    }

    onRoadmapUpdated(data)
    toast.success(value ? 'Roadmap is now public' : 'Roadmap is now private')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Roadmap</DialogTitle>
          <DialogDescription>
            Share your learning roadmap with others.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <FieldLabel className="mb-0">
                    {isPublic ? 'Public' : 'Private'}
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    {isPublic
                      ? 'Anyone with the link can view'
                      : 'Only you can view this roadmap'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={togglePublic}
              />
            </div>
          </Field>

          {isPublic && (
            <Field>
              <FieldLabel>Share Link</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-secondary border-border"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Field>
          )}
        </FieldGroup>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
