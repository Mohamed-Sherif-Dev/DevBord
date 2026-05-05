"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, Mail, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, Loader2,
  Check, Shield
} from "lucide-react"
import Link  from "next/link"
import { cn } from "@/lib/utils"
import toast  from "react-hot-toast"

type Step = "email" | "otp" | "reset" | "done"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step,       setStep]       = useState<Step>("email")
  const [loading,    setLoading]    = useState(false)
  const [email,      setEmail]      = useState("")
  const [otp,        setOtp]        = useState(["", "", "", "", "", ""])
  const [resetToken, setResetToken] = useState("")
  const [password,   setPassword]   = useState("")
  const [confirm,    setConfirm]    = useState("")
  const [showPass,   setShowPass]   = useState(false)
  const [resending,  setResending]  = useState(false)
  const [countdown,  setCountdown]  = useState(0)

  // OTP input refs
  const otpRefs = Array.from({ length: 6 }, () => null) as any[]

  function startCountdown() {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1 — Send OTP
  async function handleSendOTP() {
    if (!email.trim()) return
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }
      toast.success("OTP sent! Check your email 📧")
      setStep("otp")
      startCountdown()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  async function handleResend() {
    if (countdown > 0) return
    setResending(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      toast.success("OTP resent! 📧")
      startCountdown()
      setOtp(["", "", "", "", "", ""])
    } finally {
      setResending(false)
    }
  }

  // Step 2 — Verify OTP
  async function handleVerifyOTP() {
    const otpCode = otp.join("")
    if (otpCode.length !== 6) return
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, otp: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }
      setResetToken(data.resetToken)
      setStep("reset")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Step 3 — Reset Password
  async function handleResetPassword() {
    if (password !== confirm) { toast.error("Passwords don't match"); return }
    if (password.length < 8)  { toast.error("Min 8 characters"); return }
    setLoading(true)
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, resetToken, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }
      setStep("done")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // OTP Input Handler
  function handleOtpInput(index: number, value: string) {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    // Auto focus next
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  const checks = [
    { label: "8+ characters", pass: password.length >= 8        },
    { label: "Uppercase",     pass: /[A-Z]/.test(password)      },
    { label: "Number",        pass: /[0-9]/.test(password)      },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#070710" }}>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

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
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <motion.div key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-glass p-8"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-violet-500/15 rounded-2xl flex items-center
                  justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-violet-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Forgot Password?</h2>
                <p className="text-[#7c7ca8] text-sm">
                  Enter your email and we'll send you an OTP
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8]
                    uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                    <input type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input pl-10"
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                    />
                  </div>
                </div>
                <button onClick={handleSendOTP}
                  disabled={!email.trim() || loading}
                  className="btn-primary w-full py-3">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>

              <p className="text-center text-sm text-[#7c7ca8] mt-6">
                Remember it?{" "}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <motion.div key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-glass p-8"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-cyan-500/15 rounded-2xl flex items-center
                  justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Enter OTP</h2>
                <p className="text-[#7c7ca8] text-sm">
                  We sent a 6-digit code to{" "}
                  <span className="text-violet-400 font-semibold">{email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-black rounded-xl transition-all",
                      "bg-[#1a1a2e] border-2 text-white outline-none",
                      digit
                        ? "border-violet-500 shadow-lg shadow-violet-500/20"
                        : "border-[#2a2a4a] focus:border-violet-500/50"
                    )}
                  />
                ))}
              </div>

              <button onClick={handleVerifyOTP}
                disabled={otp.join("").length !== 6 || loading}
                className="btn-primary w-full py-3 mb-4">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Verify OTP</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-[#7c7ca8]">
                  Didn't receive it?{" "}
                  {countdown > 0 ? (
                    <span className="text-[#7c7ca8]">
                      Resend in <span className="text-violet-400 font-semibold">{countdown}s</span>
                    </span>
                  ) : (
                    <button onClick={handleResend} disabled={resending}
                      className="text-violet-400 hover:text-violet-300 font-semibold">
                      {resending ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </p>
              </div>

              <button onClick={() => setStep("email")}
                className="flex items-center gap-1.5 text-xs text-[#7c7ca8]
                  hover:text-white transition-colors mx-auto mt-4">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </motion.div>
          )}

          {/* ── Step 3: New Password ── */}
          {step === "reset" && (
            <motion.div key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-glass p-8"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-500/15 rounded-2xl flex items-center
                  justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">New Password</h2>
                <p className="text-[#7c7ca8] text-sm">Choose a strong password</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8]
                    uppercase tracking-wider mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="input pl-10 pr-10"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {password && (
                    <div className="flex gap-3 mt-2">
                      {checks.map(c => (
                        <div key={c.label}
                          className={cn("flex items-center gap-1 text-xs",
                            c.pass ? "text-green-400" : "text-[#7c7ca8]")}>
                          <Check className="w-3 h-3" />
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#7c7ca8]
                    uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className={cn("input pl-10",
                        confirm && confirm !== password && "border-red-500/50"
                      )}
                      onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                    />
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                  )}
                </div>

                <button onClick={handleResetPassword}
                  disabled={!password || password !== confirm || loading}
                  className="btn-primary w-full py-3">
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><span>Reset Password</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Done ── */}
          {step === "done" && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-glass p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-500/15 rounded-3xl flex items-center
                  justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-green-400" />
              </motion.div>

              <h2 className="text-2xl font-black text-white mb-2">
                Password Reset! 🎉
              </h2>
              <p className="text-[#7c7ca8] text-sm mb-8">
                Your password has been updated successfully.
                You can now sign in with your new password.
              </p>

              <button onClick={() => router.push("/login")}
                className="btn-primary w-full py-3">
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps indicator */}
        {step !== "done" && (
          <div className="flex justify-center gap-2 mt-6">
            {(["email","otp","reset"] as Step[]).map(s => (
              <div key={s} className={cn(
                "h-1 rounded-full transition-all",
                step === s      ? "w-8 bg-violet-500"  :
                (step === "otp"   && s === "email") ||
                (step === "reset" && s !== "reset") ? "w-4 bg-green-500" :
                "w-4 bg-white/10"
              )} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}