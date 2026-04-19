"use client"

import { useState }        from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Check, Loader2, Zap,
  Calendar, Mail, User
} from "lucide-react"
import { useUIStore } from "@/store/uiStore"
import { cn }         from "@/lib/utils"
import toast          from "react-hot-toast"

const PRIORITIES = [
  { value: "URGENT", label: "🔴 Urgent", color: "border-red-500 bg-red-500/10 text-red-400"         },
  { value: "HIGH",   label: "🟠 High",   color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { value: "MEDIUM", label: "🟡 Medium", color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { value: "LOW",    label: "🟢 Low",    color: "border-green-500 bg-green-500/10 text-green-400"    },
]

const PROJECTS = [
  { id: "1", name: "DevBoard",      color: "#8b5cf6" },
  { id: "2", name: "Alpha App",     color: "#06b6d4" },
  { id: "3", name: "API Gateway",   color: "#22c55e" },
  { id: "4", name: "Design System", color: "#f59e0b" },
]

interface FormState {
  title:         string
  description:   string
  priority:      string
  projectId:     string
  dueDate:       string
  assigneeName:  string
  assigneeEmail: string
}

const INITIAL_FORM: FormState = {
  title:         "",
  description:   "",
  priority:      "MEDIUM",
  projectId:     "1",
  dueDate:       "",
  assigneeName:  "",
  assigneeEmail: "",
}

export default function NewTaskModal() {
  const { showNewTaskModal, closeNewTaskModal } = useUIStore()
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM)

  function update(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

async function handleCreate() {
  if (!form.title.trim()) {
    toast.error("Task title is required")
    return
  }

  setLoading(true)
  try {
    if (form.assigneeEmail) {
      const project = PROJECTS.find(p => p.id === form.projectId)

      const res  = await fetch("/api/tasks/assign", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle:     form.title,
          assigneeEmail: form.assigneeEmail,
          assigneeName:  form.assigneeName || "Teammate",
          priority:      form.priority,
          dueDate:       form.dueDate || null,
          projectName:   project?.name || "DevBoard",
        }),
      })

      const data = await res.json()

      if (data.emailSent) {
        toast.success(`Task created & email sent to ${form.assigneeEmail}! 📧`)
      } else {
        // Email skipped but task still created
        toast.success("Task created! ✅")
        console.log("Email note:", data.message)
      }
    } else {
      toast.success("Task created! ✅")
    }

    setForm(INITIAL_FORM)
    closeNewTaskModal()

  } catch (err) {
    console.error(err)
    // مش بنوقف الـ task creation لو الإيميل فشل
    toast.success("Task created! ✅")
    closeNewTaskModal()
    setForm(INITIAL_FORM)
  } finally {
    setLoading(false)
  }
}

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeNewTaskModal()
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCreate()
  }

  return (
    <AnimatePresence>
      {showNewTaskModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && closeNewTaskModal()}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="card-glass w-full max-w-lg shadow-2xl overflow-hidden"
          >

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-500/15 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <h2 className="font-black text-white">New Task</h2>
                <span className="text-xs text-[#7c7ca8] border border-white/10
                  rounded px-1.5 py-0.5 hidden sm:block">
                  ⌘ + Enter to create
                </span>
              </div>
              <button onClick={closeNewTaskModal} className="btn-ghost p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Title */}
              <div>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => update("title", e.target.value)}
                  placeholder="What needs to be done? ✨"
                  className="input text-base font-semibold"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  value={form.description}
                  onChange={e => update("description", e.target.value)}
                  placeholder="Add description... (optional)"
                  rows={2}
                  className="input resize-none text-sm"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.value}
                      onClick={() => update("priority", p.value)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-semibold border transition-all",
                        form.priority === p.value
                          ? p.color
                          : "border-white/10 text-[#7c7ca8] hover:border-white/20"
                      )}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Project
                  </label>
                  <select
                    value={form.projectId}
                    onChange={e => update("projectId", e.target.value)}
                    className="input text-sm"
                  >
                    {PROJECTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={e => update("dueDate", e.target.value)}
                      className="input pl-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                  Assign To
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                    <input
                      type="text"
                      value={form.assigneeName}
                      onChange={e => update("assigneeName", e.target.value)}
                      placeholder="Ahmed Hassan"
                      className="input pl-9 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                    <input
                      type="email"
                      value={form.assigneeEmail}
                      onChange={e => update("assigneeEmail", e.target.value)}
                      placeholder="ahmed@company.com"
                      className="input pl-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <AnimatePresence>
                {form.assigneeEmail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl text-xs overflow-hidden"
                    style={{
                      background: "rgba(139,92,246,0.08)",
                      border:     "1px solid rgba(139,92,246,0.2)"
                    }}
                  >
                    <span>📧</span>
                    <span className="text-[#7c7ca8]">
                      Email notification will be sent to{" "}
                      <span className="text-violet-400 font-semibold">
                        {form.assigneeName || "teammate"}
                      </span>
                      {" "}at{" "}
                      <span className="text-cyan-400 font-semibold">
                        {form.assigneeEmail}
                      </span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task Preview */}
              <AnimatePresence>
                {form.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-3 rounded-xl text-xs"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border:     "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    <p className="text-[#7c7ca8] mb-1 font-semibold uppercase tracking-wider text-[10px]">
                      Preview
                    </p>
                    <p className="text-white font-semibold">{form.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {form.priority && (
                        <span className="text-[#7c7ca8]">⚡ {form.priority}</span>
                      )}
                      {form.dueDate && (
                        <span className="text-[#7c7ca8]">📅 {form.dueDate}</span>
                      )}
                      {form.assigneeName && (
                        <span className="text-[#7c7ca8]">👤 {form.assigneeName}</span>
                      )}
                      {PROJECTS.find(p => p.id === form.projectId) && (
                        <span className="text-[#7c7ca8]">
                          📁 {PROJECTS.find(p => p.id === form.projectId)?.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="flex gap-3 px-6 py-4"
              style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
              <button
                onClick={closeNewTaskModal}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim() || loading}
                className="flex-1 btn-primary"
              >
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
  )
}