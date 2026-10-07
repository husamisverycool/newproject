import { useEffect } from 'react';
import { motion } from 'motion/react';
import { RARITY_MARK, tcg } from '@app/shared';
import type { CardFaceT } from '../../lib/types';
import { haptic, sfx } from '../../lib/feedback';
import { cardName } from './TcgCard';

/**
 * Immersive Rare playback (TCG Pocket): tap and hold and "the card expands to fill the display, with music
 * and motion" [V]; the animation "doesn't just zoom in, it pans through the card's artwork and often extends
 * beyond the visible borders" [V-weak]. Ours plays the moment's Live clip (post.media.live) and pans it.
 */
export function ImmersiveView({ card, onClose }: { card: CardFaceT; onClose: () => void }) {
  const post = card.post;
  useEffect(() => {
    haptic('medium');
    sfx.develop();
  }, []);
  if (!post) return null;
  const src = post.media.live ?? post.media.main;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, zIndex: 95, background: '#000', overflow: 'hidden' }}
    >
      <motion.div
        initial={{ scale: 0.6, borderRadius: 18 }}
        animate={{ scale: 1, borderRadius: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 20 }}
        style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      >
        <motion.img
          src={src}
          alt=""
          draggable={false}
          initial={{ scale: 1.05, x: '0%', y: '0%' }}
          animate={{ scale: [1.05, 1.5, 1.35, 1.2], x: ['0%', '-9%', '8%', '0%'], y: ['0%', '6%', '-5%', '0%'] }}
          transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '80px 22px calc(var(--safe-bottom) + 26px)', background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', color: '#fff' }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <div style={{ font: '700 26px/1.1 var(--font-card)' }}>{cardName(post)}</div>
          <div style={{ font: '500 14px/1.4 var(--font-card)', opacity: 0.85, marginTop: 6 }}>{tcg.illus(post.user.name)}</div>
          <div style={{ font: '600 20px/1 var(--font-sf)', color: 'var(--tcg-gold)', marginTop: 6, textShadow: '0 0 10px rgba(255,204,0,0.7)' }}>{RARITY_MARK[card.rarity]}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
