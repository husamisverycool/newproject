# 21 — Events and plans: more source apps, plus Partiful gap fills

Research date: 2026-10-07. Method: WebSearch only, all in "standard" mode. **24 of the 24 allowed searches were used.** curl, WebFetch and the GitHub tools were not used, and no block was worked around.

Search results come back as engine summaries of the pages, not the raw page text. A quoted string is verbatim only as far as the summary quoted it, so capitalization and punctuation **may differ from the live UI**. Check every row against a live screen before shipping.

This file does not repeat what files 04 §3, 15 §2 and 16 §9–§11 already hold. It only adds new rows, corrects old ones, or resolves their conflicts.

**Tag legend** (same as file 15)
- **[V]**: verified from a first-party source in the search results (help.partiful.com, help.luma.com, support.apple.com, faq.whatsapp.com, support.discord.com, help.doodle.com, support.rallly.co, howbout.app, partiful.com/e pages).
- **[V-weak]**: from a third-party source (press, tutorial, design critique, flow library), from an engine summary that did not say which page it quoted, or from a first-party page whose wording the summary paraphrased.
- **[B]**: background knowledge that I could not verify. These rows appear only in the separate section near the end.

---

## 0. Status of the Partiful gaps listed in file 15

| Gap (from file 15) | Status after this round | Where |
|---|---|---|
| Full event-page order, top to bottom | **Still UNKNOWN.** Only some pieces were found: there is a bottom bar on the host page, guests can add comments, GIFs and photos, and the guest list shows Going and Maybe counts. | §1 |
| "Hosted by" wording | **Partly found.** The search engine says public partiful.com/e pages show a "Hosted by" line. The exact format with co-hosts (for example "A & B") is still UNKNOWN. | §1 |
| Comment composer placeholder | **Still UNKNOWN.** | — |
| RSVP emoji glyphs | **Still UNKNOWN.** The RSVP confirmation screen has a guest count and an optional comment or GIF. | §1 |
| Theme and effect names | **Not found for Partiful.** Luma's full set of theme category names was found instead (§2c), and it can serve as a verified substitute. | §2c |
| Waitlist label | **Partly found.** The guest's RSVP status reads "Waitlist". With Guest Approval on, the host also sees "Pending" and "Approved". The guest-facing button label is still UNKNOWN. | §1 |
| Reminder copy | **Still UNKNOWN** for Partiful. Luma's reminder schedule and channels were found, but not its wording. | §2b |
| Text-blast composer | **Partly found.** A photo can be attached. Content in restricted categories is sent as a link to the event instead of the text. | §1 |

---

