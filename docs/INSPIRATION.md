# Inspiration Ledger

**roll.** is built purely from its sources. No string, color, font, size, icon or motion comes from
our own taste. Every one traces to:
- a screenshot in the user's INSPO folder;
- a researched fact about a source app;
- or Apple's platform defaults when a source's detail is unknown.

## Where provenance lives
| What | Where |
|---|---|
| The user's INSPO images (29 App Store screenshots + TikTok frames) | `research/inspo/store`, `research/inspo/frames` |
| Their transcription: every string, layout and measured color | `research/30-inspo-folder.md` |
| Research dossiers per source app | `research/01…26-*.md` |
| Apple HIG extracts (Live Activity, widgets, type) | `research/27-apple-hig.md` |
| **All UI copy**, one deck per source, each entry tagged and quoting the original | `packages/shared/src/sources/*.ts` |
| Noun-substitution table (the only allowed adaptation) | `packages/shared/src/sources/README.md` |
| Colors, fonts, radii, each with its tag | `apps/web/src/styles/tokens.css` |
| Per-screen source notes | the header comment of every screen and CSS module |
| Enforcement | `node scripts/check-copy.mjs` (TypeScript-AST scan: no inline copy in web, no inline copy in server pushes and messages, every deck entry tagged) |
| Rules for anyone touching UI | `docs/BUILD-RULES.md` |

## Tags and precedence
`[I]` > `[V]` > `[V-weak]` > `[B-high]` > `[B-med]` > `[B-low]` > `[HIG]` > `[S]` > no text.

| Tag | Meaning |
|---|---|
| `[I]` | Seen in the user's INSPO folder. `[I-partial]` means the item is partly cropped in the image. |
| `[V]` / `[V-weak]` | Verified by an official page or two sources / one third-party source. |
| `[B-*]` | Background knowledge of the source app, by confidence. |
| `[HIG]` | Apple's stock component or wording, the fallback when a source's detail is unknown. |
| `[S]` | The product spec's own feature name, used only when no source has one. |
| `[DEMO]` | Desktop demo stage only; never ships. |

## Surface → source
| Surface | Source(s) | Main evidence |
|---|---|---|
| App tab bar (chat · cards · camera · archive · you) | Yope | [I] yope-01 tab capsule |
| Camera, capture review, History | Locket (+ BeReal dual, BTS, blur; iOS Camera mode labels) | [I] locket-06, -07, review frames; bereal-02, -05 |
| Ambient photo-tinted background | Locket | [I] locket-04/-06/-07 |
| Group chat | Yope (header, bubbles, composer, voice, stickers) + Locket (stamps, photo replies) | [I] yope-04, frames yope-1on1-*; locket-04 |
| "Right now" split view | Yope | [I] yope-05 |
| Game master | Duolingo (voice, bubble, button) | research/14 |
| Journal (weekly feed) | Retro | [I] retro-01 |
| Profile | Retro | [I] retro-02 |
| Rewind | Retro (tick-ring dial) | [I] retro-05 |
| Calendar of my photos | BeReal "My BeReals" | [I] bereal-04 |
| Week view: recap / pics | Yope week recap + Locket Rollcall | [I] frame yope-week-recap; locket-03 |
| Walls | Yope mosaic and scrapbook, Retro Polaroids | [I] yope-03, frame yope-week-recap, retro-04 |
| Recap player, postcard | Retro | [I] retro-04, retro-03 |
| Awards and roles | Spotify Wrapped Party / Clubs | research/15 |
| Friend Cards, packs, trades | TCG Pocket (+ Telegram collectibles, Monopoly GO trading windows) | [I] tcg-01…06 and pack frames; research/13, 23 |
| Sparks shop | Discord Shop | research/13 |
| Plans | Partiful (+ Apple Invites, WhatsApp events, Luma, Rallly) | research/15, 21 |
| Games | tbh/Gas, Gartic Phone, Instagram Add Yours, Kahoot, Jackbox, Wordle share | research/16, 24 |
| Memory | Character.ai | research/16 |
| Create, likeness, Wrapped story | Google Photos, Sora, WhatsApp/iMessage stickers, Spotify Wrapped | research/06, 16, 26 |
| Onboarding | Locket (+ Snapchat birthday, Retro Rewind cold start, Widgetable pet) | research/01, 10; [I] locket panels and widget gallery frame |
| Lock Screen / Home Screen | Yope lock widget, Locket widget, iOS widgets | [I] yope-02, locket-02/-05; research/27 |
| Settings, paywall, notifications, group page | iOS Settings/Mail + Locket Gold, Retro Premium, Snapchat storage, Yope 1:1 sheet | research/10–12; [I] frames yope-1on1-* |
| In-Claude build: "View only" pill, system-camera shutter | iCloud sharing permission wording; stock iOS capture sheet | [B-high], [HIG]; docs/IN-CLAUDE.md |

## Measured from the INSPO images
| Value | Measured | Used as |
|---|---|---|
| Locket yellow | #F6B100 | `--locket-yellow` |
| Yope lime / pink | #CFFA14 / #FA2283 | `--yope-lime` / `--yope-pink` |
| Yope chat background, bubble, field | #161717, #2C2C2C, #2F2F2F | `--yope-*` |
| BeReal badge red | #ED4338 | `--bereal-red` |
| Retro "N new" red | #E5333A | `--retro-red` |
| TCG Share cyan / Share Partner mint | #79FAFF / #BDFFC7 | `--tcg-cyan` / `--tcg-mint` |
| Locket viewfinder radius | ≈ 40 pt | `--locket-viewfinder-r` |
| Locket shutter | 76 pt: white, 3 pt see-through gap, 4 pt yellow ring | `.shutter` |

## Still unknown (fell back to HIG); a capture would settle these
- Locket:
  - the in-app copy for the current capture review (the INSPO frames are the 2021 version);
  - the Gold paywall layout;
  - the History grid layout.
- BeReal: the current capture screen and the RealMoji picker layout.
- Yope:
  - the members, invite and settings screens;
  - the font (looks like SF Pro);
  - the Yope TikTok that failed to export (`research/inspo/FAILED_ITEMS.txt`).
- Retro:
  - the exact display serif (New York used);
  - the onboarding and settings screens.
- Partiful:
  - theme and effect names and looks;
  - reminder wording;
  - the comment placeholder.
- TCG Pocket: the card back and the Binder / Display Board editors.
- Wrapped: the 2025 card sequence visuals beyond the research rows.
- Character.ai: the memory screen layout.

Taking a screen recording of any of these and dropping it into the INSPO folder is the fastest way
to replace a fallback with the real thing (`docs/CAPTURE.md`).
