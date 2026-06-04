import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpenText,
  ListTodo,
  Timer,
  NotebookText,
  Trophy,
  Music,
} from 'lucide-react';

const items = [
  { to: '/dashboard', icon: LayoutDashboard },
  { to: '/modules', icon: BookOpenText },
  { to: '/tasks', icon: ListTodo },
  { to: '/focus', icon: Timer },
  { to: '/music', icon: Music },
  { to: '/notes', icon: NotebookText },
  { to: '/profile', icon: Trophy },
];

export function MobileNav() {
  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-2 p-2 bg-ink-900/70 backdrop-blur rounded-xl border border-beige-300/8 pointer-events-auto"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', touchAction: 'manipulation' }}
    >
      {items.map(({ to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 grid place-items-center py-3 px-2 rounded-lg transition ${
              isActive ? 'bg-white/[0.04] text-beige-100' : 'text-beige-100/60 hover:text-beige-100'
            }`
          }
        >
          <Icon size={18} strokeWidth={1.6} />
        </NavLink>
      ))}
    </nav>
  );
}
