"use client"

import { useState }  from "react"
import { motion }    from "framer-motion"
import {
  CheckCircle, Circle, Clock, AlertCircle,
  Search, Filter, Calendar, Tag
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn, PRIORITY_CONFIG, STATUS_CONFIG, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

const MY_TASKS = [
  { id: "1", title: "Fix authentication bug in Next.js",    priority: "URGENT", status: "IN_PROGRESS", dueDate: "2025-04-06", project: "DevBoard",    done: false },
  { id: "2", title: "Design new onboarding flow",           priority: "HIGH",   status: "TODO",        dueDate: "2025-04-08", project: "Alpha App",   done: false },
  { id: "3", title: "Write unit tests for auth service",    priority: "MEDIUM", status: "TODO",        dueDate: "2025-04-10", project: "DevBoard",    done: false },
  { id: "4", title: "Code review — PR #42",                 priority: "HIGH",   status: "IN_REVIEW",   dueDate: "2025-04-05", project: "API Gateway", done: false },
  { id: "5", title: "Update API documentation",             priority: "LOW",    status: "BACKLOG",     dueDate: "2025-04-15", project: "DevBoard",    done: false },
  { id: "6", title: "Setup CI/CD pipeline",                 priority: "MEDIUM", status: "DONE",        dueDate: "2025-04-01", project: "DevBoard",    done: true  },
  { id: "7", title: "Configure Prisma schema",              priority: "HIGH",   status: "DONE",        dueDate: "2025-04-02", project: "DevBoard",    done: true  },
]

export default function MyTasksPage() {
  const [tasks,  setTasks]  = useState(MY_TASKS)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "all"         ? true :
      filter === "today"       ? t.dueDate === new Date().toISOString().split("T")[0] :
      filter === "upcoming"    ? !t.done && t.dueDate > new Date().toISOString().split("T")[0] :
      filter === "overdue"     ? !t.done && t.dueDate < new Date().toISOString().split("T")[0] :
      filter === "completed"   ? t.done :
      true
    return matchSearch && matchFilter
  })

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    const task = tasks.find(t => t.id === id)
    toast.success(task?.done ? "Task reopened" : "Task completed! ✅")
  }

  const counts = {
    all:       tasks.length,
    today:     tasks.filter(t => t.dueDate === new Date().toISOString().split("T")[0]).length,
    upcoming:  tasks.filter(t => !t.done && t.dueDate > new Date().toISOString().split("T")[0]).length,
    overdue:   tasks.filter(t => !t.done && t.dueDate < new Date().toISOString().split("T")[0]).length,
    completed: tasks.filter(t => t.done).length,
  }

  return (
    <DashboardLayout>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",     value: counts.all,       color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
          { label: "Overdue",   value: counts.overdue,   color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
          { label: "Upcoming",  value: counts.upcoming,  color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20"   },
          { label: "Completed", value: counts.completed, color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn("card-glass p-4 border", s.border)}>
            <p className={cn("text-2xl font-black mb-0.5", s.color)}>{s.value}</p>
            <p className="text-xs text-[#7c7ca8]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..." className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all",       label: "All"       },
            { key: "today",     label: "Today"     },
            { key: "upcoming",  label: "Upcoming"  },
            { key: "overdue",   label: "Overdue"   },
            { key: "completed", label: "Done"      },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn("px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
                filter === f.key
                  ? "border-violet-500 bg-violet-500/15 text-violet-400"
                  : "border-white/10 text-[#7c7ca8] hover:border-violet-500/30"
              )}>
              {f.label}
              {counts[f.key as keyof typeof counts] > 0 && (
                <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]",
                  filter === f.key ? "bg-violet-500 text-white" : "bg-white/10"
                )}>
                  {counts[f.key as keyof typeof counts]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="card-glass overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle className="w-12 h-12 text-[#7c7ca8] opacity-20 mx-auto mb-3" />
            <p className="text-[#7c7ca8]">No tasks found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(139,92,246,0.08)" }}>
            {filtered.map((task, i) => {
              const pc = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
              const sc = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
              const isOverdue = !task.done && task.dueDate < new Date().toISOString().split("T")[0]

              return (
                <motion.div key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors",
                    task.done && "opacity-60"
                  )}
                >
                  <button onClick={() => toggleTask(task.id)}
                    className="shrink-0 transition-all hover:scale-110">
                    {task.done
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : <Circle      className="w-5 h-5 text-[#7c7ca8]" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold text-white",
                      task.done && "line-through text-[#7c7ca8]"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-xs text-[#7c7ca8] mt-0.5">{task.project}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={cn("badge text-xs border", pc.bg, pc.color, pc.border)}>
                      {pc.label}
                    </span>
                    <span className={cn("badge text-xs", sc.bg, sc.color)}>
                      {sc.label}
                    </span>
                    {task.dueDate && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        isOverdue ? "text-red-400" : "text-[#7c7ca8]"
                      )}>
                        {isOverdue
                          ? <AlertCircle className="w-3.5 h-3.5" />
                          : <Calendar    className="w-3.5 h-3.5" />
                        }
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}