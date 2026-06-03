import { Moon, Sun, Sparkles } from 'lucide-react';
import MusicControl from '../ui/MusicControl';
import { useStore } from '../../store/useStore';
import { MOTIVATIONAL_QUOTES } from '../../data/curriculum';
import { motion, AnimatePresence } from 'framer-motion';

export function TopBar() {
  const { theme, toggleTheme, player, motivationIndex, cycleMotivation } = useStore();
  const quote = MOTIVATIONAL_QUOTES[motivationIndex % MOTIVATIONAL_QUOTES.length];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-900/40 border-b border-beige-300/[0.06]">
      <div className="px-6 md:px-10 py-3 flex items-center gap-4 max-w-[1500px] mx-auto">
        <div className="flex items-center gap-3">
          <span className="label-mono">STATUS</span>
          <span className="inline-flex items-center gap-2 text-xs text-beige-100/70">
            <span className="relative inline-flex">
              <span className="absolute inset-0 rounded-full bg-cyan-medical/60 animate-pulseRing" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-cyan-medical" />
            </span>
            Online — Lv {player.level} · {player.xp} XP · {player.streak}🜂 streak
          </span>
        </div>

        <button
          onClick={cycleMotivation}
          className="hidden md:flex flex-1 min-w-0 items-center gap-2 px-4 py-1.5 rounded-full border border-beige-300/10 bg-white/[0.02] hover:bg-white/[0.04] transition group"
          title="Cycle quote"
        >
          <Sparkles size={13} className="text-beige-300/70 shrink-0" />
          <AnimatePresence mode="wait">
            <motion.span
              key={quote}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="font-serif italic text-[13px] text-beige-100/70 truncate"
            >
              {quote}
            </motion.span>
          </AnimatePresence>
        </button>

        <button
          onClick={toggleTheme}
          className="btn-ghost !px-3"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
        </button>
        <div className="hidden md:flex items-center">
          <MusicControl />
        </div>
      </div>
    </header>
  );
}
