# 30 — The user's INSPO folder (tag **[I]**, highest precedence)

Source: the user's Google Drive folder "INSPO" (downloaded 2026-10-07). The images are saved in
`research/inspo/store/*.webp` (29 App Store screenshots, 460×996) and
`research/inspo/frames/*.jpg` (key frames from 6 TikTok videos). The videos are not committed
because of their size. One item failed in the user's own export (see `research/inspo/FAILED_ITEMS.txt`):
the Yope TikTok @yopeapp/video/7591560669967682847, "File size exceeds limit".

**Precedence:** [I] > [V] > [V-weak] > [B-*] > [HIG] > [S]. Where an [I] image contradicts an
earlier dossier row, the image wins.

**Colors:** median of saturated pixels in the named region (see "Measured" in each section). The
screenshots are WebP-compressed, so treat ±3 per channel as noise.

**Scale:** in the store screenshots the phone screen is about 310 px wide for 393 pt, so
1 pt ≈ 0.79 px. Sizes below are given in pt, already converted.

---

## Locket (7 store screenshots + 4 TikToks)

### Store panels — label + headline [I]
Each panel is a gray SF Symbol-like glyph plus a bold label, then a white bold headline. The
background is a near-black gradient tinted toward the photo's colors.

| file | glyph + label | headline |
|---|---|---|
| locket-01-widget | yellow rounded-square app icon with heart, "Locket Widget" (yellow text) | "Add your best friends to your Home Screen" |
| locket-02-send-home-screen | paper plane, "Send" | "Send pics to friends' Home Screens" |
| locket-03-rollcall | megaphone with sparkle lines, "Rollcall" | "Weekly photo dumps with your best friends" |
| locket-04-chat | speech bubble, "Chat" | "Reply to your friends' pics" |
| locket-05-receive | sparkles (✦ large + small), "Receive" | "See new pictures throughout the day" |
| locket-06-capture | camera aperture, "Capture" | "Tap the widget to open the camera" |
| locket-07-history | stacked photos, "History" | "Explore your History to travel back in time" |

### Camera (locket-06-capture) [I]
- Background: not pure black. It is a dark gradient tinted by the photo: warm brown here, from
  #1D1914 at the top to #2E1A09 at the bottom. → "ambient color" behind every Locket screen.
- Top row:
  - left: a 32 pt circular avatar (your photo);
  - centre: a capsule "👥 12 Friends" (two-person glyph + "N Friends", semibold 15, translucent gray fill);
  - right: a 36 pt translucent circle with a chat bubble glyph, plus a yellow count badge ("3") at its top right.
- Viewfinder: full width minus about 12 pt each side, square, corner radius about 40 pt (~31 px of 310).
- Controls row under the viewfinder:
  - flash ⚡ outline glyph, left;
  - shutter in the centre: white fill, then a dark gap of about 3 pt, then a yellow ring about 4 pt, 76 pt outer diameter;
  - flip glyph (two circular arrows), right.
- Below: a small rounded photo thumbnail (24 pt), "History" (semibold 15), and a chevron ⌄ under it.
- No mode labels and no library button are visible.

### History (locket-07-history) [I]
- Same top row, except the centre pill is "Everyone ⌄" (a filter).
- The photo sits in the same rounded square.
- Caption: centred near the bottom of the photo, white semibold, inside a translucent dark
  pill: "I swear this wasn't planned 🫶".
- Under the photo: avatar (20 pt) + "Jessica" (semibold) + "36m" (gray, short relative time).
- Reply bar: a capsule "Send message..." (gray placeholder) holding 🔥 and 💖 at the right,
  then a smiley-plus glyph (add reaction).
- Bottom bar:
  - left: grid glyph (2×2 rounded squares);
  - centre: small shutter (white + yellow ring, about 44 pt);
  - right: **share glyph** (square with arrow up). It is not "···".

