
import React from 'react';
import { Task } from '@/types/kanban';
import { useKanban } from '@/context/KanbanContext';
import { 
  Edit, 
  Trash, 
  ArrowUp, 
  ArrowRight, 
  ArrowDown,
  ArrowLeft,
  User
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { deleteTask, moveTaskToBacklog, moveTaskToSprint } = useKanban();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-300';
    }
  };

  const moveToSprint = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveTaskToSprint(task.id);
  };

  const moveToBacklog = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveTaskToBacklog(task.id);
  };

  return (
    <div 
      className="task-card cursor-grab active:cursor-grabbing" 
      onClick={onEdit}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium truncate flex-1">{task.title}</div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 -mr-2">
            <span className="sr-only">Task Actions</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-slate-500"
            >
              <path
                d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {task.status === 'backlog' ? (
              <DropdownMenuItem onClick={moveToSprint}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Move to Sprint
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={moveToBacklog}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Move to Backlog
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-500">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {task.description && (
        <div className="text-sm text-slate-500 mb-2 line-clamp-2">{task.description}</div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          {task.priority && (
            <span className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
          )}
          {task.assignee && (
            <div className="flex items-center">
              <Avatar className="h-6 w-6 text-xs">
                <AvatarFallback className="bg-kanban-soft-blue text-kanban-purple">
                  {task.assignee.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
