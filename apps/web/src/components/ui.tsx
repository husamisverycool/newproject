import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from './Icon';
import { initials } from '../lib/format';
import type { PublicUser } from '../lib/types';
import { haptic } from '../lib/feedback';

/* ───────────────────────── Wordmark: lowercase (yope) + period (BeReal.) ───────────────────────── */

export function Wordmark({ size = 28, dot = 'var(--yellow)', color = 'var(--white)' }: { size?: number; dot?: string; color?: string }) {
  return (
    <span className="wordmark" style={{ fontSize: size, color }}>
      roll<span style={{ color: dot }}>.</span>
    </span>
  );
}

/* ───────────────────────── Avatar: circle, initials fallback ───────────────────────── */

export function Avatar({ user, size = 36, ring, style }: { user: Pick<PublicUser, 'name' | 'avatar' | 'color'> | null | undefined; size?: number; ring?: string; style?: CSSProperties }) {
  if (!user) return <span className="avatar" style={{ width: size, height: size, ...style }} />;
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: user.avatar ? `center/cover url(${user.avatar})` : user.color,
        boxShadow: ring ? `0 0 0 2px var(--black), 0 0 0 ${size > 40 ? 4 : 3.5}px ${ring}` : undefined,
        fontSize: size * 0.4,
        ...style,
      }}
      aria-label={user.name}
    >
      {!user.avatar && initials(user.name)}
    </span>
  );
}

export function AvatarStack({ users, size = 24, max = 4 }: { users: (PublicUser | null | undefined)[]; size?: number; max?: number }) {
  const list = users.filter(Boolean).slice(0, max) as PublicUser[];
  return (
    <span className="avatar-stack" style={{ height: size }}>
      {list.map((u, i) => (
        <Avatar key={u.id} user={u} size={size} style={{ marginLeft: i ? -size * 0.32 : 0, boxShadow: '0 0 0 2px var(--black)' }} />
      ))}
      {users.length > max && <span className="avatar-more" style={{ height: size, minWidth: size, marginLeft: -size * 0.32 }}>+{users.length - max}</span>}
    </span>
  );
}

/* ───────────────────────── Buttons ───────────────────────── */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

/** Primary pill: Locket-yellow capsule, black label (Locket onboarding "Set up my Locket"). */
export function PillButton({ children, tone = 'yellow', className = '', onClick, ...rest }: BtnProps & { tone?: 'yellow' | 'white' | 'dark' | 'black' | 'red' }) {
  return (
    <button
      className={`pill pill-${tone} ${className}`}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Duolingo-style game button: rounded, with a darker bottom "lip" that presses in. */
export function LipButton({ children, tone = 'green', className = '', onClick, ...rest }: BtnProps & { tone?: 'green' | 'blue' | 'yellow' | 'red' | 'white' }) {
  return (
    <button
      className={`lip lip-${tone} ${className}`}
      onClick={(e) => {
        haptic('medium');
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Floating Liquid Glass circle (iOS 26) — Locket's "icons in each corner". */
export function GlassButton({ icon, label, size = 44, iconSize = 22, badge, className = '', onClick, ...rest }: Omit<BtnProps, 'children'> & { icon: string; label: string; size?: number; iconSize?: number; badge?: number | string | null }) {
  return (
    <button
      className={`glass-btn ${className}`}
      style={{ width: size, height: size }}
      aria-label={label}
      onClick={(e) => {
        haptic('light');
        onClick?.(e);
      }}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
      {badge ? <span className="badge">{badge}</span> : null}
    </button>
  );
}

export function IconButton({ icon, label, size = 36, iconSize = 20, className = '', onClick, ...rest }: Omit<BtnProps, 'children'> & { icon: string; label: string; size?: number; iconSize?: number }) {
  return (
    <button className={`icon-btn ${className}`} style={{ width: size, height: size }} aria-label={label} onClick={onClick} {...rest}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

/* ───────────────────────── Sheet (iOS bottom sheet with grabber) ───────────────────────── */

export function Sheet({ open, onClose, children, title, tone = 'dark', height }: { open: boolean; onClose: () => void; children: ReactNode; title?: ReactNode; tone?: 'dark' | 'light'; height?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className={`sheet sheet-${tone}`}
            style={{ maxHeight: height ?? '88%' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
          >
            <div className="grabber" />
            {title && <div className="sheet-title">{title}</div>}
            <div className="sheet-body scroll">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────────────────────── Small pieces ───────────────────────── */

export function Chip({ children, active, onClick, style }: { children: ReactNode; active?: boolean; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button className={`chip ${active ? 'chip-on' : ''}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function Spinner({ size = 22 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} />;
}

export function Empty({ icon, title, body, children }: { icon?: ReactNode; title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <div className="empty-title">{title}</div>
      {body && <div className="empty-body">{body}</div>}
      {children}
    </div>
  );
}

export function TopBar({ title, left, right, sub }: { title?: ReactNode; left?: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-side">{left}</div>
      <div className="topbar-title">
        {title}
        {sub && <div className="topbar-sub">{sub}</div>}
      </div>
      <div className="topbar-side topbar-right">{right}</div>
    </header>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className={`toggle ${on ? 'toggle-on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => { haptic('light'); onChange(!on); }}>
      <span className="toggle-knob" />
    </button>
  );
}

export function Row({ icon, title, sub, right, onClick, danger }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void; danger?: boolean }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp className={`row ${danger ? 'row-danger' : ''}`} onClick={onClick}>
      {icon && <span className="row-icon">{icon}</span>}
      <span className="row-text">
        <span className="row-title">{title}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </span>
      {right ?? (onClick ? <Icon name="chevronRight" size={18} color="var(--wolf)" /> : null)}
    </Comp>
  );
}

export function Section({ title, children, action }: { title?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="section">
      {(title || action) && (
        <div className="section-head">
          <span>{title}</span>
          {action}
        </div>
      )}
      <div className="section-body">{children}</div>
    </section>
  );
}

/** Streak: flame + number (BeReal / Locket). */
export function StreakBadge({ weeks, size = 14 }: { weeks: number; size?: number }) {
  if (!weeks) return null;
  return (
    <span className="streak" style={{ fontSize: size }}>
      <Icon name="flame" size={size + 2} color="var(--orange)" />
      {weeks}
    </span>
  );
}
