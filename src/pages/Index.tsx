import { useState } from "react";
import { HomePage } from "./HomePage";
import { PomodoroPage } from "./PomodoroPage";
import { SettingsPage } from "./SettingsPage";
import { CompletedTasksPage } from "./CompletedTasksPage";
import { Navigation } from "@/components/Navigation";
import { Settings } from "@/types/Task";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [settings, setSettings] = useLocalStorage<Settings>('pomodoro-settings', {
    userName: '',
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
  });

  const handleStartPomodoro = (taskId: string) => {
    setCurrentTaskId(taskId);
    setCurrentPage('pomodoro');
    toast({
      title: "Pomodoro Started!",
      description: "Focus time begins now. Good luck!",
    });
  };

  const handleTaskComplete = () => {
    setCurrentTaskId(null);
    setCurrentPage('home');
    toast({
      title: "Task Completed!",
      description: "Great job! Take a moment to celebrate your achievement.",
    });
  };

  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onStartPomodoro={handleStartPomodoro}
            settings={settings}
          />
        );
      case 'pomodoro':
        return (
          <PomodoroPage
            currentTaskId={currentTaskId}
            settings={settings}
            onTaskComplete={handleTaskComplete}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'completed':
        return <CompletedTasksPage />;
      default:
        return (
          <HomePage
            onStartPomodoro={handleStartPomodoro}
            settings={settings}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="pt-0">
        {renderPage()}
      </div>
    </div>
  );
};

export default Index;
