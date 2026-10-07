import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ios } from '@app/shared';
import { Icon } from './Icon';
import { initials } from '../lib/format';
import type { PublicUser } from '../lib/types';
import { haptic } from '../lib/feedback';

/**
 * Stock iOS controls [HIG]. Wording passed in comes from the source decks; the only built-in
 * labels are Apple's standard ones (ios deck).
 */

export function Screen({ children, grouped, dark, light, className = '', style }: { children: ReactNode; grouped?: boolean; dark?: boolean; light?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={`ios-screen ${grouped ? 'grouped' : ''} ${className}`} data-dark={dark || undefined} data-light={light || undefined} style={style}>
      {children}
    </div>
  );
}

/** Navigation bar: back chevron + label on the leading side, centred title, trailing items [HIG]. */
export function NavBar({ title, back, onBack, trailing, leading }: { title?: ReactNode; back?: string; onBack?: () => void; trailing?: ReactNode; leading?: ReactNode }) {
  return (
    <header className="ios-nav">
      <div className="ios-nav-side">
        {onBack && (
          <button className="ios-bar-btn" onClick={onBack} aria-label={back ?? ios.back}>
            <Icon name="chevronLeft" size={24} strokeWidth={2.4} />
            {back && <span>{back}</span>}
          </button>
        )}
        {leading}
      </div>
      <div className="ios-nav-title">{title}</div>
      <div className="ios-nav-side end">{trailing}</div>
    </header>
  );
}

export function BarButton({ children, onClick, bold, disabled, label }: { children: ReactNode; onClick?: () => void; bold?: boolean; disabled?: boolean; label?: string }) {
  return (
    <button className={`ios-bar-btn ${bold ? 'bold' : ''}`} onClick={onClick} disabled={disabled} aria-label={label}>
      {children}
    </button>
  );
}

export function GlassCircle({ icon, label, onClick, size = 44, iconSize = 20, badge, style }: { icon: string; label: string; onClick?: () => void; size?: number; iconSize?: number; badge?: number | null; style?: CSSProperties }) {
  return (
    <button className="ios-glass-circle" style={{ width: size, height: size, position: 'relative', ...style }} onClick={() => { haptic('light'); onClick?.(); }} aria-label={label}>
      <Icon name={icon} size={iconSize} />
      {badge ? <span className="ios-badge">{badge}</span> : null}
    </button>
  );
}

export function LargeTitle({ children }: { children: ReactNode }) {
  return <h1 className="ios-large-title" style={{ margin: 0 }}>{children}</h1>;
}

export function Section({ header, footer, children, style }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <section className="ios-section" style={style}>
      {header && <div className="ios-section-head">{header}</div>}
      <div className="ios-group">{children}</div>
      {footer && <div className="ios-section-foot">{footer}</div>}
    </section>
  );
}

