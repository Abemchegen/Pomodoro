import { Edit, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/Task";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (id: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (taskId: string) => void;
}

export const TaskList = ({ tasks, onEditTask, onDeleteTask, onStartPomodoro }: TaskListProps) => {
  const pendingTasks = tasks.filter(task => !task.completed);

  if (pendingTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No tasks yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingTasks.map((task) => (
        <div key={task.id} className="card-glow p-4 rounded-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {task.pomodoroCount} pomodoros completed
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newTitle = prompt("Edit task:", task.title);
                  if (newTitle && newTitle.trim()) {
                    onEditTask(task.id, newTitle.trim());
                  }
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteTask(task.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onStartPomodoro(task.id)}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};