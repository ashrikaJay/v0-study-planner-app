'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { User, Mail, Calendar, Save } from 'lucide-react'
import { format } from 'date-fns'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email,
          display_name: user.email?.split('@')[0] || 'User',
        }
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()
        if (created) {
          setProfile(created)
          setDisplayName(created.display_name || '')
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, display_name: displayName })
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="container max-w-2xl py-6 px-4 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Profile</h1>

      <div className="space-y-6">
        {/* Avatar Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Your Avatar</CardTitle>
            <CardDescription>This is how you appear across the platform</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <p className="font-medium text-lg">{displayName || 'Set your display name'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <Input
                value={profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : '-'}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || displayName === profile?.display_name}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
