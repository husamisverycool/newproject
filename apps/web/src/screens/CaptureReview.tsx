import { useEffect, useMemo, useRef, useState } from 'react';
import { bereal, characterai, ios, locket, yope } from '@app/shared';
import { api, downloadBlob } from '../lib/api';
import { haptic } from '../lib/feedback';
import type { GroupSummary, PublicUser } from '../lib/types';
import { Avatar } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { Wordmark } from '../components/Brand';
import { Spinner } from '../components/ios';
import s from './camera.module.css';
import { allows } from '../lib/device';
import { LIVE } from '../lib/static';

export interface Shot {
  main: Blob;
  mainUrl: string;
  inset: Blob | null;
  insetUrl: string | null;
  live: Blob[];
  fromRoll: boolean;
  takenAt: number;
}

type Voice = { blob: Blob; duration: number; url: string };

/** The Best Friend widget's person (spec §C bestie lane): a photo can go to "just that person" [V]. */
export interface BestieTarget {
  user: PublicUser;
  groupId: string;
}
const BESTIE = 'bestie:';

function useSend(shot: Shot, ritualOpen: boolean) {
  const [sending, setSending] = useState(false);
  const old = shot.fromRoll && Date.now() - shot.takenAt > 14 * 86_400_000;
  const send = async (opts: { targets: string[]; caption: string; voice: Voice | null; remember: boolean; bts: boolean }) => {
    if (!opts.targets.length || sending) return false;
    setSending(true);
    // Locket: "you can send images to just that person" [V] — the lane, never the group's wall.
    const one = opts.targets[0].startsWith(BESTIE) ? opts.targets[0].slice(BESTIE.length).split('|') : null;
    if (one) {
      const fd = new FormData();
      fd.set('main', shot.main, 'photo.jpg');
      fd.set('groupId', one[1]);
      fd.set('caption', opts.caption);
      try {
        await api.post(`/bestie/${one[0]}/photos`, fd);
        haptic('success');
        return true;
      } catch {
        setSending(false);
        return false;
      }
    }
    const fd = new FormData();
    fd.set('groupIds', opts.targets.join(','));
    fd.set('main', shot.main, 'photo.jpg');
    if (shot.inset) fd.set('inset', shot.inset, 'inset.jpg');
    if (opts.bts) shot.live.slice(-16).forEach((b, i) => fd.append('live', b, `live${i}.jpg`));
    if (opts.voice) {
      fd.set('voice', opts.voice.blob, 'voice');
      fd.set('voiceType', opts.voice.blob.type);
      fd.set('voiceDuration', String(opts.voice.duration));
    }
    fd.set('caption', opts.caption);
    fd.set('kind', shot.inset ? 'dual' : old ? 'rewind' : 'photo');
    fd.set('ritual', String(ritualOpen && !shot.fromRoll));
    fd.set('fromRoll', String(shot.fromRoll));
    fd.set('takenAt', String(shot.takenAt));
    fd.set('remember', String(opts.remember && Boolean(opts.caption)));
    try {
      await api.post('/posts', fd);
      haptic('success');
      return true;
    } catch {
      setSending(false);
      return false;
    }
  };
  return { send, sending, old };
}

/**
 * Recipient row (Locket [B-med]): "All" first and selected by default — "a snap goes to the entire friends
 * list by default" [V] — then each group, shown by its mascot, then the Best Friend widget's person by
 * their face (Locket: "send images to just that person" [V]).
 */
function Recipients({ groups, targets, setTargets, bestie }: { groups: GroupSummary[]; targets: string[]; setTargets: (t: string[]) => void; bestie?: BestieTarget | null }) {
  const all = targets.length === groups.length && !targets[0]?.startsWith(BESTIE);
  const bestieKey = bestie ? `${BESTIE}${bestie.user.id}|${bestie.groupId}` : null;
  return (
    <div className={s.recipients}>
      <button className={s.recipient} onClick={() => { haptic('light'); setTargets(groups.map((g) => g.id)); }}>
        <span className={`${s.recipientAvatar} ${all ? s.recipientOn : ''}`}>
          <Icon name="people" size={24} />
        </span>
        <span>{locket.all}</span>
      </button>
      {groups.map((g) => {
        const on = targets.includes(g.id) && !all;
        return (
          <button key={g.id} className={s.recipient} onClick={() => { haptic('light'); setTargets([g.id]); }}>
            <span className={`${s.recipientAvatar} ${on ? s.recipientOn : ''}`}>
              <Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={44} />
            </span>
            <span>{g.name}</span>
          </button>
        );
      })}
      {bestie && bestieKey && (
        <button className={s.recipient} onClick={() => { haptic('light'); setTargets([bestieKey]); }}>
          <span className={`${s.recipientAvatar} ${targets[0] === bestieKey ? s.recipientOn : ''}`}>
            <Avatar user={bestie.user} size={44} />
          </span>
          <span>{bestie.user.name.split(' ')[0]}</span>
        </button>
      )}
    </div>
  );
}

