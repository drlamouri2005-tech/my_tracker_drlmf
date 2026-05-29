import type { ReactNode } from 'react';

export function StatPill({
  label,
  value,
  icon,
  accent = '#D9C7A7',
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="glass px-4 py-3 flex items-center gap-3">
      {icon && (
        <div
          className="w-9 h-9 rounded-lg grid place-items-center"
          style={{ background: `${accent}14`, color: accent, border: `1px solid ${accent}22` }}
        >
          {icon}
        </div>
      )}
      <div>
        <div className="label-mono">{label}</div>
        <div className="font-display text-lg leading-tight">{value}</div>
      </div>
    </div>
  );
}
