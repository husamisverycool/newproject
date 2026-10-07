import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { MASCOT_SPECIES, gphotos, photos27, type CreationKind } from '@app/shared';
import { NavBar, Row, Screen, Section, Spinner } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { api } from '../../lib/api';
import { invalidateGroup, queryClient, useFeed } from '../../lib/queries';
import { videoType } from '../../lib/render';
import type { LikenessObject, Post } from '../../lib/types';
import { BottomAction, CheckRow, PhotoGrid, ResultActions, pickable, useCreateGroup, useErrorAlert, usePost } from './common';
import { CreationMedia, CustomizeSheet, MultiGrid, voiceOptions } from './Creations';
import { MAX_CLIP_FRAMES, animation, cinematic, photoToVideo, saveCreation, slideshow, type PhotoMode, type SlideshowOptions } from './motion';
import s from './create.module.css';

/**
 * Google Photos Create tools made on the device (research/06 §1.2, 16 §1), each in Google's order of
 * steps: pick → (prompt) → "Generate" [V] → "Save" · "Regenerate" · "Share" [V]. The result is saved to
 * the group's Creations at once (Google saves to the library), and "Regenerate" replaces it. Layout:
 * the same stock screens as Remix — PHPicker grid, single-choice rows, one bottom action [HIG].
 */

function useGroupPhotos(groupId: string | undefined, enabled: boolean) {
  const feed = useFeed(enabled ? groupId : null);
  return pickable(feed.data?.posts);
}

function mascotColor(species: string | undefined) {
  return (MASCOT_SPECIES.find((m) => m.id === species) ?? MASCOT_SPECIES[0]).body;
}

/** The busy veil over the preview with a determinate bar (UIProgressView [HIG]) while frames render. */
function Busy({ progress }: { progress: number }) {
  return (
    <div className={s.busy}>
      <Spinner size={28} />
      <span className={s.progress}>
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </span>
    </div>
  );
}

function useCreation(kind: CreationKind) {
  const group = useCreateGroup();
  const [result, setResult] = useState<LikenessObject | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const err = useErrorAlert();
  const run = async (make: () => Promise<Parameters<typeof saveCreation>[0] | null>) => {
    if (!group || busy) return;
    setBusy(true);
    setProgress(0);
    const previous = result;
    const r = await err.run(async () => {
      const input = await make();
      if (!input) return null;
      const o = await saveCreation(input);
      // "Regenerate" replaces the earlier result rather than keeping both.
      if (previous) await api.del(`/objects/${previous.id}`).catch(() => undefined);
      return o;
    });
    setBusy(false);
    if (r) {
      setResult(r);
      invalidateGroup(group.id);
      void queryClient.invalidateQueries({ queryKey: ['objects', group.id] });
    }
  };
  void kind;
  return { group, result, setResult, busy, progress, setProgress, run, err };
}

/* ───────────────────────── Photo to video ───────────────────────── */

/**
 * Photo to video [V]: pick a photo, then one of the two prompts "Subtle movement" or "I'm feeling lucky"
 * [V-weak] (CONFLICT: blog.google writes "Subtle movements"; the [V-weak] singular is kept as the deck has
 * it), output "six-second video clips" [V-weak].
 */
export function PhotoToVideo() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const c = useCreation('photo_to_video');
  const fixed = usePost(params.get('post'));
  const photos = useGroupPhotos(c.group?.id, !params.get('post'));
  const [picked, setPicked] = useState<Post | null>(null);
  const [mode, setMode] = useState<PhotoMode>('subtle');
  const seed = useRef(Date.now());
  const post = fixed.data?.post ?? picked;
  const scroller = useRef<HTMLDivElement>(null);

  const generate = () =>
    c.run(async () => {
      if (!post || !c.group) return null;
      seed.current += 1;
      scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
      const r = await photoToVideo(post.media.main, mode, seed.current, mascotColor(c.group.mascot.species), c.setProgress);
      return { groupId: c.group.id, kind: 'photo_to_video', sourcePostIds: [post.id], style: r.style, video: r.video, frames: r.frames, delay: r.delay, poster: r.poster, meta: { mode, seconds: gphotos.photoToVideoSeconds } };
    });

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} title={gphotos.tools.photoToVideo} />
      <div className={s.scroll} ref={scroller}>
        {post && (
          <div className={s.preview}>
            {c.result ? <CreationMedia object={c.result} className={s.clipPreview} /> : <img src={post.media.main} alt="" />}
            {c.busy && <Busy progress={c.progress} />}
          </div>
        )}
        {c.result && <ResultActions object={c.result} onRegenerate={() => void generate()} busy={c.busy} />}
        {!params.get('post') && (
          <Section header={c.group?.name}>
            <PhotoGrid posts={photos} selected={post?.id ?? null} onPick={(p) => { setPicked(p); c.setResult(null); }} />
          </Section>
        )}
        <Section footer={gphotos.toolLines.photoToVideo}>
          <CheckRow title={gphotos.subtleMovement} on={mode === 'subtle'} onClick={() => { setMode('subtle'); c.setResult(null); }} />
          <CheckRow title={gphotos.feelingLucky} on={mode === 'lucky'} onClick={() => { setMode('lucky'); c.setResult(null); }} />
        </Section>
      </div>
      {!c.result && (
        <BottomAction onClick={() => void generate()} disabled={!post || c.busy}>
          {c.busy ? <Spinner size={18} /> : gphotos.generate}
        </BottomAction>
      )}
      {c.err.node}
    </Screen>
  );
}

