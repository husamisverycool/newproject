import { useEffect, useMemo, useState } from 'react';
import { gphotos, ios, photos27, spec } from '@app/shared';
import { PrintButton } from '../../components/PrintSheet';
import { Avatar, BarButton, Section, Sheet } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { useObjects } from '../../lib/queries';
import { firstName } from '../../lib/format';
import type { LikenessObject, Post, PublicUser } from '../../lib/types';
import { CheckRow, ResultActions } from './common';
import { TRANSITIONS, transitionName, type SlideshowOptions, type Transition } from './motion';
import s from './create.module.css';

/** Kinds made by the Create tools; each opens with its Google Photos tool name [V]. */
export const CREATION_NAME: Record<string, string> = {
  photo_to_video: gphotos.tools.photoToVideo,
  cinematic: gphotos.tools.cinematic,
  animation: gphotos.tools.animation,
  highlight: gphotos.tools.highlight,
  slideshow: photos27.startSlideshow,
  comic: gphotos.tools.remix,
  meme: gphotos.tools.meMeme,
  figurine: gphotos.remixStyles.figurine,
  zine: spec.zine,
};

export const isVideo = (url: string) => /\.(webm|mp4)$/.test(url);

/** A creation as it plays in the app: videos loop muted until tapped [HIG], clips are animated images. */
export function CreationMedia({ object, className, controls }: { object: Pick<LikenessObject, 'media' | 'meta'>; className?: string; controls?: boolean }) {
  const poster = (object.meta.poster as string | undefined) ?? undefined;
  if (isVideo(object.media)) return <video className={className} src={object.media} poster={poster} autoPlay loop muted={!controls} playsInline controls={controls} />;
  return <img className={className} src={object.media} alt="" draggable={false} />;
}

/**
 * The group's creations — Google Photos keeps what you make under Library › "Creations" [B-med]. Here
 * the shelf belongs to the group, so everything a member makes shows for everyone in it. Stock 3-column
 * grid [HIG]; a play glyph marks videos and clips.
 */
export function CreationsSection({ groupId }: { groupId: string }) {
  const q = useObjects(groupId);
  const [open, setOpen] = useState<LikenessObject | null>(null);
  const list = useMemo(() => (q.data?.objects ?? []).filter((o) => CREATION_NAME[o.kind]).sort((a, b) => b.createdAt - a.createdAt), [q.data]);
  if (!list.length) return null;
  return (
    <>
      <Section header={gphotos.creations}>
        <div className={s.grid}>
          {list.map((o) => (
            <button key={o.id} className={s.cell} onClick={() => setOpen(o)} aria-label={CREATION_NAME[o.kind]}>
              <img src={(o.meta.thumb as string | undefined) ?? (isVideo(o.media) ? (o.meta.poster as string) : o.media)} alt="" loading="lazy" />
              {(isVideo(o.media) || o.media.endsWith('.webp')) && (
                <span className={s.playBadge}>
                  <Icon name="play" size={12} filled />
                </span>
              )}
            </button>
          ))}
        </div>
      </Section>
      <CreationSheet object={open} onClose={() => setOpen(null)} />
    </>
  );
}

