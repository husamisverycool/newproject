import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { bereal, characterai, gphotos, imessage, ios, jackbox, locket, whatsapp } from '@app/shared';
import { api } from '../lib/api';
import { haptic } from '../lib/feedback';
import { firstName } from '../lib/format';
import { queryClient, useMe } from '../lib/queries';
import { useUi } from '../lib/store';
import type { Post } from '../lib/types';
import { Icon } from './Icon';
import { Alert, Avatar, Menu, Section, Row, Sheet } from './ios';
import { EmojiRain } from './EmojiRain';
import s from '../screens/camera.module.css';

/**
 * One page of Locket's History, laid out from research/inspo/store/locket-07-history [I]: the photo
 * in the camera's rounded square with its caption centred near the bottom; avatar + first name +
 * short time ("36m") under it; the "Send message..." capsule holding 🔥 💖 and the smiley-plus glyph;
 * bottom bar = grid (2×2) · small shutter · share glyph. On your own photo an "Activity" row instead
 * [B-low]. Reactions rain down (frame locket-emoji-rain [I]); Locket "doesn't count or track
 * reactions" [V]. From BeReal: blurred until you post with "Share to view" (bereal-05 [I]), hold to
 * play BTS [V], tap the inset to swap [B-med], RealMoji + ⚡ Instant RealMoji [V], report / block [V].
 * Any-emoji reactions: Tapbacks [V]. The share glyph opens the iOS action menu [HIG].
 */