/* ───────────────────────── Cinematic photos ───────────────────────── */

/** Cinematic photos: "A 3D effect added to photos" [V-weak]; pick a photo → "Generate" [V]. */
export function Cinematic() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const c = useCreation('cinematic');
  const fixed = usePost(params.get('post'));
  const photos = useGroupPhotos(c.group?.id, !params.get('post'));
  const [picked, setPicked] = useState<Post | null>(null);
  const post = fixed.data?.post ?? picked;
  const scroller = useRef<HTMLDivElement>(null);

  const generate = () =>
    c.run(async () => {
      if (!post || !c.group) return null;
      scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
      const r = await cinematic(post.media.main, mascotColor(c.group.mascot.species), c.setProgress);
      return { groupId: c.group.id, kind: 'cinematic', sourcePostIds: [post.id], style: r.depth ? 'depth' : 'flat', video: r.video, frames: r.frames, delay: r.delay, poster: r.poster };
    });

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} title={gphotos.tools.cinematic} />
      <div className={s.scroll} ref={scroller}>
        {post && (
          <div className={s.preview}>
            {c.result ? <CreationMedia object={c.result} className={s.clipPreview} /> : <img src={post.media.main} alt="" />}
            {c.busy && <Busy progress={c.progress} />}
          </div>
        )}
        {c.result && <ResultActions object={c.result} onRegenerate={() => void generate()} busy={c.busy} />}
        {!params.get('post') && (
          <Section header={c.group?.name} footer={gphotos.toolLines.cinematic}>
            <PhotoGrid posts={photos} selected={post?.id ?? null} onPick={(p) => { setPicked(p); c.setResult(null); }} />
          </Section>
        )}
      </div>
      {!c.result && (
        <BottomAction onClick={() => void generate()} disabled={!post || c.busy}>
          {c.busy ? <Spinner size={18} /> : gphotos.generate}
        </BottomAction>
      )}
      {c.err.node}
    </Screen>
  );
}

/* ───────────────────────── Animations ───────────────────────── */

const ANIMATION_MAX = MAX_CLIP_FRAMES;

/** Animations: select "animation", then the photos to include; the output is a looping clip ("GIF") [V-weak]. */
export function Animations() {
  const nav = useNavigate();
  const c = useCreation('animation');
  const photos = useGroupPhotos(c.group?.id, true);
  const [sel, setSel] = useState<string[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const toggle = (p: Post) => setSel((cur) => (cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id]));

  const create = () =>
    c.run(async () => {
      if (!c.group || sel.length < 2) return null;
      const chosen = sel.map((id) => photos.find((p) => p.id === id)).filter((p): p is Post => Boolean(p));
      const r = await animation(chosen.map((p) => p.media.main), c.setProgress);
      scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return { groupId: c.group.id, kind: 'animation', sourcePostIds: chosen.map((p) => p.id), frames: r.frames, delay: r.delay };
    });

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} title={gphotos.tools.animation} />
      <div className={s.scroll} ref={scroller}>
        {(c.result || c.busy) && (
          <div className={s.preview}>
            {c.result ? <CreationMedia object={c.result} className={s.clipPreview} /> : <div className={s.clipPreview} />}
            {c.busy && <Busy progress={c.progress} />}
          </div>
        )}
        {c.result && <ResultActions object={c.result} onRegenerate={() => void create()} busy={c.busy} />}
        <Section header={c.group?.name} footer={gphotos.toolLines.animation}>
          <MultiGrid posts={photos} selected={sel} max={ANIMATION_MAX} onToggle={(p) => { toggle(p); c.setResult(null); }} />
        </Section>
      </div>
      {!c.result && (
        <BottomAction onClick={() => void create()} disabled={sel.length < 2 || c.busy}>
          {c.busy ? <Spinner size={18} /> : gphotos.create}
        </BottomAction>
      )}
      {c.err.node}
    </Screen>
  );
}

