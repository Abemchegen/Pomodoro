import { CheckCircle, Calendar, Clock } from "lucide-react";
import { Task } from "@/types/Task";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const CompletedTasksPage = () => {
  const [tasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);
  const completedTasks = tasks.filter(task => task.completed);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">Completed Tasks</h1>
          <p className="text-xl text-muted-foreground">
            Celebrate your achievements and track your progress
          </p>
        </div>

        {completedTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              No completed tasks yet. Start your first pomodoro session!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div key={task.id} className="card-glow p-6 rounded-xl border border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {task.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{task.pomodoroCount} pomodoros</span>
                      </div>
                      {task.completedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Completed on {formatDate(new Date(task.completedAt))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-success">
                      {task.pomodoroCount * 25}min
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Focus time
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="card-glow p-6 rounded-xl border border-border/50 text-center">
              <h3 className="text-xl font-semibold mb-4">Your Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-success mb-1">
                    {completedTasks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Completed
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {completedTasks.reduce((sum, task) => sum + task.pomodoroCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Pomodoros
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-1">
                    {completedTasks.reduce((sum, task) => sum + task.pomodoroCount, 0) * 25}min
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Focus Time
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};