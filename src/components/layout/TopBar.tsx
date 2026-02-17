'use client'

import { Bell, Menu, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TopBarProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  alertCount?: number
  role?: string
  userName?: string
}

export function TopBar({ title, subtitle, onMenuClick, alertCount = 0, role, userName }: TopBarProps) {
  const displayName = role === 'ADMIN' ? 'Admin' : userName || 'User'
  return (
    <header className="h-20 bg-background/50 backdrop-blur-md border-b border-border sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 w-64 bg-card border-border focus:ring-primary/20 rounded-full transition-shadow shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground border border-border px-1.5 rounded bg-muted/50">
            ⌘K
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-background rounded-full"></span>
            )}
          </Button>

          <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

          <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-700 rounded-full flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground leading-none">{displayName}</span>
              <span className="text-xs text-muted-foreground">View Profile</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
