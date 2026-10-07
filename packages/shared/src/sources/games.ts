/**
 * Party games: tbh / Gas polls, Gartic Phone, Wordle share grid, Jackbox rooms.
 * Research: research/16 §5–8 (and research/06).
 */
export const tbh = {
  /** [V-weak] buttons under the four names */
  shuffle: 'shuffle',
  /** [V-weak] */
  skip: 'skip',
  /** [V-weak] example poll statements */
  examples: ['Should DJ every party', 'Hotter than the sun'] as const,
  /** [B-low-med] progress "N of 12" */
  progress: (n: number, of: number) => `${n} of ${of}`,
} as const;

export const gartic = {
  /** [V] step names: Write a sentence → Draw → Describe; ours: photo → caption → AI render → guess (spec §K) */
  writeASentence: 'Write a sentence',
  /** [V] */
  draw: 'Draw',
  /** [V] */
  describe: 'Describe',
  /** [V-weak] submit button, bottom right */
  done: 'Done',
  /** [V-weak] results: players "flip through every album" */
  album: 'Album',
} as const;

export const wordle = {
  /** [V-weak] header line "Wordle 1,234 3/6" · Wordle→roll. week number */
  header: (name: string, n: number, score: string) => `${name} ${n.toLocaleString('en-US')} ${score}`,
  /** [B-high] tiles: 🟩 right, 🟨 present, ⬛ (dark theme) / ⬜ (light theme) absent */
  green: '🟩',
  /** [B-high] */
  yellow: '🟨',
  /** [B-high] */
  dark: '⬛',
  /** [B-high] */
  light: '⬜',
} as const;

export const jackbox = {
  /** [V] the first player in is the "VIP" */
  vip: 'VIP',
  /** [V] VIP's start button */
  everybodysIn: "Everybody's in",
  /** [V] four-letter room code */
  roomCode: 'Room Code',
  /** [V] Audience on by default (past the player cap) */
  audience: 'Audience',
  /** [B-med] button when the room is full */
  joinAudience: 'JOIN AUDIENCE',
  /** [B-med] join form */
  play: 'PLAY',
} as const;
