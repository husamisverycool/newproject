import { BRAND, BACKDROPS } from '@app/shared';

/**
 * Wordmark: lowercase like "yope" [V], trailing period like "BeReal." [V], set as BeReal's "white name"
 * in a bold sans [V-weak]; the face is the system font (SF Pro on iPhone) [HIG].
 */
export function Wordmark({ size = 28, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <span style={{ font: `700 ${size}px/1 var(--font-sf)`, letterSpacing: '-0.03em', color, display: 'inline-block' }}>{BRAND.name}</span>
  );
}

/** App icon: BeReal's pattern — "a black square with rounded corners, with the name and its ending period centered in it" [V]. iOS icon corner ≈ 22.37% [HIG]. */
/** The app icon; `iconId` is an equipped Locket Gold "Custom app icons" color (Shop `icon_<color>` [V]), drawn like its Shop preview. */
export function AppIcon({ size = 60, iconId }: { size?: number; iconId?: string | null }) {
  const c = iconId ? BACKDROPS.find((b) => `icon_${b.id}` === iconId) : undefined;
  const background = c ? `radial-gradient(circle at 50% 35%, ${c.from}, ${c.to})` : '#000';
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.2237, background, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.18)', flex: 'none' }}>
      <Wordmark size={size * 0.3} color="#fff" />
    </span>
  );
}
