import { useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { BRAND, gphotos, ios } from '@app/shared';
import { Alert, Button, Section, Spinner } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { api, ApiError } from '../../lib/api';
import { useActiveGroup } from '../../lib/queries';
import type { LikenessObject, Post } from '../../lib/types';
import s from './create.module.css';

/**
 * Pieces shared by the Create flows. Every label comes from a deck:
 * - result actions "Save" · "Regenerate" · "Share" — Google Photos Me Meme [V] (research/16 §1);
 * - "AI info" with "Credit" and "Digital source type" — Google Photos Details [V] (research/06 §1.6);
 * - the photo picker is the stock iOS PHPicker grid [HIG] (three columns, 2 pt gaps).
 */

/** The group a creation belongs to: `?group=` when a post sent us here, else the active group. */
export function useCreateGroup() {
  const [params] = useSearchParams();
  const { group, groups } = useActiveGroup();
  const gid = params.get('group');
  return groups.find((g) => g.id === gid) ?? group;
}

export const usePost = (postId: string | null) =>
  useQuery({ queryKey: ['post', postId], queryFn: () => api.get<{ post: Post }>(`/posts/${postId}`), enabled: Boolean(postId) });

/** Photos the group shared, newest first, without the blurred (not yet unlocked) ones. */
export function pickable(posts: Post[] | undefined) {
  return (posts ?? []).filter((p) => !p.blurred && p.media?.main);
}

/** PHPicker-style grid [HIG]: square thumbnails, three columns, 2 pt gutters, a check badge on the selection. */
export function PhotoGrid({ posts, selected, onPick }: { posts: Post[]; selected: string | null; onPick: (p: Post) => void }) {
  return (
    <div className={s.grid}>
      {posts.map((p) => (
        <button key={p.id} className={s.cell} onClick={() => onPick(p)} aria-pressed={selected === p.id} aria-label={p.caption ?? p.user.name}>
          <img src={p.media.thumb ?? p.media.main} alt="" loading="lazy" />
          {selected === p.id && (
            <span className={s.check}>
              <Icon name="check" size={14} strokeWidth={3} color="#fff" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** A Settings-style row that opens the Photos picker (file input) [HIG]. */
export function PickRow({ label, onFile, capture }: { label: string; onFile: (f: File) => void; capture?: 'user' }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button className="ios-row link" onClick={() => ref.current?.click()}>
        <span className="ios-row-text">
          <span>{label}</span>
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture={capture}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
    </>
  );
}

/** Checkmark list row (single choice) [HIG]. */
export function CheckRow({ title, sub, on, onClick }: { title: ReactNode; sub?: ReactNode; on: boolean; onClick: () => void }) {
  return (
    <button className="ios-row" onClick={onClick} aria-pressed={on}>
      <span className="ios-row-text">
        <span>{title}</span>
        {sub && <span className="ios-row-sub">{sub}</span>}
      </span>
      {on && <Icon name="check" size={20} strokeWidth={2.6} color="var(--src-accent, var(--sys-blue))" />}
    </button>
  );
}

/**
 * Google Photos "AI info" [V]: an 'i' badged with a sparkle, then "Credit" → "Made by Google AI"
 * (fully generated) or "Edited with Google AI" (edits), and "Digital source type" → "Edited using
 * Generative AI" for edits. "Google AI" → "roll. AI" by the README table. Which label Google gives
 * Remix and Me Meme outputs is UNKNOWN (research/16 §1): outputs that start from one of your photos
 * are treated as edits; scenes composed from scratch (the figurine) as "Made by".
 */
export function AiInfo({ edited }: { edited: boolean }) {
  return (
    <Section
      header={
        <span className={s.aiHead}>
          <Icon name="infoSparkle" size={16} strokeWidth={2} />
          {gphotos.aiInfo}
        </span>
      }
    >
      <div className="ios-row">
        <span className="ios-row-text">
          <span>{gphotos.credit}</span>
        </span>
        <span className="ios-row-value">{edited ? gphotos.editedWith : gphotos.madeBy}</span>
      </div>
      {edited && (
        <div className="ios-row">
          <span className="ios-row-text">
            <span>{gphotos.digitalSourceType}</span>
          </span>
          <span className="ios-row-value">{gphotos.editedUsingGenAI}</span>
        </div>
      )}
    </Section>
  );
}

async function exportBlob(o: Pick<LikenessObject, 'id'>) {
  return api.blob(`/objects/${o.id}/export`);
}

function fileName(o: Pick<LikenessObject, 'id'>, type: string) {
  return `${BRAND.bare}-${o.id}.${type.split('/')[1] ?? 'png'}`;
}

/** "Save": the exported (watermarked, spec §Q) file goes to the device. */
export async function saveObject(o: Pick<LikenessObject, 'id'>) {
  const blob = await exportBlob(o);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName(o, blob.type);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** "Share": the iOS share sheet with the exported file [HIG]; falls back to Save where the Web Share API can't take files. */
export async function shareObject(o: Pick<LikenessObject, 'id'>) {
  const blob = await exportBlob(o);
  const file = new File([blob], fileName(o, blob.type), { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return;
    } catch {
      /* cancelled */
    }
  }
  await saveObject(o);
}

/** Save · Regenerate · Share under a result (Google Photos Me Meme / Remix result actions [V]). */
export function ResultActions({ object, onRegenerate, busy }: { object: LikenessObject; onRegenerate?: () => void; busy?: boolean }) {
  return (
    <div className={s.actions}>
      <Button kind="tinted" color="var(--src-accent, var(--sys-blue))" onClick={() => void saveObject(object)}>
        {gphotos.save}
      </Button>
      {onRegenerate && (
        <Button kind="tinted" color="var(--src-accent, var(--sys-blue))" onClick={onRegenerate} disabled={busy}>
          {busy ? <Spinner size={16} /> : gphotos.regenerate}
        </Button>
      )}
      <Button kind="tinted" color="var(--src-accent, var(--sys-blue))" onClick={() => void shareObject(object)}>
        {gphotos.share}
      </Button>
    </div>
  );
}

/** Errors come back from the server as a message (consent, allowance); shown in a stock alert with OK [HIG]. */
export function useErrorAlert() {
  const [msg, setMsg] = useState<string | null>(null);
  const node = <Alert open={Boolean(msg)} title={msg ?? ''} onDismiss={() => setMsg(null)} actions={[{ label: ios.ok, preferred: true, onClick: () => setMsg(null) }]} />;
  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : (e as Error).message);
      return null;
    }
  };
  return { node, run };
}

/** Bottom bar with one prominent action [HIG]: a filled capsule in the source's accent (Google blue [B-high] on Google screens, else systemBlue). */
export function BottomAction({ children, onClick, disabled, color = 'var(--src-accent, var(--sys-blue))' }: { children: ReactNode; onClick: () => void; disabled?: boolean; color?: string }) {
  return (
    <div className={s.bottom}>
      <Button block color={color} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
    </div>
  );
}
