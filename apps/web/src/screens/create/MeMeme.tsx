import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { gphotos, ios, spec } from '@app/shared';
import { Button, NavBar, Screen, Section, Spinner } from '../../components/ios';
import { Icon } from '../../components/Icon';
import { api } from '../../lib/api';
import { invalidateGroup, queryClient, useFeed, useMe } from '../../lib/queries';
import { detectFace, faceCrop } from '../../lib/vision';
import type { LikenessObject, Post } from '../../lib/types';
import { AiInfo, BottomAction, PhotoGrid, PickRow, ResultActions, pickable, useCreateGroup, useErrorAlert } from './common';
import s from './create.module.css';

type Src = { url: string; file?: File; post?: Post };

/**
 * Me Meme, after Google Photos (research/06 §1.5, 16 §1, 26 §3):
 * 1. "Choose a template" [V]: a preset, or "Upload your own" funny picture [V]. Our presets are the
 *    group's own photos (spec §H "adapted to group templates").
 * 2. A photo where your face is clearly visible — "well-lit, focused, and front-facing" [V] — taken
 *    from your enrolled likeness selfies (spec §A5) or the Photos picker [HIG].
 * 3. "Generate" [V]. Result: "Save" · "Regenerate" · "Share" [V] and "Compare" [V-weak], which shows
 *    the uploaded photo while held (toggle vs. hold is UNKNOWN; Photos' editor compares on hold [HIG]).
 * "Send feedback" exists [V-weak] but its label is UNKNOWN, so it is left out.
 */
export default function MeMeme() {
  const nav = useNavigate();
  const group = useCreateGroup();
  const me = useMe();
  const feed = useFeed(group?.id);
  const [template, setTemplate] = useState<Src | null>(null);
  const [selfie, setSelfie] = useState<Src | null>(null);
  const [result, setResult] = useState<LikenessObject | null>(null);
  const [comparing, setComparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const err = useErrorAlert();
  const scroller = useRef<HTMLDivElement>(null);
  const selfies = me.data?.likeness?.selfies ?? [];

  const generate = async () => {
    if (!template || !selfie || !group || !me.data || busy) return;
    setBusy(true);
    const r = await err.run(async () => {
      const face = await faceCrop(selfie.file ?? selfie.url);
      if (!face) throw new Error(gphotos.selfieGuidance);
      const fd = new FormData();
      fd.set('face', face, 'face.png');
      if (template.post) fd.set('templatePostId', template.post.id);
      else if (template.file) fd.set('template', template.file);
      const spot = await detectFace(template.file ?? template.url).catch(() => null);
      if (spot) fd.set('box', JSON.stringify(spot.box));
      fd.set('groupId', group.id);
      fd.set('subjectId', me.data!.user.id);
      return api.post<{ object: LikenessObject }>('/objects/meme', fd);
    });
    setBusy(false);
    if (r) {
      setResult(r.object);
      scroller.current?.scrollTo({ top: 0, behavior: 'smooth' });
      invalidateGroup(group.id);
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  };

  const fromFile = (f: File): Src => ({ url: URL.createObjectURL(f), file: f });

  return (
    <Screen light grouped className={s.google}>
      <NavBar onBack={() => nav(-1)} title={gphotos.tools.meMeme} />
      <div className={s.scroll} ref={scroller}>
        {(result || template) && (
          <div
            className={s.preview}
            onPointerDown={() => result && setComparing(true)}
            onPointerUp={() => setComparing(false)}
            onPointerLeave={() => setComparing(false)}
          >
            <img src={result && !comparing ? result.media : template!.url} alt="" />
            {busy && (
              <div className={s.busy}>
                <Spinner size={28} />
              </div>
            )}
            {result && (
              <span className={s.compare}>
                <Button kind="gray" small>
                  {gphotos.compare}
                </Button>
              </span>
            )}
          </div>
        )}
        {result ? (
          <>
            <ResultActions object={result} onRegenerate={() => void generate()} busy={busy} />
            <AiInfo edited />
          </>
        ) : (
          <>
            <Section header={gphotos.chooseTemplate}>
              <PhotoGrid posts={pickable(feed.data?.posts)} selected={template?.post?.id ?? null} onPick={(p) => setTemplate({ url: p.media.main, post: p })} />
              <PickRow label={gphotos.uploadOwn} onFile={(f) => setTemplate(fromFile(f))} />
            </Section>
            <Section header={spec.likeness} footer={gphotos.selfieGuidance}>
              {selfies.length > 0 && (
                <div className={s.selfies}>
                  {selfies.map((u) => (
                    <button key={u} className={s.cell} onClick={() => setSelfie({ url: u })} aria-pressed={selfie?.url === u} aria-label={spec.likeness}>
                      <img src={u} alt="" />
                      {selfie?.url === u && (
                        <span className={s.check}>
                          <Icon name="check" size={14} strokeWidth={3} color="#fff" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <PickRow label={ios.photoLibrary} onFile={(f) => setSelfie(fromFile(f))} />
            </Section>
          </>
        )}
      </div>
      {!result && (
        <BottomAction onClick={() => void generate()} disabled={!template || !selfie || busy}>
          {busy ? <Spinner size={18} /> : gphotos.generate}
        </BottomAction>
      )}
      {err.node}
    </Screen>
  );
}