export function CreationSheet({ object, onClose }: { object: LikenessObject | null; onClose: () => void }) {
  const creator = (object as (LikenessObject & { creator?: PublicUser | null }) | null)?.creator ?? null;
  return (
    <Sheet open={Boolean(object)} onClose={onClose} light title={object ? CREATION_NAME[object.kind] : undefined} trailing={<BarButton bold onClick={onClose}>{ios.done}</BarButton>} height="88%">
      {object && (
        <>
          <div className={s.preview}>
            <CreationMedia object={object} controls />
          </div>
          {creator && (
            <div className={s.byline}>
              <Avatar user={creator} size={24} />
              <span>{firstName(creator.name)}</span>
              <span className={s.bylineDim}>{ios.longDate(object.createdAt)}</span>
            </div>
          )}
          <ResultActions object={object} />
          {/* spec §H printable zine, §I printed figurine cards */}
          {object.groupId && (object.kind === 'zine' || object.kind === 'figurine') && (
            <div className={s.printRow}>
              <PrintButton className={s.printBtn} groupId={object.groupId} kind={object.kind === 'zine' ? 'zine' : 'figurine_card'} objectId={object.id} preview={object.media} />
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}

/** PHPicker with ordered multiple selection: the selection number in the blue badge [HIG]. */
export function MultiGrid({ posts, selected, onToggle, max }: { posts: Post[]; selected: string[]; onToggle: (p: Post) => void; max: number }) {
  return (
    <div className={s.grid}>
      {posts.map((p) => {
        const n = selected.indexOf(p.id);
        return (
          <button key={p.id} className={s.cell} onClick={() => (n >= 0 || selected.length < max) && onToggle(p)} aria-pressed={n >= 0} aria-label={p.caption ?? p.user.name}>
            <img src={p.media.thumb ?? p.media.main} alt="" loading="lazy" />
            {n >= 0 && <span className={`${s.check} ${s.checkNum}`}>{n + 1}</span>}
          </button>
        );
      })}
    </div>
  );
}

export interface VoiceOption {
  url: string;
  seconds: number;
  user: PublicUser;
}

/** Voice notes on the chosen photos (Yope "add voice to your memories" [V]) — the soundtrack choices. */
export function voiceOptions(posts: Post[]): VoiceOption[] {
  return posts.filter((p) => p.media.voice).map((p) => ({ url: p.media.voice!, seconds: Math.round(p.media.voiceDuration ?? 0), user: p.user }));
}

/**
 * iOS 27's slideshow "Customize" [V-weak] (research/22 §2c): transition style, duration per photo, and
 * "Choose Song" with "Off" for no music. The transition names and durations iOS 27 offers are NOT FOUND,
 * so the transitions are Apple's own Photos/Keynote names [B-high] and the durations 1 Second
 * Everyday's 1, 2 or 3 seconds [V-weak]. There are no licensed soundtracks (iOS 27 exports keep only the
 * built-in ones [V-weak]), so the songs offered are the voice notes recorded on the chosen photos.
 */
export function CustomizeSheet({ open, onClose, value, onChange, voices }: { open: boolean; onClose: () => void; value: SlideshowOptions; onChange: (v: SlideshowOptions) => void; voices: VoiceOption[] }) {
  const [v, setV] = useState(value);
  useEffect(() => {
    if (open) setV(value);
  }, [open, value]);
  const music = v.music[0]?.url ?? null;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      light
      title={photos27.customize}
      leading={<BarButton onClick={onClose}>{ios.cancel}</BarButton>}
      trailing={
        <BarButton bold onClick={() => { onChange(v); onClose(); }}>
          {ios.done}
        </BarButton>
      }
      height="80%"
    >
      <Section header={photos27.transition} style={{ margin: '8px 0 24px' }}>
        {TRANSITIONS.map((t: Transition) => (
          <CheckRow key={t} title={transitionName(t)} on={v.transition === t} onClick={() => setV({ ...v, transition: t })} />
        ))}
      </Section>
      <Section header={photos27.duration} style={{ margin: '0 0 24px' }}>
        {photos27.durations.map((d) => (
          <CheckRow key={d} title={photos27.seconds(d)} on={v.seconds === d} onClick={() => setV({ ...v, seconds: d })} />
        ))}
      </Section>
      <Section header={photos27.chooseSong} style={{ margin: '0 0 24px' }}>
        <CheckRow title={photos27.off} on={!music} onClick={() => setV({ ...v, music: [] })} />
        {voices.map((o) => (
          <CheckRow key={o.url} title={<span className={s.voiceRow}><Avatar user={o.user} size={22} />{firstName(o.user.name)}</span>} sub={photos27.seconds(o.seconds)} on={music === o.url} onClick={() => setV({ ...v, music: [{ url: o.url, atMs: 0 }] })} />
        ))}
      </Section>
    </Sheet>
  );
}
