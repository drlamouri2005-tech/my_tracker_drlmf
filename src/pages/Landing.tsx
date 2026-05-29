import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Stethoscope, Heart, Brain, Microscope } from 'lucide-react';
import { Particles } from '../components/ambient/Particles';

const phrases = [
  'Calibrating cognitive matrix…',
  'Synchronising neural pathways…',
  'Initialising MedVerse OS…',
];

export function Landing() {
  const [phase, setPhase] = useState<'boot' | 'reveal'>('boot');
  const [line, setLine] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setPhase('reveal');
      return;
    }
    const t1 = setTimeout(() => setLine(1), 700);
    const t2 = setTimeout(() => setLine(2), 1400);
    const t3 = setTimeout(() => setPhase('reveal'), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduce]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Particles density={80} />
      {/* Grid */}
      <div className="absolute inset-0 grid-bg mask-fade-b opacity-60" />
      {/* Radial vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial-fade" />

      {/* Boot sequence */}
      {phase === 'boot' && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-3 font-mono text-beige-200/80 text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-medical animate-pulseRing" />
            <span className="label-mono">MEDVERSE BOOT SEQUENCE</span>
          </motion.div>
          <div className="mt-4 space-y-1 text-center">
            {phrases.slice(0, line + 1).map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[13px]"
              >
                <span className="text-beige-300/60">› </span>
                {p}
                {i === line && <span className="ml-1 animate-pulse">▌</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top nav */}
          <div className="px-8 md:px-14 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-beige-300/10 border border-beige-300/15 grid place-items-center">
                <Stethoscope size={18} className="text-beige-200" />
              </div>
              <div className="leading-tight">
                <div className="font-display text-[15px] text-beige-100 tracking-wide">MedVerse</div>
                <div className="label-mono">2025 · third year</div>
              </div>
            </div>
            <Link to="/dashboard" className="btn-ghost">
              Enter command <ArrowRight size={14} />
            </Link>
          </div>

          {/* Hero */}
          <div className="flex-1 grid lg:grid-cols-12 gap-10 items-center px-8 md:px-14 pb-20">
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="label-mono mb-5"
              >
                ◐ COGNITIVE COMMAND CENTER
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15 }}
                className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight"
              >
                The art of mastering{' '}
                <span className="text-gradient-gold italic font-serif">medicine</span>,
                <br />
                rendered in code.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="mt-6 max-w-xl text-beige-100/65 leading-relaxed"
              >
                MedVerse is a quiet, cinematic operating system for the practicing physician
                who refuses average — a place where modules, lessons, and one disciplined mind
                converge. Focus the noise. Sharpen the craft. Become inevitable.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-10 flex flex-wrap gap-3"
              >
                <Link to="/dashboard" className="btn-primary group">
                  Begin the protocol
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition" />
                </Link>
                <Link to="/modules" className="btn-ghost">
                  Examine modules
                </Link>
              </motion.div>

              {/* Stat strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.1 }}
                className="mt-12 grid grid-cols-3 max-w-md gap-6"
              >
                {[
                  { k: '06', l: 'Modules' },
                  { k: '82', l: 'Lessons' },
                  { k: '∞', l: 'Discipline' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-3xl text-gradient-gold">{s.k}</div>
                    <div className="label-mono mt-1">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right HUD orb */}
            <div className="lg:col-span-5 relative">
              <HudOrb />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="relative px-8 md:px-14 py-5 border-t border-beige-300/[0.06] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-beige-200/40">
            <span>v1.0.0 · MEDVERSE://kernel</span>
            <span className="hidden md:block italic font-serif text-beige-200/50">
              “The scalpel of the mind is sharpened in solitude.”
            </span>
            <span>SYS · READY</span>
          </div>
        </div>
      )}
    </div>
  );
}

function HudOrb() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4 }}
      className="relative aspect-square w-full max-w-[520px] mx-auto"
    >
      {/* outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-beige-300/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-beige-300/80" />
      </motion.div>
      <motion.div
        className="absolute inset-[8%] rounded-full border border-beige-300/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute bottom-0 left-1/3 w-1.5 h-1.5 rounded-full bg-cyan-medical/70" />
      </motion.div>
      <motion.div
        className="absolute inset-[18%] rounded-full border border-beige-300/[0.06]"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      />

      {/* center */}
      <div className="absolute inset-[26%] rounded-full bg-gradient-to-br from-beige-300/15 to-transparent border border-beige-300/15 backdrop-blur-xl grid place-items-center">
        <div className="text-center">
          <div className="label-mono">CORE</div>
          <div className="font-display text-4xl mt-1 text-gradient-gold">III</div>
          <div className="text-[11px] text-beige-100/50 mt-1">third year</div>
        </div>
      </div>

      {/* floating icons */}
      {[
        { Icon: Heart, top: '8%', left: '50%', delay: 0 },
        { Icon: Brain, top: '50%', left: '8%', delay: 0.8 },
        { Icon: Microscope, top: '50%', left: '92%', delay: 1.6 },
        { Icon: Stethoscope, top: '92%', left: '50%', delay: 2.4 },
      ].map(({ Icon, top, left, delay }, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl border border-beige-300/15 bg-ink-900/70 backdrop-blur grid place-items-center text-beige-200"
          style={{ top, left }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon size={16} />
        </motion.div>
      ))}
    </motion.div>
  );
}
