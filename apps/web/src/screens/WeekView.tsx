import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { bereal, gphotos, imessage, ios, locket, retro, yope } from '@app/shared';
import { api, downloadBlob } from '../lib/api';
import { queryClient, useGroup, useJournal } from '../lib/queries';
import { useAmbient } from '../lib/ambient';
import { haptic, sfx } from '../lib/feedback';
import { firstName, weekBounds } from '../lib/format';
import type { LikenessObject, Post, PublicUser, WallLayout } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, AvatarStack, Menu, Sheet, Spinner } from '../components/ios';
import { WallCanvas } from '../components/WallCanvas';
import { EmojiRain } from '../components/EmojiRain';
import s from './week.module.css';

interface WallResp {
  wall: { version: number; layout: WallLayout; style: string; generator: string; created_by: string | null; created_at: number } | null;
  versions: { version: number; style: string; generator: string; created_by: string | null; created_at: number }[];
  styles: { id: string; name: string; source: string }[];
  recap: LikenessObject | null;
}
type Award = { title: string; emoji: string; line: string; winners: string[] };
type Mode = 'recap' | 'pics';

/**
 * A developed week. The bottom capsule "recap" | "pics" and the recap screen come from Yope's week
 * recap (frame research/inspo/frames/yope-week-recap [I]): ‹ and "18 aug-24 aug" at the top, the
 * collage with "18 AUG-24 AUG" and the wordmark on it, page dots. "pics" is Locket's Rollcall viewer
 * (research/inspo/store/locket-03-rollcall [I]). Yope walls are editable and remixable with versions
 * [V-weak] (spec §E); Retro's Polaroid recap player (retro-04 [I]) and postcard (retro-03 [I]); the
 * week's awards as Wrapped cards [V].
 */
export default function WeekView() {
  const { groupId = '', weekKey = '' } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const g = useGroup(groupId);
  const j = useJournal(groupId);
  const q = useQuery({ queryKey: ['wall', groupId, weekKey], queryFn: () => api.get<WallResp>(`/groups/${groupId}/walls/${weekKey}`) });
  const games = useQuery({ queryKey: ['games', groupId], queryFn: () => api.get<{ games: { weekKey: string; results: Award[] | null }[] }>(`/groups/${groupId}/games`) });
  const week = j.data?.weeks.find((w) => w.weekKey === weekKey);
  const posts = useMemo(() => week?.members.flatMap((m) => m.posts) ?? [], [week]);
  const roll = useMemo(() => {
    const r = posts.filter((p) => p.ritual);
    return (r.length ? r : posts).sort((a, b) => a.user.id.localeCompare(b.user.id) || a.takenAt - b.takenAt);
  }, [posts]);
  const [mode, setMode] = useState<Mode>('recap');
  const [player, setPlayer] = useState(false);
  const [postcard, setPostcard] = useState<Post | null>(null);
  useEffect(() => {
    if (params.get('postcard') && posts[0]) setPostcard(posts[0]);
  }, [params, posts]);
  const { start, end } = weekBounds(weekKey);
  const users = new Map((g.data?.members ?? []).map((m) => [m.user.id, m.user]));
  const results = games.data?.games.find((x) => x.weekKey === weekKey)?.results ?? null;

  return (
    <div className={s.root}>
      {mode === 'pics' ? (
        <Rollcall posts={roll} start={start} end={end} onClose={() => nav(-1)} />
      ) : (
        <Recap
          groupId={groupId}
          weekKey={weekKey}
          range={yope.weekRange(start, end)}
          wall={q.data ?? null}
          refetch={() => void q.refetch()}
          posts={posts}
          awards={results}
          users={users}
          mascot={g.data ? { species: g.data.group.mascot.species, level: g.data.group.mascot.stage.level, outfit: g.data.group.mascot.outfit } : undefined}
          onBack={() => nav(-1)}
          onPlay={() => setPlayer(true)}
          onPostcard={() => posts[0] && setPostcard(posts[0])}
        />
      )}

      {/* Yope "recap" | "pics" capsule [I] */}
      <div className={s.segment}>
        {(['recap', 'pics'] as Mode[]).map((m) => (
          <button key={m} className={mode === m ? s.segOn : ''} onClick={() => { haptic('light'); setMode(m); }}>
            {m === 'recap' ? yope.recap : yope.pics}
          </button>
        ))}
      </div>

      <AnimatePresence>{player && <RetroPlayer posts={posts} onClose={() => setPlayer(false)} />}</AnimatePresence>
      <PostcardSheet groupId={groupId} post={postcard} onClose={() => setPostcard(null)} />
    </div>
  );
}

/* ───────────── pics: Locket Rollcall viewer [I] locket-03 ───────────── */

