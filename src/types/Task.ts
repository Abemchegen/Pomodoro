export interface Task {
  id: string;
  title: string;
  completed: boolean;
  pomodoroCount: number;
  completedAt?: Date;
}

export interface Settings {
  userName: string;
  pomodoroLength: number; // in minutes
  shortBreakLength: number; // in minutes
  longBreakLength: number; // in minutes
}

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  phase: 'pomodoro' | 'shortBreak' | 'longBreak';
  sessionCount: number;
}