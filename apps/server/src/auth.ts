import { nanoid } from 'nanoid';
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { get, now, run } from './db.ts';
import { getUser, type UserFull } from './repo.ts';
import { platform } from './platform.ts';

const COOKIE = 'roll_sid';

export function createSession(userId: string) {
  if (platform.userIdFor) return '';
  const sid = nanoid(32);
  run('INSERT INTO sessions (id, user_id, created_at) VALUES (?, ?, ?)', sid, userId, now());
  return sid;
}

export function setSessionCookie(c: Context, sid: string) {
  if (platform.userIdFor) return;
  setCookie(c, COOKIE, sid, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
}

export function clearSession(c: Context) {
  const sid = getCookie(c, COOKIE);
  if (sid) run('DELETE FROM sessions WHERE id = ?', sid);
  deleteCookie(c, COOKIE, { path: '/' });
}

function userForSid(sid: string | undefined): UserFull | null {
  if (!sid) return null;
  const s = get<{ user_id: string }>('SELECT user_id FROM sessions WHERE id = ?', sid);
  return s ? getUser(s.user_id) : null;
}

export function currentUser(c: Context) {
  if (platform.userIdFor) {
    const uid = platform.userIdFor(c);
    return uid ? getUser(uid) : null;
  }
  return userForSid(getCookie(c, COOKIE));
}

export function userFromCookieHeader(header: string | undefined) {
  if (!header) return null;
  const m = header.split(/;\s*/).find((p) => p.startsWith(`${COOKIE}=`));
  return userForSid(m?.slice(COOKIE.length + 1));
}

/** Guest identity for the join page (spec §A2: view and react without an account). */
export function guestId(c: Context) {
  if (platform.userIdFor) return platform.userIdFor(c) ?? 'guest';
  let g = getCookie(c, 'roll_guest');
  if (!g) {
    g = nanoid(16);
    setCookie(c, 'roll_guest', g, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 90 });
  }
  return g;
}
