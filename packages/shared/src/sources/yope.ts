/**
 * Yope: walls, split view, photo chats, voice, face-swap stickers, streaks, store copy.
 * Research: research/02 and research/12 (store bullets and What's New notes are Yope's own words).
 */
export const yope = {
  /* ── Store bullets [V-weak] ── */
  /** [V-weak] */
  realMoments: 'real moments every hour',
  /** [V-weak] */
  streaksLine: 'streaks that make friendships stronger – post together, grow together',
  /** [V-weak] */
  privateByDesign: 'Private by design – only your friends see your photos',
  /** [V-weak] */
  lockscreen: 'Surprise lockscreen updates – stay connected without opening the app',
  /** [V-weak] */
  fastEasy: 'Fast, easy photo messaging – one tap, no edits, no stress',
  /** [V-weak] */
  photoChats: 'Built-in photo chats – skip the texting, chat visually',
  /** [V-weak] */
  noLikes: 'no likes',
  /** [V-weak] */
  noAudience: 'no audience, no pressure',
  /** [V-weak] sign-off */
  shareWhatMatters: 'share what matters',

  /* ── What's New notes ── */
  /** [V] 1.227.0 "A new split view just dropped to see what your friends are up to right now and drop yours back." */
  splitView: 'see what your friends are up to right now',
  /** [V] 1.227.0 */
  dropYoursBack: 'drop yours back',
  /** [V] 1.227.0 feature name "split view" */
  splitView: 'split view',
  /** [V] 1.229.0 "Your space with friends got a glow up — share your day, see theirs, stay close, with all your moments together in one place." */
  space: 'share your day, see theirs, stay close',
  /** [V-weak] walls: "Recaps are now walls where you can edit them, remix them, and make your own memory albums to save or share with your friends." */
  wallsLine: 'Recaps are now walls where you can edit them, remix them, and make your own memory albums to save or share with your friends.',
  /** [V-weak] wall action verbs from the note above */
  wallEdit: 'Edit',
  /** [V-weak] */
  wallRemix: 'Remix',
  /** [V-weak] "make your own memory albums" */
  wallAlbum: 'Memory album',
  /** [V-weak] "save or share" */
  wallSave: 'Save',
  /** [V-weak] */
  wallShare: 'Share',
  /** [V] voice: "add voice to your memories or send voice messages in chat" */
  voiceLine: 'add voice to your memories or send voice messages in chat',
  /** [V] "Fun new face-swap stickers are live — so you can turn yourself into the meme and make chats even more chaotic." */
  faceSwapLine: 'turn yourself into the meme and make chats even more chaotic',
  /** [V-weak] 1.201.0 "turn your friends' silliest pics into stickers and overshare like never before" */
  friendStickers: "turn your friends' silliest pics into stickers",
  /** [V-weak] 1.199.0 live photos "snap the moment with all the vibes — moving, real, full of energy" */
  liveLine: 'moving, real, full of energy',
  /** [V-weak] 1.202.1 "a personal year-in-review highlighting your photos, moments, and close friends in a story-style recap" */
  wrappedLine: 'a personal year-in-review highlighting your photos, moments, and close friends in a story-style recap',

  /* ── Editor tools (eSafety) ── */
  /** [V] "stickers, emojis, text, drawings and other effects" */
  toolStickers: 'Stickers',
  /** [V] */
  toolEmojis: 'Emojis',
  /** [V] */
  toolText: 'Text',
  /** [V] */
  toolDraw: 'Draw',

  /* ── INSPO (research/30) ── */
  /** [I] yope-04-chat: composer placeholder */
  startTyping: 'start typing...',
  /** [I] frame yope-1on1-feed: 1:1 composer placeholder */
  message: 'message...',
  /** [I] yope-01: profile reply field "message to Sabrina...." (four dots in the source) */
  messageTo: (name: string) => `message to ${name}....`,
  /** [I] frame yope-1on1-feed: reactions inside the composer */
  quickReactions: ['❤️', '😂', '🔥'] as const,
  /** [I] yope-01: profile note header "MY RED FLAGS" */
  myRedFlags: 'MY RED FLAGS',
  /** [I] yope-01: reply chip "spill about pic?" */
  spillAboutPic: 'spill about pic?',
  /** [I] yope-03: pill on today's recap "today" */
  today: 'today',
  /** [I] yope-03: capsule "share" */
  share: 'share',
  /** [I] frame yope-week-recap: segmented "recap" | "pics" */
  recap: 'recap',
  /** [I] */
  pics: 'pics',
  /** [I] frame yope-week-recap "18 aug-24 aug", frame yope-1on1-feed "8 sep-14 sep" (three-letter lowercase months, hyphen, no spaces) */
  weekRange: (start: number, end: number) => {
    const f = (t: number) => `${new Date(t).getDate()} ${new Date(t).toLocaleDateString('en-US', { month: 'short' }).slice(0, 3).toLowerCase()}`;
    return `${f(start)}-${f(end)}`;
  },
  /** [I] frame yope-1on1-feed: month separator "august 2025" */
  monthSeparator: (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase(),
  /** [I] yope-05: time over each photo "8:00 AM" */
  time: (t: number) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  /** [I] yope-04: voice message length "00:38" */
  voiceTime: (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.round(sec) % 60).padStart(2, '0')}`,
  /** [I] App Store headlines (line 2 bold) */
  headlines: [['find friends', 'like you'], ['put them on', 'your lock screen'], ['your life =', 'daily & monthly recaps'], ['react. talk.', 'go chaotic.']] as const,
  /** [I] yope-05 headline */
  everyHour: 'REAL MOMENTS. EVERY HOUR. EVERY FRIEND.',
  /* ── Streak ── */
  /** [I] yope-04/-05 "🔥451", frame yope-1on1-feed lime pill "🔥5" */
  streak: '🔥',
  /** [I] */
  streakCount: (n: number) => `🔥${n}`,
} as const;
