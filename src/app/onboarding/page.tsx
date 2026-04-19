"use client"

import { useState }  from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, Building2, Users, Palette,
  ArrowRight, ArrowLeft, Check,
  Loader2, FolderOpen, Sparkles
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn, slugify } from "@/lib/utils"
import toast from "react-hot-toast"

const STEPS = [
  { id: 1, label: "Workspace",  icon: Building2  },
  { id: 2, label: "Project",    icon: FolderOpen },
  { id: 3, label: "Invite",     icon: Users      },
  { id: 4, label: "Done!",      icon: Sparkles   },
]

const COLORS = [
  { value: "#8b5cf6", label: "Violet"  },
  { value: "#06b6d4", label: "Cyan"    },
  { value: "#22c55e", label: "Green"   },
  { value: "#f59e0b", label: "Amber"   },
  { value: "#ef4444", label: "Red"     },
  { value: "#ec4899", label: "Pink"    },
  { value: "#3b82f6", label: "Blue"    },
  { value: "#f97316", label: "Orange"  },
]

const PROJECT_TEMPLATES = [
  { id: "kanban",    label: "Kanban Board",    icon: "📋", desc: "Trello-style columns"      },
  { id: "scrum",     label: "Scrum Sprint",    icon: "⚡", desc: "Agile sprint management"   },
  { id: "roadmap",   label: "Product Roadmap", icon: "🗺️", desc: "Plan your product journey" },
  { id: "blank",     label: "Blank Project",   icon: "✨", desc: "Start from scratch"        },
]

