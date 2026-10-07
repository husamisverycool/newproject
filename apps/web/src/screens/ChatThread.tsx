import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { queryClient, useGroup, useMe, useMessages } from '../lib/queries';
import { sendRealtime, onRealtime } from '../lib/realtime';
import { haptic, sfx } from '../lib/feedback';
import { clock, firstName } from '../lib/format';
import type { Message } from '../lib/types';
import { Icon } from '../components/Icon';
import { Avatar, IconButton, PillButton, Sheet, Chip } from '../components/ui';
import { Mascot } from '../components/Mascot';
import { PlanCard, PlanPoster, THEMES } from '../components/PlanCard';
import s from './chat.module.css';

/**
 * The group's photo chat (Yope: "built-in photo chats", "skip texting, and share visually"). Kept
 * separate from the wall — never mixing wall items into the chat list (spec §E, KakaoTalk rollback).
 * The mascot speaks as the game master; @mention it to talk to it. Plans are Partiful cards.
 */
export default function ChatThread() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const me = useMe();
  const g = useGroup(groupId);
  const m = useMessages(groupId);
  const [text, setText] = useState('');
  const [plus, setPlus] = useState(false);
  const [stickers, setStickers] = useState(false);
  const [planSheet, setPlanSheet] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const msgs = m.data?.messages ?? [];
  const mascot = m.data?.mascot;
  const myId = me.data?.user.id;

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  useEffect(
    () =>
      onRealtime((e) => {
        if (e.type === 'typing' && e.groupId === groupId) {
          setTyping(e.userId);
          setTimeout(() => setTyping(null), 2500);
        }
      }),
    [groupId],
  );

  const send = async (body: object) => {
    sfx.send();
    haptic('light');
    await api.post(`/groups/${groupId}/messages`, body);
    void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
  };

  const typingUser = typing ? g.data?.members.find((x) => x.user.id === typing)?.user : null;

  return (
    <div className="screen">
      <header className={s.header}>
        <IconButton icon="chevronLeft" label="Back" onClick={() => nav(-1)} />
        <button className={s.headCenter} onClick={() => nav(`/g/${groupId}/settings`)}>
          <span className={s.headEmoji}>{g.data?.group.emoji}</span>
          <span className={s.headName}>{g.data?.group.name}</span>
          <span className={s.headSub}>{g.data?.members.length} members</span>
        </button>
        <IconButton icon="game" label="This week's game" onClick={() => nav(`/g/${groupId}/game`)} />
      </header>

      <div ref={list} className={`${s.thread} scroll`}>
        {msgs.map((msg, i) => (
          <Bubble key={msg.id} msg={msg} prev={msgs[i - 1]} mine={msg.userId === myId} mascot={mascot} groupId={groupId} />
        ))}
        {typingUser && (
          <div className={s.typing}>
            <Avatar user={typingUser} size={22} /> <span className={s.dots}><i /><i /><i /></span>
          </div>
        )}
      </div>

      <div className={s.composer}>
        <button className={s.compBtn} onClick={() => setPlus(true)} aria-label="Add">
          <Icon name="plus" size={22} />
        </button>
        <div className={s.inputWrap}>
          <input
            className={s.input}
            placeholder="Message"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              sendRealtime({ type: 'typing', groupId });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                void send({ kind: 'text', body: text });
                setText('');
              }
            }}
          />
          <button className={s.inlineBtn} onClick={() => setStickers(true)} aria-label="Stickers">
            <Icon name="smile" size={22} />
          </button>
        </div>
        {text.trim() ? (
          <button className={s.sendBtn} onClick={() => { void send({ kind: 'text', body: text }); setText(''); }} aria-label="Send">
            <Icon name="send" size={20} strokeWidth={2.6} />
          </button>
        ) : (
          <VoiceNote groupId={groupId} />
        )}
      </div>
      <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const fd = new FormData();
        fd.set('kind', 'photo');
        fd.set('file', f);
        await api.post(`/groups/${groupId}/messages`, fd);
        void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
      }} />

      <Sheet open={plus} onClose={() => setPlus(false)}>
        <div className={s.plusGrid}>
          <button onClick={() => { setPlus(false); file.current?.click(); }}>
            <span style={{ background: 'var(--blue)' }}><Icon name="photo" /></span>Photo
          </button>
          <button onClick={() => { setPlus(false); setPlanSheet(true); }}>
            <span style={{ background: 'linear-gradient(135deg, var(--purple), var(--pink))' }}><Icon name="calendar" /></span>Plan
          </button>
          <button onClick={() => { setPlus(false); setStickers(true); }}>
            <span style={{ background: 'var(--yellow)', color: 'var(--black)' }}><Icon name="sticker" /></span>Sticker
          </button>
          <button onClick={() => nav(`/g/${groupId}/game`)}>
            <span style={{ background: 'var(--green)' }}><Icon name="game" /></span>Game
          </button>
          <button onClick={() => nav(`/g/${groupId}/memory`)}>
            <span style={{ background: 'var(--g3)' }}><Icon name="memory" /></span>Memory
          </button>
          <button onClick={() => nav('/create')}>
            <span style={{ background: 'var(--gemini)' }}><Icon name="sparkles" /></span>Create
          </button>
        </div>
      </Sheet>

      <Sheet open={stickers} onClose={() => setStickers(false)} title="Stickers">
        <div className={s.stickerGrid}>
          {(me.data?.stickers ?? []).map((st) => (
            <button key={st.id} onClick={() => { void send({ kind: 'sticker', stickerId: st.id }); setStickers(false); }}>
              <img src={st.media} alt="" />
            </button>
          ))}
          <button className={s.makeSticker} onClick={() => nav('/create/sticker')}>
            <Icon name="plus" size={22} /> Make one
          </button>
        </div>
      </Sheet>

      <NewPlanSheet open={planSheet} onClose={() => setPlanSheet(false)} groupId={groupId} />
    </div>
  );
}

