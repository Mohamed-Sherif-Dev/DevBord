import { Ratelimit }    from "@upstash/ratelimit"
import { Redis }        from "@upstash/redis"
import { headers }      from "next/headers"
import { createHash }   from "crypto"

// Rate limiters
const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix:  "rl:login",
})

export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix:  "rl:api",
})

export const emailRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix:  "rl:email",
})

// Get client IP
export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown"
  )
}

// Hash sensitive data
export function hashData(data: string): string {
  return createHash("sha256").update(data).digest("hex")
}

// Sanitize HTML input
export function sanitizeHtml(html: string): string {
  // Remove dangerous tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
}

// Validate password strength
export function validatePassword(password: string): {
  valid: boolean; errors: string[]
} {
  const errors: string[] = []
  if (password.length < 8)            errors.push("At least 8 characters")
  if (!/[A-Z]/.test(password))        errors.push("One uppercase letter")
  if (!/[0-9]/.test(password))        errors.push("One number")
  if (!/[!@#$%^&*]/.test(password))   errors.push("One special character")
  return { valid: errors.length === 0, errors }
}