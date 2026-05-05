"use client"

import { useState, useEffect, useRef } from "react"
import { motion }                       from "framer-motion"
import {
  User, Bell, Shield, Palette,
  Save, Camera, Eye, EyeOff,
  Check, Loader2, Sun, Moon,
  Trash2, LogOut, Briefcase,
  FileText, Globe
} from "lucide-react"
import DashboardLayout         from "@/components/layout/DashboardLayout"
import { useSession, signOut } from "next-auth/react"
import { useTheme }            from "next-themes"
import { getInitials, cn }     from "@/lib/utils"
import toast                   from "react-hot-toast"

const TABS = [
  { id: "profile",    label: "Profile",       icon: User    },
  { id: "security",   label: "Security",      icon: Shield  },
  { id: "notifs",     label: "Notifications", icon: Bell    },
  { id: "appearance", label: "Appearance",    icon: Palette },
  { id: "danger",     label: "Danger Zone",   icon: Trash2  },
]

const TIMEZONES = [
  "UTC", "Africa/Cairo", "Asia/Dubai", "Asia/Riyadh",
  "Europe/London", "America/New_York", "America/Los_Angeles"
]

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { theme, setTheme }       = useTheme()
  const fileInputRef              = useRef<HTMLInputElement>(null)

  const [activeTab,   setActiveTab]   = useState("profile")
  const [loading,     setLoading]     = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Profile form
  const [profile, setProfile] = useState({
    name:     "",
    email:    "",
    bio:      "",
    jobTitle: "",
    timezone: "UTC",
  })

  // Password form
  const [passwords, setPasswords] = useState({
    current: "",
    new:     "",
    confirm: "",
  })

  // Notifications
  const [notifs, setNotifs] = useState({
    taskAssigned: true,
    taskDue:      true,
    commentAdded: true,
    memberJoined: false,
    weeklyDigest: true,
  })

  // Load profile
  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setProfile({
            name:     d.data.name     || "",
            email:    d.data.email    || "",
            bio:      d.data.bio      || "",
            jobTitle: d.data.jobTitle || "",
            timezone: d.data.timezone || "UTC",
          })
          if (d.data.image) setAvatarPreview(d.data.image)
        }
      })
  }, [])

  // ── Save Profile ──────────────────────────────
  async function handleSaveProfile() {
    setLoading(true)
    try {
      const res  = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(profile),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }

      // Update session
      await update({ name: profile.name })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      toast.success("Profile saved! ✅")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // ── Upload Avatar ─────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const res  = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body:   formData,
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }

      await update({ image: data.data.image })
      toast.success("Avatar updated! 🎉")
    } catch {
      toast.error("Failed to upload avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ── Change Password ───────────────────────────
  async function handleChangePassword() {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("All fields required")
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match")
      return
    }
    if (passwords.new.length < 8) {
      toast.error("Min 8 characters")
      return
    }

    setLoading(true)
    try {
      const res  = await fetch("/api/user/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          currentPassword: passwords.current,
          newPassword:     passwords.new,
          confirmPassword: passwords.confirm,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }

      toast.success("Password updated! 🔐")
      setPasswords({ current: "", new: "", confirm: "" })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const passwordChecks = [
    { label: "8+ characters", pass: passwords.new.length >= 8        },
    { label: "Uppercase",     pass: /[A-Z]/.test(passwords.new)      },
    { label: "Number",        pass: /[0-9]/.test(passwords.new)      },
    { label: "Special char",  pass: /[!@#$%^&*]/.test(passwords.new) },
  ]

  const passwordStrength = passwordChecks.filter(c => c.pass).length

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-5">

          {/* ── Tabs ── */}
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

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* ── Profile Tab ── */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-6">Profile Settings</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 pb-6 mb-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar"
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-600 to-cyan-600
                          flex items-center justify-center text-2xl font-black text-white">
                          {getInitials(session?.user?.name)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600
                        rounded-xl flex items-center justify-center
                        hover:bg-violet-500 transition-colors shadow-lg"
                    >
                      {uploadingAvatar
                        ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                        : <Camera  className="w-3.5 h-3.5 text-white" />
                      }
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <div>
                    <p className="font-bold text-white">{session?.user?.name}</p>
                    <p className="text-sm text-[#7c7ca8]">{session?.user?.email}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-violet-400 hover:text-violet-300
                        transition-colors mt-1.5 font-semibold">
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      <User className="w-3 h-3 inline mr-1" />
                      Full Name
                    </label>
                    <input type="text" value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="input" />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input type="email" value={profile.email}
                      disabled
                      className="input opacity-50 cursor-not-allowed" />
                    <p className="text-[10px] text-[#7c7ca8] mt-1">Email cannot be changed</p>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      <Briefcase className="w-3 h-3 inline mr-1" />
                      Job Title
                    </label>
                    <input type="text" value={profile.jobTitle}
                      onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                      className="input" />
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      <Globe className="w-3 h-3 inline mr-1" />
                      Timezone
                    </label>
                    <select value={profile.timezone}
                      onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                      className="input">
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      <FileText className="w-3 h-3 inline mr-1" />
                      Bio
                    </label>
                    <textarea rows={3} value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell your team about yourself..."
                      className="input resize-none" />
                    <p className="text-[10px] text-[#7c7ca8] mt-1 text-right">
                      {profile.bio.length}/200
                    </p>
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={loading}
                  className={cn("btn-primary mt-5",
                    saved && "bg-green-600 hover:bg-green-500")}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   saved   ? <><Check className="w-4 h-4" />Saved!</> :
                             <><Save  className="w-4 h-4" />Save Changes</>}
                </button>
              </motion.div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-6">Security</h2>

                <div className="space-y-4 mb-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={passwords.current}
                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        placeholder="Enter current password"
                        className="input pl-10 pr-10"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        placeholder="Enter new password"
                        className="input pl-10"
                      />
                    </div>

                    {/* Password Strength */}
                    {passwords.new && (
                      <div className="mt-2">
                        {/* Strength Bar */}
                        <div className="flex gap-1 mb-2">
                          {[1,2,3,4].map(i => (
                            <div key={i}
                              className={cn("h-1.5 flex-1 rounded-full transition-all",
                                i <= passwordStrength
                                  ? passwordStrength <= 1 ? "bg-red-500"
                                  : passwordStrength <= 2 ? "bg-yellow-500"
                                  : passwordStrength <= 3 ? "bg-blue-500"
                                  : "bg-green-500"
                                  : "bg-white/10"
                              )} />
                          ))}
                        </div>
                        {/* Checks */}
                        <div className="flex flex-wrap gap-2">
                          {passwordChecks.map(c => (
                            <div key={c.label}
                              className={cn("flex items-center gap-1 text-xs",
                                c.pass ? "text-green-400" : "text-[#7c7ca8]")}>
                              <Check className="w-3 h-3" />
                              {c.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8]
                      uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        placeholder="Repeat new password"
                        className={cn("input pl-10",
                          passwords.confirm && passwords.confirm !== passwords.new
                            ? "border-red-500/50"
                            : passwords.confirm && passwords.confirm === passwords.new
                            ? "border-green-500/50"
                            : ""
                        )}
                        onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                      />
                      {passwords.confirm && passwords.confirm === passwords.new && (
                        <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                      )}
                    </div>
                    {passwords.confirm && passwords.confirm !== passwords.new && (
                      <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                    )}
                  </div>
                </div>

                <button onClick={handleChangePassword}
                  disabled={
                    !passwords.current ||
                    !passwords.new     ||
                    passwords.new !== passwords.confirm ||
                    loading
                  }
                  className="btn-primary">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Shield className="w-4 h-4" />Update Password</>
                  }
                </button>

                {/* 2FA Section */}
                <div className="mt-6 p-4 rounded-xl"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-[#7c7ca8] mt-0.5">
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="btn-primary text-sm">Enable 2FA</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === "notifs" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-6">Notifications</h2>
                <div className="space-y-1">
                  {[
                    { key: "taskAssigned", label: "Task Assigned",   desc: "When someone assigns a task to you"    },
                    { key: "taskDue",      label: "Task Due Soon",   desc: "2 days before your task deadline"       },
                    { key: "commentAdded", label: "New Comment",     desc: "When someone comments on your task"     },
                    { key: "memberJoined", label: "Member Joined",   desc: "When a new member joins your workspace" },
                    { key: "weeklyDigest", label: "Weekly Digest",   desc: "Summary of your week every Monday"      },
                  ].map(item => (
                    <div key={item.key}
                      className="flex items-center justify-between py-4"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-[#7c7ca8] mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifs(prev => ({
                          ...prev, [item.key]: !(prev as any)[item.key]
                        }))}
                        className={cn("w-11 h-6 rounded-full transition-all relative shrink-0",
                          (notifs as any)[item.key] ? "bg-violet-600" : "bg-white/10")}>
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                          (notifs as any)[item.key] ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-primary mt-5"
                  onClick={() => toast.success("Notification preferences saved!")}>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </motion.div>
            )}

            {/* ── Appearance Tab ── */}
            {activeTab === "appearance" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6">
                <h2 className="font-black text-lg text-white mb-6">Appearance</h2>

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
                      {theme === t.value && (
                        <Check className="w-4 h-4 text-violet-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm font-semibold text-white mb-3">Accent Color</p>
                <div className="flex gap-3 flex-wrap">
                  {["#8b5cf6","#06b6d4","#22c55e","#f59e0b","#ef4444","#ec4899"].map(color => (
                    <button key={color}
                      className="w-10 h-10 rounded-xl hover:scale-110 transition-transform
                        ring-2 ring-transparent hover:ring-white/30"
                      style={{ background: color }}
                      onClick={() => toast.success("Color updated!")} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Danger Zone ── */}
            {activeTab === "danger" && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="card-glass p-6"
                style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                <h2 className="font-black text-lg text-red-400 mb-6">⚠️ Danger Zone</h2>

                <div className="space-y-4">
                  {[
                    {
                      title:  "Sign out all devices",
                      desc:   "Sign out from all sessions except this one",
                      btn:    "Sign Out All",
                      color:  "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/30",
                      action: () => { signOut({ callbackUrl: "/login" }) }
                    },
                    {
                      title:  "Delete Account",
                      desc:   "Permanently delete your account and all data. Cannot be undone.",
                      btn:    "Delete Account",
                      color:  "bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/30",
                      action: () => toast.error("Please contact support to delete your account.")
                    },
                  ].map(item => (
                    <div key={item.title}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div>
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-xs text-[#7c7ca8] mt-0.5">{item.desc}</p>
                      </div>
                      <button onClick={item.action}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-semibold transition-all ml-4 shrink-0 border",
                          item.color
                        )}>
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