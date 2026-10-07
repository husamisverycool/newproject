import { useEffect, useMemo, useRef, useState } from 'react';
import { bereal, characterai, ios, locket, yope } from '@app/shared';
import { api } from '../lib/api';
import { haptic } from '../lib/feedback';
import type { GroupSummary } from '../lib/types';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { Wordmark } from '../components/Brand';
import s from './camera.module.css';

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

function useSend(shot: Shot, ritualOpen: boolean) {
  const [sending, setSending] = useState(false);
  const old = shot.fromRoll && Date.now() - shot.takenAt > 14 * 86_400_000;
  const send = async (opts: { targets: string[]; caption: string; voice: Voice | null; remember: boolean; bts: boolean }) => {
    if (!opts.targets.length || sending) return false;
    setSending(true);
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

/** Recipient row (Locket [B-med]): "All" first and selected by default — "a snap goes to the entire friends list by default" [V] — then each group, shown by its mascot. */
function Recipients({ groups, targets, setTargets }: { groups: GroupSummary[]; targets: string[]; setTargets: (t: string[]) => void }) {
  const all = targets.length === groups.length;
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
    </div>
  );
}

/**
 * Locket's capture review [B-med]: the photo stays in the rounded square with an "Add a message"
 * caption pill at the bottom; caption types (Text, Time, Stickers [V-weak]) plus Yope's voice [V] and
 * Character.ai's Pin [V-weak]; X on the left, the send button in the centre, save on the right; the
 * recipient row below.
 */
export function LocketReview({ shot, groups, activeGroup, ritualOpen, onCancel, onSent }: { shot: Shot; groups: GroupSummary[]; activeGroup: GroupSummary | null; ritualOpen: boolean; onCancel: () => void; onSent: () => void }) {
  const [caption, setCaption] = useState('');
  const [time, setTime] = useState(false);
  const [targets, setTargets] = useState<string[]>(groups.map((g) => g.id));
  const [remember, setRemember] = useState(false);
  const [voice, setVoice] = useState<Voice | null>(null);
  const { send, sending, old } = useSend(shot, ritualOpen);
  void activeGroup;
  const timeText = new Date(shot.takenAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <>
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
          <VoiceButton value={voice} onChange={setVoice} />
          <button className={remember ? s.typeOn : ''} onClick={() => setRemember(!remember)} disabled={!caption}>
            <Icon name="pin" size={14} /> {characterai.pin}
          </button>
        </div>
        <div className={s.reviewControls}>
          <button className={s.side} onClick={onCancel} aria-label={ios.cancel}>
            <Icon name="close" size={30} strokeWidth={2.4} />
          </button>
          <button className={s.sendBtn} disabled={sending || !targets.length} aria-label={locket.sendToFriends} onClick={async () => {
            if (await send({ targets, caption: time ? timeText : caption, voice, remember, bts: true })) onSent();
          }}>
            <Icon name="paperplane" size={34} strokeWidth={2.2} />
          </button>
          <a className={s.side} href={shot.mainUrl} download="photo.jpg" aria-label={ios.save}>
            <Icon name="download" size={30} strokeWidth={2.2} />
          </a>
        </div>
        <Recipients groups={groups} targets={targets} setTargets={setTargets} />
      </div>
    </>
  );
}

/**
 * BeReal's post preview for a dual shot [V]: main photo full width with the selfie inset at the top
 * left, "BTS On"/"BTS Off" at the top right, an X to retake, "Add a caption..." and the all-caps
 * "SEND". Late labels are dropped (spec §E).
 */
export function BeRealPreview({ shot, groups, activeGroup, ritualOpen, onCancel, onSent }: { shot: Shot; groups: GroupSummary[]; activeGroup: GroupSummary | null; ritualOpen: boolean; onCancel: () => void; onSent: () => void }) {
  const [bts, setBts] = useState(true);
  const [caption, setCaption] = useState('');
  const [swap, setSwap] = useState(false);
  const { send, sending } = useSend(shot, ritualOpen);
  const targets = activeGroup ? [activeGroup.id] : groups.slice(0, 1).map((g) => g.id);
  const main = swap ? shot.insetUrl! : shot.mainUrl;
  const inset = swap ? shot.mainUrl : shot.insetUrl!;
  return (
    <div className={s.bereal}>
      <div className={s.berealTop}>
        <button className={s.berealX} onClick={onCancel} aria-label={ios.cancel}>
          <Icon name="close" size={24} strokeWidth={2.6} />
        </button>
        <Wordmark size={24} color="#fff" />
        <button className={`${s.bts} ${bts ? s.btsOn : ''}`} onClick={() => { haptic('light'); setBts(!bts); }}>
          {bts ? bereal.btsOn : bereal.btsOff}
        </button>
      </div>
      <div className={s.berealPhoto}>
        <img src={main} alt="" />
        <button className={s.berealInset} onClick={() => setSwap(!swap)} style={{ backgroundImage: `url(${inset})` }} aria-label={ios.select} />
      </div>
      <input className={s.berealCaption} placeholder={bereal.addACaption} value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 100))} />
      <button className={s.berealSend} disabled={sending} onClick={async () => {
        if (await send({ targets, caption, voice: null, remember: false, bts })) onSent();
      }}>
        {bereal.send}
        <Icon name="paperplane" size={22} strokeWidth={2.4} />
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
