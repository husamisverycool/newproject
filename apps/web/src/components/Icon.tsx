import type { CSSProperties } from 'react';

/**
 * Glyphs drawn to sit with SF Symbols, the system icon set of the native-iOS sources (Locket's
 * "lightning bolt" flash and "arrow" flip, BeReal's three dots). 24×24, 2px rounded strokes.
 */
const P: Record<string, string> = {
  bolt: 'M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z',
  boltOff: 'M13 2 9.6 6.6M7.6 9.3 4.5 13.5H11L10 22l4.2-5.7M16.3 13.3 18.5 10.5H14M3 3l18 18',
  flip: 'M4 12a8 8 0 0 1 13.7-5.6M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6M4 20v-4h4',
  chat: 'M20.5 12c0 4.4-3.8 8-8.5 8-1.4 0-2.7-.3-3.9-.8L3.5 20.5l1.3-3.8C3.9 15.4 3.5 13.8 3.5 12c0-4.4 3.8-8 8.5-8s8.5 3.6 8.5 8Z',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c.8-3.6 3.9-6 7.5-6s6.7 2.4 7.5 6',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.6-3.2 3.3-5.5 6.5-5.5s5.9 2.3 6.5 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.6c1.9.8 3.2 2.9 3.5 5.4',
  chevronDown: 'm6 9 6 6 6-6',
  chevronUp: 'm6 15 6-6 6 6',
  chevronLeft: 'm15 6-6 6 6 6',
  chevronRight: 'm9 6 6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  send: 'M12 19V5M5 12l7-7 7 7',
  plus: 'M12 5v14M5 12h14',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7.6 7.6 0 0 1-2.2 1.3l-.3 2H10.4l-.3-2a7.6 7.6 0 0 1-2.2-1.3l-1.9.7-2-3.4 1.6-1.2a7.7 7.7 0 0 1 0-2.6L4 9.7l2-3.4 1.9.7c.7-.6 1.4-1 2.2-1.3l.3-2h3.2l.3 2c.8.3 1.5.7 2.2 1.3l1.9-.7 2 3.4-1.6 1.2c.1.9.1 1.7 0 2.6Z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0',
  photo: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM4 16l4.5-4.5 4 4 2.5-2.5L20 18M15.5 9.5h.01',
  photos: 'M7 3.5h10a3 3 0 0 1 3 3v10M4 8.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10ZM4 17l4-4 3.5 3.5L14 14l3 3',
  sparkles: 'M10 3l1.7 4.8L16.5 9.5l-4.8 1.7L10 16l-1.7-4.8L3.5 9.5l4.8-1.7L10 3ZM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3',
  play: 'M7 4.5v15l12-7.5-12-7.5Z',
  pause: 'M8 5v14M16 5v14',
  shuffle: 'M3 7h3.5c4 0 6.5 10 11 10H21M18 14l3 3-3 3M3 17h3.5c1.4 0 2.6-1.2 3.6-2.8M14 9.6c1-1.5 2.1-2.6 3.5-2.6H21M18 4l3 3-3 3',
  share: 'M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12',
  trash: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6',
  heart: 'M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.4-7.5 10-7.5 10Z',
  lock: 'M6.5 11h11v9.5h-11V11ZM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  key: 'M14.5 13a4.5 4.5 0 1 0-4.2-2.9L3 17.4V21h3.6v-2.4H9v-2.4h2.4l1.2-1.2c.6.6 1.2 1 1.9 1',
  film: 'M4 4h16v16H4V4ZM8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4',
  cards: 'M8 3.5h9A2.5 2.5 0 0 1 19.5 6v12M5 7.5h9A1.5 1.5 0 0 1 15.5 9v10.5A1.5 1.5 0 0 1 14 21H5a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 5 7.5Z',
  game: 'M7 8h10a4 4 0 0 1 4 4.5l-.6 4a2.6 2.6 0 0 1-4.6 1.2L14 15.5h-4l-1.8 2.2a2.6 2.6 0 0 1-4.6-1.2l-.6-4A4 4 0 0 1 7 8ZM8 11v3M6.5 12.5h3M15.5 11.5h.01M17.5 13.5h.01',
  gift: 'M4 10h16v3H4v-3ZM5.5 13h13v8h-13v-8ZM12 10v11M12 10S10.5 4 8 5.5 9 10 12 10ZM12 10s1.5-6 4-4.5S15 10 12 10Z',
  calendar: 'M4.5 6.5h15v13h-15v-13ZM4.5 10.5h15M8.5 4v4M15.5 4v4',
  pin: 'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  camera: 'M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  grid: 'M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7ZM13 13h7v7h-7v-7Z',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01',
  wand: 'M4 20 15 9M14 4v2M19 9h2M17.5 5.5l1.4-1.4M18.5 12.5l1.4 1.4M10.5 5.5 9.1 4.1M13 7l4 4',
  crown: 'M3.5 8l4.5 4 4-7 4 7 4.5-4L18.5 18h-13L3.5 8ZM5.5 21h13',
  download: 'M12 3v12M7.5 10.5 12 15l4.5-4.5M5 19h14',
  link: 'M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1',
  eyeOff: 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.5 5.4A9.8 9.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.6 3.7M6.6 6.6C4.7 7.9 3.3 9.8 2.5 12c1 2.5 4.5 7 9.5 7a9.8 9.8 0 0 0 4.5-1.1',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  hourglass: 'M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9',
  flame: 'M12 21c3.9 0 6.5-2.6 6.5-6.2 0-3.1-2.1-5.4-3.4-6.8.1 1.8-.6 3.1-1.8 3.6.3-3.2-1.3-6.3-4.3-8.6.2 3-1.4 5-2.9 6.8C5 11.2 5.5 12.8 5.5 14.8 5.5 18.4 8.1 21 12 21Z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  check: 'M5 12.5 10 17.5 19 7',
  rewind: 'M11 6 4 12l7 6V6ZM20 6l-7 6 7 6V6Z',
  house: 'M4 11 12 4l8 7v9h-5v-6h-6v6H4v-9Z',
  sticker: 'M14 21H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v6l-7 7ZM14 21v-4a3 3 0 0 1 3-3h4',
  memory: 'M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3ZM9.5 21h5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 7.5h.01',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2.5 2.5M10 2.5h4',
  card: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8.5 7h7M8.5 17h3',
  trade: 'M4 8h14l-3.5-3.5M20 16H6l3.5 3.5',
  print: 'M7 9V3.5h10V9M7 17H4.5V10a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v7H17M7 14h10v7H7v-7Z',
  volume: 'M4 9.5v5h3.5L12 19V5L7.5 9.5H4ZM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11',
  live: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z',
  dual: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11ZM6.5 6.5h5v5h-5v-5Z',
  eye: 'M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  undo: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  // SF Symbols stand-ins: backward.end.fill / forward.end.fill / playpause.fill (iPod click wheel glyphs)
  skipBack: 'M5 5v14M19 5l-8 7 8 7V5ZM12 5l-6 7 6 7V5Z',
  skipForward: 'M19 5v14M5 5l8 7-8 7V5ZM12 5l6 7-6 7V5Z',
  playPause: 'M3 6v12l8-6-8-6ZM15 6v12M20 6v12',
  // magnifyingglass, star, person.2, paperplane, square.grid.3x3, arrow.up, person.crop.circle
  searchGlass: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 20 20',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8L12 3.5Z',
  paperplane: 'M21 3 3 10.5l7 2.5M21 3l-7.5 18-3.5-8M21 3 10 13',
  grid3: 'M4 4h4.5v4.5H4V4ZM9.75 4h4.5v4.5h-4.5V4ZM15.5 4H20v4.5h-4.5V4ZM4 9.75h4.5v4.5H4v-4.5ZM9.75 9.75h4.5v4.5h-4.5v-4.5ZM15.5 9.75H20v4.5h-4.5v-4.5ZM4 15.5h4.5V20H4v-4.5ZM9.75 15.5h4.5V20h-4.5v-4.5ZM15.5 15.5H20V20h-4.5v-4.5Z',
  arrowUp: 'M12 19V5M5.5 11.5 12 5l6.5 6.5',
  personCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 12.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM6.2 18.4c1.2-2.3 3.4-3.6 5.8-3.6s4.6 1.3 5.8 3.6',
  notebook: 'M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6V3.5ZM6 3.5v17M3.5 7.5H8M3.5 12H8M3.5 16.5H8',
  sparkle: 'M12 3c.6 4.8 4.2 8.4 9 9-4.8.6-8.4 4.2-9 9-.6-4.8-4.2-8.4-9-9 4.8-.6 8.4-4.2 9-9Z',
  zigzag: 'M3 12l3-3 3 3 3-3 3 3 3-3 3 3',
};

const FILLED = new Set(['bolt', 'play', 'heart', 'flame', 'rewind', 'skipBack', 'skipForward', 'star', 'sparkle']);

export function Icon({ name, size = 24, color = 'currentColor', filled, strokeWidth = 2, style, className }: { name: keyof typeof P | string; size?: number; color?: string; filled?: boolean; strokeWidth?: number; style?: CSSProperties; className?: string }) {
  const d = P[name] ?? P.info;
  const fill = filled ?? FILLED.has(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : 'none'} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}
