import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { bereal, duolingo, imessage, ios, jackbox, locket, whatsapp, yope } from '@app/shared';
import { api } from '../lib/api';
import { queryClient, useActiveGroup, useGroup, useMe, useMessages } from '../lib/queries';
import { sendRealtime, onRealtime } from '../lib/realtime';
import { haptic, sfx } from '../lib/feedback';
import { firstName } from '../lib/format';
import type { Message } from '../lib/types';
import { Icon } from '../components/Icon';
import { Alert, Avatar, Menu, Sheet } from '../components/ios';
import { Mascot } from '../components/Mascot';
import { PlanCard } from '../components/PlanCard';
import s from './chat.module.css';
import { allows } from '../lib/device';

/**
 * The group chat, laid out from the INSPO images [I]:
 * - Yope group chat (yope-04, yope-05): ‹ in a dark circle; a capsule with the group's face, its name,
 *   the streak "🔥N" and ›; a film-strip circle at the right. Dark gray bubbles on both sides, the
 *   sender's avatar beside their last bubble, cut-out stickers with no bubble, photos with the time
 *   large over them, voice as ▶ + waveform + "00:38". Composer: lime camera circle, "start typing...",
 *   sticker circle, mic.
 * - Locket chat (locket-04): "Today at 9:40 PM" stamps; a reply shows the photo it answers with a
 *   chip (avatar · name · "1hr") and its caption pill, then the reply.
 * The mascot speaks as the game master in Duolingo's speech bubble [V] (research/14). The chat never
 * mixes in wall items (spec §E).
 */
