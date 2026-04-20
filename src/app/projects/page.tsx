"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderOpen, Plus, Search, Users,
  CheckCircle, MoreVertical, X,
  Check, Loader2, Lock, Globe
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn, slugify } from "@/lib/utils"
import { useSession }  from "next-auth/react"
import toast           from "react-hot-toast"

const COLORS = [
  "#8b5cf6","#06b6d4","#22c55e","#f59e0b",
  "#ef4444","#ec4899","#3b82f6","#f97316"
]

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects,     setProjects]     = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [search,       setSearch]       = useState("")
  const [showModal,    setShowModal]    = useState(false)
  const [workspaceId,  setWorkspaceId]  = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "", description: "", color: "#8b5cf6", isPublic: false
  })

  // Load projects and Workspace
useEffect(() => {
  async function load() {
    try {
      // Get workspace first
      const wsRes  = await fetch("/api/workspaces")
      const wsData = await wsRes.json()

      if (!wsData.data || wsData.data.length === 0) {
        // No workspace — create one automatically
        const createRes = await fetch("/api/workspaces", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name: "My Workspace" }),
        })
        const createData = await createRes.json()
        setWorkspaceId(createData.data?.id || null)
      } else {
        setWorkspaceId(wsData.data[0].id)
      }

      // Get projects
      const projRes  = await fetch("/api/projects")
      const projData = await projRes.json()
      setProjects(projData.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate() {
    if (!form.name.trim()) return
    if (!workspaceId) {
      toast.error("Create a workspace first!")
      return
    }

    setCreating(true)
    try {
      const res  = await fetch("/api/projects", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workspaceId }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.message); return }

      setProjects(prev => [data.data, ...prev])
      toast.success("Project created! 🎉")
      setShowModal(false)
      setForm({ name: "", description: "", color: "#8b5cf6", isPublic: false })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  return (
    <DashboardLayout>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",    value: projects.length,                                        color: "text-violet-400", border: "border-violet-500/20" },
          { label: "Active",   value: projects.filter(p => p.status === "active").length,    color: "text-green-400",  border: "border-green-500/20"  },
          { label: "Members",  value: projects.reduce((s: number, p: any) => s + (p._count?.members || 0), 0), color: "text-cyan-400", border: "border-cyan-500/20" },
          { label: "Tasks",    value: projects.reduce((s: number, p: any) => s + (p._count?.tasks || 0), 0),   color: "text-yellow-400", border: "border-yellow-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn("card-glass p-4 border", s.border)}>
            {loading
              ? <div className="h-8 shimmer-bg rounded-lg mb-1" />
              : <p className={cn("text-2xl font-black mb-0.5", s.color)}>{s.value}</p>
            }
            <p className="text-xs text-[#7c7ca8]">{s.label} Projects</p>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..." className="input pl-10" />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-glass p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 shimmer-bg rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 shimmer-bg rounded w-3/4" />
                  <div className="h-3 shimmer-bg rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 shimmer-bg rounded-full mb-4" />
              <div className="h-8 shimmer-bg rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project, i) => {
            const total = project._count?.tasks   || 0
            const done  = project.doneCount        || 0
            const pct   = total ? Math.round((done / total) * 100) : 0

            return (
              <motion.div key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="card-glass p-5 cursor-pointer hover:shadow-lg transition-all group"
                style={{ borderColor: `${project.color}25` }}
                onClick={() => window.location.href = `/projects/${project.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${project.color}20` }}>
                      {project.icon || "📁"}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {project.isPublic
                          ? <Globe className="w-3 h-3 text-[#7c7ca8]" />
                          : <Lock  className="w-3 h-3 text-[#7c7ca8]" />
                        }
                        <span className="text-[10px] text-[#7c7ca8]">
                          {project.isPublic ? "Public" : "Private"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="btn-ghost p-1 opacity-0 group-hover:opacity-100"
                    onClick={e => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {project.description && (
                  <p className="text-xs text-[#7c7ca8] mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#7c7ca8]">Progress</span>
                    <span className="font-bold" style={{ color: project.color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: project.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-3 text-xs text-[#7c7ca8]">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {done}/{total}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project._count?.members || 0}
                    </div>
                  </div>
                  {/* Member avatars */}
                  <div className="flex -space-x-1">
                    {project.members?.slice(0, 3).map((m: any) => (
                      <div key={m.user.id}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600
                          border-2 border-[#12122a] flex items-center justify-center text-[9px] font-bold text-white">
                        {m.user.name?.charAt(0) || "?"}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* New Project Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filtered.length * 0.08 }}
            onClick={() => setShowModal(true)}
            className="card-glass p-5 cursor-pointer border-dashed
              hover:border-violet-500/50 hover:bg-violet-500/5 transition-all
              flex flex-col items-center justify-center min-h-48 gap-3"
            style={{ borderColor: "rgba(139,92,246,0.2)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-[#7c7ca8]">New Project</p>
          </motion.div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-glass p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-lg text-white">Create Project</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Name *
                  </label>
                  <input type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="My Awesome Project" className="input" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea rows={2} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What's this project about?"
                    className="input resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(color => (
                      <button key={color} onClick={() => setForm({ ...form, color })}
                        className={cn("w-8 h-8 rounded-xl transition-all",
                          form.color === color ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"
                        )}
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="text-sm font-semibold text-white">Public Project</p>
                    <p className="text-xs text-[#7c7ca8]">Anyone in workspace can view</p>
                  </div>
                  <button onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                    className={cn("w-11 h-6 rounded-full transition-all relative",
                      form.isPublic ? "bg-violet-600" : "bg-white/10")}>
                    <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                      form.isPublic ? "left-6" : "left-1")} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreate}
                  disabled={!form.name.trim() || creating}
                  className="flex-1 btn-primary">
                  {creating
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Check className="w-4 h-4" />Create</>
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}