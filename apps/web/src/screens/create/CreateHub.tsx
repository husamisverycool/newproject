import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { gphotos, ios, spec, whatsapp } from '@app/shared';
import { LargeTitle, NavBar, Row, Screen, Section, Sheet, Spinner } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { api } from '../../lib/api';
import type { LikenessObject } from '../../lib/types';
import { ResultActions, useCreateGroup, useErrorAlert } from './common';
import Remix from './Remix';
import { Animations, Cinematic, Highlight, PhotoToVideo } from './Tools';
import { CreationsSection } from './Creations';
import { PrintButton } from '../../components/PrintSheet';
import MeMeme from './MeMeme';
import StickerMaker from './Sticker';
import s from './create.module.css';

/**
 * Create hub (`/create/*`), patterned on Google Photos' Create tab (research/06 §1.1–1.5, 16 §1):
 * - title "Create" [V]; the tools under "Your tools" [V-weak], in the order Google's blog lists them
 *   (Photo to video · Remix · Collage · Highlight videos · Cinematic photos · Animations [V]; on-screen
 *   order UNKNOWN), then Me Meme [V], each with its one-line description where one was found [V-weak].
 * - Photo to video, Cinematic photos, Animations and Highlight videos are rendered on the device
 *   (create/motion.ts) and saved to the group; what the group made shows under "Creations" [B-med].
 * - Collage opens the week's wall (the group collage, spec §G); Create sticker is WhatsApp's name
 *   [B-med]; Zine is the spec's own name [S] (§H) because no source app has one.
 * - Glyphs are SF Symbols stand-ins [HIG] (wand.and.stars, face.smiling, square.grid.2x2, a sticker,
 *   book): Google's tile icons are UNKNOWN.
 */
export default function CreateHub() {
  return (
    <Routes>
      <Route index element={<Hub />} />
      <Route path="remix" element={<Remix />} />
      <Route path="meme" element={<MeMeme />} />
      <Route path="sticker" element={<StickerMaker />} />
      <Route path="photo-to-video" element={<PhotoToVideo />} />
      <Route path="cinematic" element={<Cinematic />} />
      <Route path="animations" element={<Animations />} />
      <Route path="highlight" element={<Highlight />} />
      <Route path="*" element={<Hub />} />
    </Routes>
  );
}

function Hub() {
  const nav = useNavigate();
  const group = useCreateGroup();
  const q = group ? `?group=${group.id}` : '';
  const [zine, setZine] = useState<LikenessObject | null>(null);
  const [busy, setBusy] = useState(false);
  const err = useErrorAlert();
  const tool = (icon: string) => <Icon name={icon} size={24} className={s.toolIcon} />;

  const makeZine = async () => {
    if (!group || busy) return;
    setBusy(true);
    const r = await err.run(() => api.post<{ object: LikenessObject }>(`/groups/${group.id}/zine`, { weekKey: group.ritual.weekKey }));
    setBusy(false);
    if (r) setZine(r.object);
  };

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} />
      <div className={s.scroll}>
        <LargeTitle>{gphotos.create}</LargeTitle>
        <Section header={gphotos.yourTools}>
          <Row sepInset={52} icon={tool('playRect')} title={gphotos.tools.photoToVideo} sub={gphotos.toolLines.photoToVideo} onClick={() => nav(`photo-to-video${q}`)} />
          <Row sepInset={52} icon={tool('wand')} title={gphotos.tools.remix} sub={gphotos.toolLines.remix} onClick={() => nav(`remix${q}`)} />
          {group && <Row sepInset={52} icon={tool('grid')} title={gphotos.tools.collage} sub={gphotos.toolLines.collage} onClick={() => nav(`/g/${group.id}/week/${group.ritual.weekKey}`)} />}
          <Row sepInset={52} icon={tool('film')} title={gphotos.tools.highlight} sub={gphotos.toolLines.highlight} onClick={() => nav(`highlight${q}`)} />
          <Row sepInset={52} icon={tool('cube')} title={gphotos.tools.cinematic} sub={gphotos.toolLines.cinematic} onClick={() => nav(`cinematic${q}`)} />
          <Row sepInset={52} icon={tool('stack')} title={gphotos.tools.animation} sub={gphotos.toolLines.animation} onClick={() => nav(`animations${q}`)} />
          <Row sepInset={52} icon={tool('smile')} title={gphotos.tools.meMeme} onClick={() => nav(`meme${q}`)} />
          <Row sepInset={52} icon={tool('sticker')} title={whatsapp.createSticker} onClick={() => nav(`sticker${q}`)} />
          {group && <Row sepInset={52} icon={tool('book')} title={spec.zine} onClick={() => void makeZine()} accessory={busy ? <Spinner size={18} /> : undefined} chevron={!busy} />}
        </Section>
        {group && <CreationsSection groupId={group.id} />}
      </div>
      <Sheet open={Boolean(zine)} onClose={() => setZine(null)} title={spec.zine} light trailing={<button className="ios-bar-btn bold" onClick={() => setZine(null)}>{ios.done}</button>}>
        {zine && (
          <>
            <div className={s.preview}>
              <img src={zine.media} alt="" />
            </div>
            <ResultActions object={zine} />
            {group && (
              <div className={s.printRow}>
                <PrintButton className={s.printBtn} groupId={group.id} kind="zine" objectId={zine.id} preview={zine.media} />
              </div>
            )}
          </>
        )}
      </Sheet>
      {err.node}
    </Screen>
  );
}
