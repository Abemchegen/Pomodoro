import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, CheckCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";
import { Task, Settings } from "@/types/Task";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface PomodoroPageProps {
  currentTaskId: string | null;
  settings: Settings;
  onTaskComplete: () => void;
}

export const PomodoroPage = ({ currentTaskId, settings, onTaskComplete }: PomodoroPageProps) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [audio] = useState(() => {
    const audioElement = new Audio();
    audioElement.src = "https://www.soundjay.com/misc/sounds/clock-ticking-5.wav"; // Placeholder - would use a real cafe music URL
    audioElement.loop = true;
    audioElement.volume = 0.3;
    return audioElement;
  });

  const currentTask = currentTaskId ? tasks.find(t => t.id === currentTaskId) : null;

  const { timer, startTimer, pauseTimer, resetTimer, formatTime } = useTimer({
    pomodoroLength: settings.pomodoroLength,
    shortBreakLength: settings.shortBreakLength,
    longBreakLength: settings.longBreakLength,
    onComplete: () => {
      if (timer.phase === 'pomodoro' && currentTask) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === currentTaskId 
              ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
              : task
          )
        );
      }
    },
  });

  useEffect(() => {
    if (musicPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [musicPlaying, audio]);

  const handleCompleteTask = () => {
    if (currentTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === currentTaskId 
            ? { ...task, completed: true, completedAt: new Date() }
            : task
        )
      );
      onTaskComplete();
    }
  };

  const getPhaseDisplay = () => {
    switch (timer.phase) {
      case 'pomodoro':
        return { text: 'Focus Time', color: 'text-primary' };
      case 'shortBreak':
        return { text: 'Short Break', color: 'text-success' };
      case 'longBreak':
        return { text: 'Long Break', color: 'text-accent' };
    }
  };

  const phaseDisplay = getPhaseDisplay();
  const progress = timer.phase === 'pomodoro' 
    ? ((settings.pomodoroLength * 60 - timer.timeLeft) / (settings.pomodoroLength * 60)) * 100
    : timer.phase === 'shortBreak'
    ? ((settings.shortBreakLength * 60 - timer.timeLeft) / (settings.shortBreakLength * 60)) * 100
    : ((settings.longBreakLength * 60 - timer.timeLeft) / (settings.longBreakLength * 60)) * 100;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with task info and stats */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-semibold ${phaseDisplay.color} mb-2`}>
            {phaseDisplay.text}
          </h2>
          {currentTask && (
            <div className="space-y-2">
              <p className="text-lg text-foreground">
                Working on: <span className="font-medium">{currentTask.title}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Pomodoros completed for this task: <span className="font-medium text-primary">{currentTask.pomodoroCount}</span>
              </p>
            </div>
          )}
        </div>

        {/* Timer section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Timer circle */}
          <div className="lg:col-span-2">
            <div className="timer-glow p-16 rounded-3xl border border-border/50 text-center">
              <div className="relative mb-8">
                <div className="w-64 h-64 mx-auto rounded-full border-4 border-border/20 relative">
                  <div 
                    className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary transition-all duration-1000"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) ${progress}%, transparent ${progress}%)`,
                      clipPath: 'circle(50%)',
                    }}
                  />
                  <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-foreground">
                      {formatTime(timer.timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <Button
                  onClick={timer.isRunning ? pauseTimer : startTimer}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  {timer.isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {timer.isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  onClick={resetTimer}
                  size="lg"
                  variant="outline"
                  className="px-8"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Side panel with controls and stats */}
          <div className="space-y-6">
            <div className="card-glow p-6 rounded-xl border border-border/50 text-center">
              <h3 className="text-lg font-semibold mb-4">Session Info</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {timer.sessionCount + 1}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Session
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-accent mb-1">
                    {timer.sessionCount % 4 === 3 ? 'Long break next!' : `${3 - (timer.sessionCount % 4)} until long break`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Break Status
                  </div>
                </div>
              </div>
            </div>

            <div className="card-glow p-6 rounded-xl border border-border/50 text-center">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMusicPlaying(!musicPlaying)}
                  className="w-full"
                >
                  {musicPlaying ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                  {musicPlaying ? 'Pause Music' : 'Play Music'}
                </Button>
                
                {currentTask && timer.phase === 'pomodoro' && (
                  <Button
                    onClick={handleCompleteTask}
                    className="bg-success hover:bg-success/90 text-white w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Task
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};