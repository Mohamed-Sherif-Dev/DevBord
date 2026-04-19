"use client"

import { useState }  from "react"
import { signIn }    from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion }    from "framer-motion"
import Link          from "next/link"
import {
  Zap, Mail, Lock, Eye, EyeOff,
  ArrowRight, Loader2  
} from "lucide-react"
import toast from "react-hot-toast"

import {FaGithub , FaChrome} from "react-icons/fa"

export default function LoginPage() {
  const router = useRouter()
  const [form,     setForm]     = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn("credentials", { ...form, redirect: false })
      if (res?.error) toast.error("Invalid email or password")
      else { toast.success("Welcome back! 🚀"); router.push("/dashboard") }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#070710" }}>

      {/* BG Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500
              rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">DevBoard</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Welcome back 👋</h1>
          <p className="text-[#7c7ca8] text-sm">Sign in to your workspace</p>
        </div>

        <div className="card-glass p-8">
          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="btn-secondary text-sm py-3">
              <FaChrome className="w-4 h-4 text-blue-400" />
              Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="btn-secondary text-sm py-3">
              <FaGithub className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-[#7c7ca8]">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com" required className="input pl-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" required className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-[#7c7ca8] mt-6">
            No account?{" "}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Demo */}
        <div className="mt-4 card-glass p-4">
          <p className="text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-2">
            🎮 Demo Account
          </p>
          <div className="text-xs text-[#7c7ca8] space-y-0.5">
            <p>📧 admin@devboard.com</p>
            <p>🔑 Admin@1234</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}