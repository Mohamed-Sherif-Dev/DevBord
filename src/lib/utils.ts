import { clsx, type ClassValue } from "clsx"
import { twMerge }               from "tailwind-merge"
import { TaskPriority, TaskStatus } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now  = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)

  if (mins < 1)   return "just now"
  if (mins < 60)  return `${mins}m ago`
  if (hrs  < 24)  return `${hrs}h ago`
  if (days < 7)   return `${days}d ago`
  return formatDate(date)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export const PRIORITY_CONFIG: Record<TaskPriority, {
  label: string; color: string; bg: string; border: string; dot: string
}> = {
  URGENT: { label: "Urgent", color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/20",    dot: "bg-red-400"    },
  HIGH:   { label: "High",   color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/20", dot: "bg-orange-400" },
  MEDIUM: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/20", dot: "bg-yellow-400" },
  LOW:    { label: "Low",    color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/20",  dot: "bg-green-400"  },
}

export const STATUS_CONFIG: Record<TaskStatus, {
  label: string; color: string; bg: string; dot: string
}> = {
  BACKLOG:     { label: "Backlog",     color: "text-gray-400",   bg: "bg-gray-500/15",   dot: "bg-gray-400"   },
  TODO:        { label: "To Do",       color: "text-blue-400",   bg: "bg-blue-500/15",   dot: "bg-blue-400"   },
  IN_PROGRESS: { label: "In Progress", color: "text-violet-400", bg: "bg-violet-500/15", dot: "bg-violet-400" },
  IN_REVIEW:   { label: "In Review",   color: "text-cyan-400",   bg: "bg-cyan-500/15",   dot: "bg-cyan-400"   },
  DONE:        { label: "Done",        color: "text-green-400",  bg: "bg-green-500/15",  dot: "bg-green-400"  },
  CANCELLED:   { label: "Cancelled",   color: "text-red-400",    bg: "bg-red-500/15",    dot: "bg-red-400"    },
}