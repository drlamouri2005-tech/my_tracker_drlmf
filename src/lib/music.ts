import { Howl } from 'howler';

let howl: Howl | null = null;
let currentSrc: string | null = null;

export function playTrack(src: string, volume = 0.6, loop = true) {
  try {
    if (!src) return;
    if (currentSrc === src && howl) {
      howl.volume(volume);
      if (!howl.playing()) howl.play();
      return;
    }
    if (howl) {
      try {
        howl.stop();
        howl.unload();
      } catch (e) {
        // ignore
      }
      howl = null;
    }
    currentSrc = src;
    howl = new Howl({
      src: [src],
      html5: true,
      loop,
      volume,
    });
    howl.play();
  } catch (e) {
    // swallow errors
    console.error('playTrack error', e);
  }
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
      currentSrc = null;
    }
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
