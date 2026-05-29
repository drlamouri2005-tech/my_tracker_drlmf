import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useStore } from '../store/useStore';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function CalendarPage() {
  const { sessions, modules } = useStore();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = (first.getDay() + 6) % 7; // Mon-start
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++)
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const examDays = modules
    .filter((m) => m.examDate)
    .map((m) => ({ date: new Date(m.examDate!), module: m }));

  const sessionByDay = sessions.reduce<Record<string, number>>((acc, s) => {
    const key = new Date(s.startedAt).toDateString();
    acc[key] = (acc[key] || 0) + s.durationSec;
    return acc;
  }, {});

  const maxSec = Math.max(1, ...Object.values(sessionByDay));

  const monthLabel = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono mb-2">◕ TIMELINE</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">The ledger of days.</h1>
          <p className="mt-2 text-beige-100/55 max-w-xl">
            Each square is a day lived. Each glow is a session logged. The ink of effort never
            fades.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="btn-ghost !px-3"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="font-display text-lg min-w-[180px] text-center">{monthLabel}</div>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="btn-ghost !px-3"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="hud-frame p-5 md:p-7 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
            <div key={d} className="label-mono text-center pb-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const key = day.toDateString();
            const sec = sessionByDay[key] || 0;
            const intensity = sec / maxSec;
            const isToday = sameDay(day, new Date());
            const exam = examDays.find((e) => sameDay(e.date, day));
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.005, 0.3) }}
                className={`aspect-square rounded-lg relative border ${
                  isToday ? 'border-beige-300/50' : 'border-beige-300/[0.06]'
                } overflow-hidden`}
                style={{
                  background: intensity
                    ? `linear-gradient(135deg, rgba(217,199,167,${0.08 + intensity * 0.3}), rgba(140,107,58,${0.05 + intensity * 0.25}))`
                    : 'rgba(255,255,255,0.015)',
                }}
                title={`${day.toDateString()} · ${Math.round(sec / 60)} min`}
              >
                <div className="absolute top-1.5 left-1.5 text-[11px] font-mono text-beige-100/60">
                  {day.getDate()}
                </div>
                {sec > 0 && (
                  <div className="absolute bottom-1.5 right-1.5 text-[10px] font-mono text-beige-200">
                    {Math.round(sec / 60)}m
                  </div>
                )}
                {exam && (
                  <div
                    className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: exam.module.color, boxShadow: `0 0 8px ${exam.module.color}` }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Upcoming exams list */}
      <div className="hud-frame p-5 md:p-6 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Examinations on the horizon</h3>
          <Flame size={14} className="text-beige-300/60" />
        </div>
        <ul className="space-y-2">
          {examDays
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(({ date, module }) => {
              const days = Math.max(
                0,
                Math.ceil((date.getTime() - Date.now()) / 86400000)
              );
              return (
                <li
                  key={module.id}
                  className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-beige-300/[0.06]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: module.color, boxShadow: `0 0 10px ${module.color}` }}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-beige-100/90">{module.name}</div>
                    <div className="label-mono mt-0.5">{module.examDate}</div>
                  </div>
                  <div className="font-display text-xl text-gradient-gold tabular-nums">
                    {days}d
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
