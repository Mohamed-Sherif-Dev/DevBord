"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname }                  from "next/navigation"
import { motion, AnimatePresence }      from "framer-motion"
import {
  Bell, Search, Sun, Moon, Plus,
  Command, X, Check, Clock,
  AlertCircle, CheckCircle, Zap
} from "lucide-react"
import { useTheme }   from "next-themes"
import { useUIStore } from "@/store/uiStore"
import { cn, formatRelativeTime } from "@/lib/utils"

const TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/projects":   "Projects",
  "/my-tasks":   "My Tasks",
  "/team":       "Team",
  "/settings":   "Settings",
}

export default function Topbar() {
  const pathname  = usePathname()
  const { theme, setTheme }  = useTheme()
  const { openNewTaskModal } = useUIStore()

  // ── Search ──────────────────────────────────────
  const [search,        setSearch]        = useState("")
  const [showSearch,    setShowSearch]    = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching,     setSearching]     = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // ── Notifications ────────────────────────────────
  const [showNotifs,  setShowNotifs]  = useState(false)
  const [notifs,      setNotifs]      = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const title = Object.entries(TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] || "DevBoard"

  // ── Load Notifications ───────────────────────────
  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      const res  = await fetch("/api/notifications")
      const data = await res.json()
      if (data.data) {
        setNotifs(data.data.notifications || [])
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch {
      // Silent fail
    }
  }

  // ── Search with debounce ─────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    if(searchTimeout.current){
      clearTimeout(searchTimeout.current)
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        // Search tasks
        const [tasksRes, projectsRes] = await Promise.all([
          fetch(`/api/tasks?search=${encodeURIComponent(search)}`),
          fetch(`/api/projects`),
        ])
        const tasksData    = await tasksRes.json()
        const projectsData = await projectsRes.json()

        const tasks    = (tasksData.data    || [])
          .filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 4)

        const projects = (projectsData.data || [])
          .filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)

        setSearchResults([
          ...tasks.map((t: any) => ({
            id:       t.id,
            type:     "task",
            title:    t.title,
            subtitle: `${t.project?.name || "Project"} · ${t.priority}`,
            href:     `/projects/${t.projectId}`,
          })),
          ...projects.map((p: any) => ({
            id:       p.id,
            type:     "project",
            title:    p.name,
            subtitle: `${p._count?.members || 0} members · ${p._count?.tasks || 0} tasks`,
            href:     `/projects/${p.id}`,
          })),
        ])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [search])

  // ── Close on outside click ───────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
        setSearch("")
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Mark all read ────────────────────────────────
  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    await fetch("/api/notifications", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({}),
    }).catch(console.error)
  }

  // ── Mark one read ────────────────────────────────
  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    await fetch("/api/notifications", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ids: [id] }),
    }).catch(console.error)
  }

  // ── Delete notification ──────────────────────────
  function deleteNotif(id: string) {
    const notif = notifs.find(n => n.id === id)
    setNotifs(prev => prev.filter(n => n.id !== id))
    if (notif && !notif.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // ── Notif Icon & Color ───────────────────────────
  function getNotifConfig(type: string) {
    switch (type) {
      case "TASK_ASSIGNED":  return { icon: AlertCircle,  color: "text-violet-400", bg: "bg-violet-500/15" }
      case "TASK_COMPLETED": return { icon: CheckCircle,  color: "text-green-400",  bg: "bg-green-500/15"  }
      case "TASK_DUE_SOON":  return { icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/15" }
      case "COMMENT_ADDED":  return { icon: Zap,          color: "text-cyan-400",   bg: "bg-cyan-500/15"   }
      case "MEMBER_JOINED":  return { icon: CheckCircle,  color: "text-blue-400",   bg: "bg-blue-500/15"   }
      default:               return { icon: Bell,         color: "text-violet-400", bg: "bg-violet-500/15" }
    }
  }

  const TYPE_ICON: Record<string, string> = {
    task:    "📋",
    project: "📁",
    member:  "👤",
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
      style={{ background: "rgba(7,7,16,0.9)", borderBottom: "1px solid rgba(139,92,246,0.1)", backdropFilter: "blur(12px)" }}>

      {/* Left */}
      <div>
        <h1 className="text-lg font-black text-white">{title}</h1>
        <p className="text-xs text-[#7c7ca8] hidden sm:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* ── Search ── */}
        <div ref={searchRef} className="relative">
          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.div key="open"
                initial={{ width: 48, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 48, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tasks, projects..."
                    className="input pl-9 pr-8 h-9 w-full text-sm"
                    onKeyDown={e => e.key === "Escape" && setShowSearch(false)}
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7c7ca8] hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Results Dropdown */}
                <AnimatePresence>
                  {search && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-11 left-0 right-0 card-glass shadow-2xl overflow-hidden z-50"
                      style={{ border: "1px solid rgba(139,92,246,0.2)" }}
                    >
                      {searching ? (
                        <div className="px-4 py-6 text-center">
                          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent
                            rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-xs text-[#7c7ca8]">Searching...</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-[#7c7ca8]">No results for "{search}"</p>
                          <p className="text-xs text-[#7c7ca8] mt-1">Try a different keyword</p>
                        </div>
                      ) : (
                        <div>
                          {["task","project"].map(type => {
                            const items = searchResults.filter(r => r.type === type)
                            if (!items.length) return null
                            return (
                              <div key={type}>
                                <p className="px-3 py-2 text-[10px] font-bold text-[#7c7ca8] uppercase tracking-wider"
                                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                  {type === "task" ? "Tasks" : "Projects"}
                                </p>
                                {items.map(item => (
                                  <a key={item.id} href={item.href}
                                    onClick={() => { setShowSearch(false); setSearch("") }}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors">
                                    <span className="text-base shrink-0">{TYPE_ICON[item.type]}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                                      <p className="text-xs text-[#7c7ca8] truncate">{item.subtitle}</p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.button key="closed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-[#7c7ca8]
                  hover:border-violet-500/50 hover:text-white transition-all"
                style={{ background: "rgba(18,18,42,0.8)", borderColor: "rgba(139,92,246,0.2)" }}>
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Search</span>
                <span className="hidden sm:flex items-center gap-0.5 border border-white/10 rounded px-1 py-0.5 text-[10px]">
                  <Command className="w-2.5 h-2.5" />K
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Theme ── */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn-ghost p-2.5">
          <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
            {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
          </motion.div>
        </button>

        {/* ── Notifications ── */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className="btn-ghost p-2.5 relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full
                  flex items-center justify-center text-[9px] font-black text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 card-glass shadow-2xl overflow-hidden z-50"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="badge bg-violet-500/20 text-violet-400 text-[10px]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-10 h-10 text-[#7c7ca8] opacity-20 mx-auto mb-2" />
                      <p className="text-sm text-[#7c7ca8]">No notifications yet</p>
                      <p className="text-xs text-[#7c7ca8] mt-1">
                        Assign tasks to teammates to see notifications here
                      </p>
                    </div>
                  ) : (
                    notifs.map((notif, i) => {
                      const nc   = getNotifConfig(notif.type)
                      const Icon = nc.icon
                      return (
                        <motion.div key={notif.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => markRead(notif.id)}
                          className={cn(
                            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 group",
                            !notif.isRead && "bg-violet-500/5"
                          )}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", nc.bg)}>
                            <Icon className={cn("w-4 h-4", nc.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{notif.title}</p>
                            <p className="text-xs text-[#7c7ca8] mt-0.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-[#7c7ca8] mt-1">
                              {formatRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-violet-500 rounded-full" />
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 text-[#7c7ca8]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>

                {/* Footer */}
                {notifs.length > 0 && (
                  <div className="px-4 py-2.5 text-center"
                    style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
                    <a href="/notifications"
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                      View all notifications →
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── New Task ── */}
        <button onClick={openNewTaskModal} className="btn-primary text-xs px-3 py-2 hidden sm:flex">
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>
    </header>
  )
}