# Dossier 06: AI objects, iOS system surfaces, party games, memory apps

Compiled: 2026-10-07. Researcher role: report only what sources show or say. No design opinions or recommendations appear in this document.

## Method and reliability notes (read first)

- Tool: WebSearch only. 33 searches were run before the shared, per-turn WebSearch budget (200 calls across all agents) ran out. No pages were opened directly, because WebFetch, Firecrawl and curl are blocked or off-limits. As a result, **every fact below comes from search-engine result summaries and page titles, not from reading the full pages.**
- For each WebSearch call, the tool returned a list of result URLs and a synthesized summary. The summary does not always say which URL each sentence came from. Where a claim cannot be pinned to one page, it cites the most likely URL(s) from that result set and is marked "(attribution: result set)".
- Confidence tags:
  - `[multi]`: two or more independent sources agree.
  - `[single]`: one source.
  - `[inferred]`: researcher interpretation, kept rare and labelled.
- Text inside quotation marks is quoted exactly as the search result returned it. It may still differ slightly from the live UI.
- Sections 5–8 (party games, memory apps, Series, Character.ai) and several Apple items could **not be researched** before the budget ran out. They are marked UNKNOWN and listed under Gaps.

---

## 1. Google Photos

### 1.1 Create tab: placement and entry point
- The Create tab sits between **Collections** and **Ask/Search** in the bottom navigation and uses a **paintbrush icon**. [single] https://9to5google.com/2025/08/13/google-photos-create-tab/
- It started rolling out with Google Photos **version 7.40 on Android**. [single] https://9to5google.com/2025/08/13/google-photos-create-tab/
- Google says the tab is "one place" for creation tools: Photo to video, Remix, collages, highlight videos "and more". The U.S. rollout began in August 2025. [multi] https://blog.google/products/photos/photo-to-video-remix-create-tab/ , https://9to5google.com/2025/08/13/google-photos-create-tab/ , https://www.tomsguide.com/ai/google-gemini/google-photos-adds-a-create-tab-to-turn-your-photos-into-something-new-heres-what-we-know

### 1.2 Create tab: the "Your tools" grid
The tools grid is reported under the heading **"Your tools"**. Each tile has a one-line description, quoted here as reported. [single] https://9to5google.com/2025/08/13/google-photos-create-tab/ (the same list also came back for https://blog.google/products/photos/google-photos-create-tab-editing-tools/; attribution: result set)

