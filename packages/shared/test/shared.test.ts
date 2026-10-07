import { describe, expect, it } from 'vitest';
import {
  canUseLikeness,
  checkTrade,
  computeAwards,
  decidePush,
  emptyStats,
  groupStreak,
  maxTier,
  nextDevelop,
  openPack,
  ritualWindow,
  seeded,
  SLOT_ODDS,
  staminaNow,
  weekBlurred,
  weekKey,
  assignRoles,
  wallUnlocked,
  postVisibleTo,
  weeklyRecapCost,
  canBuyPaidPacks,
} from '../src/index.ts';

const NY = { timeZone: 'America/New_York', ritualDay: 0, developHour: 21 };

describe('ritual calendar', () => {
  it('keys a Wednesday post to the following Sunday', () => {
    const wed = Date.UTC(2026, 9, 7, 16, 0); // Wed Oct 7 2026, 12:00 NY
    expect(weekKey(wed, NY)).toBe('2026-10-11');
  });

  it('moves posts after develop time on ritual day to next week', () => {
    const sunLate = Date.UTC(2026, 9, 12, 2, 30); // Sun Oct 11 22:30 NY
    expect(weekKey(sunLate, NY)).toBe('2026-10-18');
    const sunEarly = Date.UTC(2026, 9, 11, 18, 0); // Sun Oct 11 14:00 NY
    expect(weekKey(sunEarly, NY)).toBe('2026-10-11');
  });

  it('develops at 21:00 local and opens at midnight', () => {
    const sunNoon = Date.UTC(2026, 9, 11, 16, 0);
    const w = ritualWindow(sunNoon, NY);
    expect(w.isOpen).toBe(true);
    expect(new Date(w.developsAt).toISOString()).toBe('2026-10-12T01:00:00.000Z');
    expect(new Date(w.opensAt).toISOString()).toBe('2026-10-11T04:00:00.000Z');
    const wed = Date.UTC(2026, 9, 7, 16, 0);
    expect(ritualWindow(wed, NY).isOpen).toBe(false);
  });

  it('handles DST transitions', () => {
    // US DST ends Sun Nov 1 2026; develop at 21:00 EST = 02:00Z next day
    const sat = Date.UTC(2026, 9, 31, 16, 0);
    expect(new Date(nextDevelop(sat, NY).at).toISOString()).toBe('2026-11-02T02:00:00.000Z');
  });
});

describe('gates and visibility', () => {
  it('unlocks the wall at 3 members', () => {
    expect(wallUnlocked(2)).toBe(false);
    expect(wallUnlocked(3)).toBe(true);
  });
  it('blurs only the current week until you post', () => {
    expect(weekBlurred({ weekKey: 'a', currentWeekKey: 'a', viewerPostedThisWeek: false })).toBe(true);
    expect(weekBlurred({ weekKey: 'a', currentWeekKey: 'a', viewerPostedThisWeek: true })).toBe(false);
    expect(weekBlurred({ weekKey: 'old', currentWeekKey: 'a', viewerPostedThisWeek: false })).toBe(false);
  });
  it('hides pre-join posts unless the archive is open', () => {
    expect(postVisibleTo({ createdAt: 5 }, { joinedAt: 10 }, { archiveOpen: false })).toBe(false);
    expect(postVisibleTo({ createdAt: 5 }, { joinedAt: 10 }, { archiveOpen: true })).toBe(true);
  });
});

