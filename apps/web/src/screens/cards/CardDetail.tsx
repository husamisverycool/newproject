import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { FLAIR, RARITY_NAME, ios, symbolById, tcg, telegram } from '@app/shared';
import { Icon } from '../../components/Icon';
import { TcgCard, cardNumber, RarityMark } from '../../components/cards/TcgCard';
import { ImmersiveView } from '../../components/cards/ImmersiveView';
import { CollectibleSheet, FlairSheet } from '../../components/cards/CardSheets';
import type { BinderResponse } from '../../lib/queries';
import type { CardT } from '../../lib/types';
import { haptic } from '../../lib/feedback';
import t from './tcg.module.css';

/**
 * A card picked up from My Cards (TCG Pocket): the card enlarges; "tap again to fill the screen"; for an
 * Immersive Rare, "tap and hold" plays it [V]. Actions: Obtain Flair (TCG), Upgrade Card / the collectible
 * (Telegram), Trade, Binders, Display Boards.
 */
export function CardDetail({ card, data, groupId, onClose, onShowcase }: {
  card: CardT;
  data: BinderResponse;
  groupId: string;
  onClose: () => void;
  onShowcase: (kind: 'binder' | 'display', card: CardT) => void;
}) {
  const nav = useNavigate();
  const [big, setBig] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [flair, setFlair] = useState(false);
  const [collectible, setCollectible] = useState(false);
  const spare = (card.copies ?? 1) - 1;
  const canFlair = !card.flair && spare >= FLAIR.duplicates;
  const sym = card.serial ? symbolById(card.traits?.symbol) : null;
  const tradeLocked = !data.blitz.isOpen && (card.rarity === 'holo' || card.rarity === 'immersive');

  return (
    <motion.div className={t.detail} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className={`ios-glass-circle ${t.detailClose}`} onClick={onClose} aria-label={ios.close} style={{ color: '#fff' }}>
        <Icon name="close" size={20} />
      </button>
      <motion.div
        className={t.detailCard}
        data-big={big || undefined}
        initial={{ scale: 0.6, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <TcgCard
          card={card}
          tilt
          onClick={() => { haptic('light'); setBig((b) => !b); }}
          onHoldStart={card.rarity === 'immersive' && card.post?.media.live ? () => setImmersive(true) : undefined}
        />
      </motion.div>
      <div className={t.detailInfo} onClick={(e) => e.stopPropagation()}>
        <RarityMark rarity={card.rarity} size={16} />
        {RARITY_NAME[card.rarity]}
        <small>{cardNumber(card.number)}</small>
      </div>

      <div className={t.actions} onClick={(e) => e.stopPropagation()}>
        <button className={t.action} disabled={!canFlair} onClick={() => setFlair(true)}>
          <span>
            <Icon name="sparkles" size={22} />
          </span>
          {tcg.obtainFlair}
        </button>
        <button className={t.action} data-accent={card.serial ? '' : undefined} onClick={() => setCollectible(true)}>
          <span>{card.serial ? sym?.name : <Icon name="wand" size={22} />}</span>
          {card.serial ? `#${card.serial}` : telegram.upgradeTitle}
        </button>
        <button className={t.action} disabled={tradeLocked} onClick={() => nav(`/g/${groupId}/trades?offer=${card.id}`)}>
          <span>
            <Icon name={tradeLocked ? 'lock' : 'trade'} size={22} />
          </span>
          {tcg.trade}
        </button>
        <button className={t.action} onClick={() => onShowcase('binder', card)}>
          <span>
            <Icon name="grid" size={22} />
          </span>
          {tcg.binders}
        </button>
        <button className={t.action} onClick={() => onShowcase('display', card)}>
          <span>
            <Icon name="photo" size={22} />
          </span>
          {tcg.displayBoards}
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <FlairSheet open={flair} onClose={() => setFlair(false)} card={card} dust={data.shinedust} groupId={groupId} />
        <CollectibleSheet open={collectible} onClose={() => setCollectible(false)} groupId={groupId} cardId={card.id} dust={data.shinedust} />
      </div>
      <AnimatePresence>{immersive && <ImmersiveView card={card} onClose={() => setImmersive(false)} />}</AnimatePresence>
    </motion.div>
  );
}