/**
 * Locket's capture review. From the INSPO frames locket-review-* [I]: "Send to" / the recipient's
 * name centred at the top; ✕ on the left, the send button in the centre (a paper plane in a gray
 * circle that turns into a spinner, then a ✓), the download glyph on the right. The "Add a message"
 * caption pill on the photo [B-med]; caption types (Text, Time [V-weak]) plus Yope's voice [V] and
 * Character.ai's Pin [V-weak]; the recipient row below [B-med].
 */
export function LocketReview({ shot, groups, activeGroup, ritualOpen, onCancel, onSent, bestie }: { shot: Shot; groups: GroupSummary[]; activeGroup: GroupSummary | null; ritualOpen: boolean; onCancel: () => void; onSent: () => void; bestie?: BestieTarget | null }) {
  const [caption, setCaption] = useState('');
  const [time, setTime] = useState(false);
  const [targets, setTargets] = useState<string[]>(groups.map((g) => g.id));
  const [remember, setRemember] = useState(false);
  const [voice, setVoice] = useState<Voice | null>(null);
  const { send, sending, old } = useSend(shot, ritualOpen);
  const [sent, setSent] = useState(false);
  void activeGroup;
  const all = targets.length === groups.length && groups.length > 1;
  const toBestie = Boolean(bestie && targets[0]?.startsWith(BESTIE));
  const sendToName = toBestie && bestie ? bestie.user.name.split(' ')[0] : all ? locket.all : groups.filter((g) => targets.includes(g.id)).map((g) => g.name).join(', ');
  const timeText = new Date(shot.takenAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <>
      <div className={s.sendTo}>
        <span>{locket.sendTo}</span>
        <strong>{sendToName}</strong>
      </div>
      {old && <span className={s.when}>{ios.longDate(shot.takenAt)}</span>}
      {time ? (
        <button className={s.captionPill} onClick={() => setTime(false)}>
          <Icon name="timer" size={16} /> {timeText}
        </button>
      ) : (
        <input className={s.captionInput} placeholder={locket.addAMessage} value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 50))} />
      )}
      <div className={s.reviewDock}>
        <div className={s.captionTypes}>
          <button className={!time ? s.typeOn : ''} onClick={() => setTime(false)}>{locket.captionText}</button>
          <button className={time ? s.typeOn : ''} onClick={() => setTime(true)}>{locket.captionTime}</button>
          {allows('microphone') && <VoiceButton value={voice} onChange={setVoice} />}
          <button className={remember ? s.typeOn : ''} onClick={() => setRemember(!remember)} disabled={!caption}>
            <Icon name="pin" size={14} /> {characterai.pin}
          </button>
        </div>
        <div className={s.reviewControls}>
          <button className={s.side} onClick={onCancel} aria-label={ios.cancel}>
            <Icon name="close" size={30} strokeWidth={2.4} />
          </button>
          <button className={s.sendBtn} disabled={sending || !targets.length} aria-label={locket.sendToFriends} onClick={async () => {
            if (await send({ targets, caption: time ? timeText : caption, voice, remember, bts: true })) {
              setSent(true);
              window.setTimeout(onSent, 700);
            }
          }}>
            {sent ? <Icon name="check" size={30} strokeWidth={2.6} /> : sending ? <Spinner size={26} /> : <Icon name="paperplane" size={28} strokeWidth={2.2} />}
          </button>
          <a className={s.side} href={shot.mainUrl} download="photo.jpg" aria-label={ios.save} onClick={(e) => {
            if (!LIVE) return;
            e.preventDefault();
            void downloadBlob(shot.main, 'photo.jpg');
          }}>
            <Icon name="download" size={30} strokeWidth={2.2} />
          </a>
        </div>
        <Recipients groups={groups} targets={targets} setTargets={setTargets} bestie={bestie} />
      </div>
    </>
  );
}

