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
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Sparkles, Share2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Roadmap, Resource, Profile, Stage } from '@/lib/types'
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

interface RoadmapPageProps {
  params: Promise<{ id: string }>
}

export default function RoadmapPage({ params }: RoadmapPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)

  const supabase = createClient()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, roadmapRes, resourcesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('roadmaps').select('*').eq('id', id).single(),
      supabase.from('resources').select('*').eq('roadmap_id', id).order('created_at', { ascending: false }),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (roadmapRes.data) setRoadmap(roadmapRes.data)
    if (resourcesRes.data) setResources(resourcesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleResourceAdded = (resource: Resource) => {
    setResources([resource, ...resources])
    setAddResourceOpen(false)
  }

  const handleResourceUpdated = (updatedResource: Resource) => {
    setResources(resources.map(r => r.id === updatedResource.id ? updatedResource : r))
  }

  const handleResourceDeleted = (resourceId: string) => {
    setResources(resources.filter(r => r.id !== resourceId))
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
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{roadmap.topic}</h1>
              <p className="text-sm text-muted-foreground">
                {roadmap.stages.length} stages · {resources.length} resources
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RoadmapView 
              roadmap={roadmap} 
              resources={resources}
              onAddToStage={handleAddToStage}
            />
          </div>
          <div>
            <ResourcesPanel
              resources={resources}
              roadmap={roadmap}
              onResourceUpdated={handleResourceUpdated}
              onResourceDeleted={handleResourceDeleted}
            />
          </div>
        </div>
      </main>

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
