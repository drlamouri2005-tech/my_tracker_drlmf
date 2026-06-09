import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw, Square, Trash2 } from 'lucide-react';
import { useStore } from '../store';

const PRESETS = [
  { label: 'Deep focus', work: 50, break: 10 },
  { label: 'Classic', work: 25, break: 5 },
  { label: 'Long arc', work: 90, break: 20 },
];

export function Focus() {
  const { modules, addSession, awardXP, registerActivity, sessions, removeSession, tasks, addTask, toggleTask, removeTask } = useStore();
  const [preset, setPreset] = useState(0);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(PRESETS[0].work * 60);
  const [moduleId, setModuleId] = useState<string>('');
  const [lessonId, setLessonId] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low'|'med'|'high'>('med');
  const [taskModuleId, setTaskModuleId] = useState<string>('');
  const [taskLessonId, setTaskLessonId] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const startedAtRef = useRef<number | null>(null);

  const current = PRESETS[preset];
  const total = (mode === 'work' ? current.work : current.break) * 60;
  const progress = 1 - remaining / total;

  useEffect(() => {
    setRemaining((mode === 'work' ? current.work : current.break) * 60);
    setRunning(false);
    startedAtRef.current = null;
  }, [preset, mode, current.work, current.break]);

  useEffect(() => {
    setLessonId('');
  }, [moduleId]);

  useEffect(() => {
    setTaskLessonId('');
  }, [taskModuleId]);

  useEffect(() => {
    if (!running) return;
    if (import.meta.env.DEV) console.debug('Focus: starting interval, remaining=', remaining, 'mode=', mode);
    const t = setInterval(() => {
      setRemaining((r) => {
        if (import.meta.env.DEV) console.debug('Focus tick, remaining before=', r);
        if (r <= 1) {
          clearInterval(t);
          finishCycle();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    
  }, [running]);

  const finishCycle = () => {
    if (import.meta.env.DEV) console.debug('Focus.finishCycle called, mode=', mode, 'startedAtRef=', startedAtRef.current);
    if (mode === 'work' && startedAtRef.current) {
      const startedAt = startedAtRef.current;
      const endedAt = Date.now();
      const dur = Math.floor((endedAt - startedAt) / 1000);
      addSession({
        moduleId: moduleId || undefined,
        lessonId: lessonId || undefined,
        durationSec: dur,
        startedAt,
        endedAt,
        mode: 'pomodoro',
      });
      awardXP(Math.max(5, Math.floor(dur / 60) * 2), 'focus');
      registerActivity();
      startedAtRef.current = null;
    }
    setRunning(false);
    setMode(mode === 'work' ? 'break' : 'work');
  };

  const toggle = () => {
    if (import.meta.env.DEV) console.debug('Focus.toggle called, running=', running, 'mode=', mode, 'startedAtRef=', startedAtRef.current);
    if (!running) {
      if (!startedAtRef.current && mode === 'work') startedAtRef.current = Date.now();
      setRunning(true);
      if (import.meta.env.DEV) console.debug('Focus: started, startedAtRef=', startedAtRef.current);
    } else {
      setRunning(false);
      if (import.meta.env.DEV) console.debug('Focus: paused');
    }
  };

  const reset = () => {
    setRunning(false);
    setRemaining(total);
    startedAtRef.current = null;
  };

  const stop = () => {
    if (mode === 'work' && startedAtRef.current) {
      const startedAt = startedAtRef.current;
      const endedAt = Date.now();
      const dur = Math.floor((endedAt - startedAt) / 1000);
      if (dur > 30) {
        addSession({
          moduleId: moduleId || undefined,
          lessonId: lessonId || undefined,
          durationSec: dur,
          startedAt,
          endedAt,
          mode: 'pomodoro',
        });
        awardXP(Math.max(3, Math.floor(dur / 60) * 2), 'focus');
        registerActivity();
      }
    }
    reset();
  };

  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');

  const size = 360;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="space-y-8 pt-2">
      <div className="flex justify-end">
        <button
          onClick={() => setShowDebug((v) => !v)}
          className="btn-ghost text-xs px-2 py-1 mr-2"
          title="Toggle debug"
        >
          {showDebug ? 'Hide debug' : 'Show debug'}
        </button>
      </div>
      <div>
        <div className="label-mono mb-2">◓ FOCUS & TASKS</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Focus & Tasks</h1>
        <p className="mt-2 text-beige-100/55 max-w-xl">
          One block. One task. One mission. Focus on what matters and track tasks alongside sessions.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 hud-frame p-8 relative grid place-items-center overflow-hidden">
          <span className="corner-mark border-t border-l top-2 left-2" />
          <span className="corner-mark border-t border-r top-2 right-2" />
          <span className="corner-mark border-b border-l bottom-2 left-2" />
          <span className="corner-mark border-b border-r bottom-2 right-2" />

          <motion.div
            className="absolute inset-0 grid-bg opacity-30 mask-fade-b pointer-events-none"
            aria-hidden="true"
            animate={{ opacity: running ? [0.2, 0.4, 0.2] : 0.2 }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <defs>
                <linearGradient id="focusG" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#D9C7A7" />
                  <stop offset="100%" stopColor="#8C6B3A" />
                </linearGradient>
              </defs>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="rgba(217,199,167,0.08)"
                strokeWidth={stroke}
                fill="none"
              />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={mode === 'work' ? 'url(#focusG)' : '#6FB3B8'}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={c}
                animate={{ strokeDashoffset: c * (1 - progress) }}
                transition={{ duration: 0.6 }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="label-mono mb-2">
                  {mode === 'work' ? 'FOCUS BLOCK' : 'RECOVERY'}
                </div>
                <div className="font-display text-7xl md:text-8xl tabular-nums tracking-tight text-gradient-gold">
                  {mm}:{ss}
                </div>
                <div className="mt-3 text-[12px] text-beige-100/40 font-mono">
                  {current.label} · {current.work}/{current.break}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button onClick={reset} className="btn-ghost !px-3" title="Reset">
              <RotateCcw size={14} />
            </button>
            <button
              onClick={toggle}
              className="btn-primary !px-7 !py-3 text-base"
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : 'Begin'}
            </button>
            <button onClick={stop} className="btn-ghost !px-3" title="Stop & log">
              <Square size={14} />
            </button>
          </div>
        </div>

        {showDebug && (
          <div className="lg:col-span-12 mt-3 p-3 bg-ink-800/60 border border-beige-300/10 rounded-md text-sm text-beige-100">
            <div className="font-mono text-xs mb-2">Focus debug</div>
            <div>running: {String(running)}</div>
            <div>mode: {mode}</div>
            <div>preset: {PRESETS[preset].label} ({PRESETS[preset].work}/{PRESETS[preset].break})</div>
            <div>remaining: {remaining} sec</div>
            <div>startedAt: {startedAtRef.current ?? 'null'}</div>
            <div>progress: {(progress * 100).toFixed(1)}%</div>
          </div>
        )}

        <div className="lg:col-span-5 space-y-5">
          <div className="hud-frame p-5 relative">
            <span className="corner-mark border-t border-l top-2 left-2" />
            <span className="corner-mark border-t border-r top-2 right-2" />
            <span className="corner-mark border-b border-l bottom-2 left-2" />
            <span className="corner-mark border-b border-r bottom-2 right-2" />
            <div className="label-mono mb-3">PROTOCOL</div>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(i)}
                  className={`p-3 rounded-xl border text-left transition ${
                    i === preset
                      ? 'border-beige-300/40 bg-beige-300/[0.06]'
                      : 'border-beige-300/[0.08] hover:border-beige-300/20'
                  }`}
                >
                  <div className="font-display text-base">{p.label}</div>
                  <div className="label-mono mt-1">
                    {p.work}/{p.break}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="hud-frame p-5 relative">
            <span className="corner-mark border-t border-l top-2 left-2" />
            <span className="corner-mark border-t border-r top-2 right-2" />
            <span className="corner-mark border-b border-l bottom-2 left-2" />
            <span className="corner-mark border-b border-r bottom-2 right-2" />
            <div className="label-mono mb-3">SESSIONS HISTORY</div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sessions.length === 0 && (
                <div className="text-sm text-beige-100/60">No sessions yet.</div>
              )}
              {sessions
                .slice()
                .sort((a, b) => b.startedAt - a.startedAt)
                .slice(0, 50)
                .map((s) => {
                  const started = new Date(s.startedAt);
                  const label = started.toLocaleString();
                  const mins = Math.round(s.durationSec / 60);
                  const module = modules.find((m) => m.id === s.moduleId);
                  const lesson = modules
                    .flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })))
                    .find((l) => l.id === s.lessonId);
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-white/[0.02]">
                      <div>
                        <div className="text-sm text-beige-100/90">{lesson ? `${lesson.title}` : module ? `${module.code} · ${module.name}` : 'Unassigned'}</div>
                        <div className="label-mono text-[11px]">{label} · {mins}m</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // confirm delete
                            if (!confirm('Delete this session?')) return;
                            removeSession(s.id);
                          }}
                          className="btn-ghost !px-2"
                          title="Delete session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="hud-frame p-5 relative">
            <span className="corner-mark border-t border-l top-2 left-2" />
            <span className="corner-mark border-t border-r top-2 right-2" />
            <span className="corner-mark border-b border-l bottom-2 left-2" />
            <span className="corner-mark border-b border-r bottom-2 right-2" />
            <div className="label-mono mb-3">TARGET MODULE</div>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="w-full bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2.5 text-sm text-beige-100/85 outline-none focus:border-beige-300/30"
            >
              <option value="">Unassigned</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} · {m.name}
                </option>
              ))}
            </select>
            <div className="mt-3">
              <div className="label-mono mb-2">Target Lesson</div>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2.5 text-sm text-beige-100/85 outline-none focus:border-beige-300/30"
              >
                <option value="">Unassigned</option>
                {moduleId &&
                  modules
                    .find((m) => m.id === moduleId)
                    ?.lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
              </select>
            </div>

          <div className="hud-frame p-5 relative">
            <div className="label-mono mb-3">Related Tasks</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(() => {
                const list = lessonId
                  ? tasks.filter((t) => t.lessonId === lessonId && !t.done)
                  : moduleId
                  ? tasks.filter((t) => t.moduleId === moduleId && !t.done)
                  : [];
                if (list.length === 0) return <div className="text-sm text-beige-100/60">No related tasks.</div>;
                return list.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-white/[0.01]">
                    <div className="flex-1">
                      <div className="text-sm text-beige-100/85">{t.title}</div>
                      <div className="label-mono text-[11px]">{t.priority}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setModuleId(t.moduleId ?? '');
                          setLessonId(t.lessonId ?? '');
                        }}
                        className="btn-ghost p-2 rounded-md"
                        title="Select"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => {
                          setModuleId(t.moduleId ?? '');
                          setLessonId(t.lessonId ?? '');
                          if (!running) {
                            if (!startedAtRef.current && mode === 'work') startedAtRef.current = Date.now();
                            setRunning(true);
                          }
                        }}
                        className="btn-primary px-3"
                        title="Start focus"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          
          <div className="hud-frame p-5 relative">
            <div className="label-mono mb-3">Tasks</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                addTask(taskTitle.trim(), taskPriority, taskModuleId || undefined, taskLessonId || undefined, taskDueDate || undefined);
                setTaskTitle('');
                setTaskDueDate('');
              }}
              className="space-y-3"
            >
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="New task…"
                className="w-full bg-transparent outline-none text-beige-100 placeholder-beige-100/30 px-2 py-2"
              />
              <div className="flex gap-2">
                <select value={taskModuleId} onChange={(e) => setTaskModuleId(e.target.value)} className="flex-1 bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-sm">
                  <option value="">No module</option>
                  {modules.map((m) => <option key={m.id} value={m.id}>{m.code} · {m.short}</option>)}
                </select>
                <select value={taskLessonId} onChange={(e) => setTaskLessonId(e.target.value)} className="flex-1 bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-sm">
                  <option value="">No lesson</option>
                  {taskModuleId && modules.find((m) => m.id === taskModuleId)?.lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-sm" />
                <div className="flex items-center gap-1">
                  {(['low','med','high'] as const).map((p) => (
                    <button key={p} type="button" onClick={() => setTaskPriority(p)} className={`chip ${taskPriority===p? '!text-beige-100 !border-beige-300/40':''}`}>{p}</button>
                  ))}
                </div>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>

            <div className="mt-3">
              <div className="label-mono mb-2">Open</div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {tasks.filter(t => !t.done).map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-white/[0.01]">
                    <div className="flex-1">
                      <div className="text-sm text-beige-100/85">{t.title}</div>
                      <div className="label-mono text-[11px]">{t.moduleId ? modules.find(m=>m.id===t.moduleId)?.code : ''} {t.lessonId ? (()=>{ const l = modules.flatMap(m=>m.lessons.map(ln=>({...ln, moduleId: m.id}))).find(ln=>ln.id===t.lessonId); return l? `· ${l.title}`:''})():''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=> toggleTask(t.id)} className="btn-ghost p-2 rounded-md">Done</button>
                      <button onClick={()=> removeTask(t.id)} className="btn-ghost p-2 rounded-md text-red-400">Del</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="label-mono mt-3 mb-2">Completed</div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {tasks.filter(t => t.done).map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-white/[0.01]">
                    <div className="flex-1">
                      <div className="text-sm text-beige-100/60 line-through">{t.title}</div>
                      <div className="label-mono text-[11px]">{t.completedAt ? new Date(t.completedAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=> toggleTask(t.id)} className="btn-ghost p-2 rounded-md">Undo</button>
                      <button onClick={()=> removeTask(t.id)} className="btn-ghost p-2 rounded-md text-red-400">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            <p className="mt-3 text-[12px] text-beige-100/45 leading-relaxed">
              Choose your focus subject to log the session against a module. XP and time will
              compound silently behind the scenes.
            </p>
          </div>

          <div className="hud-frame p-5 relative">
            <span className="corner-mark border-t border-l top-2 left-2" />
            <span className="corner-mark border-t border-r top-2 right-2" />
            <span className="corner-mark border-b border-l bottom-2 left-2" />
            <span className="corner-mark border-b border-r bottom-2 right-2" />
            <div className="label-mono mb-3">DOCTRINE</div>
            <p className="font-serif italic text-beige-100/75 leading-relaxed text-[14px]">
              “Discipline is the bridge between aspiration and achievement. Each block is a brick.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
