import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { api, ApiError, downloadBlob } from '../lib/api';
import { useGroup, useJournal } from '../lib/queries';
import { haptic, sfx } from '../lib/feedback';
import { timeAgo, weekRange } from '../lib/format';
import type { LikenessObject, Post, WallLayout, PublicUser } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, AvatarStack, Chip, IconButton, PillButton, Sheet, Spinner } from '../components/ui';
import { WallCanvas } from '../components/WallCanvas';
import s from './week.module.css';

interface WallResp {
  wall: { version: number; layout: WallLayout; style: string; generator: string; created_by: string | null; created_at: number } | null;
  versions: { version: number; style: string; generator: string; created_by: string | null; created_at: number }[];
  styles: { id: string; name: string; source: string }[];
  recap: LikenessObject | null;
  title: string;
}

type Tab = 'wall' | 'recap' | 'awards';

/**
 * A developed week: Yope's AI wall ("edit them, remix them"), the six-panel AI recap and the
 * Retro-style slideshow (spec §G), and the week's awards (Wrapped Party). Exports carry the watermark.
 */
export default function WeekView() {
  const { groupId = '', weekKey = '' } = useParams();
  const nav = useNavigate();
  const g = useGroup(groupId);
  const j = useJournal(groupId);
  const q = useQuery({ queryKey: ['wall', groupId, weekKey], queryFn: () => api.get<WallResp>(`/groups/${groupId}/walls/${weekKey}`) });
  const games = useQuery({ queryKey: ['games', groupId], queryFn: () => api.get<{ games: { id: string; weekKey: string; kind: string; closed: boolean; results: { title: string; emoji: string; line: string; winners: string[] }[] | null }[] }>(`/groups/${groupId}/games`) });
  const [tab, setTab] = useState<Tab>('wall');
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<WallLayout | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [versions, setVersions] = useState(false);
  const [share, setShare] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const week = j.data?.weeks.find((w) => w.weekKey === weekKey);
  const posts = useMemo(() => week?.members.flatMap((m) => m.posts) ?? [], [week]);
  const mascot = g.data ? { species: g.data.group.mascot.species, level: g.data.group.mascot.stage.level, outfit: g.data.group.mascot.outfit } : undefined;
  const layout = draft ?? q.data?.wall?.layout ?? null;
  const users = new Map((g.data?.members ?? []).map((m) => [m.user.id, m.user]));

  const remix = async (style: string) => {
    setBusy('remix');
    haptic('medium');
    await api.post(`/groups/${groupId}/walls/${weekKey}/remix`, { style });
    await q.refetch();
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
    await q.refetch();
    setBusy(null);
  };
  const exportWall = async (version?: number) => {
    setBusy('export');
    const blob = await api.blob(`/groups/${groupId}/walls/${weekKey}/export${version ? `?version=${version}` : ''}`);
    await downloadBlob(blob, `${g.data?.group.name ?? 'roll'}-${weekKey}.jpg`);
    setBusy(null);
  };
  const genRecap = async (style: string) => {
    setBusy('recap');
    try {
      await api.post(`/groups/${groupId}/recap/${weekKey}`, { style });
      await q.refetch();
      sfx.sparkle();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Could not make a recap');
    }
    setBusy(null);
  };
  const zine = async () => {
    setBusy('zine');
    const r = await api.post<{ object: LikenessObject }>(`/groups/${groupId}/zine`, { weekKey });
    setBusy(null);
    const blob = await api.blob(`/objects/${r.object.id}/export`);
    await downloadBlob(blob, `zine-${weekKey}.jpg`);
  };

  const sel = layout?.items.find((i) => i.id === selected);
  const patchSel = (p: Partial<WallLayout['items'][number]>) => {
    if (!layout || !selected) return;
    setDraft({ ...layout, items: layout.items.map((i) => (i.id === selected ? { ...i, ...p } : i)) });
  };

  const results = games.data?.games.find((x) => x.weekKey === weekKey)?.results ?? null;

  return (
    <div className="screen">
      <header className={s.header}>
        <IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />
        <div className={s.title}>
          <span>{weekRange(weekKey)}</span>
          <span className={s.sub}>{g.data?.group.name}</span>
        </div>
        <IconButton icon="share" label="Share" onClick={() => setShare(true)} />
      </header>
      <div className={s.tabs}>
        <div className="segmented">
          {(['wall', 'recap', 'awards'] as Tab[]).map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t === 'wall' ? 'Wall' : t === 'recap' ? 'Recap' : 'Awards'}
            </button>
          ))}
        </div>
      </div>
      <div className={`${s.body} scroll`}>
        {tab === 'wall' && (
          <>
            {layout ? (
              <div className={s.wallWrap}>
                <WallCanvas layout={layout} mascot={mascot} editable={edit} onChange={setDraft} selected={selected} onSelect={setSelected} animateIn={!edit} key={`${q.data?.wall?.version}-${edit}`} />
                {busy === 'remix' && (
                  <div className={s.busy}>
                    <Spinner size={32} />
                  </div>
                )}
              </div>
            ) : q.isLoading ? (
              <div className={s.center}><Spinner /></div>
            ) : (
              <div className={s.center}>
                <p className="t-sub">No wall yet for this week.</p>
                <PillButton onClick={() => remix('chaos')}>Make the wall</PillButton>
              </div>
            )}
            {layout && !edit && (
              <>
                <div className={s.meta}>
                  v{q.data?.wall?.version} · {q.data?.wall?.generator === 'auto' ? 'made by the roll' : q.data?.wall?.created_by ? `${users.get(q.data.wall.created_by)?.name.split(' ')[0] ?? 'someone'} ${q.data.wall.generator === 'edit' ? 'edited' : 'remixed'}` : 'remixed'} · {timeAgo(q.data?.wall?.created_at ?? Date.now())}
                  <button className={s.link} onClick={() => setVersions(true)}>{q.data?.versions.length === 1 ? '1 version' : `${q.data?.versions.length} versions`}</button>
                </div>
                <div className={`${s.styles} scroll`}>
                  {q.data?.styles.map((st) => (
                    <Chip key={st.id} onClick={() => remix(st.id)}>
                      <Icon name="shuffle" size={14} /> {st.name}
                    </Chip>
                  ))}
                </div>
                <div className={s.actions}>
                  <button className={s.action} onClick={() => { setEdit(true); setDraft(layout); }}>
                    <Icon name="wand" size={22} /> Edit
                  </button>
                  <button className={s.action} onClick={() => exportWall()} disabled={busy === 'export'}>
                    {busy === 'export' ? <Spinner size={18} /> : <Icon name="download" size={22} />} Save
                  </button>
                  <button className={s.action} onClick={zine} disabled={busy === 'zine'}>
                    {busy === 'zine' ? <Spinner size={18} /> : <Icon name="print" size={22} />} Zine
                  </button>
                </div>
              </>
            )}
            {edit && layout && (
              <div className={s.editBar}>
                {sel ? (
                  <>
                    <div className={s.editRow}>
                      <span className="t-cap">Rotate</span>
                      <input type="range" min={-45} max={45} value={sel.rot} onChange={(e) => patchSel({ rot: Number(e.target.value) })} />
                    </div>
                    <div className={s.editRow}>
                      <span className="t-cap">Size</span>
                      <input type="range" min={0.15} max={0.8} step={0.01} value={sel.w} onChange={(e) => { const w = Number(e.target.value); patchSel({ w, h: (sel.h / sel.w) * w }); }} />
                    </div>
                    <div className="hstack gap8">
                      {(['photo', 'sticker', 'polaroid'] as const).map((sh) => (
                        <Chip key={sh} active={sel.shape === sh} onClick={() => patchSel({ shape: sh })}>{sh}</Chip>
                      ))}
                      <Chip onClick={() => patchSel({ z: Math.max(...layout.items.map((i) => i.z)) + 1 })}>Front</Chip>
                    </div>
                  </>
                ) : (
                  <p className="t-foot center" style={{ margin: 0 }}>Tap a photo to move, turn or resize it.</p>
                )}
                <div className="hstack gap8">
                  <PillButton tone="dark" onClick={() => { setEdit(false); setDraft(null); setSelected(null); }}>Cancel</PillButton>
                  <PillButton onClick={save} disabled={busy === 'save'}>Save version</PillButton>
                </div>
              </div>
            )}
          </>
        )}
        {tab === 'recap' && <Recap posts={posts} recap={q.data?.recap ?? null} onGenerate={genRecap} busy={busy === 'recap'} msg={msg} />}
        {tab === 'awards' && <Awards results={results} users={users} />}
        <div style={{ height: 40 }} />
      </div>

      <Sheet open={versions} onClose={() => setVersions(false)} title="Versions">
        <div className="stack gap8" style={{ paddingBottom: 12 }}>
          {q.data?.versions.map((v) => (
            <div key={v.version} className="hstack gap12" style={{ minHeight: 48 }}>
              <span className={s.vNum}>v{v.version}</span>
              <span className="grow">
                <span className="t-headline">{v.generator === 'auto' ? 'Developed' : v.generator === 'edit' ? 'Edited' : `Remixed · ${v.style}`}</span>
                <span className="t-foot" style={{ display: 'block' }}>{v.created_by ? users.get(v.created_by)?.name : 'the roll'} · {timeAgo(v.created_at)}</span>
              </span>
              <button className="chip" onClick={() => exportWall(v.version)}>Save</button>
            </div>
          ))}
        </div>
      </Sheet>
      <Sheet open={share} onClose={() => setShare(false)} title="Share this week">
        <div className={s.shareGrid}>
          <button onClick={() => { setShare(false); void exportWall(); }}>
            <span className={s.shareIcon} style={{ background: 'var(--white)', color: 'var(--black)' }}><Icon name="download" /></span>
            Save image
          </button>
          <button onClick={() => { setShare(false); void exportWall(); }}>
            <span className={s.shareIcon} style={{ background: 'var(--imessage)' }}><Icon name="chat" /></span>
            Messages
          </button>
          <button onClick={() => { setShare(false); void exportWall(); }}>
            <span className={s.shareIcon} style={{ background: 'linear-gradient(135deg, var(--purple), var(--pink))' }}><Icon name="camera" /></span>
            Stories
          </button>
          <button onClick={() => { setShare(false); void zine(); }}>
            <span className={s.shareIcon} style={{ background: 'var(--yellow)', color: 'var(--black)' }}><Icon name="print" /></span>
            Print zine
          </button>
        </div>
        <p className="t-cap center">Exports carry the roll. watermark and a provenance record.</p>
      </Sheet>
    </div>
  );
}

