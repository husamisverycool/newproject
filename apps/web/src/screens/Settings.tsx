import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { PLANS, PLAN_NAMES, QUIET_HOURS, ios, snapchat, sora, spec, type LikenessScope } from '@app/shared';
import { Alert, Button, NavBar, Row, Screen, Section, Sheet, Spinner, Switch } from '../components/ios';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { api, downloadBlob } from '../lib/api';
import { bytes } from '../lib/format';
import { haptic } from '../lib/feedback';
import { queryClient, useConfig, useMe } from '../lib/queries';
import type { GroupSummary, Me, MeResponse } from '../lib/types';
import s from './settings.module.css';

/**
 * Settings, reached from the gear on the profile (Retro [I] retro-02). A stock iOS inset grouped list
 * [HIG]; Locket's and BeReal's own settings labels are UNKNOWN (research/10, research/11), so rows use
 * Apple's names except where a source names the thing:
 * - the plan row: Locket's "Locket Gold" profile-menu row [V-weak], named by the plan (spec §U);
 * - notifications: Settings › Notifications "Allow Notifications", the "Live Activities" switch (Locket
 *   Rollcall [V]), and Focus "Do Not Disturb" with the quiet-hours schedule the server enforces [HIG];
 * - likeness consent: spec §S, with Sora's cameo options as the value [V];
 * - storage: iPhone Storage rows [HIG] per group (spec §T) and Snapchat's "Memories Storage Plans" [V];
 * - export: Snapchat's Settings › "My Data" flow [V-weak] (spec §Q full export in every tier);
 * - Sign Out [HIG] and Delete Account (App Review 5.1.1(v)) [HIG].
 */

const SCOPE_LABEL: Record<LikenessScope, string> = { no_one: sora.onlyMe, my_groups: sora.myGroups, specific_friends: sora.peopleIApprove, everyone: sora.everyone };

const atHour = (h: number) => new Date(2000, 0, 1, h).getTime();

function urlB64ToBytes(b64: string) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Web Push opt-in/out for "Allow Notifications". The in-app list keeps every notification either way. */
async function setPush(on: boolean, vapid: string | undefined) {
  const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration().catch(() => undefined) : undefined;
  if (on) {
    if ('Notification' in window && Notification.permission !== 'granted') {
      const p = await Notification.requestPermission().catch(() => 'denied' as NotificationPermission);
      if (p !== 'granted') return false;
    }
    if (reg && vapid && 'PushManager' in window) {
      try {
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToBytes(vapid) });
        await api.post('/me/push', sub.toJSON());
      } catch {
        /* subscription unavailable: keep the preference only */
      }
    }
  } else {
    const sub = await reg?.pushManager.getSubscription().catch(() => null);
    await sub?.unsubscribe().catch(() => undefined);
  }
  return true;
}

function getStorage(groupId: string) {
  return () => api.get<{ used: number; budget: number | null }>(`/groups/${groupId}/storage`);
}

