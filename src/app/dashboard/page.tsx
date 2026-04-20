"use client"

import { useEffect, useState } from "react"
import { motion }      from "framer-motion"
import {
  CheckCircle, Clock, AlertCircle,
  ArrowRight, Plus, Activity, Users
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"
import Link            from "next/link"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useSession }  from "next-auth/react"
import {
  cn, PRIORITY_CONFIG, STATUS_CONFIG,
  formatRelativeTime, formatDate
} from "@/lib/utils"

const WEEKLY = [
  { day: "Mon", done: 4, created: 6 },
  { day: "Tue", done: 7, created: 5 },
  { day: "Wed", done: 3, created: 8 },
  { day: "Thu", done: 9, created: 4 },
  { day: "Fri", done: 6, created: 7 },
  { day: "Sat", done: 2, created: 3 },
  { day: "Sun", done: 5, created: 4 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass p-3 text-sm shadow-2xl">
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
  const [data,    setData]    = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load(){
      try {
        const  res = await fetch("/api/dashboard/stats")
        const data = await res.json()
       if(data.data) setData(data.data)
      } catch (error) {
        console.log(error)
      }finally{
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = data?.stats || { totalTasks: 0, inProgressTasks: 0, dueTodayTasks: 0, completedTasks: 0 }
  const myTasks      = data?.myTasks      || []
  const recentActivity = data?.recentActivity || []

  return (
    <DashboardLayout>

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-2xl font-black text-white">
          Good morning, {session?.user?.name?.split(" ")[0] || "Developer"}! 👋
        </h2>
        <p className="text-[#7c7ca8] text-sm mt-1">
          {stats.dueTodayTasks > 0
            ? <>You have <span className="text-violet-400 font-semibold">{stats.dueTodayTasks} tasks</span> due today.</>
            : "You're all caught up! Great work 🎉"
          }
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tasks Done",   value: stats.completedTasks,  icon: CheckCircle, color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
          { label: "In Progress",  value: stats.inProgressTasks, icon: Activity,    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
          { label: "Due Today",    value: stats.dueTodayTasks,   icon: AlertCircle, color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
          { label: "Total Assigned",value: stats.totalTasks,     icon: Users,       color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20"   },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className={cn("card-glass p-5 hover:shadow-lg transition-all border", s.border)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
            </div>
            {loading
              ? <div className="h-8 shimmer-bg rounded-lg mb-1" />
              : <p className="text-2xl font-black text-white mb-0.5">{s.value}</p>
            }
            <p className="text-xs text-[#7c7ca8]">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="card-glass p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white">Weekly Activity</h3>
              <p className="text-xs text-[#7c7ca8] mt-0.5">Tasks created vs completed</p>
            </div>
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

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="card-glass p-5">
          <h3 className="font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "View All Projects", href: "/projects",  icon: "📁" },
              { label: "My Tasks",          href: "/my-tasks",  icon: "✅" },
              { label: "Team Members",      href: "/team",      icon: "👥" },
              { label: "Settings",          href: "/settings",  icon: "⚙️" },
            ].map(item => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl
                  hover:bg-white/5 transition-all cursor-pointer group">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-[#7c7ca8]
                    group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-[#7c7ca8]
                    opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            ))}
          </div>
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

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 shimmer-bg rounded-xl" />
              ))}
            </div>
          ) : myTasks.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-12 h-12 text-[#7c7ca8] opacity-20 mx-auto mb-3" />
              <p className="text-[#7c7ca8] text-sm">No tasks assigned to you</p>
              <p className="text-[#7c7ca8] text-xs mt-1">Create a task and assign it to yourself!</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(139,92,246,0.08)" }}>
              {myTasks.slice(0, 5).map((task: any, i: number) => {
                const pc = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
                const sc = STATUS_CONFIG[task.status   as keyof typeof STATUS_CONFIG]
                return (
                  <motion.div key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", pc.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{task.title}</p>
                      <p className="text-xs text-[#7c7ca8] mt-0.5">{task.project?.name}</p>
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
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }} className="card-glass overflow-hidden">
          <div className="p-5" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <h3 className="font-bold text-white">Activity</h3>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 shimmer-bg rounded-xl" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="w-10 h-10 text-[#7c7ca8] opacity-20 mx-auto mb-2" />
              <p className="text-sm text-[#7c7ca8]">No activity yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {recentActivity.slice(0, 5).map((item: any, i: number) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                    <span className="text-sm">
                      {item.type === "TASK_CREATED"   ? "📋" :
                       item.type === "TASK_COMPLETED"  ? "✅" :
                       item.type === "COMMENT_ADDED"   ? "💬" :
                       item.type === "MEMBER_ADDED"    ? "👥" : "⚡"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#c0c0e0] leading-relaxed">
                      <span className="text-violet-400 font-semibold">
                        {item.user?.name || "Someone"}
                      </span>
                      {" "}{item.description}
                    </p>
                    <p className="text-[10px] text-[#7c7ca8] mt-1">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}