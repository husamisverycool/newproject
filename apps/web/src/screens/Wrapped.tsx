import { LIVE } from '../lib/static';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BRAND, ios, jackbox, spec, wrapped } from '@app/shared';
import { Avatar, AvatarStack, Menu, Sheet, Spinner } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { api, downloadBlob } from '../lib/api';
import { haptic } from '../lib/feedback';
import { queryClient, useMe } from '../lib/queries';
import type { MascotState, Post, PublicUser } from '../lib/types';
import s from './wrapped.module.css';
import { appUrl, shareLink } from '../lib/share';
import { fileToSquareJpeg } from '../lib/camera';

/* ───────────────────────── Data ───────────────────────── */

interface WrappedData {
  year: number;
  group: { id: string; name: string; emoji: string; mascot: Pick<MascotState, 'name' | 'species' | 'xp' | 'outfit'> };
  me: { moments: number; ritualWeeks: number; topMonth: number; rollAgeDays: number; role: { id: string } | null; topMoments: Post[] };
  groupStats: { moments: number; members: number; weeks: number };
  roles: Record<string, { id: string; user: PublicUser }>;
  days: { kind: string; date: string; posts: Post[] }[];
  quiz: { post: Omit<Post, 'user'>; answer: string; options: PublicUser[] }[];
  groupAwards: { id: string }[];
  figurines: { id: string; media: string }[];
}

interface PartyState {
  id: string;
  code: string;
  hostId: string;
  /** "rename your party" (null = the feature name) */
  name?: string | null;
  slide: number;
  players: PublicUser[];
  audience: PublicUser[];
  awards: { id: string; winners: PublicUser[] }[];
}

/** Server award ids → sourced names (wrapped deck). Awards with no sourced name are not shown. */
const AWARD_NAME: Record<string, string> = {
  early_bird: wrapped.awards.earlyBird,
  first_to_post: wrapped.awards.firstToPost,
  most_sunsets: wrapped.awards.mostSunsets,
  crate_digger: wrapped.awards.crateDigger,
  onion_chopper: wrapped.awards.onionChopper,
  dinner_table: wrapped.awards.dinnerTable,
  documentarian: wrapped.awards.mostPhotos,
  copy_paste: wrapped.awards.copyAndPaste,
  chaos_crew: wrapped.awards.chaosCrew,
};

/** Listening Archive day names (wrapped deck); other day kinds show their date only. */
const DAY_NAME: Record<string, string> = { biggest: wrapped.archiveDays.biggest, nostalgic: wrapped.archiveDays.nostalgic };

const roleOf = (id: string | undefined) => wrapped.roles.find((r) => r.id === id) ?? null;
const dayDate = (d: string) => ios.longDate(Date.parse(`${d}T12:00:00`));

/**
 * Wrapped (`/g/:groupId/wrapped`): the group's year as the Spotify Wrapped 2025 story. Card order
 * follows the story list in research/15 §1b where we have the data: Minutes Listened → "Photos
 * Posted"; the Top Song Quiz "before the top song is revealed" → "Top Photo Quiz" (spec §V "guess
 * whose photo"); Top Songs → "Top Photos"; Listening Archive → "Posting Archive" (up to five days);
 * Clubs → the group is the club (README noun table) and each member gets a Clubs role with Spotify's
 * own role line [V]; the summary card [B-med]; and "the Wrapped Party tile" at the end [V-weak].
 * Listening Age is left out: our measure is in days and Spotify's card copy for it is in years.
 * `?party=1` opens the party.
 */
export default function Wrapped() {
  const { groupId } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ['wrapped', groupId], queryFn: () => api.get<WrappedData>(`/groups/${groupId}/wrapped`), enabled: Boolean(groupId) });
  const party = useQuery({ queryKey: ['party', groupId], queryFn: () => api.get<{ party: PartyState | null }>(`/groups/${groupId}/party`), enabled: Boolean(groupId) });
  if (!q.data)
    return (
      <div className={s.story} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    );
  if (params.get('party'))
    return <PartyRoom data={q.data} party={party.data?.party ?? null} onClose={() => setParams({})} />;
  return <Story data={q.data} party={party.data?.party ?? null} onParty={() => setParams({ party: '1' })} onClose={() => nav(-1)} />;
}

/* ───────────────────────── Story ───────────────────────── */

