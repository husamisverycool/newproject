import { useMemo } from 'react';
import { motion } from 'motion/react';

/** Locket: reactions make "emojis rain down on their photo". */
export function EmojiRain({ emoji, count = 22 }: { emoji: string; count?: number }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 22 + Math.random() * 26,
        delay: Math.random() * 0.6,
        duration: 1.2 + Math.random() * 0.9,
        rot: (Math.random() - 0.5) * 80,
        drift: (Math.random() - 0.5) * 40,
      })),
    [count],
  );
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 'inherit' }}>
      {drops.map((d) => (
        <motion.span
          key={d.id}
          initial={{ y: '-15%', x: 0, opacity: 0, rotate: 0 }}
          animate={{ y: '115%', x: d.drift, opacity: [0, 1, 1, 0.9], rotate: d.rot }}
          transition={{ duration: d.duration, delay: d.delay, ease: [0.4, 0, 0.9, 0.6] }}
          style={{ position: 'absolute', top: '-10%', left: `${d.x}%`, fontSize: d.size, lineHeight: 1 }}
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
}
