"use client"

import { motion }    from "framer-motion"
import Link          from "next/link"
import {
  Zap, Shield, Users, BarChart3,
  Kanban, Clock, Bell, ArrowRight,
  Check, Star,  
  Sparkles, Lock, Globe
} from "lucide-react"
import {FaGithub , FaChrome} from "react-icons/fa"

const FEATURES = [
  { icon: Kanban,   title: "Kanban Board",        desc: "Drag & drop tasks across custom columns. Visualize your workflow.",          color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Users,    title: "Team Collaboration",  desc: "Invite members, assign tasks, leave comments — all in real time.",           color: "text-cyan-400",   bg: "bg-cyan-500/10"   },
  { icon: Sparkles, title: "AI Suggestions",      desc: "Let AI generate task ideas, descriptions, and priorities automatically.",     color: "text-pink-400",   bg: "bg-pink-500/10"   },
  { icon: Clock,    title: "Time Tracker",         desc: "Track time per task. See where your team's hours actually go.",             color: "text-green-400",  bg: "bg-green-500/10"  },
  { icon: Bell,     title: "Smart Notifications", desc: "Email alerts when tasks are assigned or deadlines are approaching.",         color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: Shield,   title: "Enterprise Security", desc: "Rate limiting, 2FA, RBAC, audit logs — built for real companies.",          color: "text-red-400",    bg: "bg-red-500/10"    },
  { icon: BarChart3,title: "Analytics",           desc: "Burndown charts, team velocity, and progress dashboards.",                  color: "text-blue-400",   bg: "bg-blue-500/10"   },
  { icon: Globe,    title: "Multi-Workspace",     desc: "Separate workspaces for different teams or clients. Full isolation.",       color: "text-orange-400", bg: "bg-orange-500/10" },
]

const STATS = [
  { value: "10K+", label: "Developers" },
  { value: "50K+", label: "Tasks Done" },
  { value: "99.9%",label: "Uptime"     },
  { value: "4.9★", label: "Rating"     },
]

const TESTIMONIALS = [
  { name: "Sarah Johnson",   role: "CTO at TechCorp",         text: "DevBoard replaced Jira for our team. It's faster, cleaner, and our devs actually love using it.",  avatar: "SJ" },
  { name: "Ahmed Hassan",    role: "Lead Developer",           text: "The AI task suggestions save me 30 minutes every sprint. Game changer for planning.",             avatar: "AH" },
  { name: "Maria Garcia",    role: "Product Manager",          text: "Finally a board that combines Notion's flexibility with Trello's simplicity. Perfect.",           avatar: "MG" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070710] text-[#f0f0ff] overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{ background: "rgba(7,7,16,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-500
              rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">DevBoard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#7c7ca8]">
            {["Features","Pricing","Security","Docs"].map(item => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-[#7c7ca8] hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/register"
              className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold
                px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/25">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
          bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px]
          bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="relative max-w-4xl mx-auto">

          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20
            rounded-full px-4 py-2 text-sm text-violet-400 font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Task Management
            <span className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Where Developer
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-400
              bg-clip-text text-transparent bg-[length:200%] animate-pulse">
              Teams Ship Faster
            </span>
          </h1>

          <p className="text-xl text-[#7c7ca8] mb-10 max-w-2xl mx-auto leading-relaxed">
            The modern task board built for developers. Kanban, AI suggestions,
            time tracking, and enterprise security — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register"
              className="group flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600
                hover:from-violet-500 hover:to-cyan-500 text-white font-bold
                px-8 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-violet-500/30
                text-base w-full sm:w-auto justify-center">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 border border-white/10 text-white/80
                hover:border-violet-500/50 hover:text-white font-semibold
                px-8 py-4 rounded-2xl transition-all text-base w-full sm:w-auto justify-center">
              <FaGithub className="w-5 h-5" />
              Login with GitHub
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-[#7c7ca8]">
            {[
              { icon: Check, text: "Free forever plan"      },
              { icon: Lock,  text: "SOC2 compliant"         },
              { icon: Users, text: "No credit card required"},
            ].map(item => (
              <div key={item.text} className="flex items-center gap-1.5">
                <item.icon className="w-4 h-4 text-green-400" />
                {item.text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-5xl mx-auto mt-20"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#070710] via-transparent to-transparent
            pointer-events-none z-10 rounded-2xl" />
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-violet-500/10"
            style={{ background: "#12122a" }}>
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 bg-white/5 rounded-lg h-6 ml-4 flex items-center px-3">
                <span className="text-xs text-white/30">devboard.app/projects/alpha</span>
              </div>
            </div>

            {/* Fake kanban preview */}
            <div className="p-6 flex gap-4 overflow-hidden min-h-64">
              {[
                { label: "📋 To Do",       color: "#3b82f6", tasks: ["Setup CI/CD pipeline", "Write unit tests"] },
                { label: "⚡ In Progress", color: "#8b5cf6", tasks: ["Build auth system", "Design dashboard UI", "API integration"] },
                { label: "👀 In Review",   color: "#06b6d4", tasks: ["Fix login bug"] },
                { label: "✅ Done",         color: "#22c55e", tasks: ["Project setup", "Database schema"] },
              ].map(col => (
                <div key={col.label} className="flex-1 min-w-48"
                  style={{ background: "rgba(18,18,42,0.8)", borderRadius: "12px", padding: "12px",
                           border: `1px solid ${col.color}25` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs font-semibold text-white/70">{col.label}</span>
                    <span className="ml-auto text-xs text-white/30">{col.tasks.length}</span>
                  </div>
                  {col.tasks.map(task => (
                    <div key={task} className="mb-2 p-2.5 rounded-lg bg-white/5 border border-white/8">
                      <p className="text-xs text-white/80 font-medium">{task}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-4 h-4 rounded-full bg-violet-500/40" />
                        <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.random() * 80 + 20}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center">
              <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-cyan-400
                bg-clip-text text-transparent mb-2">
                {stat.value}
              </p>
              <p className="text-[#7c7ca8] text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              Everything your team needs
            </h2>
            <p className="text-[#7c7ca8] text-lg max-w-2xl mx-auto">
              Built by developers, for developers. Every feature is designed
              to reduce friction and increase focus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="card-glass p-5 hover:border-violet-500/30 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#7c7ca8] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Loved by dev teams</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-glass p-6"
              >
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400" />)}
                </div>
                <p className="text-[#c0c0e0] text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-cyan-600
                    rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[#7c7ca8]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center card-glass p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 pointer-events-none" />
          <Zap className="w-12 h-12 text-violet-400 mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-4">Ready to ship faster?</h2>
          <p className="text-[#7c7ca8] text-lg mb-8">
            Join 10,000+ developers who manage their projects on DevBoard.
            Free forever. No credit card required.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600
              hover:from-violet-500 hover:to-cyan-500 text-white font-bold
              px-10 py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-violet-500/30 text-base">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-cyan-500
              rounded-lg flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">DevBoard</span>
            <span className="text-[#7c7ca8] text-sm ml-2">© 2025</span>
          </div>
          <div className="flex gap-6 text-sm text-[#7c7ca8]">
            {["Privacy","Terms","Security","Status"].map(item => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}