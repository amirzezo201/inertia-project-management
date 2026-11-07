import type { LucideIcon } from "lucide-react"

export interface Auth {
  user: User
  session: Pick<Session, "id">
}

export interface BreadcrumbItem {
  title: string
  href: string
}

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon | null
  isActive?: boolean
}

export interface FlashData {
  alert?: string
  notice?: string
}

export interface SharedProps {
  auth: Auth
  // Projects listed in the navigator sidebar (null when signed out).
  sidebar_projects: Project[] | null
  // Loaded on demand by the "New task" dialog (an optional prop).
  task_form?: TaskFormOptions
}

export interface TaskFormOptions {
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  verified: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown // This allows for additional properties...
}

export interface Session {
  id: number
  user_agent: string
  ip_address: string
  created_at: string
}

export interface UserSummary {
  id: number
  name: string
}

export interface Project {
  id: number
  name: string
  identifier: string
  description: string | null
  default_assignee_id: number | null
  default_status_id: number | null
  created_at: string
}

export type StatusCategory =
  | "backlog"
  | "unstarted"
  | "started"
  | "completed"
  | "canceled"

export interface Status {
  id: number
  project_id: number
  name: string
  category: StatusCategory
  color: string | null
  position: number
}

export type MilestoneStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "canceled"

export interface Milestone {
  id: number
  project_id: number
  name: string
  description: string | null
  status: MilestoneStatus
  start_date: string | null
  target_date: string | null
  color: string | null
  tasks_count: number
  completed_tasks_count: number
}

export type TaskPriority = "no_priority" | "urgent" | "high" | "medium" | "low"

export interface Task {
  id: number
  project_id: number
  parent_id: number | null
  status_id: number
  milestone_id: number | null
  assignee_id: number | null
  creator_id: number
  number: number
  identifier: string
  title: string
  description: string | null
  priority: TaskPriority
  start_date: string | null
  due_date: string | null
  estimation: number
  position: number
  subtasks_count: number
  created_at: string
  updated_at: string
}

// Lookup props sent with every project page.
export interface ProjectProps {
  project: Project
  statuses: Status[]
  milestones: Milestone[]
  users: UserSummary[]
}

export interface Comment {
  id: number
  body: string
  creator_id: number
  edited_at: string | null
  created_at: string
}

// One entry in a task's activity feed (Huly's activity messages).
export interface ActivityEvent {
  id: number
  action:
    | "task_created"
    | "task_updated"
    | "task_subtask_added"
    | "comment_created"
  creator_id: number
  particulars: Record<string, string | number | null>
  created_at: string
  comment: Comment | null
}
