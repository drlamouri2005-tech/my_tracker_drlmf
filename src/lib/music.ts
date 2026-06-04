import { Howl } from 'howler';
import { getTrackBlob } from './idbTracks';

let howl: Howl | null = null;
let currentSrc: string | null = null; // logical source (may be idb:... or url)
let currentObjectUrl: string | null = null; // created object URL for blob playback

export function playTrack(src: string, volume = 0.6, loop = true) {
  (async () => {
    try {
      if (!src) return;
      // if the requested logical source is already playing, just adjust volume
      if (currentSrc === src && howl) {
        howl.volume(volume);
        if (!howl.playing()) howl.play();
        return;
      }

      // stop and cleanup previous Howl
      if (howl) {
        try {
          howl.stop();
          howl.unload();
        } catch (e) {
          // ignore
        }
        howl = null;
      }

      // revoke previous object URL if present
      if (currentObjectUrl) {
        try {
          URL.revokeObjectURL(currentObjectUrl);
        } catch (e) {
          // ignore
        }
        currentObjectUrl = null;
      }

      // support idb: prefix for tracks stored in IndexedDB
      let srcToUse = src;
      if (src.startsWith('idb:')) {
        const id = src.slice(4);
        const blob = await getTrackBlob(id);
        if (!blob) {
          console.warn('Missing audio blob for id', id);
          return;
        }
        const obj = URL.createObjectURL(blob);
        currentObjectUrl = obj;
        srcToUse = obj;
      }

      currentSrc = src;
      howl = new Howl({
        src: [srcToUse],
        html5: true,
        loop,
        volume,
      });
      howl.play();
    } catch (e) {
      console.error('playTrack error', e);
    }
  })();
}

export function stop() {
  try {
    if (howl) {
      howl.stop();
      try {
        howl.unload();
      } catch (e) {
        // ignore
      }
      howl = null;
    }
    if (currentObjectUrl) {
      try {
        URL.revokeObjectURL(currentObjectUrl);
      } catch (e) {
        // ignore
      }
      currentObjectUrl = null;
    }
    currentSrc = null;
  } catch (e) {
    // ignore
  }
}

export function setVolume(v: number) {
  try {
    if (howl) howl.volume(v);
  } catch (e) {
    // ignore
  }
}

export function isPlaying() {
  try {
    return !!howl && howl.playing();
  } catch (e) {
    return false;
  }
}

export function getCurrentSrc() {
  return currentSrc;
}