export default function OnboardingPage() {
  const router          = useRouter()
  const { data: session } = useSession()
  const [step,          setStep]          = useState(1)
  const [loading,       setLoading]       = useState(false)

  const [workspace, setWorkspace] = useState({
    name:  "",
    color: "#8b5cf6",
    size:  "1-10",
  })

  const [project, setProject] = useState({
    name:     "",
    template: "kanban",
    color:    "#8b5cf6",
  })

  const [invites, setInvites] = useState(["", "", ""])

  function updateInvite(index: number, value: string) {
    setInvites(prev => prev.map((v, i) => i === index ? value : v))
  }

  async function handleFinish() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success("Workspace created! Let's ship! 🚀")
    router.push("/dashboard")
  }

  const canNext =
    step === 1 ? workspace.name.trim().length >= 2 :
    step === 2 ? project.name.trim().length >= 2   :
    true

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "#070710" }}>

      {/* BG */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-cyan-500
            rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black text-white">DevBoard</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                step === s.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                  : step > s.id
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/5 text-[#7c7ca8]"
              )}>
                {step > s.id
                  ? <Check className="w-3 h-3" />
                  : <s.icon className="w-3 h-3" />
                }
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-6 h-px transition-all",
                  step > s.id ? "bg-green-500/50" : "bg-white/10")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card-glass p-8">
          <AnimatePresence mode="wait">

            {/* Step 1 — Workspace */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-violet-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-7 h-7 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    Create your Workspace
                  </h2>
                  <p className="text-[#7c7ca8] text-sm">
                    A workspace is where your team collaborates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                      Workspace Name *
                    </label>
                    <input
                      type="text"
                      value={workspace.name}
                      onChange={e => setWorkspace({ ...workspace, name: e.target.value })}
                      placeholder="e.g. Acme Corp, My Team..."
                      className="input"
                      autoFocus
                    />
                    {workspace.name && (
                      <p className="text-xs text-[#7c7ca8] mt-1">
                        URL: devboard.app/<span className="text-violet-400">{slugify(workspace.name)}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                      Team Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["1-10", "11-50", "50+"].map(size => (
                        <button key={size} onClick={() => setWorkspace({ ...workspace, size })}
                          className={cn(
                            "py-2.5 rounded-xl text-sm font-semibold border transition-all",
                            workspace.size === size
                              ? "border-violet-500 bg-violet-500/15 text-violet-400"
                              : "border-white/10 text-[#7c7ca8] hover:border-violet-500/30"
                          )}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                      Workspace Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c.value}
                          onClick={() => setWorkspace({ ...workspace, color: c.value })}
                          title={c.label}
                          className={cn(
                            "w-8 h-8 rounded-xl transition-all",
                            workspace.color === c.value
                              ? "scale-125 ring-2 ring-white/40"
                              : "hover:scale-110"
                          )}
                          style={{ background: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Project */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-cyan-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    Create your first Project
                  </h2>
                  <p className="text-[#7c7ca8] text-sm">
                    Projects help you organize tasks by team or goal.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={e => setProject({ ...project, name: e.target.value })}
                      placeholder="e.g. Website Redesign, Mobile App..."
                      className="input"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                      Template
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROJECT_TEMPLATES.map(t => (
                        <button key={t.id}
                          onClick={() => setProject({ ...project, template: t.id })}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            project.template === t.id
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 hover:border-violet-500/30"
                          )}>
                          <div className="text-xl mb-1">{t.icon}</div>
                          <p className={cn("text-xs font-semibold",
                            project.template === t.id ? "text-violet-400" : "text-white"
                          )}>
                            {t.label}
                          </p>
                          <p className="text-[10px] text-[#7c7ca8] mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
                      Project Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c.value}
                          onClick={() => setProject({ ...project, color: c.value })}
                          className={cn(
                            "w-7 h-7 rounded-lg transition-all",
                            project.color === c.value
                              ? "scale-125 ring-2 ring-white/40"
                              : "hover:scale-110"
                          )}
                          style={{ background: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Invite */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-green-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">
                    Invite your Team
                  </h2>
                  <p className="text-[#7c7ca8] text-sm">
                    Add teammates by email. You can always invite more later.
                  </p>
                </div>

                <div className="space-y-3">
                  {invites.map((email, i) => (
                    <div key={i} className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={e => updateInvite(i, e.target.value)}
                        placeholder={`teammate${i + 1}@company.com`}
                        className="input"
                      />
                      {email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setInvites(prev => [...prev, ""])}
                  className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-white/10
                    text-xs text-[#7c7ca8] hover:border-violet-500/30 hover:text-violet-400
                    transition-all flex items-center justify-center gap-1.5"
                >
                  + Add another email
                </button>

                <div className="mt-4 p-3 rounded-xl flex items-center gap-3"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                  <p className="text-xs text-[#7c7ca8]">
                    Teammates will receive an email invitation to join{" "}
                    <span className="text-violet-400 font-semibold">{workspace.name}</span>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4 — Done */}
            {step === 4 && (
              <motion.div key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))" }}
                >
                  🚀
                </motion.div>

                <h2 className="text-3xl font-black text-white mb-3">
                  You're all set!
                </h2>
                <p className="text-[#7c7ca8] mb-8">
                  Your workspace{" "}
                  <span className="text-violet-400 font-semibold">{workspace.name}</span>{" "}
                  is ready. Time to ship! 🎉
                </p>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: "🏢", label: "Workspace", value: workspace.name },
                    { icon: "📁", label: "Project",   value: project.name   },
                    { icon: "👥", label: "Invites",   value: `${invites.filter(Boolean).length} sent` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="text-xl mb-1">{item.icon}</div>
                      <p className="text-xs font-bold text-white truncate">{item.value || "—"}</p>
                      <p className="text-[10px] text-[#7c7ca8]">{item.label}</p>
                    </div>
                  ))}
                </div>

                <button onClick={handleFinish} disabled={loading}
                  className="btn-primary w-full py-3.5 text-base">
                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <><span>Go to Dashboard</span><ArrowRight className="w-5 h-5" /></>
                  }
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 4 && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)}
                  className="btn-secondary flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="btn-primary flex-1"
              >
                {step === 3 ? "Finish Setup" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Skip */}
          {step < 4 && (
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-center text-xs text-[#7c7ca8] hover:text-white
                transition-colors mt-4"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mt-6">
          {STEPS.map(s => (
            <div key={s.id} className={cn(
              "h-1 rounded-full transition-all",
              step === s.id ? "w-8 bg-violet-500" :
              step > s.id  ? "w-4 bg-green-500"  :
                             "w-4 bg-white/10"
            )} />
          ))}
        </div>
      </div>
    </div>
  )
}