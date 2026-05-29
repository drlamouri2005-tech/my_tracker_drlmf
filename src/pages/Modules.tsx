import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { selectModuleProgress, useStore } from '../store/useStore';
import { Ring } from '../components/ui/Ring';

export function Modules() {
  const modules = useStore((s) => s.modules);

  return (
    <div className="space-y-8 pt-2">
      <div>
        <div className="label-mono mb-2">◑ ATLAS</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">The six trajectories.</h1>
        <p className="mt-2 text-beige-100/55 max-w-2xl">
          Each module is a continent. Each lesson a city. Walk them slowly, deliberately. Time
          spent here is time invested in the physician you are sharpening into.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((m, i) => {
          const p = selectModuleProgress(m);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/modules/${m.id}`}
                className="hud-frame block p-6 group relative overflow-hidden hover:bg-white/[0.02] transition"
              >
                <span className="corner-mark border-t border-l top-2 left-2" />
                <span className="corner-mark border-t border-r top-2 right-2" />
                <span className="corner-mark border-b border-l bottom-2 left-2" />
                <span className="corner-mark border-b border-r bottom-2 right-2" />

                {/* aura */}
                <div
                  className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 blur-3xl"
                  style={{ background: m.color }}
                />
                <div className="flex items-start justify-between relative">
                  <div>
                    <div className="label-mono" style={{ color: m.color }}>
                      {m.code}
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl mt-1 leading-tight max-w-[16ch]">
                      {m.name}
                    </h3>
                    <p className="mt-3 text-sm text-beige-100/55 max-w-md leading-relaxed">
                      {m.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="chip">
                        {m.lessons.length} lessons
                      </span>
                      <span className="chip">{p.mastered} mastered</span>
                      {m.examDate && (
                        <span className="chip">
                          <CalendarClock size={11} /> {m.examDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <Ring value={p.pct} size={100} stroke={8} color={m.color} label="" />
                </div>

                <div className="mt-6 flex items-center justify-between text-[12px] text-beige-100/50">
                  <span>Click to enter</span>
                  <ArrowUpRight
                    size={14}
                    className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
