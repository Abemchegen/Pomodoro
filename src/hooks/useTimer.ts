import { useState, useEffect, useRef } from 'react';
import { TimerState } from '@/types/Task';

interface UseTimerProps {
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  onComplete: () => void;
}

export function useTimer({ pomodoroLength, shortBreakLength, longBreakLength, onComplete }: UseTimerProps) {
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: pomodoroLength * 60,
    isRunning: false,
    phase: 'pomodoro',
    sessionCount: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timer.isRunning && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (timer.timeLeft === 0) {
      onComplete();
      handlePhaseComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.timeLeft, onComplete]);

  const handlePhaseComplete = () => {
    setTimer(prev => {
      const newSessionCount = prev.phase === 'pomodoro' ? prev.sessionCount + 1 : prev.sessionCount;
      let nextPhase: 'pomodoro' | 'shortBreak' | 'longBreak';
      let nextDuration: number;

      if (prev.phase === 'pomodoro') {
        if (newSessionCount % 4 === 0) {
          nextPhase = 'longBreak';
          nextDuration = longBreakLength * 60;
        } else {
          nextPhase = 'shortBreak';
          nextDuration = shortBreakLength * 60;
        }
      } else {
        nextPhase = 'pomodoro';
        nextDuration = pomodoroLength * 60;
      }

      return {
        timeLeft: nextDuration,
        isRunning: false,
        phase: nextPhase,
        sessionCount: newSessionCount,
      };
    });
  };

  const startTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    setTimer(prev => ({
      ...prev,
      timeLeft: prev.phase === 'pomodoro' ? pomodoroLength * 60 :
                prev.phase === 'shortBreak' ? shortBreakLength * 60 :
                longBreakLength * 60,
      isRunning: false,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timer,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
  };
}