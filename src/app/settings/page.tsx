"use client"

import { useState }  from "react"
import { motion }    from "framer-motion"
import {
  User, Bell, Shield, Palette,
  Save, Camera, Eye, EyeOff,
  Check, Loader2, Sun, Moon,
  Key, Trash2, LogOut
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useSession, signOut } from "next-auth/react"
import { useTheme }    from "next-themes"
import { getInitials, cn } from "@/lib/utils"
import toast from "react-hot-toast"

const TABS = [
  { id: "profile",    label: "Profile",    icon: User    },
  { id: "security",   label: "Security",   icon: Shield  },
  { id: "notifs",     label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "danger",     label: "Danger Zone", icon: Trash2 },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [showPass,  setShowPass]  = useState(false)

  const [profile, setProfile] = useState({
    name:     session?.user?.name || "",
    email:    session?.user?.email || "",
    bio:      "",
    timezone: "UTC",
    jobTitle: "",
  })

  const [notifs, setNotifs] = useState({
    taskAssigned:  true,
    taskDue:       true,
    commentAdded:  true,
    memberJoined:  false,
    weeklyDigest:  true,
  })

  async function handleSave() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaved(true)
    setLoading(false)
    toast.success("Settings saved!")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-5">

          {/* Tabs */}
          <div className="w-full md:w-52 shrink-0">
            <div className="card-glass p-2 space-y-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-violet-600/80 text-white shadow-lg shadow-violet-500/20"
                      : "text-[#7c7ca8] hover:bg-white/5 hover:text-white",
                    tab.id === "danger" && activeTab !== "danger" && "text-red-400/70 hover:text-red-400"
                  )}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Profile */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-5">Profile Settings</h2>

                <div className="flex items-center gap-4 mb-6 pb-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-cyan-600
                      rounded-2xl flex items-center justify-center text-xl font-black text-white">
                      {getInitials(session?.user?.name)}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-violet-600
                      rounded-lg flex items-center justify-center hover:bg-violet-500 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="font-bold text-white">{session?.user?.name}</p>
                    <p className="text-sm text-[#7c7ca8]">{session?.user?.email}</p>
                    <span className="badge bg-violet-500/15 text-violet-400 text-xs mt-1">
                      Free Plan
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "name",     label: "Full Name",  type: "text"  },
                    { key: "email",    label: "Email",      type: "email" },
                    { key: "jobTitle", label: "Job Title",  type: "text"  },
                    { key: "timezone", label: "Timezone",   type: "text"  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                        {f.label}
                      </label>
                      <input type={f.type} value={(profile as any)[f.key]}
                        onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                        className="input" />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                      Bio
                    </label>
                    <textarea rows={3} value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell your team about yourself..."
                      className="input resize-none" />
                  </div>
                </div>

                <button onClick={handleSave} disabled={loading}
                  className={cn("btn-primary mt-5", saved && "bg-green-600 hover:bg-green-500")}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   saved   ? <><Check className="w-4 h-4" />Saved!</> :
                             <><Save  className="w-4 h-4" />Save Changes</>}
                </button>
              </motion.div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-5">Security</h2>

                <div className="space-y-4 mb-6">
                  {["Current Password","New Password","Confirm Password"].map(label => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                        {label}
                      </label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"}
                          placeholder="••••••••" className="input pr-10" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2FA */}
                <div className="p-4 rounded-xl mb-5"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-[#7c7ca8] mt-0.5">Secure your account with 2FA</p>
                    </div>
                    <button className="btn-primary text-sm">Enable 2FA</button>
                  </div>
                </div>

                <button onClick={handleSave} disabled={loading}
                  className={cn("btn-primary", saved && "bg-green-600 hover:bg-green-500")}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   saved   ? <><Check className="w-4 h-4" />Saved!</> :
                             <><Save  className="w-4 h-4" />Update Password</>}
                </button>
              </motion.div>
            )}

            {/* Notifications */}
            {activeTab === "notifs" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-5">Notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: "taskAssigned", label: "Task Assigned",   desc: "When someone assigns a task to you"      },
                    { key: "taskDue",      label: "Task Due Soon",   desc: "2 days before your task deadline"         },
                    { key: "commentAdded", label: "New Comment",     desc: "When someone comments on your task"       },
                    { key: "memberJoined", label: "Member Joined",   desc: "When a new member joins your workspace"   },
                    { key: "weeklyDigest", label: "Weekly Digest",   desc: "Summary of your week every Monday"        },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-[#7c7ca8] mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                        className={cn("w-11 h-6 rounded-full transition-all relative shrink-0",
                          (notifs as any)[item.key] ? "bg-violet-600" : "bg-white/10")}>
                        <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                          (notifs as any)[item.key] ? "left-6" : "left-1")} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-5">Appearance</h2>
                <p className="text-sm font-semibold text-white mb-3">Theme</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: "Dark",  icon: Moon, value: "dark"  },
                    { label: "Light", icon: Sun,  value: "light" },
                  ].map(t => (
                    <button key={t.label} onClick={() => setTheme(t.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        theme === t.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-white/10 hover:border-violet-500/30"
                      )}>
                      <t.icon className={cn("w-5 h-5",
                        theme === t.value ? "text-violet-400" : "text-[#7c7ca8]")} />
                      <span className={cn("text-sm font-semibold",
                        theme === t.value ? "text-violet-400" : "text-[#7c7ca8]")}>
                        {t.label} Mode
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm font-semibold text-white mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {["#8b5cf6","#06b6d4","#22c55e","#f59e0b","#ef4444","#ec4899"].map(color => (
                    <button key={color}
                      className="w-8 h-8 rounded-xl hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-white/20"
                      style={{ background: color }}
                      onClick={() => toast.success("Color updated!")} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Danger Zone */}
            {activeTab === "danger" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6 border-red-500/20">
                <h2 className="font-black text-lg text-red-400 mb-5">⚠️ Danger Zone</h2>

                <div className="space-y-4">
                  {[
                    {
                      title: "Sign out all devices",
                      desc:  "Sign out from all sessions except this one",
                      btn:   "Sign Out All",
                      color: "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25",
                      action: () => { toast.success("Signed out all devices"); signOut() }
                    },
                    {
                      title: "Delete Account",
                      desc:  "Permanently delete your account and all data. This cannot be undone.",
                      btn:   "Delete Account",
                      color: "bg-red-500/15 text-red-400 hover:bg-red-500/25",
                      action: () => toast.error("Are you sure? This action is irreversible.")
                    },
                  ].map(item => (
                    <div key={item.title} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div>
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-xs text-[#7c7ca8] mt-0.5">{item.desc}</p>
                      </div>
                      <button onClick={item.action}
                        className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all ml-4 shrink-0", item.color)}>
                        {item.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}