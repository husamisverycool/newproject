import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueries, useQuery } from '@tanstack/react-query';
import type { LikenessScope } from '@app/shared';
import { bereal, ios, sora, spec } from '@app/shared';
import { Alert, Avatar, Button, Menu, NavBar, Row, Screen, Section, Sheet, Switch } from '../components/ios';
import { Icon } from '../components/Icon';
import { api } from '../lib/api';
import { queryClient, useMe } from '../lib/queries';
import type { GroupDetail, PublicUser } from '../lib/types';
import { LikenessCapture } from './Onboarding';
import s from './likeness.module.css';

interface LogItem {
  id: string;
  kind: string;
  media: string;
  style: string | null;
  createdAt: number;
  revoked: boolean;
  groupId: string | null;
  createdBy: PublicUser | null;
}

/**
 * Likeness settings (`/me/likeness`), after Sora's likeness permissions (research/06 §3, 16 §3; the
 * feature's old name is not used, research/26 §12):
 * - who can use it: "Only me" · "People I approve" · "Mutuals" · "Everyone" [V]; teen accounts get
 *   only the first two [V-weak]. "Mutuals" = people you share a group with (our friend graph).
 * - "Restrictions" [V-weak] with Sora's own example as the placeholder [V].
 * - spec §F "my group can make me into stickers" and §G "Automatic AI creations" as switches [S].
 * - every object made with your face, with Sora's line "You can see drafts that include your
 *   likeness, even if someone else created them" [V-weak]; each can be removed ("Remove" [V-weak])
 *   or reported ("Report", BeReal [V]).
 * - "Retake" [V-weak] reruns the onboarding capture (LikenessCapture). Before enrollment the
 *   capture starts from "Continue" (Bitmoji's selfie onboarding, research/26 §8 [V-weak]).
 * Section headers Sora uses are UNKNOWN, so the audience list has none [HIG].
 */
