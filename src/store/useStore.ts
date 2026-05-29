import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRICULUM } from '../data/curriculum';
import type {
  Achievement,
  FocusSession,
  Lesson,
  Module,
  NoteDoc,
  PlayerState,
  Task,
} from '../types';

export type Theme = 'dark' | 'light';

interface StoreState {
  theme: Theme;
  toggleTheme: () => void;

  modules: Module[];
  tasks: Task[];
  sessions: FocusSession[];
  notes: NoteDoc[];
  player: PlayerState;
  motivationIndex: number;

  // module/lesson ops
  updateLesson: (moduleId: string, lessonId: string, patch: Partial<Lesson>) => void;
  resetCurriculum: () => void;

  // tasks
  addTask: (title: string, priority?: Task['priority'], moduleId?: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;
  toggleTask: (id: string) => void;

  // sessions
  addSession: (s: Omit<FocusSession, 'id'>) => void;

  // notes
  addNote: (title: string, body?: string, moduleId?: string) => string;
  updateNote: (id: string, patch: Partial<NoteDoc>) => void;
  upsertNote: (n: Partial<NoteDoc> & { id?: string }) => string;
  removeNote: (id: string) => void;

  // player
  awardXP: (amount: number, reason?: string) => void;
  registerActivity: () => void;
  unlockAchievement: (a: Achievement) => void;
  updatePlayer: (patch: Partial<PlayerState>) => void;

  cycleMotivation: () => void;
}

const todayKey = () => new Date().toISOString().slice(0, 10);

const baseAchievements: Achievement[] = [
  { id: 'first-step', title: 'First Incision', description: 'Complete your first lesson.', icon: '◐' },
  { id: 'streak-3', title: 'Steady Pulse', description: 'Maintain a 3-day streak.', icon: '≋' },
  { id: 'streak-7', title: 'Surgeon’s Rhythm', description: 'Maintain a 7-day streak.', icon: '✦' },
  { id: 'focus-60', title: 'Deep Silence', description: 'Complete a 60-minute focus session.', icon: '◉' },
  { id: 'module-50', title: 'Halfway Through the Storm', description: 'Reach 50% in any module.', icon: '◓' },
  { id: 'module-100', title: 'Mastery', description: 'Complete an entire module.', icon: '✷' },
  { id: 'xp-1000', title: 'Cognitive Ascent', description: 'Reach 1000 XP.', icon: '✶' },
];

export const xpForLevel = (level: number) => 100 + (level - 1) * 60;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      modules: CURRICULUM,
      tasks: [],
      sessions: [],
      notes: [],
      motivationIndex: 0,
      player: {
        name: 'Doctor',
        title: 'Practicing Physician',
        xp: 0,
        level: 1,
        streak: 0,
        achievements: baseAchievements,
      },

