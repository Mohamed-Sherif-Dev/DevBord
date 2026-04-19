"use client"

import { useState }  from "react"
import { useRouter } from "next/navigation"
import { signIn }    from "next-auth/react"
import { motion }    from "framer-motion"
import Link          from "next/link"
import {
  Zap, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, Loader2, Check
} from "lucide-react"

import {FaGithub , FaChrome} from "react-icons/fa"
import { cn } from "@/lib/utils"
import toast   from "react-hot-toast"

export default function RegisterPage() {
  const router = useRouter()
  const [form,     setForm]     = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const checks = [
    { label: "8+ characters",    pass: form.password.length >= 8        },
    { label: "Uppercase",        pass: /[A-Z]/.test(form.password)      },
    { label: "Number",           pass: /[0-9]/.test(form.password)      },
    { label: "Special char",     pass: /[!@#$%^&*]/.test(form.password) },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }

      await signIn("credentials", {
        email:    form.email,
        password: form.password,
        redirect: false,
      })
      toast.success("Welcome to DevBoard! 🚀")
      router.push("/onboarding")
    } catch { toast.error("Something went wrong") }
    finally  { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "#070710" }}>

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500
              rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">DevBoard</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Create your account</h1>
          <p className="text-[#7c7ca8] text-sm">Free forever. No credit card required.</p>
        </div>

        <div className="card-glass p-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              className="btn-secondary text-sm py-3">
              <FaChrome className="w-4 h-4 text-blue-400" />
              Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
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
            {[
              { key: "name",     label: "Full Name", type: "text",     icon: User, placeholder: "John Doe"          },
              { key: "email",    label: "Email",     type: "email",    icon: Mail, placeholder: "you@company.com"   },
              { key: "password", label: "Password",  type: "password", icon: Lock, placeholder: "Min 8 characters" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                  <input
                    type={f.key === "password" ? (showPass ? "text" : "password") : f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} required
                    className={cn("input pl-10", f.key === "password" && "pr-10")}
                  />
                  {f.key === "password" && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {/* Password strength */}
                {f.key === "password" && form.password && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {checks.map(c => (
                      <div key={c.label} className={cn(
                        "flex items-center gap-1 text-xs",
                        c.pass ? "text-green-400" : "text-[#7c7ca8]"
                      )}>
                        <Check className="w-3 h-3" />
                        {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-[#7c7ca8] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#7c7ca8] mt-4">
          By signing up you agree to our{" "}
          <a href="#" className="text-violet-400">Terms</a> and{" "}
          <a href="#" className="text-violet-400">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  )
}