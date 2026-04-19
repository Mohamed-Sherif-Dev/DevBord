import { create }  from "zustand"
import { persist } from "zustand/middleware"

interface UIStore {
  sidebarCollapsed:  boolean
  collapseSidebar:   () => void
  activeWorkspaceId: string | null
  setWorkspace:      (id: string) => void
  // ✅ ضيف دول
  showNewTaskModal:  boolean
  openNewTaskModal:  () => void
  closeNewTaskModal: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed:  false,
      collapseSidebar:   () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      activeWorkspaceId: null,
      setWorkspace:      (id) => set({ activeWorkspaceId: id }),
      // ✅ ضيف دول
      showNewTaskModal:  false,
      openNewTaskModal:  () => set({ showNewTaskModal: true  }),
      closeNewTaskModal: () => set({ showNewTaskModal: false }),
    }),
    { name: "devboard-ui" }
  )
)