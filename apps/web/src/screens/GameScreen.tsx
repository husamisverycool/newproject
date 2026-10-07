import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { api, ApiError } from '../lib/api';
import { queryClient, useGroup, useMe } from '../lib/queries';
import { haptic, sfx } from '../lib/feedback';
import { firstName, weekRange } from '../lib/format';
import type { Post, PublicUser } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, IconButton, LipButton, Sheet } from '../components/ui';
import { Mascot } from '../components/Mascot';
import s from './game.module.css';

interface GameView {
  id: string;
  kind: 'superlatives' | 'telephone' | 'challenge' | 'guess_whose';
  weekKey: string;
  closed: boolean;
  intro: string;
  users: PublicUser[];
  questions?: { text: string; myVote: string | null; voters: number; tally: Record<string, number> | null }[];
  results?: { title: string; emoji: string; line: string; winners: string[] }[] | null;
  chains?: { id: string; steps: { kind: 'photo' | 'caption' | 'render' | 'guess'; userId: string | null; media?: string; text?: string; at: number }[] }[];
  challenge?: string;
  entries?: { userId: string; postId: string; post: Post | null }[];
  posts?: Post[];
  myGuesses?: Record<string, string>;
}

/** tbh / Gas poll backgrounds — colourful gradients from the ledger palette. */
const POLL_BG = [
  'linear-gradient(160deg, var(--purple), var(--pink))',
  'linear-gradient(160deg, var(--blue), var(--navy))',
  'linear-gradient(160deg, var(--orange), var(--red))',
  'linear-gradient(160deg, var(--green), var(--blue))',
];

/**
 * The weekly game, run by the mascot (spec §K). Surfaces borrow Duolingo's game styling (rounded
 * "lip" buttons, round type, Feather Green for go) and the source party games: tbh/Gas polls
 * (named, positive), Gartic Phone telephone with a replay, BeReal-style challenges, the Wrapped quiz.
 */
export default function GameScreen() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const g = useGroup(groupId);
  const q = useQuery({ queryKey: ['game', groupId], queryFn: () => api.get<{ game: GameView | null }>(`/groups/${groupId}/game`) });
  const [share, setShare] = useState<string | null>(null);
  const game = q.data?.game;
  const mascot = g.data?.group.mascot;

  const openShare = async () => {
    if (!game) return;
    const r = await api.get<{ text: string }>(`/groups/${groupId}/game/${game.id}/share`);
    setShare(r.text);
  };

  return (
    <div className={`screen ${s.screen}`}>
      <header className={s.header}>
        <IconButton icon="close" label="Close" onClick={() => nav(-1)} />
        <div className={s.headTitle}>
          {game ? { superlatives: 'Superlatives', telephone: 'Photo Telephone', challenge: 'Weekly Challenge', guess_whose: 'Guess Whose' }[game.kind] : 'This week'}
          <span>{game && weekRange(game.weekKey)}</span>
        </div>
        <IconButton icon="memory" label="What the game master remembers" onClick={() => nav(`/g/${groupId}/memory`)} />
      </header>
      <div className={`${s.body} scroll`}>
        {mascot && game && (
          <div className={s.gm}>
            <Mascot species={mascot.species} level={mascot.stage.level} outfit={mascot.outfit} size={92} mood={game.closed ? 'party' : 'happy'} />
            <div className={s.speech}>{game.intro}</div>
          </div>
        )}
        {game?.kind === 'superlatives' && <Superlatives game={game} groupId={groupId} />}
        {game?.kind === 'telephone' && <Telephone game={game} groupId={groupId} />}
        {game?.kind === 'challenge' && <Challenge game={game} groupId={groupId} />}
        {game?.kind === 'guess_whose' && <GuessWhose game={game} groupId={groupId} />}
        {game?.results && <Results results={game.results} users={game.users} />}
        {game && (
          <button className={s.shareGridBtn} onClick={openShare}>
            <span className={s.miniGrid}>🟩🟨⬜</span> Share result
          </button>
        )}
        <div style={{ height: 30 }} />
      </div>
      <Sheet open={Boolean(share)} onClose={() => setShare(null)} title="Share">
        <pre className={s.sharePre}>{share}</pre>
        <div className="stack gap8" style={{ paddingBottom: 14 }}>
          <LipButton tone="green" onClick={async () => { await navigator.clipboard?.writeText(share ?? '').catch(() => undefined); setShare(null); }}>Copy</LipButton>
        </div>
      </Sheet>
    </div>
  );
}

function refresh(groupId: string) {
  return queryClient.invalidateQueries({ queryKey: ['game', groupId] });
}

/* ───────────────────────── Superlatives (tbh / Gas, named) ───────────────────────── */

