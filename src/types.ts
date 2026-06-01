export type LessonStatus = 'todo' | 'studying' | 'revision' | 'mastered';
export type Priority = 'low' | 'med' | 'high';

export interface Lesson {
  id: string;
  moduleId: string;
  index: number;
  title: string;
  subgroup?: string; // e.g. "Parasitologie" vs "Mycologie"
  status: LessonStatus;
  confidence: number; // 0..5
  durationMin: number; // minutes studied
  priority: Priority;
  notes: string;
  revisions: number;
  pinned?: boolean;
  updatedAt: number;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  short: string;
  color: string; // hex/tw token
  accent: string;
  examDate?: string; // ISO
  description?: string;
  lessons: Lesson[];
}

export type TaskRecurrence = 'none' | 'daily' | 'weekly';

export interface Task {
  id: string;
  title: string;
  tags: string[];
  priority: Priority;
  dueDate?: string;
  recurrence: TaskRecurrence;
  done: boolean;
  color?: string;
  createdAt: number;
  order: number;
  moduleId?: string;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  mode: 'pomodoro' | 'deep';
  moduleId?: string;
  lessonId?: string;
  label?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date YYYY-MM-DD
  time?: string; // optional time HH:MM
  durationMin?: number;
  notes?: string;
  color?: string; // optional hex color
  moduleId?: string; // optional link to a module
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
  icon: string;
}

export interface PlayerState {
  name: string;
  title: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDay?: string; // YYYY-MM-DD
  achievements: Achievement[];
  /** Data URL for the user's avatar (square PNG/JPEG). Falls back to first letter when absent. */
  avatar?: string;
  /** Wallpaper preset id from data/wallpapers.ts. Use 'default' for the original ambient. */
  background?: string;
}

export interface NoteDoc {
  id: string;
  title: string;
  body: string;
  moduleId?: string;
  lessonId?: string;
  pinned: boolean;
  updatedAt: number;
}