/* ───────────────────────── Highlight videos ───────────────────────── */

const HIGHLIGHT_MAX = 30;
const HIGHLIGHT_PICK = 10;

/**
 * Highlight videos: "A video with music that uses photos and videos" [V-weak]; Photos picks the photos
 * and adds music [V-weak] — here the newest ten are picked for you and can be changed, and iOS 27's
 * "Customize" [V-weak] sets the transition, the time per photo and the sound.
 */
export function Highlight() {
  const nav = useNavigate();
  const c = useCreation('highlight');
  const photos = useGroupPhotos(c.group?.id, true);
  const [sel, setSel] = useState<string[] | null>(null);
  const [opts, setOpts] = useState<SlideshowOptions>({ transition: 'kenBurns', seconds: 2, music: [] });
  const [customize, setCustomize] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sel === null && photos.length) setSel(photos.slice(0, HIGHLIGHT_PICK).map((p) => p.id));
  }, [photos, sel]);
  const chosen = useMemo(() => (sel ?? []).map((id) => photos.find((p) => p.id === id)).filter((p): p is Post => Boolean(p)), [sel, photos]);
  const toggle = (p: Post) => setSel((cur) => ((cur ?? []).includes(p.id) ? (cur ?? []).filter((x) => x !== p.id) : [...(cur ?? []), p.id]));

  const create = () =>
    c.run(async () => {
      if (!c.group || chosen.length < 2) return null;
      const color = mascotColor(c.group.mascot.species);
      const urls = chosen.map((p) => p.media.main);
      const meta = { transition: opts.transition, seconds: opts.seconds, music: opts.music.length ? 'voice' : 'off' };
      if (videoType()) {
        const v = await slideshow(urls, opts, color, c.setProgress);
        if (v) return { groupId: c.group.id, kind: 'highlight', sourcePostIds: chosen.map((p) => p.id), style: opts.transition, video: v, poster: v.poster, meta };
      }
      // No video recorder in this browser: the same photos as a looping clip at the chosen time per photo.
      const r = await animation(urls, c.setProgress, opts.seconds * 1000);
      return { groupId: c.group.id, kind: 'highlight', sourcePostIds: chosen.map((p) => p.id), style: opts.transition, frames: r.frames, delay: r.delay, meta };
    }).then(() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' }));

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} title={gphotos.tools.highlight} />
      <div className={s.scroll} ref={scroller}>
        {(c.result || c.busy) && (
          <div className={s.preview}>
            {c.result ? <CreationMedia object={c.result} className={s.clipPreview} controls /> : <div className={s.clipPreview} />}
            {c.busy && <Busy progress={c.progress} />}
          </div>
        )}
        {c.result && <ResultActions object={c.result} onRegenerate={() => void create()} busy={c.busy} />}
        <Section>
          <Row icon={<Icon name="wand" size={22} className={s.toolIcon} />} title={photos27.customize} sub={`${photos27.transitions[opts.transition]} · ${photos27.seconds(opts.seconds)}`} onClick={() => setCustomize(true)} />
        </Section>
        <Section header={c.group?.name} footer={gphotos.toolLines.highlight}>
          <MultiGrid posts={photos} selected={sel ?? []} max={HIGHLIGHT_MAX} onToggle={(p) => { toggle(p); c.setResult(null); }} />
        </Section>
      </div>
      {!c.result && (
        <BottomAction onClick={() => void create()} disabled={chosen.length < 2 || c.busy}>
          {c.busy ? <Spinner size={18} /> : gphotos.create}
        </BottomAction>
      )}
      <CustomizeSheet open={customize} onClose={() => setCustomize(false)} value={opts} onChange={(v) => { setOpts(v); c.setResult(null); }} voices={voiceOptions(chosen)} />
      {c.err.node}
    </Screen>
  );
}
