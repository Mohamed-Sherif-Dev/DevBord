import Pusher       from "pusher"
import PusherClient from "pusher-js"

// Server — lazy init
export function getPusherServer() {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY    ||
    !process.env.PUSHER_SECRET
  ) {
    return null
  }
  return new Pusher({
    appId:   process.env.PUSHER_APP_ID,
    key:     process.env.PUSHER_KEY,
    secret:  process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || "eu",
    useTLS:  true,
  })
}

// Client — lazy init
export function getPusherClient() {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null
  return new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY,
    { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu" }
  )
}