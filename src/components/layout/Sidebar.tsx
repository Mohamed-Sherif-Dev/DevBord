"use client"

import Link            from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, FolderOpen, Users,
  Settings, Bell, ChevronLeft, ChevronRight,
  Zap, LogOut, Plus, Search
} from "lucide-react"
import { useUIStore }   from "@/store/uiStore"
import { useSession, signOut } from "next-auth/react"
import { cn, getInitials } from "@/lib/utils"

const NAV = [
  { label: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { label: "Projects",  href: "/projects",   icon: FolderOpen      },
  { label: "My Tasks",  href: "/my-tasks",   icon: Bell            },
  { label: "Team",      href: "/team",       icon: Users           },
  { label: "Settings",  href: "/settings",   icon: Settings        },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, collapseSidebar } = useUIStore()
  const { data: session } = useSession()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden"
      style={{
        background: "#0d0d1a",
        borderRight: "1px solid rgba(139,92,246,0.1)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500
          rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              <p className="font-black text-white text-sm">DevBoard</p>
              <p className="text-[10px] text-violet-400">Task Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 shrink-0">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
            bg-violet-600/15 border border-violet-500/20 text-violet-400
            hover:bg-violet-600/25 transition-all text-sm font-semibold">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV.map(item => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-violet-600/80 to-violet-500/50 text-white shadow-lg shadow-violet-500/20"
                  : "text-[#7c7ca8] hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className="w-4 h-4 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5
                    bg-[#1a1a2e] text-white text-xs rounded-lg
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none whitespace-nowrap shadow-xl z-50
                    border border-violet-500/20">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 shrink-0"
        style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl
          hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-600
            rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white">
            {getInitials(session?.user?.name)}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-[#7c7ca8] truncate">{session?.user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="opacity-0 group-hover:opacity-100 transition-opacity">
                <LogOut className="w-4 h-4 text-red-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse */}
      <button onClick={collapseSidebar}
        className="absolute -right-3 top-20 w-6 h-6
          bg-violet-600 text-white rounded-full
          flex items-center justify-center
          shadow-lg hover:bg-violet-500 transition-colors z-10">
        {sidebarCollapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />
        }
      </button>
    </motion.aside>
  )
}