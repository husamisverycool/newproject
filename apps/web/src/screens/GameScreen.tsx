import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { characterai, gartic, gphotos, instagram, ios, jackbox, kahoot, spec, tbh, wrapped } from '@app/shared';
import { Alert, Avatar, AvatarStack, Button, GlassCircle, NavBar, Row, Screen, Section, Sheet, Spinner } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { api } from '../lib/api';
import { queryClient, useFeed, useGroup, useMe } from '../lib/queries';
import { haptic, sfx } from '../lib/feedback';
import { firstName } from '../lib/format';
import type { Post, PublicUser } from '../lib/types';
import s from './game.module.css';

type Kind = 'superlatives' | 'telephone' | 'challenge' | 'guess_whose';
interface Award { kind?: 'poll' | 'award' | 'group'; title: string; winners: string[]; votes?: number }
interface Step { kind: 'photo' | 'caption' | 'render' | 'guess'; userId: string | null; media?: string; text?: string; at: number }
interface QuizPost extends Post { options: string[]; answer: string | null }
interface GameView {
  id: string;
  kind: Kind;
  weekKey: string;
  closed: boolean;
  intro: string;
  users: PublicUser[];
  lobby: { roomCode: string; vip: string[]; players: string[]; audience: string[]; played: string[] };
  results: Award[] | null;
  share: boolean;
  questions?: { text: string; myVote: string | null; voters: number; tally: Record<string, number> | null }[];
  tasks?: { chainId: string; step: 'caption' | 'guess'; media: string | null }[];
  chainCount?: number;
  chains?: { id: string; steps: Step[] }[] | null;
  challenge?: string | null;
  by?: string | null;
  entries?: { userId: string; postId: string; at: number; post: Post | null }[];
  posts?: QuizPost[];
  myGuesses?: Record<string, string>;
  leaderboard?: { userId: string; score: number }[];
  me?: { place: number; score: number } | null;
  podium?: { userId: string; score: number }[] | null;
}

/** Game names: the source's own name where it has one ([V] Add Yours, [V-weak] Top Song Quiz), else the spec's [S]. */
const TITLE: Record<Kind, string> = { superlatives: spec.superlatives, telephone: spec.photoTelephone, challenge: instagram.addYours, guess_whose: wrapped.quizName };

/** tbh: the background changes each question [B-med]; iOS system colors in HIG order that reach 3:1 with white text [HIG]. */
const POLL_COLORS = ['var(--sys-red)', 'var(--sys-blue)', 'var(--sys-indigo)', 'var(--sys-purple)', 'var(--sys-pink)', 'var(--sys-brown)'];

/** Kahoot! tiles, in the brand order: Triangle = Red · Diamond = Blue · Circle = Yellow · Square = Green [V-weak]. */
const TILE = {
  triangle: { icon: 'kahootTriangle', cls: s.tileRed },
  diamond: { icon: 'kahootDiamond', cls: s.tileBlue },
  circle: { icon: 'kahootCircle', cls: s.tileYellow },
  square: { icon: 'kahootSquare', cls: s.tileGreen },
} as const;

const refresh = (groupId: string) => queryClient.invalidateQueries({ queryKey: ['game', groupId] });

/**
 * The weekly game (spec §K), hosted by the group mascot as a Duolingo character. Each kind copies its
 * source: tbh / Gas polls, Gartic Phone telephone, Instagram "Add Yours", Wrapped's Top Song Quiz with
 * Kahoot! tiles. Jackbox supplies the lobby (VIP, "Everybody's in", Room Code, Audience); results are
 * Spotify Wrapped Party awards; the share text is Wordle's grid. Sources per block: game.module.css.
 */
