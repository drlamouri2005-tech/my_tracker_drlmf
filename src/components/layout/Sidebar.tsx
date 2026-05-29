import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenText,
  ListTodo,
  Timer,
  CalendarDays,
  NotebookText,
  Trophy,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { to: '/dashboard', label: 'Command', icon: LayoutDashboard },
  { to: '/modules', label: 'Modules', icon: BookOpenText },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/notes', label: 'Notes', icon: NotebookText },
  { to: '/profile', label: 'Profile', icon: Trophy },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col gap-1 sticky top-0 h-screen w-[230px] shrink-0 px-4 py-6 border-r border-beige-300/[0.06] bg-black/20 backdrop-blur-xl">
      <NavLink to="/" className="flex items-center gap-2.5 px-2 mb-6 group">
        <div className="relative w-9 h-9 rounded-xl bg-beige-300/10 border border-beige-300/15 grid place-items-center overflow-hidden">
          <Stethoscope size={18} className="text-beige-200" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-beige-300/20 to-transparent"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] tracking-wide text-beige-100">MedVerse</div>
          <div className="label-mono">cognitive · v1</div>
        </div>
      </NavLink>

      <div className="label-mono px-3 mt-2 mb-2">Navigation</div>
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
              ${
                isActive
                  ? 'text-beige-100 bg-white/[0.04] border border-beige-300/15'
                  : 'text-beige-100/60 hover:text-beige-100 hover:bg-white/[0.025] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute -left-px top-1/2 -translate-y-1/2 w-[2px] h-6 bg-beige-300/80 rounded-r"
                  />
                )}
                <Icon size={16} strokeWidth={1.6} className="shrink-0" />
                <span className="font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="divider-soft my-4" />
        <div className="px-3 text-[11px] text-beige-200/40 leading-relaxed font-serif italic">
          “Calm hands. Clear mind. Surgical focus.”
        </div>
      </div>
    </aside>
  );
}
