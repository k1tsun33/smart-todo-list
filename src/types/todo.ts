export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD format
  dueTime?: string; // HH:mm format (optional)
  priority: PriorityLevel;
  category: string;
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  reminderMinutesBefore?: number; // e.g. 0, 15, 60, 1440
  notified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type ViewFilter = 
  | 'all' 
  | 'today' 
  | 'upcoming' 
  | 'overdue' 
  | 'high_priority' 
  | 'completed';

export type SortOption = 
  | 'dueDate_asc' 
  | 'dueDate_desc' 
  | 'priority_desc' 
  | 'title_asc'
  | 'createdAt_desc';

export interface CrudLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  entity: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  taskId: string;
  title: string;
  message: string;
  type: 'overdue' | 'due_soon' | 'reminder';
  timestamp: string;
  read: boolean;
}