export default function GameScreen() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const g = useGroup(groupId);
  const me = useMe();
  const q = useQuery({ queryKey: ['game', groupId], queryFn: () => api.get<{ game: GameView | null }>(`/groups/${groupId}/game`), enabled: Boolean(groupId) });
  const game = q.data?.game ?? null;
  const mascot = g.data?.group.mascot;
  const myId = me.data?.user.id ?? '';
  const [qi, setQi] = useState<number | null>(null);
  const polling = game?.kind === 'superlatives' && !game.closed;
  const qs = game?.questions ?? [];
  const current = qi ?? Math.max(0, qs.findIndex((x) => !x.myVote));
  const pollBg = POLL_COLORS[current % POLL_COLORS.length];

  return (
    <Screen grouped dark={polling || undefined} className={polling ? s.pollScreen : ''} style={polling ? { background: pollBg } : undefined}>
      <NavBar
        leading={<GlassCircle icon="close" label={ios.close} onClick={() => nav(-1)} />}
        title={game ? TITLE[game.kind] : undefined}
        trailing={<GlassCircle icon="notebook" label={characterai.memory} onClick={() => nav(`/g/${groupId}/memory`)} />}
      />
      <div className={s.scroll}>
        {!game && q.isLoading && (
          <div className={s.center}>
            <Spinner />
          </div>
        )}
        {game && mascot && (
          <div className={s.host}>
            <Mascot species={mascot.species} level={mascot.stage.level} outfit={mascot.outfit} size={88} mood={game.closed ? 'party' : 'happy'} shadow={polling ? 'rgba(0,0,0,0.18)' : undefined} />
            <motion.div className={s.bubble} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {game.intro}
            </motion.div>
          </div>
        )}
        {game?.kind === 'superlatives' && !game.closed && <Poll game={game} groupId={groupId} myId={myId} index={current} setIndex={setQi} />}
        {game?.kind === 'telephone' && <Telephone game={game} groupId={groupId} />}
        {game?.kind === 'challenge' && <AddYours game={game} groupId={groupId} myId={myId} />}
        {game?.kind === 'guess_whose' && <Quiz game={game} groupId={groupId} myId={myId} />}
        {game?.results && <Awards results={game.results} users={game.users} />}
        {game?.share && <Share groupId={groupId} gameId={game.id} />}
        {game && <Lobby game={game} groupId={groupId} myId={myId} />}
      </div>
    </Screen>
  );
}

/* ───────────────────────── tbh / Gas poll ───────────────────────── */

