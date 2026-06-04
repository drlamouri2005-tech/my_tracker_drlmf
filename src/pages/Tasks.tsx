import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check } from 'lucide-react';
import { useStore } from '../store';
import type { Priority } from '../types';

const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#7C7060' },
  med: { label: 'Med', color: '#D9C7A7' },
  high: { label: 'High', color: '#C8553D' },
};

export function Tasks() {
  const { tasks, addTask, toggleTask, removeTask, modules } = useStore();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('med');
  const [moduleId, setModuleId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), priority, moduleId || undefined, dueDate || undefined);
    setTitle('');
    setDueDate('');
  };

  // group open tasks by due date (ISO YYYY-MM-DD), tasks without a date go last
  const openTasks = tasks
    .filter((t) => !t.done)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate) || a.order - b.order;
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.order - b.order;
    });

  const groups = openTasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    const key = t.dueDate ?? 'no-date';
    (acc[key] = acc[key] ?? []).push(t);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const orderedKeys = Object.keys(groups).sort((a, b) => {
    if (a === 'no-date') return 1;
    if (b === 'no-date') return -1;
    return a.localeCompare(b);
  });
  const done = tasks.filter((t) => t.done);

  return (
    <div className="space-y-8 pt-2">
      <div>
        <div className="label-mono mb-2">◔ MISSIONS</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Active protocols.</h1>
        <p className="mt-2 text-beige-100/55 max-w-xl">
          Small, deliberate steps. One mission at a time. The ward respects the disciplined hand.
        </p>
      </div>

      <form onSubmit={submit} className="hud-frame p-4 flex flex-wrap items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Draft a new mission…"
          className="flex-1 min-w-[200px] bg-transparent outline-none text-beige-100 placeholder-beige-100/30 px-2 py-2"
        />
        <select
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-sm text-beige-100/80"
        >
          <option value="">No module</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} · {m.short}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-sm text-beige-100/80"
        />
        <div className="flex items-center gap-1">
          {(['low', 'med', 'high'] as Priority[]).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPriority(p)}
              className={`chip ${priority === p ? '!text-beige-100 !border-beige-300/40' : ''}`}
              style={
                priority === p
                  ? { boxShadow: `inset 0 0 0 1px ${priorityMeta[p].color}66` }
                  : undefined
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: priorityMeta[p].color }}
              />
              {priorityMeta[p].label}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-primary">
          <Plus size={14} /> Add
        </button>
      </form>

        <div className="grid md:grid-cols-2 gap-5">
        <Section title="In progress" sub={`${openTasks.length} open`}>
          <AnimatePresence>
            {openTasks.length === 0 && (
              <div className="text-beige-100/40 text-sm py-6 text-center">All clear.</div>
            )}

            {orderedKeys.map((key) => (
              <div key={key}>
                <div className="label-mono mt-2 mb-2">
                  {key === 'no-date' ? 'No date' : (() => {
                    const today = new Date().toISOString().slice(0,10);
                    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0,10);
                    if (key === today) return 'Today';
                    if (key === tomorrow) return 'Tomorrow';
                    try { return new Date(key).toLocaleDateString(); } catch { return key; }
                  })()} · {groups[key].length}
                </div>
                {groups[key].map((t) => (
                  <motion.div
                    layout
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-beige-300/[0.06]"
                  >
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="w-6 h-6 rounded-md border border-beige-300/30 grid place-items-center hover:bg-beige-300/10 transition"
                    >
                      <Check size={12} className="opacity-0" />
                    </button>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: priorityMeta[t.priority].color }}
                    />
                    <span className="flex-1 text-sm text-beige-100/85">{t.title}</span>
                    {t.moduleId && (
                      <span className="label-mono">
                        {modules.find((m) => m.id === t.moduleId)?.code}
                      </span>
                    )}
                    <button
                      onClick={() => removeTask(t.id)}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition text-beige-100/60"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            ))}
          </AnimatePresence>
        </Section>

        <Section title="Completed" sub={`${done.length} archived`}>
          <AnimatePresence>
            {done.length === 0 && (
              <div className="text-beige-100/40 text-sm py-6 text-center">
                Completed missions appear here.
              </div>
            )}
            {done.map((t) => (
              <motion.div
                layout
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.015] border border-beige-300/[0.04]"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  className="w-6 h-6 rounded-md border border-beige-300/40 bg-beige-300/15 grid place-items-center"
                >
                  <Check size={12} className="text-beige-200" />
                </button>
                <span className="flex-1 text-sm text-beige-100/40 line-through">{t.title}</span>
                <button
                  onClick={() => removeTask(t.id)}
                  className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition text-beige-100/40"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="hud-frame p-5 relative">
      <span className="corner-mark border-t border-l top-2 left-2" />
      <span className="corner-mark border-t border-r top-2 right-2" />
      <span className="corner-mark border-b border-l bottom-2 left-2" />
      <span className="corner-mark border-b border-r bottom-2 right-2" />
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-display text-lg">{title}</h3>
        {sub && <span className="label-mono">{sub}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