export default function Likeness() {
  const nav = useNavigate();
  const me = useMe();
  const info = useQuery({ queryKey: ['likeness'], queryFn: () => api.get<{ likeness: { selfies: string[] } | null; log: LogItem[]; scope: LikenessScope; allow: string[] }>('/me/likeness') });
  const groups = me.data?.groups ?? [];
  const details = useQueries({ queries: groups.map((g) => ({ queryKey: ['group', g.id], queryFn: () => api.get<GroupDetail>(`/groups/${g.id}`) })) });
  const [capture, setCapture] = useState(false);
  const [item, setItem] = useState<LogItem | null>(null);
  const [confirm, setConfirm] = useState(false);
  const user = me.data?.user;
  const settings = (user?.settings ?? {}) as Record<string, unknown>;
  const [restrictions, setRestrictions] = useState('');
  useEffect(() => setRestrictions(String(settings.likenessRestrictions ?? '')), [settings.likenessRestrictions]);

  const scope = info.data?.scope ?? user?.likenessScope ?? 'no_one';
  const allow = info.data?.allow ?? user?.likenessAllow ?? [];
  const friends = useMemo(() => {
    const seen = new Map<string, PublicUser>();
    for (const d of details) for (const m of d.data?.members ?? []) if (m.user.id !== user?.id) seen.set(m.user.id, m.user);
    for (const g of groups) for (const m of g.members) if (m.id !== user?.id && !seen.has(m.id)) seen.set(m.id, m);
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [details, groups, user?.id]);
  const groupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? '';

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['me'] });
    void queryClient.invalidateQueries({ queryKey: ['likeness'] });
  };
  const patch = async (body: Record<string, unknown>) => {
    await api.patch('/me', body);
    refresh();
  };

  const audiences: { id: LikenessScope; label: string }[] = [
    { id: 'no_one', label: sora.onlyMe },
    { id: 'specific_friends', label: sora.peopleIApprove },
    ...(user?.minor ? [] : [{ id: 'my_groups' as const, label: sora.mutuals }, { id: 'everyone' as const, label: sora.everyone }]),
  ];
  const check = <Icon name="check" size={20} strokeWidth={2.6} color="var(--sys-blue)" />;
  const enrolled = info.data?.likeness ?? me.data?.likeness;
  const log = (info.data?.log ?? []).filter((o) => !o.revoked);

  return (
    <Screen dark grouped>
      <NavBar onBack={() => nav(-1)} title={spec.likeness} />
      <div className={s.scroll}>
        {enrolled ? (
          <Section>
            <div className={s.selfies}>
              {enrolled.selfies.slice(0, 3).map((u) => (
                <img key={u} src={u} alt="" />
              ))}
            </div>
            <Row link title={sora.retake} onClick={() => setCapture(true)} />
          </Section>
        ) : (
          <div className={s.cta}>
            <Button block onClick={() => setCapture(true)}>
              {ios.continue}
            </Button>
          </div>
        )}

        <Section>
          {audiences.map((a) => (
            <Row key={a.id} title={a.label} chevron={false} onClick={() => void patch({ likenessScope: a.id })} accessory={scope === a.id ? check : undefined} />
          ))}
        </Section>

        {scope === 'specific_friends' && friends.length > 0 && (
          <Section header={sora.peopleIApprove}>
            {friends.map((f) => {
              const on = allow.includes(f.id);
              return (
                <Row
                  key={f.id}
                  sepInset={60}
                  icon={<Avatar user={f} size={32} />}
                  title={f.name}
                  chevron={false}
                  onClick={() => void patch({ likenessAllow: on ? allow.filter((x) => x !== f.id) : [...allow, f.id] })}
                  accessory={on ? check : undefined}
                />
              );
            })}
          </Section>
        )}

        <Section header={sora.restrictions}>
          <textarea
            className={s.field}
            rows={3}
            placeholder={sora.restrictionExamples[0]}
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            onBlur={() => void patch({ settings: { likenessRestrictions: restrictions.trim() } })}
          />
        </Section>

        <Section>
          <Row
            title={spec.stickerConsent}
            accessory={<Switch on={settings.stickerConsent !== false} label={spec.stickerConsent} onChange={(v) => void patch({ settings: { stickerConsent: v } })} />}
          />
          <Row
            title={spec.autoCreations}
            accessory={<Switch on={Boolean(user?.autoAiCreations)} label={spec.autoCreations} onChange={(v) => void patch({ autoAiCreations: v })} />}
          />
        </Section>

        <Section footer={sora.draftsLine}>
          {log.map((o) => (
            <Row
              key={o.id}
              sepInset={72}
              icon={<img className={s.thumb} src={o.media} alt="" />}
              title={o.createdBy?.name ?? groupName(o.groupId)}
              sub={ios.shortDate(o.createdAt)}
              onClick={() => setItem(o)}
            />
          ))}
        </Section>

        {enrolled && (
          <Section>
            <Row destructive title={sora.remove} onClick={() => setConfirm(true)} />
          </Section>
        )}
      </div>

      <Sheet open={capture} onClose={() => setCapture(false)} dark title={spec.likeness} leading={<button className="ios-bar-btn" onClick={() => setCapture(false)}>{ios.cancel}</button>}>
        <div className={s.sheetBody}>
          <LikenessCapture
            onDone={() => {
              setCapture(false);
              refresh();
            }}
          />
        </div>
      </Sheet>

      <Menu
        open={Boolean(item)}
        onClose={() => setItem(null)}
        actions={
          item
            ? [
                { label: bereal.report, icon: 'flag', destructive: true, onClick: () => void api.post('/report', { kind: 'object', id: item.id, reason: item.kind }) },
                { label: sora.remove, icon: 'trash', destructive: true, onClick: async () => { await api.del(`/objects/${item.id}`); refresh(); } },
              ]
            : []
        }
      />

      <Alert
        open={confirm}
        title={spec.likeness}
        onDismiss={() => setConfirm(false)}
        actions={[
          { label: ios.cancel, onClick: () => setConfirm(false) },
          { label: sora.remove, destructive: true, onClick: async () => { setConfirm(false); await api.del('/me/likeness'); refresh(); } },
        ]}
      />
    </Screen>
  );
}
