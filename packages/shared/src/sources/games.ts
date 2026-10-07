/**
 * Party games: tbh / Gas polls, Gartic Phone, Wordle share grid, Jackbox rooms, Kahoot! answer tiles.
 * Research: research/16 §5–8, research/24 §1–3 (and research/06).
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
  /** [B-low] polls per round: the "N of 12" progress (research/16 [B] tbh poll-card row) */
  perRound: 12,
  /** [V] each poll offers "Four friends' names" (research/16 §5) */
  names: 4,
  /**
   * [V-weak] tbh poll questions verbatim as the press quoted them (research/24 §1, research/16 §5);
   * casing and punctuation as quoted. Left out: "could spend a whole class together and never get
   * bored" (school-only wording).
   */
  questions: [
    /** mobileworldlive.com / weforum.org */
    'Who is most likely to be president?',
    /** same result set */
    'best person to go on a road trip with?',
    /** fortune.com */
    'Who should DJ every party',
    /** fortune.com */
    'who will be the next international fashion icon',
    /** chsperiscope.com / thescarletscroll.com; also Gas (prdaily.com) */
    'Who has the best smile',
    /** same result set */
    'who makes you laugh the hardest',
    /** same result set */
    "world's best party planner",
    /** silverchips.mbhs.edu (bare predicate, completed by the name) */
    'beautiful from every angle',
    /** same */
    'never ceases to amaze me',
    /** coolmomtech.com (research/16 §5) */
    'Hotter than the sun',
  ] as const,
  /** [V-weak] moderation rule for every poll: "appropriate for ages 13 and up; uplifting; and not offensive to any group" */
  contentRule: 'appropriate for ages 13 and up; uplifting; and not offensive to any group',
  /**
   * [V-weak] phrasing patterns P1–P8 (research/24 §1a), each a restatement of the verified questions
   * above. Used only to brief the AI game master; never shown as UI copy.
   */
  patterns: [
    'Most likely to ___',
    'Who has the best ___ / Best ___',
    'Best person to ___ with',
    'Who should ___',
    'Who will be the next ___',
    "World's best ___",
    'Who makes you ___',
    'a bare predicate completed by the name, e.g. "never ceases to amaze me"',
  ] as const,
} as const;

/** Gas (same founder as tbh; acquired by Discord, Jan 2023). Research: research/24 §1. */
export const gas = {
  /**
   * [V-weak] Gas poll questions verbatim (prdaily.com, leaders.com, bestofsno.com, universe.byu.edu).
   * Left out: the negative counter-example "Who's most likely to punch someone" (research/24 §1).
   */
  questions: [
    'Most likely to be famous',
    'Best DJ',
    'The most beautiful person you have ever met',
    'most likely to DJ a party',
    "Who's most likely to end up as president",
  ] as const,
  /** [V-weak] questions are "designed to boost users' confidence" */
  aim: "designed to boost users' confidence",
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
  /** [V-weak] score in the header: "3/6" (guesses used / 6) */
  score: (n: number, of: number) => `${n}/${of}`,
  /** [V] one row of 5 squares per guess */
  rowLength: 5,
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
  /** [S] spec §K "audience mode for more than 10 players" (Quiplash 3 caps players at 8 [V], research/24 §3) */
  maxPlayers: 10,
} as const;

/** Kahoot! (research/24 §2). Hex values are unverified, so tiles use the iOS system color of the same name [HIG]. */
export const kahoot = {
  /** [V-weak] answer tiles, shape → color: Triangle = Red · Diamond = Blue · Circle = Yellow · Square = Green */
  tiles: [
    { shape: 'triangle', color: 'red' },
    { shape: 'diamond', color: 'blue' },
    { shape: 'circle', color: 'yellow' },
    { shape: 'square', color: 'green' },
  ] as const,
  /** [V-weak] player phone join confirmation "You're in!" */
  youreIn: "You're in!",
  /** [V-weak] after each question, a leaderboard of the top 5 players */
  leaderboard: 5,
  /** [V] the game ends on a podium that recognizes the top players (three places [B-med]) */
  podium: 3,
} as const;