## 1. Partiful — new rows only

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Partiful | Join-by-link (guest) | RSVP entry | "Open the event link in a web browser or the Partiful app, and click on your response!" | https://help.partiful.com/hc/en-us/articles/34230743189787-How-do-I-RSVP-to-an-event-on-Partiful ; https://help.partiful.com/en-us/articles/15525505-how-do-i-rsvp-to-an-event-on-partiful | [V] |
| Partiful | Join-by-link (guest) | Verify step | After the guest taps a response, they are "asked to enter your name and your phone number in order to verify your RSVP". They press "continue" and get "a code texted to your number". They "Enter that code in the popup". | same | [V] |
| Partiful | Join-by-link (guest) | After RSVP | "Once you complete your RSVP, you'll be able to see all of the event info and comment on the Activity Feed!" | same | [V] |
| Partiful | RSVP | Why "Maybe" exists | "If you're not sure yet if you can make the event, you can pick Maybe to be able to view the event details." | same | [V] (the summary may paraphrase) |
| Partiful | RSVP confirmation screen | Contents | Choice of "Going", "Maybe" or "Can't Go", an attendee count (+1s), and an optional comment or GIF | https://lazyweb.com/canvas/flows/partiful/rsvp-to-public-event | [V-weak] |
| Partiful | Waitlist (guest) | Guest view | "guests see the option to join the waitlist and their RSVP will say "Waitlist."" | https://help.partiful.com/en-us/articles/15525409-what-happens-if-the-waitlist-is-turned-off | [V] (status label "Waitlist". The button label is still UNKNOWN.) |
| Partiful | Waitlist | Waitlist off | "If the waitlist is turned off then no one is able to RSVP after the max capacity is reached." | same | [V] |
| Partiful | Waitlist + approval | Host-side statuses | With Guest Approval and Waitlist both on, the host can mark guests "Waitlist" instead of just "Pending" or "Approved" | https://help.partiful.com/en-us/articles/15525360-how-can-i-use-guest-approval-and-waitlist-at-the-same-time | [V] |
| Partiful | Waitlist | Host override | "Hosts can always override the event's waitlist capacity and mark someone as going." | https://help.partiful.com/en-us/articles/15525364-how-does-the-waitlist-move-my-guests-off-of-the-list | [V] |
| Partiful | Waitlist | Auto-move toggle exists | Help-article title: "How do I stop my event from automatically moving guests off of the waitlist?" | https://help.partiful.com/hc/en-us/articles/43489144568347-How-do-I-stop-my-event-from-automatically-moving-guests-off-of-the-waitlist | [V] (title only) |
| Partiful | Text Blast | Attachment | "You can send a photo along with your message." | https://help.partiful.com/en-us/articles/15777531-how-do-i-send-a-text-blast (from this result set) | [V] |
| Partiful | Text Blast | Restricted content | "If your text blast contains any prohibited content, the message will send as a link to your event instead of including the content of the text blast." Listed categories: cannabis, CBD, fireworks, alcohol, tobacco, firearms, adult content, hate speech, gambling, prescription drugs | https://help.partiful.com/hc/en-us/articles/29709492879259-Why-did-my-text-blast-send-as-a-link-to-my-event-instead-of-as-a-text ; https://help.partiful.com/en-us/articles/15525397-what-type-of-content-is-restricted-from-text-blasts | [V] |
| Partiful | Text Blast | Help-article title | "How do I message guests who haven't RSVP'd yet?" | https://help.partiful.com/hc/en-us/articles/27427497469595-How-do-I-message-guests-who-haven-t-RSVP-d-yet | [V] (title only) |
| Partiful | Public event page | Browser page title format | "RSVP to {Event title}". Examples: "RSVP to Fun Times w/ the Ryans", "RSVP to NY Liberty Watch Party at Hen's". One page was titled just "POOL PARTY", so the prefix is not on every page. | https://partiful.com/e/6p1Hm5OlE2YIH1VX515z ; https://partiful.com/e/X1f2Ss3Spg9uXhwTOeYH ; https://partiful.com/e/3W1AMWnarFkSMzVBEl0r | [V] |
| Partiful | Public event page | Host line + counts | The engine summary says the example pages "display "Hosted by" information along with guest lists showing how many people are "Going" and how many have marked themselves as "Maybe."" | same set of partiful.com/e pages | [V-weak] (summary; format with co-hosts UNKNOWN) |
| Partiful | Guest view | Who-can-see rule | Guests can see only the "Going" and "Maybe" lists | https://help.partiful.com/hc/en-us/articles/34608228303131-Can-guests-see-who-s-been-invited-to-the-event | [V] (repeats file 04; new URL) |
| Partiful | Event page (guest) | Guest content | "Guests can see who else is going and add comments, GIFs, and photos to the page." | https://ixd.prattsi.org/2026/09/design-critique-partiful-ios-app/ (or the 2025 critique; the summary covered both) | [V-weak] |
| Partiful | Host event page | Bottom bar | A "Host Event Management Page" has "a bar at the bottom" with editing, inviting guests and viewing the number of attendees | same | [V-weak] |
| Partiful | App nav | Tab bar | Home, Create (+), Profile | same | [V-weak] |
| Partiful | Discover | Category buttons | Category buttons "combine emojis, text labels, and button-like containers" | same | [V-weak] |
| Partiful | App Store | Listing name | "Partiful: Party Invite Maker". One storefront shows "Partiful Invites". | https://apps.apple.com/us/app/partiful-party-invite-maker/id1662982304 ; https://apps.apple.com/np/app/partiful-invites/id1662982304 | [V-weak] |
| Partiful | App Store | Feature copy | "page themes, effects, and event posters", with an option to upload your own images. Ticketing offers "free or paid tickets in multiple tiers, promo codes, and QR code check-in". | same | [V-weak] |
| Partiful | App Store | What's New | Recent notes are generic: 3.9.28 "bug fixes and improvements to app stability", 3.8.14 made the app "faster", 3.8.07 "fixed GIFs" | same | [V-weak] (no UI strings) |

