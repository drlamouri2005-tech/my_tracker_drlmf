import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface Props extends HTMLMotionProps<'div'> {
  children: ReactNode;
  title?: string;
  sub?: string;
  right?: ReactNode;
  corners?: boolean;
}

export function Panel({ children, title, sub, right, corners = true, className = '', ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`hud-frame p-5 md:p-6 ${className}`}
      {...rest}
    >
      {corners && (
        <>
          <span className="corner-mark border-t border-l top-2 left-2" />
          <span className="corner-mark border-t border-r top-2 right-2" />
          <span className="corner-mark border-b border-l bottom-2 left-2" />
          <span className="corner-mark border-b border-r bottom-2 right-2" />
        </>
      )}
      {(title || right) && (
        <div className="flex items-end justify-between mb-4 gap-4">
          <div>
            {sub && <div className="label-mono mb-1">{sub}</div>}
            {title && <h3 className="font-display text-lg md:text-xl tracking-tight">{title}</h3>}
          </div>
          {right}
        </div>
      )}
      {children}
    </motion.div>
  );
}
