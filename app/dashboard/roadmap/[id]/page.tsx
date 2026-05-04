'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RoadmapView } from '@/components/roadmap/roadmap-view'
import { ResourcesPanel } from '@/components/roadmap/resources-panel'
import { AddResourceDialog } from '@/components/roadmap/add-resource-dialog'
import { SuggestResourcesDialog } from '@/components/roadmap/suggest-resources-dialog'
import { ShareDialog } from '@/components/roadmap/share-dialog'
import { StudyTimer } from '@/components/study-timer'
import { DailyGoal } from '@/components/daily-goal'
import { QuickActions } from '@/components/quick-actions'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Plus, Sparkles, Share2, Trash2, BookOpen, Link, Timer } from 'lucide-react'
import { toast } from 'sonner'
import type { Roadmap, Resource, Profile, Stage, ConceptProgress } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RoadmapPageProps {
  params: Promise<{ id: string }>
}

export default function RoadmapPage({ params }: RoadmapPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [conceptProgress, setConceptProgress] = useState<ConceptProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [activeTab, setActiveTab] = useState<'roadmap' | 'resources'>('roadmap')

  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, roadmapRes, resourcesRes, progressRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('roadmaps').select('*').eq('id', id).single(),
      supabase.from('resources').select('*').eq('roadmap_id', id).order('created_at', { ascending: false }),
      supabase.from('concept_progress').select('*').eq('roadmap_id', id),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (roadmapRes.data) setRoadmap(roadmapRes.data)
    if (resourcesRes.data) setResources(resourcesRes.data)
    if (progressRes.data) setConceptProgress(progressRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleResourceAdded = (resource: Resource) => {
    setResources(prev => [resource, ...prev])
    setAddResourceOpen(false)
  }

  const handleResourceUpdated = (updatedResource: Resource) => {
    setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r))
  }

  const handleResourceDeleted = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId))
  }

  const handleProgressUpdate = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase.from('concept_progress').select('*').eq('roadmap_id', id)
    if (data) setConceptProgress(data)
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('roadmaps').delete().eq('id', id)
      if (error) throw error
      toast.success('Roadmap deleted')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to delete roadmap')
    }
  }

  const handleAddToStage = (stage: Stage) => {
    setSelectedStage(stage)
    setAddResourceOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Roadmap not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Header - mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{roadmap.topic}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {roadmap.stages.length} stages · {resources.length} resources
              </p>
            </div>
          </div>
          
          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2">
            <StudyTimer roadmapId={id} compact onSessionComplete={fetchData} />
            <Button variant="outline" size="sm" onClick={() => setSuggestOpen(true)}>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Suggest
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddResourceOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Resource
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {/* Mobile actions row */}
          <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1">
            <Button variant="outline" size="sm" onClick={() => setTimerOpen(true)} className="shrink-0">
              <Timer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSuggestOpen(true)} className="shrink-0">
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddResourceOpen(true)} className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShareOpen(true)} className="shrink-0">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="shrink-0">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden mb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'roadmap' | 'resources')}>
            <TabsList className="w-full">
              <TabsTrigger value="roadmap" className="flex-1 gap-1">
                <BookOpen className="h-4 w-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex-1 gap-1">
                <Link className="h-4 w-4" />
                Resources
              </TabsTrigger>
            </TabsList>
            <TabsContent value="roadmap" className="mt-4">
              <div className="space-y-4">
                <DailyGoal compact />
                <RoadmapView 
                  roadmap={roadmap} 
                  resources={resources}
                  conceptProgress={conceptProgress}
                  onAddToStage={handleAddToStage}
                  onProgressUpdate={handleProgressUpdate}
                />
              </div>
            </TabsContent>
            <TabsContent value="resources" className="mt-4">
              <ResourcesPanel
                resources={resources}
                roadmap={roadmap}
                onResourceUpdated={handleResourceUpdated}
                onResourceDeleted={handleResourceDeleted}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <RoadmapView 
              roadmap={roadmap} 
              resources={resources}
              conceptProgress={conceptProgress}
              onAddToStage={handleAddToStage}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>
          <div className="space-y-4">
            <DailyGoal />
            <StudyTimer roadmapId={id} onSessionComplete={fetchData} />
            <ResourcesPanel
              resources={resources}
              roadmap={roadmap}
              onResourceUpdated={handleResourceUpdated}
              onResourceDeleted={handleResourceDeleted}
            />
          </div>
        </div>
      </main>

      {/* Mobile Quick Actions */}
      <QuickActions
        onOpenTimer={() => setTimerOpen(true)}
        onAddResource={() => setAddResourceOpen(true)}
        onCreateRoadmap={() => router.push('/dashboard')}
      />

      {/* Mobile Timer Dialog */}
      <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Study Timer</DialogTitle>
          </DialogHeader>
          <StudyTimer roadmapId={id} onSessionComplete={() => { fetchData(); setTimerOpen(false); }} />
        </DialogContent>
      </Dialog>

      <AddResourceDialog
        open={addResourceOpen}
        onOpenChange={setAddResourceOpen}
        roadmap={roadmap}
        defaultStage={selectedStage}
        onResourceAdded={handleResourceAdded}
      />

      <SuggestResourcesDialog
        open={suggestOpen}
        onOpenChange={setSuggestOpen}
        roadmap={roadmap}
        onResourceAdded={handleResourceAdded}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        roadmap={roadmap}
        onRoadmapUpdated={setRoadmap}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roadmap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this roadmap? This action cannot be undone.
              All associated resources will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