function Bubble({ msg, prev, mine, mascot, groupId }: { msg: Message; prev?: Message; mine: boolean; mascot?: { species: string; stage: { level: number }; outfit: string[]; name: string }; groupId: string }) {
  const nav = useNavigate();
  const showDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
  const grouped = prev && prev.userId === msg.userId && prev.kind !== 'system' && msg.createdAt - prev.createdAt < 5 * 60_000;
  const day = showDay && <div className={s.day}>{new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>;

  if (msg.kind === 'system') {
    const developed = msg.meta.developed as string | undefined;
    return (
      <>
        {day}
        <div className={s.system}>
          {developed ? (
            <button className={s.developed} onClick={() => nav(`/g/${groupId}/week/${developed}`)}>
              <Icon name="film" size={16} /> {msg.body} · open the wall
            </button>
          ) : (
            msg.body
          )}
        </div>
      </>
    );
  }
  if (msg.kind === 'gm') {
    return (
      <>
        {day}
        <motion.div className={s.gm} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {mascot && <Mascot species={mascot.species} level={mascot.stage.level} outfit={mascot.outfit} size={44} idle={false} />}
          <div className={s.gmBubble}>
            <span className={s.gmName}>{mascot?.name ?? 'Game master'}</span>
            <span>{msg.body}</span>
            {typeof msg.meta.challenge === 'string' && <span className={s.gmChallenge}>📸 {msg.meta.challenge}</span>}
            {(msg.meta.gameKind || msg.meta.results) ? (
              <button className={s.gmCta} onClick={() => nav(`/g/${groupId}/game`)}>{msg.meta.results ? 'See the awards' : 'Play'}</button>
            ) : null}
          </div>
        </motion.div>
      </>
    );
  }
  if (msg.kind === 'plan' && msg.plan) {
    return (
      <>
        {day}
        <div className={`${s.row} ${mine ? s.mine : ''}`}>
          {!mine && <Avatar user={msg.user} size={28} />}
          <PlanCard plan={msg.plan} />
        </div>
      </>
    );
  }
  const blast = Boolean(msg.meta.blast);
  return (
    <>
      {day}
      <div className={`${s.row} ${mine ? s.mine : ''} ${grouped ? s.grouped : ''}`}>
        {!mine && (grouped ? <span style={{ width: 28 }} /> : <Avatar user={msg.user} size={28} />)}
        <div className={s.col}>
          {!mine && !grouped && <span className={s.author}>{msg.user ? firstName(msg.user.name) : ''}</span>}
          {msg.kind === 'sticker' && msg.media && <img src={msg.media} alt="Sticker" className={s.sticker} />}
          {msg.kind === 'photo' && msg.media && <img src={msg.media} alt="" className={s.photo} />}
          {msg.kind === 'voice' && msg.media && <VoicePlayer src={msg.media} duration={Number(msg.meta.duration ?? 0)} mine={mine} />}
          {msg.kind === 'post_reply' && (
            <button className={s.replyTo} onClick={() => msg.refId && nav(`/p/${msg.refId}`)}>
              <Icon name="photo" size={14} /> replied to a photo
            </button>
          )}
          {(msg.kind === 'text' || msg.kind === 'post_reply') && msg.body && (
            <span className={`${s.bubble} ${mine ? s.bubbleMine : ''} ${blast ? s.blast : ''}`}>
              {blast && <span className={s.blastTag}>📣 {String(msg.meta.planTitle ?? 'Blast')}</span>}
              {msg.body}
            </span>
          )}
          <span className={s.time}>{clock(msg.createdAt)}</span>
        </div>
      </div>
    </>
  );
}

function VoicePlayer({ src, duration, mine }: { src: string; duration: number; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const a = useRef<HTMLAudioElement | null>(null);
  const bars = useRef(Array.from({ length: 22 }, () => 0.25 + Math.random() * 0.75));
  return (
    <button
      className={`${s.voice} ${mine ? s.bubbleMine : ''}`}
      onClick={() => {
        a.current ??= new Audio(src);
        a.current.onended = () => setPlaying(false);
        if (a.current.paused) {
          void a.current.play();
          setPlaying(true);
        } else {
          a.current.pause();
          setPlaying(false);
        }
      }}
    >
      <Icon name={playing ? 'pause' : 'play'} size={16} />
      <span className={s.wave}>
        {bars.current.map((h, i) => (
          <i key={i} style={{ height: `${h * 100}%` }} />
        ))}
      </span>
      <span className={s.vdur}>{Math.max(1, Math.round(duration))}s</span>
    </button>
  );
}

/** Hold to record a voice message (Yope voice). */
function VoiceNote({ groupId }: { groupId: string }) {
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const t0 = useRef(0);
  const [on, setOn] = useState(false);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const dur = (Date.now() - t0.current) / 1000;
        if (dur < 0.6) return;
        const fd = new FormData();
        fd.set('kind', 'voice');
        fd.set('file', new Blob(chunks.current, { type: mr.mimeType }));
        fd.set('type', mr.mimeType);
        fd.set('duration', String(dur));
        await api.post(`/groups/${groupId}/messages`, fd);
        void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
      };
      t0.current = Date.now();
      mr.start();
      rec.current = mr;
      setOn(true);
      haptic('medium');
    } catch {
      /* no mic */
    }
  };
  const stop = () => {
    rec.current?.stop();
    rec.current = null;
    setOn(false);
  };
  return (
    <button className={`${s.sendBtn} ${on ? s.recOn : ''}`} style={{ background: on ? 'var(--red)' : 'var(--g2)' }} onPointerDown={start} onPointerUp={stop} onPointerLeave={() => on && stop()} aria-label="Hold to record a voice message">
      <Icon name="mic" size={20} />
    </button>
  );
}

