'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Lightbulb,
  Film,
  SendHorizonal,
  BarChart3,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Feed', href: '/dashboard', icon: Sparkles, comingSoon: false },
  { label: 'Ideas', href: '/dashboard/studio', icon: Lightbulb, comingSoon: false },
  { label: 'Editor', href: '/dashboard/editor', icon: Film, comingSoon: false },
  { label: 'Publish', href: '/dashboard/publish', icon: SendHorizonal, comingSoon: false },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, comingSoon: false },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-accent/20 border border-accent/40 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
            <Zap size={14} className="text-accent" />
          </div>
          <span className="font-semibold text-sm text-white">Creator OS</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 py-2">Workspace</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.comingSoon ? '#' : item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-accent/15 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
                item.comingSoon && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-400'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-accent/15 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon size={15} className="relative z-10 flex-shrink-0" />
              <span className="relative z-10 font-medium">{item.label}</span>
              {item.comingSoon && (
                <span className="relative z-10 ml-auto text-[9px] font-semibold text-slate-600 uppercase tracking-wider">
                  Soon
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: settings + signout */}
      <div className="p-3 border-t border-border space-y-0.5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={15} />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut size={15} />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
