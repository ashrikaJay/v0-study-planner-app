'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { TopicInput } from '@/components/topic-input'
import { RoadmapDisplay } from '@/components/roadmap-display'
import { ResourceClassifier } from '@/components/resource-classifier'
import { ResourcesDashboard } from '@/components/resources-dashboard'
import { useStudyStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Route, FolderOpen, LayoutDashboard, Sparkles } from 'lucide-react'
import type { Roadmap, Resource, Stage, Priority } from '@/lib/types'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const {
    roadmaps,
    resources,
    activeRoadmapId,
    addRoadmap,
    addResource,
    toggleResourceComplete,
  } = useStudyStore()

  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId)
  const activeResources = resources.filter((r) => r.roadmapId === activeRoadmapId)

  const handleGenerateRoadmap = async (topic: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate roadmap')
      }

      const data = await response.json()
      
      const roadmap: Roadmap = {
        id: crypto.randomUUID(),
        topic,
        stages: data.stages,
        createdAt: new Date(),
      }

      addRoadmap(roadmap)
      toast.success(`Roadmap generated for "${topic}"`)
    } catch (error) {
      console.error('[v0] Failed to generate roadmap:', error)
      toast.error('Failed to generate roadmap. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleResourceClassified = (
    classification: { title: string; stage: Stage; priority: Priority },
    content: string,
    url?: string
  ) => {
    if (!activeRoadmapId) return

    const resource: Resource = {
      id: crypto.randomUUID(),
      roadmapId: activeRoadmapId,
      title: classification.title,
      content,
      url,
      stage: classification.stage,
      priority: classification.priority,
      completed: false,
      createdAt: new Date(),
    }

    addResource(resource)
    toast.success('Resource added to dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
            Your AI-Powered Learning Journey
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Generate personalized roadmaps, classify resources by skill level, and track your progress from beginner to expert.
          </p>
        </div>

        {/* Topic Input */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Learning Roadmap
            </CardTitle>
            <CardDescription>
              Enter any topic and AI will create a structured path from zero to expert
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopicInput onGenerate={handleGenerateRoadmap} isLoading={isGenerating} />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        {activeRoadmap ? (
          <Tabs defaultValue="roadmap" className="space-y-6">
            <TabsList className="bg-card border border-border p-1 h-auto">
              <TabsTrigger
                value="roadmap"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4"
              >
                <Route className="h-4 w-4" />
                <span className="hidden sm:inline">Roadmap</span>
              </TabsTrigger>
              <TabsTrigger
                value="classify"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Classify Resources</span>
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                {activeResources.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                    {activeResources.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <RoadmapDisplay
                    stages={activeRoadmap.stages}
                    topic={activeRoadmap.topic}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classify" className="mt-6">
              <Card className="bg-card border-border max-w-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Resource Classifier</CardTitle>
                  <CardDescription>
                    Paste a URL or text and AI will determine the appropriate learning stage and priority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResourceClassifier
                    roadmapStages={activeRoadmap.stages}
                    onClassified={handleResourceClassified}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Learning Dashboard</CardTitle>
                  <CardDescription>
                    Track your progress across all skill levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResourcesDashboard
                    resources={activeResources}
                    onToggleComplete={toggleResourceComplete}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-16">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Route className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No roadmap yet</EmptyTitle>
                  <EmptyDescription>
                    Enter a topic above to generate your first learning roadmap
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