type ShareKind = 'posted' | 'top' | 'role' | 'summary';
interface Card {
  id: string;
  green?: boolean;
  /** Waits for an answer before the timer runs (quiz). */
  hold?: boolean;
  share?: ShareKind;
  body: ReactNode;
}

/** Instagram/Snapchat story photos run 5 s each [B-med]; Spotify's card timing is UNKNOWN. */
const CARD_MS = 5000;

function Story({ data, party, onParty, onClose }: { data: WrappedData; party: PartyState | null; onParty: () => void; onClose: () => void }) {
  const me = useMe();
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedMenu, setSpeedMenu] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sharing, setSharing] = useState<ShareKind | null>(null);
  const press = useRef<{ t: number; x: number; timer: number } | null>(null);
  const role = roleOf(data.me.role?.id);
  const top = data.me.topMoments.slice(0, 5);
  const quiz = data.quiz.slice(0, 3);

  const cards = useMemo<Card[]>(() => {
    const list: Card[] = [];
    list.push({
      id: 'intro',
      body: (
        <div className={`${s.card} ${s.center}`}>
          <Mascot species={data.group.mascot.species} outfit={data.group.mascot.outfit} size={160} mood="party" />
          <h1 className={s.large}>{wrapped.title(data.year)}</h1>
          <p className={s.title2}>{data.group.name}</p>
        </div>
      ),
    });
    list.push({
      id: 'posted',
      share: 'posted',
      body: (
        <div className={s.card}>
          <p className={s.headline}>{wrapped.photosPosted}</p>
          <p className={s.huge}>{data.me.moments.toLocaleString()}</p>
          {top[0] && <img className={s.photo} src={top[0].media.main} alt="" />}
        </div>
      ),
    });
    if (quiz.length) {
      list.push({
        id: 'quiz',
        body: (
          <div className={s.card}>
            <h1 className={s.large}>{wrapped.quizName}</h1>
            <p className={s.title3}>{spec.guessWhose}</p>
          </div>
        ),
      });
      quiz.forEach((qz, i) => {
        list.push({
          id: `quiz${i}`,
          hold: true,
          body: (
            <div className={s.card}>
              <img className={s.photo} src={qz.post.media.main} alt="" />
              <div className={s.options}>
                {qz.options.map((o) => {
                  const picked = answers[i];
                  const cls = picked ? (o.id === qz.answer ? s.right : o.id === picked ? s.wrong : '') : '';
                  return (
                    <button
                      key={o.id}
                      className={`${s.option} ${cls}`}
                      disabled={Boolean(picked)}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [i]: o.id }));
                        haptic(o.id === qz.answer ? 'success' : 'medium');
                      }}
                    >
                      <Avatar user={o} size={32} />
                      {o.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ),
        });
      });
    }
    if (top.length) {
      list.push({
        id: 'top',
        share: 'top',
        body: (
          <div className={s.card}>
            <h1 className={s.large}>{wrapped.topPhotos}</h1>
            <div className={s.list}>
              {top.map((p, i) => (
                <div key={p.id} className={s.item}>
                  <span className={s.rank}>{i + 1}</span>
                  <img className={s.thumb} src={p.media.thumb ?? p.media.main} alt="" />
                  <span className={s.itemText}>
                    <span className={s.headline}>{p.caption ?? ios.longDate(p.createdAt)}</span>
                    {p.caption && <span className={s.sub}>{ios.longDate(p.createdAt)}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }
    if (data.days.length) {
      list.push({
        id: 'archive',
        body: (
          <div className={s.card}>
            <h1 className={s.large}>{wrapped.archive}</h1>
            <p className={s.title3}>{wrapped.archiveLine}</p>
          </div>
        ),
      });
      data.days.slice(0, 5).forEach((d) => {
        list.push({
          id: `day-${d.date}`,
          body: (
            <div className={s.card}>
              {DAY_NAME[d.kind] && <h1 className={s.large}>{DAY_NAME[d.kind]}</h1>}
              <p className={s.title3}>{dayDate(d.date)}</p>
              <div className={s.collage}>
                {d.posts.slice(0, 4).map((p) => (
                  <img key={p.id} src={p.media.thumb ?? p.media.main} alt="" />
                ))}
              </div>
            </div>
          ),
        });
      });
    }
    if (role) {
      list.push({
        id: 'club',
        body: (
          <div className={`${s.card} ${s.center}`}>
            <p className={s.huge}>{data.group.emoji}</p>
            <h1 className={s.large}>{data.group.name}</h1>
            <p className={s.sub}>{wrapped.rolesLine}</p>
          </div>
        ),
      });
      list.push({
        id: 'role',
        green: true,
        share: 'role',
        body: (
          <div className={s.card}>
            <p className={s.huge}>{role.name}</p>
            <p className={s.title2}>{role.line}</p>
          </div>
        ),
      });
      list.push({
        id: 'roles',
        body: (
          <div className={s.card}>
            <div className={s.list}>
              {Object.values(data.roles).map((r) => (
                <div key={r.user.id} className={s.item}>
                  <Avatar user={r.user} size={44} />
                  <span className={s.itemText}>
                    <span className={s.headline}>{r.user.name}</span>
                    <span className={s.sub}>{roleOf(r.id)?.name}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }
    if (data.figurines.length) {
      // Spec §I: "The group's set of figurines sits on a shelf in the Wrapped." [S]
      list.push({
        id: 'shelf',
        body: (
          <div className={s.card}>
            <div className={s.shelf}>
              {data.figurines.map((f) => (
                <img key={f.id} src={f.media} alt="" />
              ))}
            </div>
          </div>
        ),
      });
    }
    list.push({
      id: 'summary',
      green: true,
      share: 'summary',
      body: (
        <div className={s.card}>
          <h1 className={s.large}>{wrapped.title(data.year)}</h1>
          {top.length > 0 && (
            <div className={s.strip}>
              {top.map((p) => (
                <img key={p.id} src={p.media.thumb ?? p.media.main} alt="" />
              ))}
            </div>
          )}
          <p className={s.headline}>{wrapped.photosPosted}</p>
          <p className={s.huge}>{data.me.moments.toLocaleString()}</p>
          {role && <p className={s.title2}>{role.name}</p>}
        </div>
      ),
    });
    list.push({
      id: 'party',
      body: (
        <div className={`${s.card} ${s.center}`}>
          <Mascot species={data.group.mascot.species} outfit={data.group.mascot.outfit} size={140} mood="party" />
          <h1 className={s.large}>{wrapped.party}</h1>
          {party && <AvatarStack users={party.players} size={32} edge="var(--spotify-black)" />}
          <div className={s.buttons}>
            <button className={s.cta} onClick={onParty}>
              {party ? wrapped.joinParty : wrapped.createTheParty}
            </button>
          </div>
        </div>
      ),
    });
    return list;
  }, [data, answers, party, top, quiz, role, onParty]);

  const card = cards[Math.min(index, cards.length - 1)];
  const quizIndex = card.id.startsWith('quiz') && card.id !== 'quiz' ? Number(card.id.slice(4)) : -1;
  const waiting = Boolean(card.hold && answers[quizIndex] === undefined);
  const last = index >= cards.length - 1;
  const running = !held && !waiting && !speedMenu && !sharing && !last;
  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(cards.length - 1, i + d)));

  // Pointer: tap left third = back, elsewhere = forward; press and hold = pause [B-med].
  const down = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const timer = window.setTimeout(() => setHeld(true), 220);
    press.current = { t: Date.now(), x: e.clientX, timer };
  };
  const up = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    window.clearTimeout(p.timer);
    if (held) {
      setHeld(false);
      return;
    }
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    go(p.x - box.left < box.width / 3 ? -1 : 1);
  };

  return (
    <div data-dark className={`${s.story} ${card.green ? s.onGreen : ''}`} onPointerDown={down} onPointerUp={up} onPointerCancel={() => { press.current = null; setHeld(false); }}>
      <div key={card.id} className={card.green ? s.green : undefined} style={{ position: 'absolute', inset: 0 }}>
        {card.body}
      </div>

      <div className={s.bars}>
        {cards.map((c, i) => (
          <span key={c.id} className={`${s.bar} ${i < index ? s.done : ''} ${i === index ? s.now : ''}`}>
            {i === index && (
              <i
                key={`${c.id}-${index}`}
                style={{ animationDuration: `${CARD_MS / speed}ms`, animationPlayState: running ? 'running' : 'paused', width: last ? '100%' : undefined }}
                onAnimationEnd={() => go(1)}
              />
            )}
          </span>
        ))}
      </div>

      <div className={s.top}>
        <button className={s.chip} onClick={() => setSpeedMenu(true)} aria-label={wrapped.speed}>
          {ios.speedLabel(speed)}
        </button>
        <button className={s.close} onClick={onClose} aria-label={ios.close}>
          <Icon name="close" size={18} strokeWidth={2.4} />
        </button>
      </div>

      {card.share && (
        <div className={s.foot}>
          <button className={s.pill} onClick={() => setSharing(card.share!)}>
            <Icon name="share" size={18} strokeWidth={2.2} />
            {wrapped.shareThisStory}
          </button>
        </div>
      )}

      <Menu
        open={speedMenu}
        onClose={() => setSpeedMenu(false)}
        anchor="top"
        actions={ios.playbackSpeeds.map((v) => ({ label: `${ios.speedLabel(v)}${v === speed ? ' ✓' : ''}`, onClick: () => setSpeed(v) }))}
      />
      <ShareSheet kind={sharing} data={data} meName={me.data?.user.name ?? ''} onClose={() => setSharing(null)} />
    </div>
  );
}

/* ───────────────────────── Share card (9:16, spec §Q) ───────────────────────── */

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

async function img(src: string) {
  const i = new Image();
  i.crossOrigin = 'anonymous';
  i.src = src;
  await i.decode();
  return i;
}

/** Draws the share card at 1080×1920: the card's own content, the group mascot and the app name. */
async function renderShare(kind: ShareKind, data: WrappedData, mascotSvg: SVGSVGElement | null): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const font = cssVar('--font-spotify') || 'sans-serif';
  const green = kind === 'role' || kind === 'summary';
  const fg = green ? '#000' : '#fff';
  ctx.fillStyle = green ? cssVar('--spotify-green') : cssVar('--spotify-black');
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = fg;
  ctx.textBaseline = 'alphabetic';
  const M = 96;
  // Scale: 1 pt = 2.75 px (1080 px across a 393 pt phone).
  const pt = (n: number) => Math.round(n * 2.75);
  ctx.font = `600 ${pt(17)}px ${font}`;
  ctx.fillText(wrapped.title(data.year), M, M + pt(22));
  ctx.font = `400 ${pt(17)}px ${font}`;
  ctx.fillText(data.group.name, M, M + pt(22) * 2.2);
  let y = 560;
  const top = data.me.topMoments.slice(0, 5);
  const role = roleOf(data.me.role?.id);
  if (kind === 'posted' || kind === 'summary') {
    if (kind === 'summary' && top.length) {
      const size = (W - M * 2 - 4 * 12) / 5;
      const pics = await Promise.all(top.map((p) => img(p.media.thumb ?? p.media.main).catch(() => null)));
      pics.forEach((p, i) => p && ctx.drawImage(p, M + i * (size + 12), y - 200, size, size));
      y += 40;
    }
    ctx.font = `600 ${pt(17)}px ${font}`;
    ctx.fillText(wrapped.photosPosted, M, y);
    ctx.font = `700 ${pt(60)}px ${font}`;
    ctx.fillText(data.me.moments.toLocaleString(), M, y + pt(60));
    y += pt(60) + 80;
    if (kind === 'posted' && top[0]) {
      const pic = await img(top[0].media.main).catch(() => null);
      if (pic) {
        const size = Math.min(W - M * 2, 760);
        const sw = Math.min(pic.naturalWidth, pic.naturalHeight);
        ctx.drawImage(pic, (pic.naturalWidth - sw) / 2, (pic.naturalHeight - sw) / 2, sw, sw, M, y - 40, size, size);
      }
    }
    if (kind === 'summary' && role) {
      ctx.font = `400 ${pt(22)}px ${font}`;
      ctx.fillText(role.name, M, y);
    }
  } else if (kind === 'role' && role) {
    ctx.font = `700 ${pt(60)}px ${font}`;
    ctx.fillText(role.name, M, y);
    ctx.font = `400 ${pt(22)}px ${font}`;
    wrapText(ctx, role.line, W - M * 2).forEach((l, i) => ctx.fillText(l, M, y + 120 + i * pt(28)));
  } else if (kind === 'top') {
    ctx.font = `700 ${pt(34)}px ${font}`;
    ctx.fillText(wrapped.topPhotos, M, y - 120);
    const pics = await Promise.all(top.map((p) => img(p.media.thumb ?? p.media.main).catch(() => null)));
    top.forEach((p, i) => {
      const row = y + i * 190;
      ctx.font = `700 ${pt(22)}px ${font}`;
      ctx.fillText(String(i + 1), M, row + 110);
      const pic = pics[i];
      if (pic) ctx.drawImage(pic, M + 80, row, 154, 154);
      ctx.font = `600 ${pt(17)}px ${font}`;
      ctx.fillText((p.caption ?? ios.longDate(p.createdAt)).slice(0, 28), M + 270, row + 92);
    });
  }
  // Footer: the group mascot (spec §Q) and the app name.
  if (mascotSvg) {
    const svg = new XMLSerializer().serializeToString(mascotSvg);
    const m = await img(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`).catch(() => null);
    if (m) ctx.drawImage(m, M - 20, H - M - 240, 240, 240);
  }
  ctx.font = `700 ${pt(22)}px ${font}`;
  ctx.textAlign = 'right';
  ctx.fillText(BRAND.name, W - M, H - M - 40);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/png'));
}

function ShareSheet({ kind, data, meName, onClose }: { kind: ShareKind | null; data: WrappedData; meName: string; onClose: () => void }) {
  const mascot = useRef<HTMLDivElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => {
    if (!kind) {
      setBlob(null);
      return;
    }
    let live = true;
    void document.fonts.ready.then(() => renderShare(kind, data, mascot.current?.querySelector('svg') ?? null)).then((b) => live && setBlob(b));
    return () => {
      live = false;
    };
  }, [kind, data]);
  return (
    <>
      <div ref={mascot} className={s.hidden} aria-hidden>
        <Mascot species={data.group.mascot.species} outfit={data.group.mascot.outfit} size={240} />
      </div>
      <Sheet open={Boolean(kind)} onClose={onClose} dark title={wrapped.shareThisStory} trailing={<button className="ios-bar-btn bold" onClick={onClose}>{ios.done}</button>}>
        <div className={s.sharePreview}>{url ? <img src={url} alt="" /> : <Spinner />}</div>
        <div style={{ padding: '0 16px 24px' }}>
          <button className="ios-btn filled block" disabled={!blob} onClick={() => blob && void downloadBlob(blob, `${BRAND.bare}-${wrapped.feedName.toLowerCase()}-${data.year}-${meName.split(' ')[0]?.toLowerCase() ?? ''}.png`)}>
            {ios.share}
          </button>
        </div>
      </Sheet>
    </>
  );
}

/* ───────────────────────── Party (Wrapped Party) ───────────────────────── */

/**
 * Wrapped Party [V-weak] (research/04 §1.6, 15 §1e): the host steps "Create the party" → "Invite your
 * friends" ("a unique party link or code") → "Start the party"; guests tap "Join Party" and wait in the
 * "Waiting room" until the host starts. Awards are revealed one by one and "no two parties are ever
 * the same" (the server reseeds them per party). Past ten players, people join as the Jackbox
 * "Audience" [V], with Jackbox's "Room Code" label [V]. "Make it your own" [V-weak] renames the party and
 * sets the host's party name and photo; guests "confirm name and photo" after "Join Party" [V-weak]; the
 * host can "hand off hosting duties" [V-weak] to anyone in the room. Spotify's host badge is UNKNOWN (research/15 gaps), so the host row carries
 * the SF Symbol crown [HIG].
 */
function PartyRoom({ data, party, onClose }: { data: WrappedData; party: PartyState | null; onClose: () => void }) {
  const me = useMe();
  const gid = data.group.id;
  const myId = me.data?.user.id;
  const [busy, setBusy] = useState(false);
  const set = (p: PartyState | null) => queryClient.setQueryData(['party', gid], { party: p });
  const act = async (fn: () => Promise<{ party: PartyState | null } | null>) => {
    setBusy(true);
    try {
      const r = await fn();
      if (r) set(r.party);
    } finally {
      setBusy(false);
    }
  };
  const [profile, setProfile] = useState(false);
  const [handOff, setHandOff] = useState(false);
  const host = party?.hostId === myId;
  const joined = Boolean(party && [...party.players, ...party.audience].some((u) => u.id === myId));
  const meInParty = party ? [...party.players, ...party.audience].find((u) => u.id === myId) ?? null : null;
  const awards = [
    ...(party?.awards ?? []).filter((a) => AWARD_NAME[a.id]),
    ...data.groupAwards.filter((a) => AWARD_NAME[a.id]).map((a) => ({ id: a.id, winners: party?.players ?? [] })),
  ];
  const slide = party?.slide ?? 0;
  const award = slide >= 1 ? awards[slide - 1] : undefined;
  const invite = async () => {
    // In Claude the party is joined from the group's Wrapped screen with the code; the link opens the app.
    const url = LIVE ? appUrl() : `${location.origin}/g/${gid}/wrapped?party=1`;
    await shareLink(url, party?.code);
  };

  const green = Boolean(award);
  return (
    <div data-dark className={`${s.story} ${green ? s.onGreen : ''} ${green ? s.green : ''}`}>
      <div className={s.top}>
        <button className={s.close} onClick={onClose} aria-label={ios.close}>
          <Icon name="close" size={18} strokeWidth={2.4} />
        </button>
      </div>

      {!party && (
        <div className={s.party}>
          <Mascot species={data.group.mascot.species} outfit={data.group.mascot.outfit} size={120} mood="party" />
          <h1 className={s.large}>{wrapped.party}</h1>
          <ol className={s.steps}>
            {[wrapped.createTheParty, wrapped.makeItYourOwn, wrapped.inviteYourFriends, wrapped.startTheParty].map((t, i) => (
              <li key={t}>
                <span>{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className={s.spacer} />
          <button
            className={s.cta}
            disabled={busy}
            onClick={() =>
              void act(async () => {
                const r = await api.post<{ party: PartyState }>(`/groups/${gid}/party`);
                setProfile(true);
                return r;
              })
            }
          >
            {busy ? <Spinner size={18} /> : wrapped.createTheParty}
          </button>
        </div>
      )}

      {party && slide === 0 && (
        <div className={s.party}>
          <div>
            <p className={s.sub}>{wrapped.waitingRoom}</p>
            <h1 className={s.large}>{party.name || wrapped.party}</h1>
          </div>
          <div>
            <p className={s.sub}>{jackbox.roomCode}</p>
            <p className={s.code}>{party.code}</p>
          </div>
          <div className={s.list}>
            {party.players.map((u) => (
              <button key={u.id} className={s.item} disabled={u.id !== myId} onClick={() => setProfile(true)}>
                <Avatar user={u} size={40} />
                <span className={s.headline}>{u.name}</span>
                {u.id === party.hostId && <Icon name="crown" size={18} strokeWidth={2.2} className={s.hostMark} />}
              </button>
            ))}
          </div>
          {party.audience.length > 0 && (
            <div className={s.list}>
              <p className={s.sub}>{jackbox.audience}</p>
              <AvatarStack users={party.audience} size={32} max={12} edge="var(--spotify-black)" />
            </div>
          )}
          <div className={s.spacer} />
          <div className={s.buttons}>
            {!joined && (
              <button
                className={s.cta}
                disabled={busy}
                onClick={() =>
                  void act(async () => {
                    const r = await api.post<{ party: PartyState }>(`/groups/${gid}/party/join`);
                    // Guests "confirm name and photo" before the waiting room [V-weak].
                    setProfile(true);
                    return r;
                  })
                }
              >
                {wrapped.joinParty}
              </button>
            )}
            {host && (
              <>
                <button className={s.ghost} onClick={() => setProfile(true)}>
                  {wrapped.makeItYourOwn}
                </button>
                <button className={s.ghost} onClick={() => void invite()}>
                  {wrapped.inviteYourFriends}
                </button>
                {[...party.players, ...party.audience].some((u) => u.id !== myId) && (
                  <button className={s.ghost} onClick={() => setHandOff(true)}>
                    {wrapped.handOff}
                  </button>
                )}
                <button className={s.cta} disabled={busy || !awards.length} onClick={() => void act(() => api.post<{ party: PartyState }>(`/groups/${gid}/party/slide`, { slide: 1 }))}>
                  {wrapped.startTheParty}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {party && slide >= 1 && (
        <div className={s.party} style={{ justifyContent: 'center' }}>
          {award ? (
            <>
              <h1 className={s.huge}>{AWARD_NAME[award.id]}</h1>
              <div className={s.list}>
                {award.winners.map((u) => (
                  <div key={u.id} className={s.item}>
                    <Avatar user={u} size={56} />
                    <span className={s.title2}>{u.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className={s.large}>{wrapped.party}</h1>
              <div className={s.list}>
                {awards.map((a) => (
                  <div key={a.id} className={s.item}>
                    <AvatarStack users={a.winners} size={32} edge="var(--spotify-black)" />
                    <span className={s.headline}>{AWARD_NAME[a.id]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className={s.spacer} />
          {host && (
            <div className={s.buttons}>
              {award ? (
                <button className={green ? s.pill : s.cta} style={{ justifyContent: 'center' }} disabled={busy} onClick={() => void act(() => api.post<{ party: PartyState }>(`/groups/${gid}/party/slide`, { slide: slide + 1 }))}>
                  {ios.next}
                </button>
              ) : (
                <button className={s.cta} disabled={busy} onClick={() => void act(async () => { await api.del(`/groups/${gid}/party`); return { party: null }; })}>
                  {ios.done}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {party && (
        <PartyProfileSheet
          open={profile && Boolean(meInParty)}
          onClose={() => setProfile(false)}
          groupId={gid}
          party={party}
          host={host}
          me={meInParty}
          accountName={me.data?.user.name ?? ''}
          onSaved={set}
        />
      )}
      <Menu
        open={handOff}
        onClose={() => setHandOff(false)}
        actions={[...(party?.players ?? []), ...(party?.audience ?? [])]
          .filter((u) => u.id !== myId)
          .map((u) => ({ label: u.name, icon: 'crown', onClick: () => void act(() => api.post<{ party: PartyState }>(`/groups/${gid}/party/host`, { userId: u.id })) }))}
      />
    </div>
  );
}

/**
 * "Make it your own" [V-weak]: "update profile image and name, rename your party" (host); guests
 * "confirm name and photo" after "Join Party" (research/15 §1e). The name and photo belong to this party
 * only. Layout: Contacts-style photo with "Edit" and stock text fields in an inset group [HIG].
 */
function PartyProfileSheet({ open, onClose, groupId, party, host, me, accountName, onSaved }: {
  open: boolean; onClose: () => void; groupId: string; party: PartyState; host: boolean; me: PublicUser | null; accountName: string; onSaved: (p: PartyState | null) => void;
}) {
  const [name, setName] = useState('');
  const [partyName, setPartyName] = useState('');
  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setName(me?.name ?? accountName);
    setPartyName(party.name ?? '');
    setPhoto(null);
  }, [open, me, accountName, party.name]);
  const save = async () => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set('name', name.trim());
      if (photo) fd.set('file', photo.blob, 'photo.jpg');
      let r = await api.post<{ party: PartyState }>(`/groups/${groupId}/party/profile`, fd);
      if (host && (partyName.trim() || null) !== (party.name ?? null)) r = await api.patch<{ party: PartyState }>(`/groups/${groupId}/party`, { name: partyName });
      onSaved(r.party);
      haptic('success');
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet
      open={open}
      onClose={onClose}
      dark
      title={host ? wrapped.makeItYourOwn : wrapped.joinParty}
      leading={<button className="ios-bar-btn" onClick={onClose}>{ios.cancel}</button>}
      trailing={
        <button className="ios-bar-btn bold" disabled={busy || !name.trim()} onClick={() => void save()}>
          {busy ? <Spinner size={16} /> : ios.done}
        </button>
      }
    >
      <div className={s.profileSheet}>
        <button className={s.profilePhoto} onClick={() => fileRef.current?.click()}>
          {photo ? <img src={photo.url} alt="" /> : <Avatar user={me ? { ...me, name: name || me.name } : null} size={96} />}
          <span>{ios.edit}</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            const blob = await fileToSquareJpeg(f, 480);
            setPhoto({ blob, url: URL.createObjectURL(blob) });
          }}
        />
        <div className={s.fields}>
          <input value={name} placeholder={accountName} maxLength={32} onChange={(e) => setName(e.target.value)} aria-label={accountName} />
          {host && <input value={partyName} placeholder={wrapped.party} maxLength={40} onChange={(e) => setPartyName(e.target.value)} aria-label={wrapped.party} />}
        </div>
      </div>
    </Sheet>
  );
}
