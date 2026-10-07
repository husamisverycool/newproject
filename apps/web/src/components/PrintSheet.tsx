import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ios, retro, spec } from '@app/shared';
import { api } from '../lib/api';
import { haptic } from '../lib/feedback';
import { queryClient } from '../lib/queries';
import type { PublicUser } from '../lib/types';
import { Avatar, Row, Section, Sheet, Spinner } from './ios';
import { Icon } from './Icon';
import s from './print.module.css';

/**
 * Print (spec §U "postcards, zines and an annual printed yearbook, with group checkout where each member
 * chips in (Partiful's payment-link pattern)"; §I "printed figurine cards"). The order sheet is Retro's
 * postcard sheet [I] (retro-03): the picture, "Mailing Address" with the Contacts address fields [HIG],
 * "Total" and the price, a white capsule. Retro's button reads "Send Postcard" [I]; the other items have
 * no sourced label, so their button shows the price, as App Store purchase buttons do [HIG]. Once ordered,
 * the order sits in the group, and each member chips in their share from it.
 */

export type PrintKind = 'postcard' | 'zine' | 'yearbook' | 'figurine_card';
export const PRINT_NAME: Record<PrintKind, string> = { postcard: retro.postcard, zine: spec.zine, yearbook: spec.yearbook, figurine_card: spec.figurineCards };

interface Order {
  id: string;
  kind: PrintKind;
  items: string[];
  total: number;
  paid: number;
  status: string;
  createdAt: number;
  createdBy: PublicUser | null;
  preview: string | null;
  chips: { user: PublicUser | null; usd: number }[];
}
type Prices = Record<PrintKind, { name: string | null; usd: number }>;

export const useOrders = (groupId: string | undefined) =>
  useQuery({ queryKey: ['orders', groupId], queryFn: () => api.get<{ orders: Order[]; prices: Prices }>(`/groups/${groupId}/orders`), enabled: Boolean(groupId) });

