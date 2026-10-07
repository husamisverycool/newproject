# Dossier 16: AI creation, consent, memory, party games, messaging (cluster 7), exact strings

Compiled: 2026-10-07. Tool: WebSearch only. **26 of 26 allowed searches were used.** No page was opened directly, because curl and WebFetch are blocked by policy and were not worked around.

## Method and how to read the tags

- Every verified row comes from a WebSearch result summary and its result URLs, not from the full page. A summary does not always say which URL a sentence came from. In those cases the row cites the most likely URL from that result set.
- Text inside quotation marks is quoted as the search result returned it. Capitalization and punctuation **may differ from the live UI**. A "verified" string is therefore verified as documented, not as pixel-checked in the app.
- Tags:
  - **[V]**: an official or primary source (support.apple.com, support.google.com, blog.google, an official post), or two or more independent sources that agree on the exact string.
  - **[V-weak]**: one secondary source (a tutorial, a third-party blog, a news paraphrase), or sources that agree on the meaning but not the exact wording.
  - **[B]**: background knowledge that was not verified. These rows appear **only** in the separate "BACKGROUND KNOWLEDGE [B]" section, each with a confidence rating.
- Where sources conflict, both values are listed and the row says "CONFLICT".
- Cross-reference: dossier `06-ai-ios-games-memory.md` already covers the Google Photos Create-tab tile descriptions and the "Your tools" heading. Its value "Subtle movements" (plural, from blog.google) conflicts with "Subtle movement" in this round's results.

---

## 1. Google Photos: Create tab, Remix, Me Meme, AI disclosure

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Google Photos | Create tab | Entry point | "Create" tab in the bottom navigation ("tap Create at the bottom") | https://support.google.com/photos/answer/16763021 ; https://www.t3.com/tech/phones/how-to-turn-yourself-into-a-me-meme-in-google-photos | [V] |
| Google Photos | Create tab | Tools listed by Google (order as written in the blog, **not confirmed as on-screen order**) | Photo to video · Remix · Collage · Highlight videos · Cinematic photos · Animations | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ ; https://9to5google.com/2025/08/13/google-photos-create-tab/ | [V] (names) / UNKNOWN (UI order) |
| Google Photos | Create tab | Rollout | Create tab "now available in the U.S." (Aug 2025), described as a "central hub" for creation tools | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ ; https://www.tomsguide.com/ai/google-gemini/google-photos-adds-a-create-tab-to-turn-your-photos-into-something-new-heres-what-we-know | [V] |
| Google Photos | Create tab | Me Meme tile | "Me Meme" (added Jan 2026; reached via Create, then Me Meme) | https://9to5google.com/2026/01/22/google-photos-me-meme/ ; https://techcrunch.com/2026/01/23/google-photos-latest-feature-lets-you-meme-yourself | [V] |
| Google Photos | Photo to video | Prompt choices (2) | "Subtle movement" and "I'm feeling lucky". CONFLICT: dossier 06 has "Subtle movements" from blog.google | https://www.bgr.com/1958772/google-photos-veo-3-video/ ; https://blog.google/products/photos/google-photos-create-tab-editing-tools/ | [V-weak] |
| Google Photos | Photo to video | Model | Veo 3 | https://www.bgr.com/1958772/google-photos-veo-3-video/ | [V] |
| Google Photos | Remix | Style names (as listed by Android Authority) | "3D animation", "Anime", "Sketch", "Comic book" | https://www.androidauthority.com/google-photos-remix-tool-3587005 | [V-weak] |
| Google Photos | Remix | Style names (blog wording) | "anime, comic, sketch or even 3D animation" | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ | [V] (prose, not UI labels) |
| Google Photos | Remix | Flow (July 2025, before the Create tab) | Create new button (plus icon, top right) → select a style → choose a photo → "Generate" | https://www.androidauthority.com/google-photos-remix-tool-3587005 ; https://techcrunch.com/2025/07/23/google-photos-adds-ai-features-for-remixing-photos-in-different-styles-turning-pics-into-videos | [V-weak] |
| Google Photos | Collage | Flow | Pick multiple photos → select a design → choose a layout; brightness and filters can be edited inside the collage editor | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ | [V-weak] |
| Google Photos | Highlight video | Flow | Search with phrases such as "Mom" or "Paris"; Photos picks clips and photos and adds music | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ | [V-weak] |
| Google Photos | Animation | Flow | Select "animation", then the photos to include; output is a GIF | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ | [V-weak] |
| Google Photos | Cinematic photo | Description | "vibrant, moving, 3D representations of your photos" | https://blog.google/products/photos/google-photos-create-tab-editing-tools/ | [V-weak] |
| Google Photos | Me Meme | Flow, step 1 | Select a template: choose a preset, or upload your own funny picture as a reference | https://support.google.com/photos/answer/16763021 ; https://www.t3.com/tech/phones/how-to-turn-yourself-into-a-me-meme-in-google-photos | [V] |
| Google Photos | Me Meme | Flow, step 2 (photo guidance) | Choose a photo where your face is clearly visible, "well-lit, focused, and front-facing" | https://support.google.com/photos/answer/16763021 | [V] |
| Google Photos | Me Meme | Flow, step 3 | "Generate" | https://support.google.com/photos/answer/16763021 | [V] |
| Google Photos | Me Meme | Result actions | "Save" (to library) · "Regenerate" · "Share" | https://support.google.com/photos/answer/16763021 | [V] |
| Google Photos | Me Meme | Experimental note | Experimental; results "may not perfectly match the original photo" | https://support.google.com/photos/answer/16763021 ; https://www.androidauthority.com/google-photos-me-meme-rollout-3634849 | [V-weak] |
| Google Photos | Me Meme | Model | Gemini / Nano Banana | https://techcrunch.com/2026/01/23/google-photos-latest-feature-lets-you-meme-yourself | [V-weak] |
| Google Photos | Me Meme | Compare toggle label | UNKNOWN | (no source found) | — |
| Google Photos | AI disclosure | Details section note | "Edited with Google AI" | https://9to5google.com/2024/10/24/google-photos-ai-edit-info/ ; https://techcrunch.com/2024/10/24/google-adds-new-disclosures-for-ai-photos-but-its-still-not-obvious-at-first-glance | [V] |
| Google Photos | AI disclosure | Credit field, fully generated | "Made by Google AI" (Pixel Studio, Gemini) | https://9to5google.com/2024/10/24/google-photos-ai-edit-info/ | [V] |
| Google Photos | AI disclosure | Digital source type field | "Edited using Generative AI" | https://9to5google.com/2024/10/24/google-photos-ai-edit-info/ | [V] |
| Google Photos | AI disclosure | Section name | "AI info" (inside "Details", reached by scrolling or swiping up) | https://9to5google.com/2024/10/24/google-photos-ai-edit-info/ ; https://www.maginative.com/article/google-photos-adds-metadata-with-ai-edit-labels/ | [V-weak] |
| Google Photos | AI disclosure | Which label Remix and Me Meme outputs carry | UNKNOWN | — | — |

