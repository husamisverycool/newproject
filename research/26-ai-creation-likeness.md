# Dossier 26: More AI creation, likeness and sticker apps (exact strings)

Compiled: 2026-10-07. Tool: WebSearch only. **24 of 24 allowed searches were used** (log at the end). No page was opened directly: curl and WebFetch are blocked by policy, and the block was not worked around.

This dossier adds to `06-ai-ios-games-memory.md` and `16-ai-games-messaging-exact.md` §1–4 and §9–10. It does not repeat them. Where a row here confirms, contradicts or extends one of those files, the row says so.

## Method and tags

- Every verified row comes from a WebSearch result summary and its result URLs, not from the full page. A summary does not always say which URL a sentence came from, so some rows cite the result set and say "(result set)".
- Text in quotation marks is quoted as the search result returned it. Capitalization and punctuation **may differ from the live UI**. "Verified" means verified as documented, not checked against a screenshot.
- Tags (same scheme as dossier 16):
  - **[V]**: an official or primary source (support.apple.com, support.google.com, openai.com, about.instagram.com, c2pa.org, helpx.adobe.com), or two or more independent sources that agree on the exact string.
  - **[V-weak]**: one secondary source (a tutorial, a third-party blog, a news paraphrase), or sources that agree on the meaning but not the wording.
  - **[B]**: background knowledge that was not verified. These rows appear **only** in the separate "BACKGROUND KNOWLEDGE [B]" section, each with a confidence rating.
- **CONFLICT** marks rows where sources disagree. **UNKNOWN** marks rows that were searched for but not found.

### Surface legend (from `docs/INSPIRATION.md`)

| Code | Our surface |
|---|---|
| §F | Stickers and likeness: consented selfies, owner controls, revocation, a log of everything made with my face |
| §G/H | Create hub: style remix, meme-yourself, zine, comic, collage, recap panels |
| §I | Figurine render |
| §Q | Export watermark and provenance (named in the spec next to §F) |
| §U | Monetization: monthly AI allowance, how much is left, upgrade prompt |
| §S | Named in the brief but not found in `docs/INSPIRATION.md`. Rows about consent and disclosure are labelled "Consent" or "Disclosure" instead. |

---

## 1. Apple Image Playground and Genmoji (iOS 18.2–26)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Image Playground | §G/H style remix | Apple on-device styles (3) | "Animation" · "Illustration" · "Sketch" | https://appleinsider.com/articles/25/06/11/ios-26-brings-new-chatgpt-powered-styles-to-genmoji-and-image-playground ; https://www.macrumors.com/guide/ios-26-image-playground | [V] |
| Image Playground (iOS 26) | §G/H style remix | ChatGPT-powered styles (5) | "Anime" · "Oil Painting" · "Print" · "Vector" · "Watercolor" | same two URLs | [V] |
| Image Playground (iOS 26) | §G/H style remix | Free-text style slot | "Any Style": the user types the style they want | https://www.macrumors.com/guide/ios-26-image-playground (result set) | [V-weak] |
| Image Playground (iOS 26) | §G/H | Style count | 3 Apple styles, 5 ChatGPT styles and "Any Style" (the summary also gave a total of "11", which does not add up) | result set | [V-weak] |
| Image Playground (iOS 26) | §U allowance | ChatGPT-style limit | The ChatGPT styles "require ChatGPT tokens", which limits a free user to "one or two images" unless they pay for ChatGPT (paraphrase) | https://www.macrumors.com/guide/ios-26-image-playground (result set) | [V-weak] |
| Image Playground | §G/H | Prompt field | Tap the "Describe an image" field, enter a description, then tap "Done" | https://support.apple.com/en-lamr/guide/ipad/ipad534398eb/ipados ; https://support.apple.com/guide/apple-vision-pro/tan08caf3fa1/visionos | [V] |
| Image Playground | §F likeness | Person from Photos | Tap the **Person** button, then choose a person from your photo library. **The person must already be named in the Photos app.** | same | [V] |
| Image Playground | §F likeness | Person without a photo | **Person** button → "Appearance" → choose a skin tone and appearance setting → "Done" | same | [V] |
| Image Playground | Disclosure | On-image or metadata label | UNKNOWN (searched for "Made with Image Playground"; nothing returned) | — | — |
| Genmoji | §F sticker maker | Person picker | A "Choose a Person" option above the text field. It lists people identified in Photos and offers "a few style options as a starting point". | https://www.foxnews.com/tech/ditch-boring-emoji-create-your-own-unique-ones-genmoji-iphone ; https://www.engadget.com/mobile/how-to-use-genmoji-to-make-your-own-custom-emojis-225907928.html | [V-weak] |
| Genmoji | §F sticker maker | Input | Describe a character, object or symbol, **or** type the name of someone identified in your photo library and pick a specific photo | https://www.engadget.com/mobile/how-to-use-genmoji-to-make-your-own-custom-emojis-225907928.html ; https://www.techradar.com/phones/ios/how-to-use-genmoji-create-your-own-emojis-using-apple-intelligence | [V-weak] |
| Genmoji | — | Availability | iOS 18.2; iPhone 15 Pro / Pro Max and the iPhone 16 lineup | https://www.foxnews.com/tech/ditch-boring-emoji-create-your-own-unique-ones-genmoji-iphone | [V-weak] |

**Best informs:** §G/H (a style picker with a fixed set plus a free-text "Any Style" slot), and §F. Apple only lets you pick a person who is **already named in Photos**, so likeness use is gated behind an existing person label.

