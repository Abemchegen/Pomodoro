import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";
import { Task, Settings } from "@/types/Task";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const PomodoroPage = ({ currentTaskId, settings, onTaskComplete }) => {
  const [tasks, setTasks] = useLocalStorage("pomodoro-tasks", []);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  // Fetch tracks from public folder
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const res = await fetch("/data/tracks.json");
        const data = await res.json();
        setTracks(data);
        if (data.length && audioRef.current) {
          audioRef.current.src = data[0].audio;
          if (musicPlaying) audioRef.current.play().catch(console.error);
        }
      } catch (err) {
        console.error("Failed to load music", err);
      }
    };
    fetchMusic();
  }, []);

  // Auto-play on track change
  useEffect(() => {
    if (tracks.length === 0 || !audioRef.current) return;
    audioRef.current.src = tracks[currentTrackIndex].audio;
    if (musicPlaying) audioRef.current.play().catch(console.error);
  }, [currentTrackIndex, tracks, musicPlaying]);

  const currentTask = currentTaskId
    ? tasks.find((t) => t.id === currentTaskId)
    : null;

  const { timer, startTimer, pauseTimer, resetTimer, formatTime } = useTimer({
    pomodoroLength: settings.pomodoroLength,
    shortBreakLength: settings.shortBreakLength,
    longBreakLength: settings.longBreakLength,
    onComplete: () => {
      if (timer.phase === "pomodoro" && currentTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === currentTaskId
              ? { ...task, pomodoroCount: task.pomodoroCount + 1 }
              : task
          )
        );
      }
    },
  });

  const handleCompleteTask = () => {
    if (currentTask) {
      setTasks((prev) =>
        prev.map((task) =>
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
      case "pomodoro":
        return { text: "Focus Time", color: "text-primary" };
      case "shortBreak":
        return { text: "Short Break", color: "text-success" };
      case "longBreak":
        return { text: "Long Break", color: "text-accent" };
      default:
        return { text: "", color: "" };
    }
  };

  const phaseDisplay = getPhaseDisplay();
  const progress =
    timer.phase === "pomodoro"
      ? ((settings.pomodoroLength * 60 - timer.timeLeft) /
          (settings.pomodoroLength * 60)) *
        100
      : timer.phase === "shortBreak"
      ? ((settings.shortBreakLength * 60 - timer.timeLeft) /
          (settings.shortBreakLength * 60)) *
        100
      : ((settings.longBreakLength * 60 - timer.timeLeft) /
          (settings.longBreakLength * 60)) *
        100;

  return (
    <div className="min-h-screen p-6">
      <audio ref={audioRef} loop />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-semibold ${phaseDisplay.color} mb-2`}>
            {phaseDisplay.text}
          </h2>
          {currentTask && (
            <div className="space-y-2">
              <p className="text-lg text-foreground">
                Working on:{" "}
                <span className="font-medium">{currentTask.title}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Pomodoros completed for this task:{" "}
                <span className="font-medium text-primary">
                  {currentTask.pomodoroCount}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Timer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="timer-glow p-16 rounded-3xl border border-border/50 text-center">
              <div className="relative mb-8">
                <div className="w-64 h-64 mx-auto rounded-full border-4 border-border/20 relative">
                  <div
                    className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary transition-all duration-1000"
                    style={{
                      background: `conic-gradient(hsl(var(--primary)) ${progress}%, transparent ${progress}%)`,
                      clipPath: "circle(50%)",
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
                >
                  {timer.isRunning ? (
                    <Pause className="h-5 w-5 mr-2" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {timer.isRunning ? "Pause" : "Start"}
                </Button>
                <Button onClick={resetTimer} size="lg" variant="outline">
                  <RotateCcw className="h-5 w-5 mr-2" /> Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <div className="card-glow p-6 rounded-xl border border-border/50 text-center">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="space-y-3">
                <div className="flex justify-between gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentTrackIndex(
                        (prev) => (prev - 1 + tracks.length) % tracks.length
                      )
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
                    }
                  >
                    Next
                  </Button>
                </div>

                {tracks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {tracks[currentTrackIndex].title} -{" "}
                    {tracks[currentTrackIndex].user}
                  </p>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMusicPlaying(!musicPlaying)}
                  className="w-full mt-2"
                >
                  {musicPlaying ? (
                    <Volume2 className="h-4 w-4 mr-2" />
                  ) : (
                    <VolumeX className="h-4 w-4 mr-2" />
                  )}
                  {musicPlaying ? "Pause Music" : "Play Music"}
                </Button>

                {currentTask && timer.phase === "pomodoro" && (
                  <Button
                    onClick={handleCompleteTask}
                    className="bg-success hover:bg-success/90 text-white w-full mt-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Complete Task
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
