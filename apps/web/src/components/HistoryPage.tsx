import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { api } from '../lib/api';
import { haptic, sfx } from '../lib/feedback';
import { dateStamp, firstName, timeAgo } from '../lib/format';
import { queryClient, useMe } from '../lib/queries';
import { useUi } from '../lib/store';
import type { Post } from '../lib/types';
import { Icon } from './Icon';
import { Avatar, Sheet } from './ui';
import { EmojiRain } from './EmojiRain';
import s from '../screens/camera.module.css';

/** BeReal RealMoji set: thumbs up, smile, surprise, heart eyes, crying-laughing — then ⚡ instant. */
export const QUICK_REACTIONS = ['👍', '😊', '😮', '😍', '😂'];

/** One page of Locket's History: the photo in the widget-shaped frame, name + time, reaction bar. */
export function HistoryPage({ post, onCamera, onGrid, groupName }: { post: Post; onCamera: () => void; onGrid: () => void; groupName: string }) {
  const nav = useNavigate();
  const me = useMe();
  const rain = useUi((st) => st.rain);
  const [localRain, setLocalRain] = useState<{ emoji: string; key: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [swap, setSwap] = useState(false);
  const [activity, setActivity] = useState(false);
  const [more, setMore] = useState(false);
  const [msg, setMsg] = useState('');
  const [stickers, setStickers] = useState(false);
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
    sfx.send();
    await api.post(`/groups/${post.groupId}/messages`, { kind: 'post_reply', body: text, refId: post.id });
    void queryClient.invalidateQueries({ queryKey: ['messages', post.groupId] });
  };

  const main = swap && post.media.inset ? post.media.inset : post.media.main;
  const inset = swap ? post.media.main : post.media.inset;
  const old = post.kind === 'rewind' || post.createdAt - post.takenAt > 14 * 86_400_000;

  return (
    <div className={s.historyPage}>
      <div className={s.historySpacer} />
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
      >
        <img src={playing && post.media.live ? post.media.live : main} className={`${s.media} ${post.blurred ? s.blurred : ''}`} alt={post.caption ?? `Photo by ${post.user.name}`} draggable={false} />
        {inset && !post.blurred && (
          <button className={s.inset} onClick={() => setSwap(!swap)} aria-label="Swap photos" style={{ backgroundImage: `url(${inset})` }} />
        )}
        {post.media.live && !post.blurred && (
          <span className={s.liveCorner} title="Hold to play">
            <Icon name="live" size={18} />
          </span>
        )}
        {old && !post.blurred && <span className={s.stamp}>{dateStamp(post.takenAt)}</span>}
        {post.caption && !post.blurred && <div className={s.captionShow}>{post.caption}</div>}
        {post.media.voice && !post.blurred && (
          <button
            className={s.voiceChip}
            onClick={() => {
              audio.current ??= new Audio(post.media.voice);
              if (audio.current.paused) void audio.current.play();
              else audio.current.pause();
            }}
          >
            <Icon name="volume" size={16} /> {Math.round(post.media.voiceDuration ?? 0)}s
          </button>
        )}
        {post.blurred && (
          <div className={s.lockOverlay}>
            <Icon name="lock" size={30} />
            <div className="t-headline">Post to see this week</div>
            <div className="t-foot center">Share one photo this week and everyone’s week unlocks.</div>
            <button className="chip chip-on" onClick={onCamera}>Open camera</button>
          </div>
        )}
        {localRain && <EmojiRain key={localRain.key} emoji={localRain.emoji} />}
      </div>

      <div className={s.byline}>
        <Avatar user={post.user} size={26} />
        <span className={s.bylineName}>{post.mine ? 'You' : firstName(post.user.name)}</span>
        <span className={s.bylineTime}>{timeAgo(post.createdAt)}</span>
        {post.ritual && <span className={s.rollTag}>roll</span>}
      </div>

      <div className={s.reactBar}>
        {post.mine ? (
          <button className={s.activityBtn} onClick={() => setActivity(true)}>
            <Icon name="sparkles" size={18} /> Activity
            {post.reactions?.length ? <span className={s.activityFaces}>{[...new Set(post.reactions.map((r) => r.emoji).filter(Boolean))].slice(0, 3).join('')}</span> : null}
          </button>
        ) : (
          <>
            <input className={s.msgInput} placeholder="Send message…" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} disabled={post.blurred} />
            {QUICK_REACTIONS.slice(0, 3).map((e) => (
              <button key={e} className={s.quick} onClick={() => react(e)} disabled={post.blurred} aria-label={`React ${e}`}>
                {e}
              </button>
            ))}
            <button className={s.quick} onClick={() => setStickers(true)} disabled={post.blurred} aria-label="More reactions">
              <Icon name="smile" size={22} />
            </button>
          </>
        )}
      </div>

      <div className={s.historyBar}>
        <button className={s.barBtn} onClick={onGrid} aria-label="Journal">
          <Icon name="grid" size={24} />
        </button>
        <button className={s.miniShutter} onClick={onCamera} aria-label="Back to camera">
          <span />
        </button>
        <button className={s.barBtn} onClick={() => setMore(true)} aria-label="More">
          <Icon name="more" size={26} strokeWidth={3} />
        </button>
      </div>

      <Sheet open={activity} onClose={() => setActivity(false)} title="Activity">
        <p className="t-foot center" style={{ marginTop: 0 }}>Only you can see who reacted. No counts, ever.</p>
        <div className="stack gap8" style={{ paddingBottom: 12 }}>
          {(post.reactions ?? []).length === 0 && <div className="t-sub center">No reactions yet</div>}
          {(post.reactions ?? []).map((r, i) => (
            <div key={i} className="hstack gap12">
              <Avatar user={r.user ?? { name: 'Guest', avatar: null, color: '#3A3A3C' }} size={36} />
              <span className="grow t-body">{r.user ? firstName(r.user.name) : 'A guest'}</span>
              {r.stickerUrl ? <img src={r.stickerUrl} alt="" width={40} height={40} /> : <span style={{ fontSize: 26 }}>{r.emoji}</span>}
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet open={stickers} onClose={() => setStickers(false)} title="React">
        <div className={s.reactGrid}>
          {[...QUICK_REACTIONS, '💛', '🔥', '🫶', '😭', '🤯', '👀', '🎉', '💀'].map((e) => (
            <button key={e} onClick={() => { void react(e); setStickers(false); }}>{e}</button>
          ))}
        </div>
        <div className="section-head" style={{ marginTop: 12 }}>
          <span>Your stickers</span>
          <button className="t-foot" onClick={() => nav('/create/sticker')}>Make one</button>
        </div>
        <div className={s.reactStickers}>
          {(me.data?.stickers ?? []).map((st) => (
            <button key={st.id} onClick={() => { void react(null, st.id); setStickers(false); sfx.pop(); }}>
              <img src={st.media} alt="" />
            </button>
          ))}
          <button className={s.instant} onClick={() => nav('/create/sticker?instant=1')}>
            <Icon name="bolt" size={22} />
            <span>Instant</span>
          </button>
        </div>
      </Sheet>

      <Sheet open={more} onClose={() => setMore(false)}>
        <div className="stack" style={{ paddingBottom: 8 }}>
          <MoreRow icon="sparkles" label="Remix this moment" onClick={() => nav(`/create/remix?post=${post.id}&group=${post.groupId}`)} />
          <MoreRow icon="sticker" label="Make a sticker" onClick={() => nav(`/create/sticker?post=${post.id}&group=${post.groupId}`)} />
          <MoreRow icon="chat" label={`Reply in ${groupName}`} onClick={() => nav(`/chat/${post.groupId}`)} />
          {post.mine && <MoreRow icon="pin" label={post.remember ? 'Forget this caption' : 'Let the game master remember this'} onClick={async () => { await api.post(`/posts/${post.id}/remember`, { remember: !post.remember }); void queryClient.invalidateQueries({ queryKey: ['feed', post.groupId] }); setMore(false); }} />}
          {post.mine && <MoreRow icon="trash" label="Delete for everyone" danger onClick={async () => { await api.del(`/posts/${post.id}`); void queryClient.invalidateQueries({ queryKey: ['feed', post.groupId] }); setMore(false); }} />}
          {!post.mine && <MoreRow icon="flag" label="Report" danger onClick={async () => { await api.post('/report', { kind: 'post', id: post.id, reason: 'reported from history' }); setMore(false); }} />}
        </div>
      </Sheet>
      <AnimatePresence />
    </div>
  );
}

function MoreRow({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} className={s.moreRow} onClick={onClick} style={danger ? { color: 'var(--red)' } : undefined}>
      <Icon name={icon} size={22} />
      {label}
    </motion.button>
  );
}
