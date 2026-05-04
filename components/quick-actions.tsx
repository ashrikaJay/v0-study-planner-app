'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Timer, BookOpen, Link, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  onOpenTimer: () => void
  onAddResource: () => void
  onCreateRoadmap: () => void
}

export function QuickActions({ onOpenTimer, onAddResource, onCreateRoadmap }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:hidden">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-transform",
              isOpen && "rotate-45"
            )}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mb-2">
          <DropdownMenuItem onClick={onOpenTimer} className="gap-2 py-3">
            <Timer className="h-4 w-4" />
            Start Timer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddResource} className="gap-2 py-3">
            <Link className="h-4 w-4" />
            Add Resource
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCreateRoadmap} className="gap-2 py-3">
            <BookOpen className="h-4 w-4" />
            New Roadmap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
