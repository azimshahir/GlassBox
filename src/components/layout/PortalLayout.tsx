'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface PortalLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  role: string
  clientName?: string
  alertCount?: number
}

export function PortalLayout({
  children,
  title,
  subtitle,
  role,
  clientName,
  alertCount,
}: PortalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block relative z-20">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          role={role}
          clientName={clientName}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar role={role} clientName={clientName} onCollapse={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileMenuOpen(true)}
          alertCount={alertCount}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scroll-smooth">{children}</main>
      </div>
    </div>
  )
}
