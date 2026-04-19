"use client"

import { motion }      from "framer-motion"
import {
  CheckCircle, Clock, AlertCircle, TrendingUp,
  Zap, Users, FolderOpen, ArrowRight,
  Plus, Star, Activity
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"
import Link            from "next/link"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useSession }  from "next-auth/react"
import { formatRelativeTime, PRIORITY_CONFIG, STATUS_CONFIG, cn } from "@/lib/utils"

const WEEKLY = [
  { day: "Mon", done: 4, created: 6 },
  { day: "Tue", done: 7, created: 5 },
  { day: "Wed", done: 3, created: 8 },
  { day: "Thu", done: 9, created: 4 },
  { day: "Fri", done: 6, created: 7 },
  { day: "Sat", done: 2, created: 3 },
  { day: "Sun", done: 5, created: 4 },
]

const ACTIVITY_DATA = [
  { month: "Jan", tasks: 42 },
  { month: "Feb", tasks: 58 },
  { month: "Mar", tasks: 75 },
  { month: "Apr", tasks: 63 },
  { month: "May", tasks: 89 },
  { month: "Jun", tasks: 95 },
]

const MY_TASKS = [
  { id: "1", title: "Fix authentication bug in Next.js",      priority: "URGENT", status: "IN_PROGRESS", dueDate: "2025-04-06", project: "DevBoard" },
  { id: "2", title: "Design new onboarding flow",             priority: "HIGH",   status: "TODO",        dueDate: "2025-04-08", project: "Alpha App" },
  { id: "3", title: "Write unit tests for auth service",      priority: "MEDIUM", status: "TODO",        dueDate: "2025-04-10", project: "DevBoard" },
  { id: "4", title: "Code review — PR #42",                   priority: "HIGH",   status: "IN_REVIEW",   dueDate: "2025-04-05", project: "API Gateway" },
  { id: "5", title: "Update API documentation",               priority: "LOW",    status: "BACKLOG",     dueDate: "2025-04-15", project: "DevBoard" },
]

const RECENT_ACTIVITY = [
  { icon: CheckCircle, text: "Ahmed completed 'Setup CI/CD pipeline'",         time: "2m ago",  color: "text-green-400"  },
  { icon: Plus,        text: "Sara created 'Mobile app redesign' task",         time: "15m ago", color: "text-violet-400" },
  { icon: Users,       text: "Omar joined the Alpha project",                   time: "1h ago",  color: "text-cyan-400"   },
  { icon: AlertCircle, text: "'Fix login bug' is overdue by 2 days",           time: "2h ago",  color: "text-red-400"    },
  { icon: Star,        text: "Milestone reached: 100 tasks completed this month",time: "3h ago", color: "text-yellow-400" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass p-3 shadow-2xl text-sm">
      <p className="text-[#7c7ca8] text-xs mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout>

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <h2 className="text-2xl font-black text-white">
          Good morning, {session?.user?.name?.split(" ")[0] || "Developer"}! 👋
        </h2>
        <p className="text-[#7c7ca8] text-sm mt-1">
          You have <span className="text-violet-400 font-semibold">3 urgent tasks</span> due today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tasks Done",    value: "24",  sub: "this week", icon: CheckCircle, color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  change: "+12%"  },
          { label: "In Progress",   value: "8",   sub: "active",    icon: Activity,    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", change: "+3"    },
          { label: "Due Today",     value: "3",   sub: "urgent",    icon: AlertCircle, color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    change: "urgent" },
          { label: "Team Members",  value: "12",  sub: "active",    icon: Users,       color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   change: "+2"    },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className={cn("card-glass p-5 hover:shadow-lg transition-all border", s.border)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
              <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg", s.bg, s.color)}>
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-black text-white mb-0.5">{s.value}</p>
            <p className="text-xs text-[#7c7ca8]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Weekly Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="card-glass p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white">Weekly Activity</h3>
              <p className="text-xs text-[#7c7ca8] mt-0.5">Tasks created vs completed</p>
            </div>
            <span className="badge bg-green-500/15 text-green-400 border border-green-500/20">
              +18% this week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#7c7ca8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7c7ca8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="done"    name="Completed" fill="#8b5cf6" radius={[4,4,0,0]} barSize={14} />
              <Bar dataKey="created" name="Created"   fill="rgba(6,182,212,0.4)" radius={[4,4,0,0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="card-glass p-5">
          <h3 className="font-bold text-white mb-1">Monthly Tasks</h3>
          <p className="text-xs text-[#7c7ca8] mb-5">6-month trend</p>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={ACTIVITY_DATA}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#7c7ca8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7c7ca8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tasks" name="Tasks" stroke="#8b5cf6" strokeWidth={2.5}
                fill="url(#taskGrad)" dot={false} activeDot={{ r: 5, fill: "#8b5cf6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* My Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }} className="card-glass overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-5"
            style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <h3 className="font-bold text-white">My Tasks</h3>
            <Link href="/my-tasks"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(139,92,246,0.08)" }}>
            {MY_TASKS.map((task, i) => {
              const pc = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
              const sc = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
              return (
                <motion.div key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3.5
                    hover:bg-white/3 transition-colors cursor-pointer"
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", pc.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{task.title}</p>
                    <p className="text-xs text-[#7c7ca8] mt-0.5">{task.project}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("badge text-xs border", pc.bg, pc.color, pc.border)}>
                      {pc.label}
                    </span>
                    <span className={cn("badge text-xs", sc.bg, sc.color)}>
                      {sc.label}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }} className="card-glass overflow-hidden">
          <div className="p-5" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <h3 className="font-bold text-white">Activity</h3>
          </div>
          <div className="p-4 space-y-4">
            {RECENT_ACTIVITY.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <item.icon className={cn("w-4 h-4", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#c0c0e0] leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-[#7c7ca8] mt-1">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}