function Poll({ game, groupId, myId, index, setIndex }: { game: GameView; groupId: string; myId: string; index: number; setIndex: (i: number) => void }) {
  const [shuffle, setShuffle] = useState(0);
  const [busy, setBusy] = useState(false);
  const qs = game.questions ?? [];
  const cur = qs[index];
  // tbh: "Four friends' names"; "shuffle" brings a new set of friends [V / V-weak].
  const four = useMemo(() => {
    const others = game.users.filter((u) => u.id !== myId);
    const start = (shuffle * tbh.names + index) % Math.max(1, others.length);
    return [...others.slice(start), ...others.slice(0, start)].slice(0, tbh.names);
  }, [game.users, myId, shuffle, index]);
  if (!cur) return null;
  const next = () => setIndex((index + 1) % qs.length);
  const vote = async (userId: string) => {
    if (busy) return;
    setBusy(true);
    haptic('heavy');
    sfx.pop();
    await api.post(`/groups/${groupId}/game/${game.id}/vote`, { question: index, userId }).catch(() => undefined);
    await refresh(groupId);
    setBusy(false);
    setShuffle(0);
    setTimeout(next, 350);
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div key={index} className={s.poll} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
        <div className={s.progress}>{tbh.progress(index + 1, qs.length)}</div>
        <div className={s.question}>{cur.text}</div>
        <div className={s.names}>
          {four.map((u) => (
            <button key={u.id} className={`${s.name} ${cur.myVote && cur.myVote !== u.id ? s.nameDim : ''}`} onClick={() => vote(u.id)} disabled={busy}>
              <Avatar user={u} size={34} />
              <span className={s.nameLabel}>{firstName(u.name)}</span>
              {cur.myVote === u.id && <Icon name="check" size={18} strokeWidth={3} />}
            </button>
          ))}
        </div>
        <div className={s.pollFoot}>
          <button onClick={() => { haptic('light'); setShuffle((x) => x + 1); }}>
            <Icon name="shuffle" size={18} />
            {tbh.shuffle}
          </button>
          <button onClick={() => { haptic('light'); next(); }}>{tbh.skip}</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────────────────── Gartic Phone telephone ───────────────────────── */

function Telephone({ game, groupId }: { game: GameView; groupId: string }) {
  const feed = useFeed(groupId);
  const [pick, setPick] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [album, setAlbum] = useState<string | null>(null);
  const users = new Map(game.users.map((u) => [u.id, u]));
  const task = game.tasks?.[0];
  const send = async (body: object) => {
    setBusy(true);
    await api.post(`/groups/${groupId}/game/${game.id}/telephone`, body).catch(() => undefined);
    await refresh(groupId);
    sfx.sparkle();
    setText('');
    setBusy(false);
  };
  const chain = game.chains?.find((c) => c.id === album) ?? null;
  return (
    <>
      {!game.closed && task && (
        <div className={s.task}>
          {/* Gartic: the step name at the top, the thing to answer on blank paper, input and "Done" at the bottom. */}
          <div className={s.taskHead}>{task.step === 'caption' ? gartic.writeASentence : gartic.describe}</div>
          <div className={s.paper}>{task.media && <img src={task.media} alt="" />}</div>
          <div className={s.taskBar}>
            <input className="ios-field" value={text} maxLength={120} onChange={(e) => setText(e.target.value)} aria-label={task.step === 'caption' ? gartic.writeASentence : gartic.describe} />
            <Button small onClick={() => send({ chainId: task.chainId, kind: task.step, text })} disabled={!text.trim() || busy}>
              {busy ? <Spinner size={16} /> : gartic.done}
            </Button>
          </div>
        </div>
      )}
      {!game.closed && (
        <div className={s.startRow}>
          <Button kind="tinted" onClick={() => setPick(true)} disabled={busy}>
            <Icon name="photo" size={20} />
            {ios.photos}
          </Button>
        </div>
      )}
      {game.closed && game.chains && game.chains.length > 0 && (
        <Section header={gartic.album}>
          {game.chains.map((c) => {
            const first = c.steps[0];
            return (
              <Row
                key={c.id}
                icon={first.media ? <img className={s.thumb} src={first.media} alt="" /> : undefined}
                title={<AvatarStack users={c.steps.filter((st) => st.userId).map((st) => users.get(st.userId!))} size={24} edge="var(--sys-grouped2)" />}
                onClick={() => setAlbum(c.id)}
              />
            );
          })}
        </Section>
      )}
      <Sheet open={pick} onClose={() => setPick(false)} title={ios.photos} trailing={<button className="ios-bar-btn" onClick={() => setPick(false)}>{ios.cancel}</button>}>
        <div className={s.pickGrid}>
          {(feed.data?.posts ?? []).filter((p) => !p.blurred).map((p) => (
            <button key={p.id} onClick={() => { setPick(false); void send({ kind: 'photo', postId: p.id }); }}>
              <img src={p.media.thumb ?? p.media.main} alt="" />
            </button>
          ))}
        </div>
      </Sheet>
      {/* Gartic: players "flip through every album", each step in the order it was played. */}
      <Sheet open={Boolean(chain)} onClose={() => setAlbum(null)} title={gartic.album} height="92%" trailing={<button className="ios-bar-btn bold" onClick={() => setAlbum(null)}>{ios.done}</button>}>
        {chain?.steps.map((st, i) => {
          const u = st.userId ? users.get(st.userId) : null;
          return (
            <motion.div key={i} className={s.albumStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.6 }}>
              <div className={s.albumBy}>
                {u ? <Avatar user={u} size={24} /> : <Icon name="sparkles" size={20} />}
                <span>{u ? firstName(u.name) : gphotos.madeBy}</span>
              </div>
              {st.media ? <img className={s.albumImg} src={st.media} alt="" /> : <div className={s.albumText}>{st.text}</div>}
            </motion.div>
          );
        })}
      </Sheet>
    </>
  );
}

/* ───────────────────────── Instagram "Add Yours" ───────────────────────── */

function AddYours({ game, groupId, myId }: { game: GameView; groupId: string; myId: string }) {
  const nav = useNavigate();
  const feed = useFeed(groupId);
  const [prompt, setPrompt] = useState('');
  const [pick, setPick] = useState(false);
  const entries = game.entries ?? [];
  const mine = (feed.data?.posts ?? []).filter((p) => p.mine && p.weekKey === game.weekKey);
  const users = new Map(game.users.map((u) => [u.id, u]));
  const post = async (body: object) => {
    haptic('medium');
    await api.post(`/groups/${groupId}/game/${game.id}/challenge`, body).catch(() => undefined);
    await refresh(groupId);
    sfx.sparkle();
  };
  return (
    <>
      <div className={s.sticker}>
        <div className={s.stickerHead}>{instagram.addYours}</div>
        {game.challenge ? (
          <>
            <div className={s.stickerPrompt}>{game.challenge}</div>
            {entries.length > 0 && (
              <div className={s.stickerMeta}>
                <AvatarStack users={entries.map((e) => users.get(e.userId))} size={22} edge="#ffffff" />
                <span>{entries.length}</span>
              </div>
            )}
            {!game.closed && (
              <Button block onClick={() => (mine.length ? setPick(true) : nav('/'))}>
                {instagram.addYours}
              </Button>
            )}
          </>
        ) : (
          !game.closed && (
            <>
              {/* "Add Yours": the sticker's creator types the prompt. */}
              <input className={`ios-field ${s.stickerField}`} value={prompt} maxLength={140} onChange={(e) => setPrompt(e.target.value)} aria-label={instagram.addYours} />
              <Button block onClick={() => post({ prompt })} disabled={!prompt.trim()}>
                {ios.done}
              </Button>
            </>
          )
        )}
      </div>
      {entries.length > 0 && (
        <div className={s.chain}>
          {entries.map((e) => e.post && (
            <button key={e.postId} className={s.chainItem} onClick={() => nav(`/p/${e.postId}`)}>
              <img src={e.post.media.thumb ?? e.post.media.main} alt="" />
              <span>{e.userId === myId ? firstName(e.post.user.name) : firstName(users.get(e.userId)?.name ?? '')}</span>
            </button>
          ))}
        </div>
      )}
      <Sheet open={pick} onClose={() => setPick(false)} title={ios.photos} trailing={<button className="ios-bar-btn" onClick={() => setPick(false)}>{ios.cancel}</button>}>
        <div className={s.pickGrid}>
          {mine.map((p) => (
            <button key={p.id} onClick={() => { setPick(false); void post({ postId: p.id }); }}>
              <img src={p.media.thumb ?? p.media.main} alt="" />
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

/* ───────────────────────── Top Photo Quiz × Kahoot! ───────────────────────── */

function Quiz({ game, groupId, myId }: { game: GameView; groupId: string; myId: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const users = new Map(game.users.map((u) => [u.id, u]));
  const guesses = game.myGuesses ?? {};
  const posts = game.posts ?? [];
  const open = posts.find((p) => p.id === openId) ?? null;
  const guess = async (userId: string) => {
    if (!open || guesses[open.id]) return;
    haptic('medium');
    await api.post(`/groups/${groupId}/game/${game.id}/guess`, { postId: open.id, userId }).catch(() => undefined);
    await refresh(groupId);
  };
  const shapeOf = (p: QuizPost, userId: string) => kahoot.tiles[p.options.indexOf(userId)] ?? null;
  return (
    <>
      <div className={s.quizGrid}>
        {posts.map((p) => {
          const pickedTile = guesses[p.id] ? shapeOf(p, guesses[p.id]) : null;
          const shown = p.answer ?? (p.mine ? p.user.id : null);
          return (
            <button key={p.id} className={s.quizTile} onClick={() => !p.mine && setOpenId(p.id)} disabled={p.mine}>
              <img src={p.media.thumb ?? p.media.main} alt="" />
              {pickedTile && (
                <span className={`${s.quizShape} ${TILE[pickedTile.shape].cls}`}>
                  <Icon name={TILE[pickedTile.shape].icon} size={14} />
                </span>
              )}
              {shown && <Avatar user={users.get(shown)} size={26} ring={p.answer && guesses[p.id] === p.answer ? 'var(--sys-green)' : undefined} style={{ position: 'absolute', right: 6, bottom: 6 }} />}
            </button>
          );
        })}
      </div>
      {game.closed && game.podium && game.podium.length > 0 && <Podium podium={game.podium} users={users} />}
      {(game.leaderboard?.length ?? 0) > 0 && (
        <Section>
          {game.leaderboard!.map((r, i) => (
            <Row key={r.userId} icon={<span className={s.rankCell}><span className={s.rank}>{i + 1}</span><Avatar user={users.get(r.userId)} size={28} /></span>} title={<span className={r.userId === myId ? s.meRow : undefined}>{firstName(users.get(r.userId)?.name ?? '')}</span>} value={r.score} />
          ))}
          {game.me && game.me.place > kahoot.leaderboard && (
            <Row icon={<span className={s.rankCell}><span className={s.rank}>{game.me.place}</span><Avatar user={users.get(myId)} size={28} /></span>} title={<span className={s.meRow}>{firstName(users.get(myId)?.name ?? '')}</span>} value={game.me.score} />
          )}
        </Section>
      )}
      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} trailing={<button className="ios-bar-btn bold" onClick={() => setOpenId(null)}>{ios.done}</button>}>
        {open && (
          <>
            <img className={s.quizPhoto} src={open.media.main} alt="" />
            <div className={s.tiles}>
              {open.options.map((uid, i) => {
                const t = kahoot.tiles[i];
                const mineHere = guesses[open.id];
                // Kahoot!: once everyone has answered (or time is up), the correct answer is shown.
                const dim = open.answer ? uid !== open.answer : Boolean(mineHere && mineHere !== uid);
                return (
                  <button key={uid} className={`${s.tile} ${TILE[t.shape].cls} ${dim ? s.tileDim : ''}`} onClick={() => guess(uid)} disabled={Boolean(mineHere) || game.closed}>
                    <Icon name={TILE[t.shape].icon} size={22} />
                    <span className={s.tileLabel}>{firstName(users.get(uid)?.name ?? '')}</span>
                    {mineHere === uid && <Icon name="check" size={18} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}

function Podium({ podium, users }: { podium: { userId: string; score: number }[]; users: Map<string, PublicUser> }) {
  // Kahoot! podium [V]; 2nd · 1st · 3rd with 1st tallest [B-med].
  const order = [podium[1], podium[0], podium[2]];
  const height = [72, 104, 52];
  return (
    <div className={s.podium}>
      {order.map((p, i) =>
        p ? (
          <div key={p.userId} className={s.podiumCol}>
            <Avatar user={users.get(p.userId)} size={i === 1 ? 52 : 40} />
            <span>{firstName(users.get(p.userId)?.name ?? '')}</span>
            <div className={s.podiumStep} style={{ height: height[i] } as CSSProperties}>
              {i === 1 ? 1 : i === 0 ? 2 : 3}
            </div>
          </div>
        ) : (
          <div key={i} />
        ),
      )}
    </div>
  );
}

/* ───────────────────────── Wrapped Party awards ───────────────────────── */

function Awards({ results, users }: { results: Award[]; users: PublicUser[] }) {
  const map = new Map(users.map((u) => [u.id, u]));
  return (
    <div className={s.awards}>
      {results.map((r, i) => (
        <motion.div key={`${r.title}${i}`} className={s.award} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <span className={s.awardTitle}>{r.title}</span>
          <span className={s.awardWho}>
            <AvatarStack users={r.winners.map((w) => map.get(w))} size={30} max={r.kind === 'group' ? 8 : 4} edge="#000000" />
            {r.kind !== 'group' && <span>{r.winners.map((w) => firstName(map.get(w)?.name ?? '')).join(', ')}</span>}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── Wordle share ───────────────────────── */

function Share({ groupId, gameId }: { groupId: string; gameId: string }) {
  const [text, setText] = useState<string | null>(null);
  const open = async () => {
    const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const r = await api.get<{ text: string | null }>(`/groups/${groupId}/game/${gameId}/share?theme=${dark ? 'dark' : 'light'}`);
    if (!r.text) return;
    if (navigator.share) await navigator.share({ text: r.text }).catch(() => undefined);
    else setText(r.text);
  };
  return (
    <>
      <div className={s.startRow}>
        <Button kind="tinted" onClick={open}>
          <Icon name="share" size={20} />
          {ios.share}
        </Button>
      </div>
      <Sheet open={Boolean(text)} onClose={() => setText(null)} title={ios.share} trailing={<button className="ios-bar-btn bold" onClick={() => setText(null)}>{ios.done}</button>}>
        <pre className={s.sharePre}>{text}</pre>
        <Button block onClick={async () => { await navigator.clipboard?.writeText(text ?? '').catch(() => undefined); setText(null); }}>
          {ios.copy}
        </Button>
      </Sheet>
    </>
  );
}

/* ───────────────────────── Jackbox lobby ───────────────────────── */

function Lobby({ game, groupId, myId }: { game: GameView; groupId: string; myId: string }) {
  const [confirm, setConfirm] = useState(false);
  const users = new Map(game.users.map((u) => [u.id, u]));
  const played = new Set(game.lobby.played);
  const isVip = game.lobby.vip.includes(myId);
  const close = async () => {
    setConfirm(false);
    haptic('success');
    await api.post(`/groups/${groupId}/game/${game.id}/close`, {}).catch(() => undefined);
    await refresh(groupId);
    void queryClient.invalidateQueries({ queryKey: ['games', groupId] });
  };
  return (
    <>
      <Section header={jackbox.roomCode} footer={played.has(myId) && !game.closed ? kahoot.youreIn : undefined}>
        <Row title={<span className={s.lobbyCode}>{game.lobby.roomCode}</span>} />
        <div className={s.seats}>
          {game.lobby.players.map((uid) => {
            const u = users.get(uid);
            return (
              <div key={uid} className={`${s.seat} ${played.has(uid) ? '' : s.seatOut}`}>
                <Avatar user={u} size={44} />
                <span className={s.seatLabel}>{firstName(u?.name ?? '')}</span>
                {game.lobby.vip.includes(uid) && <span className={s.vip}>{jackbox.vip}</span>}
              </div>
            );
          })}
        </div>
        {game.lobby.audience.length > 0 && <Row title={jackbox.audience} value={game.lobby.audience.length} />}
      </Section>
      {isVip && !game.closed && (
        <div className={s.startRow}>
          <Button block onClick={() => setConfirm(true)} disabled={played.size === 0}>
            {jackbox.everybodysIn}
          </Button>
        </div>
      )}
      <Alert
        open={confirm}
        title={jackbox.everybodysIn}
        onDismiss={() => setConfirm(false)}
        actions={[
          { label: ios.cancel, onClick: () => setConfirm(false) },
          { label: ios.ok, onClick: close, preferred: true },
        ]}
      />
    </>
  );
}
