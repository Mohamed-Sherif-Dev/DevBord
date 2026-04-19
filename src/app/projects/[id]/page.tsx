"use client"

import { useState, use }  from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Search, Filter, MoreVertical,
  Clock, Users, Tag, X, Check,
  Loader2, Calendar, Zap, ChevronDown,
  MessageSquare, Paperclip, Timer
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import {
  cn, PRIORITY_CONFIG, STATUS_CONFIG,
  getInitials, formatDate
} from "@/lib/utils"
import toast from "react-hot-toast"

const COLUMNS = [
  { id: "backlog",     label: "📋 Backlog",     color: "#6b7280" },
  { id: "todo",        label: "🎯 To Do",        color: "#3b82f6" },
  { id: "in_progress", label: "⚡ In Progress",  color: "#8b5cf6" },
  { id: "in_review",   label: "👀 In Review",    color: "#06b6d4" },
  { id: "done",        label: "✅ Done",          color: "#22c55e" },
]

const MOCK_TASKS: Record<string, any[]> = {
  backlog: [
    { id: "t1", title: "Setup monitoring with Datadog",    priority: "LOW",    assignee: "SJ", comments: 2, attachments: 0, dueDate: null, labels: ["devops"] },
    { id: "t2", title: "Write API documentation",          priority: "MEDIUM", assignee: null, comments: 0, attachments: 1, dueDate: "2025-04-20", labels: ["docs"] },
  ],
  todo: [
    { id: "t3", title: "Fix authentication bug",           priority: "URGENT", assignee: "MS", comments: 5, attachments: 0, dueDate: "2025-04-06", labels: ["bug"] },
    { id: "t4", title: "Design onboarding flow",           priority: "HIGH",   assignee: "AH", comments: 3, attachments: 2, dueDate: "2025-04-08", labels: ["design"] },
    { id: "t5", title: "Implement dark mode toggle",       priority: "MEDIUM", assignee: null, comments: 1, attachments: 0, dueDate: "2025-04-10", labels: ["ui"] },
  ],
  in_progress: [
    { id: "t6", title: "Build Kanban drag and drop",       priority: "HIGH",   assignee: "MS", comments: 8, attachments: 1, dueDate: "2025-04-07", labels: ["feature"] },
    { id: "t7", title: "Database schema optimization",     priority: "MEDIUM", assignee: "SJ", comments: 4, attachments: 0, dueDate: "2025-04-09", labels: ["backend"] },
    { id: "t8", title: "Email notification system",        priority: "HIGH",   assignee: "AH", comments: 2, attachments: 0, dueDate: "2025-04-08", labels: ["feature"] },
  ],
  in_review: [
    { id: "t9", title: "Code review — PR #42",             priority: "HIGH",   assignee: "MS", comments: 6, attachments: 0, dueDate: "2025-04-05", labels: ["review"] },
  ],
  done: [
    { id: "t10", title: "Setup Next.js project",           priority: "LOW",    assignee: "MS", comments: 3, attachments: 0, dueDate: "2025-04-01", labels: ["setup"]  },
    { id: "t11", title: "Configure Prisma + PostgreSQL",   priority: "MEDIUM", assignee: "SJ", comments: 2, attachments: 1, dueDate: "2025-04-02", labels: ["backend"] },
  ],
}

const LABEL_COLORS: Record<string, string> = {
  bug:     "bg-red-500/15 text-red-400",
  feature: "bg-violet-500/15 text-violet-400",
  design:  "bg-pink-500/15 text-pink-400",
  docs:    "bg-blue-500/15 text-blue-400",
  backend: "bg-orange-500/15 text-orange-400",
  ui:      "bg-cyan-500/15 text-cyan-400",
  devops:  "bg-yellow-500/15 text-yellow-400",
  setup:   "bg-green-500/15 text-green-400",
  review:  "bg-purple-500/15 text-purple-400",
}