---

## 2. Luma (luma.com, formerly lu.ma) — best source for the join-by-link page, blasts, reminders, waitlist and themes

The help center now lives at help.luma.com, and help.lu.ma mirrors it.

### 2a. Registration, guest statuses, waitlist

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Luma | Host guest list | Status filters | "Going" (approved guests attending), "Pending" (awaiting your approval), "Waitlist", "Invited" (invited, not yet registered) | https://help.luma.com/p/managing-your-guest-list | [V] |
| Luma | Require approval | Status after registering | "With require approval on, guests will become "Pending" once they register." Invited people are "automatically approved when they register". | https://help.luma.com/p/payment-require-approval | [V] |
| Luma | Waitlist | Trigger | "When your event reaches capacity, new registrations automatically join the waitlist". Hosts see these guests "with a "Waitlist" status". | https://help.luma.com/p/waitlist | [V] |
| Luma | Waitlist | Approve / decline | If approved, the guest gets an email and the status changes to "Going". If declined, the guest gets an email and the registration is canceled. | same | [V] |
| Luma | Join page (no account) | Registration | "On the event page, there is a button to register." Name and email are required. "Guests don't need a Luma account or a sign-in to register". | https://help.luma.com/p/event-registration-process | [V] |
| Luma | Join page | Post-RSVP share prompt | After registering, the guest is "prompted to share a link for other people to join you at the event". The invitee sees that "you are inviting them to join". The host sees who invited whom on the "Insights" tab. | https://help.luma.com/p/event-referrals | [V] |
| Luma | Join page | Group Registration | The guest selects "how many tickets they'd like to register for" before checkout | https://help.luma.com/p/group-registration | [V] |
| Luma | Event page | Host section heading | "Hosted By" (capital B) appears on luma.com event pages | https://luma.com/0m5kztnp ; https://luma.com/lx46v3jb | [V-weak] (summary; layout UNKNOWN) |

### 2b. Blasts and reminders

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Luma | Auto-reminders | Schedule | "1 day and 1 hour before the event" | https://help.luma.com/p/update-to-reminders-on-luma | [V] |
| Luma | Auto-reminders | Editable? | Automated reminder emails go to guests, but "you will not be able to edit them" | same | [V] |
| Luma | Auto-reminders | Channels + content | Email, SMS and push. They include "a link to their ticket" and, for online events, how to join | same | [V] |
| Luma | Blasts | Entry path | "Manage Event > Blasts tab" | https://help.luma.com/p/sending-or-scheduling-event-blasts | [V] |
| Luma | Blasts | Advanced composer | Click "Advanced" for longer messages, custom recipients, or to schedule the Blast. "no character limit" in Advanced. | same | [V] |
| Luma | Blasts | Default audience | "By default, Blasts are sent to all guests with the "Going" status." | same | [V] |
| Luma | Blasts | Channels | Email, SMS and push notifications | same | [V] |
| Luma | Help titles | Related settings | "SMS / WhatsApp Messages"; "Disabling or Enabling Notifications and Reminders"; "Collect Feedback from your Event Guests"; "Contacting Event Hosts" | https://help.luma.com/p/sms-whatsapp-messages ; https://help.luma.com/p/disabling-or-enabling-notifications-and-reminders ; https://help.luma.com/p/collect-feedback-from-your-event-guests ; https://help.luma.com/p/contacting-event-hosts | [V] (titles only) |

