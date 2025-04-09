
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Task, Column, KanbanState, SprintData } from '@/types/kanban';

// Default data
const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'inprogress', title: 'In Progress', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] }
];

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Research competitor products',
    description: 'Check out what other products in the space are doing',
    priority: 'medium',
    status: 'backlog'
  },
  {
    id: '2',
    title: 'Design new landing page',
    description: 'Create wireframes for the redesigned landing page',
    priority: 'high',
    status: 'backlog'
  },
  {
    id: '3',
    title: 'Fix login page responsiveness',
    description: 'Current login page breaks on mobile devices',
    priority: 'medium',
    status: 'backlog'
  },
  {
    id: '4',
    title: 'Implement dark mode',
    description: 'Add toggle for dark/light themes',
    priority: 'low',
    status: 'backlog'
  }
];

const defaultSprint: SprintData = {
  name: 'Sprint 1',
  columns: defaultColumns,
  isActive: false
};

const defaultState: KanbanState = {
  backlog: defaultTasks,
  sprint: defaultSprint
};

// Define the context type
interface KanbanContextType {
  kanbanState: KanbanState;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskToSprint: (taskId: string) => void;
  moveTaskToBacklog: (taskId: string) => void;
  moveTaskInSprint: (taskId: string, newStatus: string) => void;
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  startSprint: () => void;
}

// Create context
const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

