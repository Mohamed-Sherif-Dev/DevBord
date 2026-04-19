"use client"

import { useState }  from "react"
import { motion }    from "framer-motion"
import {
  Users, Mail, Shield, Crown, Search,
  UserPlus, MoreVertical, Check, X,
  Loader2, Activity
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { cn, getInitials, formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

const ROLE_CONFIG = {
  OWNER:  { label: "Owner",  color: "text-yellow-400",  bg: "bg-yellow-500/10",  icon: Crown  },
  ADMIN:  { label: "Admin",  color: "text-violet-400",  bg: "bg-violet-500/10",  icon: Shield },
  MEMBER: { label: "Member", color: "text-cyan-400",    bg: "bg-cyan-500/10",    icon: Users  },
  VIEWER: { label: "Viewer", color: "text-gray-400",    bg: "bg-gray-500/10",    icon: Users  },
}

const MEMBERS = [
  { id: "1", name: "Mohammed Sherif", email: "admin@devboard.com", role: "OWNER",  status: "ACTIVE",  tasks: 12, avatar: null, joinedAt: "2025-01-01", lastSeen: "Now" },
  { id: "2", name: "Ahmed Hassan",    email: "ahmed@devboard.com", role: "ADMIN",  status: "ACTIVE",  tasks: 8,  avatar: null, joinedAt: "2025-01-15", lastSeen: "2h ago" },
  { id: "3", name: "Sara Johnson",    email: "sara@devboard.com",  role: "MEMBER", status: "ACTIVE",  tasks: 15, avatar: null, joinedAt: "2025-02-01", lastSeen: "1d ago" },
  { id: "4", name: "Omar Khaled",     email: "omar@devboard.com",  role: "MEMBER", status: "ACTIVE",  tasks: 6,  avatar: null, joinedAt: "2025-02-15", lastSeen: "3h ago" },
  { id: "5", name: "Fatima Ali",      email: "fatima@devboard.com",role: "VIEWER", status: "INVITED", tasks: 0,  avatar: null, joinedAt: "2025-04-01", lastSeen: "Pending" },
]

const AVATAR_GRADIENTS = [
  "from-violet-600 to-cyan-600",
  "from-pink-600 to-orange-600",
  "from-green-600 to-cyan-600",
  "from-blue-600 to-violet-600",
  "from-orange-600 to-red-600",
]

export default function TeamPage() {
  const [members,    setMembers]    = useState(MEMBERS)
  const [search,     setSearch]     = useState("")
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail,setInviteEmail]= useState("")
  const [inviteRole, setInviteRole] = useState("MEMBER")
  const [loading,    setLoading]    = useState(false)

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleInvite() {
    if (!inviteEmail) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success(`Invitation sent to ${inviteEmail}! 📧`)
    setInviteEmail("")
    setShowInvite(false)
    setLoading(false)
  }

  return (
    <DashboardLayout>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Members", value: members.length,                                          color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
          { label: "Active",        value: members.filter(m => m.status === "ACTIVE").length,       color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
          { label: "Pending",       value: members.filter(m => m.status === "INVITED").length,      color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
          { label: "Total Tasks",   value: members.reduce((s, m) => s + m.tasks, 0),               color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20"   },
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

      {/* Header */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search members..." className="input pl-10" />
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card-glass p-5 mb-5"
          style={{ borderColor: "rgba(139,92,246,0.3)" }}
        >
          <h3 className="font-bold text-white mb-4">Invite Team Member</h3>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
              <input type="email" value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="input pl-10"
                onKeyDown={e => e.key === "Enter" && handleInvite()} />
            </div>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              className="input w-auto">
              {["MEMBER","ADMIN","VIEWER"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button onClick={handleInvite} disabled={!inviteEmail || loading}
              className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />Send</>}
            </button>
            <button onClick={() => setShowInvite(false)} className="btn-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((member, i) => {
          const rc = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG]
          return (
            <motion.div key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-glass p-5 hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br text-white font-bold text-sm",
                    AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                  )}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{member.name}</p>
                    <p className="text-xs text-[#7c7ca8]">{member.email}</p>
                  </div>
                </div>
                <button className="btn-ghost p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={cn("badge text-xs", rc.bg, rc.color)}>
                  <rc.icon className="w-3 h-3" />
                  {rc.label}
                </span>
                <span className={cn(
                  "badge text-xs",
                  member.status === "ACTIVE"
                    ? "bg-green-500/15 text-green-400"
                    : "bg-yellow-500/15 text-yellow-400"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full",
                    member.status === "ACTIVE" ? "bg-green-400" : "bg-yellow-400")} />
                  {member.status === "ACTIVE" ? "Active" : "Invited"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-lg font-black text-violet-400">{member.tasks}</p>
                  <p className="text-[10px] text-[#7c7ca8]">Tasks</p>
                </div>
                <div className="p-2.5 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xs font-semibold text-white">{member.lastSeen}</p>
                  <p className="text-[10px] text-[#7c7ca8]">Last seen</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}