import { useState } from "react";
import { TaskInput } from "@/components/TaskInput";
import { TaskList } from "@/components/TaskList";
import { Task, Settings } from "@/types/Task";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface HomePageProps {
  onStartPomodoro: (taskId: string) => void;
  settings: Settings;
}

export const HomePage = ({ onStartPomodoro, settings }: HomePageProps) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      pomodoroCount: 0,
    };
    setTasks([...tasks, newTask]);
  };

  const editTask = (id: string, title: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, title } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            {getGreeting()}{settings.userName ? `, ${settings.userName}` : ''}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Ready to boost your productivity? Let's focus together.
          </p>
        </div>

        <div className="card-glow p-8 rounded-xl border border-border/50">
          <h2 className="text-2xl font-semibold mb-6">Your Tasks</h2>
          <TaskInput onAddTask={addTask} />
          <TaskList
            tasks={tasks}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
            onStartPomodoro={onStartPomodoro}
          />
        </div>
      </div>
    </div>
  );
};