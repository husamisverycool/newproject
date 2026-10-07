# Source decks

Every user-visible string in the app comes from one of these files. Each file holds one source app's
wording. UI code imports from here and never types copy inline; `npm run check:copy` enforces that.

## Tags (one per entry, in its JSDoc)

| Tag | Meaning |
|---|---|
| `[V]` | Verified: an official page, or two or more independent sources, quote this wording. |
| `[V-weak]` | One third-party source, or a summary that may paraphrase. |
| `[B-high]` / `[B-med]` / `[B-low]` | Background knowledge of the source app, not verified this pass. Confirm with captures (`docs/CAPTURE.md`). |
| `[HIG]` | Apple's standard iOS wording or component (these apps are native iOS apps; unknown details fall back to the platform default). |
| `[S]` | Wording from the product spec itself (the user's document). Used only when no source app has the string. |

Precedence when choosing copy: `[V]` > `[V-weak]` > `[B-high]` > `[B-med]` > `[B-low]` > `[S]` > no text.

## Adapting a source string

A string is adapted **only** by swapping nouns using the table below, and the entry's JSDoc quotes the original.
Nothing else is reworded.

| Source noun | Our noun | Why |
|---|---|---|
| Locket, BeReal, Retro, yope, Rollcall (as the app or the ritual) | `roll.` | our app name |
| a Locket, a BeReal, a Snap (as the content noun) | a photo | |
| Duo (as the speaker) | the group's mascot name | spec §M: the mascot is the voice |
| Google AI | roll. AI | provenance label |
| listening / listen | posting / post | Wrapped → photos |
| songs, tracks, music | photos | Wrapped → photos |
| artists | friends | Wrapped → photos |
| playlist / mixes | wall | Wrapped → photos |
| podcasts | voice notes | Wrapped → photos |
| club (Wrapped Clubs) | group | |
| library (Spotify) | binder | |
| Orbs | Sparks | spec §J names the currency "Sparks" |
| gift (Telegram collectible) | card | spec §J numbered card upgrades |
| gold sticker (Monopoly GO) | ☆ card | spec §J trading windows |
| 5 friends (Locket gate) | 2 friends | spec §A3: the wall unlocks at 3 members (you + 2) |
| 20 friends (Locket cap) | 30 friends | spec §C: group cap 30 |
| every 24 hours (TCG Premium Pass) | every week | spec §J: packs are weekly |