### 2c. Themes and customization (verified substitute for Partiful's unknown theme and effect names)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Luma | Theme picker | Theme categories | "Minimal", "Quantum", "Ambient", "Emoji", "Confetti", "Pattern", "Playful", "Seasonal" | https://help.luma.com/p/event-themes-and-customization ; https://help.lu.ma/p/event-themes-and-customization | [V] |
| Luma | Theme: Minimal | Description | "Clean, classic design that works for any event" | same | [V] |
| Luma | Theme: Quantum | Description | "Soft animated gradients with preset color palettes, in light and dark" | same | [V] |
| Luma | Theme: Emoji | Description | "animated emoji patterns", with "15+ emoji shapes including hearts, party, sunglasses, pumpkins, and more" | same | [V] |
| Luma | Theme: Confetti | Description | "animated confetti effects", with shapes heart, star, circle and party; "elegant fonts and liquid glass effects" | same | [V] |
| Luma | Theme picker | Per-theme control label | "Pattern", "Emoji" or "Confetti", depending on the theme | same | [V] |
| Luma | Theme | What a theme bundles | Custom fonts "from a curated collection"; color schemes "optimized for readability"; effects such as "animated backgrounds, particles, or falling snow and confetti"; "custom frames for cover images on select themes" | same | [V] |
| Luma | Theme | Font rule | You can set the font for the event name and headings. "setting a theme without a font applies the theme's default font". | same | [V] |
| Luma | Theme | Ambient / Pattern / Playful / Seasonal descriptions | NOT FOUND | — | — |

---

## 3. Apple Invites — gap fills (file 16 §9 already has RSVP choices, "Send Reply" and guest-list groups)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Apple Invites | Create | Background | Tap "Add Background", then "Photos" or "Camera" | https://support.apple.com/guide/apple-invites/create-an-event-dev1d1c7cb6b/ios | [V] |
| Apple Invites | Create | Shared album | Tap "Create Album", enter a name, then tap "Done" | same | [V] |
| Apple Invites | Create | Description | "Add Description". The host name can also be changed. | same | [V] |
| Apple Invites | Host tools | Message guests | Listed host feature: "send a note to guests" (exact button label UNKNOWN) | same / https://support.apple.com/guide/apple-invites/welcome/ios | [V-weak] (wording) |
| Apple Invites | RSVP | Optional note | After choosing Going, Not Going or Maybe, you can "optionally add a note that will be visible to the host and other guests" | https://support.apple.com/guide/apple-invites/rsvp-to-an-event-devc9d9cdbd5/ios | [V] |
| Apple Invites | Join-by-link (web, iCloud.com) | Where to RSVP | "In the Guest List tile, select Going, Not Going, or Maybe", then optionally add a message | same | [V] |
| Apple Invites | Host approval | Feature exists | Help-article title: "Approve or deny RSVP requests in Apple Invites" | https://support.apple.com/guide/apple-invites/approve-or-deny-rsvp-requests-dev48e9e39e0/ios | [V] (title only) |
| Apple Invites | Shared album | Launch copy | "Participants can easily contribute photos and videos to a dedicated Shared Album within each invite to help preserve memories and relive the event." | https://www.apple.com/newsroom/2025/02/introducing-apple-invites-a-new-app-that-brings-people-together/ | [V] |

---

## 4. WhatsApp group events — resolves the RSVP conflict in file 16 §10

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| WhatsApp | Group chat | Create entry | "Add (plus sign) > Event". Required: event name, date and time. Optional: description (up to **2,048 characters**), end time, location. | https://faq.whatsapp.com/3313983622238973/ | [V] |
| WhatsApp | Event card | RSVP labels | "Going", "Maybe", "Not going", plus "Going with guest". **This corrects file 16:** the official FAQ says "Not going", not "Can't go". | https://faq.whatsapp.com/3855462068110340/ | [V] |
| WhatsApp | Notifications | Start-of-event reminder | People who respond Going or Maybe "receive a notification when the event begins" | same | [V] |
| WhatsApp | Notifications | Edit or cancel | Going, Going with guest and Maybe responders are notified when the creator edits or cancels. Change notices are also posted to the group chat. | same | [V] |
| WhatsApp | Event card | Newer features | RSVP "maybe", invite a plus one, end date and time, "pin the event in a chat". Upcoming events are listed in chat or group info. | https://blog.whatsapp.com/new-feature-roundup-updates-to-group-chats-events-calls-channels-and-more | [V] |
| WhatsApp | Communities | Events in announcement groups | Blog title: "New to Communities: Events and Replies in Announcement Groups" | https://blog.whatsapp.com/new-to-communities-events-and-replies-in-announcement-groups | [V] (title) |

---

