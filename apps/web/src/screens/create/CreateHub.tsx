import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { gphotos, ios, spec, whatsapp } from '@app/shared';
import { LargeTitle, NavBar, Row, Screen, Section, Sheet, Spinner } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { api } from '../../lib/api';
import type { LikenessObject } from '../../lib/types';
import { ResultActions, useCreateGroup, useErrorAlert } from './common';
import Remix from './Remix';
import MeMeme from './MeMeme';
import StickerMaker from './Sticker';
import s from './create.module.css';

/**
 * Create hub (`/create/*`), patterned on Google Photos' Create tab (research/06 §1.1–1.5, 16 §1):
 * - title "Create" [V]; the tools under "Your tools" [V-weak], each with its one-line description
 *   where one was found (Remix, Collage [V-weak]); Me Meme [V] has no reported description.
 * - Only the tools this app can run are listed. Photo to video, Cinematic photos, Animations and
 *   Highlight videos have no backend here and are left out.
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
          <Row sepInset={52} icon={tool('wand')} title={gphotos.tools.remix} sub={gphotos.toolLines.remix} onClick={() => nav(`remix${q}`)} />
          <Row sepInset={52} icon={tool('smile')} title={gphotos.tools.meMeme} onClick={() => nav(`meme${q}`)} />
          {group && <Row sepInset={52} icon={tool('grid')} title={gphotos.tools.collage} sub={gphotos.toolLines.collage} onClick={() => nav(`/g/${group.id}/week/${group.ritual.weekKey}`)} />}
          <Row sepInset={52} icon={tool('sticker')} title={whatsapp.createSticker} onClick={() => nav(`sticker${q}`)} />
          {group && <Row sepInset={52} icon={tool('book')} title={spec.zine} onClick={() => void makeZine()} accessory={busy ? <Spinner size={18} /> : undefined} chevron={!busy} />}
        </Section>
      </div>
      <Sheet open={Boolean(zine)} onClose={() => setZine(null)} title={spec.zine} light trailing={<button className="ios-bar-btn bold" onClick={() => setZine(null)}>{ios.done}</button>}>
        {zine && (
          <>
            <div className={s.preview}>
              <img src={zine.media} alt="" />
            </div>
            <ResultActions object={zine} />
          </>
        )}
      </Sheet>
      {err.node}
    </Screen>
  );
}
