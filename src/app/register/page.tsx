"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams }    from "next/navigation"
import { signIn }                        from "next-auth/react"
import { motion }                        from "framer-motion"
import Link                              from "next/link"
import {
  Zap, Mail, Lock, Eye, EyeOff, User,
  ArrowRight, Loader2, Check
} from "lucide-react"
import { FaGithub, FaChrome } from "react-icons/fa"
import { cn }   from "@/lib/utils"
import toast     from "react-hot-toast"

function RegisterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [form,     setForm]     = useState({ name: "", email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const emailFromInvite = searchParams.get("email")
  const callbackUrl     = searchParams.get("callbackUrl") || "/onboarding"

  // ✅ حط الإيميل من الدعوة تلقائياً
  useEffect(() => {
    if (emailFromInvite) {
      setForm(prev => ({ ...prev, email: decodeURIComponent(emailFromInvite) }))
    }
  }, [emailFromInvite])

  const checks = [
    { label: "8+ characters", pass: form.password.length >= 8        },
    { label: "Uppercase",     pass: /[A-Z]/.test(form.password)      },
    { label: "Number",        pass: /[0-9]/.test(form.password)      },
    { label: "Special char",  pass: /[!@#$%^&*]/.test(form.password) },
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

      const result = await signIn("credentials", {
        email:    form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) { toast.error("Login failed after register"); return }

      toast.success("Welcome to DevBoard! 🚀")
      router.push(callbackUrl)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "#070710" }}>

      {/* BG Effects */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

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
          <h1 className="text-2xl font-black text-white mb-2">Create your account</h1>
          <p className="text-[#7c7ca8] text-sm">Free forever. No credit card required.</p>
        </div>

        {/* Invite Notice */}
        {emailFromInvite && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl text-center"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <p className="text-sm font-semibold text-white mb-1">🎉 You've been invited!</p>
            <p className="text-xs text-[#7c7ca8]">
              Create your account with{" "}
              <span className="text-violet-400 font-bold">
                {decodeURIComponent(emailFromInvite)}
              </span>
            </p>
          </motion.div>
        )}

        <div className="card-glass p-8">

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="btn-secondary text-sm py-3">
              <FaChrome className="w-4 h-4 text-blue-400" />
              Google
            </button>
            <button
              onClick={() => signIn("github", { callbackUrl })}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => !emailFromInvite && setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  required
                  // ✅ لو جاي من invite مش يقدر يغير الإيميل
                  readOnly={!!emailFromInvite}
                  className={cn("input pl-10",
                    emailFromInvite && "opacity-60 cursor-not-allowed bg-violet-500/5"
                  )}
                />
                {emailFromInvite && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                )}
              </div>
              {emailFromInvite && (
                <p className="text-[10px] text-violet-400 mt-1">
                  ✅ Email locked — set from invitation
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#7c7ca8] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 characters"
                  required
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength */}
              {form.password && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {checks.map(c => (
                    <div key={c.label} className={cn(
                      "flex items-center gap-1 text-xs transition-colors",
                      c.pass ? "text-green-400" : "text-[#7c7ca8]"
                    )}>
                      <Check className="w-3 h-3" />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-[#7c7ca8] mt-6">
            Already have an account?{" "}
            <Link
              href={emailFromInvite
                ? `/login?callbackUrl=${callbackUrl}&email=${emailFromInvite}`
                : "/login"
              }
              className="text-violet-400 hover:text-violet-300 font-semibold">
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

// ✅ Suspense wrapper عشان useSearchParams
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#070710" }}>
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}