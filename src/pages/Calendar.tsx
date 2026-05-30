import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Pencil, Trash2, Plus, Clock } from 'lucide-react';
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
  const setModuleExamDate = useStore((s) => s.setModuleExamDate);
  const calendarEvents = useStore((s) => s.calendarEvents);
  const addCalendarEvent = useStore((s) => s.addCalendarEvent);
  const updateCalendarEvent = useStore((s) => s.updateCalendarEvent);
  const removeCalendarEvent = useStore((s) => s.removeCalendarEvent);
  const [addModuleId, setAddModuleId] = useState('');
  const [addDate, setAddDate] = useState('');
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('');
  const [evtModuleId, setEvtModuleId] = useState('');
  const [evtColor, setEvtColor] = useState('#6FB3B8');
  const [evtEditing, setEvtEditing] = useState<Record<string, { title: string; date: string; time?: string; moduleId?: string; color?: string }>>({});
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
            const eventsForDay = calendarEvents.filter((ev) => {
              try {
                return new Date(ev.date).toDateString() === day.toDateString();
              } catch (err) {
                return false;
              }
            });
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
                {eventsForDay.length > 0 && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    {eventsForDay.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: ev.color ?? '#999', boxShadow: `0 0 6px ${ev.color ?? '#999'}` }}
                        title={ev.title}
                      />
                    ))}
                    {eventsForDay.length > 3 && <div className="label-mono text-[10px]">+{eventsForDay.length - 3}</div>}
                  </div>
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
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={addModuleId}
            onChange={(e) => setAddModuleId(e.target.value)}
            className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={addDate}
            onChange={(e) => setAddDate(e.target.value)}
            className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!addModuleId || !addDate) return;
                setModuleExamDate(addModuleId, addDate);
                setAddModuleId('');
                setAddDate('');
              }}
              className="btn-primary"
            >
              Set exam
            </button>
            <button
              onClick={() => {
                setAddModuleId('');
                setAddDate('');
              }}
              className="btn-ghost"
            >
              Clear
            </button>
          </div>
        </div>

        <ul className="space-y-2">
          {examDays
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(({ date, module }) => {
              const days = Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
              const isEditing = !!editing[module.id];
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
                    {!isEditing ? (
                      <div className="label-mono mt-0.5">{module.examDate}</div>
                    ) : (
                      <input
                        type="date"
                        value={editing[module.id]}
                        onChange={(e) => setEditing((s) => ({ ...s, [module.id]: e.target.value }))}
                        className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                  <div className="font-display text-xl text-gradient-gold tabular-nums mr-3">
                    {days}d
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setEditing((s) => ({ ...s, [module.id]: module.examDate ?? '' }))}
                        className="btn-ghost !px-2"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            const d = editing[module.id];
                            setModuleExamDate(module.id, d || undefined);
                            setEditing((s) => {
                              const n = { ...s };
                              delete n[module.id];
                              return n;
                            });
                          }}
                          className="btn-primary !px-3"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing((s) => {
                            const n = { ...s } as Record<string, string>;
                            delete n[module.id];
                            return n;
                          })}
                          className="btn-ghost !px-2"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setModuleExamDate(module.id, undefined)}
                      className="btn-ghost !px-2"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {/* Custom timings / user events */}
      <div className="hud-frame p-5 md:p-6 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Custom Timings</h3>
          <div className="flex items-center gap-2 text-beige-300/60">
            <Plus size={14} />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="Event title"
            value={evtTitle}
            onChange={(e) => setEvtTitle(e.target.value)}
            className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={evtDate}
            onChange={(e) => setEvtDate(e.target.value)}
            className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={evtTime}
              onChange={(e) => setEvtTime(e.target.value)}
              className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm w-full"
            />
            <input
              type="color"
              value={evtColor}
              onChange={(e) => setEvtColor(e.target.value)}
              className="w-12 h-10 p-0 border-none rounded"
            />
          </div>
          <select
            value={evtModuleId}
            onChange={(e) => setEvtModuleId(e.target.value)}
            className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} · {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              if (!evtTitle || !evtDate) return;
              addCalendarEvent({
                title: evtTitle,
                date: evtDate,
                time: evtTime || undefined,
                color: evtColor || undefined,
                moduleId: evtModuleId || undefined,
              });
              setEvtTitle('');
              setEvtDate('');
              setEvtTime('');
              setEvtModuleId('');
            }}
            className="btn-primary"
          >
            Add event
          </button>
          <button
            onClick={() => {
              setEvtTitle('');
              setEvtDate('');
              setEvtTime('');
              setEvtModuleId('');
            }}
            className="btn-ghost"
          >
            Clear
          </button>
        </div>

        <ul className="space-y-2">
          {calendarEvents
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
            .map((e) => {
              const isEditingEvt = !!evtEditing[e.id];
              return (
                <li key={e.id} className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-beige-300/[0.06]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color ?? '#999', boxShadow: `0 0 8px ${e.color ?? '#999'}` }} />
                  <div className="flex-1">
                    {!isEditingEvt ? (
                      <>
                        <div className="text-sm text-beige-100/90">{e.title}</div>
                        <div className="label-mono mt-0.5">{e.date}{e.time ? ` · ${e.time}` : ''}</div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        <input value={evtEditing[e.id]?.title ?? ''} onChange={(ev) => setEvtEditing((s) => ({ ...s, [e.id]: { ...(s[e.id] ?? { title: '', date: '' }), title: ev.target.value } }))} className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm" />
                        <div className="flex gap-2">
                          <input type="date" value={evtEditing[e.id]?.date ?? ''} onChange={(ev) => setEvtEditing((s) => ({ ...s, [e.id]: { ...(s[e.id] ?? { title: '', date: '' }), date: ev.target.value } }))} className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm w-full" />
                          <input type="time" value={evtEditing[e.id]?.time ?? ''} onChange={(ev) => setEvtEditing((s) => ({ ...s, [e.id]: { ...(s[e.id] ?? { title: '', date: '' }), time: ev.target.value } }))} className="bg-ink-800/60 border border-beige-300/10 rounded-lg px-3 py-2 text-sm w-36" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditingEvt ? (
                      <button onClick={() => setEvtEditing((s) => ({ ...s, [e.id]: { title: e.title, date: e.date, time: e.time, moduleId: e.moduleId, color: e.color } }))} className="btn-ghost !px-2" title="Edit"><Pencil size={14} /></button>
                    ) : (
                      <>
                        <button onClick={() => {
                          const draft = evtEditing[e.id];
                          if (!draft) return;
                          updateCalendarEvent(e.id, { title: draft.title, date: draft.date, time: draft.time, moduleId: draft.moduleId, color: draft.color });
                          setEvtEditing((s) => { const n = { ...s }; delete n[e.id]; return n; });
                        }} className="btn-primary !px-3">Save</button>
                        <button onClick={() => setEvtEditing((s) => { const n = { ...s }; delete n[e.id]; return n; })} className="btn-ghost !px-2" title="Cancel">Cancel</button>
                      </>
                    )}
                    <button onClick={() => { if (!confirm('Delete this event?')) return; removeCalendarEvent(e.id); }} className="btn-ghost !px-2" title="Remove"><Trash2 size={14} /></button>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