describe('likeness consent', () => {
  const owner = { id: 'o', likenessScope: 'my_groups' as const, likenessAllow: [] };
  it('always lets you use your own likeness', () => {
    expect(canUseLikeness({ owner: { ...owner, likenessScope: 'no_one' }, actorId: 'o', groupId: 'g', ownerGroupIds: ['g'], actorGroupIds: ['g'] }).ok).toBe(true);
  });
  it('blocks "Only Me"', () => {
    const r = canUseLikeness({ owner: { ...owner, likenessScope: 'no_one' }, actorId: 'a', groupId: 'g', ownerGroupIds: ['g'], actorGroupIds: ['g'] });
    expect(r).toEqual({ ok: false, reason: 'scope_no_one' });
  });
  it('requires a shared group', () => {
    expect(canUseLikeness({ owner, actorId: 'a', groupId: 'g', ownerGroupIds: ['g'], actorGroupIds: ['h'] }).ok).toBe(false);
    expect(canUseLikeness({ owner, actorId: 'a', groupId: 'g', ownerGroupIds: ['g'], actorGroupIds: ['g'] }).ok).toBe(true);
  });
  it('honours the approved list', () => {
    const o = { ...owner, likenessScope: 'specific_friends' as const, likenessAllow: ['b'] };
    expect(canUseLikeness({ owner: o, actorId: 'a', groupId: 'g', ownerGroupIds: ['g'], actorGroupIds: ['g'] }).ok).toBe(false);
    expect(canUseLikeness({ owner: o, actorId: 'b', groupId: 'g', ownerGroupIds: ['g'], actorGroupIds: ['g'] }).ok).toBe(true);
  });
});

describe('push policy', () => {
  const base = { seen: new Set<string>(), history: [], localHour: 14, weekStart: 0 };
  it('never sends without new content', () => {
    expect(decidePush({ userId: 'u', groupId: 'g', kind: 'new_posts', refIds: [], now: 1 }, base)).toEqual({ send: false, reason: 'no_new_content' });
    expect(decidePush({ userId: 'u', groupId: 'g', kind: 'new_posts', refIds: ['p'], now: 1 }, { ...base, seen: new Set(['p']) }).send).toBe(false);
  });
  it('limits the ritual push to once a week', () => {
    const ctx = { ...base, history: [{ kind: 'ritual_open' as const, groupId: 'g', createdAt: 10 }] };
    expect(decidePush({ userId: 'u', groupId: 'g', kind: 'ritual_open', refIds: ['w'], now: 20 }, ctx).send).toBe(false);
  });
  it('respects quiet hours', () => {
    expect(decidePush({ userId: 'u', groupId: 'g', kind: 'reaction', refIds: ['r'], now: 1 }, { ...base, localHour: 23 }).send).toBe(false);
  });
});

describe('cards', () => {
  it('slot odds sum to 100', () => {
    for (const odds of Object.values(SLOT_ODDS)) {
      const sum = Object.values(odds).reduce((a, b) => a + (b ?? 0), 0);
      expect(sum).toBeCloseTo(100, 3);
    }
  });

  it('assigns max tiers to moments', () => {
    const s = { kind: 'photo' as const, ritual: false, hasLive: false, hasCaption: false, hasVoice: false, inPlanAlbum: false, remembered: false, frame: null };
    expect(maxTier(s)).toBe('common');
    expect(maxTier({ ...s, ritual: true })).toBe('rare');
    expect(maxTier({ ...s, kind: 'dual' })).toBe('holo');
    expect(maxTier({ ...s, hasLive: true })).toBe('immersive');
  });

  it('opens five cards with three commons and downgrades when no moment qualifies', () => {
    const rng = seeded('pack');
    const pool = [
      { postId: 'a', maxTier: 'common' as const, inSet: true },
      { postId: 'b', maxTier: 'rare' as const, inSet: true },
    ];
    for (let i = 0; i < 50; i++) {
      const r = openPack(pool, rng);
      expect(r.cards).toHaveLength(5);
      expect(r.cards.slice(0, 3).every((c) => c.rarity === 'common')).toBe(true);
      expect(r.cards.every((c) => c.rarity === 'common' || c.rarity === 'rare')).toBe(true);
    }
  });

  it('roughly matches the published slot-5 holo rate', () => {
    const rng = seeded('rates');
    const pool = [{ postId: 'x', maxTier: 'immersive' as const, inSet: true }];
    let holo = 0;
    const N = 20000;
    for (let i = 0; i < N; i++) if (openPack(pool, rng).cards[4].rarity === 'holo') holo++;
    expect(holo / N).toBeGreaterThan(0.11);
    expect(holo / N).toBeLessThan(0.14);
  });

  it('enforces same-rarity, ritual-window and Shinedust rules', () => {
    const base = { fromUserId: 'a', toUserId: 'b', stamina: 1, dust: 10_000, ritualOpen: false };
    expect(checkTrade({ ...base, offer: 'rare', want: 'holo' })).toEqual({ ok: false, reason: 'rarity_mismatch' });
    expect(checkTrade({ ...base, offer: 'holo', want: 'holo' })).toEqual({ ok: false, reason: 'ritual_window' });
    expect(checkTrade({ ...base, offer: 'holo', want: 'holo', ritualOpen: true })).toEqual({ ok: true, dust: 4000 });
    expect(checkTrade({ ...base, offer: 'rare', want: 'rare', dust: 100 })).toEqual({ ok: false, reason: 'no_dust' });
    expect(checkTrade({ ...base, offer: 'common', want: 'common', stamina: 0 })).toEqual({ ok: false, reason: 'no_stamina' });
  });

  it('regenerates stamina on schedule and caps it', () => {
    const h = 3_600_000;
    expect(staminaNow({ value: 2, at: 0 }, 5, 12 * h, 25 * h)).toEqual({ value: 4, at: 24 * h });
    expect(staminaNow({ value: 4, at: 0 }, 5, 12 * h, 100 * h).value).toBe(5);
  });
});

