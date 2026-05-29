import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Notes() {
  const { notes, modules, addNote, updateNote, removeNote } = useStore();
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);

  const active = notes.find((n) => n.id === activeId) ?? null;

  const create = () => {
    const id = addNote('Untitled fragment', '');
    setActiveId(id);
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono mb-2">◖ ARCHIVE</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">The leather journal.</h1>
          <p className="mt-2 text-beige-100/55 max-w-xl">
            Fragments, theorems, fleeting clarities. Capture them before they dissolve.
          </p>
        </div>
        <button onClick={create} className="btn-primary">
          <Plus size={14} /> New entry
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-5 min-h-[520px]">
        {/* List */}
        <div className="lg:col-span-4 hud-frame p-4 relative">
          <span className="corner-mark border-t border-l top-2 left-2" />
          <span className="corner-mark border-t border-r top-2 right-2" />
          <span className="corner-mark border-b border-l bottom-2 left-2" />
          <span className="corner-mark border-b border-r bottom-2 right-2" />
          <div className="label-mono mb-3 px-1">ENTRIES · {notes.length}</div>
          <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            <AnimatePresence>
              {notes.length === 0 && (
                <li className="text-beige-100/40 text-sm py-8 text-center">
                  No entries yet.
                </li>
              )}
              {notes
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((n) => (
                  <motion.li
                    layout
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      onClick={() => setActiveId(n.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition ${
                        activeId === n.id
                          ? 'border-beige-300/30 bg-beige-300/[0.06]'
                          : 'border-beige-300/[0.06] hover:bg-white/[0.025]'
                      }`}
                    >
                      <div className="text-sm text-beige-100/90 truncate">
                        {n.title || 'Untitled'}
                      </div>
                      <div className="label-mono mt-1 flex items-center gap-2">
                        <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                        {n.moduleId && (
                          <span>· {modules.find((m) => m.id === n.moduleId)?.code}</span>
                        )}
                      </div>
                    </button>
                  </motion.li>
                ))}
            </AnimatePresence>
          </ul>
        </div>

        {/* Editor */}
        <div className="lg:col-span-8 hud-frame p-5 md:p-7 relative flex flex-col">
          <span className="corner-mark border-t border-l top-2 left-2" />
          <span className="corner-mark border-t border-r top-2 right-2" />
          <span className="corner-mark border-b border-l bottom-2 left-2" />
          <span className="corner-mark border-b border-r bottom-2 right-2" />

          {active ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <input
                  value={active.title}
                  onChange={(e) => updateNote(active.id, { title: e.target.value })}
                  className="flex-1 bg-transparent outline-none font-display text-2xl md:text-3xl text-beige-100"
                  placeholder="Title…"
                />
                <select
                  value={active.moduleId ?? ''}
                  onChange={(e) =>
                    updateNote(active.id, { moduleId: e.target.value || undefined })
                  }
                  className="bg-ink-800 border border-beige-300/10 rounded-lg px-2 py-1.5 text-xs text-beige-100/70"
                >
                  <option value="">No module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} · {m.short}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    removeNote(active.id);
                    setActiveId(null);
                  }}
                  className="btn-ghost !px-3"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="label-mono mb-3">
                Last touched · {new Date(active.updatedAt).toLocaleString()}
              </div>
              <textarea
                value={active.body}
                onChange={(e) => updateNote(active.id, { body: e.target.value })}
                placeholder="Write your thoughts here…"
                className="flex-1 w-full bg-transparent outline-none resize-none text-beige-100/85 leading-relaxed font-serif text-[15.5px] min-h-[420px]"
              />
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-center">
              <div>
                <div className="font-display text-2xl text-beige-100/40">
                  Select or create an entry.
                </div>
                <button onClick={create} className="btn-primary mt-5">
                  <Plus size={14} /> New entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