## 5. Discord scheduled events

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Discord | Server menu | Create | Down arrow next to the server name, then "Create Event" | https://support.discord.com/hc/en-us/articles/4409494125719-Scheduled-Events | [V] |
| Discord | Create | Off-platform location | "Somewhere Else", then enter a text channel, external link or physical location name. The other choices are Voice and Stage channels. | same | [V] |
| Discord | Event list | Start | "Events" in the channel list, then the ellipses on an event, then "Start Event" | same | [V] |
| Discord | RSVP | Single-state RSVP | "Interested". Members who mark it are notified when the event starts. | same | [V] |

---

## 6. Date polls: Doodle, Rallly, When2meet

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Doodle | Feature name | Poll type | "Group Poll" | https://help.doodle.com/en/collections/9572011-group-poll | [V] |
| Doodle | Vote cell | Tap cycle | Click once for "Yes" and twice for "If need be". The summary rendered them as "YES" and "IF-NEED-BE", so the casing is uncertain. | https://help.doodle.com/en/articles/9457279-how-do-i-participate-in-a-group-poll | [V] |
| Doodle | Host resolve | Pick + confirm | Click "the star above the date", then "Book it" at the bottom of the page. Doodle then confirms the time with participants. | https://help.doodle.com/en/articles/9457342-how-do-i-select-the-final-option-for-my-group-poll | [V] |
| Rallly | Vote options | Three states | "Yes", "If need be", "No". Each date shows "a running count of how many members can make it". | https://rallly.co/en-GB/when2meet-alternative ; https://support.rallly.co/workflow/finalize | [V] |
| Rallly | Host resolve | Finalize | "Manage", then "Finalize" from the dropdown, select a date, then "Finalize". This closes the poll to new votes, shows the chosen date "for everyone to see", and emails a calendar invite to the host and attendees. | https://support.rallly.co/workflow/finalize | [V] |
| When2meet | Group grid | Heading | "Group's Availability" | https://savvycal.com/articles/when2meet ; https://www.csc2.ncsu.edu/faculty/efg/courses/517/s24/www/demos | [V-weak] |
| When2meet | Group grid | Instruction | "Mouseover the Calendar to See Who Is Available." | same | [V-weak] |
| When2meet | Your grid | Input | Click and drag across slots. Hovering a slot lists who is available and who is unavailable. | https://allthings.how/how-to-use-when2meet/ | [V-weak] |
| LettuceMeet | — | Any string | NOT SEARCHED (budget) | — | — |

---

## 7. iOS 27 temporary shared albums — new wording beyond file 16 §11

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Photos (iOS 27) | Temporary album | Expiry sentence | "Temporary shared albums expire after 30 days, and any photos or videos not saved to your library will be deleted." | https://support.apple.com/en-ae/127875 (and localized copies of 127875) | [V] |
| Photos (iOS 27) | Support article | Title | "Create a temporary shared album on iPhone, iPad, Mac, or Apple Vision Pro" | same | [V] |
| Photos (iOS 27) | Temporary album | Countdown or "keep" prompt in the UI | NOT FOUND. The search summary says the support page gives no countdown wording. | same ; https://ente.com/articles/ios-27-shared-albums/ ; https://www.igeeksblog.com/ios-27-shared-albums-icloud-storage/ | — |

---

## 8. Howbout and Geneva (structure only, no exact UI strings)

| App | Surface | Element | Exact value | Source URL | Tag |
|---|---|---|---|---|---|
| Howbout | Positioning | One-liner | "a social calendar app made for friends who want to spend more time together and less time texting about it" | https://howbout.app/blog/making-plans/the-only-app-you-need-to-get-together-with-friends/ (result set) | [V] (marketing) |
| Howbout | Plan | What a plan holds | Location "with direct links to maps", time and date, "Who's invited and who's confirmed", a "Built-in chat just for that event", and "Photos and updates related to the plan" | https://howbout.app/blog/making-plans/the-app-to-get-friends-together (result set) | [V] (feature list, not UI copy) |
| Howbout | Plan | Customization | "Customise your group plans with headers, locations, details, RSVPs, and reminders" | https://howbout.app/groups | [V] |
| Howbout | Polls | Live availability | Polls for dates, restaurants or costume themes; "responses update live based on everyone's availability" | same result set | [V] |
| Howbout | Calendar | Availability | Friends see each other's free time and "drop plans directly into their calendars". It syncs with Google, Apple and Outlook calendars. | same result set | [V] |
| Geneva | Group home | Room types | "Chat rooms, Post rooms, Video rooms, Audio rooms, and Broadcast rooms" | https://indiehackers.com/post/introducing-geneva-an-all-in-one-communication-app-for-groups-clubs-and-communities-6301a80650 | [V-weak] |
| Geneva | Events | Copy | "event invites and a centralized calendar"; "All you have to do is RSVP and show up." | same ; https://genevachat.com/about | [V-weak] |