function Superlatives({ game, groupId }: { game: GameView; groupId: string }) {
  const me = useMe();
  const [qi, setQi] = useState(() => Math.max(0, game.questions?.findIndex((x) => !x.myVote) ?? 0));
  const [shuffle, setShuffle] = useState(0);
  const qs = game.questions ?? [];
  const cur = qs[qi];
  const others = useMemo(() => {
    const list = game.users.filter((u) => u.id !== me.data?.user.id);
    const rot = shuffle % Math.max(1, list.length);
    return [...list.slice(rot), ...list.slice(0, rot)].slice(0, 4);
  }, [game.users, me.data, shuffle]);
  if (!cur) return null;
  const vote = async (userId: string) => {
    haptic('heavy');
    sfx.pop();
    await api.post(`/groups/${groupId}/game/${game.id}/vote`, { question: qi, userId });
    await refresh(groupId);
    setTimeout(() => setQi((i) => Math.min(qs.length - 1, i + 1)), 450);
  };
  return (
    <div className={s.poll}>
      <div className={s.pollDots}>
        {qs.map((x, i) => (
          <button key={i} className={`${s.pollDot} ${i === qi ? s.pollDotOn : ''} ${x.myVote ? s.pollDotDone : ''}`} onClick={() => setQi(i)} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={qi} className={s.pollCard} style={{ background: POLL_BG[qi % POLL_BG.length] }} initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
          <div className={s.pollQ}>{cur.text}</div>
          <div className={s.pollOptions}>
            {others.map((u) => {
              const mine = cur.myVote === u.id;
              const n = cur.tally?.[u.id] ?? 0;
              return (
                <button key={u.id} className={`${s.pollOption} ${mine ? s.pollMine : ''}`} onClick={() => !game.closed && vote(u.id)} disabled={game.closed}>
                  {cur.tally && <span className={s.pollFill} style={{ width: `${(n / Math.max(1, cur.voters)) * 100}%` }} />}
                  <Avatar user={u} size={34} />
                  <span>{firstName(u.name)}</span>
                  {mine && <Icon name="check" size={18} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <div className={s.pollFoot}>
            <button onClick={() => setShuffle((x) => x + 1)}>
              <Icon name="shuffle" size={16} /> Shuffle
            </button>
            <span>{cur.voters} voted · names are always shown</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Photo telephone (Gartic Phone) ───────────────────────── */

function Telephone({ game, groupId }: { game: GameView; groupId: string }) {
  const me = useMe();
  const [pick, setPick] = useState(false);
  const [replay, setReplay] = useState<string | null>(null);
  const [text, setText] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const week = useQuery({ queryKey: ['feed', groupId], queryFn: () => api.get<{ posts: Post[] }>(`/groups/${groupId}/feed`) });
  const users = new Map(game.users.map((u) => [u.id, u]));
  const act = async (body: object, key: string) => {
    setBusy(key);
    setErr(null);
    try {
      await api.post(`/groups/${groupId}/game/${game.id}/telephone`, body);
      await refresh(groupId);
      sfx.sparkle();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Try again');
    }
    setBusy(null);
  };
  return (
    <div className={s.tel}>
      <LipButton tone="green" onClick={() => setPick(true)}>
        <Icon name="photo" size={20} /> Start a chain
      </LipButton>
      {err && <p className={s.err}>{err}</p>}
      {(game.chains ?? []).map((c) => {
        const last = c.steps[c.steps.length - 1];
        const played = c.steps.some((st) => st.userId === me.data?.user.id);
        const next = last.kind === 'photo' || last.kind === 'guess' ? 'caption' : last.kind === 'render' ? 'guess' : null;
        return (
          <div key={c.id} className={s.chain}>
            <div className={s.chainSteps}>
              {c.steps.map((st, i) => (
                <div key={i} className={s.step}>
                  {st.media ? <img src={st.media} alt="" /> : <span className={s.stepText}>“{st.text}”</span>}
                  <span className={s.stepBy}>{st.kind === 'render' ? '🎨 AI' : st.userId ? firstName(users.get(st.userId)?.name ?? '') : ''}</span>
                </div>
              ))}
            </div>
            {!played && next && (
              <div className="hstack gap8">
                <input className="field" placeholder={next === 'caption' ? 'Describe it in a few words…' : 'What was the original?'} value={text[c.id] ?? ''} onChange={(e) => setText({ ...text, [c.id]: e.target.value })} />
                <button className={s.go} disabled={!text[c.id]?.trim() || busy === c.id} onClick={() => act({ chainId: c.id, kind: next, text: text[c.id] }, c.id)}>
                  {busy === c.id ? '…' : 'Go'}
                </button>
              </div>
            )}
            {played && <div className={s.waiting}>Waiting for the next friend…</div>}
            {c.steps.length >= 4 && (
              <button className={s.replay} onClick={() => setReplay(c.id)}>
                <Icon name="play" size={14} /> Replay
              </button>
            )}
          </div>
        );
      })}
      <Sheet open={pick} onClose={() => setPick(false)} title="Pick a photo to start">
        <div className={s.pickGrid}>
          {(week.data?.posts ?? []).filter((p) => !p.blurred).slice(0, 18).map((p) => (
            <button key={p.id} onClick={() => { setPick(false); void act({ kind: 'photo', postId: p.id }, 'start'); }}>
              <img src={p.media.thumb ?? p.media.main} alt="" />
            </button>
          ))}
        </div>
      </Sheet>
      <AnimatePresence>{replay && <Replay chain={game.chains!.find((c) => c.id === replay)!} users={users} onClose={() => setReplay(null)} />}</AnimatePresence>
    </div>
  );
}

/** Gartic Phone's album replay: each step revealed in order. */
function Replay({ chain, users, onClose }: { chain: NonNullable<GameView['chains']>[number]; users: Map<string, PublicUser>; onClose: () => void }) {
  return (
    <motion.div className={s.replayView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      {chain.steps.map((st, i) => (
        <motion.div key={i} className={s.replayStep} initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3 + i * 0.9, type: 'spring' }}>
          <span className={s.replayBy}>{st.kind === 'render' ? '🎨 the AI drew' : `${firstName(users.get(st.userId ?? '')?.name ?? '')} ${st.kind === 'photo' ? 'posted' : st.kind === 'caption' ? 'said' : 'guessed'}`}</span>
          {st.media ? <img src={st.media} alt="" /> : <span className={s.replayText}>“{st.text}”</span>}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ───────────────────────── Weekly challenge ───────────────────────── */

function Challenge({ game, groupId }: { game: GameView; groupId: string }) {
  const nav = useNavigate();
  const me = useMe();
  const [pick, setPick] = useState(false);
  const feed = useQuery({ queryKey: ['feed', groupId], queryFn: () => api.get<{ posts: Post[] }>(`/groups/${groupId}/feed`) });
  const mine = (feed.data?.posts ?? []).filter((p) => p.mine && p.weekKey === game.weekKey);
  return (
    <div className={s.challenge}>
      <div className={s.challengeCard}>
        <span className={s.challengeKicker}>this week’s challenge</span>
        <span className={s.challengeText}>{game.challenge}</span>
      </div>
      <div className="hstack gap8">
        <LipButton tone="green" onClick={() => nav('/')}>
          <Icon name="camera" size={20} /> Shoot it
        </LipButton>
        <LipButton tone="white" onClick={() => setPick(true)} disabled={!mine.length}>Enter a photo</LipButton>
      </div>
      <div className={s.entries}>
        {(game.entries ?? []).map((e) => e.post && (
          <div key={e.postId} className={s.entry}>
            <img src={e.post.media.thumb ?? e.post.media.main} alt="" />
            <span>{e.userId === me.data?.user.id ? 'You' : firstName(e.post.user.name)}</span>
          </div>
        ))}
      </div>
      <Sheet open={pick} onClose={() => setPick(false)} title="Your photos this week">
        <div className={s.pickGrid}>
          {mine.map((p) => (
            <button key={p.id} onClick={async () => { setPick(false); await api.post(`/groups/${groupId}/game/${game.id}/challenge`, { postId: p.id }); await refresh(groupId); sfx.sparkle(); }}>
              <img src={p.media.thumb ?? p.media.main} alt="" />
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

/* ───────────────────────── Guess whose (Wrapped Top Song Quiz) ───────────────────────── */

function GuessWhose({ game, groupId }: { game: GameView; groupId: string }) {
  const [open, setOpen] = useState<Post | null>(null);
  const guesses = game.myGuesses ?? {};
  return (
    <div className={s.guess}>
      <div className={s.guessGrid}>
        {(game.posts ?? []).map((p) => (
          <button key={p.id} className={s.guessTile} onClick={() => !game.closed && setOpen(p)}>
            <img src={p.media.thumb ?? p.media.main} alt="" />
            {guesses[p.id] && <span className={s.guessed}>{firstName(game.users.find((u) => u.id === guesses[p.id])?.name ?? '')}?</span>}
            {game.closed && <span className={s.guessed}>{firstName(p.user.name)}</span>}
          </button>
        ))}
      </div>
      <Sheet open={Boolean(open)} onClose={() => setOpen(null)} title="Who took this?">
        {open && <img src={open.media.main} alt="" className={s.guessBig} />}
        <div className={s.guessOptions}>
          {game.users.map((u) => (
            <LipButton key={u.id} tone="white" onClick={async () => { haptic('medium'); await api.post(`/groups/${groupId}/game/${game.id}/guess`, { postId: open!.id, userId: u.id }); await refresh(groupId); setOpen(null); }}>
              <Avatar user={u} size={26} /> {firstName(u.name)}
            </LipButton>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

/* ───────────────────────── Results ───────────────────────── */

function Results({ results, users }: { results: NonNullable<GameView['results']>; users: PublicUser[] }) {
  const map = new Map(users.map((u) => [u.id, u]));
  return (
    <div className={s.results}>
      <div className={s.resultsHead}>Awards</div>
      {results.map((r, i) => (
        <motion.div key={i} className={s.result} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
          <span className={s.resultEmoji}>{r.emoji}</span>
          <span className="grow">
            <span className={s.resultTitle}>{r.title}</span>
            <span className={s.resultLine}>{r.line}</span>
          </span>
          <span className={s.resultWho}>
            {r.winners.map((w) => (
              <Avatar key={w} user={map.get(w)} size={30} />
            ))}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
