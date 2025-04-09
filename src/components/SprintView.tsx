
import React, { useState } from 'react';
import { useKanban } from '@/context/KanbanContext';
import { Task, Column as ColumnType } from '@/types/kanban';
import TaskCard from './TaskCard';
import TaskDialog from './TaskDialog';
import ColumnHeader from './ColumnHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const SprintView: React.FC = () => {
  const { kanbanState, moveTaskInSprint, addColumn } = useKanban();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setAddColumnDialogOpen(false);
    }
  };

  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTaskInSprint(taskId, columnId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          {kanbanState.sprint.name}
          {kanbanState.sprint.isActive ? (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Active
            </span>
          ) : (
            <span className="text-xs bg-orange-400 text-white px-2 py-0.5 rounded-full">
              Planning
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <Button onClick={handleAddTask} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
          <Button 
            onClick={() => setAddColumnDialogOpen(true)} 
            variant="outline" 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Column
          </Button>
        </div>
      </div>
      
      {!kanbanState.sprint.isActive ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-400 mb-4">Sprint has not been started yet.</p>
            <p className="text-slate-400 mb-4">Add tasks to Sprint Planning and start the sprint from the Backlog view.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="flex gap-4 h-full pb-4">
            {kanbanState.sprint.columns.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-slate-400 mb-4">No columns yet.</p>
                  <Button 
                    onClick={() => setAddColumnDialogOpen(true)} 
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Column
                  </Button>
                </div>
              </div>
            ) : (
              kanbanState.sprint.columns.map((column) => (
                <div 
                  key={column.id} 
                  className="board-column"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleColumnDrop(e, column.id)}
                >
                  <ColumnHeader 
                    columnId={column.id} 
                    title={column.title} 
                    taskCount={column.tasks.length} 
                  />
                  
                  <div className="flex-1 flex flex-col gap-3">
                    {column.tasks.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="text-sm text-slate-400 p-4 text-center">
                          Drop tasks here
                        </p>
                      </div>
                    ) : (
                      column.tasks.map((task) => (
                        <div key={task.id}>
                          <TaskCard 
                            task={task} 
                            onEdit={() => handleEditTask(task)} 
                          />
                        </div>
                      ))
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleAddTask} 
                    variant="ghost" 
                    className="w-full justify-start text-slate-500 hover:text-kanban-purple"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              ))
            )}
            
            {/* Add Column Button for non-empty boards */}
            {kanbanState.sprint.columns.length > 0 && (
              <div className="min-w-[260px] w-[260px] flex items-center justify-center">
                <Button 
                  onClick={() => setAddColumnDialogOpen(true)} 
                  variant="outline" 
                  className="w-full justify-center border-dashed"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Column
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <TaskDialog 
        open={taskDialogOpen} 
        onOpenChange={setTaskDialogOpen} 
        task={selectedTask}
        isSprintView={true}
      />
      
      <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="e.g., In Review"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setAddColumnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddColumn}
              disabled={!newColumnTitle.trim()}
            >
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SprintView;
