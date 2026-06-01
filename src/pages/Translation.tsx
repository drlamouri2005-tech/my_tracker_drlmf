import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Copy,
  History,
  Languages,
  Loader2,
  Pill,
  Search,
  Sparkles,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';

// Restricted to the three working languages requested.
const LANGUAGES: { code: string; label: string }[] = [
  { code: 'auto', label: 'Detect language' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

// Languages that should render right-to-left.
const RTL_CODES = new Set(['ar']);

function labelFor(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

// ---------- Medical terminology lookups (free, no API key) ----------

interface IcdHit {
  code: string;
  name: string;
}

/**
 * NIH Clinical Tables — ICD-10-CM search. Public, CORS-enabled, no key.
 * https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html
 */
async function lookupIcd10(term: string): Promise<IcdHit[]> {
  const url =
    `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=` +
    encodeURIComponent(term);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ICD-10 lookup failed (${res.status})`);
  const data = await res.json();
  // Shape: [total, codes[], extra, [[code, name], ...]]
  const rows: [string, string][] = Array.isArray(data?.[3]) ? data[3] : [];
  return rows.slice(0, 12).map(([code, name]) => ({ code, name }));
}

interface DrugHit {
  rxcui: string;
  name: string;
}

/**
 * RxNav RxNorm — drug name approximate match. Public, CORS-enabled, no key.
 * https://lhncbc.nlm.nih.gov/RxNav/APIs/api-RxNorm.getApproximateMatch.html
 */
async function lookupDrugs(term: string): Promise<DrugHit[]> {
  const url =
    `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?maxEntries=10&term=` +
    encodeURIComponent(term);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drug lookup failed (${res.status})`);
  const data = await res.json();
  const candidates: any[] = data?.approximateGroup?.candidate ?? [];
  // de-duplicate by rxcui
  const seen = new Set<string>();
  const hits: DrugHit[] = [];
  for (const c of candidates) {
    const id = String(c?.rxcui ?? '');
    const name = String(c?.name ?? '').trim();
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    hits.push({ rxcui: id, name });
  }
  return hits.slice(0, 10);
}

// ---------- History (persisted to localStorage, separate from main store) ----------

interface HistoryEntry {
  id: string;
  source: string;
  target: string;
  input: string;
  output: string;
  at: number;
}

const HISTORY_KEY = 'medverse-translation-history-v1';
const HISTORY_MAX = 30;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_MAX)));
  } catch {
    // ignore quota errors
  }
}

/**
 * Free, no-key endpoint that mirrors Google Translate's web widget.
 * Returns an array of segments; we join the first element of each.
 */