export default function Settings() {
  const nav = useNavigate();
  const me = useMe();
  const config = useConfig();
  const user = me.data?.user;
  const groups = me.data?.groups ?? [];
  const [myData, setMyData] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const storage = useQueries({
    queries: groups.map((g) => ({
      queryKey: ['storage', g.id],
      queryFn: getStorage(g.id),
    })),
  });

  /** Optimistic PATCH /me: the switch moves at once, the server confirms. */
  const patch = async (body: { settings?: Partial<Me['settings']>; autoAiCreations?: boolean }) => {
    queryClient.setQueryData<MeResponse>(['me'], (d) =>
      d ? { ...d, user: { ...d.user, ...(body.autoAiCreations === undefined ? null : { autoAiCreations: body.autoAiCreations }), settings: { ...d.user.settings, ...body.settings } } } : d,
    );
    await api.patch('/me', body);
    void queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const togglePush = async (on: boolean) => {
    const ok = await setPush(on, config.data?.vapidPublicKey);
    if (ok) await patch({ settings: { pushEnabled: on } });
  };

  const signOut = async () => {
    setBusy(true);
    await api.post('/auth/logout').catch(() => undefined);
    queryClient.clear();
    nav('/welcome', { replace: true });
  };

  const deleteAccount = async () => {
    setConfirmDelete(false);
    setBusy(true);
    haptic('heavy');
    await api.del('/me').catch(() => undefined);
    queryClient.clear();
    nav('/welcome', { replace: true });
  };

  const settings = user?.settings ?? {};
  const quiet = settings.quietHours !== false;
  const plan = user?.plan ?? 'free';

  return (
    <Screen grouped>
      <NavBar onBack={() => nav(-1)} title={ios.settings} />
      <div className={s.scroll}>
        {!user ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* Locket: profile menu → "Locket Gold" [V-weak]; our plan names (spec §U) */}
            <Section>
              <Row
                icon={<Icon name="crown" size={18} strokeWidth={2.2} />}
                iconBg="var(--locket-yellow)" sepInset={57}
                title={PLAN_NAMES.plus}
                value={plan === 'free' ? null : PLANS[plan].name}
                onClick={() => nav('/plans')}
              />
            </Section>

            {/* Settings › Notifications [HIG]; quiet hours = Focus "Do Not Disturb" with the server's schedule */}
            <Section header={ios.notifications}>
              <Row icon={<Icon name="bell" size={18} strokeWidth={2.2} />} iconBg="var(--sys-red)" sepInset={57} title={ios.allowNotifications} accessory={<Switch on={Boolean(settings.pushEnabled)} onChange={(v) => void togglePush(v)} label={ios.allowNotifications} />} />
              <Row icon={<Icon name="live" size={18} strokeWidth={2.2} />} iconBg="var(--sys-green)" sepInset={57} title={ios.liveActivities} accessory={<Switch on={Boolean(settings.liveActivities)} onChange={(v) => void patch({ settings: { liveActivities: v } })} label={ios.liveActivities} />} />
              <Row
                icon={<Icon name="moon" size={17} />}
                iconBg="var(--sys-indigo)" sepInset={57}
                title={ios.doNotDisturb}
                sub={ios.timeRange(ios.time(atHour(QUIET_HOURS.start)), ios.time(atHour(QUIET_HOURS.end)))}
                accessory={<Switch on={quiet} onChange={(v) => void patch({ settings: { quietHours: v } })} label={ios.doNotDisturb} />}
              />
            </Section>

            {/* spec §S likeness consent (Sora cameo options [V]); spec §G per-user AI toggle */}
            <Section>
              <Row icon={<Icon name="person" size={18} strokeWidth={2.2} />} iconBg="var(--sys-blue)" sepInset={57} title={spec.likeness} value={SCOPE_LABEL[user.likenessScope]} onClick={() => nav('/me/likeness')} />
              <Row icon={<Icon name="sparkles" size={18} strokeWidth={2.2} />} iconBg="var(--sys-purple)" sepInset={57} title={spec.autoCreations} accessory={<Switch on={user.autoAiCreations} onChange={(v) => void patch({ autoAiCreations: v })} label={spec.autoCreations} />} />
            </Section>

            {/* iPhone Storage rows per group (spec §T budgets storage per group) + Snapchat's plans [V] */}
            {groups.length > 0 && (
              <Section header={ios.storage}>
                {groups.map((g, i) => (
                  <StorageRow key={g.id} group={g} data={storage[i]?.data} />
                ))}
                <Row title={snapchat.storagePlans} link onClick={() => nav('/plans#storage')} />
              </Section>
            )}

            {/* Snapchat Settings › "My Data" [V-weak] */}
            <Section>
              <Row icon={<Icon name="download" size={18} strokeWidth={2.2} />} iconBg="var(--sys-gray)" sepInset={57} title={snapchat.myData} onClick={() => setMyData(true)} />
            </Section>

            <Section>
              <button className={`ios-row destructive ${s.center}`} onClick={signOut} disabled={busy}>
                {ios.signOut}
              </button>
            </Section>
            <Section>
              <button className={`ios-row destructive ${s.center}`} onClick={() => setConfirmDelete(true)} disabled={busy}>
                {ios.deleteAccount}
              </button>
            </Section>
          </>
        )}
      </div>

      <MyDataSheet open={myData} onClose={() => setMyData(false)} groups={groups} />

      {/* HIG: an irreversible action gets an alert with Cancel and a destructive button */}
      <Alert
        open={confirmDelete}
        title={ios.deleteAccount}
        onDismiss={() => setConfirmDelete(false)}
        actions={[
          { label: ios.cancel, onClick: () => setConfirmDelete(false) },
          { label: ios.delete, destructive: true, onClick: () => void deleteAccount() },
        ]}
      />
    </Screen>
  );
}

function GroupIcon({ group }: { group: GroupSummary }) {
  return (
    <span className={s.appIcon}>
      <Mascot species={group.mascot.species} level={group.mascot.stage.level} outfit={group.mascot.outfit} size={30} />
    </span>
  );
}

function StorageRow({ group, data }: { group: GroupSummary; data?: { used: number; budget: number | null } }) {
  const pct = data?.budget ? Math.min(100, (data.used / data.budget) * 100) : null;
  return (
    <Row
      icon={<GroupIcon group={group} />}
      sepInset={57}
      title={group.name}
      sub={
        pct !== null ? (
          <span className={s.bar}>
            <i style={{ width: `${pct}%` }} />
          </span>
        ) : undefined
      }
      value={data ? bytes(data.used) : <Spinner size={14} />}
    />
  );
}

/**
 * Snapchat "My Data" [V-weak]: choose what to include (Memories, JSON Files), the range "All Time", then
 * "Submit". Our export always holds every photo and a JSON index (spec §Q), so those two are shown as
 * included rather than as switches; HTML Files is not produced and is left out.
 */
function MyDataSheet({ open, onClose, groups }: { open: boolean; onClose: () => void; groups: GroupSummary[] }) {
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const gid = pick ?? groups[0]?.id ?? null;

  const submit = async () => {
    const g = groups.find((x) => x.id === gid);
    if (!g) return;
    setBusy(true);
    try {
      const blob = await api.blob(`/groups/${g.id}/export`);
      await downloadBlob(blob, `${g.name}.zip`);
      haptic('success');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  function check(on: boolean): ReactNode {
    if (!on) return null;
    return <Icon name="check" size={20} strokeWidth={2.4} className={s.check} />;
  }

  return (
    <Sheet open={open} onClose={onClose} title={snapchat.myData} leading={<button className="ios-bar-btn" onClick={onClose}>{ios.cancel}</button>}>
      <div className={s.sheetPad}>
        <Section>
          <Row title={snapchat.exportMemories} accessory={check(true)} />
          <Row title={snapchat.jsonFiles} accessory={check(true)} />
        </Section>
        <Section>
          <Row title={snapchat.allTime} accessory={check(true)} />
        </Section>
        {groups.length > 1 && (
          <Section>
            {groups.map((g) => (
              <Row key={g.id} icon={<GroupIcon group={g} />} sepInset={57} title={g.name} chevron={false} accessory={check(g.id === gid)} onClick={() => setPick(g.id)} />
            ))}
          </Section>
        )}
        <Button block onClick={submit} disabled={busy || !gid} style={{ marginTop: 4 }}>
          {busy ? <Spinner size={18} /> : snapchat.submit}
        </Button>
      </div>
    </Sheet>
  );
}
