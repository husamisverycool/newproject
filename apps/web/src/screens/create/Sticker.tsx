import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BRAND, bereal, imessage, ios, whatsapp } from '@app/shared';
import { NavBar, Screen, Section, Spinner } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { api } from '../../lib/api';
import { useCamera } from '../../lib/camera';
import { haptic } from '../../lib/feedback';
import { queryClient, useFeed, useMe } from '../../lib/queries';
import { cutout, faceCrop, loadImage } from '../../lib/vision';
import { applyEffect, previewSticker, type Effect } from './effects';
import { BottomAction, PhotoGrid, PickRow, pickable, useCreateGroup, useErrorAlert, usePost } from './common';
import s from './create.module.css';

type Source = { blob: Blob; url: string; postId: string | null; subjectId: string };

/**
 * Sticker maker: WhatsApp's "Create sticker" [B-med] (pick a photo → automatic cutout [B-med]; Web:
 * paperclip → "Sticker" → upload [V-weak]) with iMessage's verified steps: the lifted subject →
 * "Add Sticker" [V], and "Add Effect" [V] with "Shiny" · "Comic" · "Puffy" · "Outline" [V-weak].
 * "Outline" is preselected because the server's die-cut always draws the white edge.
 * Pack export: "Add to WhatsApp" (Sticker.ly [V-weak]), enabled at WhatsApp's 3-sticker minimum [V-weak].
 * `?instant=1` is BeReal's Instant RealMoji; `?post=` makes a sticker from that post.
 */
export default function StickerMaker() {
  const [params] = useSearchParams();
  return params.get('instant') ? <InstantRealMoji /> : <Maker />;
}

