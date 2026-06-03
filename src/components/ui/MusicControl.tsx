import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Music, Volume2, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { playTrack, stop, setVolume, isPlaying } from '../../lib/music';

export function MusicControl() {
  const musicOn = useStore((s) => s.musicOn);
  const musicVolume = useStore((s) => s.musicVolume);
  const musicTrack = useStore((s) => s.musicTrack);
  const setMusicOn = useStore((s) => s.setMusicOn);
  const setMusicVolumeStore = useStore((s) => s.setMusicVolume);
  const setMusicTrackStore = useStore((s) => s.setMusicTrack);

  const [manifest, setManifest] = useState<string[]>([]);
  const [localTracks, setLocalTracks] = useState<{ name: string; url: string }[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // try to load public/audio/tracks.json manifest
    (async () => {
      try {
        const r = await fetch('/audio/tracks.json');
        if (!r.ok) return;
        const arr = await r.json();
        if (Array.isArray(arr)) {
          setManifest(arr.map((f) => `/audio/${f}`));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // react to store changes
  useEffect(() => {
    if (musicOn) {
      const src = musicTrack ?? (manifest[0] ?? localTracks[0]?.url ?? null);
      if (src) playTrack(src, musicVolume, true);
    } else {
      stop();
    }
    setVolume(musicVolume);
  }, [musicOn, musicTrack, musicVolume, manifest, localTracks]);

  // try autoplay: if blocked, we'll retry on first interaction
  useEffect(() => {
    if (!musicOn) return;
    const tryPlay = async () => {
      const src = musicTrack ?? (manifest[0] ?? localTracks[0]?.url ?? null);
      if (!src) return;
      try {
        playTrack(src, musicVolume, true);
      } catch (e) {
        // ignore
      }
    };
    tryPlay();

    const onFirst = () => {
      if (!isPlaying()) tryPlay();
      window.removeEventListener('pointerdown', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
    window.addEventListener('pointerdown', onFirst);
    window.addEventListener('keydown', onFirst);
    return () => {
      window.removeEventListener('pointerdown', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
  }, []); // run once

  const toggle = () => setMusicOn(!musicOn);

  const onVolume = (v: number) => {
    setMusicVolumeStore(v);
    setVolume(v);
  };

  const onSelect = (val: string) => {
    setMusicTrackStore(val);
  };

  const onAddLocal = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const url = URL.createObjectURL(f);
    const name = f.name;
    setLocalTracks((s) => [{ name, url }, ...s]);
    setMusicTrackStore(url);
    setMusicOn(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className="btn-ghost p-2 rounded-md"
        title={musicOn ? 'Pause audio' : 'Play audio'}
        aria-pressed={musicOn}
      >
        {musicOn ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <div className="flex items-center gap-2">
        <Music size={14} />
        <select
          value={musicTrack ?? ''}
          onChange={(e) => onSelect(e.target.value || null)}
          className="bg-transparent text-sm"
          aria-label="Select ambient track"
        >
          <option value="">(default)</option>
          {manifest.map((m) => (
            <option key={m} value={m}>
              {m.replace('/audio/', '')}
            </option>
          ))}
          {localTracks.map((t) => (
            <option key={t.url} value={t.url}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 size={14} />
        <input
          aria-label="Music volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={musicVolume}
          onChange={(e) => onVolume(Number(e.target.value))}
        />
      </div>

      <label className="btn-ghost p-2 rounded-md" title="Add local file">
        <Plus size={14} />
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          onChange={(e) => onAddLocal(e.target.files)}
          className="hidden"
        />
      </label>
    </div>
  );
}

export default MusicControl;
