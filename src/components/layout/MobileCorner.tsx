import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MoreVertical,
  LayoutDashboard,
  BookOpenText,
  ListTodo,
  Timer,
  NotebookText,
  Trophy,
} from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Command', icon: LayoutDashboard },
  { to: '/modules', label: 'Modules', icon: BookOpenText },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/notes', label: 'Notes', icon: NotebookText },
  { to: '/profile', label: 'Profile', icon: Trophy },
];

export function MobileCorner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const el = document.getElementById('mobile-corner-menu');
      if (!el) return;
      if (!(e.target instanceof Node) || el.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  return (
    <div
      className="lg:hidden fixed"
      style={{
        top: 'calc(env(safe-area-inset-top, 8px) + 8px)',
        right: 'calc(env(safe-area-inset-right, 8px) + 8px)',
        zIndex: 9999,
      }}
    >
      <button
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen((o) => !o)}
        className="w-11 h-11 rounded-full bg-white/[0.04] border border-beige-300/12 flex items-center justify-center text-beige-100 shadow-lg backdrop-blur"
        style={{ touchAction: 'manipulation' }}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          id="mobile-corner-menu"
          className="mt-2 w-44 bg-ink-900/95 border border-beige-300/10 rounded-xl p-2 shadow-lg"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <nav className="flex flex-col gap-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                    isActive ? 'bg-white/[0.04] text-beige-100' : 'text-beige-100/80 hover:text-beige-100'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