function Maker() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const group = useCreateGroup();
  const me = useMe();
  const postId = params.get('post');
  const fixed = usePost(postId);
  const feed = useFeed(postId ? null : group?.id);
  const [src, setSrc] = useState<Source | null>(null);
  const [cut, setCut] = useState<Blob | null>(null);
  const [effect, setEffect] = useState<Effect>('Outline');
  const [previews, setPreviews] = useState<Partial<Record<Effect, string>>>({});
  const [busy, setBusy] = useState(false);
  const err = useErrorAlert();
  const stickers = me.data?.stickers ?? [];

  const choose = async (url: string, postId: string | null, subjectId: string) => {
    const blob = await (await fetch(url)).blob();
    setSrc({ blob, url, postId, subjectId });
  };

  useEffect(() => {
    const p = fixed.data?.post;
    if (p && !src) void choose(p.media.main, p.id, p.user.id);
  }, [fixed.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lift the subject (MediaPipe selfie segmentation, on-device), then draw each effect.
  useEffect(() => {
    if (!src) return;
    let live = true;
    setCut(null);
    setPreviews({});
    void (async () => {
      const lifted = (await cutout(src.blob).catch(() => null))?.png ?? src.blob;
      if (!live) return;
      setCut(lifted);
      const out: Partial<Record<Effect, string>> = {};
      for (const fx of imessage.stickerEffects) out[fx] = await previewSticker(lifted, fx);
      if (live) setPreviews(out);
    })();
    return () => {
      live = false;
    };
  }, [src]);

  const add = async () => {
    if (!src || !cut || busy) return;
    setBusy(true);
    const r = await err.run(async () => {
      const fd = new FormData();
      fd.set('cutout', await applyEffect(cut, effect), 'sticker.png');
      fd.set('original', src.blob, 'original.jpg');
      if (group) fd.set('groupId', group.id);
      fd.set('subjectId', src.subjectId);
      if (src.postId) fd.set('postId', src.postId);
      return api.post('/objects/sticker', fd);
    });
    setBusy(false);
    if (!r) return;
    haptic('success');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    if (postId) nav(-1);
    else setSrc(null);
  };

  const exportPack = async () => {
    const blob = await api.blob(`/stickers/pack${group ? `?groupId=${group.id}` : ''}`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${BRAND.bare}-stickers.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <Screen grouped>
      <NavBar onBack={() => nav(-1)} title={whatsapp.createSticker} />
      <div className={s.scroll}>
        {src && (
          <div className={s.stage}>
            {previews[effect] ? <img src={previews[effect]} alt="" /> : <Spinner size={28} />}
          </div>
        )}
        {src && (
          <Section header={imessage.addEffect}>
            <div className={s.effects}>
              {imessage.stickerEffects.map((fx) => (
                <button key={fx} className={s.fx} aria-pressed={effect === fx} onClick={() => setEffect(fx)}>
                  <span>{previews[fx] ? <img src={previews[fx]} alt="" /> : <Spinner size={16} />}</span>
                  <span>{fx}</span>
                </button>
              ))}
            </div>
          </Section>
        )}
        {!postId && (
          <Section header={group?.name}>
            <PhotoGrid posts={pickable(feed.data?.posts)} selected={src?.postId ?? null} onPick={(p) => void choose(p.media.main, p.id, p.user.id)} />
            {me.data && <PickRow label={ios.photoLibrary} onFile={(f) => setSrc({ blob: f, url: URL.createObjectURL(f), postId: null, subjectId: me.data!.user.id })} />}
          </Section>
        )}
        {!postId && stickers.length > 0 && (
          <Section header={imessage.stickers}>
            <div className={s.stickers}>
              {stickers.map((st) => (
                <img key={st.id} src={st.media} alt="" />
              ))}
            </div>
            <button className="ios-row link" disabled={stickers.length < whatsapp.pack.min} onClick={() => void err.run(exportPack)} style={stickers.length < whatsapp.pack.min ? { color: 'var(--sys-label3)' } : undefined}>
              <span className="ios-row-text">
                <span>{whatsapp.addToWhatsApp}</span>
              </span>
            </button>
          </Section>
        )}
      </div>
      {src && (
        <BottomAction onClick={() => void add()} disabled={!cut || busy}>
          {busy ? <Spinner size={18} /> : imessage.addSticker}
        </BottomAction>
      )}
      {err.node}
    </Screen>
  );
}

/** Round, transparent-edged crop of the face: RealMojis are round selfies [I] (bereal-06). */
async function roundFace(shot: Blob) {
  const face = (await faceCrop(shot).catch(() => null)) ?? shot;
  const img = await loadImage(face);
  const d = Math.min(img.naturalWidth, img.naturalHeight);
  const c = document.createElement('canvas');
  c.width = d;
  c.height = d;
  const ctx = c.getContext('2d')!;
  ctx.beginPath();
  ctx.arc(d / 2, d / 2, d / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, (img.naturalWidth - d) / 2, (img.naturalHeight - d) / 2, d, d, 0, 0, d, d);
  return new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/png'));
}

/**
 * BeReal Instant RealMoji [V] (research/11 §1.5): a live selfie reaction with the front camera; "Tap the
 * white button to capture your reaction" [V]; the save button is "Continue" [V]. It lands in your
 * RealMoji row (HistoryPost's reaction sheet) as a likeness sticker (spec §P).
 */
function InstantRealMoji() {
  const nav = useNavigate();
  const group = useCreateGroup();
  const me = useMe();
  const cam = useCamera(true, { bts: false });
  const [shot, setShot] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const err = useErrorAlert();
  const shotUrl = useMemo(() => (shot ? URL.createObjectURL(shot) : null), [shot]);
  useEffect(() => {
    if (cam.ready && cam.facing !== 'user') void cam.flip();
  }, [cam.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!shot || !me.data || busy) return;
    setBusy(true);
    const r = await err.run(async () => {
      const fd = new FormData();
      fd.set('cutout', await roundFace(shot), 'realmoji.png');
      fd.set('original', shot, 'selfie.jpg');
      if (group) fd.set('groupId', group.id);
      fd.set('subjectId', me.data!.user.id);
      return api.post('/objects/sticker', fd);
    });
    setBusy(false);
    if (!r) return;
    haptic('success');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    nav(-1);
  };

  return (
    <Screen dark className={s.instant}>
      {/* BeReal closes with a white ⌄ at the top left [I] (bereal-02), not a back button */}
      <NavBar
        title={bereal.instantRealMoji}
        leading={
          <button className="ios-bar-btn" style={{ color: '#fff' }} onClick={() => nav(-1)} aria-label={ios.close}>
            <Icon name="chevronDown" size={26} strokeWidth={2.4} />
          </button>
        }
      />
      <div className={s.instantBody}>
        <div className={s.round} onClick={() => setShot(null)}>
          {shotUrl ? <img src={shotUrl} alt="" /> : <video ref={cam.videoRef} playsInline muted autoPlay />}
        </div>
        {shot ? (
          <button className={s.whiteCapsule} disabled={busy} onClick={() => void save()}>
            {busy ? <Spinner size={18} /> : bereal.realMojiContinue}
          </button>
        ) : (
          <button className={s.shutter} disabled={!cam.ready} aria-label={ios.axShutter} onClick={async () => { setShot(await cam.capture(900)); haptic('medium'); }} />
        )}
      </div>
      {err.node}
    </Screen>
  );
}

