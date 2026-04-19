import { create } from "zustand"
import { TaskStatus } from "@prisma/client"

interface Task {
  id:         string
  title:      string
  status:     TaskStatus
  priority:   string
  columnId?:  string
  order:      number
  assignee?:  { id: string; name: string; image: string } | null
  dueDate?:   string | null
  labels?:    any[]
  _count?:    { subtasks: number; comments: number }
}

interface TaskStore {
  tasks:       Record<string, Task[]>
  setTasks:    (projectId: string, tasks: Task[]) => void
  moveTask:    (taskId: string, newColumnId: string, newOrder: number, projectId: string) => void
  addTask:     (projectId: string, task: Task) => void
  updateTask:  (projectId: string, taskId: string, updates: Partial<Task>) => void
  removeTask:  (projectId: string, taskId: string) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},

  setTasks: (projectId, tasks) =>
    set(state => ({ tasks: { ...state.tasks, [projectId]: tasks } })),

  moveTask: (taskId, newColumnId, newOrder, projectId) =>
    set(state => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map(t =>
          t.id === taskId ? { ...t, columnId: newColumnId, order: newOrder } : t
        )
      }
    })),

  addTask: (projectId, task) =>
    set(state => ({
      tasks: {
        ...state.tasks,
        [projectId]: [task, ...(state.tasks[projectId] || [])]
      }
    })),

  updateTask: (projectId, taskId, updates) =>
    set(state => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).map(t =>
          t.id === taskId ? { ...t, ...updates } : t
        )
      }
    })),

  removeTask: (projectId, taskId) =>
    set(state => ({
      tasks: {
        ...state.tasks,
        [projectId]: (state.tasks[projectId] || []).filter(t => t.id !== taskId)
      }
    })),
}))