## 2. Apple Messages: Live Stickers (sticker maker)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Messages (iOS 17+) | §F sticker maker | Create from a photo | Tap the photo subject, then "Add Sticker" | https://support.apple.com/en-kw/guide/iphone/iph37b0bfe7b/ios | [V] |
| Messages | §F sticker maker | Effect entry | Touch and hold the sticker, then "Add Effect" | https://support.apple.com/en-kw/guide/iphone/iph37b0bfe7b/ios | [V] |
| Messages | §F sticker maker | Effect names | "Shiny" · "Comic" · "Puffy" · "Outline". "Original" was not confirmed. **CONFLICT:** dossier 16 [B] listed "Stroke", but this round's results say **"Outline"** | https://support.apple.com/en-kw/guide/iphone/iph37b0bfe7b/ios ; https://iphonelife.com/content/how-to-fix-live-stickers-not-working-iphone (result set) | [V-weak] |
| Messages | §F | Sticker type | Live Stickers are subjects lifted from photos, with effects that "bring the stickers to life" | https://support.apple.com/en-kw/guide/iphone/iph37b0bfe7b/ios | [V] |

## 3. Google Photos follow-ups (gaps left by 06 and 16)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Google Photos | §G/H meme-yourself | Compare control | "**Compare**": "tap Compare to compare the uploaded photo to the generated meme". It is a tap target; whether it toggles or is press-and-hold is UNKNOWN | https://support.google.com/photos/answer/16763021 ; https://www.engadget.com/ai/google-photos-can-now-turn-you-into-a-meme-213930935.html ; https://www.digit.in/news/apps/google-photos-introduces-me-meme-feature-heres-how-to-use-it.html/amp/ (result set) | [V-weak] |
| Google Photos | §G/H meme-yourself | Feedback | An option to submit feedback on the output | same | [V-weak] |
| Google Photos | §G/H meme-yourself | Template picker | "scroll and select one of the preset templates", or upload a reference image of your own | https://analyticsindiamag.com/ai-news-updates/google-photos-tests-me-meme-feature-to-turn-selfies-into-ai-memes ; https://support.google.com/photos/answer/16763021 | [V-weak] |
| Google Photos | §G/H | Me Meme platforms | Android and iOS; US only; appears under "Create" | https://jang.com.pk/en/58112-google-photos-introduces-me-meme-features-for-select-users-news ; https://www.androidauthority.com/google-photos-me-meme-rollout-3634849 | [V-weak] |
| Google Photos | §G/H | Me Meme template names | UNKNOWN. The only named template is still "This is fine" (teardown, 06 §1.5) | — | — |
| Google Photos | §G/H style remix | Remix styles added Dec 2025 | "Watercolor" · "Pen" · "Oil Painting" · "Art Deco" · "Chibi Sticker" · "Metal Pin". **CONFLICT:** 9to5Google (06 §1.4) names "8-bit" and "enamel pins"; this list has "Metal Pin" and no 8-bit | https://jetstream.blog/en/google-photos-remix-rollout-japan-more/ ; https://tech.yahoo.com/apps/articles/remix-google-photos-gets-explained-191500696.html (result set) | [V-weak] |
| Google Photos | §G/H, §I | Longer Remix template list (descriptive) | pen sketch · **collectible figurine** · watercolor · professional headshot · dramatic black & white photo · chibi art style sticker · oil painting · fashion photoshoot · art deco patterns · enamel pin · vintage look · film grain effect · instant film with flash | https://techmitra.in/google-photos-ai-remix-tool/ (result set) | [V-weak]: agrees in meaning with the 06 §1.4 secondary list; these look like descriptions, not chip labels |

**Note for §I:** Remix appears to include a "collectible figurine" template. The figurine render then has a first-party Google precedent as well as the Nano Banana prompt (06 §2.2).

## 4. ChatGPT Images (GPT Image 1.5, December 2025)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| ChatGPT | §G/H Create hub | Entry | An "**Images**" tab in the sidebar, on mobile and web. It opens a visual layout instead of an empty chat | https://openai.com/zh-Hant/index/new-chatgpt-images-is-here/ ; https://www.storyboard18.com/amp/digital/how-to-generate-and-edit-multiple-images-in-chatgpt-using-the-new-images-section-86206.htm | [V] |
| ChatGPT | §G/H | Preset styles (Indian-locale examples) | "Bollywood poster" · "Festival" · "Navratri" · "Mithila" · "Jaipur textile" · "Sari landscape" | https://www.storyboard18.com/amp/digital/how-to-generate-and-edit-multiple-images-in-chatgpt-using-the-new-images-section-86206.htm | [V-weak]: specific to the region; the US preset names are UNKNOWN |
| ChatGPT | §G/H | Quick ideas under the presets (paraphrase) | creating cartoons · designing cards · generating album covers | same | [V-weak] |
| ChatGPT | §G/H | How presets work | The presets act as "built-in prompt guides" | same | [V-weak] |
| ChatGPT | §G/H | Parallel jobs | Several image requests can run at once; a new generation can start while others are still processing | same | [V-weak] |
| ChatGPT | §U allowance | Free limit | "up to two images per day" (DALL·E 3 era). Later reports say 2–3 a day on a rolling 24-hour window | https://zapier.com/blog/chatgpt-plus.md ; https://yingtu.ai/en/blog/chatgpt-plus-worth-it | [V-weak] |
| ChatGPT | §U allowance | At the limit | The user is told they have reached the limit and is "invited to upgrade to ChatGPT Plus". The message gives the time "tomorrow" when they can continue (paraphrase; exact copy UNKNOWN) | https://zapier.com/blog/chatgpt-plus.md ; https://community.openai.com/t/image-and-text-message-limits-on-chatgpt-free-account/950207 | [V-weak] |
| ChatGPT | §U | Plus limit | 50 images per rolling 3-hour window (third-party) | https://yingtu.ai/en/blog/chatgpt-plus-worth-it | [V-weak] |

