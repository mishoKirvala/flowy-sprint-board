import React, { useState } from 'react';
import { useKanban } from '@/context/KanbanContext';
import { Task } from '@/types/kanban';
import TaskCard from './TaskCard';
import TaskDialog from './TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { toast } from 'sonner';

const BacklogView: React.FC = () => {
  const { kanbanState, moveTaskToSprint, startSprint } = useKanban();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [sprintPlanningOpen, setSprintPlanningOpen] = useState(true);
  const [plannedTasks, setPlannedTasks] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleStartSprint = () => {
    if (plannedTasks.length === 0) {
      toast.error("Add some tasks to sprint planning first");
      return;
    }
    
    // Move all planned tasks to sprint
    plannedTasks.forEach(taskId => {
      moveTaskToSprint(taskId);
    });
    
    // Start the sprint
    startSprint();
    
    // Clear planned tasks
    setPlannedTasks([]);
    toast.success("Sprint started successfully");
  };

  const handleTaskSelect = (taskId: string, isMultiSelect: boolean) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        // Deselect if already selected
        return prev.filter(id => id !== taskId);
      } else {
        // Select the task, clearing previous selections if not multi-select
        return isMultiSelect ? [...prev, taskId] : [taskId];
      }
    });
  };

  const handleAddToPlanning = (taskIds: string[]) => {
    const newPlannedTasks = [...plannedTasks];
    taskIds.forEach(taskId => {
      if (!newPlannedTasks.includes(taskId)) {
        newPlannedTasks.push(taskId);
      }
    });
    setPlannedTasks(newPlannedTasks);
    setSelectedTasks([]);
    toast.success(`${taskIds.length} task(s) added to sprint planning`);
  };

  const handleRemoveFromPlanning = (taskId: string) => {
    setPlannedTasks(prev => prev.filter(id => id !== taskId));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sprint Planning Section */}
      <div className="mb-6 border rounded-lg shadow-sm bg-white overflow-hidden">
        <div 
          className="bg-kanban-soft-blue p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setSprintPlanningOpen(!sprintPlanningOpen)}
        >
          <h2 className="text-lg font-medium flex items-center">
            <span className="mr-2">Sprint Planning</span>
            <span className="text-xs bg-kanban-purple text-white px-2 py-0.5 rounded-full">
              {kanbanState.sprint.name}
            </span>
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {sprintPlanningOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </div>
        
        {sprintPlanningOpen && (
          <div className="p-4 bg-slate-50 border-t">
            <div className="text-sm text-slate-500 mb-4">
              Drag tasks here or select multiple tasks and use the "Add to Sprint Planning" button
            </div>
            
            <div 
              className="min-h-32 border-2 border-dashed border-kanban-soft-blue rounded-lg p-4 flex flex-col gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                // Check if the dragged task is part of a multi-selection
                const taskId = e.dataTransfer.getData('taskId');
                const isSelected = e.dataTransfer.getData('isSelected') === 'true';
                
                if (taskId) {
                  if (isSelected && selectedTasks.length > 0) {
                    // If it's a selected task and we have multiple selections, add all selected
                    handleAddToPlanning(selectedTasks);
                  } else if (!plannedTasks.includes(taskId)) {
                    // Otherwise just add the single dragged task
                    handleAddToPlanning([taskId]);
                  }
                }
              }}
            >
              {plannedTasks.length === 0 ? (
                <div className="text-sm text-slate-400 font-medium text-center py-8">
                  Drop tasks here to plan for sprint
                </div>
              ) : (
                <>
                  {plannedTasks.map(taskId => {
                    const task = kanbanState.backlog.find(t => t.id === taskId);
                    if (!task) return null;
                    
                    return (
                      <div key={task.id} className="relative">
                        <TaskCard 
                          task={task} 
                          onEdit={() => handleEditTask(task)} 
                        />
                        <button 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromPlanning(task.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            
            {plannedTasks.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleStartSprint}
                  className="bg-kanban-purple hover:bg-kanban-purple/90"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Sprint
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Backlog Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <span className="mr-2">Backlog</span>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
            {kanbanState.backlog.length}
          </span>
        </h2>
        <div className="flex gap-2">
          {selectedTasks.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAddToPlanning(selectedTasks)}
            >
              Add {selectedTasks.length} to Sprint Planning
            </Button>
          )}
          <Button onClick={handleAddTask} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>
      
      <div className="pr-1">
        <div className="grid gap-3">
          {kanbanState.backlog.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No tasks in backlog. Add some tasks to get started!
            </div>
          ) : (
            kanbanState.backlog
              .filter(task => !plannedTasks.includes(task.id))
              .map((task) => (
                <div key={task.id}>
                  <TaskCard 
                    task={task} 
                    onEdit={() => handleEditTask(task)}
                    isSelected={selectedTasks.includes(task.id)}
                    onSelect={handleTaskSelect}
                  />
                </div>
              ))
          )}
        </div>
      </div>
      
      <TaskDialog 
        open={taskDialogOpen} 
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          // Clear selection when dialog closes to fix the issue with nothing being clickable
          if (!open) {
            setTimeout(() => {
              setSelectedTasks([]);
            }, 100);
          }
        }} 
        task={selectedTask} 
      />
    </div>
  );
};

export default BacklogView;