/* ───────────────────────── Recap: AI panels + slideshow ───────────────────────── */

function Recap({ posts, recap, onGenerate, busy, msg }: { posts: Post[]; recap: LikenessObject | null; onGenerate: (style: string) => void; busy: boolean; msg: string | null }) {
  const [play, setPlay] = useState(false);
  const panels = (recap?.meta.panels as string[] | undefined) ?? [];
  return (
    <div className={s.recap}>
      <button className={s.slideshowCard} onClick={() => setPlay(true)} disabled={!posts.length}>
        <div className={s.slideMosaic}>
          {posts.slice(0, 4).map((p) => (
            <img key={p.id} src={p.media.thumb ?? p.media.main} alt="" />
          ))}
        </div>
        <span className={s.playBtn}>
          <Icon name="play" size={22} />
        </span>
        <span className={s.slideLabel}>Play the week · {posts.length} moments</span>
      </button>

      <div className={s.recapHead}>
        <span className="t-title3">AI recap</span>
        {recap && <span className={s.aiInfo}><Icon name="info" size={14} /> Made with roll. AI</span>}
      </div>
      {panels.length ? (
        <div className={s.panels}>
          {panels.map((p, i) => (
            <motion.img key={p} src={p} alt="" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} />
          ))}
        </div>
      ) : (
        <p className="t-sub">Six panels from the week, drawn in one style.</p>
      )}
      <div className={`${s.styles} scroll`} style={{ padding: 0 }}>
        {['comic', 'anime', 'sketch', 'watercolor', '8bit', 'polaroid'].map((st) => (
          <Chip key={st} onClick={() => onGenerate(st)}>
            {busy ? <Spinner size={14} /> : <Icon name="sparkles" size={14} />} {st === '8bit' ? '8-bit' : st[0].toUpperCase() + st.slice(1)}
          </Chip>
        ))}
      </div>
      {msg && <p className="t-foot" style={{ color: 'var(--yellow)' }}>{msg}</p>}
      <AnimatePresence>{play && <Slideshow posts={posts} onClose={() => setPlay(false)} />}</AnimatePresence>
    </div>
  );
}