---

## 9. Which source best informs each of our surfaces

| Our surface (spec §P/§T) | Best verified source(s) | Why |
|---|---|---|
| Plan card inside the group chat | **WhatsApp events** (§4); Partiful for labels | A native event card inside a group chat. Uses "Add (plus sign) > Event", can be pinned in the chat, and posts change notices into the chat. |
| Find a Time (date poll) | Partiful (file 15 §2d) for the name and flow; **Rallly** and **Doodle** for vote states and resolve wording | Partiful already uses Yes / No / Maybe and "Pick this". Rallly shows "running count" per date. Doodle has the "star above the date" plus "Book it" pattern. |
| RSVP Going / Maybe / Can't Go | Partiful (labels); **Apple Invites** (optional note visible to everyone); **WhatsApp** ("Going with guest") | Our labels are Partiful's. Apple's note-on-RSVP and WhatsApp's +1 state are verified additions. |
| Host text blasts | Partiful (photo attach, restricted-content fallback); **Luma** (Blasts tab, default audience "Going", schedule via "Advanced") | Luma documents scheduling and the default audience, which Partiful's help center does not. |
| Reminders | Partiful (1 week / 2 hours); **Luma** (1 day / 1 hour, not editable); **WhatsApp** (when the event begins) | Three verified schedules. Reminder **copy** remains unknown for all of them. |
| Shared album, 30-day expiry unless kept | **iOS 27 Photos** ("Make Album Temporary", expiry sentence in §7); Apple Invites ("Create Album"); Partiful ("Upload Photos") | Apple's sentence is the only verified wording for 30-day deletion. |
| Join-by-link page, no account | Partiful (name, phone, then texted code); **Luma** (name and email, no account, share prompt after registering); Apple Invites (iCloud.com "Guest List" tile) | All three are verified no-app RSVP flows. |
| Waitlist / capacity | Partiful (status "Waitlist", "Pending", "Approved"); **Luma** (filters "Going", "Pending", "Waitlist", "Invited") | Both use the noun "Waitlist" as the status label. |
| Theme and effect names | **Luma** theme categories (§2c) | Partiful's names are still unknown. |
| Single-tap "interested" (light RSVP) | **Discord** ("Interested", notified on "Start Event") | Possible pattern for a low-commitment state. |

---

## 10. Recommended additions to the source list

1. **Luma help center** (help.luma.com/p/…): event-themes-and-customization, waitlist, managing-your-guest-list, payment-require-approval, sending-or-scheduling-event-blasts, update-to-reminders-on-luma, event-registration-process, event-referrals, group-registration. Luma is the best-documented first-party source for blasts, reminders, waitlist and themes.
2. **WhatsApp FAQ** 3313983622238973 (create/edit events) and 3855462068110340 (respond to events). These are official RSVP labels for an event card inside a chat.
3. **Rallly**: support.rallly.co (finalize, schedule, invite). Rallly is open source, so its English locale file in the GitHub repo `lukevella/rallly` would give exact strings. **Not read here** because of the WebSearch-only rule. The license is AGPL, so check it before copying anything other than short labels.
4. **Doodle help center** "Group Poll" collection (9457279 participate, 9457342 select final option).
5. **Discord** support article 4409494125719 "Scheduled Events".
6. **Apple Invites user guide**: create-an-event (dev1d1c7cb6b), rsvp-to-an-event (devc9d9cdbd5), approve-or-deny-rsvp-requests (dev48e9e39e0).
7. **Apple support 127875** "Create a temporary shared album…" (localized copies exist, for example en-ae).
8. **Lazyweb Partiful flows**: /canvas/flows/partiful/rsvp-to-public-event and /create-event. These are screen-by-screen captures and the most likely place to settle the Partiful page order, emoji and comment placeholder. They need a sign-up.
9. **Public partiful.com/e/… pages**: a live check of "Hosted by" formatting, page order and the comment box. Viewing one needs a browser, not WebSearch.
10. **Howbout** (howbout.app/groups and blog): plan structure only.
11. Low value: **Geneva** (no documented RSVP labels found) and **Facebook Events** (the help page exists, 1571121606521970, but no labels came back).