## 2. Gemini / Nano Banana

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Gemini | Image output | Visible watermark | "Gemini sparkle" visible watermark on images for the free and Google AI Pro tiers; removed for Google AI Ultra and in Google AI Studio | https://forklog.com/en/google-launches-pro-version-of-image-generator-nano-banana/ ; https://androidauthority.com/gemini-nano-banana-watermark-remove-apk-teardown-3691067 | [V-weak] |
| Gemini | Image output | Invisible watermark | SynthID on all generated media | https://forklog.com/en/google-launches-pro-version-of-image-generator-nano-banana/ | [V-weak] |
| Gemini | Image output | Watermark position and look | UNKNOWN in verified sources (see [B]) | — | — |
| Gemini | Image output | Re-generate with Pro | "Redo with Pro" (paid users re-generate with Nano Banana Pro) | https://forklog.com/en/google-launches-pro-version-of-image-generator-nano-banana/ ; https://yourstory.com/ai-story/google-nano-banana-pro-ai-image-tool-gemini | [V-weak] |
| Nano Banana | Viral figurine prompt (Sept 2025), opening sentence | Prompt text | "Create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment." | https://www.flexclip.com/jp/learn/nano-banana-ai-figure-generator.html ; https://poojasoni-newsletter.beehiiv.com/p/gemini-prompt-d433 | [V] (multiple sources agree) |
| Nano Banana | Viral figurine prompt, later clauses | Prompt text (fragments as returned) | "placed on a computer desk" · "round transparent acrylic base with no text on the base" · "The content on the computer screen is a 3D modeling process of this figurine" · "Next to the computer screen is a toy packaging box designed in a style reminiscent of high-quality collectible figures, printed with original artwork" · "two-dimensional flat illustrations" | https://www.flexclip.com/jp/learn/nano-banana-ai-figure-generator.html ; https://askfilo.com/user-question-answers-smart-solutions/using-the-nano-banana-model-create-a-1-7-scale-3338313433333038 | [V-weak] (fragments; full joined string is in [B]) |

