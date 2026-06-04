import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarClock, Plus, Trash2 } from 'lucide-react';
import { selectModuleProgress, useStore } from '../store';
import { Ring } from '../components/ui/Ring';
import { useState } from 'react';

export function Modules() {
  const modules = useStore((s) => s.modules);
  const addModule = useStore((s) => s.addModule);
  const removeModule = useStore((s) => s.removeModule);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [color, setColor] = useState('#7C7060');

  const onAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code.trim() || !name.trim()) return;
    addModule({ code: code.trim(), name: name.trim(), short: short.trim() || undefined, color });
    setCode('');
    setName('');
    setShort('');
    setColor('#7C7060');
  };

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

      <form onSubmit={onAdd} className="hud-frame p-4 flex flex-wrap items-center gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code (e.g. M7)"
          className="bg-transparent outline-none text-beige-100 placeholder-beige-100/30 px-2 py-2"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Module name"
          className="flex-1 bg-transparent outline-none text-beige-100 placeholder-beige-100/30 px-2 py-2"
        />
        <input
          value={short}
          onChange={(e) => setShort(e.target.value)}
          placeholder="Short"
          className="bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-sm text-beige-100/80"
        />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-8 p-0" />
        <button type="submit" className="btn-primary">
          <Plus size={14} /> Add module
        </button>
      </form>

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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm(`Remove module ${m.code}? This will delete related tasks and notes.`)) removeModule(m.id);
                  }}
                  className="btn-ghost p-2 rounded-md absolute top-3 right-3"
                  title="Remove module"
                >
                  <Trash2 size={14} />
                </button>
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
