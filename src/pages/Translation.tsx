import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Copy, Languages, Loader2, Sparkles, Trash2 } from 'lucide-react';

// Curated set of languages — common medical/study targets first.
const LANGUAGES: { code: string; label: string }[] = [
  { code: 'auto', label: 'Detect language' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
  { code: 'pl', label: 'Polski' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'la', label: 'Latina' },
];

function labelFor(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
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

  const charCount = useMemo(() => input.length, [input]);

  const run = async () => {
    const text = input.trim();
    if (!text) return;
    setError(null);
    setLoading(true);
    setOutput('');
    try {
      const out = await translateText(text, source, target);
      setOutput(out);
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

      <div className="text-[11px] text-beige-100/35 px-1">
        Powered by the public Google Translate endpoint. For sensitive clinical data, prefer a
        vetted enterprise service.
      </div>
    </div>
  );
}
