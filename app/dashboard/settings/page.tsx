'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Bell, Volume2, Moon, Trash2, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  // These would normally be persisted to the database
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    darkMode: true, // Always dark in this app
  })

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] }
      // In a real app, save to database here
      toast.success('Setting updated')
      return newSettings
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete all user data (cascades will handle related data)
      await supabase.from('profiles').delete().eq('id', user.id)
      
      // Sign out
      await supabase.auth.signOut()
      
      toast.success('Account deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="container max-w-2xl py-6 px-4 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Preferences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="sound" className="text-base">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds when timer completes
                  </p>
                </div>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={() => handleSettingChange('soundEnabled')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notifications" className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when sessions end
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={() => handleSettingChange('notificationsEnabled')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme (always enabled)
                  </p>
                </div>
              </div>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data including roadmaps, resources,
                    and study history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">About StudyPath</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              StudyPath is an AI-powered learning platform that helps you create
              personalized learning roadmaps and track your progress from beginner
              to expert.
            </p>
            <p className="pt-2">
              Version 1.0.0
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