export default function ChatThread() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const me = useMe();
  const { groups } = useActiveGroup();
  const g = groups.find((x) => x.id === groupId);
  const m = useMessages(groupId);
  const [text, setText] = useState('');
  const [stickers, setStickers] = useState(false);
  const [view, setView] = useState<'chat' | 'now'>('chat');
  const detail = useGroup(groupId);
  const [typing, setTyping] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLInputElement>(null);
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

  const send = async (body: object | FormData) => {
    sfx.send();
    haptic('light');
    await api.post(`/groups/${groupId}/messages`, body);
    void queryClient.invalidateQueries({ queryKey: ['messages', groupId] });
  };
  const sendText = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    void send({ kind: 'text', body: t });
  };

  const typingUser = typing ? g?.members.find((u) => u.id === typing) : null;

  return (
    <div className={s.root}>
      {/* Yope header [I] */}
      <header className={s.header}>
        <button className={s.circle} onClick={() => nav(-1)} aria-label={ios.back}>
          <Icon name="chevronLeft" size={22} strokeWidth={2.6} />
        </button>
        <button className={s.capsule} onClick={() => nav(`/g/${groupId}/settings`)}>
          {g && (
            <span className={s.capsuleFace}>
              <Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={30} />
            </span>
          )}
          <span className={s.capsuleName}>{g?.name}</span>
          {g && g.ritual.streak > 0 && (
            <span className={s.streak} aria-label={yope.streakCount(g.ritual.streak)}>
              <Icon name="flame" size={13} filled />
              {g.ritual.streak}
            </span>
          )}
          <Icon name="chevronRight" size={16} strokeWidth={2.6} />
        </button>
        <button className={`${s.circle} ${view === 'now' ? s.circleOn : ''}`} onClick={() => { haptic('light'); setView(view === 'chat' ? 'now' : 'chat'); }} aria-label={yope.splitView}>
          <Icon name="film" size={20} />
        </button>
      </header>
      {view === 'now' && (
        <>
          {/* Yope's split view [V] "see what your friends are up to right now", laid out from yope-05 [I] */}
          <div className={s.pageDots}>
            {groups.map((x) => (
              <i key={x.id} className={x.id === groupId ? s.dotOn : ''} />
            ))}
          </div>
          <div className={s.now}>
            {(detail.data?.live ?? []).map((p) => (
              <button key={p.id} className={s.nowCard} onClick={() => nav(`/p/${p.id}`)}>
                <img src={p.media.main} alt="" className={p.blurred ? s.blurred : ''} />
                <strong>{yope.time(p.createdAt)}</strong>
                {p.caption && !p.blurred && <em>{p.caption}</em>}
                <span className={s.nowWho}>
                  <Avatar user={p.user} size={30} />
                  {firstName(p.user.name)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <div ref={list} className={s.thread} hidden={view === 'now'}>
        {msgs.map((msg, i) => (
          <Bubble key={msg.id} msg={msg} prev={msgs[i - 1]} next={msgs[i + 1]} mine={msg.userId === myId} mascot={mascot} groupId={groupId} />
        ))}
        {typingUser && (
          <div className={s.row}>
            <Avatar user={typingUser} size={28} />
            <span className={s.typing}>
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>

      {/* Yope composer [I] */}
      <div className={s.composer}>
        <button className={s.cameraBtn} onClick={() => camera.current?.click()} aria-label={ios.axShutter}>
          <Icon name="camera" size={22} filled color="#000" />
        </button>
        <input
          className={s.input}
          placeholder={yope.startTyping}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendRealtime({ type: 'typing', groupId });
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendText()}
        />
        {text.trim() ? (
          <button className={s.sendBtn} onClick={sendText} aria-label={ios.share}>
            <Icon name="arrowUp" size={20} strokeWidth={2.8} />
          </button>
        ) : (
          <>
            <button className={s.roundBtn} onClick={() => setStickers(true)} aria-label={imessage.stickers}>
              <Icon name="peel" size={22} filled />
            </button>
            {allows('microphone') && <VoiceNote groupId={groupId} />}
          </>
        )}
      </div>
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          const fd = new FormData();
          fd.set('kind', 'photo');
          fd.set('file', f);
          await send(fd);
        }}
      />

      <Sheet open={stickers} onClose={() => setStickers(false)} title={imessage.stickers} dark>
        <div className={s.stickerGrid}>
          {(me.data?.stickers ?? []).map((st) => (
            <button key={st.id} onClick={() => { void send({ kind: 'sticker', stickerId: st.id }); setStickers(false); }}>
              <img src={st.media} alt="" />
            </button>
          ))}
          <button className={s.makeSticker} onClick={() => nav('/create/sticker')}>
            <Icon name="plus" size={22} />
            <span>{whatsapp.createSticker}</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

type MascotInfo = { species: string; stage: { level: number }; outfit: string[]; name: string };

/** A Locket stamp row shows when an hour has passed since the previous message [I]/[B-low]. */
function Bubble({ msg, prev, next, mine, mascot, groupId }: { msg: Message; prev?: Message; next?: Message; mine: boolean; mascot?: MascotInfo; groupId: string }) {
  const nav = useNavigate();
  // Touch and hold a message for its menu [HIG Messages]: Copy, and BeReal's "Report" on others' messages [V] (spec §S report on every surface).
  const [menu, setMenu] = useState(false);
  const [reported, setReported] = useState(false);
  const hold = useRef<number | null>(null);
  const press = {
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); setMenu(true); },
    onPointerDown: () => { hold.current = window.setTimeout(() => { haptic('medium'); setMenu(true); }, 450); },
    onPointerUp: () => hold.current && clearTimeout(hold.current),
    onPointerLeave: () => hold.current && clearTimeout(hold.current),
  };
  const actions = [
    ...(msg.body ? [{ label: ios.copy, icon: 'link', onClick: () => void navigator.clipboard?.writeText(msg.body ?? '').catch(() => undefined) }] : []),
    ...(!mine ? [{ label: bereal.report, icon: 'flag', destructive: true, onClick: async () => { await api.post('/report', { kind: 'message', id: msg.id, reason: '' }); setReported(true); } }] : []),
  ];
  const stamp = (!prev || msg.createdAt - prev.createdAt > 60 * 60_000) && <div className={s.stamp}>{locket.stamp(msg.createdAt)}</div>;
  const lastOfRun = !next || next.userId !== msg.userId || next.kind === 'system' || next.kind === 'gm' || next.createdAt - msg.createdAt > 60 * 60_000;

  if (msg.kind === 'system') {
    const developed = msg.meta.developed as string | undefined;
    return (
      <>
        {stamp}
        <button className={s.system} onClick={() => developed && nav(`/g/${groupId}/week/${developed}`)} disabled={!developed}>
          {msg.body}
        </button>
      </>
    );
  }

  if (msg.kind === 'gm') {
    const cta = msg.meta.results ? duolingo.continue : msg.meta.gameKind ? jackbox.play : null;
    return (
      <>
        {stamp}
        <motion.div className={s.gm} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {mascot && <Mascot species={mascot.species as never} level={mascot.stage.level} outfit={mascot.outfit} size={56} />}
          <div className={s.gmBubble}>
            <span>{msg.body}</span>
            {typeof msg.meta.challenge === 'string' && <span className={s.gmChallenge}>{msg.meta.challenge}</span>}
            {cta && (
              <button className={s.gmCta} onClick={() => nav(`/g/${groupId}/game`)}>
                {cta}
              </button>
            )}
          </div>
        </motion.div>
      </>
    );
  }

  if (msg.kind === 'plan' && msg.plan) {
    return (
      <>
        {stamp}
        <div className={`${s.row} ${mine ? s.mine : ''}`}>
          {!mine && <Avatar user={msg.user} size={28} />}
          <PlanCard plan={msg.plan} />
        </div>
      </>
    );
  }

  const face = !mine && (lastOfRun ? <Avatar user={msg.user} size={28} /> : <span className={s.faceGap} />);

  return (
    <>
      {stamp}
      {msg.kind === 'post_reply' && msg.post && <PostReply post={msg.post} mine={mine} />}
      <div className={`${s.row} ${mine ? s.mine : ''} ${lastOfRun ? '' : s.tight}`} {...(actions.length ? press : null)}>
        {face}
        {msg.kind === 'sticker' && msg.media && <img src={msg.media} alt="" className={s.sticker} />}
        {msg.kind === 'photo' && msg.media && (
          <span className={s.photo}>
            <img src={msg.media} alt="" />
            <strong>{yope.time(msg.createdAt)}</strong>
            {msg.body && <em>{msg.body}</em>}
          </span>
        )}
        {msg.kind === 'voice' && msg.media && <VoicePlayer src={msg.media} duration={Number(msg.meta.duration ?? 0)} />}
        {(msg.kind === 'text' || msg.kind === 'post_reply') && msg.body && <span className={s.bubble}>{msg.body}</span>}
      </div>
      <Menu open={menu} onClose={() => setMenu(false)} actions={actions} />
      <Alert open={reported} title={bereal.report} message={bereal.reportsAnonymous} onDismiss={() => setReported(false)} actions={[{ label: ios.ok, preferred: true, onClick: () => setReported(false) }]} />
    </>
  );
}

/** Locket chat [I] (locket-04): the answered photo, chip "avatar · Bobby · 1hr" top-left, caption pill at the bottom. */
function PostReply({ post, mine }: { post: NonNullable<Message['post']>; mine: boolean }) {
  const nav = useNavigate();
  return (
    <button className={`${s.replyPhoto} ${mine ? s.replyMine : ''}`} onClick={() => nav(`/p/${post.id}`)}>
      <img src={post.media.thumb ?? post.media.main} alt="" className={post.blurred ? s.blurred : ''} />
      <span className={s.replyChip}>
        <Avatar user={post.user} size={20} />
        <b>{firstName(post.user.name)}</b>
        <i>{locket.ago(Date.now() - post.createdAt)}</i>
      </span>
      {post.caption && !post.blurred && <span className={s.replyCaption}>{post.caption}</span>}
      {post.blurred && <span className={s.replyCaption}>{bereal.shareToView}</span>}
    </button>
  );
}

/** Yope voice message [I] (yope-04): ▶ in a circle, the waveform, "00:38". */
function VoicePlayer({ src, duration }: { src: string; duration: number }) {
  const [playing, setPlaying] = useState(false);
  const a = useRef<HTMLAudioElement | null>(null);
  const bars = useMemo(() => Array.from({ length: 26 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + src.length))), [src]);
  return (
    <button
      className={s.voice}
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
      <span className={s.voicePlay}>
        <Icon name={playing ? 'pause' : 'play'} size={14} filled />
      </span>
      <span className={s.wave}>
        {bars.map((h, i) => (
          <i key={i} style={{ height: `${h * 100}%` }} />
        ))}
      </span>
      <span className={s.vdur}>{yope.voiceTime(Math.max(1, duration))}</span>
    </button>
  );
}

/** Hold the mic to record (Yope: "send voice messages in chat" [V]). */
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
    <button className={`${s.roundBtn} ${on ? s.recOn : ''}`} onPointerDown={start} onPointerUp={stop} onPointerLeave={() => on && stop()} aria-label={yope.voiceLine}>
      <Icon name="mic" size={20} />
    </button>
  );
}