      updateLesson: (moduleId, lessonId, patch) =>
        set((s) => ({
          modules: s.modules.map((m) =>
            m.id !== moduleId
              ? m
              : {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, ...patch, updatedAt: Date.now() } : l,
                  ),
                },
          ),
        })),
      resetCurriculum: () => set({ modules: CURRICULUM }),

      addTask: (title, priority = 'med', moduleId) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: crypto.randomUUID(),
              title,
              tags: [],
              priority,
              moduleId,
              recurrence: 'none',
              done: false,
              createdAt: Date.now(),
              order: s.tasks.length,
            },
          ],
        })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      reorderTasks: (ids) =>
        set((s) => ({
          tasks: ids
            .map((id, i) => {
              const t = s.tasks.find((x) => x.id === id);
              return t ? { ...t, order: i } : null;
            })
            .filter(Boolean) as Task[],
        })),
      toggleTask: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        if (!t) return;
        set((s) => ({ tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));
        if (!t.done) get().awardXP(8, 'task');
      },

      addSession: (s) => {
        set((st) => ({ sessions: [...st.sessions, { ...s, id: crypto.randomUUID() }] }));
        const minutes = Math.round(s.durationSec / 60);
        get().awardXP(Math.max(5, minutes), 'focus');
        if (minutes >= 60) {
          get().unlockAchievement(
            baseAchievements.find((a) => a.id === 'focus-60')!,
          );
        }
        get().registerActivity();
      },

      addNote: (title, body = '', moduleId) => {
        const id = crypto.randomUUID();
        set((s) => ({
          notes: [
            {
              id,
              title: title ?? 'Untitled note',
              body: body ?? '',
              moduleId,
              pinned: false,
              updatedAt: Date.now(),
            },
            ...s.notes,
          ],
        }));
        return id;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
        })),

      upsertNote: (n) => {
        const id = n.id ?? crypto.randomUUID();
        set((s) => {
          const exists = s.notes.find((x) => x.id === id);
          const next: NoteDoc = {
            id,
            title: n.title ?? exists?.title ?? 'Untitled note',
            body: n.body ?? exists?.body ?? '',
            moduleId: n.moduleId ?? exists?.moduleId,
            lessonId: n.lessonId ?? exists?.lessonId,
            pinned: n.pinned ?? exists?.pinned ?? false,
            updatedAt: Date.now(),
          };
          return {
            notes: exists ? s.notes.map((x) => (x.id === id ? next : x)) : [next, ...s.notes],
          };
        });
        return id;
      },

      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      awardXP: (amount) => {
        set((s) => {
          let xp = s.player.xp + amount;
          let level = s.player.level;
          while (xp >= xpForLevel(level)) {
            xp -= xpForLevel(level);
            level += 1;
          }
          const newAch = [...s.player.achievements];
          const xp1k = newAch.find((a) => a.id === 'xp-1000');
          if (xp1k && !xp1k.unlockedAt && s.player.xp + amount >= 1000) {
            xp1k.unlockedAt = Date.now();
          }
          return { player: { ...s.player, xp, level, achievements: newAch } };
        });
      },

      registerActivity: () => {
        set((s) => {
          const today = todayKey();
          if (s.player.lastActiveDay === today) return {};
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const streak =
            s.player.lastActiveDay === yesterday ? s.player.streak + 1 : 1;
          const next = { ...s.player, streak, lastActiveDay: today };
          const ach = [...next.achievements];
          if (streak >= 3) {
            const a = ach.find((x) => x.id === 'streak-3');
            if (a && !a.unlockedAt) a.unlockedAt = Date.now();
          }
          if (streak >= 7) {
            const a = ach.find((x) => x.id === 'streak-7');
            if (a && !a.unlockedAt) a.unlockedAt = Date.now();
          }
          next.achievements = ach;
          return { player: next };
        });
      },

      unlockAchievement: (a) =>
        set((s) => ({
          player: {
            ...s.player,
            achievements: s.player.achievements.map((x) =>
              x.id === a.id && !x.unlockedAt ? { ...x, unlockedAt: Date.now() } : x,
            ),
          },
        })),

      updatePlayer: (patch) =>
        set((s) => ({ player: { ...s.player, ...patch } })),

      cycleMotivation: () => set((s) => ({ motivationIndex: s.motivationIndex + 1 })),
    }),
    {
      name: 'medverse-store-v1',
      version: 2,
      migrate: (persisted: any, _version) => {
        // Ensure persisted shape has sensible defaults to avoid runtime crashes
        const next = persisted ?? {};
        next.modules = next.modules ?? CURRICULUM;
        next.tasks = next.tasks ?? [];
        next.sessions = next.sessions ?? [];
        next.notes = next.notes ?? [];
        next.motivationIndex = next.motivationIndex ?? 0;
        next.player = {
          name: 'Doctor',
          title: 'Practicing Physician',
          xp: 0,
          level: 1,
          streak: 0,
          achievements: baseAchievements,
          ...next.player,
        };
        return next;
      },
    },
  ),
);

// Derived helpers
export const selectModuleProgress = (m: Module) => {
  const total = m.lessons.length;
  if (!total) return { pct: 0, mastered: 0, studying: 0, revision: 0, todo: 0 };
  const mastered = m.lessons.filter((l) => l.status === 'mastered').length;
  const studying = m.lessons.filter((l) => l.status === 'studying').length;
  const revision = m.lessons.filter((l) => l.status === 'revision').length;
  const todo = m.lessons.filter((l) => l.status === 'todo').length;
  const pct = Math.round(
    ((mastered + studying * 0.5 + revision * 0.75) / total) * 100,
  );
  return { pct, mastered, studying, revision, todo };
};

export const selectOverallProgress = (modules: Module[]) => {
  const all = modules.flatMap((m) => m.lessons);
  const total = all.length || 1;
  const mastered = all.filter((l) => l.status === 'mastered').length;
  const studying = all.filter((l) => l.status === 'studying').length;
  const revision = all.filter((l) => l.status === 'revision').length;
  return Math.round(((mastered + studying * 0.5 + revision * 0.75) / total) * 100);
};