// Provider component
export const KanbanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [kanbanState, setKanbanState] = useState<KanbanState>(defaultState);

  // Load from local storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('kanbanState');
    if (savedState) {
      try {
        setKanbanState(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to parse saved kanban state:', e);
      }
    }
  }, []);

  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem('kanbanState', JSON.stringify(kanbanState));
  }, [kanbanState]);

  // Generate a unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add a new task to backlog
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      status: task.status || 'backlog'
    };

    if (task.status && task.status !== 'backlog' && task.isInSprint) {
      // Add to a sprint column
      setKanbanState(prev => {
        const updatedColumns = prev.sprint.columns.map(col => {
          if (col.id === task.status) {
            return { ...col, tasks: [...col.tasks, newTask] };
          }
          return col;
        });
        
        return {
          ...prev,
          sprint: {
            ...prev.sprint,
            columns: updatedColumns
          }
        };
      });
      toast.success('Task added to sprint');
    } else {
      // Add to backlog
      setKanbanState(prev => ({
        ...prev,
        backlog: [...prev.backlog, newTask]
      }));
      toast.success('Task added to backlog');
    }
  };

  // Update an existing task
  const updateTask = (taskId: string, updatedTask: Partial<Task>) => {
    // Check if task is in backlog
    const isInBacklog = kanbanState.backlog.some(task => task.id === taskId);
    
    if (isInBacklog) {
      setKanbanState(prev => ({
        ...prev,
        backlog: prev.backlog.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      }));
    } else {
      // Must be in sprint
      setKanbanState(prev => {
        const updatedColumns = prev.sprint.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(task => 
            task.id === taskId ? { ...task, ...updatedTask } : task
          )
        }));
        
        return {
          ...prev,
          sprint: {
            ...prev.sprint,
            columns: updatedColumns
          }
        };
      });
    }
    toast.success('Task updated');
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    // Check if task is in backlog
    const isInBacklog = kanbanState.backlog.some(task => task.id === taskId);
    
    if (isInBacklog) {
      setKanbanState(prev => ({
        ...prev,
        backlog: prev.backlog.filter(task => task.id !== taskId)
      }));
    } else {
      // Must be in sprint
      setKanbanState(prev => {
        const updatedColumns = prev.sprint.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== taskId)
        }));
        
        return {
          ...prev,
          sprint: {
            ...prev.sprint,
            columns: updatedColumns
          }
        };
      });
    }
    toast.success('Task deleted');
  };

  // Move a task from backlog to sprint
  const moveTaskToSprint = (taskId: string) => {
    const task = kanbanState.backlog.find(t => t.id === taskId);
    if (!task) return;

    // Only move to sprint board if sprint is active
    if (kanbanState.sprint.isActive) {
      // Remove from backlog and add to first sprint column
      setKanbanState(prev => {
        const firstColumn = prev.sprint.columns[0];
        const updatedColumns = prev.sprint.columns.map((col, index) => {
          if (index === 0) {
            return {
              ...col,
              tasks: [...col.tasks, { ...task, status: col.id, isInSprint: true }]
            };
          }
          return col;
        });
        
        return {
          backlog: prev.backlog.filter(t => t.id !== taskId),
          sprint: {
            ...prev.sprint,
            columns: updatedColumns
          }
        };
      });
      toast.success('Task moved to sprint board');
    }
  };

  // Start the sprint (activate it)
  const startSprint = () => {
    setKanbanState(prev => ({
      ...prev,
      sprint: {
        ...prev.sprint,
        isActive: true
      }
    }));
    toast.success('Sprint started');
  };

  // Move a task from sprint to backlog
  const moveTaskToBacklog = (taskId: string) => {
    // Find the task in sprint columns
    let foundTask: Task | undefined;
    let foundColumnId: string | undefined;
    
    kanbanState.sprint.columns.forEach(col => {
      const task = col.tasks.find(t => t.id === taskId);
      if (task) {
        foundTask = task;
        foundColumnId = col.id;
      }
    });
    
    if (!foundTask || !foundColumnId) return;

    // Remove from sprint column and add to backlog
    setKanbanState(prev => {
      const updatedColumns = prev.sprint.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      }));
      
      return {
        backlog: [...prev.backlog, { ...foundTask!, status: 'backlog', isInSprint: false }],
        sprint: {
          ...prev.sprint,
          columns: updatedColumns
        }
      };
    });
    toast.success('Task moved to backlog');
  };

  // Move a task within sprint columns
  const moveTaskInSprint = (taskId: string, newStatus: string) => {
    // Find the task in sprint columns
    let foundTask: Task | undefined;
    let foundColumnId: string | undefined;
    
    kanbanState.sprint.columns.forEach(col => {
      const task = col.tasks.find(t => t.id === taskId);
      if (task) {
        foundTask = task;
        foundColumnId = col.id;
      }
    });
    
    if (!foundTask || !foundColumnId || foundColumnId === newStatus) return;

    // Move task between columns
    setKanbanState(prev => {
      const updatedColumns = prev.sprint.columns.map(col => {
        if (col.id === foundColumnId) {
          // Remove from source column
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== taskId)
          };
        }
        if (col.id === newStatus) {
          // Add to target column
          return {
            ...col,
            tasks: [...col.tasks, { ...foundTask!, status: newStatus }]
          };
        }
        return col;
      });
      
      return {
        ...prev,
        sprint: {
          ...prev.sprint,
          columns: updatedColumns
        }
      };
    });
  };

  // Add a new column
  const addColumn = (title: string) => {
    const newColumn: Column = {
      id: generateId(),
      title,
      tasks: []
    };

    setKanbanState(prev => ({
      ...prev,
      sprint: {
        ...prev.sprint,
        columns: [...prev.sprint.columns, newColumn]
      }
    }));
    toast.success('Column added');
  };

  // Update a column
  const updateColumn = (columnId: string, title: string) => {
    setKanbanState(prev => ({
      ...prev,
      sprint: {
        ...prev.sprint,
        columns: prev.sprint.columns.map(col => 
          col.id === columnId ? { ...col, title } : col
        )
      }
    }));
    toast.success('Column updated');
  };

  // Delete a column
  const deleteColumn = (columnId: string) => {
    // Find tasks in this column
    const tasksInColumn = kanbanState.sprint.columns.find(col => col.id === columnId)?.tasks || [];
    
    setKanbanState(prev => {
      // Move tasks to backlog
      const updatedBacklog = [...prev.backlog, ...tasksInColumn.map(task => ({
        ...task,
        status: 'backlog',
        isInSprint: false
      }))];
      
      return {
        backlog: updatedBacklog,
        sprint: {
          ...prev.sprint,
          columns: prev.sprint.columns.filter(col => col.id !== columnId)
        }
      };
    });
    toast.success('Column deleted and tasks moved to backlog');
  };

  const value = {
    kanbanState,
    addTask,
    updateTask,
    deleteTask,
    moveTaskToSprint,
    moveTaskToBacklog,
    moveTaskInSprint,
    addColumn,
    updateColumn,
    deleteColumn,
    startSprint
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};

// Custom hook for using the context
export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
