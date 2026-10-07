import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useUi } from '../lib/store';
import { Wordmark } from './ui';

/** iOS notification banners, sliding from the top of the device. */
export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  const nav = useNavigate();
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => dismiss(toasts[0].id), 4200);
    return () => clearTimeout(t);
  }, [toasts, dismiss]);
  const t = toasts[0];
  return (
    <div className="toasts">
      <AnimatePresence>
        {t && (
          <motion.button
            key={t.id}
            className="toast"
            initial={{ y: -90, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, i) => i.offset.y < -20 && dismiss(t.id)}
            onClick={() => {
              dismiss(t.id);
              if (t.groupId && t.kind === 'trade_offer') nav(`/g/${t.groupId}/trades`);
              else if (t.groupId && t.kind === 'game_open') nav(`/g/${t.groupId}/game`);
              else if (t.groupId && t.kind === 'wonder_pick') nav(`/g/${t.groupId}/wonder`);
              else if (t.kind === 'likeness_used') nav('/me/likeness');
            }}
          >
            <span className="toast-icon">
              <Wordmark size={11} />
            </span>
            <span className="toast-text">
              <span className="toast-title">{t.title}</span>
              <span className="toast-body">{t.body}</span>
            </span>
            <span className="toast-time">now</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
