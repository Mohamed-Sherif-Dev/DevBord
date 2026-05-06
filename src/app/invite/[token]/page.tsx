"use client"

import { useState, use, useEffect } from "react"
import { useRouter }                 from "next/navigation"
import { motion }                    from "framer-motion"
import { Zap, Check, X, Loader2 }   from "lucide-react"
import { signIn, useSession }        from "next-auth/react"
import toast                         from "react-hot-toast"

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token }         = use(params)
  const router            = useRouter()
  const { data: session } = useSession()

  const [invite,    setInvite]    = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error,     setError]     = useState("")

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) setInvite(d.data)
        else        setError(d.message || "Invalid invitation")
        setLoading(false)
      })
      .catch(() => { setError("Failed to load invitation"); setLoading(false) })
  }, [token])

  // ✅ تحقق إن الـ user المسجل نفس إيميل الدعوة
  const isWrongEmail = session?.user?.email &&
    invite?.email &&
    session.user.email.toLowerCase() !== invite.email.toLowerCase()

  async function handleAccept() {
    // ✅ لو بيستخدم إيميل غلط — ارفض
    if (isWrongEmail) {
      toast.error(`Please sign in with ${invite.email} to accept this invitation`)
      return
    }

    setAccepting(true)
    try {
      const res  = await fetch(`/api/invite/${token}/accept`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }
      toast.success("Welcome to the team! 🎉")
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#070710" }}>
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#070710" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card-glass p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Invalid Invitation</h2>
          <p className="text-[#7c7ca8] mb-6">{error}</p>
          <button onClick={() => router.push("/login")} className="btn-primary w-full">
            Go to Login
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#070710" }}>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-cyan-500
            rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black text-white">DevBoard</span>
        </div>

        <div className="card-glass p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))" }}>
            🎉
          </div>

          <h2 className="text-2xl font-black text-white mb-2">You're Invited!</h2>
          <p className="text-[#7c7ca8] mb-2">
            You've been invited to join{" "}
            <span className="text-violet-400 font-semibold">{invite?.workspace?.name}</span>
            {" "}as a{" "}
            <span className="text-cyan-400 font-semibold capitalize">
              {invite?.role?.toLowerCase()}
            </span>
          </p>

          {/* ✅ إظهار الإيميل المطلوب */}
          <div className="p-3 rounded-xl mb-6"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs text-[#7c7ca8]">
              This invitation is for{" "}
              <span className="text-violet-400 font-bold">{invite?.email}</span>
            </p>
          </div>

          {/* ✅ الـ User مش logged in */}
          {!session ? (
            <div className="space-y-3">
              <p className="text-sm text-[#7c7ca8] mb-4">
                Sign in or create an account with{" "}
                <span className="text-violet-400 font-semibold">{invite?.email}</span>
              </p>

              {/* Google */}
              <button
                onClick={() => signIn("google", {
                  callbackUrl: `/invite/${token}`
                })}
                className="btn-secondary w-full">
                Continue with Google
              </button>

              {/* ✅ Login بالإيميل ده بالظبط */}
              <button
                onClick={() => router.push(
                  `/login?callbackUrl=/invite/${token}&email=${encodeURIComponent(invite?.email)}`
                )}
                className="btn-primary w-full">
                Sign In with Email
              </button>

              {/* ✅ Register بالإيميل ده بالظبط */}
              <button
                onClick={() => router.push(
                  `/register?callbackUrl=/invite/${token}&email=${encodeURIComponent(invite?.email)}`
                )}
                className="w-full py-2.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                New here? Create account →
              </button>
            </div>

          ) : isWrongEmail ? (
            /* ✅ الـ User logged in بإيميل غلط */
            <div className="space-y-4">
              <div className="p-4 rounded-xl"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-sm text-red-400 font-semibold mb-1">⚠️ Wrong Account</p>
                <p className="text-xs text-[#7c7ca8]">
                  You're signed in as{" "}
                  <span className="text-white font-semibold">{session.user?.email}</span>
                  <br/>
                  This invitation is for{" "}
                  <span className="text-violet-400 font-semibold">{invite?.email}</span>
                </p>
              </div>

              <button
                onClick={() => signIn(undefined, {
                  callbackUrl: `/invite/${token}`
                })}
                className="btn-primary w-full">
                Sign in with {invite?.email}
              </button>

              <button
                onClick={() => router.push(
                  `/register?callbackUrl=/invite/${token}&email=${encodeURIComponent(invite?.email)}`
                )}
                className="btn-secondary w-full">
                Create account with {invite?.email}
              </button>
            </div>

          ) : (
            /* ✅ الـ User logged in بالإيميل الصح */
            <div className="space-y-3">
              <div className="p-3 rounded-xl mb-4"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-xs text-green-400">
                  ✅ Signed in as{" "}
                  <span className="font-semibold">{session.user?.email}</span>
                </p>
              </div>
              <button onClick={handleAccept} disabled={accepting} className="btn-primary w-full py-3">
                {accepting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Check className="w-4 h-4" />Accept Invitation</>
                }
              </button>
              <button onClick={() => router.push("/dashboard")}
                className="w-full py-2.5 text-sm text-[#7c7ca8] hover:text-white transition-colors">
                Maybe later
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}