describe('awards and roles', () => {
  it('only awards eligible superlatives and changes with the session seed', () => {
    const a = { ...emptyStats('a'), posts: 9, sunrisePosts: 2, voicePosts: 3 };
    const b = { ...emptyStats('b'), posts: 4, latePosts: 5, rewindPosts: 2, dualPosts: 1 };
    const r1 = computeAwards([a, b], 's1', 3).map((x) => x.id);
    expect(r1).toHaveLength(3);
    expect(r1).not.toContain('dinner_table');
    const variants = new Set(Array.from({ length: 10 }, (_, i) => computeAwards([a, b], `s${i}`, 3).map((x) => x.id).join()));
    expect(variants.size).toBeGreaterThan(1);
  });
  it('gives every member exactly one role', () => {
    const stats = ['a', 'b', 'c', 'd'].map((id, i) => ({ ...emptyStats(id), posts: i * 3, voicePosts: 3 - i, invites: i === 2 ? 4 : 0 }));
    const roles = assignRoles(stats);
    expect(Object.keys(roles)).toHaveLength(4);
    expect(new Set(Object.values(roles).map((r) => r.id)).size).toBe(4);
  });
});

describe('streaks, costs and age', () => {
  it('counts consecutive weeks meeting the threshold', () => {
    const m = new Map<string, Set<string>>([
      ['2026-10-11', new Set(['a'])],
      ['2026-10-04', new Set(['a', 'b'])],
      ['2026-09-27', new Set(['a', 'b', 'c'])],
      ['2026-09-20', new Set(['a'])],
    ]);
    const s = groupStreak(m, 4, '2026-10-11');
    expect(s.weeks).toBe(2);
    expect(s.atRisk).toBe(true);
  });
  it('prices a weekly recap at about $0.40', () => {
    expect(weeklyRecapCost().week).toBeCloseTo(0.402, 3);
  });
  it('gates paid packs to verified adults', () => {
    const now = Date.UTC(2026, 9, 7);
    expect(canBuyPaidPacks({ isAdult: true, birthYear: 2000 }, now)).toBe(true);
    expect(canBuyPaidPacks({ isAdult: false, birthYear: 2000 }, now)).toBe(false);
    expect(canBuyPaidPacks({ isAdult: true, birthYear: 2012 }, now)).toBe(false);
  });
});
