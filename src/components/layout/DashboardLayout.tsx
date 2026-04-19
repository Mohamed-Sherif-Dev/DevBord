"use client"

import { motion }    from "framer-motion"
import Sidebar       from "./Sidebar"
import Topbar        from "./Topbar"
import { useUIStore } from "@/store/uiStore"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)

  return (
    <div className="min-h-screen" style={{ background: "#070710" }}>
      <Sidebar />
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col min-h-screen"
      >
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </motion.div>
    </div>
  )
}