import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store';
import { getWallpaper } from './data/wallpapers';
import { Layout } from './components/layout/Layout';
import { MobileCorner } from './components/layout/MobileCorner';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Modules } from './pages/Modules';
import { ModuleDetail } from './pages/ModuleDetail';
import { Tasks } from './pages/Tasks';
import { Focus } from './pages/Focus';
import { CalendarPage } from './pages/Calendar';
import { Notes } from './pages/Notes';
import { Translation } from './pages/Translation';
import { Profile } from './pages/Profile';

export default function App() {
  const theme = useStore((s) => s.theme);
  const backgroundId = useStore((s) => s.player.background);
  const location = useLocation();
  const savedOnce = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Apply the user-chosen wallpaper to <body>. We override the default CSS
  // backgrounds from styles/index.css when a non-default preset is picked.
  useEffect(() => {
    const wp = getWallpaper(backgroundId);
    const body = document.body;
    if (!wp || wp.id === 'default') {
      body.style.removeProperty('background-image');
      body.style.removeProperty('background-color');
      body.style.removeProperty('background-attachment');
      body.style.removeProperty('background-size');
      body.style.removeProperty('background-repeat');
      return;
    }
    body.style.backgroundImage = wp.bg;
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'auto, cover, cover, cover, cover';
    body.style.backgroundRepeat = 'repeat, no-repeat, no-repeat, no-repeat, no-repeat';
    if (wp.color) body.style.backgroundColor = wp.color;
    else body.style.removeProperty('background-color');
  }, [backgroundId, theme]);

  // Per-user autosave (localStorage) — saves selected parts of the store
  useEffect(() => {
    const getKey = (name?: string) => `medverse-user-${encodeURIComponent((name || 'guest').toLowerCase())}`;

    // try to load a per-user snapshot once after persist rehydrate
    const loadOnce = () => {
      if (savedOnce.current) return;
      const st = useStore.getState();
      const key = getKey(st.player?.name);
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          useStore.setState({
            modules: parsed.modules ?? st.modules,
            tasks: parsed.tasks ?? st.tasks,
            sessions: parsed.sessions ?? st.sessions,
            notes: parsed.notes ?? st.notes,
            player: parsed.player ? { ...st.player, ...parsed.player } : st.player,
            motivationIndex: parsed.motivationIndex ?? st.motivationIndex,
          } as any);
        }
      } catch (e) {
        // ignore
      }
      savedOnce.current = true;
    };

    // Give persist a short moment to rehydrate then attempt load
    const t = setTimeout(loadOnce, 250);

    // Subscribe and auto-save snapshots (debounced)
    let timer: any = null;
    const unsub = useStore.subscribe((s) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const key = getKey(s.player?.name);
        const snapshot = {
          modules: s.modules,
          tasks: s.tasks,
          sessions: s.sessions,
          notes: s.notes,
          player: s.player,
          motivationIndex: s.motivationIndex,
        };
        try {
          localStorage.setItem(key, JSON.stringify(snapshot));
        } catch (e) {
          // ignore quota errors
        }
      }, 900);
    });

    return () => {
      clearTimeout(t);
      clearTimeout(timer);
      unsub();
    };
  }, []);

  // Send a lightweight visit ping to the serverless logger on route change
  useEffect(() => {
    const sendVisit = () => {
      try {
        const s = useStore.getState();
        const payload = {
          path: location.pathname,
          href: window.location.href,
          referrer: document.referrer,
          name: s.player?.name ?? null,
        };
        const body = JSON.stringify(payload);

        // Prefer sendBeacon for reliability during navigation/unload
        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/visit', blob);
        } else {
          // fallback to fetch with keepalive when available
          fetch('/api/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (e) {
        // silent
      }
    };

    sendVisit();
  }, [location.pathname]);

  const isLanding = location.pathname === '/';

  return (
    <AnimatePresence>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="stage"
      >
        {isLanding ? (
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
          </Routes>
        ) : (
          <Layout>
            <Routes location={location}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/modules/:id" element={<ModuleDetail />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/translation" element={<Translation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        )}
        <MobileCorner />
      </motion.div>
    </AnimatePresence>
  );
}