export default function KanbanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tasks,      setTasks]      = useState(MOCK_TASKS)
  const [search,     setSearch]     = useState("")
  const [showModal,  setShowModal]  = useState(false)
  const [targetCol,  setTargetCol]  = useState("todo")
  const [loading,    setLoading]    = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [form,       setForm]       = useState({
    title: "", priority: "MEDIUM", dueDate: "", assignee: ""
  })

  // Filter tasks
  const filteredTasks = Object.fromEntries(
    Object.entries(tasks).map(([col, colTasks]) => [
      col,
      colTasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
      )
    ])
  )

  
  async function handleAddTask() {
    if (!form.title.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    const newTask = {
      id:          `t${Date.now()}`,
      title:       form.title,
      priority:    form.priority,
      assignee:    form.assignee || null,
      comments:    0,
      attachments: 0,
      dueDate:     form.dueDate || null,
      labels:      [],
    }

    setTasks(prev => ({
      ...prev,
      [targetCol]: [newTask, ...prev[targetCol]]
    }))

    toast.success("Task created! ✅")
    setShowModal(false)
    setForm({ title: "", priority: "MEDIUM", dueDate: "", assignee: "" })
    setLoading(false)
  }

  function moveTask(taskId: string, fromCol: string, toCol: string) {
    const task = tasks[fromCol].find(t => t.id === taskId)
    if (!task) return
    setTasks(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
      [toCol]:   [task, ...prev[toCol]],
    }))
    toast.success(`Moved to ${COLUMNS.find(c => c.id === toCol)?.label}`)
  }

  const totalTasks = Object.values(tasks).flat().length
  const doneTasks  = tasks.done.length
  const pct        = Math.round((doneTasks / totalTasks) * 100)

  return (
    <DashboardLayout>
      {/* Project Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "rgba(139,92,246,0.15)" }}>
            ⚡
          </div>
          <div>
            <h2 className="text-xl font-black text-white">DevBoard</h2>
            <div className="flex items-center gap-3 text-xs text-[#7c7ca8] mt-0.5">
              <span>{totalTasks} tasks</span>
              <span>·</span>
              <span className="text-violet-400 font-semibold">{pct}% done</span>
              <span>·</span>
              <span>8 members</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..." className="input pl-9 w-48" />
          </div>
          <button onClick={() => { setShowModal(true); setTargetCol("todo") }}
            className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks[col.id] || []
          return (
            <div key={col.id} className="kanban-col shrink-0 w-72">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-semibold text-white">{col.label}</span>
                  <span className="text-xs text-[#7c7ca8] bg-white/5 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => { setShowModal(true); setTargetCol(col.id) }}
                  className="btn-ghost p-1 text-[#7c7ca8] hover:text-violet-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {colTasks.map((task, i) => {
                  const pc = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedTask(task)}
                      className="task-card group"
                    >
                      {/* Priority + Labels */}
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={cn("badge text-[10px] border", pc.bg, pc.color, pc.border)}>
                          {pc.label}
                        </span>
                        {task.labels.slice(0, 2).map((label: string) => (
                          <span key={label} className={cn("badge text-[10px]", LABEL_COLORS[label] || "bg-white/10 text-white/60")}>
                            {label}
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
                          {task.comments > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <MessageSquare className="w-3 h-3" />
                              {task.comments}
                            </div>
                          )}
                          {task.attachments > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <Paperclip className="w-3 h-3" />
                              {task.attachments}
                            </div>
                          )}
                          {task.dueDate && (
                            <div className={cn(
                              "flex items-center gap-1 text-xs",
                              new Date(task.dueDate) < new Date() ? "text-red-400" : "text-[#7c7ca8]"
                            )}>
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                        {task.assignee && (
                          <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-cyan-600
                            rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                            {task.assignee}
                          </div>
                        )}
                      </div>

                      {/* Move buttons */}
                      {col.id !== "done" && (
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {COLUMNS.filter(c => c.id !== col.id && c.id !== "backlog").slice(0, 3).map(c => (
                            <button
                              key={c.id}
                              onClick={e => { e.stopPropagation(); moveTask(task.id, col.id, c.id) }}
                              className="text-[10px] px-2 py-1 rounded-lg transition-all"
                              style={{ background: `${c.color}20`, color: c.color }}>
                              → {c.label.split(" ")[1]}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                {/* Add task placeholder */}
                <button
                  onClick={() => { setShowModal(true); setTargetCol(col.id) }}
                  className="w-full py-2.5 rounded-xl text-xs text-[#7c7ca8]
                    border border-dashed border-white/10
                    hover:border-violet-500/30 hover:text-violet-400
                    transition-all flex items-center justify-center gap-1.5"
                >
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
                  <span className="text-xs text-[#7c7ca8]">In:</span>
                  <select value={targetCol} onChange={e => setTargetCol(e.target.value)}
                    className="input py-1 px-2 text-xs w-auto">
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Task Title *
                  </label>
                  <input type="text" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="What needs to be done?" className="input"
                    onKeyDown={e => e.key === "Enter" && handleAddTask()} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value })}
                      className="input">
                      {["URGENT","HIGH","MEDIUM","LOW"].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input type="date" value={form.dueDate}
                      onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="input" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Assignee Initials
                  </label>
                  <input type="text" value={form.assignee} maxLength={2}
                    onChange={e => setForm({ ...form, assignee: e.target.value.toUpperCase() })}
                    placeholder="MS" className="input" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button onClick={handleAddTask}
                  disabled={!form.title.trim() || loading}
                  className="flex-1 btn-primary">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Zap className="w-4 h-4" />Create Task</>
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setSelectedTask(null)}>
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
                      const pc = PRIORITY_CONFIG[selectedTask.priority as keyof typeof PRIORITY_CONFIG]
                      return (
                        <span className={cn("badge text-xs border", pc.bg, pc.color, pc.border)}>
                          {pc.label}
                        </span>
                      )
                    })()}
                    {selectedTask.labels.map((label: string) => (
                      <span key={label} className={cn("badge text-xs", LABEL_COLORS[label] || "bg-white/10 text-white/60")}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-black text-white">{selectedTask.title}</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} className="btn-ghost p-1.5 ml-3">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Assignee", value: selectedTask.assignee || "Unassigned" },
                  { label: "Due Date", value: selectedTask.dueDate ? formatDate(selectedTask.dueDate) : "No date" },
                  { label: "Comments", value: selectedTask.comments },
                  { label: "Files",    value: selectedTask.attachments },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] text-[#7c7ca8] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Move to column */}
              <div>
                <p className="text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                  Move to Column
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map(c => (
                    <button key={c.id}
                      onClick={() => {
                        const fromCol = Object.entries(tasks).find(([, ts]) =>
                          ts.some(t => t.id === selectedTask.id)
                        )?.[0]
                        if (fromCol && fromCol !== c.id) {
                          moveTask(selectedTask.id, fromCol, c.id)
                          setSelectedTask(null)
                        }
                      }}
                      className="text-xs px-3 py-2 rounded-xl transition-all font-medium"
                      style={{ background: `${c.color}20`, color: c.color }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}