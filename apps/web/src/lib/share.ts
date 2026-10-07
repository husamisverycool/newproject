import { api, downloadBlob } from './api';
import { LIVE } from './static';

/**
 * Sharing and saving. On the web the app shares links to its own server; in the in-Claude build
 * there is no server URL to share, so the photo itself is shared or saved (through the artifact's
 * download confirmation where the page may not save files directly).
 */

/** The address friends open: the site, or the artifact's link in the in-Claude build. */
export function appUrl() {
  return LIVE ? (import.meta.env.VITE_LIVE_URL ?? '') : location.origin;
}

export function canShare() {
  return LIVE || typeof navigator.share === 'function';
}

/** Share a post's exported photo (with its watermark and provenance). */
export async function sharePost(postId: string) {
  if (!LIVE) {
    if (typeof navigator.share === 'function') await navigator.share({ url: `${location.origin}/api/posts/${postId}/export` }).catch(() => undefined);
    return;
  }
  const blob = await api.blob(`/posts/${postId}/export`);
  await downloadBlob(blob, `roll-${postId}.${blob.type.includes('png') ? 'png' : 'jpg'}`);
}

/** Save a post's exported photo. */
export async function savePost(postId: string) {
  if (!LIVE) {
    window.open(`/api/posts/${postId}/export`, '_blank');
    return;
  }
  const blob = await api.blob(`/posts/${postId}/export`);
  await downloadBlob(blob, `roll-${postId}.${blob.type.includes('png') ? 'png' : 'jpg'}`);
}

/** Share a link (profile, Wrapped party). */
export async function shareLink(url: string, text?: string) {
  if (!url) return;
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ url, text });
      return;
    } catch {
      /* fall back to the clipboard */
    }
  }
  await navigator.clipboard?.writeText(text ? `${text} ${url}` : url).catch(() => undefined);
}