export function HistoryPost({ post, onCamera, onGrid }: { post: Post; onCamera: () => void; onGrid: () => void }) {
  const nav = useNavigate();
  const me = useMe();
  const rain = useUi((st) => st.rain);
  const [localRain, setLocalRain] = useState<{ emoji: string; key: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [swap, setSwap] = useState(false);
  const [activity, setActivity] = useState(false);
  const [more, setMore] = useState(false);
  const [picker, setPicker] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message?: string } | null>(null);
  const [msg, setMsg] = useState('');
  const pressTimer = useRef<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (rain && rain.postId === post.id) setLocalRain({ emoji: rain.emoji, key: rain.key });
  }, [rain, post.id]);

  const react = async (emoji: string | null, stickerId?: string) => {
    haptic('light');
    if (emoji) setLocalRain({ emoji, key: Date.now() });
    await api.post(`/posts/${post.id}/react`, { emoji, stickerId });
  };
  const sendMessage = async () => {
    const text = msg.trim();
    if (!text) return;
    setMsg('');
    haptic('light');
    await api.post(`/groups/${post.groupId}/messages`, { kind: 'post_reply', body: text, refId: post.id });
    void queryClient.invalidateQueries({ queryKey: ['messages', post.groupId] });
  };
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['feed', post.groupId] });

  const main = swap && post.media.inset ? post.media.inset : post.media.main;
  const inset = swap ? post.media.main : post.media.inset;
  const old = post.kind === 'rewind' || post.createdAt - post.takenAt > 14 * 86_400_000;

  return (
    <div className={s.historyPage}>
      <div className={s.topSpace} />
      <div
        className={s.viewfinder}
        onPointerDown={() => {
          if (!post.media.live || post.blurred) return;
          pressTimer.current = window.setTimeout(() => {
            setPlaying(true);
            haptic('medium');
          }, 260);
        }}
        onPointerUp={() => {
          if (pressTimer.current) clearTimeout(pressTimer.current);
          setPlaying(false);
        }}
        onPointerLeave={() => setPlaying(false)}
        onClick={() => post.blurred && onCamera()}
      >
        <img src={playing && post.media.live ? post.media.live : main} className={`${s.media} ${post.blurred ? s.blurred : ''}`} alt="" draggable={false} />
        {inset && !post.blurred && <button className={s.inset} onClick={(e) => { e.stopPropagation(); setSwap(!swap); }} style={{ backgroundImage: `url(${inset})` }} aria-label={ios.select} />}
        {old && !post.blurred && <span className={s.when}>{ios.longDate(post.takenAt)}</span>}
        {post.caption && !post.blurred && <div className={s.captionPill}>{post.caption}</div>}
        {post.media.voice && !post.blurred && (
          <button
            className={s.voice}
            onClick={(e) => {
              e.stopPropagation();
              audio.current ??= new Audio(post.media.voice);
              if (audio.current.paused) void audio.current.play();
              else audio.current.pause();
            }}
            aria-label={ios.more}
          >
            <Icon name="volume" size={16} /> {Math.round(post.media.voiceDuration ?? 0)}s
          </button>
        )}
        {post.blurred && (
          <div className={s.postToView}>
            <Icon name="eyeOff" size={30} strokeWidth={2.2} />
            <strong>{bereal.shareToView}</strong>
            <span>{bereal.shareToViewBody}</span>
            <button className={s.postAPhoto} onClick={(e) => { e.stopPropagation(); onCamera(); }}>{bereal.postAPhoto}</button>
          </div>
        )}
        {localRain && <EmojiRain key={localRain.key} emoji={localRain.emoji} />}
      </div>

      <div className={s.byline}>
        <Avatar user={post.user} size={24} />
        <span className={s.bylineName}>{firstName(post.user.name)}</span>
        <span className={s.bylineTime}>{locket.ago(Date.now() - post.createdAt)}</span>
      </div>

      <div className={s.replyRow}>
        {post.mine ? (
          <button className={s.activityBtn} onClick={() => setActivity(true)}>
            <Icon name="sparkle" size={16} />
            {locket.activity}
            {post.reactions?.length ? <span className={s.activityFaces}>{[...new Set(post.reactions.map((r) => r.emoji).filter(Boolean))].slice(0, 3).join('')}</span> : null}
          </button>
        ) : (
          <div className={s.replyBar}>
            <input className={s.replyInput} placeholder={locket.sendMessage} value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={post.blurred} />
            {locket.quickReactions.map((e) => (
              <button key={e} className={s.quick} onClick={() => react(e)} disabled={post.blurred} aria-label={e}>
                {e}
              </button>
            ))}
            <button className={s.quick} onClick={() => setPicker(true)} disabled={post.blurred} aria-label={bereal.realMoji}>
              <Icon name="smilePlus" size={24} />
            </button>
          </div>
        )}
      </div>

      <div className={s.historyBar}>
        <button className={s.barBtn} onClick={onGrid} aria-label={locket.history}>
          <Icon name="grid4" size={26} />
        </button>
        <button className={s.shutterSmall} onClick={onCamera} aria-label={ios.axShutter} />
        <button className={s.barBtn} onClick={() => setMore(true)} aria-label={ios.share}>
          <Icon name="share" size={26} />
        </button>
      </div>

      {/* Activity: who reacted — only the poster sees it, never a count */}
      <Sheet open={activity} onClose={() => setActivity(false)} title={locket.activity} dark>
        {(post.reactions ?? []).length === 0 ? (
          <p className={s.sheetEmpty}>{locket.noActivity}</p>
        ) : (
          <Section>
            {(post.reactions ?? []).map((r, i) => (
              <Row
                key={i}
                icon={<Avatar user={r.user} size={32} />}
                title={r.user ? firstName(r.user.name) : jackbox.audience}
                sub={locket.ago(Date.now() - r.createdAt)}
                accessory={r.stickerUrl ? <img src={r.stickerUrl} alt="" width={40} height={40} /> : <span style={{ fontSize: 26 }}>{r.emoji}</span>}
                sepInset={60}
              />
            ))}
          </Section>
        )}
      </Sheet>

      {/* Reactions: Tapbacks + any emoji (iOS 18 / iOS 27) and RealMoji with ⚡ Instant (BeReal) */}
      <Sheet open={picker} onClose={() => setPicker(false)} dark>
        <div className={s.tapbacks}>
          {imessage.tapbacks.map((e) => (
            <button key={e} onClick={() => { void react(e); setPicker(false); }}>{e}</button>
          ))}
          <input
            className={s.anyEmoji}
            aria-label={ios.more}
            onChange={(e) => {
              const v = [...e.target.value].pop();
              if (v && /\p{Extended_Pictographic}/u.test(v)) {
                void react(v);
                setPicker(false);
              }
              e.target.value = '';
            }}
          />
        </div>
        <Section header={bereal.realMoji}>
          <div className={s.realMojis}>
            {(me.data?.stickers ?? []).map((st) => (
              <button key={st.id} onClick={() => { void react(null, st.id); setPicker(false); }}>
                <img src={st.media} alt="" />
              </button>
            ))}
            <button className={s.instant} onClick={() => nav('/create/sticker?instant=1')} aria-label={bereal.instantRealMoji}>
              {bereal.instant}
            </button>
          </div>
        </Section>
      </Sheet>

      <Menu
        open={more}
        onClose={() => setMore(false)}
        actions={[
          ...(typeof navigator.share === 'function' ? [{ label: ios.share, icon: 'share', onClick: () => void navigator.share({ url: `${location.origin}/api/posts/${post.id}/export` }).catch(() => undefined) }] : []),
          { label: ios.save, icon: 'download', onClick: () => window.open(`/api/posts/${post.id}/export`, '_blank') },
          { label: gphotos.tools.remix, icon: 'sparkles', onClick: () => nav(`/create/remix?post=${post.id}&group=${post.groupId}`) },
          { label: whatsapp.createSticker, icon: 'sticker', onClick: () => nav(`/create/sticker?post=${post.id}&group=${post.groupId}`) },
          ...(post.mine && post.caption ? [{ label: characterai.pin, icon: 'pin', onClick: async () => { await api.post(`/posts/${post.id}/remember`, { remember: !post.remember }); void refresh(); } }] : []),
          ...(post.mine
            ? [{ label: ios.delete, icon: 'trash', destructive: true, onClick: async () => { await api.del(`/posts/${post.id}`); void refresh(); } }]
            : [
                { label: bereal.report, icon: 'flag', destructive: true, onClick: async () => { await api.post('/report', { kind: 'post', id: post.id }); setAlert({ title: bereal.report, message: bereal.reportsAnonymous }); } },
                { label: bereal.block, icon: 'eyeOff', destructive: true, onClick: async () => { await api.post('/block', { userId: post.user.id }); setAlert({ title: bereal.block, message: bereal.blockNotNotified }); void refresh(); } },
              ]),
        ]}
      />
      <Alert open={Boolean(alert)} title={alert?.title ?? ''} message={alert?.message} onDismiss={() => setAlert(null)} actions={[{ label: ios.ok, preferred: true, onClick: () => setAlert(null) }]} />
    </div>
  );
}