---

## 11. Gaps (UNKNOWN after 24 searches)

**Partiful**
- Event-page order from top to bottom.
- Exact "Hosted by" format with co-hosts.
- Comment composer placeholder.
- RSVP emoji glyphs.
- Guest-facing waitlist button label.
- Reminder SMS copy.
- Text Blast composer field labels and the "Send" label.
- Theme and effect display names.

**Luma**
- Exact registration button label, such as "Register", "One-Click RSVP" or "Request to Join". It was not in the summaries.
- Registered-state copy, such as "You're In".
- Reminder and blast email wording.
- Descriptions for the Ambient, Pattern, Playful and Seasonal themes.
- Event-page layout order.
- Luma font names and hex values.

**Apple Invites**
- Exact label of the host "send a note" button.
- Event-page order.
- Album behavior after the event.

**WhatsApp**
- Event-card visual layout and the reminder notification text.

**Discord**
- Event card layout and the creation steps' headers.

**Doodle**
- Casing of "If need be". Icon colors.

**Rallly**
- Exact button casing in the app.

**When2meet**
- Verification against when2meet.com itself. The sources were a third-party guide and a university page.

**LettuceMeet, Posh, Evite, Paperless Post, Instagram events, Eventbrite**
- Not searched (budget).

**Facebook Events**
- RSVP labels not verified.

**Howbout and Geneva**
- No exact UI strings.

**iOS 27**
- Countdown or "keep album" prompt wording.

**All apps**
- Colors, fonts and motion: none verified in this round, apart from Luma's descriptive phrases about themes.

---

## BACKGROUND KNOWLEDGE [B] (not verified; do not merge into the tables above)

Partiful [B] rows that file 15 already lists (emoji 👍 / 🤔 / 😢, "Hosted by A & B", rough page order, "Join Waitlist") are not repeated here.

