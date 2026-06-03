Place your audio files (MP3/OGG) in this folder.

- Add a `tracks.json` file listing filenames (e.g. `["ambience.mp3","monster_loop.mp3"]`).
- Files referenced in `tracks.json` will appear in the app's track selector.
- Tracks should be reasonably short and loopable.

Example `tracks.json`:

[
  "ambience.mp3",
  "monster_loop.mp3"
]

If you prefer, use the UI's "Add local file" control to play files without editing this manifest (session-only).