import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Route, Clock, ChevronDown, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { RoadmapStage, Stage } from '@/lib/types'
import { cn } from '@/lib/utils'

const stageColors: Record<Stage, { bg: string; text: string; border: string }> = {
  'Beginner': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Intermediate': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Advanced': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Expert': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
}

interface SharedRoadmapPageProps {
  params: Promise<{ code: string }>
}

export default async function SharedRoadmapPage({ params }: SharedRoadmapPageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('share_code', code)
    .eq('is_public', true)
    .single()

  if (!roadmap) {
    notFound()
  }

  const stages = roadmap.stages as RoadmapStage[]
  const totalTime = roadmap.total_time_estimate
  const hours = Math.floor(totalTime / 60)
  const minutes = totalTime % 60

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Route className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground">StudyPath</span>
            </Link>
            <Button asChild>
              <Link href="/auth/sign-up">Create Your Own</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{roadmap.topic}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{stages.length} stages</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} estimated
            </span>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

              <div className="flex flex-col gap-4">
                {stages.map((stage, index) => {
                  const colors = stageColors[stage.name]
                  const stageTime = stage.timeEstimate || stage.concepts.reduce((acc, c) => acc + (c.timeEstimate || 30), 0)
                  const stageHours = Math.floor(stageTime / 60)
                  const stageMinutes = stageTime % 60

                  return (
                    <div key={stage.name} className="relative pl-12">
                      <div
                        className={cn(
                          'absolute left-4 top-4 w-5 h-5 rounded-full border-2 bg-background z-10',
                          colors.border
                        )}
                      />

                      <div className={cn('rounded-lg border p-4', colors.border, colors.bg)}>
                        <div className="flex items-center justify-between mb-4">
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
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {stageHours > 0 ? `${stageHours}h ${stageMinutes}m` : `${stageMinutes}m`}
                          </div>
                        </div>

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
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Want to create your own personalized learning roadmap?
          </p>
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