/* ───────────────────────── New plan (Partiful create) ───────────────────────── */

function NewPlanSheet({ open, onClose, groupId }: { open: boolean; onClose: () => void; groupId: string }) {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('cloudflow');
  const [effect, setEffect] = useState('sunbeams');
  const [font, setFont] = useState('manrope');
  const [mode, setMode] = useState<'date' | 'poll'>('date');
  const [date, setDate] = useState('');
  const [opts, setOpts] = useState<string[]>(['', '']);
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const create = async () => {
    setBusy(true);
    const r = await api.post<{ id: string }>(`/groups/${groupId}/plans`, {
      title, theme, effect, titleFont: font, location,
      startsAt: mode === 'date' && date ? new Date(date).getTime() : null,
      options: mode === 'poll' ? opts.filter(Boolean).map((o) => new Date(o).getTime()) : [],
    });
    setBusy(false);
    onClose();
    nav(`/plan/${r.id}`);
  };
  return (
    <Sheet open={open} onClose={onClose} title="New plan" height="94%">
      <div className="stack gap12" style={{ paddingBottom: 16 }}>
        <PlanPoster plan={{ title: title || 'Untitled plan', theme, effect, titleFont: font, startsAt: mode === 'date' && date ? new Date(date).getTime() : null }} />
        <input className="field" placeholder="What's the plan?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="hstack gap8" style={{ flexWrap: 'wrap' }}>
          {Object.entries(THEMES).map(([k, t]) => (
            <Chip key={k} active={theme === k} onClick={() => setTheme(k)}>{t.name}</Chip>
          ))}
        </div>
        <div className="hstack gap8">
          {['none', 'sunbeams', 'fireworks'].map((e) => (
            <Chip key={e} active={effect === e} onClick={() => setEffect(e)}>{e === 'none' ? 'No effect' : e[0].toUpperCase() + e.slice(1)}</Chip>
          ))}
          {['manrope', 'display'].map((f) => (
            <Chip key={f} active={font === f} onClick={() => setFont(f)}>{f === 'manrope' ? 'Aa' : 'AA'}</Chip>
          ))}
        </div>
        <div className="segmented">
          <button aria-pressed={mode === 'date'} onClick={() => setMode('date')}>Set a Date</button>
          <button aria-pressed={mode === 'poll'} onClick={() => setMode('poll')}>Poll your guests</button>
        </div>
        {mode === 'date' ? (
          <input className="field" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        ) : (
          <>
            {opts.map((o, i) => (
              <input key={i} className="field" type="datetime-local" value={o} onChange={(e) => setOpts(opts.map((x, k) => (k === i ? e.target.value : x)))} />
            ))}
            {opts.length < 6 && <button className="chip" onClick={() => setOpts([...opts, ''])}>+ Add a time</button>}
          </>
        )}
        <input className="field" placeholder="Where?" value={location} onChange={(e) => setLocation(e.target.value)} />
        <PillButton disabled={!title.trim() || busy} onClick={create}>Post plan</PillButton>
      </div>
    </Sheet>
  );
}