function Rollcall({ posts, start, end, onClose }: { posts: Post[]; start: number; end: number; onClose: () => void }) {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [picker, setPicker] = useState(false);
  const [rain, setRain] = useState<{ emoji: string; key: number } | null>(null);
  const p = posts[Math.min(i, posts.length - 1)];
  const ambient = useAmbient(p ? p.media.thumb ?? p.media.main : null);
  const posters = [...new Map(posts.map((x) => [x.user.id, x.user])).values()];
  const react = async (emoji: string) => {
    if (!p) return;
    haptic('light');
    setRain({ emoji, key: Date.now() });
    setPicker(false);
    await api.post(`/posts/${p.id}/react`, { emoji });
    void queryClient.invalidateQueries({ queryKey: ['journal', p.groupId] });
  };
  const faces = p ? [...new Set((p.reactions ?? []).map((r) => r.emoji).filter(Boolean) as string[])].slice(0, 3) : [];

  return (
    <div className={s.rollcall} style={ambient ? ({ '--amb': ambient } as CSSProperties) : undefined}>
      <header className={s.rcHead}>
        <button className={s.glass} onClick={onClose} aria-label={ios.close}>
          <Icon name="close" size={18} strokeWidth={2.6} />
        </button>
        <div className={s.rcTitle}>
          <b>
            <Icon name="megaphone" size={22} strokeWidth={2} />
            {locket.rollcallTitle}
          </b>
          <span>{locket.rollcallRange(start, end)}</span>
        </div>
        <span className={s.rcPeople}>
          <AvatarStack users={posters.slice(0, 2)} size={30} edge="transparent" />
          {posters.length > 0 && <i>{posters.length}</i>}
        </span>
      </header>

      {p ? (
        <>
          <div className={s.deck}>
            <span className={s.deckBack2} />
            <span className={s.deckBack1} />
            <div
              className={s.deckTop}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                if (e.clientX - r.left < r.width / 3) setI(Math.max(0, i - 1));
                else if (i < posts.length - 1) setI(i + 1);
                haptic('light');
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img key={p.id} src={p.media.main} alt="" className={p.blurred ? s.blurred : ''} initial={{ opacity: 0, y: -18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.28 }} />
              </AnimatePresence>
              {p.caption && !p.blurred && <span className={s.caption}>{p.caption}</span>}
              {faces.length > 0 && <span className={s.faces}>{faces.join('')}</span>}
              <button className={s.addReact} onClick={(e) => { e.stopPropagation(); setPicker(true); }} aria-label={bereal.realMoji} disabled={p.blurred}>
                <Icon name="smilePlus" size={22} />
              </button>
              {rain && <EmojiRain key={rain.key} emoji={rain.emoji} />}
            </div>
          </div>
          <div className={s.poster}>
            <Avatar user={p.user} size={36} />
            <b>{locket.shortName(p.user.name)}</b>
            <button className={s.glass} onClick={() => nav(`/p/${p.id}`)} aria-label={locket.sendMessage}>
              <Icon name="plus" size={18} strokeWidth={2.6} />
            </button>
          </div>
        </>
      ) : (
        <p className={s.empty}>{locket.rollcallStep1}</p>
      )}

      <Sheet open={picker} onClose={() => setPicker(false)} dark>
        <div className={s.reactGrid}>
          {[...locket.replyGrid, ...imessage.tapbacks].map((e) => (
            <button key={e} onClick={() => void react(e)}>
              {e}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

/* ───────────── recap: Yope week recap [I] + walls [V-weak] ───────────── */

function Recap({ groupId, weekKey, range, wall, refetch, posts, awards, users, mascot, onBack, onPlay, onPostcard }: {
  groupId: string;
  weekKey: string;
  range: string;
  wall: WallResp | null;
  refetch: () => void;
  posts: Post[];
  awards: Award[] | null;
  users: Map<string, PublicUser>;
  mascot?: { species: string; level: number; outfit: string[] };
  onBack: () => void;
  onPlay: () => void;
  onPostcard: () => void;
}) {
  const [page, setPage] = useState(0);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<WallLayout | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [styles, setStyles] = useState(false);
  const layout = draft ?? wall?.wall?.layout ?? null;
  const panels = (wall?.recap?.meta.panels as string[] | undefined) ?? [];
  const pages = [layout ? 'wall' : null, panels.length ? 'panels' : null, awards?.length ? 'awards' : null].filter(Boolean) as string[];

  const remix = async () => {
    setBusy('remix');
    haptic('medium');
    const ids = wall?.styles.map((x) => x.id) ?? [];
    const next = ids[(ids.indexOf(wall?.wall?.style ?? '') + 1) % Math.max(1, ids.length)];
    await api.post(`/groups/${groupId}/walls/${weekKey}/remix`, { style: next });
    refetch();
    setBusy(null);
    sfx.sparkle();
  };
  const save = async () => {
    if (!draft) return;
    setBusy('save');
    await api.post(`/groups/${groupId}/walls/${weekKey}`, { layout: draft, style: 'edit' });
    setDraft(null);
    setEdit(false);
    setSelected(null);
    refetch();
    setBusy(null);
  };
  const exportWall = async () => {
    setBusy('export');
    const blob = await api.blob(`/groups/${groupId}/walls/${weekKey}/export`);
    await downloadBlob(blob, `${weekKey}.jpg`);
    setBusy(null);
  };
  const genRecap = async (style: string) => {
    setStyles(false);
    setBusy('recap');
    await api.post(`/groups/${groupId}/recap/${weekKey}`, { style }).catch(() => undefined);
    refetch();
    setBusy(null);
  };

  return (
    <div className={s.recap}>
      <header className={s.recapHead}>
        {edit ? (
          <button className={s.textBtn} onClick={() => { setEdit(false); setDraft(null); setSelected(null); }}>
            {ios.cancel}
          </button>
        ) : (
          <button className={s.back} onClick={onBack} aria-label={ios.back}>
            <Icon name="chevronLeft" size={24} strokeWidth={2.6} />
          </button>
        )}
        <h1>{range}</h1>
        {edit ? (
          <button className={`${s.textBtn} ${s.bold}`} onClick={save} disabled={busy === 'save'}>
            {busy === 'save' ? <Spinner size={18} /> : ios.done}
          </button>
        ) : (
          <button className={s.back} onClick={() => setMenu(true)} aria-label={ios.more}>
            <Icon name="more" size={22} strokeWidth={3.2} />
          </button>
        )}
      </header>

      <div
        className={s.pages}
        onScroll={(e) => {
          const el = e.currentTarget;
          setPage(Math.round(el.scrollLeft / el.clientWidth));
        }}
        style={edit ? { overflowX: 'hidden' } : undefined}
      >
        {pages.length === 0 && (
          <div className={s.page}>
            {wall === null ? <Spinner size={28} /> : (
              <button className={s.make} onClick={remix} disabled={busy === 'remix'}>
                {busy === 'remix' ? <Spinner size={22} /> : <Icon name="sparkles" size={22} />}
                <span>{yope.wallRemix}</span>
              </button>
            )}
          </div>
        )}
        {pages.includes('wall') && layout && (
          <div className={s.page}>
            <div className={s.wallWrap}>
              <WallCanvas layout={layout} mascot={mascot} editable={edit} onChange={setDraft} selected={selected} onSelect={setSelected} animateIn={!edit} label={range.toUpperCase()} key={`${wall?.wall?.version}-${edit}`} />
              {busy === 'remix' && (
                <div className={s.busy}>
                  <Spinner size={32} />
                </div>
              )}
            </div>
          </div>
        )}
        {pages.includes('panels') && (
          <div className={s.page}>
            <div className={s.panels}>
              {panels.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
            <span className={s.aiTag}>{gphotos.madeBy}</span>
          </div>
        )}
        {pages.includes('awards') && awards && (
          <div className={s.page}>
            <div className={s.awards}>
              {awards.map((a, k) => (
                <div key={a.title + k} className={s.award}>
                  <span className={s.awardEmoji}>{a.emoji}</span>
                  <b>{a.title}</b>
                  <span>{a.line}</span>
                  <span className={s.awardWho}>
                    <AvatarStack users={a.winners.map((w) => users.get(w))} size={26} edge="transparent" />
                    {a.winners.map((w) => firstName(users.get(w)?.name ?? '')).join(' & ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {pages.length > 1 && (
        <div className={s.dots}>
          {pages.map((x, k) => (
            <i key={x} className={k === page ? s.dotOn : ''} />
          ))}
        </div>
      )}
      {!edit && layout && (
        <button className={s.share} onClick={exportWall} disabled={busy === 'export'}>
          {busy === 'export' ? <Spinner size={16} /> : <Icon name="share" size={18} strokeWidth={2.2} />}
          {yope.share}
        </button>
      )}

      <Menu
        open={menu}
        onClose={() => setMenu(false)}
        actions={[
          ...(layout ? [{ label: yope.wallEdit, icon: 'pencil', onClick: () => { setEdit(true); setDraft(layout); } }] : []),
          { label: yope.wallRemix, icon: 'shuffle', onClick: remix },
          ...(layout ? [{ label: yope.wallSave, icon: 'download', onClick: exportWall }] : []),
          ...(posts.length ? [{ label: retro.recapFormats.video, icon: 'play', onClick: onPlay }] : []),
          { label: gphotos.tools.remix, icon: 'sparkles', onClick: () => setStyles(true) },
          ...(posts.length ? [{ label: retro.postcard, icon: 'pencil', onClick: onPostcard }] : []),
        ]}
      />
      <Menu
        open={styles}
        onClose={() => setStyles(false)}
        actions={Object.entries(gphotos.remixStyles)
          .filter(([k]) => k !== 'threeD')
          .map(([k, label]) => ({ label, icon: 'sparkles', onClick: () => void genRecap(k) }))}
      />
      {busy === 'recap' && (
        <div className={s.busyFull}>
          <Spinner size={32} />
        </div>
      )}
    </div>
  );
}

/* ───────────── Retro recap player [I] retro-04 ───────────── */

function RetroPlayer({ posts, onClose }: { posts: Post[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((x) => (x < posts.length - 1 ? x + 1 : x)), 3000);
    return () => clearTimeout(t);
  }, [i, posts.length]);
  const p = posts[i];
  if (!p) return null;
  const shareIt = () => typeof navigator.share === 'function' && void navigator.share({ url: `${location.origin}/api/posts/${p.id}/export` }).catch(() => undefined);
  return (
    <motion.div className={s.player} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <img src={p.media.main} alt="" className={s.playerBg} />
      <button className={`${s.glass} ${s.playerX}`} onClick={onClose} aria-label={ios.close}>
        <Icon name="close" size={18} strokeWidth={2.6} />
      </button>
      <div
        className={s.polaroidArea}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setI(e.clientX - r.left < r.width / 3 ? Math.max(0, i - 1) : Math.min(posts.length - 1, i + 1));
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={p.id} className={s.polaroid} initial={{ opacity: 0, rotate: -2, scale: 0.96 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <img src={p.media.main} alt="" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className={s.meta}>
        <div>
          <span>{retro.monthYear(p.takenAt)}</span>
        </div>
        <hr />
        <div>
          <span>{firstName(p.user.name)}</span>
          <span>{retro.clock(p.takenAt)}</span>
          <span>{retro.domain}</span>
        </div>
      </div>
      <div className={s.playerBar}>
        <span className={s.count}>
          <img src={p.media.thumb ?? p.media.main} alt="" />
          <i>{posts.length}</i>
        </span>
        <span className={s.playerDots}>
          {posts.slice(0, 7).map((x, k) => (
            <i key={x.id} className={k === Math.min(i, 6) ? s.dotOn : ''} />
          ))}
        </span>
        <button className={s.whiteBtn} onClick={shareIt}>
          {retro.share}
        </button>
      </div>
    </motion.div>
  );
}

/* ───────────── Retro postcard [I] retro-03 ───────────── */

function PostcardSheet({ groupId, post, onClose }: { groupId: string; post: Post | null; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState<string[]>(['', '', '', '']);
  const [editing, setEditing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const ready = address[0].trim() && address[1].trim() && address[2].trim();
  const send = async () => {
    if (!post || !ready) return;
    setBusy(true);
    await api.post(`/groups/${groupId}/orders`, { kind: 'postcard', items: [post.id], message, address });
    setBusy(false);
    setDone(true);
    haptic('success');
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 900);
  };
  return (
    <Sheet open={Boolean(post)} onClose={onClose} dark title={retro.postcard} trailing={<button className={s.sheetX} onClick={onClose} aria-label={ios.close}><Icon name="close" size={16} strokeWidth={2.6} /></button>}>
      {post && (
        <div className={s.postcard}>
          <div className={s.pcPhoto}>
            <img src={post.media.main} alt="" />
            <label className={s.pcMessage}>
              <Icon name="pencil" size={15} />
              <input placeholder={retro.addAMessage} value={message} onChange={(e) => setMessage(e.target.value.slice(0, 300))} />
            </label>
          </div>
          <div className={s.pcAddress}>
            <div>
              <span className={s.pcLabel}>{retro.mailingAddress}</span>
              {editing ? (
                ios.addressFields.map((f, k) => <input key={f} className={s.pcField} placeholder={f} value={address[k]} onChange={(e) => setAddress(address.map((x, n) => (n === k ? e.target.value : x)))} />)
              ) : (
                address.filter(Boolean).map((l) => <span key={l}>{l}</span>)
              )}
            </div>
            <button className={s.pcEdit} onClick={() => setEditing(!editing)} aria-label={ios.edit}>
              <Icon name="pencil" size={16} />
            </button>
          </div>
          <div className={s.pcTotal}>
            <span>{retro.total}</span>
            <span>{retro.postcardPrice}</span>
          </div>
          <button className={s.whiteBlock} onClick={send} disabled={!ready || busy}>
            {done ? <Icon name="check" size={20} strokeWidth={2.8} /> : busy ? <Spinner size={18} /> : retro.sendPostcard}
          </button>
        </div>
      )}
    </Sheet>
  );
}