export function Row({ icon, iconBg, title, sub, value, onClick, chevron, accessory, destructive, link, sepInset }: {
  icon?: ReactNode; iconBg?: string; title: ReactNode; sub?: ReactNode; value?: ReactNode; onClick?: () => void; chevron?: boolean; accessory?: ReactNode; destructive?: boolean; link?: boolean; sepInset?: number;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp className={`ios-row ${destructive ? 'destructive' : ''} ${link ? 'link' : ''}`} onClick={onClick} style={sepInset ? ({ '--sep-inset': `${sepInset}px` } as CSSProperties) : undefined}>
      {icon && (iconBg ? <span className="ios-row-icon" style={{ background: iconBg }}>{icon}</span> : icon)}
      <span className="ios-row-text">
        <span>{title}</span>
        {sub && <span className="ios-row-sub">{sub}</span>}
      </span>
      {value != null && <span className="ios-row-value">{value}</span>}
      {accessory}
      {(chevron ?? (Boolean(onClick) && !destructive && !link)) && <Icon name="chevronRight" size={16} strokeWidth={2.6} className="ios-chevron" />}
    </Comp>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button className="ios-switch" role="switch" aria-checked={on} aria-label={label} onClick={() => { haptic('light'); onChange(!on); }} />;
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="ios-segmented">
      {options.map((o) => (
        <button key={o.id} aria-pressed={o.id === value} onClick={() => { haptic('light'); onChange(o.id); }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Button({ children, kind = 'filled', block, small, onClick, disabled, style, color }: { children: ReactNode; kind?: 'filled' | 'tinted' | 'gray'; block?: boolean; small?: boolean; onClick?: () => void; disabled?: boolean; style?: CSSProperties; color?: string }) {
  return (
    <button
      className={`ios-btn ${kind} ${block ? 'block' : ''} ${small ? 'small' : ''}`}
      onClick={() => { haptic('light'); onClick?.(); }}
      disabled={disabled}
      style={color ? { ...(kind === 'filled' ? { background: color } : { color, background: `color-mix(in srgb, ${color} 15%, transparent)` }), ...style } : style}
    >
      {children}
    </button>
  );
}

/** Bottom sheet with grabber, drag-to-dismiss [HIG]. */
export function Sheet({ open, onClose, title, leading, trailing, children, height, dark, light }: {
  open: boolean; onClose: () => void; title?: ReactNode; leading?: ReactNode; trailing?: ReactNode; children: ReactNode; height?: string; dark?: boolean; light?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="ios-sheet-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="ios-sheet"
            data-dark={dark || undefined}
            data-light={light || undefined}
            style={{ height }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 42 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            role="dialog"
            aria-modal
          >
            <div className="ios-grabber" />
            {(title || leading || trailing) && (
              <div className="ios-sheet-head">
                <div className="ios-nav-side">{leading}</div>
                <div className="ios-nav-title">{title}</div>
                <div className="ios-nav-side end">{trailing}</div>
              </div>
            )}
            <div className="ios-sheet-body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface AlertAction {
  label: string;
  onClick: () => void;
  preferred?: boolean;
  destructive?: boolean;
}

/** UIAlertController-style alert [HIG]. */
export function Alert({ open, title, message, actions, onDismiss }: { open: boolean; title: string; message?: string; actions: AlertAction[]; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ios-alert-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onDismiss}>
          <motion.div className="ios-alert" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} role="alertdialog">
            <div className="ios-alert-text">
              <div className="ios-alert-title">{title}</div>
              {message && <div className="ios-alert-msg">{message}</div>}
            </div>
            <div className={`ios-alert-actions ${actions.length > 2 ? 'stacked' : ''}`}>
              {actions.map((a) => (
                <button key={a.label} className={`${a.preferred ? 'preferred' : ''} ${a.destructive ? 'destructive' : ''}`} onClick={a.onClick}>
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface MenuAction {
  label: string;
  icon?: string;
  onClick: () => void;
  destructive?: boolean;
}

/** Context menu / action list [HIG]. */
export function Menu({ open, onClose, actions, anchor = 'bottom' }: { open: boolean; onClose: () => void; actions: MenuAction[]; anchor?: 'top' | 'bottom' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ios-alert-scrim" style={{ alignItems: anchor === 'top' ? 'flex-start' : 'flex-end', padding: '80px 16px calc(var(--safe-bottom) + 90px)', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.12)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="ios-menu" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 34 }} onClick={(e) => e.stopPropagation()}>
            {actions.map((a, i) => (
              <button key={`${i}-${a.label}`} className={a.destructive ? 'destructive' : ''} onClick={() => { onClose(); a.onClick(); }}>
                <span>{a.label}</span>
                {a.icon && <Icon name={a.icon} size={19} />}
              </button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TabBar<T extends string>({ value, tabs, onChange }: { value: T; tabs: { id: T; label: string; icon: string }[]; onChange: (v: T) => void }) {
  return (
    <nav className="ios-tabbar" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} className="ios-tab" role="tab" aria-selected={t.id === value} onClick={() => { haptic('light'); onChange(t.id); }}>
          <Icon name={t.icon} size={24} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/** Circle avatar; Contacts-style monogram when there's no photo [HIG]. */
export function Avatar({ user, size = 36, ring, style }: { user: Pick<PublicUser, 'name' | 'avatar'> | null | undefined; size?: number; ring?: string; style?: CSSProperties }) {
  return (
    <span
      className="ios-avatar"
      aria-label={user?.name}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        ...(user?.avatar ? { background: `center/cover url(${user.avatar})` } : null),
        ...(ring ? { boxShadow: `0 0 0 2px var(--sys-bg), 0 0 0 4px ${ring}` } : null),
        ...style,
      }}
    >
      {user && !user.avatar && initials(user.name)}
    </span>
  );
}

export function AvatarStack({ users, size = 24, max = 4, edge = 'var(--sys-bg)' }: { users: (PublicUser | null | undefined)[]; size?: number; max?: number; edge?: string }) {
  const list = users.filter(Boolean).slice(0, max) as PublicUser[];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {list.map((u, i) => (
        <Avatar key={u.id} user={u} size={size} style={{ marginLeft: i ? -size * 0.3 : 0, boxShadow: `0 0 0 2px ${edge}` }} />
      ))}
    </span>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return <span className="ios-spinner" style={{ width: size, height: size, display: 'inline-block' }} />;
}
