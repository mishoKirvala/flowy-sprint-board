
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  status: string;
  isInSprint?: boolean;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface SprintData {
  name: string;
  columns: Column[];
}

export interface KanbanState {
  backlog: Task[];
  sprint: SprintData;
}