### Chat (locket-04-chat) [I]
- Background tinted by the photo (deep green here, #192717).
- Header: ‹ back; avatar + "Bobby" centred.
- Older message shown as dim gray text, left-aligned: "What're you doing today?"
- Centred timestamp "Today at 9:40 PM" (gray, footnote).
- Photo reply:
  - the photo is a large rounded rectangle (≈ the camera square, slightly smaller);
  - top-left chip: avatar + "Bobby" + "1hr" (translucent);
  - caption pill centred at the bottom: "Park day with Laurel 🥗📖".
- My messages: right-aligned light bubble (#9FA29F measured under the tint → near-white
  translucent), dark text: "What a style icon 🤩".
- Their messages: left, dark translucent bubble, white text, avatar on the last bubble of a run:
  "Come hang ✨", "I'll send you my location!".
- Input: a capsule "Say something..." with 🔥 💖 and the smiley-plus glyph inside it.
- Relative time format: "1hr".

### Rollcall viewer (locket-03-rollcall) [I]
- Top-left: an X in a translucent gray circle.
- Centre:
  - title "Rollcall" (bold) with the megaphone glyph before it;
  - under it the week range in small uppercase letter-spaced gray monospaced-looking type: "JAN 19–25".
- Top-right: a stacked pair of avatars with a yellow count badge "6" (the people who shared).
- Card stack: the current photo is full width with rounded corners. Earlier/later dumps peek above
  it as a deck (2 edges visible).
- On the photo:
  - bottom-left: a reaction cluster of overlapping emoji "🤩🔥💖";
  - bottom-right: a smiley-plus button in a dark translucent circle.
- Below the photo: a row with avatar + "Karima K" (semibold), and a "+" chat glyph in a circle at the right.

### Widget (locket-01, -02, -05; frames locket-home-widget, locket-widget-gallery) [I]
- Home Screen small widget: the photo fills it (radius = widget radius).
  - caption pill bottom-centre: "Sundays ☀️";
  - sender avatar bottom-left (16 pt);
  - yellow count badge top-right: "9".
  - Label under it: "Locket".
- Widget gallery: title "Locket Widget", description "Live pics from all your friends right on your
  Home Screen". It is partly cropped in the frame ("…ve pics from all your friends / …ht on your Home
  Screen"), so it is [I-partial].
  - Preview: a dark rounded square with three overlapping round avatars in yellow rings and "26 Friends".
  - Button: iOS blue "⊕ Add Widget".
- Locket's own steps (TikTok locket-add-widget-steps): "1. Edit Home Screen", "2. Click on + in left
  corner", "3. Search Locket and Add Widget".
- App icon: yellow rounded square with a darker yellow heart.

### Capture review (frames locket-review-*) [I] (2021–22 version)
- Caption: centred white label with black text inside the photo, bottom. This is a TikTok overlay
  style, but the same white box is what Locket used then.
- Header: "Send to" (small gray) / "Ava" (semibold white), centred above the photo.
- Controls:
  - ✕ on the left;
  - centre: a **paper plane in a gray 56 pt circle**, which becomes a **spinner** while sending and
    then a **✓**;
  - download glyph (tray with arrow down) on the right.

### Reply sheet (frames locket-reply-grid, locket-emoji-rain) [I] (older version)
- ⌄ chevron at the top.
- Photo with caption pill "Miss you!! 🥰".
- Under it: "Reply to Kile" with avatar.
- A 2×4 emoji grid: 🫶 💕 😍 🤣 / 😋 🥰 😱 ☺︎+.
- "Send message..." field.
- Tapping an emoji makes large copies of it fall over the screen (emoji rain), confirmed in-app.

### Measured colors [I]
- Locket yellow: **#F6B100** (app icon and widget frame); shutter ring #F0BA29; badge #F0BB20.
  Use **#F6B100** as the brand yellow and treat the ring/badge as the same color under
  anti-aliasing.
- Camera ambient: #1D1914 → #2E1A09 (warm photo). Chat ambient: #192717 (green photo).
  The ambient color is derived from the photo, not a constant.

---

## Yope (5 store screenshots + 2 TikToks)

### Store headlines [I]
- "find friends **like you**"
- "put them on **your lock screen**"
- "your life = **daily & monthly recaps**"
- "react. talk. **go chaotic.**"
- "REAL MOMENTS. EVERY HOUR. EVERY FRIEND."

Style: lowercase, light first line and bold second line, white, geometric sans.

### Profile card (yope-01) [I]
- The profile is a card stack: the current card has a hot-pink outline, and coloured outlines of
  further cards (yellow, green) sit behind it.
- Top-left: a mini avatar stack + "+2" pill.
- Hero: a cut-out photo of the person, then a small pink pill "19 🇺🇸" (age + flag), then the name in a
  big tilted pink sticker label, white uppercase heavy: "OLIVIA".
- A 4×2 grid of "interest" stickers: app-icon-shaped rounded squares with a picture and a white label
  under each: pikachu, london, skims, dogs love, sushi, ye, like it!!, ariana grande.
- Widgets row:
  - a pink square with an **iPod click wheel** holding a photo (music);
  - a white note card with the header "MY RED FLAGS" in pink caps and pink italic bullets:
    "ghosting", "dry texting", "overly jealous", "overly secretive", "mood swings".
- Reply chips: 🐾 sticker, then thumbnail + "spill about pic?", then thumbnail + "what kind…".
- Input: a white camera circle + a capsule "message to Sabrina....".
- Tab bar: a floating dark capsule with 5 glyphs: chat (two bubbles), cards (selected, in a lighter
  circle), camera, archive box, avatar.

### Lock screen (yope-02, frame yope-lockscreen-tutorial) [I]
- Lock screen widget (Live Activity size, 371×~160):
  - the photo fills it, rounded;
  - centred big bold white time "3:00 PM" with the caption under it "waiting for you 😡";
  - sender avatar bottom-left.
- Lock screen buttons: flashlight (left), Yope widget icon (right).
- The tutorial still "9 steps to create your own personalized lockscreen on Yope" shows:
  - a wallpaper collage of cut-out people stickers with **white and lime outlines**;
  - the lime clock "8:40" and "Friday, December 19";
  - photo widgets with captions "auto", "Swag since 1 😎", "tacoss", "happy …day";
  - the iOS "PHOTO" wallpaper picker and a "🔗 Focus" chip.

### Recap collage (yope-03) [I]
- A full-bleed scrapbook of cut-out photos (people, cat, dog, food) with decorations (ribbon bow,
  macaron, chrome star, washi tape, Pikachu hat).
- A white pill "today" (bold black) with a small lime vertical bar beside it.
- Bottom-centre: a translucent gray capsule with the share glyph and "share".

### Group chat (yope-04) and hourly group (yope-05) [I]
- Header:
  - ‹ in a dark translucent circle;
  - a capsule holding the group avatar, "super squad", a streak "🔥264" in a darker inner pill, and ›;
  - a film-strip glyph in a dark circle at the right.
- Under the header: page dots (5).
- Hourly cards (yope-05): a vertical stack of rounded photo cards, each with:
  - a big bold white time centred ("8:00 AM");
  - a caption under it ("class today?", "nah, skippin'");
  - avatar + first name bottom-left ("Finn", "Olivia", "Justin").
  - The active card has story progress bars along its top.
- Chat (yope-04):
  - photo messages with a big time overlay ("10:00 PM");
  - text in dark gray rounded bubbles ("strictly vibes only tonight", "valid", "no way");
  - avatar to the left of their messages;
  - emoji reaction rows;
  - **cut-out person stickers** placed freely over the chat;
  - voice message: a ▶ circle, waveform and "00:38".
- Composer:
  - **lime** camera circle (#CFFA14);
  - a capsule "start typing...";
  - a sticker glyph circle (a circle with a peeled corner);
  - a mic circle.

### 1:1 feed and week recap (frames yope-1on1-feed*, yope-week-recap) [I]
- The shared cover photo fills the top, with ‹ and a ⚙︎ gear in dark circles. Over it rises a dark
  sheet with a grabber.
- Sheet header: big avatar (44 pt) + "Gabriel" (bold) + a lime streak pill "🔥5" (black text on lime).
- The feed is photo cards in sequence:
  - time pill top-right ("5:18 PM", "8:04 PM", "10:57 PM"; dark translucent, small);
  - sender avatar bottom-left;
  - ↓ download glyph bottom-right inside the photo;
  - ♡ heart button outside the photo, under its right corner.
- Week separators as big lowercase overlays: "8 sep-14 sep", "august 2025".
- Composer: lime camera circle + a capsule "message..." with ❤️ 😂 🔥 at the right.
- Week recap screen:
  - title "18 aug-24 aug" with ‹;
  - a collage grid of the week's photos (mixed sizes);
  - the label "18 AUG-24 AUG" (bold uppercase, bottom-left of the collage) and a "YOPE" wordmark +
    "@handle" bottom-right;
  - page dots;
  - a bottom segmented capsule "recap" | "pics" (selected = white pill, black text).

### Measured colors [I]
- Yope lime: **#CFFA14**. Yope pink (OLIVIA label): **#FA2283**.
- Chat background is a dark neutral, about #1C1C1E.

---

## BeReal (6 store screenshots) [I]

### Headlines
- "The **Only App** where people are **100% Real**"
- "**Crazy DualCam** Captures You **and** The Moment"
- "**Friends and Celebs** Post at the **Same Time**"
- "Keep A **Calendar** of **Daily Pictures**"
- "**Unlock Hidden** Pics by Posting **Yours**"
- "**React** to Friends with **RealMojis** and **Comments**"
- Quote card: "Apple App of the Year", ★★★★★, "“Like a mini time capsule of my everyday life” — Camille".

### Post preview (bereal-02) [I]
- Header:
  - ⌄ chevron at the top-left (not an X);
  - "BeReal." centred (bold white).
- Caption **above** the photo, left-aligned white: "at eras tour w my besties 🫶🫶🫶".
- Photo:
  - rounded rectangle at 3:4 (≈ full width);
  - selfie inset at top-left (rounded, black 2 pt border);
  - a small ✕ at the photo's top-right (retake).
- Chips row inside the bottom of the photo, translucent dark capsules:
  - [person-plus glyph] (tag friends);
  - [🔒 My Friends] (audience);
  - [glyph "Off"] (a toggle chip; the glyph reads as a slashed sparkle — maps to BTS Off);
  - [♪] (music).
- Bottom: "SEND ➤" in heavy bold white, centred, with a triangle arrow.

### Feed + notification (bereal-03) [I]
- Notification banner (iOS style, rounded): avatar + app icon; "BeReal."; "Claire ✨ and **24 others**
  posted a BeReal".
- Post:
  - rounded photo with the selfie inset top-left;
  - under it a paper-plane glyph circle and a "💬 10" chip;
  - caption "just a boat and the boys 🌊🏄";
  - "View 10 comments" centred between hairlines.

### Calendar (bereal-04) [I]
- Title "My BeReals".
- Month name centred, uppercase small ("APRIL", "MARCH").
- Weekday header: MON TUE WED THU FRI SAT SUN.
- Day cells: the photo thumbnail (rounded 4 pt) with the day number centred in white semibold.
  Days with no post show only the number on black. One cell has a white border (selected).
- Months stack vertically, newest first.

### Blur (bereal-05) [I]
- Header:
  - "BeReal." centred, with a bell glyph and a red count badge "4" at right;
  - tabs "My Friends" | "Friends of Friends".
- Post header: avatar + "tstizzy" / "5 min late" (gray).
- Blurred photo with an eye-slash glyph, then:
  - "Share to view" (semibold);
  - "To view your friend's BeReal, post an update." (regular);
  - a white capsule button "Post a BeReal." (black text).
- Music bar inside the photo bottom: album art + "Golden - Huntrix" + a red waveform glyph +
  "View all 42 comments", a green "OPEN" pill with the Spotify glyph, and ✕.
- Comment previews: "**pinkybloom** that face card never declines", "**itssofiax** 🔥🔥🔥".
- "View 7 comments".

### RealMojis + comments (bereal-06) [I]
- Header: avatar + "Olivia" (left), a "See Profile" capsule (right).
- Photo with the selfie inset top-left.
- RealMojis: overlapping round selfies at the photo's bottom-right edge (≈ 56 pt), each with an
  emoji badge (😍, 👍), and a "3+" circle at the end.
- Under the photo: a paper-plane circle and a "💬 37" chip.
- Caption "Almost lost my phone for this BeReal !! 😱😂".
- Comments: avatar, "**annavibes** · 5 min ago", then "Zero filters, all chaos 🙌"; also
  "markontherun · 4 min ago", "nice shot!".

### Measured colors
- Badge red **#ED4338**.
- Spotify green **#3EB26A** (dimmed under the tint; Spotify brand #1DB954 [B-high]).

---

## Retro (5 store screenshots) [I]

### Headlines (serif, with the italic word in italics)
- "*Weekly* feed with friends"
- "*Private* by default"
- "Your photos *mailed* as postcards"
- "Beautifully *recap* memories"
- "Press *rewind* on the moments that matter"

### Type
- Display titles ("Week 27", "isareyes", "July 5, 2021") are a heavy, tight, high-contrast serif.
- UI text is a neutral sans (SF).
- Light mode (white background) on the feed and profile; dark on postcard, recap and rewind.

### Weekly feed (retro-01) [I]
- Large title "Week 27" (serif) with two glyphs at the right: book (journal) and chat bubble.
- Your week strip:
  - square-ish tiles flush together (no gaps), each a photo with the weekday "Mon", "Tue", "Wed"
    (white semibold) at the bottom centre;
  - after them a light-gray rounded tile with "+".
- Friends: a horizontal carousel of tall rounded cards (≈ 3:4). Above each card: avatar + "olson"
  / "nathan". On the card: a red pill "6 new" at top-right.
- Tab bar: 5 outline glyphs with no labels: house, two people, clock-with-arrow (rewind), bell,
  person-circle (selected = filled/black).

### Profile (retro-02) [I]
- Username "isareyes" (serif, large), real name "Isabel Reyes" (gray), avatar circle at the right.
- Info rows with small glyphs:
  - 📅 "Weeks Posted: 32"
  - 🌐 "Homebase: Prospect Heights, Brooklyn"
  - ➤ "Last photo: Aspen, CO"
- Buttons: outline capsules "Recaps" and "Share Profile", then a gear in an outline circle.
- Week sections: "**Week 27** Jul 3 - 9" (the range in gray) with "•••" at the right, then the
  day-tile strip (Mon, Tue, Wed, + tile). Below: "Week 26 Jun 26 - Jul 2", "Week 25 Jun 18 - 25".

### Postcard (retro-03) [I]
- Title "Postcard" with ✕ (gray circle) at right.
- The photo with a pill "✎ Add a message".
- "Mailing Address" (gray caption), then the name and address lines, with an ✎ circle at the right.
- Hairline, then "Total" … "$2.00".
- White capsule button "Send Postcard".

### Recap (retro-04) [I]
- Full-bleed blurred photo; a **Polaroid frame** (cream, thick bottom) centred holding the photo.
- Footer meta in small white type:
  - "August 2025" (left) … "Barcelona, Spain" (right);
  - hairline;
  - "@cindytttt" … "2:06am" … "retro.app".
- ✕ at top-right.
- Bottom: a thumbnail with a white count badge "9" (left), page dots (centre), and a white capsule
  "Share" (right).

### Rewind (retro-05) [I]
- Full-bleed photo.
- Top-left: big serif date "July 5, 2021", with "On this week" (small) under it.
- "•••" in a translucent circle at top-right.
- Bottom-centre: **a circular dial of radial tick marks** (≈ 40 ticks, ~110 pt diameter). One tick
  is longer/brighter (the position hand), and a ❙❙ pause glyph sits in the centre. This is the
  "iPod-inspired dial": a scrub ring, not a full click wheel.
- The tab bar stays visible (rewind tab selected).

---

## TCG Pocket (6 store screenshots + 1 TikTok)

See also the message sent to the cards agent. Measured: Share button cyan **#79FAFF**, "Share
Partner" mint **#BDFFC7**.

### Headlines [I]
- "**Share** cards with your friends!"
- "More cards are **now eligible** for trade!"
- "Show off your **collection!**"
- "**Show** your favorite cards to players **around the world!**"
- "Have casual battles in your free time!"
- "Open **two** booster packs every day !"

The highlighted words are in gold gradient. The headline band is a pastel rainbow (pink → lilac →
mint) cut by a white diagonal.

### Pack opening (frames tcg-*) [I]
- Pack: a light line slices across the top (tear).
- Each card is revealed alone, centred on a lilac→white gradient, with sparkles.
- Rarity diamonds sit under the card's bottom-left (silver ◇ outline, filled).
- A pink "NEW" gradient pill sits above the card's top-left.
- ‹ › arrows on the edges.
- "Tap and hold" under a round ⏩ button at the bottom right.

---

## What changes in our build (checklist driven by [I])

1. **Locket shell:**
   - ambient photo-tinted gradient background;
   - "👥 N Friends" pill;
   - chat button with a numbered yellow badge;
   - shutter = white + gap + yellow ring, with no mode labels;
   - "History" thumbnail + label + chevron.
2. **History:**
   - bottom-right is the **share** glyph;
   - "36m"/"1hr" short times;
   - reply bar "Send message..." + 🔥 💖 + smiley-plus;
   - caption in a translucent pill.
3. **Capture review:** the send button is paperplane → spinner → ✓ in a gray circle.
4. **Chat (Locket 1:1 + Yope group):**
   - Locket bubbles, timestamps and photo replies;
   - Yope composer (lime camera, "start typing...", sticker, mic);
   - Yope header capsule with "🔥N";
   - Yope voice messages "00:38";
   - photo messages with big time overlays.
5. **Rollcall viewer:**
   - X, megaphone title + "JAN 19–25";
   - avatar badge;
   - deck stack, reaction cluster, smiley-plus;
   - poster row with "+".
6. **Widgets/lock screen:**
   - Locket widget (photo, caption pill, avatar, yellow badge, "Locket" label);
   - gallery "Live pics from all your friends right on your Home Screen", "N Friends" empty state;
   - Yope lock-screen photo widget (time + caption).
7. **BeReal preview:**
   - ⌄ chevron; caption above the photo; ✕ on the photo;
   - chips row (tag, 🔒 audience, Off, ♪);
   - "SEND ➤".
8. **BeReal blur:** "Share to view" / "To view your friend's BeReal, post an update." / "Post a BeReal.".
9. **Calendar:** "My BeReals" layout for our journal calendar.
10. **Retro:**
    - serif display titles;
    - week strip with weekday labels and the + tile;
    - friends' carousel with "N new";
    - profile info rows and buttons;
    - recap Polaroid with footer meta;
    - rewind tick dial;
    - postcard flow for prints;
    - 5-glyph tab bar with no labels.
11. **Yope:**
    - profile card stack (name sticker, interests grid, iPod music widget, "MY RED FLAGS" note);
    - recap scrapbook with the "today" pill and "share";
    - week recap "recap" | "pics";
    - 1:1 feed with time pills and ♡.
12. **TCG Pocket:** see the cards message.