## 3. Sora app: Cameos (consent surface)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Sora | Cameo setup | Entry | Profile or Settings → "Edit Cameo"; phone only (not desktop) | https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial ; https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide | [V-weak] |
| Sora | Cameo setup | Liveness: numbers | Read three random pairs of numbers aloud, for example "40 30 01". CONFLICT: another guide says "numbers 1-10" | https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial ; https://appfind.beehiiv.com/p/openai-s-sora-create-ai-videos-with-just-text-your-complete-setup-guide | [V-weak] |
| Sora | Cameo setup | Liveness: head turns | Turn your face twice, toward two of four directions (up, down, left, right), with the front camera, live | https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial | [V-weak] |
| Sora | Cameo setup | Duration | Short recording following on-screen prompts (one guide says about 5 s, another "about a minute" in total) | https://blog.laozhang.ai/en/posts/sora-2-character-creation-guide | [V-weak] |
| Sora | Cameo permissions | Option 1 | "Only me" | https://www.glbgpt.com/hub/how-to-use-sora-2-cameo-step-by-step-guide-pro-tips/ ; https://thebizaihub.com/?p=2321 | [V] (2+ sources; capitalization varies: "Only Me") |
| Sora | Cameo permissions | Option 2 | "People I approve" | same | [V] (capitalization varies: "People I Approve") |
| Sora | Cameo permissions | Option 3 | "Mutuals" (you follow them and they follow you) | same | [V] |
| Sora | Cameo permissions | Option 4 | "Everyone" | same | [V] |
| Sora | Cameo permissions | Teens | Teen accounts are limited to "Only me" or "People I approve" | https://thebizaihub.com/?p=2321 | [V-weak] |
| Sora | Cameo restrictions | Path | edit cameo → cameo preferences → restrictions | https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide | [V-weak] |
| Sora | Cameo restrictions | Example instructions (official post) | "don't put me in videos that involve political commentary" · "don't let me say this word" | https://x.com/billpeeb/status/1974969638300901817 | [V] |
| Sora | Cameo oversight | Drafts copy (paraphrase) | You can see drafts that include your likeness, even if someone else created them; you can remove or retake your cameo anytime; you can always remove videos that include your cameo | https://www.glbgpt.com/hub/how-to-prevent-sora-2-cameos-from-using-your-face/ ; https://zilliz.com/ai-faq/how-does-the-cameo-feature-work-in-sora-2-and-what-controls-do-users-have-over-their-likeness | [V-weak] (meaning verified, exact UI string UNKNOWN) |
| Sora | Cameo oversight | Revocation | Delete cameo videos or revoke future use; changes apply going forward | https://zilliz.com/ai-faq/how-does-the-cameo-feature-work-in-sora-2-and-what-controls-do-users-have-over-their-likeness | [V-weak] |
| Sora | Prompting | Mention syntax | "@yourusername" in a prompt inserts that cameo | https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial | [V-weak] |
| Sora | Watermark | Behavior | Visible moving watermark; later removed when a video uses **only your own** cameo | https://aiforbusinessowners.beehiiv.com/p/no-more-watermark-on-your-sora-2-video-if | [V-weak] |
| Sora | Cameos | Non-human cameos | Character cameos for pets and objects | https://theoutpost.ai/news-story/open-ai-s-sora-introduces-character-cameo-feature-turning-pets-and-objects-into-ai-video-stars-21347/ | [V-weak] |

## 4. Character.ai: memory panel

**Important:** sources report that the memory UI **changed on May 21, 2026**. The 400-character "Chat Memories" box is gone. Copying the old labels would copy a UI that no longer exists.

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Character.ai | Memory (before May 21, 2026) | Free-text box | "Chat Memories", 400-character limit | https://www.roborhythms.com/character-ai-adds-chat-memories/ ; https://blockchain.news/news/character-ai-enhances-user-experience-with-chat-memories-feature | [V-weak] |
| Character.ai | Memory (before) | Pins | "Pinned Memories", up to 15 per chat. CONFLICT: one source says 5 pins per chat as of Mar 2026 | https://www.roborhythms.com/character-ai-adds-chat-memories/ ; https://aicompanionpick.com/character-ai-memory-limitations-explained | [V-weak] |
| Character.ai | Memory (current, from May 21, 2026) | Section 1 | "Story Memory": background you write yourself; available to all users | https://www.roborhythms.com/character-ai-adds-chat-memories/ ; https://blockchain.news/zh/news/character-ai-memory-tools-launch | [V-weak] |
| Character.ai | Memory (current) | Section 2 | "Facts": recorded automatically while you chat; c.ai+ only | https://www.roborhythms.com/character-ai-adds-chat-memories/ | [V-weak] |
| Character.ai | Memory (current) | Section 3 | "Memory Usage": shows what currently fills the chat's memory | https://www.roborhythms.com/character-ai-adds-chat-memories/ | [V-weak] |
| Character.ai | Memory (current) | Where it lives | Notebook icon in the chat header, or "Memory" in the chat menu | https://www.roborhythms.com/character-ai-adds-chat-memories/ | [V-weak] |
| Character.ai | Memory (current) | Pin action | Long-press a message → "Pin"; the exact wording is locked into Story Memory; up to 15 per chat | https://www.roborhythms.com/character-ai-adds-chat-memories/ | [V-weak] |
| Character.ai | Memory (current) | Paid tier | c.ai+ gets twice as many memory pins and more detailed usage views | https://www.roborhythms.com/character-ai-adds-chat-memories/ | [V-weak] |
| Character.ai | Memory | Delete / unpin labels | UNKNOWN | — | — |

