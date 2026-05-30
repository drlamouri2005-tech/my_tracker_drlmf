import { motion } from 'framer-motion';
import {
  CalendarClock,
  Flame,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { selectModuleProgress, selectOverallProgress, useStore, xpForLevel } from '../store';
import { Panel } from '../components/ui/Panel';
import { Ring } from '../components/ui/Ring';
import { StatPill } from '../components/ui/StatPill';

function daysUntil(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((d - now) / 86400000));
}

export function Dashboard() {
  const { modules, player, sessions, tasks } = useStore();
  const overall = selectOverallProgress(modules);

  const todayMinutes = sessions
    .filter((s) => new Date(s.startedAt).toDateString() === new Date().toDateString())
    .reduce((a, b) => a + Math.round(b.durationSec / 60), 0);

  const totalMinutes = sessions.reduce((a, b) => a + Math.round(b.durationSec / 60), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const tasksOpen = tasks.filter((t) => !t.done).length;

  const xpNext = xpForLevel(player.level);
  const xpPct = Math.min(100, (player.xp / xpNext) * 100);

  const nextExam = modules
    .filter((m) => m.examDate)
    .map((m) => ({ m, d: daysUntil(m.examDate) || 0 }))
    .sort((a, b) => a.d - b.d)[0];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return 'Burning the midnight oil';
    if (h < 12) return 'Good morning, Doctor';
    if (h < 18) return 'Good afternoon, Doctor';
    return 'Good evening, Doctor';
  })();

  return (
    <div className="space-y-8 pt-2">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="label-mono mb-2">◐ COMMAND CENTER</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-tight">
            {greeting}.
          </h1>
          <p className="mt-2 text-beige-100/55 max-w-xl">
            The lecture hall is quiet. The instruments are sterile. The mind is sharp. Choose your
            next intervention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/focus" className="btn-primary">
            <Timer size={15} /> Begin focus
          </Link>
          <Link to="/modules" className="btn-ghost">
            Explore modules <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatPill
          label="Today"
          value={`${todayMinutes} min`}
          icon={<Timer size={16} />}
          accent="#6FB3B8"
        />
        <StatPill
          label="Total focus"
          value={`${totalHours} h`}
          icon={<TrendingUp size={16} />}
          accent="#D9C7A7"
        />
        <StatPill
          label="Open tasks"
          value={tasksOpen}
          icon={<Target size={16} />}
          accent="#B89968"
        />
        <StatPill
          label="Streak"
          value={`${player.streak} d`}
          icon={<Flame size={16} />}
          accent="#C8553D"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Big progress hud */}
        <Panel sub="VITALS" title="Cognitive matrix" className="col-span-12 lg:col-span-5">
          <div className="flex flex-col items-center text-center">
            <Ring value={overall} size={200} stroke={14} label="Overall" sub="weighted mastery" />
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs text-beige-100/60 mb-1.5">
                <span>Level {player.level}</span>
                <span>
                  {player.xp} / {xpNext} XP
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-beige-300/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-beige-300 to-gold-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* Module ring grid */}
        <Panel
          sub="MODULES"
          title="Trajectories"
          right={
            <Link to="/modules" className="label-mono hover:text-beige-100 transition">
              ALL →
            </Link>
          }
          className="col-span-12 lg:col-span-7"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {modules.map((m) => {
              const p = selectModuleProgress(m);
              return (
                <Link
                  key={m.id}
                  to={`/modules/${m.id}`}
                  className="group relative glass p-4 hover:bg-white/[0.045] transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="label-mono">{m.code}</div>
                      <div className="font-display text-[15px] mt-0.5 leading-tight">
                        {m.short}
                      </div>
                    </div>
                    <Ring
                      value={p.pct}
                      size={56}
                      stroke={5}
                      color={m.color}
                      label=""
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-beige-100/50">
                    <span>{m.lessons.length} lessons</span>
                    <span>·</span>
                    <span>{p.mastered} mastered</span>
                  </div>
                  <div className="absolute inset-x-3 bottom-2 h-px bg-gradient-to-r from-transparent via-beige-300/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </Link>
              );
            })}
          </div>
        </Panel>

        {/* Next exam countdown */}
        <Panel sub="PROTOCOL" title="Next examination" className="col-span-12 md:col-span-6 lg:col-span-4">
          {nextExam ? (
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-2xl grid place-items-center border"
                  style={{ borderColor: `${nextExam.m.color}33`, background: `${nextExam.m.color}10` }}
                >
                  <div className="text-center">
                    <div
                      className="font-display text-3xl"
                      style={{ color: nextExam.m.color }}
                    >
                      {nextExam.d}
                    </div>
                    <div className="label-mono">days</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="label-mono mb-1 flex items-center gap-1.5">
                  <CalendarClock size={11} /> {nextExam.m.examDate}
                </div>
                <div className="font-display text-lg leading-tight">{nextExam.m.name}</div>
                <p className="text-[12px] text-beige-100/55 mt-1 max-w-xs">
                  {nextExam.m.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-beige-100/50 text-sm">No examinations scheduled.</div>
          )}
        </Panel>

        {/* Pinned tasks */}
        <Panel
          sub="MISSIONS"
          title="Active protocols"
          right={
            <Link to="/tasks" className="label-mono hover:text-beige-100 transition">
              MANAGE →
            </Link>
          }
          className="col-span-12 md:col-span-6 lg:col-span-4"
        >
          {tasks.length === 0 ? (
            <div className="text-beige-100/50 text-sm">
              No active missions. The ward is calm.
            </div>
          ) : (
            <ul className="space-y-2">
              {tasks
                .slice()
                .sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order)
                .slice(0, 5)
                .map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-beige-300/[0.06]"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        t.priority === 'high'
                          ? 'bg-blood-700'
                          : t.priority === 'med'
                          ? 'bg-beige-300'
                          : 'bg-beige-300/40'
                      }`}
                    />
                    <span
                      className={`text-sm flex-1 ${
                        t.done ? 'line-through text-beige-100/30' : 'text-beige-100/85'
                      }`}
                    >
                      {t.title}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        {/* Daily ritual */}
        <Panel sub="RITUAL" title="Today’s rhythm" className="col-span-12 lg:col-span-4">
          <div className="space-y-3">
            <Step icon={<Sparkles size={14} />} label="Open the day with intention" />
            <Step icon={<Timer size={14} />} label="One deep focus block (50 min)" />
            <Step icon={<Target size={14} />} label="Mark one lesson as mastered" />
            <Step icon={<Flame size={14} />} label="Reflect. Note. Sleep deeply." />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Step({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-beige-300/[0.06]">
      <div className="w-7 h-7 rounded-md grid place-items-center bg-beige-300/10 text-beige-200">
        {icon}
      </div>
      <div className="text-sm text-beige-100/80">{label}</div>
    </div>
  );
}
