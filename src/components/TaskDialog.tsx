
import React, { useState, useEffect } from 'react';
import { Task } from '@/types/kanban';
import { useKanban } from '@/context/KanbanContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  isSprintView?: boolean;
}

// Sample team members - in a real app, this would come from a database
const teamMembers = [
  "John Doe",
  "Jane Smith",
  "Alex Johnson",
  "Sarah Williams",
  "Michael Brown"
];

const TaskDialog: React.FC<TaskDialogProps> = ({ 
  open, 
  onOpenChange, 
  task, 
  isSprintView = false 
}) => {
  const { addTask, updateTask, kanbanState } = useKanban();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState('');
  const [assignee, setAssignee] = useState<string | undefined>(undefined);

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status);
      setAssignee(task.assignee);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus(isSprintView ? kanbanState.sprint.columns[0]?.id || '' : 'backlog');
      setAssignee(undefined);
    }
  }, [task, open, isSprintView, kanbanState.sprint.columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description: description || undefined,
      priority,
      status,
      isInSprint: isSprintView,
      assignee: assignee === "unassigned" ? undefined : assignee
    };
    
    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {task ? 'Update task details below.' : 'Fill in the details for a new task.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={priority} 
                onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select 
                value={assignee || "unassigned"} 
                onValueChange={setAssignee}
              >
                <SelectTrigger id="assignee" className="w-full">
                  <SelectValue placeholder="Assign to team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isSprintView && kanbanState.sprint.columns.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={setStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {kanbanState.sprint.columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
