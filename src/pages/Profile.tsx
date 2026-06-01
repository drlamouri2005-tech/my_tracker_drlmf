import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Camera, Check, Flame, ImageIcon, Pencil, Sparkles, Timer, TrendingUp, Trash2, Trophy } from 'lucide-react';
import {
  selectModuleProgress,
  selectOverallProgress,
  useStore,
  xpForLevel,
} from '../store';
import { Ring } from '../components/ui/Ring';
import { WALLPAPERS, getWallpaper, type WallpaperCategory } from '../data/wallpapers';

// Resize a File into a square data URL ≤ 256×256 to keep localStorage tame.
async function fileToAvatarDataUrl(file: File, size = 256): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas-2d unavailable');
    // cover-fit crop
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Profile() {
  const { modules, player, sessions, tasks, notes, updatePlayer } = useStore();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(player.name);
  const [titleDraft, setTitleDraft] = useState(player.title);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarErr, setAvatarErr] = useState<string | null>(null);

  const onPickAvatar = async (file?: File | null) => {
    if (!file) return;
    setAvatarErr(null);
    if (!file.type.startsWith('image/')) {
      setAvatarErr('Please choose an image file.');
      return;
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      updatePlayer({ avatar: dataUrl });
    } catch {
      setAvatarErr('Could not read that image.');
    }
  };

  const clearAvatar = () => updatePlayer({ avatar: undefined });
  const currentBg = getWallpaper(player.background);

  const saveIdentity = () => {
    const name = nameDraft.trim() || 'Doctor';
    const title = titleDraft.trim() || 'Practicing Physician';
    updatePlayer({ name, title });
    setEditing(false);
  };
  const overall = selectOverallProgress(modules);
  const xpNext = xpForLevel(player.level);
  const xpPct = Math.min(100, (player.xp / xpNext) * 100);

  const totalMin = sessions.reduce((a, b) => a + b.durationSec / 60, 0);
  const masteredLessons = modules.reduce(
    (a, m) => a + m.lessons.filter((l) => l.status === 'mastered').length,
    0
  );
  const completedTasks = tasks.filter((t) => t.done).length;

  const achievements = [
    {
      id: 'first',
      label: 'First incision',
      sub: 'Logged your first focus block',
      icon: Sparkles,
      earned: sessions.length >= 1,
    },
    {
      id: 'hour',
      label: 'An hour given',
      sub: 'Reached 60 minutes of focus',
      icon: Timer,
      earned: totalMin >= 60,
    },
    {
      id: 'streak3',
      label: 'Three-day rhythm',
      sub: 'Maintained a 3-day streak',
      icon: Flame,
      earned: player.streak >= 3,
    },
    {
      id: 'streak7',
      label: 'Weekly ritual',
      sub: 'A full week of devotion',
      icon: Flame,
      earned: player.streak >= 7,
    },
    {
      id: 'mast10',
      label: 'Decade of mastery',
      sub: 'Mastered ten lessons',
      icon: Trophy,
      earned: masteredLessons >= 10,
    },
    {
      id: 'lvl5',
      label: 'Resident',
      sub: 'Reached level 5',
      icon: Award,
      earned: player.level >= 5,
    },
  ];

  return (
    <div className="space-y-8 pt-2">
      <div>
        <div className="label-mono mb-2">◗ DOSSIER</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">The physician's record.</h1>
        <p className="mt-2 text-beige-100/55 max-w-xl">
          A measured account of effort, progress, and quiet victories.
        </p>
      </div>

      {/* Identity card */}
      <div className="hud-frame p-6 md:p-8 relative overflow-hidden">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full opacity-25 blur-3xl bg-beige-300" />

        <div className="flex flex-wrap items-center gap-8 relative">
          <div className="relative group/avatar">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={player.avatar ? 'Replace portrait' : 'Upload portrait'}
              className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-beige-300 to-gold-800 grid place-items-center font-display text-5xl text-ink-900 shadow-elev-2 relative focus:outline-none focus:ring-2 focus:ring-beige-300/40"
            >
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={`${player.name}'s portrait`}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <span>{player.name.charAt(0)}</span>
              )}
              <span className="absolute inset-0 bg-ink-900/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity grid place-items-center text-beige-100">
                <Camera size={20} />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                onPickAvatar(f);
                // allow re-selecting the same file
                e.target.value = '';
              }}
            />
            {player.avatar && (
              <button
                type="button"
                onClick={clearAvatar}
                title="Remove portrait"
                className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-ink-800 border border-beige-300/30 grid place-items-center text-beige-100/70 hover:text-red-300 hover:border-red-300/40 transition"
              >
                <Trash2 size={12} />
              </button>
            )}
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-ink-800 border border-beige-300/30 label-mono">
              LVL {player.level}
            </div>
            {avatarErr && (
              <div className="absolute -bottom-8 left-0 right-0 text-center text-[10px] text-red-300/80">
                {avatarErr}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[260px]">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  placeholder="Title (e.g. Practicing Physician)"
                  className="w-full bg-ink-800 border border-beige-300/15 rounded-md px-2.5 py-1.5 text-xs label-mono text-beige-100/90 outline-none focus:border-beige-300/40"
                />
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-ink-800 border border-beige-300/15 rounded-md px-3 py-2 font-display text-2xl md:text-3xl text-beige-100 outline-none focus:border-beige-300/40"
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={saveIdentity} className="btn-primary text-xs px-3 py-1.5">Save</button>
                  <button
                    onClick={() => {
                      setNameDraft(player.name);
                      setTitleDraft(player.title);
                      setEditing(false);
                    }}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group">
                <div className="label-mono mb-1 flex items-center gap-2">
                  {player.title}
                  <button
                    onClick={() => {
                      setNameDraft(player.name);
                      setTitleDraft(player.title);
                      setEditing(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-beige-100/50 hover:text-beige-100"
                    title="Edit identity"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
                <h2 className="font-display text-3xl md:text-4xl">{player.name}</h2>
              </div>
            )}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-beige-100/60 mb-1.5">
                <span>Experience</span>
                <span>
                  {player.xp} / {xpNext} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-beige-300/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-beige-300 to-gold-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">
                <Flame size={11} /> {player.streak}-day streak
              </span>
              <span className="chip">
                <Timer size={11} /> {(totalMin / 60).toFixed(1)} h logged
              </span>
              <span className="chip">
                <TrendingUp size={11} /> {Math.round(overall)}% mastery
              </span>
            </div>
          </div>
          <Ring value={overall} size={140} stroke={10} label="Overall" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sessions', value: sessions.length, accent: '#6FB3B8' },
          { label: 'Mastered', value: masteredLessons, accent: '#D9C7A7' },
          { label: 'Tasks done', value: completedTasks, accent: '#B89968' },
          { label: 'Entries', value: notes.length, accent: '#8C6B3A' },
        ].map((s) => (
          <div
            key={s.label}
            className="hud-frame p-5 relative"
            style={{ boxShadow: `inset 0 0 0 1px ${s.accent}10` }}
          >
            <span className="corner-mark border-t border-l top-2 left-2" />
            <span className="corner-mark border-t border-r top-2 right-2" />
            <span className="corner-mark border-b border-l bottom-2 left-2" />
            <span className="corner-mark border-b border-r bottom-2 right-2" />
            <div className="label-mono" style={{ color: s.accent }}>
              {s.label}
            </div>
            <div className="font-display text-4xl mt-2 text-gradient-gold tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Modules breakdown */}
      <div className="hud-frame p-6 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />
        <h3 className="font-display text-xl mb-5">Mastery by trajectory</h3>
        <div className="space-y-3.5">
          {modules.map((m) => {
            const p = selectModuleProgress(m);
            return (
              <div key={m.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
                    />
                    <span className="text-beige-100/85">{m.name}</span>
                    <span className="label-mono">{m.code}</span>
                  </div>
                  <span className="font-mono text-xs text-beige-100/60 tabular-nums">
                    {Math.round(p.pct)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-beige-300/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${m.color}, #D9C7A7)` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="hud-frame p-6 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />
        <h3 className="font-display text-xl mb-5">Insignia</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={`p-4 rounded-xl border transition ${
                  a.earned
                    ? 'border-beige-300/25 bg-beige-300/[0.05]'
                    : 'border-beige-300/[0.06] bg-white/[0.01] opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg grid place-items-center ${
                      a.earned
                        ? 'bg-gradient-to-br from-beige-300 to-gold-800 text-ink-900'
                        : 'bg-beige-300/10 text-beige-100/40'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="font-display text-base leading-tight">{a.label}</div>
                    <div className="label-mono mt-1">{a.sub}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Atmosphere — wallpaper picker */}
      <div className="hud-frame p-6 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />

        <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
          <div>
            <h3 className="font-display text-xl flex items-center gap-2">
              <ImageIcon size={16} className="text-beige-300/80" />
              Atmosphere
            </h3>
            <p className="text-xs text-beige-100/55 mt-1">
              Set the stage. Currently:{' '}
              <span className="text-beige-100/85">{currentBg.name}</span>
              <span className="text-beige-100/40"> · {currentBg.caption}</span>
            </p>
          </div>
          {player.background && player.background !== 'default' && (
            <button
              type="button"
              onClick={() => updatePlayer({ background: 'default' })}
              className="btn-ghost text-xs px-3 py-1.5"
            >
              Reset to ambient
            </button>
          )}
        </div>

        {(['default', 'medical', 'monster'] as WallpaperCategory[]).map((cat) => {
          const items = WALLPAPERS.filter((w) => w.category === cat);
          if (!items.length) return null;
          const heading =
            cat === 'default' ? 'Default' : cat === 'medical' ? 'Medical' : 'Monster — Naoki Urasawa';
          return (
            <div key={cat} className="mt-5">
              <div className="label-mono mb-2">◗ {heading.toUpperCase()}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((w) => {
                  const active = (player.background ?? 'default') === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => updatePlayer({ background: w.id })}
                      className={`group relative rounded-xl overflow-hidden border text-left transition shadow-elev-1 hover:shadow-elev-2 ${
                        active
                          ? 'border-beige-300/60 ring-1 ring-beige-300/40'
                          : 'border-beige-300/10 hover:border-beige-300/30'
                      }`}
                      title={w.caption}
                    >
                      <div
                        className="h-20 w-full"
                        style={{ background: w.swatch, backgroundSize: 'cover' }}
                      />
                      <div className="px-3 py-2 bg-ink-800/80 backdrop-blur-sm">
                        <div className="font-display text-sm leading-tight truncate">{w.name}</div>
                        <div className="label-mono mt-0.5 truncate">{w.caption}</div>
                      </div>
                      {active && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-beige-300 text-ink-900 grid place-items-center shadow-elev-1">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