## 5. tbh and Gas: anonymous compliment polls

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| tbh | Store / brand line | Tagline | "the only anonymous app with positive vibes" | https://coolmomtech.com/2017/10/tbh-app-is-it-safe-for-kids/ ; https://www.entrepreneur.com/article/302834 | [V] |
| tbh | Poll card | Example questions | "Should DJ every party" · "Hotter than the sun" | https://coolmomtech.com/2017/10/tbh-app-is-it-safe-for-kids/ | [V-weak] |
| tbh | Poll card | Answer options | Four friends' names | https://coolmomtech.com/2017/10/tbh-app-is-it-safe-for-kids/ ; https://www.fortune.com/2017/09/19/tbh-friend-reviews | [V] |
| tbh | Poll card | Buttons | "shuffle" (new set of friends) and "skip" (skip the question); case as written in the article | https://coolmomtech.com/2017/10/tbh-app-is-it-safe-for-kids/ | [V-weak] |
| tbh | Rewards | Gems | Gems are pink if a girl picked you, blue if a boy did; gems unlock more questions | https://coolmomtech.com/2017/10/tbh-app-is-it-safe-for-kids/ | [V-weak] |
| tbh | Context | Acquisition | Bought by Facebook about 3 months after launch (Oct 2017) | https://www.entrepreneur.com/article/302834 | [V] |
| Gas | Poll card | Layout | Polls with four names; names can be shuffled or skipped | https://elcidonline.com/culture/2022/12/07/gas-the-newest-social-media-app-and-its-affect-on-children/ ; https://schools.gabb.com/blog/is-the-gas-app-dangerous/ | [V-weak] |
| Gas | Inbox | Received votes | "flames"; colored by the voter's gender: blue (boys), pink (girls), purple (non-binary) | https://schools.gabb.com/blog/is-the-gas-app-dangerous/ ; https://berkeleyhighjacket.com/2023/features/gas-app-captures-short-lived-attention-of-social-media-users | [V-weak] |
| Gas | Paywall (**to omit**) | God Mode | "God Mode", $6.99/week: reveals two names per week, unlimited hints, double coins from polls | https://www.businessofapps.com/?p=82561 ; https://entrepreneur.com/article/437444 | [V-weak] |
| Gas | Context | Acquisition | Discord acquired Gas (Jan 2023) | https://techcrunch.com/2023/01/17/discord-acquires-gas-a-compliments-based-social-media-app-for-teens/ | [V] |
| tbh / Gas | Poll card | Background colors, emoji placement | UNKNOWN in verified sources (see [B]) | — | — |

## 6. Gartic Phone

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Gartic Phone | Round flow | Step order | Write a sentence → Draw (the sentence you receive) → Describe (the drawing you receive) → repeat until the chains are complete | https://progameguides.com/gartic-phone/how-to-play-gartic-phone/ ; https://instruction.kodewithklossy.com/brain-breaks/gartic-phone/ | [V] (step names; exact on-screen casing UNKNOWN) |
| Gartic Phone | Draw step | Layout | Blank "paper", with the phrase to draw shown at the top | https://www.liverpool.ac.uk/researcher/postdoc-appreciation-week/npdc/engagement/pre-conference/gartic-telephone/ | [V-weak] |
| Gartic Phone | Draw / Describe steps | Submit button | "Done", bottom right; auto-submits when the timer runs out | https://www.liverpool.ac.uk/researcher/postdoc-appreciation-week/npdc/engagement/pre-conference/gartic-telephone/ | [V-weak] |
| Gartic Phone | Describe step | Layout | Drawing shown; text input at the bottom | https://www.liverpool.ac.uk/researcher/postdoc-appreciation-week/npdc/engagement/pre-conference/gartic-telephone/ | [V-weak] |
| Gartic Phone | End of round | Album | Results show each original sentence and how it changed; players "flip through every album"; the host can customize how the album is presented | https://medium.com/gartic/the-ultimate-gartic-phone-guide-all-modes-explained-805404f94948 ; https://medium.com/gartic/unlocking-gartic-phone-how-to-fully-customize-your-gartic-phone-match-3c3d67f418de | [V-weak] |
| Gartic Phone | Lobby | Mode names (partial) | Normal · Knock-Off · Animation · Background · Solo · Secret · Masterpiece · Compliment Sandwich | https://www.thegamer.com/gartic-phone-all-game-modes-ranked/ ; https://medium.com/gartic/the-ultimate-gartic-phone-guide-all-modes-explained-805404f94948 | [V-weak] |
| Gartic Phone | Album | Replay control labels | UNKNOWN | — | — |

