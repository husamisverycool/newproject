/**
 * Spotify Wrapped 2025: story player, Clubs roles, Wrapped Party, awards. Research: research/04 §1
 * and research/15. Music nouns → photo nouns by the table in README.md; extra pairs used here:
 * "skip tracks" → "skip a week", "sounds"/"sonic" → "styles"/"visual", "minutes" → "photos".
 */
export const wrapped = {
  /* ── Entry and player ── */
  /** [V] "look for the Wrapped feed at the top of your Home screen" */
  feedName: 'Wrapped',
  /** [V] "adjust playback speed and revisit specific story moments" → press name "Speed & Replay Controls" [V-weak] */
  speed: 'Speed',
  /** [B-med] share pill on shareable cards */
  shareThisStory: 'Share this story',

  /* ── Clubs roles (newsroom.spotify.com wrapped-clubs-overview) [V], nouns substituted ── */
  roles: [
    /** [V] Leader: "Your listening is strongly aligned with club values, making you a perfect role model." */
    { id: 'leader', name: 'Leader', line: 'Your posting is strongly aligned with group values, making you a perfect role model.' },
    /** [V] Scout: "You listen to the freshest releases, always pushing your club forward." */
    { id: 'scout', name: 'Scout', line: 'You post the freshest photos, always pushing your group forward.' },
    /** [V] Archivist: "Your listening delves into past eras, ensuring club history never fades." */
    { id: 'archivist', name: 'Archivist', line: 'Your posting delves into past eras, ensuring group history never fades.' },
    /** [V] Curator: "You're a focused playlist creator, combining the best of your club into mixes." */
    { id: 'curator', name: 'Curator', line: "You're a focused wall creator, combining the best of your group into walls." },
    /** [V] Collector: "You often save music to your library, building a large club collection." */
    { id: 'collector', name: 'Collector', line: 'You often save photos to your binder, building a large group collection.' },
    /** [V] Recruiter: "You share music far and wide, bringing in frequent new club members." */
    { id: 'recruiter', name: 'Recruiter', line: 'You share photos far and wide, bringing in frequent new group members.' },
    /** [V] Loyalist: "You rarely skip tracks, confirming your unwavering dedication to the club." */
    { id: 'loyalist', name: 'Loyalist', line: 'You rarely skip a week, confirming your unwavering dedication to the group.' },
    /** [V] Supporter: "Your listening favors one artist, ensuring they're heard around your club." */
    { id: 'supporter', name: 'Supporter', line: "Your posting favors one friend, ensuring they're heard around your group." },
    /** [V] Broadcaster: "You listen to podcasts more than others, keeping club conversation alive." */
    { id: 'broadcaster', name: 'Broadcaster', line: 'You post voice notes more than others, keeping group conversation alive.' },
    /** [V] Specialist: "You explore experimental sounds, refining your club's sonic boundaries." */
    { id: 'specialist', name: 'Specialist', line: "You explore experimental styles, refining your group's visual boundaries." },
  ],
  /** [V] roles are assigned "based on your standout on-platform behavior … compared to the rest of your Club" · subst Club→group */
  rolesLine: 'based on your standout behavior compared to the rest of your group',

  /* ── Wrapped Party (newsroom wrapped-party-how-to [V-weak]; Digital Trends) ── */
  /** [V-weak] host steps */
  createTheParty: 'Create the party',
  /** [V-weak] */
  makeItYourOwn: 'Make it your own',
  /** [V-weak] */
  inviteYourFriends: 'Invite your friends',
  /** [V-weak] */
  startTheParty: 'Start the party',
  /** [V-weak] guest button */
  joinParty: 'Join Party',
  /** [V-weak] */
  waitingRoom: 'Waiting room',
  /** [V-weak] host can "hand off hosting duties" */
  handOff: 'Hand off hosting',
  /** [V-weak] "no two parties are ever the same" */
  neverSame: 'no two parties are ever the same',

  /* ── Awards (TechCrunch; Campaign; EDMTunes) — names verbatim, mapped to photo stats ── */
  awards: {
    /** [V-weak] "Most Minutes" · subst minutes→photos */
    mostPhotos: 'Most Photos',
    /** [V-weak] "Rarest Listen" · subst listen→post */
    rarest: 'Rarest Post',
    /** [V-weak] */
    crateDigger: 'The Crate Digger Award',
    /** [V-weak] */
    eternalOptimist: 'The Eternal Optimist Award',
    /** [V-weak] */
    onionChopper: 'The Onion Chopper Award',
    /** [V-weak] */
    teamSpirit: 'The Team Spirit Award',
    /** [V-weak] */
    hopelessRomantic: 'The Hopeless Romantic Award',
    /** [V-weak] data-story label "early bird" */
    earlyBird: 'Early Bird',
    /** [V-weak] data-story label "dinner table explainer" */
    dinnerTable: 'Dinner Table Explainer',
    /** [S] spec §K example */
    mostSunsets: 'Most Sunsets',
    /** [S] spec §K example */
    firstToPost: 'First to Post',
    /** [V-weak] group award "Copy and Paste": the group shares the same artists (research/04 §1.6) */
    copyAndPaste: 'Copy and Paste',
    /** [V-weak] group award "Chaos Crew": everyone listens to completely different genres (research/04 §1.6) */
    chaosCrew: 'Chaos Crew',
  },

  /* ── Story cards ── */
  /** [V-weak] Listening Age disclaimer "Age is just a number. So don't take this personally" */
  ageDisclaimer: "Age is just a number. So don't take this personally",
  /** [V-weak] "Top Songs" · subst songs→photos */
  topPhotos: 'Top Photos',
  /** [V-weak] Top Song Quiz → spec §V "guess whose photo" */
  quizName: 'Top Photo Quiz',
  /** [V-weak] Listening Archive: "snapshots of your most memorable … days", up to five · subst streaming→posting */
  archiveLine: 'snapshots of your most memorable posting days',
  /** [S] spec §L "five days that defined our year" */
  fiveDays: 'five days that defined our year',
  /** [V] newsroom: searching "2025 Wrapped" (the year comes first) */
  title: (year: number) => `${year} Wrapped`,
  /** [V-weak] story "Minutes Listened" · subst minutes→photos, listened→posted */
  photosPosted: 'Photos Posted',
  /** [V-weak] story "Listening Archive" · subst listening→posting */
  archive: 'Posting Archive',
  /** [V-weak] Listening Archive day reports (newsroom ?p=37765, research/04 §1.8) */
  archiveDays: {
    /** "Your Biggest Listening Day" · subst listening→posting */
    biggest: 'Your Biggest Posting Day',
    /** "Most Nostalgic Day" */
    nostalgic: 'Most Nostalgic Day',
  },
  /** [V-weak] feature name; host taps "the Wrapped Party tile" at the end of the story (research/15 §1a) */
  party: 'Wrapped Party',
} as const;
