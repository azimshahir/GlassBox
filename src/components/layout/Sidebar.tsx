'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Link2,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  role: string
  clientName?: string
}

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/clients', icon: Users, label: 'Clients' },
  { href: '/admin/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/admin/accounts', icon: Link2, label: 'Google Accounts' },
  { href: '/admin/alerts', icon: Bell, label: 'Alerts' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

const clientNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '/dashboard/help', icon: HelpCircle, label: 'Help' },
]

export function Sidebar({
  isCollapsed = false,
  onCollapse,
  role,
  clientName,
}: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === 'ADMIN' ? adminNavItems : clientNavItems
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check system preference or local storage
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-colors duration-300 relative"
    >
      {/* Collapse Toggle Button */}
      {onCollapse && (
        <button
          onClick={() => onCollapse(!isCollapsed)}
          className="absolute -right-3 top-8 bg-white border border-sidebar-border rounded-full p-1 shadow-sm text-sidebar-foreground hover:text-primary transition-colors z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-3 h-20 px-6 border-b border-sidebar-border/50">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <div className="w-5 h-5 bg-primary rounded-full" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-xl tracking-tight"
            >
              GlassBox
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Client Name (for client view) */}
      {!isCollapsed && clientName && (
        <div className="px-6 py-4">
          <div className="p-3 bg-sidebar-accent/50 rounded-xl border border-sidebar-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Workspace</p>
            <p className="text-sm font-medium truncate text-foreground">{clientName}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' &&
              item.href !== '/dashboard' &&
              pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform", isActive ? "scale-105" : "group-hover:scale-110")} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer & Theme Toggle */}
      <div className="p-4 border-t border-sidebar-border/50 space-y-2">
        {!isCollapsed && (
          <div className="bg-sidebar-accent/50 p-1 rounded-full flex items-center mb-4 relative">
            <motion.div
              className="absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm"
              animate={{ x: theme === 'light' ? 0 : '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => {
                setTheme('light')
                document.documentElement.classList.remove('dark')
              }}
              className={cn("flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium relative z-10 transition-colors", theme === 'light' ? "text-foreground" : "text-muted-foreground")}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => {
                setTheme('dark')
                document.documentElement.classList.add('dark')
              }}
              className={cn("flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium relative z-10 transition-colors", theme === 'dark' ? "text-foreground" : "text-muted-foreground")}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors w-full',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}