## 7. Wordle (NYT): share text

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Wordle | Share text | Header line | `Wordle 1,234 3/6` (puzzle number, then guesses used / 6) | https://ataglance.randstad.com/en/how-to-share-wordle-results.html ; https://opensource.com/article/22/1/open-source-accessibility-wordle | [V-weak] |
| Wordle | Share text | Grid | One row of 5 square emoji per guess, up to 6 rows; the answer is not revealed | https://opensource.com/article/22/1/open-source-accessibility-wordle ; https://www.bostonglobe.com/2022/01/09/lifestyle/what-is-wordle-why-is-everyone-twitter-playing-it | [V] |
| Wordle | Share text | Color meaning | Green = right letter, right spot; yellow = in the word, wrong spot; grey = not in the word | https://opensource.com/article/22/1/open-source-accessibility-wordle | [V] |
| Wordle | Share text | Absent-tile emoji | ⬛ (dark) / ⬜ (light): see [B]. Emojipedia lists ⬛ for Wordle use | https://emojipedia.org/%E2%AC%9B | [V-weak] |

## 8. Jackbox

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Jackbox | Lobby (TV) | Join instructions | Go to "jackbox.tv" and enter the four-letter room code shown in the lobby | https://support.fanatical.com/hc/en-us/articles/360000732457-Playing-Jackbox-Games ; https://jackboxgames.com/the-jackbox-party-pack-5-streamers-guide/ | [V] |
| Jackbox | Lobby | Host role | The first player to connect is the "VIP" | https://support.fanatical.com/hc/en-us/articles/360000732457-Playing-Jackbox-Games | [V] |
| Jackbox | Lobby (VIP phone) | Start button | "Everybody's in" (VIP taps it to start). Casing in the UI is UNKNOWN | https://support.fanatical.com/hc/en-us/articles/360000732457-Playing-Jackbox-Games ; https://steamcommunity.com/app/442070/discussions/0/358415206096198643 | [V] |
| Jackbox | Settings | Audience toggle | "Audience" setting, on by default; up to 10,000 audience members | https://jackboxgames.com/the-jackbox-party-pack-5-streamers-guide/ | [V] |
| Jackbox | Audience | Audience role | Audience members vote in polls and help pick the best prompts | https://jackboxgames.com/the-jackbox-party-pack-5-streamers-guide/ | [V-weak] |
| Jackbox | jackbox.tv | "Join Audience" exact label | UNKNOWN in verified sources (see [B]) | — | — |

## 9. iMessage and Apple Invites

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Messages (iOS 18+) | Tapback | Classic set (6) | heart · thumbs-up · thumbs-down · laughter ("Haha") · exclamation points · question mark | https://support.apple.com/guide/messages/icht504f698a ; https://iphonelife.com/content/iphone-tapback-imessage-emojis | [V] |
| Messages (iOS 18+) | Tapback | Extended set | "any sticker, Memoji, or emoji" | https://support.apple.com/guide/messages/icht504f698a | [V] |
| Messages | Tapback | OS requirement | macOS Sequoia, iOS 18, iPadOS 18, watchOS 11, visionOS 2 or later, on both sender and recipient | https://support.apple.com/guide/messages/icht504f698a | [V] |
| Messages | Tapback | Rendering on the bubble | UNKNOWN in verified sources (see [B]) | — | — |
| Messages | Sticker drawer | Labels | UNKNOWN in verified sources (see [B]) | — | — |
| Apple Invites | RSVP sheet | Choices | "Going" · "Not Going" · "Maybe" | https://support.apple.com/guide/apple-invites/DEVC9D9CDBD5 | [V] |
| Apple Invites | RSVP sheet | Confirm button | "Send Reply" | https://support.apple.com/guide/apple-invites/DEVC9D9CDBD5 | [V] |
| Apple Invites | Guest list | Groups | Going · Not Going · Maybe · Not Responded | https://support.apple.com/guide/apple-invites/DEVC9D9CDBD5 ; https://support.apple.com/en-au/guide/apple-invites/dev851dd16db/ios | [V] |
| Apple Invites | Event page | Shared content | Shared photo album and shared music playlist; open to guests after they RSVP (needs an Apple Account; iCloud.com RSVPs cannot add items) | https://support.apple.com/guide/apple-invites/DEVC9D9CDBD5 | [V] |

