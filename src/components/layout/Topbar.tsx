// "use client"

// import { useState }    from "react"
// import { usePathname } from "next/navigation"
// import { motion }      from "framer-motion"
// import {
//   Bell, Search, Sun, Moon, Plus,
//   Command, X
// } from "lucide-react"
// import { useTheme }   from "next-themes"
// import { useUIStore } from "@/store/uiStore"

// const TITLES: Record<string, string> = {
//   "/dashboard":       "Dashboard",
//   "/projects":        "Projects",
//   "/my-tasks":        "My Tasks",
//   "/team":            "Team",
//   "/settings":        "Settings",
// }

// export default function Topbar() {
//   const pathname  = usePathname()
//   const { theme, setTheme } = useTheme()
//   const [search,  setSearch]  = useState("")
//   const [showSearch, setShowSearch] = useState(false)

//   const title = Object.entries(TITLES).find(([key]) =>
//     pathname === key || pathname.startsWith(key + "/")
//   )?.[1] || "DevBoard"

//   return (
//     <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
//       style={{ background: "rgba(7,7,16,0.9)", borderBottom: "1px solid rgba(139,92,246,0.1)", backdropFilter: "blur(12px)" }}>

//       <div>
//         <h1 className="text-lg font-black text-white">{title}</h1>
//         <p className="text-xs text-[#7c7ca8] hidden sm:block">
//           {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
//         </p>
//       </div>

//       <div className="flex items-center gap-2">
//         {/* Search */}
//         {showSearch ? (
//           <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }}
//             className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
//             <input
//               autoFocus
//               type="text"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search tasks..."
//               className="input pl-9 pr-9 h-9"
//               onBlur={() => { if (!search) setShowSearch(false) }}
//             />
//             {search && (
//               <button onClick={() => { setSearch(""); setShowSearch(false) }}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
//                 <X className="w-3.5 h-3.5" />
//               </button>
//             )}
//           </motion.div>
//         ) : (
//           <button onClick={() => setShowSearch(true)}
//             className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-[#7c7ca8]
//               hover:border-violet-500/50 hover:text-white transition-all"
//             style={{ background: "rgba(18,18,42,0.8)", borderColor: "rgba(139,92,246,0.2)" }}>
//             <Search className="w-3.5 h-3.5" />
//             <span className="hidden sm:block">Search</span>
//             <span className="hidden sm:flex items-center gap-0.5 border border-white/10
//               rounded px-1 py-0.5 text-[10px]">
//               <Command className="w-2.5 h-2.5" />K
//             </span>
//           </button>
//         )}

//         {/* Theme */}
//         <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//           className="btn-ghost p-2.5">
//           <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }}
//             animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
//             {theme === "dark"
//               ? <Sun  className="w-4 h-4 text-yellow-400" />
//               : <Moon className="w-4 h-4" />
//             }
//           </motion.div>
//         </button>

//         {/* Notifications */}
//         <button className="btn-ghost p-2.5 relative">
//           <Bell className="w-4 h-4" />
//           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
//         </button>

//         {/* New Task */}
//         <button className="btn-primary text-xs px-3 py-2 hidden sm:flex">
//           <Plus className="w-3.5 h-3.5" />
//           New Task
//         </button>
//       </div>
//     </header>
//   )
// }

"use client"

import { useState }    from "react"
import { usePathname } from "next/navigation"
import { motion }      from "framer-motion"
import {
  Bell, Search, Sun, Moon, Plus,
  Command, X
} from "lucide-react"
import { useTheme }   from "next-themes"
import { useUIStore } from "@/store/uiStore"

const TITLES: Record<string, string> = {
  "/dashboard":       "Dashboard",
  "/projects":        "Projects",
  "/my-tasks":        "My Tasks",
  "/team":            "Team",
  "/settings":        "Settings",
}

export default function Topbar() {
  const pathname  = usePathname()
  const { theme, setTheme } = useTheme()
  const [search,     setSearch]     = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const { openNewTaskModal } = useUIStore()   // ✅

  const title = Object.entries(TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] || "DevBoard"

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30"
      style={{ background: "rgba(7,7,16,0.9)", borderBottom: "1px solid rgba(139,92,246,0.1)", backdropFilter: "blur(12px)" }}>

      <div>
        <h1 className="text-lg font-black text-white">{title}</h1>
        <p className="text-xs text-[#7c7ca8] hidden sm:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        {showSearch ? (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }}
            className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c7ca8]" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input pl-9 pr-9 h-9"
              onBlur={() => { if (!search) setShowSearch(false) }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setShowSearch(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c7ca8]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ) : (
          <button onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-[#7c7ca8]
              hover:border-violet-500/50 hover:text-white transition-all"
            style={{ background: "rgba(18,18,42,0.8)", borderColor: "rgba(139,92,246,0.2)" }}>
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Search</span>
            <span className="hidden sm:flex items-center gap-0.5 border border-white/10
              rounded px-1 py-0.5 text-[10px]">
              <Command className="w-2.5 h-2.5" />K
            </span>
          </button>
        )}

        {/* Theme */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="btn-ghost p-2.5">
          <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
            {theme === "dark"
              ? <Sun  className="w-4 h-4 text-yellow-400" />
              : <Moon className="w-4 h-4" />
            }
          </motion.div>
        </button>

        {/* Notifications */}
        <button className="btn-ghost p-2.5 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        {/* ✅ New Task Button */}
        <button
          onClick={openNewTaskModal}
          className="btn-primary text-xs px-3 py-2 hidden sm:flex">
          <Plus className="w-3.5 h-3.5" />
          New Task
        </button>
      </div>
    </header>
  )
}