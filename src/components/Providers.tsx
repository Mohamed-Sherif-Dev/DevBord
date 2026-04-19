// "use client"

// import { ThemeProvider }                    from "next-themes"
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// import { SessionProvider }                  from "next-auth/react"
// import { Toaster }                          from "react-hot-toast"
// import { useState }                         from "react"

// export default function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient({
//     defaultOptions: { queries: { retry: 1, staleTime: 30 * 1000 } }
//   }))

//   return (
//     <SessionProvider>
//       <QueryClientProvider client={queryClient}>
//         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
//           {children}
//           <Toaster
//             position="bottom-right"
//             toastOptions={{
//               style: {
//                 background:   "#12122a",
//                 color:        "#f0f0ff",
//                 border:       "1px solid #1e1e3a",
//                 borderRadius: "12px",
//               },
//               success: { iconTheme: { primary: "#8b5cf6", secondary: "#fff" } },
//               error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
//             }}
//           />
//         </ThemeProvider>
//       </QueryClientProvider>
//     </SessionProvider>
//   )
// }

"use client"

import { ThemeProvider }                    from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider }                  from "next-auth/react"
import { Toaster }                          from "react-hot-toast"
import { useState }                         from "react"
import NewTaskModal                         from "./NewTaskModal"  // ✅

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30 * 1000 } }
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <NewTaskModal />  {/* ✅ */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background:   "#12122a",
                color:        "#f0f0ff",
                border:       "1px solid #1e1e3a",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#8b5cf6", secondary: "#fff" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}