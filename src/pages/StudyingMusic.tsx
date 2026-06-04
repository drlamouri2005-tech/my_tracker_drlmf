import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Music, Volume2, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export function StudyingMusic() {
  const musicOn = useStore((s) => s.musicOn);
  const musicVolume = useStore((s) => s.musicVolume);
  const musicTrack = useStore((s) => s.musicTrack);
  const setMusicOn = useStore((s) => s.setMusicOn);
  const setMusicVolume = useStore((s) => s.setMusicVolume);
  const setMusicTrack = useStore((s) => s.setMusicTrack);
  const userTracks = useStore((s) => s.userTracks);
  const addUserTrack = useStore((s) => s.addUserTrack);
  const addUserTrackFromFile = useStore((s) => s.addUserTrackFromFile);
  const removeUserTrack = useStore((s) => s.removeUserTrack);

  const [manifest, setManifest] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/audio/tracks.json');
        if (!r.ok) return;
        const arr = await r.json();
        if (Array.isArray(arr)) setManifest(arr.map((f) => `/audio/${f}`));
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const toggle = () => setMusicOn(!musicOn);

  const onVolume = (v: number) => setMusicVolume(v);

  const onSelect = (val?: string | null) => {
    setMusicTrack(val ?? null);
    setMusicOn(true);
  };

  const onAddLocal = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (addUserTrackFromFile) {
      const id = await addUserTrackFromFile(f as File);
      if (id) {
        const ref = `idb:${id}`;
        setMusicTrack(ref);
        setMusicOn(true);
      }
    } else {
      // fallback: read as data URL
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        addUserTrack(f.name, dataUrl);
        setMusicTrack(dataUrl);
        setMusicOn(true);
        if (fileRef.current) fileRef.current.value = '';
      };
      reader.readAsDataURL(f);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-8 pt-2">
      <div>
        <div className="label-mono mb-2">◔ STUDYING MUSIC</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Configure your ambient tracks</h1>
        <p className="mt-2 text-beige-100/55 max-w-xl">
          Add or remove personal tracks and control the global player.
        </p>
      </div>

      <div className="hud-frame p-4 flex items-center gap-4">
        <button onClick={toggle} className="btn-ghost p-2 rounded-md" title={musicOn ? 'Pause audio' : 'Play audio'}>
          {musicOn ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex items-center gap-2">
          <Music size={14} />
          <select value={musicTrack ?? ''} onChange={(e) => onSelect(e.target.value || null)} className="bg-transparent text-sm">
            <option value="">(default)</option>
            {manifest.map((m) => (
              <option key={m} value={m}>
                {m.replace('/audio/', '')}
              </option>
            ))}
            {userTracks.map((t) => (
              <option key={t.id} value={t.dataUrl}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 size={14} />
          <input aria-label="Music volume" type="range" min={0} max={1} step={0.01} value={musicVolume} onChange={(e) => onVolume(Number(e.target.value))} />
        </div>
        <label className="btn-ghost p-2 rounded-md" title="Add local file">
          <Plus size={14} />
          <input ref={fileRef} type="file" accept="audio/*" onChange={(e) => onAddLocal(e.target.files)} className="hidden" />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="hud-frame p-4">
          <h3 className="font-display text-lg mb-2">Available tracks</h3>
          <ul className="space-y-2">
            {manifest.map((m) => (
              <li key={m} className="flex items-center justify-between">
                <div className="truncate">{m.replace('/audio/', '')}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onSelect(m)} className="btn-ghost p-2 rounded-md">Play</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="hud-frame p-4">
          <h3 className="font-display text-lg mb-2">Your uploads</h3>
          <ul className="space-y-2">
            {userTracks.map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <div className="truncate">{t.name}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onSelect(t.dataUrl)} className="btn-ghost p-2 rounded-md">Play</button>
                  <button
                    onClick={() => {
                      if (!confirm('Remove uploaded track?')) return;
                      removeUserTrack(t.id);
                    }}
                    className="btn-ghost p-2 rounded-md text-red-400"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default StudyingMusic;