/** Retro "video slideshow" of the week, story-style progress bars. */
function Slideshow({ posts, onClose }: { posts: Post[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => (i < posts.length - 1 ? setI(i + 1) : onClose()), 2600);
    return () => clearTimeout(t);
  }, [i, posts.length, onClose]);
  const p = posts[i];
  return (
    <motion.div className={s.slideshow} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); if (e.clientX - r.left < r.width / 3) setI(Math.max(0, i - 1)); else if (i < posts.length - 1) setI(i + 1); else onClose(); }}>
      <div className={s.bars}>
        {posts.map((_, k) => (
          <span key={k}>
            <motion.i initial={{ width: k < i ? '100%' : 0 }} animate={{ width: k < i ? '100%' : k === i ? '100%' : 0 }} transition={{ duration: k === i ? 2.6 : 0, ease: 'linear' }} />
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.img key={p.id} src={p.media.main} alt="" className={s.slideImg} initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
      </AnimatePresence>
      <div className={s.slideBy}>
        <Avatar user={p.user} size={28} /> <b>{p.user.name.split(' ')[0]}</b> {p.caption && <span>· {p.caption}</span>}
      </div>
      <button className={s.slideClose} onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close">
        <Icon name="close" size={22} />
      </button>
    </motion.div>
  );
}

/* ───────────────────────── Awards (Wrapped Party style) ───────────────────────── */

function Awards({ results, users }: { results: { title: string; emoji: string; line: string; winners: string[] }[] | null; users: Map<string, PublicUser> }) {
  if (!results?.length) return <p className="t-sub center" style={{ padding: 30 }}>Awards appear when the week develops.</p>;
  const tones = ['var(--yellow)', 'var(--blue)', 'var(--purple)', 'var(--green)', 'var(--orange)', 'var(--red)'];
  return (
    <div className={s.awards}>
      {results.map((a, i) => (
        <motion.div key={a.title + i} className={s.award} style={{ background: tones[i % tones.length] }} initial={{ opacity: 0, y: 20, rotate: i % 2 ? 2 : -2 }} animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 }} transition={{ delay: i * 0.08, type: 'spring' }}>
          <span className={s.awardEmoji}>{a.emoji}</span>
          <span className={s.awardTitle}>{a.title}</span>
          <span className={s.awardLine}>{a.line}</span>
          <span className={s.awardWinners}>
            <AvatarStack users={a.winners.map((w) => users.get(w))} size={30} />
            <b>{a.winners.map((w) => users.get(w)?.name.split(' ')[0] ?? '').join(' & ')}</b>
          </span>
        </motion.div>
      ))}
    </div>
  );
}