## 5. Snapchat: Imagine Lens, Dreams and My Selfie

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Snapchat | §G/H | Lens name | "**Imagine Lens**", Snap's first open-prompt image-generation AI Lens | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us | [V] |
| Snapchat | §G/H | Placement | Near the front of the Lens Carousel, or found by searching its name | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us ; https://www.mediapost.com/publications/article/410140 | [V-weak] |
| Snapchat | §G/H | Prompt suggestions | The Lens shows "pre-loaded prompt suggestions". Example prompts given: "Turn me into an alien" (after a selfie) and "grumpy cat" | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us | [V-weak]: the examples may be the article's, not the UI's |
| Snapchat | §U allowance | Free tier | Free users get "a limited number of image generations per day, based on region and other factors" (Snap spokesperson). Launched Sept 2025 for paid subscribers only; free in the US from Oct 22, 2025 | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us ; https://ppc.land/snapchat-makes-ai-image-generation-free-in-u-s/ | [V] |
| Snapchat | §G/H | Dreams (2023) | "Dreams" generates "fantastical image-based alternatives to a user's selfies" | https://techcrunch.com/2025/10/22/snapchat-makes-its-first-open-prompt-ai-lens-available-for-free-in-the-us | [V-weak] |
| Snapchat | §F consent | Settings page | "**My Selfie**" (in profile settings) | https://www.malwarebytes.com/blog/news/2024/09/snapchat-wants-to-put-your-ai-generated-face-in-its-ads ; https://socialsamosa.com/news-2/snapchat-my-selfie-tool-concerns-users-faces-personalised-ads-7078635 ; https://yro.slashdot.org/story/24/09/18/228242/snapchat-reserves-the-right-to-use-ai-generated-images-of-your-face-in-ads | [V] |
| Snapchat | §F consent | Toggle | "**See My Selfie in Ads**", **on by default**. Path: profile → settings → "My Selfie" → toggle off | same | [V] |
| Snapchat | §F consent | Purpose copy (Snap terms as quoted by the press) | Selfies are used "to power Cameos, Generative AI, and other experiences on Snapchat, including ads", and "to understand what you look like to enable you, Snap and your friends to generate novel images of you" | https://www.malwarebytes.com/blog/news/2024/09/snapchat-wants-to-put-your-ai-generated-face-in-its-ads | [V-weak]: quoted by the press; Snap's original page was not reached |
| Snapchat | §F consent | Control statement (spokesperson) | Snapchatters "can turn this on and off in My Selfie Settings at any time" | same | [V-weak] |

**Note:** the default-on ads toggle drew press criticism (Malwarebytes, Slashdot). It is a pattern to avoid. "My Selfie" is still a useful name for a settings page.

## 6. Meta: "Imagine me", Instagram "Restyle", "AI info", "Imagined with AI"

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Meta AI (Instagram, WhatsApp, Messenger) | §F selfie capture | Setup selfies | **Three selfies: front, left and right angles**, taken "as instructed on the screen" | https://storyboard18.com/digital/meta-ai-launches-imagine-me-for-personalized-image-generation-75254.html ; https://allthings.how/how-to-use-meta-ai-imagine-me-feature-in-instagram-whatsapp-and-facebook/ | [V-weak] |
| Meta AI | §F selfie capture | Capture rule | "remove any glasses or headwear" | https://allthings.how/how-to-use-meta-ai-imagine-me-feature-in-instagram-whatsapp-and-facebook/ (result set) | [V-weak] |
| Meta AI | §G/H meme-yourself | Prompt syntax | Prompts start with "**Imagine me as...**", for example "Imagine me as a 90s gangster" or "Imagine me as a cowboy" | https://storyboard18.com/digital/meta-ai-launches-imagine-me-for-personalized-image-generation-75254.html ; https://www.socialsamosa.com/news-2/meta-imagine-me-instagram-messenger-whatsapp-9505153 | [V] |
| Meta AI | §G/H, group use | Invocation | Tag "@Meta AI" in a one-to-one or **group** chat | same | [V-weak] |
| Meta AI | §F owner controls | Update, delete, off | Users can update or delete their setup photos at any time in Meta AI settings, retake them, or turn the feature off | https://storyboard18.com/digital/meta-ai-launches-imagine-me-for-personalized-image-generation-75254.html | [V-weak] |
| Meta AI | §F | India rollout | From July 17, 2025 | https://www.afaqs.com/news/digital/meta-ai-introduces-imagine-me-feature-in-india-9504952 | [V-weak] |
| Meta AI | §Q watermark | Visible watermark text | "**Imagined with AI**" | https://www.storyboard18.com/how-it-works/meta-ai-launches-imagine-me-for-personalized-image-generation-75254.htm ; https://www.tweaktown.com/news/94802/meta-releases-new-ai-image-generator-called-imagine/index.html ; https://www.notebookcheck.net/Meta-s-text-to-image-generator-goes-live.781334.0.html | [V] |
| Meta AI | §Q watermark | Position | A small watermark logo in the **lower left-hand corner** (Imagine with Meta AI, Dec 2023). **CONFLICT** with the Gemini bottom-right geometry in the spec (§Q, 06 §2.5) | https://www.notebookcheck.net/Meta-s-text-to-image-generator-goes-live.781334.0.html ; https://www.tweaktown.com/news/94802/meta-releases-new-ai-image-generator-called-imagine/index.html (result set) | [V-weak] |
| Meta AI | §Q provenance | Invisible watermark | Described as "resilient to common image manipulations like cropping, color change (brightness, contrast, etc.), screen shots and more" | https://cointelegraph.com/news/meta-fight-ai-generated-fake-news-invisible-watermarks | [V-weak] |
| Instagram / Facebook / Threads | Disclosure | Label | "**AI info**", renamed from "Made with AI" on July 1, 2024 | https://gigazine.net/gsc_news/en/20240702-meta-ai-info/ ; https://www.phonearena.com/news/meta-changes-ai-generated-content-label_id160026 ; https://aphnetworks.com/index.php/news/28906-instagrams-made-ai-label-swapped-out-ai-info-after-photographers-complaints | [V] |
| Instagram / Facebook | Disclosure | Placement rule | **AI-generated:** the "AI info" label shows openly. **AI-edited:** the label moved into the post's menu (it used to sit directly under the user's name) | https://www.phonearena.com/news/facebook-instagram-ai-labels_id162577 ; https://passionfru.it/instagram-facebook-meta-ai-labels-73433/ | [V-weak] |
| Instagram | §G/H style remix | Tool name | "**Restyle**" (Stories, powered by Meta AI) | https://about.instagram.com/blog/announcements/ai-restyle-instagram-stories/ ; https://alternativeto.net/news/2025/10/instagram-stories-get-new-generative-ai-features-to-restyle-your-photos-and-videos | [V] |
| Instagram | §G/H | Edit verbs | "**Add**" · "**Remove**" · "**Change**" (any element) | https://about.instagram.com/blog/announcements/ai-restyle-instagram-stories/ ; https://metricool.com/instagram-restyle-ai/ | [V] |
| Instagram | §G/H | Photo presets (examples) | "sunglasses" · "biker jacket" · watercolor · film noir · anime · 8-bit · "ghost face" (Halloween) | https://metricool.com/instagram-restyle-ai/ ; https://www.mobigyaan.com/instagram-restyle-tool-meta-ai (result set) | [V-weak] |
| Instagram | §G/H | Video presets (examples) | underwater · flames · snow | same | [V-weak] |
| Instagram | §G/H | Icon and placement | A **brush with a small star**, in the top tray of the Stories editor | result set | [V-weak] |

