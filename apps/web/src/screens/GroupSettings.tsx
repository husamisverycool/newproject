import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { GROUP_MAX, characterai, imessage, ios, locket, partiful, pets, spec, whatsapp, wrapped, yope } from '@app/shared';
import { Avatar, Button, Menu, Row, Screen, Section, Sheet, Spinner, Switch } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { QR, shareInvite } from '../components/QR';
import { api } from '../lib/api';
import { haptic } from '../lib/feedback';
import { invalidateGroup, queryClient, useFeed, useGroup } from '../lib/queries';
import type { GroupDetail, PlanT } from '../lib/types';
import s from './groupsettings.module.css';

/**
 * The group's own page, opened from the chat header capsule (Yope [I] yope-04/-05). Top: Yope's 1:1 space
 * (frame yope-1on1-feed [I]) — cover photo, rising dark sheet, the group's mascot as its picture (spec §M),
 * the name and the lime "🔥N" streak pill. Below: stock iOS grouped rows [HIG], each named by its source:
 * - Ritual day (spec §A4: the admin picks it, default Sunday) with Apple's weekday names [HIG];
 * - Weekly games (§K), Memory (Character.ai [V-weak]), Wrapped (Spotify [V]), Friend Cards (§J);
 * - Plan (§P) rows plus Partiful's "Create" [V] → /g/:groupId/new-plan;
 * - members under Locket's "N out of 20 friends allowed" counter [B-med] (20 → 30, spec §C), WhatsApp's
 *   "Group admin" tag [B-high], and Partiful's "Invite" [V] → QR + link (Yope adds friends "by sharing an
 *   invite link" [V-weak]);
 * - the archive vote (spec §C, after Retro's keys [V]) and Messages' "Leave this Conversation" [HIG].
 */

const GAME_NAME: Record<string, string> = {
  superlatives: spec.superlatives,
  telephone: spec.photoTelephone,
  challenge: spec.challenge,
  guess_whose: spec.guessWhose,
};

function getPlans(groupId: string) {
  return () => api.get<{ plans: PlanT[] }>(`/groups/${groupId}/plans`);
}
function getGame(groupId: string) {
  return () => api.get<{ game: { kind: string } | null }>(`/groups/${groupId}/game`);
}