## 10. WhatsApp

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| WhatsApp | Sticker pack spec | Sticker image | 512 × 512 px, WebP, transparent background, ≤ 100 KB each | https://moda.app/resources/sizes/whatsapp-sticker ; https://www.lilachbullock.com/create-whatsapp-stickers-ai-free/ | [V-weak] (third-party, consistent) |
| WhatsApp | Sticker pack spec | Tray icon | 96 × 96 px | https://moda.app/resources/sizes/whatsapp-sticker | [V-weak] |
| WhatsApp | Sticker pack spec | Pack size | Minimum 3, maximum 30 stickers | https://moda.app/resources/sizes/whatsapp-sticker ; https://cf-production.makeemoji.com/blog/whatsapp-custom-stickers-how-to-create | [V-weak] |
| WhatsApp | Sticker maker (Web) | Entry | Paperclip icon → "Sticker" → upload an image | https://stuff.co.za/2021/11/25/make-whatsapp-stickers-on-its-web-app-now/ | [V-weak] |
| WhatsApp | Sticker maker (Web) | Tools | Draw an outline to cut out the subject; add emoji, text and other stickers on top | https://stuff.co.za/2021/11/25/make-whatsapp-stickers-on-its-web-app-now/ | [V-weak] |
| WhatsApp | Events | Entry | In a group: "+" → "Event"; fields: event name, date, time, location, description | https://gulfnews.com/technology/whatsapp-organising-a-party-heres-how-to-create-an-event-1.1731925032656 ; https://en.androidguias.com/How-to-organize-meetings-in-groups-of-friends-easier-than-ever-with-WhatsApp-events/ | [V-weak] |
| WhatsApp | Event card | RSVP labels | "Going" · "Maybe" · "Can't go". CONFLICT: another result lists only "Going" / "Can't go". "Not going" was **not** found | https://gulfnews.com/technology/whatsapp-organising-a-party-heres-how-to-create-an-event-1.1731925032656 ; https://onlinemarketing.de/?p=339406 | [V-weak] |
| WhatsApp | Polls | Entry and fields | Paperclip → "Poll"; "Question" field; up to 12 options | https://www.igeeksblog.com/how-to-create-poll-on-whatsapp/ ; https://getkanal.com/blog/how-to-create-a-poll-on-whatsapp | [V] |
| WhatsApp | Polls | Multi-select toggle | "Allow multiple answers" (on by default) | https://www.igeeksblog.com/how-to-create-poll-on-whatsapp/ ; https://www.guidingtech.com/fix-whatsapp-poll-not-showing-working/ | [V] |
| WhatsApp | Composer | Placeholder | UNKNOWN in verified sources (see [B]) | — | — |

## 11. iOS 27 Photos: Shared Albums

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Photos (iOS 27) | New shared album | Options button | "Sharing Options" (invite and approve participants, or share by link) | https://support.apple.com/ml-in/127875 | [V] |
| Photos (iOS 27) | New shared album | Temporary toggle | "Make Album Temporary" | https://support.apple.com/ml-in/127875 | [V] |
| Photos (iOS 27) | Shared album | Settings entry | "Manage Shared Album" (turn off Make Album Temporary to keep the album) | https://support.apple.com/ml-in/127875 | [V] |
| Photos (iOS 27) | Shared album | Invite | Share button → Messages, Mail, or copy link | https://support.apple.com/ml-in/127875 | [V] |
| Photos (iOS 27) | Temporary album | Rules | Auto-deletes after 30 days; does not use iCloud storage; does not need iCloud Photos; up to 5,000 photos and videos. Turning the temporary setting off makes the album count toward storage | https://support.apple.com/ml-in/127875 ; https://www.idownloadblog.com/?p=1059312 | [V] |
| Photos (iOS 27) | Shared album | Countdown label (for example "Expires in 30 days") | UNKNOWN | — | — |
| Photos (iOS 27) | Shared album | Reactions | Any emoji | https://www.idownloadblog.com/?p=1062129 ; https://www.idropnews.com/ios-27/ios-27-icloud-shared-albums-overhaul/266144/ | [V-weak] |
| Photos (iOS 27) | Shared album | Activity | Comments and activity log | https://www.idownloadblog.com/?p=1062129 | [V-weak] (exact labels UNKNOWN) |
| Photos (iOS 27) | Shared album | Roles | Manage the whole album / only add photos / only view and comment | https://www.idropnews.com/ios-27/ios-27-icloud-shared-albums-overhaul/266144/ ; https://ente.com/articles/ios-27-shared-albums/ | [V-weak] (exact labels UNKNOWN) |
| Photos (iOS 27) | Shared album | Quality and storage | Permanent shared albums now upload at full resolution and count toward iCloud storage | https://www.idownloadblog.com/?p=1062129 ; https://thenote.app/post/en/ios-27-shared-albums-go-full-res-at-the-cost-of-your-icloud-storage-xrcisfpacy | [V-weak] |
| Photos (iOS 27) | Shared album | Non-Apple participants | Android and Windows users can add content | https://www.idownloadblog.com/?p=1062129 | [V-weak] |