## 7. Lensa (Magic Avatars) and Epik (AI Yearbook): selfie-set guidance

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Lensa | §F selfie capture | Count | **10 to 20 selfies** | https://www.elegantthemes.com/blog/design/lensa-ai ; https://www.androidheadlines.com/2022/12/lensa-app-turns-your-selfies-into-digital-avatars.html ; https://www.techadvisor.com/article/1422944/use-lensa-app-ai-selfie-images.html | [V] |
| Lensa | §F selfie capture | Good examples (the app's own recommendations) | close-ups · selfies · adults · a variety of backgrounds and facial expressions | https://www.elegantthemes.com/blog/design/lensa-ai | [V-weak] |
| Lensa | §F selfie capture | Bad examples | group shots · nudes · kids | https://www.elegantthemes.com/blog/design/lensa-ai | [V-weak] |
| Epik | §G/H Create hub | Entry | "**Try the AI Yearbook**" | https://passiveincomemd.com/blog/reviews-recommendations/viral-ai-yearbook-trend-step-by-step-guide-for-social-media/ ; https://petapixel.com/2023/10/05/epik-apps-ai-90s-yearbook-photo-trend-is-taking-over-the-internet | [V-weak] |
| Epik | §F selfie capture | Count and guidance | **8–12 selfies**; upload "different angles and expressions" for accuracy | https://petapixel.com/2023/10/05/epik-apps-ai-90s-yearbook-photo-trend-is-taking-over-the-internet ; https://www.nbcwashington.com/news/national-international/ai-yearbook-trend-takes-over-social-media/3438004/ | [V] |
| Epik | §U | Flow order | Choose the portrait type → **pay** → generation starts | https://passiveincomemd.com/blog/reviews-recommendations/viral-ai-yearbook-trend-step-by-step-guide-for-social-media/ | [V-weak] |
| Epik | §U | Price and speed tiers | $5.99–$9.99; "standard" (up to 24 hours) or "express" (under 2 hours) | result set | [V-weak] |
| Epik | §G/H | Output | 60 images in different '90s hairstyles, outfits and poses | https://petapixel.com/2023/10/05/epik-apps-ai-90s-yearbook-photo-trend-is-taking-over-the-internet | [V-weak] |
| Epik | §F | Data handling | Uploaded photos are deleted from the servers once the yearbook is created | https://www.klicksafe.de/en/news/yearbook-trend-kostet-geld-und-daten (result set) | [V-weak] |

## 8. Bitmoji: selfie-to-avatar capture

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Bitmoji | §F | Entry | "Create Avatar" | https://jivochat.com/blog/tools/how-to-make-a-bitmoji.html | [V-weak] |
| Bitmoji | §F selfie capture | Onboarding buttons | Primary "**Continue**" (starts selfie capture), secondary "**Skip**". The screen explains the selfie will be used to generate the Bitmoji | https://lazyweb.com/canvas/flows/bitmoji/onboarding | [V-weak]: screenshot-flow library, summarised |
| Bitmoji | §F selfie capture | Camera screen | A **circular face guide overlay**, a prompt to **center your face** and **find good lighting**, and a large shutter button | https://lazyweb.com/canvas/flows/bitmoji/onboarding | [V-weak] |
| Bitmoji | §F | Editor | A live character preview and a skin-tone selector grid of swatches; "save" | https://lazyweb.com/canvas/flows/bitmoji/onboarding ; https://jivochat.com/blog/tools/how-to-make-a-bitmoji.html | [V-weak] |
| Bitmoji | §F | Manual option | Customize everything by hand instead of using a selfie | https://jivochat.com/blog/tools/how-to-make-a-bitmoji.html | [V-weak] |

**Contrast with Sora:** Sora used an **oval** guide (06 §3.1); Bitmoji uses a **circle**.

## 9. Sticker-pack makers: Telegram @Stickers bot and Sticker.ly

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Telegram @Stickers bot | §F pack export | Start | Send "**/newpack**"; the bot then asks for a pack name | https://www.androidcentral.com/how-create-custom-stickers-telegram ; https://blog.invitemember.com/how-to-create-telegram-stickers/ | [V] |
| Telegram @Stickers bot | §F pack export | Upload | Paperclip → "File" → pick a .webp sticker, one file at a time | https://blog.invitemember.com/how-to-create-telegram-stickers/ (result set) | [V-weak] |
| Telegram @Stickers bot | §F pack export | Emoji per sticker | Assign one emoji to each sticker | same | [V] |
| Telegram @Stickers bot | §F pack export | Publish | "**/publish**" → enter a short name → the bot returns a link such as `t.me/addstickers/MyAwesomeMemes` | same | [V] |
| Telegram | §F pack export | Image spec | 512×512 works best (padding is added if only one side is 512 px); PNG or WEBP with a transparent background | https://www.androidcentral.com/how-create-custom-stickers-telegram | [V] |
| Sticker.ly | §F pack export | New pack | "+" (bottom center) → pack name and creator name → "**Create**" (top right) | https://igeeksblog.com/?p=597647 | [V-weak] |
| Sticker.ly | §F sticker maker | Add | "**Add sticker**" → pick an image from the photo library | same | [V-weak] |
| Sticker.ly | §F sticker maker | Cutout | "**Auto**" (bottom) or "**Manual**"; refine with the "**Adjust**" and "**Text**" tools | same | [V-weak] |
| Sticker.ly | §F pack export | Export | "**Add to WhatsApp**", then "Save" / "Done" | same | [V-weak] |
| Sticker.ly | §F | Minimum pack | At least 3 stickers (matches WhatsApp's minimum of 3, 16 §10) | same | [V-weak] |
| Sticker.ly | §Q | Export watermark | UNKNOWN | — | — |

## 10. AI disclosure labels: YouTube, TikTok, C2PA / Adobe

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| YouTube | Disclosure | Label title | "**Altered or synthetic content**" | https://support.google.com/youtube/answer/14328491 ; https://amp.cnn.com/cnn/2024/03/18/tech/youtube-ai-label-for-creators | [V] |
| YouTube | Disclosure | Label body | "**Sound or visuals were significantly edited or digitally generated.**" | same | [V] |
| YouTube | Disclosure | Placement | Most videos: in the **expanded description**. Sensitive topics (health, news, elections, finance): also a **more prominent label on the video itself** | https://blog.google/intl/en-africa/company-news/outreach-and-initiatives/how-were-helping-creators-disclose-altered-or-synthetic-content/ ; https://support.google.com/youtube/answer/14328491 | [V] |
| YouTube | Disclosure | Creator control | An "altered content" setting in YouTube Studio, on computer or mobile, chosen at upload | same | [V] |
| YouTube | Disclosure | What needs it | Realistic content: digitally altering faces, synthetic voices, realistic events that never happened. Unrealistic content and minor edits do not need it | same | [V] |
| TikTok | Disclosure | Creator toggle | "**AI-generated content**", under "More options" on the post screen | https://adaptlypost.com/blog/tiktok-ai-generated-label ; https://www.ghacks.net/?p=200388 | [V-weak] |
| TikTok | Disclosure | Creator-applied label | "**Creator labeled as AI-generated**" | https://adaptlypost.com/blog/tiktok-ai-generated-label ; https://www.socialmediatoday.com/news/tiktok-officially-launches-new-stream-labels-ai-generated-content/694154/ | [V] (case as returned: "creator labeled as AI-generated") |
| TikTok | Disclosure | Automatic label | "**AI-generated**", applied when TikTok AI effects are used or the upload carries C2PA Content Credentials | https://adaptlypost.com/blog/tiktok-ai-generated-label | [V-weak] |
| C2PA | §Q provenance, Disclosure | Icon | The official "Content Credentials" icon ("**CR**" pin), an open icon from C2PA | https://c2pa.org/introducing-official-content-credentials-icon/ ; https://petapixel.com/2023/10/11/adobe-creates-new-symbol-that-flags-content-as-ai-generated | [V] |
| C2PA / Adobe | Disclosure | Interaction | Hover over (or scroll over) the CR icon to show a "**digital nutrition label**" in a side-bar view: who made it and how (camera, AI-generated, or edited), including which AI tools were used | https://helpx.adobe.com/sg/creative-cloud/help/content-credentials.html ; https://www.techfinitive.com/adobe-announces-cr-pin-for-ai-images/ | [V-weak] |
| Adobe Firefly | §Q provenance | Default | Content Credentials are applied **automatically** to Firefly output | https://helpx.adobe.com/in/creative-cloud/apps/adobe-content-authenticity/content-credentials/overview.html | [V] |
| C2PA | Disclosure | Panel field labels ("Issued by", "AI tool used"…) | UNKNOWN in verified sources (see [B]) | — | — |

## 11. Generation limits and upgrade prompts (§U)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Gemini | §U | Official limits page title | "Gemini Apps limits & upgrades for Google AI subscribers" | https://support.google.com/gemini/answer/16275805 | [V] |
| Gemini | §U | Daily image limits | Free: up to **20** images a day. Google AI Pro: up to **100** a day (Nano Banana 2 or Nano Banana Pro). Figures are "up to" ceilings that move with server load | https://ai.zenken.co.jp/en/post/gemini-image-guide/ ; https://support.google.com/gemini/answer/16275805 (result set) | [V-weak] |
| Gemini | §U | Limit-reached message | "**Sorry, I can't generate more images for you today, but come back tomorrow and we can make more**" | https://workalizer.com/insights/gemini/optimizing-your-google-ai-usage-navigating-gemini-image-generation-limits (result set) | [V-weak] |
| Gemini | §U | Reset time | 12 AM Pacific Time | https://ai.zenken.co.jp/en/post/gemini-image-guide/ | [V-weak] |
| ChatGPT | §U | Limit and upgrade | See §4: 2 images a day free; "invited to upgrade to ChatGPT Plus"; the message gives the reset time | §4 rows | [V-weak] |
| Snapchat | §U | Limit | See §5: a limited number per day, "based on region and other factors" | §5 rows | [V] |
| Image Playground | §U | Limit | See §1: the ChatGPT styles use ChatGPT tokens, so a free user gets about 1–2 images | §1 rows | [V-weak] |
| Epik | §U | Paywall | See §7: pay before generating; standard or express tier | §7 rows | [V-weak] |

## 12. Sora update (extends 06 §3 and 16 §3)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Sora | §F likeness | Feature name | A US federal court (N.D. Cal., Feb 2026) barred OpenAI from using "Cameo". This settles the 16 [B] row on the rename | https://techcrunch.com/2026/02/17/u-s-court-bars-openai-from-using-cameo/ ; https://www.androidheadlines.com/2026/02/openai-lawsuit-bars-cameo-name-trademark-sora.html | [V] |
| Sora | §F likeness | New name | "**Characters**" | https://www.techeconomy.ng/openai-cameo-name-trademark-decision (result set) | [V-weak] |
| Sora | §Q | Provenance | Every output carries a visible watermark and embedded C2PA data; using someone's likeness requires their consent | same | [V-weak] |

**Impact on the spec:** `docs/INSPIRATION.md` §F cites Sora's "Cameo" labels. The labels "Only Me" and "People I Approve" are still sourced (06, 16). The word "Cameo" itself is a court-recognised trademark and should not be copied.

---

## Which sources best inform which surface (summary of verified rows)

| Our surface | Best new sources (this dossier) | What they add |
|---|---|---|
| §G/H Create hub: style remix | Image Playground (§1), Instagram Restyle (§6), ChatGPT Images (§4), Google Photos Remix Dec 2025 (§3) | A fixed style set plus an "Any Style" free-text slot; the edit verbs "Add / Remove / Change"; presets as "built-in prompt guides"; parallel generation jobs |
| §G/H meme-yourself | Google Photos "Compare" (§3), Meta "Imagine me as..." (§6), Snapchat "Turn me into an alien" (§5) | The compare label; a fixed prompt prefix; a group-chat trigger ("@Meta AI") |
| §I figurine | Google Photos Remix "collectible figurine" (§3) | A first-party precedent next to the Nano Banana prompt |
| §F selfie capture | Meta (3 selfies: front, left, right; no glasses or headwear), Bitmoji (circular guide, "Continue"/"Skip", center face, good lighting), Lensa (good and bad examples), Epik (angles and expressions) | Of all these sources, Meta's count of 3 comes closest to our 3–5 selfies. Lensa asks for 10–20 and Epik for 8–12 |
| §F consent and owner controls | Snapchat "My Selfie" and "See My Selfie in Ads" (§5), Meta update/delete/turn off (§6), Image Playground "named in Photos" gate (§1), Sora "Characters" (§12) | A name for the settings page; a pattern to avoid (consent on by default); a gate on who can be depicted |
| §F sticker maker | Messages "Add Sticker" / "Add Effect" / Shiny · Comic · Puffy · Outline (§2), Genmoji "Choose a Person" (§1), Sticker.ly "Auto"/"Manual" cutout (§9) | Effect names; cutout modes |
| §F pack export | Sticker.ly "Add to WhatsApp" (§9), Telegram /newpack → /publish → t.me/addstickers link (§9) | Export button copy; the share-link format |
| Disclosure (AI label) | YouTube (§10), TikTok (§10), Meta "AI info" (§6), C2PA CR pin (§10) | Exact label strings; where labels go (description vs. on the media; menu vs. visible) |
| §Q watermark | Meta "Imagined with AI", lower left (§6); C2PA CR pin (§10) | **CONFLICT** with the Gemini bottom-right position in the spec; a text-label alternative to a logo mark |
| §U allowance and upgrade | Gemini limit copy and reset time (§11), ChatGPT upgrade invite (§4), Snapchat per-day by region (§5) | Limit-reached copy; reset-time disclosure. No source here uses a **monthly** allowance; all are daily |

---

## BACKGROUND KNOWLEDGE [B]

None of these rows was verified in this round. Do not ship any of them as "exact" until someone checks it against a screenshot or an official page.

| App | Surface | Element | Value (unverified) | Confidence | Tag |
|---|---|---|---|---|---|
| Image Playground | §G/H | Layout | The preview image sits in the middle with suggestion "bubbles" floating around it. Suggestion categories include Themes, Costumes, Accessories and Places. Results scroll in a horizontal carousel; "Done" is at the top right | medium | [B] |
| Image Playground | Disclosure | Metadata | No visible watermark. Apple says outputs are marked as AI-made in their metadata (EXIF/IPTC; wording possibly "Made with Image Playground") | medium (metadata exists) / low (exact string) | [B] |
| Apple Intelligence / ChatGPT | Consent | Hand-off prompt | When a ChatGPT style is used, the system can ask for confirmation before sending to ChatGPT; a setting named "Confirm ChatGPT Requests" controls this | medium-low | [B] |
| Genmoji | §F | Entry | In the emoji keyboard, a Genmoji button (smiley with a sparkle) at the top right; typing a description shows "Create New Emoji"; finished Genmoji go to the sticker drawer and can be used as Tapbacks. iOS 26 adds mixing two emoji | medium | [B] |
| Memoji | §F | Builder | Messages → Memoji → "+" (New Memoji). Categories include Skin, Hairstyle, Brows, Eyes, Head, Nose, Mouth, Ears, Facial Hair, Eyewear, Headwear, Clothing; "Done" saves; sticker poses are generated automatically | medium | [B] |
| Messages Live Stickers | §F | Effect order and motion | Effect order: "Original", "Outline", "Comic", "Puffy", "Shiny". "Shiny" shimmers as the phone tilts. Lift a subject by touch and hold, then choose "Add Sticker" | medium-high (names) / medium (order) | [B] |
| ChatGPT | §U | Limit copy | "You've hit the free plan limit for image generation requests. You can create more images when the limit resets in [N] hours and [N] minutes.", with a "Get Plus" button | medium (structure) / low (exact words) | [B] |
| ChatGPT | §Q | Watermark | No visible watermark on images; C2PA metadata is embedded | high | [B] |
| Snapchat | §Q | AI watermark | Since April 2024, AI images made with Snap tools carry a watermark when saved or exported: a translucent Snap ghost logo with a sparkle. Its position is not known | medium-high (exists) / low (position) | [B] |
| Snapchat | §F | Dreams setup | Dreams asks for a set of selfies; the first pack is free and more packs need Snapchat+ | medium | [B] |
| Snapchat | §U | Imagine Lens paid tier | At launch, Imagine Lens was limited to the top paid tiers (Lens+ / Snapchat Platinum) | medium | [B] |
| Snapchat | Brand | Color | Snapchat yellow #FFFC00 (trademark color; do not copy) | high | [B] |
| Meta AI | §F | Imagine me launch | US beta from July 2024 (announced with Llama 3.1); India from July 2025 | high | [B] |
| Meta AI | Brand | Icon | The Meta AI ring: a blue-to-purple-to-pink gradient circle | high | [B] |
| Instagram | Disclosure | "AI info" look | Small grey text near the username; tapping it opens a sheet explaining the label | medium | [B] |
| YouTube | Disclosure | Section heading | The label sits in an expanded-description section headed "How this content was made". For sensitive topics an overlay label sits at the lower left of the player | medium-high (heading) / medium (overlay position) | [B] |
| TikTok | Disclosure | Label look | Small grey text under the caption | medium | [B] |
| C2PA | Disclosure, §Q | CR pin look | A lowercase "cr" in a rounded tab shape, usually at the **top-right** corner of the image. Clicking opens a panel with fields such as "Issued by", "Issued on", "App or device used", "AI tool used", "Actions", "Ingredients" | medium (icon) / medium-low (field labels) | [B] |
| Adobe Firefly | §U | Allowance unit | A monthly allowance of "generative credits" with a remaining-credits count in the account menu; plans refill monthly | high (term) / medium (UI placement) | [B] |
| Telegram @Stickers bot | §F | Bot copy | "Alright! Now send me the sticker. The image file should be in PNG or WEBP format with a transparent layer and must fit into a 512x512 square (one of the sides must be 512px and the other 512px or less)." · "Thanks! Now send me an emoji that corresponds to your first sticker." · "Yay! I just published your sticker set. Here's your link: https://t.me/addstickers/…" | medium | [B] |
| Telegram | §F | In-app sticker maker (2024+) | The sticker panel has "Create Sticker": automatic cutout, then "Add to Sticker Set" or send | medium | [B] |
| Telegram | Brand | Color | Telegram blue around #2AABEE / #0088CC | medium-high | [B] |
| Sticker.ly | §F, §Q | Export look | A green "Add to WhatsApp" button (WhatsApp green #25D366); a free-tier credit or watermark on stickers is not confirmed | medium (button) / low (watermark) | [B] |
| Lensa | §U | Pack paywall | Avatar packs of 50 / 100 / 200 bought one at a time; the user picks a gender first ("Female", "Male", "Other"); processing takes about 20 minutes | medium-low | [B] |
| Remini | §F, §U | AI Photos | Asks for about 8–12 selfies; free tier with ads or daily limits; Pro removes limits and watermarks | low | [B] |
| Picsart | §F, §Q | AI Avatar | Asks for about 10–30 photos; free exports may carry a Picsart watermark | low | [B] |
| CapCut | §G/H, §Q | Templates | A "Use template" button on each template. Free exports add a CapCut end card or watermark that can be removed | medium | [B] |
| Zepeto | §F | Avatar from selfie | Builds the character from a face photo, then lets the user edit it by hand | medium-low | [B] |
| Bitmoji | §F | Selfie copy | The onboarding line says the selfie is used to suggest your look; avatars are now 3D-style | low (copy) / medium (3D) | [B] |
| Gemini | §U | Upgrade CTA | Upgrade prompts name "Google AI Pro" (the plan name is certain; the button wording is not) | high (plan name) / low (button copy) | [B] |

---

## Recommended additions to the source list

These are ranked by how directly each fills one of our gaps.

1. **Meta AI "Imagine me"**: the three-angle selfie set (front, left, right; no glasses or headwear), the "Imagine me as…" prompt prefix, and the "Imagined with AI" watermark. It is the closest analogue to our 3–5-selfie likeness setup and our group-chat use.
2. **Snapchat "My Selfie"**: a name for the likeness settings page, and a documented case of a default-on consent toggle that drew criticism, as a pattern to avoid.
3. **Bitmoji selfie onboarding** (via Lazyweb's screenshot flows): circular face guide, "Continue" and "Skip", center your face, find good lighting.
4. **Apple Image Playground and Genmoji**: the style set (3 Apple + 5 ChatGPT + "Any Style"), the "Describe an image" field, the "Person" → "Appearance" path, and the rule that a person must already be named in Photos.
5. **Apple Messages Live Stickers**: "Add Sticker", "Add Effect", and the effects Shiny, Comic, Puffy and Outline.
6. **Instagram Restyle**: the edit verbs "Add", "Remove" and "Change", and its preset examples.
7. **YouTube "Altered or synthetic content"** and **TikTok "Creator labeled as AI-generated" / "AI-generated"**: two-tier disclosure strings and placement rules.
8. **C2PA Content Credentials ("CR" pin)** and **Adobe Firefly**: an open provenance icon, and credentials applied automatically on export.
9. **Telegram @Stickers bot** and **Sticker.ly**: pack-export flows (/newpack → /publish → share link; "Add to WhatsApp").
10. **Gemini Apps limits page** (support.google.com/gemini/answer/16275805): the limit-reached copy and the reset-time disclosure.
11. **Lensa** and **Epik**: selfie-count guidance and good/bad examples. Epik's pay-before-generate flow is a contrast case.
12. **Verification sources, not apps:** screenshot-flow libraries such as Lazyweb (already used here) and Mobbin. They can turn the [V-weak] and [B] rows into exact on-screen strings.

## Gaps (UNKNOWN after 24 searches)

1. **Google Photos:** the Me Meme template names, and whether "Compare" is a toggle, press-and-hold or a button. The canonical Remix chip labels still conflict ("Metal Pin" vs. "enamel pins"; whether "8-bit" exists).
2. **Image Playground and Genmoji:** the AI-disclosure metadata string; the exact Genmoji entry-button label; the layout of the style picker; any consent sheet for ChatGPT styles.
3. **ChatGPT:** the exact limit-reached and upgrade copy; the US preset style names (only Indian-locale presets were returned).
4. **Snapchat:** Imagine Lens limit-reached copy; how the Snap AI watermark looks and where it sits; the selfie count for "My Selfie" and Dreams.
5. **Meta:** the exact on-screen copy for "Imagine me" setup; whether the "Imagined with AI" watermark is still on Imagine Me outputs in 2026; its size and opacity.
6. **Consent wording for using someone else's face:** no source beyond Sora (06, 16) was found with an approval request ("X wants to use your likeness") or a log of everything made with my face. Sora (renamed "Characters") is still the only analogue.
7. **A monthly allowance meter:** every limit found here is daily (Gemini, ChatGPT, Snapchat). No verified source shows "N of M left this month". Adobe Firefly's generative credits are the likely monthly analogue but were not searched ([B]).
8. **Export watermark placement:** Meta lower-left [V-weak] vs. Gemini bottom-right (06) vs. Sora moving (06). The C2PA pin's corner is [B] only. Sticker.ly, Telegram and iMessage sticker watermarks are UNKNOWN.
9. **C2PA panel field labels**, and the on-screen look of the TikTok and YouTube labels (color, size, icon).
10. **Not searched at all (out of budget):** Remini, Picsart, CapCut, Zepeto, Memoji builder labels, Adobe Firefly credits UI. They appear only in [B].
11. **Colors, fonts and motion:** apart from the Instagram Restyle icon (brush plus star) and the Bitmoji circular guide, no verified visual detail was returned. Brand colors appear only in [B] and are trademarked anyway.

## Risk notes for the product team (factual, from the rows above)

- **Names are legally live.** A US court barred OpenAI from using "Cameo" (Feb 2026, §12). Other names here are product brands that should not be copied as UI labels: "Imagine me", "Imagined with AI", "Restyle", "Genmoji", "Image Playground", "Imagine Lens", "Magic Avatars", "AI Yearbook", "Me Meme". Generic descriptive strings carry less brand risk: "Add / Remove / Change", "Compare", "Altered or synthetic content", "AI-generated", "AI info". Legal review is still needed.
- **Snapchat's default-on "See My Selfie in Ads"** drew press criticism. It conflicts with our consent model ("only consented selfies").
- **Lensa's bad-example list excludes "kids".** Epik deletes uploads after generation. Both are documented data-handling patterns for selfie sets.
- **The C2PA "CR" icon is an open standard icon.** Its usage terms on c2pa.org were not read in this round.

---

## Search log (24 of 24)

1. Image Playground iOS 26 styles · 2. Genmoji person from Photos · 3. Google Photos Me Meme templates / Compare · 4. ChatGPT Images presets · 5. Snapchat Imagine Lens · 6. Meta AI Imagine me · 7. Instagram Restyle · 8. Lensa Magic Avatars guidance · 9. Epik AI Yearbook · 10. YouTube altered or synthetic label · 11. TikTok AI-generated label · 12. Content Credentials CR pin · 13. Meta AI info label · 14. ChatGPT free image limit · 15. Telegram @Stickers bot · 16. Sora "Characters" rename · 17. Google Photos Remix Dec 2025 styles · 18. Messages Live Stickers effects · 19. Snapchat My Selfie · 20. Image Playground Person / Appearance · 21. Sticker.ly flow · 22. Bitmoji selfie onboarding · 23. Gemini image limit message · 24. Meta "Imagined with AI" watermark position