async function translateText(text: string, source: string, target: string): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx` +
    `&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}` +
    `&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation failed (${res.status})`);
  const data = await res.json();
  // data[0] = [[translatedSegment, originalSegment, ...], ...]
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Unexpected translation response');
  }
  return data[0]
    .map((seg: unknown[]) => (Array.isArray(seg) ? String(seg[0] ?? '') : ''))
    .join('');
}

export function Translation() {
  const [source, setSource] = useState<string>('auto');
  const [target, setTarget] = useState<string>('en');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Medical terminology lookup state
  const [termQuery, setTermQuery] = useState<string>('');
  const [icdHits, setIcdHits] = useState<IcdHit[]>([]);
  const [drugHits, setDrugHits] = useState<DrugHit[]>([]);
  const [termLoading, setTermLoading] = useState(false);
  const [termError, setTermError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  const charCount = useMemo(() => input.length, [input]);
  const inputIsRtl = source !== 'auto' && RTL_CODES.has(source);
  const outputIsRtl = RTL_CODES.has(target);

  const pushHistory = (entry: Omit<HistoryEntry, 'id' | 'at'>) => {
    setHistory((prev) => {
      // Avoid stacking duplicates back-to-back
      if (
        prev[0] &&
        prev[0].input === entry.input &&
        prev[0].output === entry.output &&
        prev[0].source === entry.source &&
        prev[0].target === entry.target
      ) {
        return prev;
      }
      const next: HistoryEntry[] = [
        { ...entry, id: crypto.randomUUID(), at: Date.now() },
        ...prev,
      ].slice(0, HISTORY_MAX);
      saveHistory(next);
      return next;
    });
  };

  const run = async () => {
    const text = input.trim();
    if (!text) return;
    setError(null);
    setLoading(true);
    setOutput('');
    try {
      const out = await translateText(text, source, target);
      setOutput(out);
      pushHistory({ source, target, input: text, output: out });
    } catch (e: any) {
      setError(e?.message ?? 'Translation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    // 'auto' has no reverse equivalent — fall back to English on swap.
    const newSource = target;
    const newTarget = source === 'auto' ? 'en' : source;
    setSource(newSource);
    setTarget(newTarget);
    setInput(output);
    setOutput(input);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const copyOut = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  const restoreFromHistory = (h: HistoryEntry) => {
    setSource(h.source);
    setTarget(h.target);
    setInput(h.input);
    setOutput(h.output);
    setError(null);
  };

  const removeHistory = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  // Debounced medical terminology lookup
  useEffect(() => {
    const q = termQuery.trim();
    if (q.length < 2) {
      setIcdHits([]);
      setDrugHits([]);
      setTermError(null);
      setTermLoading(false);
      return;
    }
    let cancelled = false;
    setTermLoading(true);
    setTermError(null);
    const handle = setTimeout(async () => {
      try {
        const [icd, drugs] = await Promise.all([
          lookupIcd10(q).catch(() => [] as IcdHit[]),
          lookupDrugs(q).catch(() => [] as DrugHit[]),
        ]);
        if (cancelled) return;
        setIcdHits(icd);
        setDrugHits(drugs);
        if (icd.length === 0 && drugs.length === 0) {
          setTermError('No matches found in ICD-10 or RxNorm.');
        }
      } catch (e: any) {
        if (!cancelled) setTermError(e?.message ?? 'Lookup failed.');
      } finally {
        if (!cancelled) setTermLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [termQuery]);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mono mb-2">◖ INTERPRETER</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Translation deck.</h1>
          <p className="mt-2 text-beige-100/55 max-w-xl">
            Bridge guidelines, papers, and lecture notes across languages — instantly, without
            leaving your study cockpit.
          </p>
        </div>
        <div className="flex items-center gap-2 text-beige-100/60 text-xs">
          <Languages size={14} />
          <span className="label-mono">{labelFor(source)} → {labelFor(target)}</span>
        </div>
      </div>

      {/* Language selectors */}
      <div className="hud-frame p-4 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div>
            <div className="label-mono mb-1.5">From</div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-black/30 border border-beige-300/12 rounded-lg px-3 py-2.5 text-sm text-beige-100 focus:outline-none focus:border-beige-300/30"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swap}
            title="Swap languages"
            className="self-end h-[42px] w-[42px] mx-auto md:mx-0 rounded-lg border border-beige-300/15 bg-white/[0.03] hover:bg-white/[0.06] flex items-center justify-center text-beige-100 transition"
          >
            <ArrowLeftRight size={16} />
          </button>

          <div>
            <div className="label-mono mb-1.5">To</div>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-black/30 border border-beige-300/12 rounded-lg px-3 py-2.5 text-sm text-beige-100 focus:outline-none focus:border-beige-300/30"
            >
              {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editors */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Input */}
        <div className="hud-frame p-4 relative">
          <span className="corner-mark border-t border-l top-2 left-2" />
          <span className="corner-mark border-t border-r top-2 right-2" />
          <span className="corner-mark border-b border-l bottom-2 left-2" />
          <span className="corner-mark border-b border-r bottom-2 right-2" />

          <div className="flex items-center justify-between mb-2 px-1">
            <div className="label-mono">SOURCE · {labelFor(source)}</div>
            <div className="text-[11px] text-beige-100/40">{charCount} chars</div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a passage, a question, a sentence…"
            rows={10}
            dir={inputIsRtl ? 'rtl' : 'ltr'}
            className="w-full resize-y bg-black/20 border border-beige-300/10 rounded-lg p-3 text-[15px] leading-relaxed text-beige-100 placeholder:text-beige-100/30 focus:outline-none focus:border-beige-300/25"
          />
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={clearAll}
              disabled={!input && !output}
              className="text-xs flex items-center gap-1.5 text-beige-100/60 hover:text-beige-100 disabled:opacity-30"
            >
              <Trash2 size={13} /> Clear
            </button>
            <button
              type="button"
              onClick={run}
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Translating…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Translate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="hud-frame p-4 relative">
          <span className="corner-mark border-t border-l top-2 left-2" />
          <span className="corner-mark border-t border-r top-2 right-2" />
          <span className="corner-mark border-b border-l bottom-2 left-2" />
          <span className="corner-mark border-b border-r bottom-2 right-2" />

          <div className="flex items-center justify-between mb-2 px-1">
            <div className="label-mono">TARGET · {labelFor(target)}</div>
            <button
              type="button"
              onClick={copyOut}
              disabled={!output}
              className="text-xs flex items-center gap-1.5 text-beige-100/60 hover:text-beige-100 disabled:opacity-30"
            >
              <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <motion.div
            key={output || 'empty'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            dir={outputIsRtl ? 'rtl' : 'ltr'}
            className="min-h-[244px] bg-black/20 border border-beige-300/10 rounded-lg p-3 text-[15px] leading-relaxed text-beige-100 whitespace-pre-wrap"
          >
            {loading ? (
              <span className="text-beige-100/40">Decoding signal…</span>
            ) : output ? (
              output
            ) : (
              <span className="text-beige-100/30">Translation will appear here.</span>
            )}
          </motion.div>

          {error && (
            <div className="mt-3 text-xs text-red-300/90 bg-red-500/5 border border-red-400/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Medical terminology lookup */}
      <div className="hud-frame p-4 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />

        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Stethoscope size={14} className="text-beige-100/70" />
            <div className="label-mono">MEDICAL TERMINOLOGY</div>
          </div>
          <div className="text-[11px] text-beige-100/40">ICD-10-CM · RxNorm</div>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-100/40 pointer-events-none"
          />
          <input
            type="text"
            value={termQuery}
            onChange={(e) => setTermQuery(e.target.value)}
            placeholder="Look up a diagnosis, symptom, or drug (e.g. hypertension, amoxicillin)"
            className="w-full bg-black/30 border border-beige-300/12 rounded-lg pl-9 pr-9 py-2.5 text-sm text-beige-100 placeholder:text-beige-100/30 focus:outline-none focus:border-beige-300/30"
          />
          {termQuery && (
            <button
              type="button"
              onClick={() => setTermQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-beige-100/40 hover:text-beige-100"
              title="Clear"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {termError && termQuery.trim().length >= 2 && !termLoading && (
          <div className="mt-3 text-xs text-beige-100/50">{termError}</div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* ICD-10 results */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="label-mono text-beige-100/70">Diagnoses · ICD-10</span>
              {termLoading && <Loader2 size={12} className="animate-spin text-beige-100/50" />}
            </div>
            <ul className="space-y-1.5 min-h-[40px]">
              {icdHits.length === 0 && !termLoading && (
                <li className="text-xs text-beige-100/30">
                  {termQuery.trim().length < 2 ? 'Type at least 2 characters.' : '—'}
                </li>
              )}
              {icdHits.map((hit) => (
                <li
                  key={hit.code}
                  className="flex items-start gap-2 text-sm bg-black/20 border border-beige-300/10 rounded-md px-2.5 py-1.5"
                >
                  <span className="font-mono text-[11px] text-beige-100/70 mt-0.5 shrink-0 min-w-[58px]">
                    {hit.code}
                  </span>
                  <span className="text-beige-100/90">{hit.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drug results */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pill size={12} className="text-beige-100/60" />
              <span className="label-mono text-beige-100/70">Drugs · RxNorm</span>
              {termLoading && <Loader2 size={12} className="animate-spin text-beige-100/50" />}
            </div>
            <ul className="space-y-1.5 min-h-[40px]">
              {drugHits.length === 0 && !termLoading && (
                <li className="text-xs text-beige-100/30">
                  {termQuery.trim().length < 2 ? 'Type at least 2 characters.' : '—'}
                </li>
              )}
              {drugHits.map((hit) => (
                <li
                  key={hit.rxcui}
                  className="flex items-start gap-2 text-sm bg-black/20 border border-beige-300/10 rounded-md px-2.5 py-1.5"
                >
                  <span className="font-mono text-[11px] text-beige-100/60 mt-0.5 shrink-0 min-w-[58px]">
                    {hit.rxcui}
                  </span>
                  <span className="text-beige-100/90">{hit.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent translations */}
      <div className="hud-frame p-4 relative">
        <span className="corner-mark border-t border-l top-2 left-2" />
        <span className="corner-mark border-t border-r top-2 right-2" />
        <span className="corner-mark border-b border-l bottom-2 left-2" />
        <span className="corner-mark border-b border-r bottom-2 right-2" />

        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <History size={14} className="text-beige-100/70" />
            <div className="label-mono">RECENT TRANSLATIONS</div>
          </div>
          <button
            type="button"
            onClick={clearHistory}
            disabled={history.length === 0}
            className="text-[11px] flex items-center gap-1.5 text-beige-100/60 hover:text-beige-100 disabled:opacity-30"
          >
            <Trash2 size={12} /> Clear all
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-xs text-beige-100/35 px-1 py-3">
            Your recent translations will appear here, saved on this device.
          </div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {history.slice(0, 8).map((h) => {
                const rtlIn = RTL_CODES.has(h.source);
                const rtlOut = RTL_CODES.has(h.target);
                return (
                  <motion.li
                    key={h.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="group bg-black/20 border border-beige-300/10 rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="label-mono text-beige-100/55">
                        {labelFor(h.source)} → {labelFor(h.target)}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => restoreFromHistory(h)}
                          className="text-[11px] text-beige-100/60 hover:text-beige-100"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHistory(h.id)}
                          className="text-beige-100/40 hover:text-beige-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div
                        dir={rtlIn ? 'rtl' : 'ltr'}
                        className="text-beige-100/70 line-clamp-2"
                      >
                        {h.input}
                      </div>
                      <div
                        dir={rtlOut ? 'rtl' : 'ltr'}
                        className="text-beige-100 line-clamp-2"
                      >
                        {h.output}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="text-[11px] text-beige-100/35 px-1">
        Translation via the public Google Translate endpoint. Terminology lookups use the U.S.
        National Library of Medicine (NIH Clinical Tables &amp; RxNav) — free, no key. For
        sensitive clinical data, prefer a vetted enterprise service.
      </div>
    </div>
  );
}
