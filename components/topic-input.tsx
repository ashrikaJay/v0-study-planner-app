'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface TopicInputProps {
  onGenerate: (topic: string) => Promise<void>
  isLoading: boolean
}

export function TopicInput({ onGenerate, isLoading }: TopicInputProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || isLoading) return
    await onGenerate(topic.trim())
    setTopic('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic to learn (e.g., Machine Learning, Web Development)"
            className="h-14 pl-12 pr-4 text-base bg-card border-border focus:border-primary focus:ring-primary/20"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <>
              Generate Roadmap
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