/**
 * BeReal's post preview for a dual shot, laid out from research/inspo/store/bereal-02-dualcam-preview
 * [I]: ⌄ at the top left and "BeReal." centred; the caption sits above the photo, left-aligned; the
 * 3:4 photo with the selfie inset at its top left and a small ✕ (retake) at its top right; a row of
 * translucent chips inside the photo's bottom edge — audience "🔒 My Friends" (here: the group) and
 * the BTS toggle ("BTS On"/"BTS Off" [V]); then "SEND ➤" in heavy capitals. Late labels are dropped
 * (spec §E).
 */
export function BeRealPreview({ shot, groups, activeGroup, ritualOpen, onCancel, onSent }: { shot: Shot; groups: GroupSummary[]; activeGroup: GroupSummary | null; ritualOpen: boolean; onCancel: () => void; onSent: () => void }) {
  const [bts, setBts] = useState(true);
  const [caption, setCaption] = useState('');
  const [swap, setSwap] = useState(false);
  const [target, setTarget] = useState(activeGroup?.id ?? groups[0]?.id ?? '');
  const { send, sending } = useSend(shot, ritualOpen);
  const main = swap ? shot.insetUrl! : shot.mainUrl;
  const inset = swap ? shot.mainUrl : shot.insetUrl!;
  const targetName = groups.find((g) => g.id === target)?.name ?? bereal.myFriends;
  const nextTarget = () => {
    if (groups.length < 2) return;
    haptic('light');
    const i = groups.findIndex((g) => g.id === target);
    setTarget(groups[(i + 1) % groups.length].id);
  };
  return (
    <div className={s.bereal}>
      <div className={s.berealTop}>
        <button className={s.berealX} onClick={onCancel} aria-label={ios.cancel}>
          <Icon name="chevronDown" size={24} strokeWidth={2.6} />
        </button>
        <Wordmark size={22} color="#fff" />
        <span />
      </div>
      <input className={s.berealCaption} placeholder={bereal.addACaption} value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 100))} />
      <div className={s.berealPhoto}>
        <img src={main} alt="" />
        <button className={s.berealInset} onClick={() => setSwap(!swap)} style={{ backgroundImage: `url(${inset})` }} aria-label={ios.select} />
        <button className={s.berealRetake} onClick={onCancel} aria-label={ios.cancel}>
          <Icon name="close" size={16} strokeWidth={2.6} />
        </button>
        <div className={s.berealChips}>
          <button onClick={nextTarget}>
            <Icon name="lock" size={13} strokeWidth={2.4} />
            {targetName}
          </button>
          <button onClick={() => { haptic('light'); setBts(!bts); }} aria-pressed={bts}>
            <Icon name="live" size={14} strokeWidth={2.2} />
            {bts ? bereal.btsOn : bereal.btsOff}
          </button>
        </div>
      </div>
      <button className={s.berealSend} disabled={sending || !target} onClick={async () => {
        if (await send({ targets: [target], caption, voice: null, remember: false, bts })) onSent();
      }}>
        {sending ? <Spinner size={26} /> : <>{bereal.send}<Icon name="play" size={24} filled /></>}
      </button>
    </div>
  );
}

/** Yope voice: "add voice to your memories" [V]. Hold to record. */
function VoiceButton({ value, onChange }: { value: Voice | null; onChange: (v: Voice | null) => void }) {
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) return;
    const i = setInterval(() => setT((Date.now() - started.current) / 1000), 100);
    return () => clearInterval(i);
  }, [on]);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunks.current, { type: mr.mimeType });
        const duration = (Date.now() - started.current) / 1000;
        if (duration > 0.5) onChange({ blob, duration, url: URL.createObjectURL(blob) });
      };
      started.current = Date.now();
      mr.start();
      rec.current = mr;
      setOn(true);
      haptic('medium');
    } catch {
      /* mic unavailable */
    }
  };
  const stop = () => {
    rec.current?.stop();
    rec.current = null;
    setOn(false);
  };
  const audio = useMemo(() => (value ? new Audio(value.url) : null), [value]);
  if (value)
    return (
      <button className={s.typeOn} onClick={() => (audio?.paused ? void audio.play() : onChange(null))}>
        <Icon name="volume" size={14} /> {Math.round(value.duration)}s
      </button>
    );
  return (
    <button className={on ? s.typeRec : ''} onPointerDown={start} onPointerUp={stop} onPointerLeave={() => on && stop()} aria-label={yope.voiceLine}>
      <Icon name="mic" size={14} /> {on ? `${t.toFixed(1)}s` : null}
    </button>
  );
}
