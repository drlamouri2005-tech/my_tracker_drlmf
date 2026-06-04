import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, CircleDot, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { selectModuleProgress, useStore } from '../store';
import { Ring } from '../components/ui/Ring';
import type { LessonStatus } from '../types';

const STATUS_CYCLE: LessonStatus[] = ['todo', 'studying', 'revision', 'mastered'];

const STATUS_META: Record<LessonStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
  todo: { label: 'Not started', color: '#7C7060', icon: Circle },
  studying: { label: 'Studying', color: '#6FB3B8', icon: CircleDot },
  revision: { label: 'In revision', color: '#B89968', icon: RotateCcw },
  mastered: { label: 'Mastered', color: '#D9C7A7', icon: CheckCircle2 },
};

export function ModuleDetail() {
  const { id } = useParams();
  const { modules, updateLesson, awardXP, registerActivity, addLesson, removeLesson } = useStore();
  const m = modules.find((x) => x.id === id);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<LessonStatus | 'all'>('all');

  const progress = useMemo(() => (m ? selectModuleProgress(m) : null), [m]);

  if (!m || !progress) {
    return (
      <div className="py-20 text-center text-beige-100/60">
        Module not found.{' '}
        <Link to="/modules" className="underline">
          Go back
        </Link>
      </div>
    );
  }

  const lessons = m.lessons.filter((l) => filter === 'all' || l.status === filter);

  const cycle = (lessonId: string) => {
    const lesson = m.lessons.find((l) => l.id === lessonId)!;
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(lesson.status) + 1) % STATUS_CYCLE.length];
    updateLesson(m.id, lessonId, { status: next });
    if (next === 'mastered') awardXP(20, 'lesson');
    if (next === 'studying') awardXP(4, 'lesson-start');
    registerActivity();
  };

  const onAdd = () => {
    if (!newTitle.trim()) return;
    addLesson(m!.id, newTitle.trim());
    setNewTitle('');
  };

  return (
    <div className="space-y-8 pt-2">
      <Link
        to="/modules"
        className="inline-flex items-center gap-1.5 text-[12px] text-beige-100/50 hover:text-beige-100 transition"
      >
        <ArrowLeft size={13} /> All modules
      </Link>

      <div className="hud-frame p-6 md:p-8 relative overflow-hidden">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />

        <div
          className="absolute -top-32 -right-20 w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{ background: m.color }}
        />
        <div className="flex flex-wrap items-center gap-8 relative">
          <Ring value={progress.pct} size={150} stroke={11} color={m.color} label={m.code} />
          <div className="flex-1 min-w-[260px]">
            <div className="label-mono mb-2" style={{ color: m.color }}>
              {m.code}
            </div>
            <h1 className="font-display text-3xl md:text-4xl leading-tight">{m.name}</h1>
            <p className="mt-3 text-beige-100/60 max-w-2xl">{m.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="chip">{m.lessons.length} lessons</span>
              <span className="chip">{progress.mastered} mastered</span>
              <span className="chip">{progress.studying} studying</span>
              <span className="chip">{progress.revision} in revision</span>
              {m.examDate && <span className="chip">Exam · {m.examDate}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`chip ${filter === 'all' ? '!border-beige-300/40 !text-beige-100' : ''}`}
        >
          All · {m.lessons.length}
        </button>
        {STATUS_CYCLE.map((s) => {
          const meta = STATUS_META[s];
          const count = m.lessons.filter((l) => l.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`chip ${filter === s ? '!border-beige-300/40 !text-beige-100' : ''}`}
              style={filter === s ? { boxShadow: `inset 0 0 0 1px ${meta.color}55` } : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
              {meta.label} · {count}
            </button>
          );
        })}
      </div>

      <div className="mt-3 hud-frame p-4">
        <div className="flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New lesson title…"
            className="flex-1 bg-transparent outline-none text-beige-100 placeholder-beige-100/30 px-2 py-2"
          />
          <button onClick={onAdd} className="btn-primary">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Lessons list */}
      <div className="hud-frame overflow-hidden">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />
        <ul className="divide-y divide-beige-300/[0.06]">
          {lessons.map((l, i) => {
            const meta = STATUS_META[l.status];
            const Icon = meta.icon;
            return (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.015, 0.4) }}
                className="group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition"
              >
                <button
                  onClick={() => cycle(l.id)}
                  className="w-9 h-9 rounded-lg grid place-items-center transition"
                  style={{
                    color: meta.color,
                    background: `${meta.color}15`,
                    border: `1px solid ${meta.color}33`,
                  }}
                  title={`Mark as next: ${
                    STATUS_META[STATUS_CYCLE[(STATUS_CYCLE.indexOf(l.status) + 1) % STATUS_CYCLE.length]].label
                  }`}
                >
                  <Icon size={15} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-beige-100/90 truncate">{l.title}</div>
                  <div className="text-[11px] text-beige-100/40 mt-0.5">
                    {meta.label}
                    {l.updatedAt && ' · ' + new Date(l.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="hidden md:block label-mono opacity-50">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Remove lesson? This cannot be undone.')) removeLesson(m.id, l.id);
                  }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition text-beige-100/60 ml-2"
                  title="Remove lesson"
                >
                  <Trash2 size={14} />
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