| Tile | Description text as reported |
|---|---|
| Animations | "A quick-moving GIF of selected photos and videos" |
| Cinematic photos | "A 3D effect added to photos" |
| Collage | "Combine multiple photos in one stylish layout" |
| Highlight videos | "A video with music that uses photos and videos" |
| Photo to video | "Animate your photo and turn static moments into dynamic six-second video clips" (this wording may come from Google's blog rather than the tile) |
| Remix | "Transform your photos into different styles like 'Anime'" |

- The order of the tiles, their icons, colours, the tile shape and the grid column count are **UNKNOWN**.
- **Photo to video:** the user picks a photo, then picks one of two prompts, **"Subtle movements"** or **"I'm feeling lucky"**. The output is a six-second clip. [single] https://blog.google/products/photos/photo-to-video-remix-create-tab/
- Photo to video was later upgraded to Google's **Veo 3** model. [multi] https://blog.google/products/photos/google-photos-create-tab-editing-tools/ , https://www.bgr.com/1958772/google-photos-veo-3-video/

### 1.3 Create tab: reported redesign (in development)
- An in-development redesign is reported. It adds a header with suggestions such as **"Professional headshot"** and **"Slow pan of your fav"**, a new carousel titled **"Popular"** that shows trending templates, and "slightly narrower" suggestion items under the sections **"Reimagine your moments"** and **"Art styles"**. [single] (attribution: result set) https://androidauthority.com/google-photos-customize-collections-3694702 , https://9to5google.com/2025/08/13/google-photos-create-tab/
- Whether this redesign shipped is UNKNOWN.

### 1.4 Remix style chips
- **Launch set (July/Aug 2025): four styles**, named in coverage as **3D animation, Anime, Sketch, Comic book**. [multi] https://www.androidauthority.com/google-photos-remix-tool-3587005 , https://techcrunch.com/2025/07/23/google-photos-adds-ai-features-for-remixing-photos-in-different-styles-turning-pics-into-videos , https://blog.google/products/photos/photo-to-video-remix-create-tab/
- Remix is powered by Google's **Imagen** model. After a result appears, the screen shows a **"regenerate"** option plus save and share buttons. [single] https://www.androidauthority.com/google-photos-remix-tool-3587005
- **December 11, 2025:** Remix expanded to 13 regions, and the style catalogue grew **from 4 to 13**. The styles include **8-bit, watercolor, stickers and enamel pins**. 9to5Google says the feature "doesn't appear to name each style individually". [single] https://9to5google.com/2025/12/11/google-photos-remix-wide-rollout/
- **Conflicting list:** a secondary site lists 13 named styles: "Pen sketch", "Collectible figurine", "Soft watercolor paints", "Professional headshot", "Dramatic black & white photo", "Cute chibi art style sticker", "Rich oil painting masterpiece", "Fashion photoshoot", "Iconic art deco patterns", "Custom enamel pin", "Sun-worn vintage look", "Film grain effect", "Instant film with flash". [single, low reliability: it conflicts with 9to5Google on naming and does not include 8-bit] (attribution: result set) https://www.rokform.com/blogs/rokform-blog/google-photos-remix-features , https://techmitra.in/google-photos-ai-remix-tool/
- **Later expansion:** Google Photos' official X account posted, verbatim: "You asked and we delivered 😉Google Photos is rolling out 20+ new Remix templates so you can get in on the latest viral trends. You can create: 💐 Custom watercolor cards perfect for those "congrats" moments 📸 An epic microwave angle that you've been seeing all over your feed". [single] https://x.com/googlephotos/status/2049551137611956515
- The chips' visual form (thumbnail or text pill, size, selected state) is **UNKNOWN**.

### 1.5 "Me Meme" flow
- **Entry path:** Photos > **Create** > **Me Meme**. [multi] https://9to5google.com/2026/01/22/google-photos-me-meme/ , https://www.androidheadlines.com/2026/01/google-photos-me-meme-ai-feature-launch.html
- **Launch:** rolled out around January 22–23, 2026, as an **experimental** feature for U.S. users, in phases. [multi] https://9to5google.com/2026/01/22/google-photos-me-meme/ , https://techcrunch.com/2026/01/23/google-photos-latest-feature-lets-you-meme-yourself , https://www.androidauthority.com/google-photos-me-meme-rollout-3634849/
- **Model:** Gemini's **Nano Banana** image family. [single] https://www.androidheadlines.com/2026/01/google-photos-me-meme-ai-feature-launch.html
- **Step 1, template picker:** the user picks a template from presets or can "upload your own funny picture" as a reference. [multi] https://9to5google.com/2026/01/22/google-photos-me-meme/ , https://www.androidcentral.com/apps-software/ever-wanted-to-be-a-meme-this-google-photos-update-lets-you-do-it-in-style
- **Step 2, selfie picker:** the user picks a "prominent selfie or a photo where your face is clearly visible". It should be "well-lit, focused, and front-facing". [single, quoted copy] https://9to5google.com/2026/01/22/google-photos-me-meme/
- **Step 3, result actions:** save to library, **regenerate**, share, **send feedback**, and **compare** the original photo with the generated meme. [single] https://9to5google.com/2026/01/22/google-photos-me-meme/
- **Pre-launch teardown:** the feature was found in Google Photos **v7.51.0**. The onboarding image used the **"This is fine"** dog meme, and it was the only template at that point. The feature required a **backed-up** reference photo. [multi] https://www.androidauthority.com/google-photos-meme-generator-apk-teardown-3609502/ , https://www.digitaltrends.com/phones/google-photos-next-ai-trick-puts-your-face-in-classic-memes/
- Exact button labels (for example "Generate", "Try again" or "Compare"), the onboarding headline copy and the layout are **UNKNOWN**. Only the quoted fragments above were found.

### 1.6 AI disclosure label (SynthID / "AI info")
- When a user swipes up on an image, the **Details** section shows an **"AI info"** section. Its icon is an **'i' badged with a sparkle**. It sits alongside file name, backup status and location. [multi] https://9to5google.com/2024/10/24/google-photos-ai-edit-info/ , https://androidcentral.com/apps-software/google-photos-gen-ai-edit-notes-details
- **Fields:** a **"Credit"** field reads **"Edited with Google AI"**, or **"Made by Google AI"** for Pixel Studio and Gemini output. A **"Digital source type"** field shows values such as **"Edited using Generative AI"**, which covers Magic Editor, Magic Eraser and Zoom Enhance. [multi] https://9to5google.com/2024/10/24/google-photos-ai-edit-info/ , https://androidcentral.com/apps-software/google-photos-gen-ai-edit-notes-details
- The label string found is "Edited with Google AI". The brief's wording, "Edited with AI", was **not** found verbatim.
- **SynthID** is an invisible watermark from Google DeepMind and is described as surviving common edits. [multi] https://www.slashgear.com/1872528/how-to-use-google-verify-images-not-ai , https://nextpit.com/google-photos-ai-labels-identify-edited-generated-images
- The label's colour and type size, and whether any on-photo badge exists, are **UNKNOWN**.

### 1.7 Memories carousel
- On Android, the Memories row uses the animated **Material You carousel**. The centre of each image stays mostly visible while scrolling horizontally. Items contract and expand as they leave and enter the edges. Photos uses a variant that **does not change the items' aspect ratio**. [single] https://9to5google.com/2023/05/11/material-3-carousel/
- **Redesign:** for "X years ago" memories, the photo is **cut into the shape of the number** and placed on a **bold coloured background**. Other memories, such as "on this day", get **abstract cut-out shapes** on varying background colours. [single] https://www.androidauthority.com/google-photos-memories-carousel-redesign-3636414
- Specific colours (hex values), shape set and card dimensions are **UNKNOWN**.

### 1.8 Google Photos design language
- Google Photos is one of the Google apps getting **Material 3 Expressive** updates. M3 Expressive was announced in May 2025 and is described as "more fluid" with "natural, springy animations". [multi] https://9to5google.com/2025/09/08/google-material-3-expressive-redesign/ , https://www.androidauthority.com/google-photos-material-3-expressive-redesign-apk-3559929
- **Album view:** the old design was replaced by an **M3 Expressive toolbar** with Share, Add photos and Edit. [single] https://9to5google.com/2025/06/02/google-photos-albums-redesign/
- **Homepage (in development):** the app name at the top is replaced by the app **icon**, with a new **M3 Expressive loading animation**. [single] https://www.androidauthority.com/google-photos-material-3-expressive-redesign-apk-3559929
- **Typeface (Google Sans / Google Sans Flex):** **UNKNOWN**. No result confirmed which typeface Photos uses.

---

## 2. Gemini app / Nano Banana

### 2.1 Background
- "Nano Banana" was the internal codename. The model launched as **Gemini 2.5 Flash Image** in late August 2025. [multi] https://decrypt.co/?p=338994 , https://foxdata.com/en/blogs/nano-banana-craze-why-everyone-is-talking-about-googles-viral-3d-figurine-ai/

### 2.2 Figurine trend: prompt text
Two near-identical variants circulated. Both are quoted exactly as the search results returned them.

- **Variant A** (Threads post, full text in the page title). The X post by @RogerAderly matches it up to where the title truncates. [multi]
  > "Using the model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is the Zbrush modeling process of this figurine. Next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork. The packaging features two-dimensional flat illustrations"

  https://www.threads.com/@dr.maria4711/post/DOKSZyyEjpi/using-the-model-create-a-17-scale-commercialized-figurine-of-the-characters-in-t , https://x.com/RogerAderly/status/1965169975091495355 (X version begins "Prompt: Create a 1/7 scale commercialized figurine of the characters in the picture…")
- **Variant B** (reported across several prompt-collection pages). [single] (attribution: result set) https://dev.to/safdarali25/turning-a-photo-into-a-17-scale-pvc-figurine-with-bandai-style-packaging-587k , https://fotor.com/blog/nano-banana-model-prompts/
  > "Use the nano-banana model to create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork."

### 2.3 Figurine trend: how the images look
- The images show **1/7 scale collectibles on clear acrylic bases**, often beside **packaging boxes** and **computer screens showing 3D modelling software**. [multi] https://foxdata.com/en/blogs/nano-banana-craze-why-everyone-is-talking-about-googles-viral-3d-figurine-ai/ , https://decrypt.co/?p=338994
- They are described as "Bandai-style figurines that look pulled from a Tokyo toy store shelf". [single] https://decrypt.co/?p=338994

### 2.4 Retro Polaroid trend: prompt text
No single canonical prompt was confirmed. The following variants were reported, quoted exactly.

- **Celebrity / two-person variant:**
  > "Take a Polaroid style photo. The image should look like a casual snapshot with me and [insert celebrity or character name]. Add a soft blur and keep the lighting consistent as if a flash went off in a dark room. Keep faces unchanged. Change the background to a white curtain."

  [single] (attribution: result set) https://www.thedailyjagran.com/viral/how-to-make-gemini-ai-viral-polaroid-style-images-with-celebrities-trend-know-the-exact-prompt-to-try-10267362 , https://www.bizzbuzz.news/technology/gemini-ai-trend-how-to-create-polaroid-style-celebrity-pics-with-simple-prompts-1372039
- **"Hug my younger self" variants:** [single each] (attribution: result set) https://www.cyberlink.com/blog/trending-topics/4252/hug-my-younger-self-ai-gemini , https://www.perfectcorp.com/consumer/blog/selfie-editing/hug-my-younger-self-ai-gemini
  > "Create a cute polaroid picture of my older self hugging my younger self. Add film grain and a slight blur to make it look like a vintage photo."

  > "Take a Polaroid-style photo: the adult self gently lifting and holding the younger self in a warm embrace, faces unchanged, slightly blurred with flash-like lighting, and a background of white curtains fading into a soft sky-blue gradient. Keep the faces exactly the same without any changes."
- **Look:** results favour "warm, nostalgic lighting, Polaroid-like framing, and soft textures". [single] (attribution: result set) https://www.perfectcorp.com/consumer/blog/selfie-editing/hug-my-younger-self-ai-gemini

### 2.5 Visible Gemini watermark
- **Position:** bottom-right corner of the image. [multi] https://androidauthority.com/gemini-nano-banana-watermark-remove-apk-teardown-3691067 , https://discuss.ai.google.dev/t/regression-forced-visible-star-watermark-breaks-gemini-nano-banana-pro-image-to-image-and-flow-frame-to-video-workflows/114193 , https://helentech.jp/news-nano-banana-watermark-setting-leak-89190/
- **Look:** a four-point "cross-star", which a Google developer-forum thread calls a "STAR"/sparkle watermark. [multi] (same sources as Position)
- **Size and margin** (third-party reverse-engineering, not a Google statement): two sizes of alpha-blended logo.
  - **48×48 px with a 32 px margin**.
  - **96×96 px with a 64 px margin**.
  - The size is chosen automatically by image dimensions. The exact dimension threshold was not returned.

  [single] https://github.com/allenk/GeminiWatermarkTool
- The same tool reports that a newer "Gemini 3.5 watermark layout" **moved the watermark position and changed its alpha map**. [single] https://github.com/allenk/GeminiWatermarkTool
- Google is reportedly working on an option to create images **without** the visible watermark. [single] https://androidauthority.com/gemini-nano-banana-watermark-remove-apk-teardown-3691067
- All Nano Banana outputs also carry an invisible **SynthID** watermark. [multi] https://vercel.com/ai-gateway/models/gemini-2.5-flash-image/about , https://unifically.com/de/blogs/nano-banana
- The watermark's colour and opacity value are **UNKNOWN**.

---

## 3. Sora app (launched Sept 30, 2025): Cameos

- **Launch:** the Sora app, built on Sora 2, launched Sept 30, 2025. Friends can use each other's "cameos". [multi] https://www.axios.com/2025/09/30/openai-sora-app-social-ai , https://www.nbcnews.com/tech/tech-news/openai-announces-sora-2-ai-video-audio-app-rcna234753

### 3.1 Cameo recording and verification
- **Entry point:** "Create a Cameo", from the profile or the plus menu. The app asks for camera and microphone permissions. [single] (attribution: result set) https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide
- **Recording:** the user reads numbers aloud while moving their head as prompted (straight ahead, right, down and so on). [multi] https://lilys.ai/en/notes/how-to-use-sora-20251021/use-cameo-in-sora-two-guide , https://book.st-hakky.com/en/data-science/sora2-cameo-ai-avatar-video
- **Liveness check detail:** the user reads **three random pairs of numbers** (example given: "40 30 01"), then turns their face twice, toward two of four directions (up, down, left, right). [single] (attribution: result set) https://book.st-hakky.com/en/data-science/sora2-cameo-ai-avatar-video
- **Conflict:** another guide says users count "One, two, three … ten". [single, conflicting] (attribution: result set) https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial
- **Framing guide:** the face is positioned "within the oval guide" at about arm's length. Processing takes about 5 minutes. [single] (attribution: result set) https://www.aifreeapi.com/en/posts/sora-2-cameo-yourself-tutorial

### 3.2 Permission options
- There are four audience choices, described as:
  - just you;
  - people you have directly approved;
  - "mutuals" (users who follow you and whom you follow back);
  - everyone.

  [multi] https://scour.ing/p/https://www.zdnet.com/article/i-tested-soras-new-character-cameo-feature-and-it-was-borderline-disturbing , https://www.techradar.com/ai-platforms-assistants/i-tried-sora-2-i-love-it-and-its-about-to-ruin-everything
- **Labels as written in a third-party guide:** **"Only Me"**, **"People I Approve"**, **"Mutuals"**, **"Everyone"**. [single] https://www.glbgpt.com/hub/how-to-use-sora-2-cameo-step-by-step-guide-pro-tips/ (exact in-app capitalisation is unverified)
- **Restrictions:** users can give Sora instructions that limit how others use their cameo. Examples: "don't put me in videos that involve political commentary" and "don't let me say this word". [single] (attribution: result set) https://www.techradar.com/ai-platforms-assistants/i-tried-sora-2-i-love-it-and-its-about-to-ruin-everything

### 3.3 Revoking access and the cameo activity view
- Users can **revoke access at any time**. Videos that include the user's cameo, **including drafts made by other users**, are always visible to that user, who can review, delete and report them. [multi] https://openai.com/index/creating-with-sora-safely , https://www.macrumors.com/2025/10/30/openai-sora-app-character-cameos-video-stitching/
- Users are **notified** when their cameo is used and can approve the use or delete the video. [single] (attribution: result set) https://venturebeat.com/ai/openai-debuts-sora-2-ai-video-generator-app-with-sound-and-self-insertion
- Changing permissions does **not** affect videos already made. The creator is not notified of a revocation. [single, third-party] (attribution: result set) https://thebizaihub.com/?p=2321
- The exact name and layout of the "activity log" screen are **UNKNOWN**.
- **Oct 30, 2025:** "character cameos" and video stitching were added. [single] https://www.macrumors.com/2025/10/30/openai-sora-app-character-cameos-video-stitching/

### 3.4 Moving watermark
- **Look and behaviour:** a **semi-transparent white cloud icon** that **moves and bounces** to different positions during the clip and changes position and opacity across frames. Recent versions also show the **creator's account handle** next to the logo. [multi, third-party] https://www.layer3labs.io/guides/sora-watermark , https://expertbeacon.com/how-to-use-free-sora-2-watermark-removers-for-clean-professional-videos/
- Sora also embeds **C2PA** provenance metadata. [multi] https://www.layer3labs.io/guides/sora-watermark , https://openai.com/index/creating-with-sora-safely
- The logo's size in pixels, the motion period and the font used for the handle are **UNKNOWN**.

---

## 4. Apple system surfaces

### 4.1 Live Activities on the Lock Screen
- **Maximum height:** **160 points**. [multi] https://notificare.com/blog/2022/11/11/intro-to-live-activities , https://engineering.nature.global/entry/extend-reach-app-ios-live-activities
- **Margins:** for the expanded and Lock Screen presentations, the standard margin width is **20 points**. [single] (attribution: result set; HIG) https://developers.apple.com/design/human-interface-guidelines/components/system-experiences/live-activities
- A separate result says Lock Screen Live Activities get **14-point** margins, but the wording was garbled. [single, unclear] (attribution: result set) https://medium.com/@Sahil_Lakra/apple-design-guide-how-to-create-dynamic-island-with-live-activity-b3cb74c0a7e0
- **Width:** **408 pt** on the 430×932 device class. [single] (attribution: result set) https://www.appetiteui.com/blog/dynamic-island-live-activity-figma
- **Background and tint:** apps **cannot choose a custom background colour** for Live Activity presentations in the Dynamic Island. They **can** apply a custom tint to text, symbols and a border around the Dynamic Island. [single] (attribution: result set; HIG) https://developers.apple.com/design/human-interface-guidelines/components/system-experiences/live-activities
- Lock Screen background-tint rules (`activityBackgroundTint`) are **UNKNOWN**. They were not returned.
- **Lock Screen corner radius:** **UNKNOWN**.
- **Lifetime and staleness:**
  - A Live Activity can be active for up to **8 hours**. After that the system ends it and removes it from the Dynamic Island.
  - It can stay on the Lock Screen for **up to 4 more hours**, so **12 hours maximum** there.

  [multi] https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities.md , https://www.en.proft.me/2023/11/3/creating-live-activities-ios-16/
- An optional **`staleDate`** tells iOS when the content becomes outdated. [single] (attribution: result set) https://www.en.proft.me/2023/11/3/creating-live-activities-ios-16/

### 4.2 Dynamic Island
- **Compact:** used when one Live Activity is active. It has two parts: **leading**, on the left of the TrueDepth camera, and **trailing**, on the right. [multi] https://developer-rno.apple.com/design/human-interface-guidelines/components/system-experiences/live-activities , https://developer.apple.com/documentation/activitykit/creating-custom-views-for-live-activities.md
- **Minimal:** used when several Live Activities are active. One appears **attached** to the island and one **detached**. The detached one is **circular or oval**, depending on content size. [multi] (same sources as Compact)
- **Expanded:** shown when a user **touches and holds** a compact or minimal presentation. [multi] (same sources as Compact)
- **Concentric layout:** rounded shapes should nest concentrically inside the island with even margins all the way around. [multi] https://developer.apple.com/videos/play/wwdc2023/10194/ , https://wwdcnotes.com/documentation/wwdc23-10194-design-dynamic-live-activities/
- **Point sizes** (third-party, iPhone 14 Pro era): [single] (attribution: result set) https://uxplanet.org/unlimited-guide-to-dynamic-island-48700ecc094f , https://infinum.com/?p=28092

  | Presentation | 14 Pro | 14 Pro Max |
  |---|---|---|
  | Compact leading / trailing | 52 × 37 pt each | 62 × 37 pt each |
  | Minimal | 37 pt diameter; width up to 45 pt | 37 pt diameter; width up to 45 pt |
  | Expanded | width 371 pt; height 84 pt (small) or 160–192 pt (large) | not returned |

- **Dynamic Island corner radius:** **UNKNOWN**.

### 4.3 Widgets
- **Home Screen families:** systemSmall is **2×2** grid cells, systemMedium **4×2**, systemLarge **4×4**. [single] (attribution: result set) https://gits.id/blog/how-to-make-app-widgets-ios-different-sizes/
- **Point sizes** (community table, not HIG): [single] https://github.com/simonbs/ios-widget-sizes
  - 428×926 class (iPhone 13 Pro Max): **170×170** (small), **364×170** (medium), **364×382** (large).
  - iPhone 13 (390×844 class): **158×158** (small).
- **Lock Screen families:** **accessoryInline** is a single row of text with an optional image. **accessoryCircular** shows simple data in a circle. **accessoryRectangular** shows multiple lines or small graphs. [multi] https://swiftwithmajid.com/2022/08/30/lock-screen-widgets-in-swiftui/ , https://www.createwithswift.com/creating-a-lock-screen-widget-with-swiftui/ , https://swiftsenpai.com/development/create-lock-screen-widget/
  - Their point sizes are **UNKNOWN**.
- **Corner radius:**
  - The HIG says to coordinate content corner radius with the widget's corner radius. `ContainerRelativeShape` (iOS 14+) matches it automatically. [multi] https://useyourloaf.com/blog/swiftui-container-relative-shape/ , https://www.hackingwithswift.com/quick-start/swiftui/when-should-you-use-containerrelativeshape
  - Hard-coded values cited by developers: **21.0 pt (iOS 18 and earlier)** and **28.0 pt (iOS 26)**. [single, low reliability] (attribution: result set) https://developer.apple.com/forums/thread/796917
  - iOS 26 adds a SwiftUI **`ConcentricRectangle`** type for corner concentricity. [multi] https://nilcoalescing.com/blog/ConcentricRectangleInSwiftUI , https://developer.apple.com/documentation/swiftui/concentricrectangle.md

### 4.4 Not researched
The search budget ran out before these could be searched. All are **UNKNOWN**:
- App Clip card layout;
- iMessage sticker sizes (small / regular / large px);
- SF Pro / SF Pro Rounded usage rules;
- iOS 26 Liquid Glass material description;
- iOS 27 Shared Albums UI.

---

## 5. Party and social games
**UNKNOWN.** Not researched: the search budget ran out. This covers:
- Gartic Phone fonts, colours, the write/draw/guess chain and album replay;
- Jackbox room code, VIP badge and audience;
- the Wordle share grid and header;
- the NYT Connections share grid;
- tbh and Gas poll UI.

The emoji and header formats in the brief ("🟩🟨⬛/⬜", "Wordle 1,234 3/6") were **not verified** in this session and should not be treated as sourced.

## 6. Memory apps
**UNKNOWN.** Not researched: the search budget ran out. This covers:
- Timehop and its mascot "Abe";
- 1 Second Everyday;
- Widgetable / Pengu;
- Noteit;
- Airbuds;
- Candle.

## 7. Series (AI social network in iMessage)
**UNKNOWN.** Not researched.

## 8. Character.ai memory panel
**UNKNOWN.** Not researched.

---

## Gaps

1. **Budget exhaustion:** only 33 of the planned 40–70 searches ran. Sections 5–8 have no sourced facts.
2. **No full-page reads:** every fact comes from search summaries. Exact UI copy, colours, hex codes, font names and pixel sizes were not visible in any result unless quoted above.
3. **Google Photos:**
   - Create tab tile order, icons, colours and grid columns;
   - the authoritative names of the current Remix styles (sources conflict);
   - Me Meme button labels and onboarding copy;
   - Memories card colours;
   - the typeface (Google Sans vs Google Sans Flex).
4. **Gemini:**
   - no single canonical polaroid prompt;
   - the watermark's colour and opacity;
   - the image-dimension threshold between the 48 px and 96 px watermark;
   - the new "3.5 layout" position.
5. **Sora:**
   - exact in-app capitalisation of the permission labels;
   - the name and layout of the cameo activity screen;
   - watermark size and motion timing;
   - a conflict between "three pairs of numbers" and "count 1–10" in the recording script.
6. **Apple:**
   - Lock Screen Live Activity corner radius;
   - `activityBackgroundTint` rules;
   - Dynamic Island corner radius;
   - accessory widget point sizes;
   - HIG-official (not community) widget size tables;
   - App Clip card;
   - iMessage sticker px sizes;
   - SF Pro / SF Pro Rounded guidance;
   - Liquid Glass description;
   - iOS 27 Shared Albums UI;
   - the 14 pt vs 20 pt Lock Screen margin discrepancy.
7. **Party games, memory apps, Series, Character.ai:** entirely unresearched.