export default function GroupSettings() {
  const { groupId = '' } = useParams();
  const nav = useNavigate();
  const q = useGroup(groupId);
  const feed = useFeed(groupId);
  const plans = useQuery({ queryKey: ['plans', groupId], queryFn: getPlans(groupId), enabled: Boolean(groupId) });
  const game = useQuery({ queryKey: ['game', groupId], queryFn: getGame(groupId), enabled: Boolean(groupId) });
  const [invite, setInvite] = useState(false);
  const [dayMenu, setDayMenu] = useState(false);
  const [leaveMenu, setLeaveMenu] = useState(false);

  const d = q.data;
  const g = d?.group;
  const admin = d?.me.role === 'admin';
  const cover = [...(d?.live ?? []), ...(feed.data?.posts ?? [])].find((p) => !p.blurred);
  const gameKind = game.data?.game?.kind;

  const setDay = async (day: number) => {
    await api.patch(`/groups/${groupId}`, { ritualDay: day });
    invalidateGroup(groupId);
  };
  const vote = async (yes: boolean) => {
    haptic('light');
    queryClient.setQueryData<GroupDetail>(['group', groupId], (x) => (x ? { ...x, archive: { ...x.archive, mine: yes ? 1 : 0, yes: x.archive.yes + (yes ? 1 : x.archive.mine === 1 ? -1 : 0) } } : x));
    await api.post(`/groups/${groupId}/archive-vote`, { vote: yes });
    invalidateGroup(groupId);
  };
  const leave = async () => {
    await api.post(`/groups/${groupId}/leave`);
    haptic('medium');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    nav('/chats', { replace: true });
  };

  return (
    <Screen dark className={s.screen}>
      <button className={s.back} onClick={() => nav(-1)} aria-label={ios.back}>
        <Icon name="chevronLeft" size={22} strokeWidth={2.6} />
      </button>

      <div className={s.scroll}>
        <div className={s.cover} style={cover ? { backgroundImage: `url(${cover.media.thumb ?? cover.media.main})` } : undefined} />
        <div className={s.sheet}>
          <span className={s.grabber} />
          {!g || !d ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Spinner />
            </div>
          ) : (
            <>
              <div className={s.head}>
                <span className={s.face}>
                  <Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={82} />
                </span>
                <span className={s.name}>{g.name}</span>
                {d.ritual.streak.weeks > 0 && <span className={s.streak}>{yope.streakCount(d.ritual.streak.weeks)}</span>}
              </div>

              {/* The mascot (spec §M; Widgetable / Pengu species names [V-weak]) and the ritual day (§A4) */}
              <Section>
                <Row
                  icon={
                    <span className={s.tileFace}>
                      <Mascot species={g.mascot.species} level={g.mascot.stage.level} outfit={g.mascot.outfit} size={30} />
                    </span>
                  }
                  sepInset={57}
                  title={g.mascot.name}
                  value={pets.species.find((x) => x.id === g.mascot.species)?.name}
                  onClick={() => nav('/shop')}
                />
                <Row
                  icon={<Icon name="calendar" size={18} strokeWidth={2.2} />}
                  iconBg="var(--sys-red)"
                  sepInset={57}
                  title={spec.ritualDay}
                  value={ios.weekdays[g.ritualDay] ?? ios.weekdays[0]}
                  onClick={admin ? () => setDayMenu(true) : undefined}
                />
              </Section>

              {/* Each feature's row carries its source app's color, as Settings shows each app's icon [HIG] */}
              <Section>
                <Row
                  icon={<Icon name="game" size={18} strokeWidth={2.2} />}
                  iconBg="var(--duo-feather)"
                  sepInset={57}
                  title={spec.weeklyGames}
                  value={gameKind ? <span className={s.cap}>{GAME_NAME[gameKind]}</span> : null}
                  onClick={() => nav(`/g/${groupId}/game`)}
                />
                <Row icon={<Icon name="notebook" size={18} strokeWidth={2.2} />} iconBg="var(--sys-gray)" sepInset={57} title={characterai.memory} onClick={() => nav(`/g/${groupId}/memory`)} />
                <Row icon={<Icon name="sparkles" size={18} strokeWidth={2.2} />} iconBg="var(--spotify-green)" sepInset={57} title={wrapped.feedName} onClick={() => nav(`/g/${groupId}/wrapped`)} />
                <Row icon={<Icon name="cardStack" size={18} strokeWidth={2.2} />} iconBg="var(--tcg-teal)" sepInset={57} title={spec.friendCards} onClick={() => nav(`/g/${groupId}/cards`)} />
              </Section>

              {/* spec §P plans (Partiful) */}
              <Section header={spec.plan}>
                {(plans.data?.plans ?? []).map((p) => (
                  <Row key={p.id} title={p.title} value={p.startsAt ? ios.shortDate(p.startsAt) : null} onClick={() => nav(`/plan/${p.id}`)} />
                ))}
                <Row icon={<Icon name="plus" size={20} strokeWidth={2.4} color="var(--sys-blue)" />} title={partiful.create} link onClick={() => nav(`/g/${groupId}/new-plan`)} />
              </Section>

              {/* Members: Locket's friend counter (20 → 30), WhatsApp's admin tag, Partiful's Invite */}
              <Section header={locket.friendsAllowed(d.members.length, GROUP_MAX)}>
                {d.members.map((m) => (
                  <Row key={m.user.id} icon={<Avatar user={m.user} size={32} />} sepInset={60} title={m.user.name} value={m.role === 'admin' ? whatsapp.groupAdmin : null} />
                ))}
                {d.members.length < GROUP_MAX ? (
                  <Row icon={<Icon name="personPlus" size={22} strokeWidth={2.2} color="var(--sys-blue)" />} title={partiful.invite} link onClick={() => setInvite(true)} />
                ) : (
                  <div className={s.off}>
                    <Row icon={<Icon name="personPlus" size={22} strokeWidth={2.2} />} title={partiful.invite} />
                  </div>
                )}
              </Section>

              {/* spec §C archive access: new members see from their join date unless the group votes it open (Retro keys) */}
              <Section>
                <Row
                  icon={<Icon name="key" size={18} strokeWidth={2.2} />}
                  iconBg="var(--sys-orange)"
                  sepInset={57}
                  title={<span className={s.cap}>{spec.openArchive}</span>}
                  sub={[d.archive.yes, d.archive.need].join('/')}
                  accessory={<Switch on={d.archive.mine === 1} onChange={(v) => void vote(v)} label={spec.openArchive} />}
                />
              </Section>

              <Section>
                <button className={`ios-row destructive ${s.center}`} onClick={() => setLeaveMenu(true)}>
                  {imessage.leaveConversation}
                </button>
              </Section>
            </>
          )}
        </div>
      </div>

      {g && (
        <Sheet open={invite} onClose={() => setInvite(false)} dark title={partiful.invite} leading={<button className="ios-bar-btn" onClick={() => setInvite(false)}>{ios.done}</button>}>
          <div className={s.invite}>
            <div className={s.qr}>
              <QR value={g.inviteUrl} size={200} />
            </div>
            <div className={s.link}>{g.inviteUrl}</div>
            <div className={s.buttons}>
              <Button kind="gray" onClick={() => void navigator.clipboard?.writeText(g.inviteUrl).then(() => haptic('success'))}>
                <Icon name="link" size={18} />
                {ios.copyLink}
              </Button>
              <Button onClick={() => void shareInvite(g.inviteUrl, g.name)}>
                <Icon name="share" size={18} />
                {ios.share}
              </Button>
            </div>
          </div>
        </Sheet>
      )}

      <Menu open={dayMenu} onClose={() => setDayMenu(false)} actions={ios.weekdays.map((w, i) => ({ label: w, icon: g?.ritualDay === i ? 'check' : undefined, onClick: () => void setDay(i) }))} />
      <Menu
        open={leaveMenu}
        onClose={() => setLeaveMenu(false)}
        actions={[
          { label: imessage.leaveConversation, destructive: true, onClick: () => void leave() },
          { label: ios.cancel, onClick: () => undefined },
        ]}
      />
    </Screen>
  );
}
