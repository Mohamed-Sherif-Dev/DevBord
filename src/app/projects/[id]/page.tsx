"use client"

import { useState, use, useEffect } from "react"
import { motion, AnimatePresence }   from "framer-motion"
import {
  Plus, Search, X, Check,
  Loader2, Calendar, Zap,
  MessageSquare, Paperclip
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn, PRIORITY_CONFIG, formatDate, getInitials } from "@/lib/utils"
import { useSession } from "next-auth/react"
import toast          from "react-hot-toast"

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }            = use(params)
  const { data: session } = useSession()

  const [project,   setProject]   = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating,  setCreating]  = useState(false)
  const [targetCol, setTargetCol] = useState("")
  const [search,    setSearch]    = useState("")
  const [selected,  setSelected]  = useState<any>(null)

  const [form, setForm] = useState({
    title:    "",
    priority: "MEDIUM",
    dueDate:  "",
    assigneeId: "",
  })

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleAddTask() {
    if (!form.title.trim() || !targetCol) return
    setCreating(true)
    try {
      const res  = await fetch("/api/tasks", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:      form.title,
          priority:   form.priority,
          dueDate:    form.dueDate || null,
          assigneeId: form.assigneeId || null,
          projectId:  id,
          columnId:   targetCol,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }

      // Add task to column
      setProject((prev: any) => ({
        ...prev,
        columns: prev.columns.map((col: any) =>
          col.id === targetCol
            ? { ...col, tasks: [data.data, ...col.tasks] }
            : col
        )
      }))

      toast.success("Task created! ✅")
      setShowModal(false)
      setForm({ title: "", priority: "MEDIUM", dueDate: "", assigneeId: "" })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  async function moveTask(taskId: string, fromColId: string, toColId: string) {
    // Optimistic update
    let movedTask: any
    setProject((prev: any) => ({
      ...prev,
      columns: prev.columns.map((col: any) => {
        if (col.id === fromColId) {
          movedTask = col.tasks.find((t: any) => t.id === taskId)
          return { ...col, tasks: col.tasks.filter((t: any) => t.id !== taskId) }
        }
        if (col.id === toColId && movedTask) {
          return { ...col, tasks: [movedTask, ...col.tasks] }
        }
        return col
      })
    }))

    // API update
    await fetch(`/api/tasks/${taskId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: toColId }),
    }).catch(console.error)

    toast.success(`Task moved! ✅`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="kanban-col shrink-0 w-72 animate-pulse">
              <div className="h-6 shimmer-bg rounded-lg mb-4 w-32" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-24 shimmer-bg rounded-xl mb-2" />
              ))}
            </div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-[#7c7ca8]">Project not found or access denied.</p>
        </div>
      </DashboardLayout>
    )
  }

  const totalTasks = project.columns?.reduce((s: number, c: any) => s + c.tasks.length, 0) || 0
  const doneTasks  = project.columns?.find((c: any) => c.name === "Done")?.tasks.length || 0
  const pct        = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: `${project.color}20` }}>
            {project.icon || "📁"}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{project.name}</h2>
            <p className="text-xs text-[#7c7ca8] mt-0.5">
              {totalTasks} tasks · {pct}% done · {project.members?.length} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="input pl-9 w-44" />
          </div>
          <button onClick={() => {
            setShowModal(true)
            setTargetCol(project.columns?.[1]?.id || "")
          }} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
          />
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {project.columns?.map((col: any) => {
          const colTasks = col.tasks.filter((t: any) =>
            !search || t.title.toLowerCase().includes(search.toLowerCase())
          )
          return (
            <div key={col.id} className="kanban-col shrink-0 w-72">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color || "#8b5cf6" }} />
                  <span className="text-sm font-semibold text-white">{col.name}</span>
                  <span className="text-xs text-[#7c7ca8] bg-white/5 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <button onClick={() => { setShowModal(true); setTargetCol(col.id) }}
                  className="btn-ghost p-1 text-[#7c7ca8] hover:text-violet-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {colTasks.map((task: any, i: number) => {
                  const pc = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && col.name !== "Done"

                  return (
                    <motion.div key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(task)}
                      className="task-card group"
                    >
                      {/* Priority */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={cn("badge text-[10px] border", pc.bg, pc.color, pc.border)}>
                          {pc.label}
                        </span>
                        {task.labels?.map((l: any) => (
                          <span key={l.labelId} className="badge text-[10px]"
                            style={{ background: `${l.label.color}20`, color: l.label.color }}>
                            {l.label.name}
                          </span>
                        ))}
                      </div>

                      {/* Title */}
                      <p className="text-sm font-semibold text-white mb-3 leading-snug">
                        {task.title}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#7c7ca8]">
                          {task._count?.comments > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <MessageSquare className="w-3 h-3" />
                              {task._count.comments}
                            </div>
                          )}
                          {task._count?.attachments > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <Paperclip className="w-3 h-3" />
                              {task._count.attachments}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className={cn("flex items-center gap-1 text-xs",
                              isOverdue ? "text-red-400" : "text-[#7c7ca8]")}>
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                        {task.assignee && (
                          <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-cyan-600
                            rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            title={task.assignee.name}>
                            {getInitials(task.assignee.name)}
                          </div>
                        )}
                      </div>

                      {/* Move Buttons */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                        {project.columns
                          .filter((c: any) => c.id !== col.id)
                          .map((c: any) => (
                            <button key={c.id}
                              onClick={e => { e.stopPropagation(); moveTask(task.id, col.id, c.id) }}
                              className="text-[10px] px-2 py-1 rounded-lg transition-all font-medium"
                              style={{ background: `${c.color || "#8b5cf6"}20`, color: c.color || "#8b5cf6" }}>
                              → {c.name}
                            </button>
                          ))
                        }
                      </div>
                    </motion.div>
                  )
                })}

                {/* Add task */}
                <button onClick={() => { setShowModal(true); setTargetCol(col.id) }}
                  className="w-full py-2.5 rounded-xl text-xs text-[#7c7ca8]
                    border border-dashed border-white/10
                    hover:border-violet-500/30 hover:text-violet-400
                    transition-all flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add task
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Task Modal */}
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
                <h2 className="font-black text-lg text-white">New Task</h2>
                <div className="flex items-center gap-2">
                  <select value={targetCol} onChange={e => setTargetCol(e.target.value)}
                    className="input py-1 px-2 text-xs w-auto">
                    {project.columns?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title..." className="input"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleAddTask()} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">Priority</label>
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                      className="input">
                      {["URGENT","HIGH","MEDIUM","LOW"].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">Due Date</label>
                    <input type="date" value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="input" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Assign To
                  </label>
                  <select value={form.assigneeId}
                    onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                    className="input">
                    <option value="">Unassigned</option>
                    {project.members?.map((m: any) => (
                      <option key={m.userId} value={m.userId}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={handleAddTask}
                  disabled={!form.title.trim() || creating}
                  className="flex-1 btn-primary">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" />Create</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-glass p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const pc = PRIORITY_CONFIG[selected.priority as keyof typeof PRIORITY_CONFIG]
                      return <span className={cn("badge text-xs border", pc.bg, pc.color, pc.border)}>{pc.label}</span>
                    })()}
                  </div>
                  <h2 className="text-lg font-black text-white">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="btn-ghost p-1.5 ml-3">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Assignee", value: selected.assignee?.name || "Unassigned" },
                  { label: "Due Date", value: selected.dueDate ? formatDate(selected.dueDate) : "No date" },
                  { label: "Comments", value: selected._count?.comments || 0 },
                  { label: "Subtasks", value: selected._count?.subtasks || 0 },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] text-[#7c7ca8] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">Move to</p>
                <div className="flex flex-wrap gap-2">
                  {project.columns?.map((c: any) => {
                    const currentCol = project.columns.find((col: any) =>
                      col.tasks.some((t: any) => t.id === selected.id)
                    )
                    return (
                      <button key={c.id}
                        onClick={() => {
                          if (currentCol && currentCol.id !== c.id) {
                            moveTask(selected.id, currentCol.id, c.id)
                            setSelected(null)
                          }
                        }}
                        className="text-xs px-3 py-2 rounded-xl font-medium transition-all"
                        style={{ background: `${c.color || "#8b5cf6"}20`, color: c.color || "#8b5cf6" }}>
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}