import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { gphotos } from '@app/shared';
import { NavBar, Screen, Section, Spinner } from '../../components/ios';
import { api } from '../../lib/api';
import { invalidateGroup, queryClient, useConfig, useFeed } from '../../lib/queries';
import { cutout } from '../../lib/vision';
import type { LikenessObject, Post } from '../../lib/types';
import { AiInfo, BottomAction, CheckRow, PhotoGrid, ResultActions, pickable, useCreateGroup, useErrorAlert, usePost } from './common';
import s from './create.module.css';

/** Styles that take the person cut out of the photo rather than the whole frame (server: ai/local.ts). */
const NEEDS_CUTOUT = new Set(['sticker', 'enamel_pin', 'figurine']);

/**
 * Remix, as Google Photos runs it (research/16 §1, July 2025 flow [V-weak]): select a style → choose a
 * photo → "Generate" [V]; the result offers "Regenerate" with "Save" and "Share" [V]. With `?post=`
 * the photo is already chosen. Style names: gphotos.remixStyles (sources listed there); the chips'
 * look is UNKNOWN, so the styles are a stock single-choice list with a checkmark [HIG]. "Collectible
 * figurine" is Remix's own figurine template (research/26 §3) and goes to the figurine renderer
 * (Nano Banana composition, research/06 §2.2).
 */
export default function Remix() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const group = useCreateGroup();
  const config = useConfig();
  const fixed = usePost(params.get('post'));
  const feed = useFeed(params.get('post') ? null : group?.id);
  const [picked, setPicked] = useState<Post | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [result, setResult] = useState<LikenessObject | null>(null);
  const [busy, setBusy] = useState(false);
  const err = useErrorAlert();
  const scroller = useRef<HTMLDivElement>(null);
  const post = fixed.data?.post ?? picked;
  const styles = (config.data?.remixStyles ?? []).filter((st) => gphotos.remixStyles[st.id]);

  const generate = async () => {
    if (!post || !style || !group || busy) return;
    setBusy(true);
    const r = await err.run(async () => {
      const fd = new FormData();
      fd.set('postId', post.id);
      fd.set('groupId', group.id);
      if (NEEDS_CUTOUT.has(style)) {
        const cut = await cutout(post.media.main);
        if (cut) fd.set('cutout', cut.png, 'cutout.png');
      }
      if (style === 'figurine') {
        fd.set('subjectId', post.user.id);
        return api.post<{ object: LikenessObject }>('/objects/figurine', fd);
      }
      fd.set('style', style);
      fd.set('subjects', post.user.id);
      return api.post<{ object: LikenessObject }>('/objects/remix', fd);
    });
    setBusy(false);
    if (r) {
      setResult(r.object);
      scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
      invalidateGroup(group.id);
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  };

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} title={gphotos.tools.remix} />
      <div className={s.scroll} ref={scroller}>
        {post && (
          <div className={s.preview}>
            <img src={result?.media ?? post.media.main} alt="" />
            {busy && (
              <div className={s.busy}>
                <Spinner size={28} />
              </div>
            )}
          </div>
        )}
        {result && (
          <>
            <ResultActions object={result} onRegenerate={() => void generate()} busy={busy} />
            <AiInfo edited={style !== 'figurine'} />
          </>
        )}
        {!params.get('post') && (
          <Section header={group?.name}>
            <PhotoGrid posts={pickable(feed.data?.posts)} selected={post?.id ?? null} onPick={(p) => { setPicked(p); setResult(null); }} />
          </Section>
        )}
        <Section>
          {styles.map((st) => (
            <CheckRow key={st.id} title={gphotos.remixStyles[st.id]} on={style === st.id} onClick={() => { setStyle(st.id); setResult(null); }} />
          ))}
        </Section>
      </div>
      {!result && (
        <BottomAction onClick={() => void generate()} disabled={!post || !style || busy}>
          {busy ? <Spinner size={18} /> : gphotos.generate}
        </BottomAction>
      )}
      {err.node}
    </Screen>
  );
}
