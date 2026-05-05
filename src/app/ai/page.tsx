"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence }      from "framer-motion"
import {
  Send, Loader2, Sparkles, X,
  Copy, Check, RefreshCw,
  Zap, Code, FileText, ListTodo,
  ChevronDown, Bot
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useSession }  from "next-auth/react"
import { cn, getInitials } from "@/lib/utils"
import toast from "react-hot-toast"

interface Message {
  role:    "user" | "assistant"
  content: string
}




const SUGGESTIONS = [
  { icon: ListTodo, label: "Suggest tasks for my project",    prompt: "Suggest 5 tasks for a web development project with priorities and descriptions" },
  { icon: Code,     label: "Review my code",                  prompt: "Help me review and improve my Next.js code for better performance" },
  { icon: FileText, label: "Write documentation",             prompt: "Help me write technical documentation for a REST API" },
  { icon: Zap,      label: "Plan a sprint",                   prompt: "Help me plan a 2-week sprint for a 4-person development team" },
  { icon: RefreshCw,label: "Analyze project progress",        prompt: "How can I improve my team's velocity and project progress?" },
  { icon: Sparkles, label: "Generate user stories",           prompt: "Generate user stories for a task management feature" },
]

export default function AIPage() {
  const { data: session } = useSession()
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [streaming, setStreaming] = useState("")
  const [copied,    setCopied]    = useState<string | null>(null)
  const [projects,  setProjects]  = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProjects,    setShowProjects]     = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(d => setProjects(d.data || []))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])



