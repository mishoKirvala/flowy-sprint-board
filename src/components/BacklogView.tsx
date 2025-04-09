
import React, { useState } from 'react';
import { useKanban } from '@/context/KanbanContext';
import { Task } from '@/types/kanban';
import TaskCard from './TaskCard';
import TaskDialog from './TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp, Play } from 'lucide-react';

const BacklogView: React.FC = () => {
  const { kanbanState, moveTaskToSprint, startSprint } = useKanban();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [sprintPlanningOpen, setSprintPlanningOpen] = useState(true);
  const [plannedTasks, setPlannedTasks] = useState<string[]>([]);

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleStartSprint = () => {
    // Move all planned tasks to sprint
    plannedTasks.forEach(taskId => {
      moveTaskToSprint(taskId);
    });
    
    // Start the sprint
    startSprint();
    
    // Clear planned tasks
    setPlannedTasks([]);
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
              Drag tasks here to add them to the sprint planning
            </div>
            
            <div 
              className="min-h-32 border-2 border-dashed border-kanban-soft-blue rounded-lg p-4 flex flex-col gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('taskId');
                if (taskId && !plannedTasks.includes(taskId)) {
                  setPlannedTasks([...plannedTasks, taskId]);
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
                      <div key={task.id}>
                        <TaskCard 
                          task={task} 
                          onEdit={() => handleEditTask(task)} 
                        />
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
        <Button onClick={handleAddTask} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
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
                  />
                </div>
              ))
          )}
        </div>
      </div>
      
      <TaskDialog 
        open={taskDialogOpen} 
        onOpenChange={setTaskDialogOpen} 
        task={selectedTask} 
      />
    </div>
  );
};

export default BacklogView;