---

## BACKGROUND KNOWLEDGE [B]

These rows were **not verified** in this round. Do not ship any of them as "exact" until someone checks them against a screenshot or an official page.

| App | Surface | Element | Value (unverified) | Confidence | Tag |
|---|---|---|---|---|---|
| Google Photos | Global | Font | Google Sans / Google Sans Text (Product Sans family). Historically proprietary and not licensed for third-party apps; an open "Google Sans Flex" release was reported in late 2025 | high (font in use) / medium (licensing detail) | [B] |
| Google Photos | Memories | Card design | Rounded-rectangle cover card at the top of Photos; "N years ago" style titles where the large year number is shown as a cutout or over-image numeral | low-medium | [B] |
| Google Photos | Remix | Extra styles | Style list has grown since launch (later additions reported); current full list not verified | low | [B] |
| Gemini | Image output | Visible watermark look and position | Small semi-transparent white four-point Gemini sparkle ✦ in the **bottom-right** corner | medium-high | [B] |
| Nano Banana | Figurine prompt | Full common version (joined) | "Create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is a 3D modeling process of this figurine. Next to the computer screen is a toy packaging box, designed in a style reminiscent of high-quality collectible figures, printed with original artwork. The packaging features two-dimensional flat illustrations." | medium-high | [B] |
| Nano Banana | Figurine prompt | Common variant | "...The content on the computer screen is the ZBrush modeling process of this figurine. Next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork." (names third-party trademarks) | medium | [B] |
| Sora | Cameos | Feature renamed | After a trademark suit by Cameo (Baron App) and a court order in late 2025, OpenAI reportedly renamed "cameos" to **"characters"**. A search result URL ("sora-2-character-creation-guide") hints at this. The current live label may not be "Cameo" | medium | [B] |
| Sora | Watermark | Look and motion | Sora cloud logo plus "Sora" wordmark and the creator's @username, semi-transparent white, jumping between corners and edges of the frame every few seconds | medium-high | [B] |
| Sora | Cameo permissions | Section title | "Cameo permissions" / "Who can use this cameo" | low | [B] |
| tbh | Poll card | Layout | Full-screen solid or gradient color that changes each question; an emoji above the question text; 2×2 grid of white rounded name buttons; Shuffle and Skip under the grid; progress shown as "N of 12" | medium (layout) / low (exact count) | [B] |
| Gas | Poll card | Layout | Same tbh pattern (same founder): bright solid background per question, large emoji above the question, 4 name pills in 2×2, "Shuffle" and "Skip" below | medium | [B] |
| Gas | Inbox | Notification copy | "A girl in 11th grade picked you" style ("from a girl"/"from a boy" and grade); the flame icon is tinted by gender | medium | [B] |
| Gas | Context | Shutdown | Discord shut Gas down in Nov 2023 | high | [B] |
| tbh | Context | Shutdown | Facebook shut tbh down in July 2018 | high | [B] |
| Gartic Phone | Screens | Header strings | Write step: "WRITE A SENTENCE"; draw step header about drawing "this sentence"; describe step about describing "this scene". All caps, chunky display font, hand-drawn look, timer at top | low (exact wording) / medium (all-caps style) | [B] |
| Gartic Phone | Album | Controls | Host advances chains one step at a time; options to show next / skip to next album; download album as GIF or image | low-medium | [B] |
| Wordle | Share text | Full format | Line 1 `Wordle 1,234 3/6` (comma from #1,000 onward); a blank line; then rows such as `⬛🟨⬛⬛⬛` … `🟩🟩🟩🟩🟩`. Hard mode adds `*` (`3/6*`); a loss shows `X/6` | high | [B] |
| Wordle | Share text | Absent emoji by theme | ⬛ in dark theme, ⬜ in light theme | high | [B] |
| Wordle | Share text | High-contrast mode | 🟧 (correct) and 🟦 (present) replace 🟩 and 🟨 | high | [B] |
| Wordle | Tile colors | Hex (light) | green #6AAA64, yellow #C9B458, grey #787C7E | medium-high | [B] |
| Wordle | Tile colors | Hex (dark) | green #538D4E, yellow #B59F3B, grey #3A3A3C | medium-high | [B] |
| Wordle | Fonts | NYT fonts | Tiles and UI use NYT Franklin; the title uses NYT Karnak (proprietary) | medium | [B] |
| Jackbox | jackbox.tv | Join form | Fields "ROOM CODE" and "NAME"; button "PLAY"; when the room is full or the game has started the button becomes "JOIN AUDIENCE" | medium | [B] |
| Jackbox | Lobby | Start label casing | "EVERYBODY'S IN" in caps on the VIP's phone | medium | [B] |
| Messages | Tapback | Rendering | The reaction shows as a small badge bubble at the top corner of the reacted message; in iOS 18 the 6 classic Tapbacks were redrawn with color; emoji Tapbacks show the emoji itself; several reactions stack | medium | [B] |
| Messages | Sticker drawer | Labels | "+" menu → "Stickers"; "Add Sticker" from a photo subject; Live Sticker effects "Original", "Shiny", "Puffy", "Comic", "Stroke" | medium-high (effects) / medium (drawer) | [B] |
| Messages | Font | System font | SF Pro (licensed for Apple-platform UI only) | high | [B] |
| WhatsApp | Composer | Placeholder | "Message" (Android). iOS composer placeholder may be blank | medium-high (Android) / low (iOS) | [B] |
| WhatsApp | Sticker maker (mobile) | Entry and tools | Sticker tab in the emoji/sticker picker → "Create sticker" → pick a photo; tools: auto cutout, text, draw, add sticker/emoji | medium | [B] |
| WhatsApp | Sticker spec | Extras | Tray icon PNG ≤ 50 KB; animated stickers ≤ 500 KB; stickers must have a transparent background and a ~16 px margin | medium | [B] |
| Photos (iOS 27) | Temporary album | Countdown label | A countdown such as "Expires in N days" in the album header | low | [B] |

---

## Gaps (UNKNOWN after 26 searches)

1. Google Photos: on-screen **order** of Create-tab tiles; tile icons and colors; Me Meme **compare toggle** label; Me Meme template names; whether Remix and Me Meme outputs show "Edited with Google AI" or "Made by Google AI"; Memories card design ("N years ago" cutout) not verified.
2. Gemini: exact position, size and opacity of the visible sparkle watermark (only its existence and tiering were verified).
3. Sora: exact on-screen copy for cameo recording prompts (the conflict between "three random pairs of numbers" and "numbers 1-10" is unresolved); exact strings for drafts-with-your-cameo and revoke; watermark look and motion; whether the feature is now labeled "Characters" instead of "Cameos".
4. Character.ai: delete and unpin labels; character limits for Story Memory (post-May 2026); the 15 vs. 5 pin-limit conflict.
5. tbh / Gas: background colors and gradients, emoji placement, button casing ("Shuffle" vs "shuffle"), inbox notification strings. No primary source (App Store screenshots or TechCrunch launch copy) was reached.
6. Gartic Phone: exact step headers, album and replay control labels, color and font.
7. Wordle: no official NYT page was reached for the share format; the format rests on secondary sources plus [B].
8. Jackbox: exact "Join Audience" and "Room Code" field labels on jackbox.tv.
9. iMessage: Tapback rendering and sticker-drawer labels were not verified.
10. WhatsApp: official faq.whatsapp.com wording for event RSVP ("Can't go" vs "Not going") and the in-app mobile Sticker maker labels; the composer placeholder.
11. iOS 27: temporary-album countdown label, activity-log labels, and exact role/permission labels.

## Risk notes for the product team (factual, from the rows above)

- Several "exact" items are **trademarks, logos or proprietary fonts**: the Gemini sparkle, the Sora logo watermark, "Wordle", "Tapback", "Me Meme", "Everybody's in" (Jackbox), Google Sans, SF Pro, NYT Franklin/Karnak. Copying them verbatim into another app may raise IP issues. This needs legal review before shipping.
- The Character.ai memory UI (May 2026) and possibly Sora's "Cameo" naming have **changed**. A copy of the older UI would not match the current source apps.