async function handleSend(prompt?: string) {
  const content = prompt || input.trim()
  if (!content || loading) return

  const userMessage: Message = { role: "user", content }
  const newMessages = [...messages, userMessage]

  setMessages(newMessages)
  setInput("")
  setLoading(true)
  setStreaming("")

  try {
    const res  = await fetch("/api/ai/chat", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ messages: newMessages }),
    })

    const data = await res.json()
    console.log("AI response:", data)

    if (!res.ok || !data.content) {
      throw new Error(data.message || "Empty response")
    }

    setMessages(prev => [...prev, { role: "assistant", content: data.content }])

  } catch (err: any) {
    console.error("handleSend error:", err.message)
    toast.error("AI is not available: " + err.message)
    setMessages(prev => prev.slice(0, -1))
  } finally {
    setLoading(false)
    setStreaming("")
  }
}


  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast.success("Copied!")
  }

  function clearChat() {
    setMessages([])
    setStreaming("")
  }

  // Format markdown-like content
  function formatContent(content: string) {
    return content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black/40 rounded-xl p-4 my-2 overflow-x-auto text-sm font-mono border border-white/10"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded text-violet-300 text-sm">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/^### (.+)$/gm, '<h3 class="text-white font-bold text-base mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-white font-bold text-lg mt-4 mb-2">$1</h2>')
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-violet-400 mt-1">▸</span><span>$1</span></div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-violet-400 font-bold min-w-4">$1.</span><span>$2</span></div>')
      .replace(/\n/g, "<br/>")
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-112px)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500
              rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">DevBoard AI</h2>
              <p className="text-xs text-[#7c7ca8]">
                Your intelligent project assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Project Context Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProjects(!showProjects)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                  selectedProject
                    ? "border-violet-500 bg-violet-500/15 text-violet-400"
                    : "border-white/10 text-[#7c7ca8] hover:border-violet-500/30"
                )}>
                <div className="w-2 h-2 rounded-full"
                  style={{ background: selectedProject?.color || "#7c7ca8" }} />
                {selectedProject?.name || "No Project Context"}
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showProjects && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-10 w-52 card-glass shadow-2xl overflow-hidden z-50"
                    style={{ border: "1px solid rgba(139,92,246,0.2)" }}
                  >
                    <button
                      onClick={() => { setSelectedProject(null); setShowProjects(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm
                        text-[#7c7ca8] hover:bg-white/5 hover:text-white transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#7c7ca8]" />
                      No Project Context
                    </button>
                    {projects.map(p => (
                      <button key={p.id}
                        onClick={() => { setSelectedProject(p); setShowProjects(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm
                          text-[#7c7ca8] hover:bg-white/5 hover:text-white transition-colors">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        {p.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {messages.length > 0 && (
              <button onClick={clearChat} className="btn-secondary text-xs px-3 py-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col card-glass rounded-2xl">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Empty State */}
            {messages.length === 0 && !streaming && (
              <div className="h-full flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mb-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-600/30 to-cyan-500/30
                    rounded-3xl flex items-center justify-center mx-auto mb-4
                    border border-violet-500/20">
                    <Bot className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-[#7c7ca8] text-sm max-w-md">
                    I can help you manage tasks, write code, plan sprints,
                    and much more. Select a project for context!
                  </p>
                </motion.div>

                {/* Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleSend(s.prompt)}
                      className="flex items-start gap-3 p-4 rounded-xl text-left
                        border border-white/8 hover:border-violet-500/30
                        hover:bg-violet-500/5 transition-all group"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="w-8 h-8 bg-violet-500/10 rounded-lg
                        flex items-center justify-center shrink-0
                        group-hover:bg-violet-500/20 transition-colors">
                        <s.icon className="w-4 h-4 text-violet-400" />
                      </div>
                      <p className="text-sm text-[#7c7ca8] group-hover:text-white
                        transition-colors leading-snug">
                        {s.label}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-4", msg.role === "user" && "flex-row-reverse")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-cyan-600 text-white"
                    : "bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-500/20"
                )}>
                  {msg.role === "user"
                    ? getInitials(session?.user?.name)
                    : <Sparkles className="w-4 h-4 text-violet-400" />
                  }
                </div>

                {/* Bubble */}
                <div className={cn(
                  "flex-1 max-w-3xl",
                  msg.role === "user" && "flex justify-end"
                )}>
                  <div className={cn(
                    "relative group px-5 py-4 rounded-2xl",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white max-w-xl"
                      : "card-glass text-[#c0c0e0] w-full"
                  )}>
                    {msg.role === "assistant" ? (
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => copyMessage(msg.content, String(i))}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100
                        transition-opacity btn-ghost p-1.5"
                    >
                      {copied === String(i)
                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                        : <Copy  className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Streaming */}
            {streaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center
                  bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-500/20">
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                </div>
                <div className="flex-1 card-glass px-5 py-4 rounded-2xl">
                  <div
                    className="text-sm text-[#c0c0e0] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatContent(streaming) }}
                  />
                  <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5 rounded-sm" />
                </div>
              </motion.div>
            )}

            {/* Loading */}
            {loading && !streaming && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center
                  bg-gradient-to-br from-violet-600/30 to-cyan-500/30 border border-violet-500/20">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div className="card-glass px-5 py-4 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i}
                        className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 shrink-0"
            style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>

            {selectedProject && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: selectedProject.color }} />
                <span className="text-xs text-[#7c7ca8]">
                  Context: <span className="text-violet-400 font-semibold">{selectedProject.name}</span>
                </span>
                <button onClick={() => setSelectedProject(null)}
                  className="text-[#7c7ca8] hover:text-white transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1 card-glass rounded-2xl px-4 py-3"
                style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask me anything about your project... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="w-full bg-transparent text-sm text-white
                    placeholder-[#7c7ca8] outline-none resize-none max-h-32"
                  style={{ lineHeight: "1.5" }}
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0",
                  input.trim() && !loading
                    ? "bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                    : "bg-white/5 text-[#7c7ca8] cursor-not-allowed"
                )}>
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Send    className="w-5 h-5" />
                }
              </button>
            </div>

            <p className="text-[10px] text-[#7c7ca8] mt-2 text-center">
              Powered by Llama 3.1 • Free & Unlimited 🚀
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}