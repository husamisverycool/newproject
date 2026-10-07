# Capture guide: getting exact references from the source apps

The build copies every screen from a named source app (see the spec's Half 2 and `docs/INSPIRATION.md`).
This environment can't reach the app stores, the apps' sites, YouTube, Reddit or design libraries, so the
references below have to come from you. They are ranked by how exact they are.

---

## 0. Before you capture anything (makes screenshots measurable)

On the iPhone you capture with:

- **Text size:** Settings → Display & Brightness → Text Size, at the default middle notch. Turn **Bold Text** off and set **Display Zoom** to *Default*.
- **Accessibility:** Reduce Transparency, Increase Contrast, Reduce Motion and Button Shapes all **off**.
- **Language and region:** English (US).
- **Appearance:** for apps that follow it (Duolingo, Telegram, Discord, Google Photos and the iOS system screens), capture each surface once in **Light** and once in **Dark**.
- **Device:** tell me the iPhone model. A screenshot is pixels, and I divide by the device scale (@3x) to get points.

How to send files so they stay **originals**:

- Send screenshots as the original PNGs. iMessage, WhatsApp, Instagram and Slack recompress them, which shifts colors and edges. AirDrop, Files, Drive and GitHub keep them intact.
- Make screen recordings from Control Center. App audio records by default, which captures sounds like the TCG pack rip, shutter clicks and Duolingo chimes. Narrating with the mic on is welcome, e.g. "it buzzes here". Haptics can't be recorded, so say where they happen.
- Don't crop or mark up. For long pages, take overlapping screenshots top to bottom.
- Name files `app_surface_state_NN.png`, e.g. `locket_history_single_01.png`. Folders per app are fine too.

## 1. Where to put them

| Route | Best for | Notes |
|---|---|---|
| **A private GitHub repo** (e.g. `husamisverycool/inspiration`), uploaded with "Add file → Upload files" | everything ≤ 25 MB per file (web upload) | I attach it to this session and get full-resolution files on disk. I can sample exact hex colors, measure spacing and cut video into frames. Keep it **separate** from the product repo: these are other companies' screens and shouldn't ship. |
| **Paste into chat** | a few quick screenshots | I can see them, but can't sample pixels as precisely as from files. |
| **Google Drive folder + share link** | long videos | The connector works, but hands files back inline rather than to disk. That's fine for a handful of images, not for video. For video, add `drive.google.com` and `drive.usercontent.google.com` to the environment's Allowed domains so I can download links straight to disk. |

## 2. What to capture (the shot list)

🎥 = a short screen recording matters more than screenshots, because it captures motion and sound.
P1 surfaces are the core loop, so start there. Every state counts: empty, loading, populated, error and success.

### P1. Locket (spec: camera, history, reactions, widget, Rollcall, Gold, streaks)
- Camera home: idle, flash on, front camera, holding the shutter for video 🎥, and the yellow recording outline.
- After capture: the caption field (tap it, then each caption type: Text, Location, Time, Weather, Stickers, Now Playing). Also the recipient row (who's selected by default, the first chip, the "All"/"Everyone" chip) and Send 🎥.
- Swipe up to History 🎥: single post view, the grid/all view, the friend filter dropdown, the three-dot menu, delete confirm.
- Someone else's Locket: the reply bar, tapping an emoji, the **emoji rain** 🎥, and the activity sheet (who reacted).
- Messages (top right): the list and a thread.
- Profile (top left): every row, friends list, "Add a new friend", the invite link sheet, "X out of 20 friends".
- **Rollcall (Sunday):**
  - the Live Activity on the Lock Screen and in the Dynamic Island 🎥;
  - picking 10 photos;
  - the posting flow 🎥;
  - viewing friends' Rollcalls, plus reactions and comments.
- Widgets: add a Locket widget (small and large), the Best Friend / Crush widget, and "Create new Locket".
- Locket Gold: the paywall (every screen), app icon picker, camera themes, Gold badge.
- Streaks: the streak badge, the Memories Calendar, the restore flow.
- **Locket Looks** (AI selfie, Jul 2026): the full flow 🎥.
- Onboarding: delete and reinstall, or use a second Apple ID, then record the **entire first run** 🎥 including every permission prompt.

### P1. BeReal (spec: dual camera, BTS, blur until you post, RealMoji, challenges, report/block)
- The ⚠️ notification on the Lock Screen and as a banner.
- Capture with the 2:00 timer 🎥, the dual preview, BTS On/Off, retake, caption, SEND.
- Friends feed **before you post** (blurred, with whatever text sits on top) and after you post.
- A post: tap-and-hold BTS 🎥, swapping the two photos, comments, the RealMoji picker and taking a RealMoji 🎥, and the ⚡ Instant RealMoji.
- Late badge, Bonus BeReal, a daily challenge if one shows.
- Memories calendar, plus "Generate my recap" if it exists.
- Three-dot menu → Report / Block (every screen).
- RealGroups and RealChat.

### P1. Retro (spec: weekly journal, post-to-see, keys, Rewind dial, recaps, widgets, postcards, Premium)
- Home journal: the week rows, scrolled through several weeks, and a week opened.
- A friend's journal locked (post-to-see) and unlocked; giving someone a **key**.
- **Rewind tab** 🎥: spinning the dial (sound on), press-and-hold uncrop, share (with the timestamp it adds), delete.
- Recaps from your profile: every option screen, collage vs video, Polaroid vs fullscreen border, and the share sheet.
- Sticker recaps, group albums, postcards (all print screens), Premium paywall, referral screen.
- Onboarding 🎥, including the daily/weekly/monthly nudge question.
- Widgets: friends' latest and the time-hop widget.

### P1. Yope (spec: walls, split view, photo chat, voice, face-swap stickers, streaks, Wrapped, Premium)
- Home/feed, the **split view** 🎥 and a group switcher.
- **Walls:** a generated wall, then edit 🎥, remix 🎥, make an album, save/share.
- Group photo chat: sending a photo, a voice message 🎥, stickers.
- Face-swap stickers: making one 🎥 and using one.
- Streak flame states, the lock-screen surprise update, widgets.
- Onboarding 🎥 including the invite gate (if any), Premium paywall, settings.

### P1. Pokémon TCG Pocket (spec: packs, rarity frames, binder, Wonder Pick, trading, Shinedust, Flair)
- Home screen and pack selection, with the pack timer showing.
- **Opening a pack from cut to "swipe up"** 🎥 (sound on). If you ever pull ☆ or higher, record that one too.
- Card close-ups: one card of each rarity you own (◇, ◇◇, ◇◇◇, ◇◇◇◇, ☆, ☆☆, ☆☆☆, 👑), holding and tilting a ☆ card 🎥, and tap-and-hold on an immersive 🎥.
- My Cards: 3 columns, pinched out to 11 🎥, the Card Dex toggle, search/filter sheet, wishlist, binders and display boards.
- Wonder Pick: the feed, picking 🎥 and the result.
- Trade: every screen of sending and receiving 🎥, plus the Shinedust and stamina displays.
- Flair: obtaining it, and a card with Sparkle Flair: Gold 🎥.
- Missions, Shop, Premium Pass paywall.

### P2. Duolingo (spec: game buttons, mascot voice, Friend Streak, Friends Quests, streak warnings)
- Home path with buttons, pressing a button 🎥, a lesson's check/continue bar, lesson complete 🎥.
- Streak screen, streak freeze, a streak-at-risk notification.
- Friend Streak: start one and view it; Friends Quest card and its progress screen 🎥; nudge / send gift.
- Profile, leaderboard (only to see its look), shop.
- Any Duo push notifications sitting in your Notification Center.

### P2. Partiful (spec: plans, RSVP, Find a Time, Text Blasts, shared album, join-by-link page)
**partiful.com in a desktop browser is the full product:** also save each page with the
[SingleFile](https://github.com/gildas-lormeau/SingleFile) extension (one `.html` file with all CSS inlined). That gives me
exact colors, radii, font stacks and animation timings, not just pixels.
- Create an event 🎥: title, font, poster picker, theme, effect, Set a Date vs **Poll your guests**, settings tabs.
- The guest view of an event page (open the link logged out too), top to bottom.
- RSVP 🎥 for each choice, Find a Time voting and Pick this, Text Blast composer, Upload Photos and the album, comments.

### P2. Spotify Wrapped 2025 (spec: story cards, Party, Clubs, Listening Age, quiz, archive)
Wrapped 2025 probably isn't in the app any more. Use **Spotify Newsroom's Wrapped 2025 press assets** (hi-res card images and videos), or a **YouTube walkthrough from Dec 2025** (download the original with `yt-dlp` rather than re-recording). If you still have your own Wrapped 2025 story videos saved, those are best.

### P3. The rest, whatever you have
- **Google Photos:**
  - the Create tab, Remix (each style) and Me Meme, each end to end 🎥;
  - the "Edited with Google AI" label;
  - Memories cards.
- **Gemini:** an image with the visible sparkle watermark.
- **Sora:**
  - cameo/character setup 🎥;
  - the cameo permissions screen;
  - the drafts-with-me view.
- **Character.ai:** the current memory UI (May 2026: Story Memory, Facts, Memory Usage, Pin).
- **Telegram:**
  - a gift sheet, plus the upgrade flow (Telegram's blog videos work if you don't want to spend Stars);
  - Wear;
  - a collectible's info sheet.
- **Discord:** Orbs balance, Quest Home and a quest, Shop, item preview, buying.
- **Instagram Instants:** camera, sending, the receiver's stack.
- **Snapchat:**
  - streak ⌛ and the Restore dialog;
  - the Memories storage plan upsell;
  - an Imagine Lens limit prompt.
- **WhatsApp / iMessage:**
  - sticker drawer, Tapbacks, a poll and an event card;
  - Apple Invites RSVP.
- **Gartic Phone** (garticphone.com, web): each round and the album replay 🎥. SingleFile captures help here too.
- **Jackbox:** the jackbox.tv controller page and a room code screen.
- **Gas / tbh / Lapse social:** no longer live. Only archived videos or old screenshots, if you find any.

## 3. Even more exact than screenshots (optional, your call)

- **Web versions with SingleFile:** Duolingo, Partiful, Character.ai, Discord, Telegram Web, Google Photos, Sora, Gartic Phone, Wordle and jackbox.tv. A SingleFile capture holds the real text, hex colors, radii, shadows, font stacks and **transition durations and easings**.
- **Official design guidelines:** design.duolingo.com (color, typography, illustration construction, Duo's voice). Save every page with SingleFile or as PDF.
- **Curated screen libraries:**
  - **Mobbin:** complete iOS flows, including onboarding and paywalls you can't easily reach yourself.
  - **Screensdesign / Page Flows:** onboarding and paywall *recordings*.
  - Exporting the flows for Locket, BeReal, Retro, Yope, Duolingo, Partiful, Spotify and TCG Pocket covers a lot quickly.
- **App Store pages:** screenshots, App Preview videos and the full **Version History**, where every "What's New" note is exact copy.
- **App bundles** (an Android APK from APKMirror, or an iOS IPA via Apple Configurator on a Mac):
  - These hold *every* UI string (including errors and empty states), color assets, fonts, icons, Lottie/Rive animations and haptic patterns.
  - **Caveat:** most app terms forbid reverse engineering. Treat a bundle as reference only; nothing from it ships.

## 4. Or open the network instead

Adding these to the environment's **Allowed domains** lets me pull a lot myself: App Store pages and version
histories, help-center copy, official videos (cut into frames with ffmpeg), press kits and design guidelines.
Steps: https://code.claude.com/docs/en/cloud-environments#network-access

```
apps.apple.com  is1-ssl.mzstatic.com  is2-ssl.mzstatic.com  is3-ssl.mzstatic.com  is4-ssl.mzstatic.com  is5-ssl.mzstatic.com
play.google.com  play-lh.googleusercontent.com
help.locket.com  locket.camera  help.bereal.com  bereal.com  yope.app  retro.app
partiful.com  help.partiful.com
design.duolingo.com  blog.duolingo.com  www.duolingo.com
newsroom.spotify.com  spotify.design
tcgpocket.pokemon.com  game8.co  gamewith.net  bulbapedia.bulbagarden.net  archives.bulbagarden.net
telegram.org  web.telegram.org  support.discord.com  discord.com
blog.google  support.google.com  help.openai.com  support.character.ai
www.youtube.com  i.ytimg.com  rr*.googlevideo.com (or the "*.googlevideo.com" wildcard)
www.reddit.com  i.redd.it  preview.redd.it  web.archive.org
techcrunch.com  9to5mac.com  9to5google.com  www.theverge.com  www.engadget.com
drive.google.com  drive.usercontent.google.com
```

(Mobbin and other paid libraries still need you to export, since they sit behind your login.)

## 5. What can't be copied as-is, even with perfect references

I copy layouts, flows, spacing, colors, timing and copy patterns exactly. These identify the source brands
and stay as reference until a lawyer clears them, or they get swapped:
- logos and wordmarks;
- character art (Duo, Kakao Friends, Pokémon);
- proprietary fonts (SF Pro ships only via the iPhone system font; Feather, DIN Rounded, Spotify Mix and gg sans don't ship at all);
- sound files and animation files;
- trademarked feature names (Rollcall, RealMoji, BTS, Wonder Pick, Shinedust, Wrapped, Wordle and others).

`docs/INSPIRATION.md` flags each one.
