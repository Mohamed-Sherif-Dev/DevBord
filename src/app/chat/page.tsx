"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Hash, Plus, Send, Paperclip, Smile,
  AtSign, Reply, MoreHorizontal, X,
  Search, Users, FolderOpen, Check,
  CheckCheck, Loader2
} from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { useSession }  from "next-auth/react"
import { getPusherClient } from "@/lib/pusher"
import { cn, getInitials, formatRelativeTime } from "@/lib/utils"
import toast from "react-hot-toast"

const EMOJIS = ["👍","❤️","😂","😮","😢","🔥","✅","🎉"]

const AVATAR_GRADIENTS = [
  "from-violet-600 to-cyan-600",
  "from-pink-600 to-orange-600",
  "from-green-600 to-cyan-600",
  "from-blue-600 to-violet-600",
]

export default function ChatPage() {
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id

  // Channels
  const [channels,        setChannels]        = useState<any[]>([])
  const [activeChannel,   setActiveChannel]   = useState<any>(null)
  const [loadingChannels, setLoadingChannels] = useState(true)

  // Messages
  const [messages,        setMessages]        = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [hasMore,         setHasMore]         = useState(false)
  const [nextCursor,      setNextCursor]      = useState<string | null>(null)

  // Input
  const [content,    setContent]    = useState("")
  const [sending,    setSending]    = useState(false)
  const [replyTo,    setReplyTo]    = useState<any>(null)
  const [showEmoji,  setShowEmoji]  = useState<string | null>(null)
  const [mentioning, setMentioning] = useState(false)
  const [members,    setMembers]    = useState<any[]>([])
  const [showMembers, setShowMembers] = useState(false)

  // New Channel
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [workspaceId,    setWorkspaceId]    = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // Load workspace
  useEffect(() => {
    fetch("/api/workspaces")
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) setWorkspaceId(d.data[0].id)
      })
  }, [])

  // Load channels
  useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/channels?workspaceId=${workspaceId}`)
      .then(r => r.json())
      .then(d => {
        const chs = d.data || []
        setChannels(chs)
        if (chs.length > 0) setActiveChannel(chs[0])
        setLoadingChannels(false)
      })
  }, [workspaceId])

  // Load members
  useEffect(() => {
    fetch("/api/team")
      .then(r => r.json())
      .then(d => setMembers(d.data?.members || []))
  }, [])

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return
    setMessages([])
    setLoadingMessages(true)

    fetch(`/api/channels/${activeChannel.id}/messages`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.data?.messages || [])
        setHasMore(d.data?.hasMore || false)
        setNextCursor(d.data?.nextCursor || null)
        setLoadingMessages(false)
        scrollToBottom()
      })
  }, [activeChannel])

  // Pusher subscription
  // useEffect(() => {
  //   if (!activeChannel) return

  //   const pusherClient = getPusherClient()
  //   if (!pusherClient) return

  //   const channel = pusherClient.subscribe(`channel-${activeChannel.id}`)

  //   channel.bind("new-message", (message: any) => {
  //     setMessages(prev => [...prev, message])
  //     scrollToBottom()
  //   })

  //   channel.bind("reaction-updated", ({ messageId, reactions }: any) => {
  //     setMessages(prev => prev.map(m =>
  //       m.id === messageId ? { ...m, reactions } : m
  //     ))
  //   })

  //   return () => {
  //     pusherClient.unsubscribe(`channel-${activeChannel.id}`)
  //   }
  // }, [activeChannel])
useEffect(() => {
  if (!activeChannel) return

  const pusher = getPusherClient()
  if (!pusher) return  // ✅ مش هيـ crash لو مفيش keys

  const channel = pusher.subscribe(`channel-${activeChannel.id}`)

  channel.bind("new-message", (message: any) => {
    setMessages(prev => [...prev, message])
    scrollToBottom()
  })

  channel.bind("reaction-updated", ({ messageId, reactions }: any) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, reactions } : m
    ))
  })

  return () => {
    pusher.unsubscribe(`channel-${activeChannel.id}`)
  }
}, [activeChannel])
  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Load more messages
  async function loadMore() {
    if (!hasMore || !nextCursor || !activeChannel) return
    const res  = await fetch(`/api/channels/${activeChannel.id}/messages?cursor=${nextCursor}`)
    const data = await res.json()
    setMessages(prev => [...(data.data?.messages || []), ...prev])
    setHasMore(data.data?.hasMore || false)
    setNextCursor(data.data?.nextCursor || null)
  }

  // Send message
  async function handleSend() {
    if (!content.trim() || !activeChannel || sending) return
    setSending(true)

    // Extract mentions
    const mentionRegex = /@(\w+)/g
    const mentionNames = [...content.matchAll(mentionRegex)].map(m => m[1])
    const mentionIds   = members
      .filter(m => mentionNames.some(name =>
        m.user.name?.toLowerCase().includes(name.toLowerCase())
      ))
      .map(m => m.userId)

    try {
      await fetch(`/api/channels/${activeChannel.id}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          content,
          replyToId: replyTo?.id || null,
          mentions:  mentionIds,
        }),
      })
      setContent("")
      setReplyTo(null)
    } catch {
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  // React to message
  async function handleReaction(messageId: string, emoji: string) {
    await fetch(`/api/channels/${activeChannel.id}/messages/${messageId}/reaction`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ emoji }),
    })
    setShowEmoji(null)
  }

  // Create channel
  async function handleCreateChannel() {
    if (!newChannelName.trim() || !workspaceId) return
    try {
      const res  = await fetch("/api/channels", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:        newChannelName.toLowerCase().replace(/\s+/g, "-"),
          workspaceId,
          type:        "WORKSPACE",
        }),
      })
      const data = await res.json()
      setChannels(prev => [...prev, data.data])
      setActiveChannel(data.data)
      setNewChannelName("")
      setShowNewChannel(false)
      toast.success("Channel created! 🎉")
    } catch {
      toast.error("Failed to create channel")
    }
  }

  // Group reactions
  function groupReactions(reactions: any[]) {
    return reactions.reduce((acc: any, r: any) => {
      if (!acc[r.emoji]) acc[r.emoji] = []
      acc[r.emoji].push(r.user)
      return acc
    }, {})
  }

  // Render message content with mentions highlighted
  function renderContent(content: string) {
    return content.replace(/@(\w+)/g, '<span class="text-violet-400 font-semibold">@$1</span>')
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-112px)] rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(139,92,246,0.15)" }}>

        {/* ── Sidebar ── */}
        <div className="w-64 shrink-0 flex flex-col"
          style={{ background: "#0d0d1a", borderRight: "1px solid rgba(139,92,246,0.1)" }}>

          {/* Header */}
          <div className="px-4 py-4"
            style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
            <h2 className="font-black text-white text-sm">Messages</h2>
            <p className="text-[10px] text-[#7c7ca8] mt-0.5">Team communication</p>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto py-2">

            {/* Workspace Channels */}
            <div className="px-3 mb-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-[#7c7ca8] uppercase tracking-wider">
                  Channels
                </p>
                <button onClick={() => setShowNewChannel(!showNewChannel)}
                  className="text-[#7c7ca8] hover:text-violet-400 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* New Channel Input */}
              <AnimatePresence>
                {showNewChannel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2"
                  >
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newChannelName}
                        onChange={e => setNewChannelName(e.target.value)}
                        placeholder="channel-name"
                        className="input text-xs py-1.5 flex-1"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleCreateChannel()}
                      />
                      <button onClick={handleCreateChannel}
                        className="btn-primary px-2 py-1.5 text-xs">
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Channel List */}
              {loadingChannels ? (
                <div className="space-y-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 shimmer-bg rounded-lg" />
                  ))}
                </div>
              ) : channels.length === 0 ? (
                <p className="text-xs text-[#7c7ca8] px-2 py-2">No channels yet</p>
              ) : (
                channels.map(ch => {
                  const unread     = 0 // TODO: calculate from lastRead
                  const isActive   = activeChannel?.id === ch.id
                  const lastMsg    = ch.messages?.[0]

                  return (
                    <button key={ch.id}
                      onClick={() => setActiveChannel(ch)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all",
                        isActive
                          ? "bg-violet-600/20 text-white"
                          : "text-[#7c7ca8] hover:bg-white/5 hover:text-white"
                      )}>
                      <Hash className={cn("w-3.5 h-3.5 shrink-0",
                        isActive ? "text-violet-400" : "text-[#7c7ca8]")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{ch.name}</p>
                        {lastMsg && (
                          <p className="text-[10px] text-[#7c7ca8] truncate">
                            {lastMsg.user?.name}: {lastMsg.content}
                          </p>
                        )}
                      </div>
                      {unread > 0 && (
                        <span className="w-4 h-4 bg-violet-500 rounded-full
                          flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                          {unread}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Members */}
            <div className="px-3 mt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold text-[#7c7ca8] uppercase tracking-wider">
                  Members
                </p>
                <button onClick={() => setShowMembers(!showMembers)}
                  className="text-[#7c7ca8] hover:text-violet-400">
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>

              {members.slice(0, 8).map((m: any, i: number) => (
                <div key={m.userId}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={cn(
                    "w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center",
                    "text-[9px] font-bold text-white shrink-0",
                    AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                  )}>
                    {getInitials(m.user.name)}
                  </div>
                  <p className="text-xs text-[#7c7ca8] truncate">{m.user.name}</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Chat ── */}
        <div className="flex-1 flex flex-col" style={{ background: "#070710" }}>

          {!activeChannel ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-white font-bold text-lg mb-2">Welcome to Chat!</h3>
                <p className="text-[#7c7ca8] text-sm">Select a channel or create one to start</p>
              </div>
            </div>
          ) : (
            <>
              {/* Channel Header */}
              <div className="flex items-center justify-between px-5 py-3 shrink-0"
                style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-violet-400" />
                  <h3 className="font-bold text-white">{activeChannel.name}</h3>
                  {activeChannel.description && (
                    <span className="text-xs text-[#7c7ca8] hidden sm:block">
                      — {activeChannel.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7c7ca8]">
                    {members.length} members
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mb-4">
                    <button onClick={loadMore}
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                      Load earlier messages
                    </button>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 shimmer-bg rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 shimmer-bg rounded w-24" />
                          <div className="h-10 shimmer-bg rounded-xl w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-20 text-center">
                    <div>
                      <div className="text-5xl mb-4">👋</div>
                      <p className="text-white font-bold mb-1">
                        Welcome to #{activeChannel.name}!
                      </p>
                      <p className="text-[#7c7ca8] text-sm">
                        This is the beginning of this channel. Say hello!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe      = msg.userId === userId
                    const prevMsg   = messages[i - 1]
                    const isGrouped = prevMsg?.userId === msg.userId &&
                      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000
                    const grouped   = groupReactions(msg.reactions || [])

                    return (
                      <div key={msg.id}
                        className={cn(
                          "group relative flex items-start gap-3",
                          isGrouped ? "mt-0.5" : "mt-4",
                          isMe && "flex-row-reverse"
                        )}>

                        {/* Avatar */}
                        {!isGrouped ? (
                          <div className={cn(
                            "w-8 h-8 rounded-full shrink-0 flex items-center justify-center",
                            "text-[10px] font-bold text-white",
                            "bg-gradient-to-br",
                            AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                          )}>
                            {msg.user?.image
                              ? <img src={msg.user.image} className="w-8 h-8 rounded-full object-cover" alt="" />
                              : getInitials(msg.user?.name)
                            }
                          </div>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}

                        {/* Content */}
                        <div className={cn("flex-1 min-w-0", isMe && "flex flex-col items-end")}>
                          {/* Name + Time */}
                          {!isGrouped && (
                            <div className={cn("flex items-baseline gap-2 mb-1",
                              isMe && "flex-row-reverse")}>
                              <span className="text-xs font-bold text-white">
                                {isMe ? "You" : msg.user?.name}
                              </span>
                              <span className="text-[10px] text-[#7c7ca8]">
                                {formatRelativeTime(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          {/* Reply */}
                          {msg.replyTo && (
                            <div className={cn(
                              "text-xs text-[#7c7ca8] px-3 py-1.5 rounded-lg mb-1 max-w-xs",
                              "border-l-2 border-violet-500",
                              isMe ? "bg-violet-500/10 text-right" : "bg-white/5"
                            )}>
                              <span className="font-semibold text-violet-400">
                                {msg.replyTo.user?.name}:
                              </span>{" "}
                              {msg.replyTo.content?.slice(0, 60)}...
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div className={cn(
                            "relative max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm",
                            isMe
                              ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-tr-sm"
                              : "text-white rounded-tl-sm",
                            !isMe && "card-glass"
                          )}>
                            {/* File */}
                            {msg.fileUrl && (
                              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 mb-2 text-xs underline opacity-80">
                                <Paperclip className="w-3 h-3" />
                                {msg.fileName || "Attachment"}
                              </a>
                            )}

                            {/* Text */}
                            <p className="leading-relaxed break-words"
                              dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                            />
                          </div>

                          {/* Reactions */}
                          {Object.keys(grouped).length > 0 && (
                            <div className={cn("flex flex-wrap gap-1 mt-1",
                              isMe && "justify-end")}>
                              {Object.entries(grouped).map(([emoji, users]: any) => (
                                <button key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className={cn(
                                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
                                    users.some((u: any) => u.id === userId)
                                      ? "bg-violet-500/30 border border-violet-500/50"
                                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                                  )}>
                                  <span>{emoji}</span>
                                  <span className="text-[#7c7ca8]">{users.length}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Hover Actions */}
                        <div className={cn(
                          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          "flex items-center gap-1 bg-[#1a1a2e] rounded-xl px-2 py-1",
                          "border border-[#2a2a4a] shadow-xl z-10",
                          isMe ? "right-10" : "left-10"
                        )}>
                          {/* Quick Emojis */}
                          {["👍","❤️","😂","🔥"].map(emoji => (
                            <button key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="text-sm hover:scale-125 transition-transform">
                              {emoji}
                            </button>
                          ))}
                          <div className="w-px h-4 bg-white/10 mx-1" />
                          {/* More Emojis */}
                          <button
                            onClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)}
                            className="btn-ghost p-0.5">
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                          {/* Reply */}
                          <button
                            onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                            className="btn-ghost p-0.5">
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Full Emoji Picker */}
                        <AnimatePresence>
                          {showEmoji === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={cn(
                                "absolute top-8 z-20 card-glass p-2 rounded-xl shadow-2xl",
                                "flex gap-1.5",
                                isMe ? "right-0" : "left-0"
                              )}
                              style={{ border: "1px solid rgba(139,92,246,0.2)" }}
                            >
                              {EMOJIS.map(emoji => (
                                <button key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="text-xl hover:scale-125 transition-transform">
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Input ── */}
              <div className="px-5 py-4 shrink-0"
                style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>

                {/* Reply Preview */}
                <AnimatePresence>
                  {replyTo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl mb-2"
                      style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Reply className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-xs text-violet-400 font-semibold">
                          Replying to {replyTo.user?.name}:
                        </span>
                        <span className="text-xs text-[#7c7ca8] truncate max-w-48">
                          {replyTo.content?.slice(0, 50)}
                        </span>
                      </div>
                      <button onClick={() => setReplyTo(null)}
                        className="text-[#7c7ca8] hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Box */}
                <div className="flex items-end gap-3 card-glass px-4 py-3 rounded-2xl"
                  style={{ border: "1px solid rgba(139,92,246,0.2)" }}>

                  {/* Attachment */}
                  <button className="btn-ghost p-1 shrink-0 mb-0.5">
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Text Input */}
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={e => {
                      setContent(e.target.value)
                      // Detect @ mention
                      const lastChar = e.target.value.slice(-1)
                      setMentioning(lastChar === "@")
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={`Message #${activeChannel.name}...`}
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-white placeholder-[#7c7ca8]
                      outline-none resize-none max-h-32"
                    style={{ lineHeight: "1.5" }}
                  />

                  {/* Mention */}
                  <button
                    onClick={() => setContent(prev => prev + "@")}
                    className="btn-ghost p-1 shrink-0 mb-0.5">
                    <AtSign className="w-4 h-4" />
                  </button>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!content.trim() || sending}
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all mb-0.5",
                      content.trim()
                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                        : "bg-white/5 text-[#7c7ca8] cursor-not-allowed"
                    )}>
                    {sending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* Mention Picker */}
                <AnimatePresence>
                  {mentioning && members.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-24 left-5 right-5 card-glass rounded-xl shadow-2xl overflow-hidden z-20"
                      style={{ border: "1px solid rgba(139,92,246,0.2)" }}
                    >
                      <p className="px-3 py-2 text-[10px] font-bold text-[#7c7ca8] uppercase tracking-wider"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        Mention someone
                      </p>
                      {members.map((m: any, i: number) => (
                        <button key={m.userId}
                          onClick={() => {
                            const name = m.user.name?.split(" ")[0] || "user"
                            setContent(prev => prev.slice(0, -1) + `@${name} `)
                            setMentioning(false)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5
                            hover:bg-white/5 transition-colors">
                          <div className={cn(
                            "w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center",
                            "text-[10px] font-bold text-white shrink-0",
                            AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                          )}>
                            {getInitials(m.user.name)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">{m.user.name}</p>
                            <p className="text-xs text-[#7c7ca8]">{m.user.email}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}