/** Order a print for the group: the picture, the address, the total. */
export function PrintSheet({ open, onClose, groupId, kind, items, preview }: { open: boolean; onClose: () => void; groupId: string; kind: PrintKind; items: string[]; preview: string | null }) {
  const orders = useOrders(open ? groupId : undefined);
  const [address, setAddress] = useState<string[]>(['', '', '', '']);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const price = orders.data?.prices[kind]?.usd ?? null;
  const ready = Boolean(address[0].trim() && address[1].trim() && address[2].trim() && items.length);
  const order = async () => {
    if (!ready) return;
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/orders`, { kind, items, address });
      haptic('success');
      setDone(true);
      void queryClient.invalidateQueries({ queryKey: ['orders', groupId] });
      window.setTimeout(() => {
        setDone(false);
        onClose();
      }, 900);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onClose={onClose} dark title={PRINT_NAME[kind]} trailing={<button className={s.x} onClick={onClose} aria-label={ios.close}><Icon name="close" size={16} strokeWidth={2.6} /></button>}>
      <div className={s.sheet}>
        <div className={s.photo}>{preview ? <img src={preview} alt="" /> : <span className={s.blank}><Icon name="book" size={48} strokeWidth={1.4} /></span>}</div>
        <div className={s.address}>
          <span className={s.label}>{retro.mailingAddress}</span>
          {ios.addressFields.map((f, k) => (
            <input key={f} className={s.field} placeholder={f} value={address[k]} onChange={(e) => setAddress(address.map((x, n) => (n === k ? e.target.value : x)))} />
          ))}
        </div>
        <div className={s.total}>
          <span>{retro.total}</span>
          <span>{price !== null ? ios.usd(price) : ''}</span>
        </div>
        <button className={s.white} onClick={() => void order()} disabled={!ready || busy || price === null}>
          {done ? <Icon name="check" size={20} strokeWidth={2.8} /> : busy ? <Spinner size={18} /> : price !== null ? ios.usd(price) : ''}
        </button>
      </div>
    </Sheet>
  );
}

/** The group's print orders, each with how much has come in [HIG UIProgressView]; tap one to chip in. */
export function OrdersSection({ groupId, memberCount }: { groupId: string; memberCount: number }) {
  const q = useOrders(groupId);
  const [open, setOpen] = useState<Order | null>(null);
  const list = q.data?.orders ?? [];
  if (!list.length) return null;
  return (
    <>
      <Section>
        {list.map((o) => (
          <Row
            key={o.id}
            icon={o.preview ? <img className={s.thumb} src={o.preview} alt="" /> : <span className={s.thumb}><Icon name="book" size={18} /></span>}
            sepInset={64}
            title={PRINT_NAME[o.kind] ?? o.kind}
            sub={
              <span className={s.bar}>
                <i style={{ width: `${Math.min(100, (o.paid / Math.max(0.01, o.total)) * 100)}%` }} />
              </span>
            }
            value={o.status === 'paid' ? <Icon name="check" size={18} strokeWidth={2.6} className={s.paidMark} /> : ios.usd(o.total - o.paid)}
            onClick={() => setOpen(o)}
          />
        ))}
      </Section>
      <OrderSheet order={open ? list.find((o) => o.id === open.id) ?? open : null} groupId={groupId} memberCount={memberCount} onClose={() => setOpen(null)} />
    </>
  );
}

/** One order: who chipped in, what's left, and your share (an even split of the total, App Store-style price button [HIG]). */
function OrderSheet({ order, groupId, memberCount, onClose }: { order: Order | null; groupId: string; memberCount: number; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!order) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const left = Math.max(0, Math.round((order.total - order.paid) * 100) / 100);
  const share = Math.min(left, Math.ceil((order.total / Math.max(1, memberCount)) * 100) / 100);
  const chip = async () => {
    setBusy(true);
    try {
      await api.post(`/orders/${order.id}/chip`, { usd: share });
      haptic('success');
      await queryClient.invalidateQueries({ queryKey: ['orders', groupId] });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open onClose={onClose} dark title={PRINT_NAME[order.kind]} trailing={<button className={s.x} onClick={onClose} aria-label={ios.close}><Icon name="close" size={16} strokeWidth={2.6} /></button>}>
      <div className={s.sheet}>
        {order.preview && (
          <div className={s.photo}>
            <img src={order.preview} alt="" />
          </div>
        )}
        <div className={s.total}>
          <span>{retro.total}</span>
          <span>{ios.usd(order.total)}</span>
        </div>
        <span className={s.bigBar}>
          <i style={{ width: `${Math.min(100, (order.paid / Math.max(0.01, order.total)) * 100)}%` }} />
        </span>
        {order.chips.length > 0 && (
          <Section>
            {order.chips.map((c, i) => (
              <Row key={c.user?.id ?? i} icon={<Avatar user={c.user} size={30} />} sepInset={58} title={c.user?.name ?? ''} value={ios.usd(c.usd)} />
            ))}
          </Section>
        )}
        {order.status === 'paid' ? (
          <div className={s.paid}>
            <Icon name="check" size={22} strokeWidth={2.8} />
          </div>
        ) : (
          <button className={s.white} onClick={() => void chip()} disabled={busy || share <= 0}>
            {busy ? <Spinner size={18} /> : ios.usd(share)}
          </button>
        )}
      </div>
    </Sheet>
  );
}

/** "Print" [HIG] under a zine or a figurine: opens the order sheet for it. */
export function PrintButton({ groupId, kind, objectId, preview, className }: { groupId: string; kind: PrintKind; objectId: string; preview: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        <Icon name="print" size={18} strokeWidth={2.2} />
        {ios.print}
      </button>
      <PrintSheet open={open} onClose={() => setOpen(false)} groupId={groupId} kind={kind} items={[objectId]} preview={preview} />
    </>
  );
}