| App | Surface | Element | Believed value | Confidence | Tag |
|---|---|---|---|---|---|
| Luma | Event page | Layout | Cover image (left on desktop, top on mobile), then title, a date/time row with a calendar tile, a location row, a "Registration" card with the register button, "About Event", a "Location" map, "Hosted By" with host avatars, an "N Going" avatar stack, "Contact the Host", "Report Event" | medium | [B] |
| Luma | Registration card | Copy | "Welcome! To join the event, please register below." and a button reading "Register", or "One-Click RSVP" for signed-in users | medium | [B] |
| Luma | Registered state | Copy | "You're In" plus a confirmation-email line, "Add to Calendar", "Invite a Friend", and a cancel line such as "No longer able to attend? … cancel your registration" | medium (You're In) / low (others) | [B] |
| Luma | Approval / full | Button labels | "Request to Join" when approval is required; "Join Waitlist" when full; guest sees "Pending Approval" | medium | [B] |
| Luma | Brand | UI font | Inter-like sans for UI; theme fonts vary | low | [B] |
| Discord | Create flow | Step headers | Three steps, "Location", "Event Info", "Review". Location options are "Stage Channel", "Voice Channel" and "Somewhere Else". | medium | [B] |
| Discord | Event card | "Interested" control | Button with a bell or check icon and a count of interested members | medium | [B] |
| Facebook Events | RSVP | Labels | "Going", "Interested", "Can't go" ("Maybe" was replaced by "Interested" years ago); "Not interested" for public events | medium | [B] |
| When2meet | Grids | Labels | Left grid "Your Availability" with legend "Unavailable" / "Available"; right grid "Group's Availability" with legend "0/N Available" to "N/N Available", green shading darker with more people | medium | [B] |
| Doodle | Vote cell | Icons | Green check for Yes; yellow or bracketed check "(Yes)" for If need be | medium | [B] |
| Apple Invites | Event page | Layout | Full-bleed background image at top with the title over it, date/time, location (Maps), host line, a guest avatar row with "Going" counts, then Shared Album and Apple Music playlist tiles | medium | [B] |
| WhatsApp | Event card | Bubble layout | Calendar icon, "Event" label, title, date/time, location, a "N going" summary, and a button to respond or view the event inside the chat bubble | medium-low | [B] |
| Evite | RSVP | Labels | "Yes", "No", "Maybe", with adult and kid counts and an optional message to the host | medium (labels) / low (rest) | [B] |
| Posh | Event page | Labels | "RSVP" / "Get Tickets" button; "Kickback" is Posh's referral or affiliate feature name | medium (Kickback) / low (buttons) | [B] |
| Geneva | Company | Status | Bumble acquired Geneva (reported early 2024). The product's current state is uncertain. | medium-low | [B] |
| Partiful | Activity Feed | Composer placeholder | Something like "Add a comment…" | low | [B] |
| Partiful | Auto-reminder SMS | Copy pattern | Starts with the event title and time and a partiful.com/e link | low | [B] |

---

## Risk notes (factual)

- "Book it" (Doodle), "Find a Time" and "Text Blast" (Partiful), and "Interested" (Discord) are feature names other products use. Copying them verbatim may draw IP or trade-dress attention. This needs legal review, as file 16 also notes.
- Rallly is AGPL open source. Copying its locale strings is low risk for short UI labels but should be reviewed.
- RSVP casing differs between sources:
  - Apple: "Not Going"
  - WhatsApp: "Not going"
  - Partiful: "Can't Go"

  The spec's "Can't Go" matches Partiful, so keep that casing.

---

## Sources consulted (all via WebSearch, 24 searches)

- help.partiful.com: 34230743189787, 15525505 (RSVP); 15525409, 15525360, 15525364, 43489144568347 (waitlist); 15777531, 29709492879259, 15525397, 27427497469595 (text blast); 34608228303131 (guest visibility)
- https://partiful.com/e/6p1Hm5OlE2YIH1VX515z ; https://partiful.com/e/X1f2Ss3Spg9uXhwTOeYH ; https://partiful.com/e/3W1AMWnarFkSMzVBEl0r ; https://partiful.com/e/LRMiJBSatk16Z01jpx8b
- https://ixd.prattsi.org/2026/09/design-critique-partiful-ios-app/ ; https://ixd.prattsi.org/2025/02/design-critique-partiful/
- https://lazyweb.com/canvas/flows/partiful/rsvp-to-public-event
- https://apps.apple.com/us/app/partiful-party-invite-maker/id1662982304
- help.luma.com/p/: managing-your-guest-list, payment-require-approval, waitlist, event-registration-process, event-referrals, group-registration, update-to-reminders-on-luma, sending-or-scheduling-event-blasts, event-themes-and-customization, sms-whatsapp-messages, disabling-or-enabling-notifications-and-reminders
- https://luma.com/0m5kztnp ; https://luma.com/lx46v3jb
- support.apple.com/guide/apple-invites: dev1d1c7cb6b, devc9d9cdbd5, dev48e9e39e0, welcome
- https://www.apple.com/newsroom/2025/02/introducing-apple-invites-a-new-app-that-brings-people-together/
- https://support.apple.com/en-ae/127875 ; https://ente.com/articles/ios-27-shared-albums/ ; https://www.igeeksblog.com/ios-27-shared-albums-icloud-storage/
- https://faq.whatsapp.com/3313983622238973/ ; https://faq.whatsapp.com/3855462068110340/ ; https://blog.whatsapp.com/new-feature-roundup-updates-to-group-chats-events-calls-channels-and-more
- https://support.discord.com/hc/en-us/articles/4409494125719-Scheduled-Events
- https://help.doodle.com/en/articles/9457279 ; https://help.doodle.com/en/articles/9457342
- https://support.rallly.co/workflow/finalize ; https://rallly.co/en-GB/when2meet-alternative
- https://savvycal.com/articles/when2meet ; https://allthings.how/how-to-use-when2meet/
- howbout.app: /groups, blog posts
- https://indiehackers.com/post/introducing-geneva-an-all-in-one-communication-app-for-groups-clubs-and-communities-6301a80650 ; https://genevachat.com/about
- https://www.facebook.com/help/1571121606521970 (no labels returned)
