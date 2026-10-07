# The in-Claude build

**roll.** also ships as an app that runs entirely inside a Claude artifact. You open it in Claude on
the web or in the Claude phone app. Friends you share the artifact with use it together: same
groups, chats, photos, games and cards. There is no server to host.

## How it works
| Piece | Node build | In-Claude build |
|---|---|---|
| Server | `apps/server` on Node (Hono) | The same code, bundled into the page; `app.fetch` answers the app's requests (`apps/server/src/page.ts`) |
| Database | `node:sqlite` file | SQLite in the page (sql.js, asm.js build), `apps/web/src/live/shims/sqlite.ts` |
| Shared state | One database | Each page has its own copy, kept identical through the shared op log (see below) |
| Photos and voice | `.data/media` | Artifact assets (`/_blob/<id>`) for viewers who can upload; shared documents in parts for everyone else (`live/media.ts`) |
| Image processing | sharp | Canvas and pixel loops with sharp's API (`live/shims/sharp.ts`) |
| Sign-in | Session cookie | The signed-in Claude viewer (`user.id()`), through `platform.userIdFor` |
| Live updates | WebSocket | Events ride inside the op log; typing goes over the artifact's room |
| Game master | Anthropic API key | The viewer's own Claude (`sample`), only for something a member did |
| Push | Web Push | In-app notifications and toasts only |
| Scheduled jobs | `setInterval` on the server | The one open page holding the `meta/leader` lease |
| Camera | `getUserMedia` | The frame has no camera: the shutter opens the system camera (`<input capture>`) |

### The op log (`apps/web/src/live/oplog.ts`)
- Every write statement the server runs is recorded with its parameters, through the SQLite shim.
  Statements that change no rows are skipped.
- Each request's statements become one op: `ops/<key>` (gzip + base64), sent to the artifact's `db` store.
- Keys are hybrid-logical-clock strings that sort the same way on every page.
- A page's database is always "snapshot + every known op in key order + its own unsent writes".
- An op that arrives out of order triggers a rebuild from a local checkpoint. The checkpoint trails
  the newest op by about 15 s.
- The page holding the lease writes a snapshot every 300 ops (`snap/current`, stored as an asset or
  as document parts).
- Ops older than the previous snapshot are deleted after an hour. A page that has been away longer
  reloads.

## Commands
```sh
node scripts/build-live.mjs <outDir> [artifactUrl]   # → <outDir>/site (page + files.json)
node scripts/test-live.mjs <siteDir> [shots]         # two friends: sign up, join, post, chat, reload
node scripts/test-sync.mjs <siteDir>                 # simultaneous writes converge; snapshot + late joiner
node scripts/sweep-live.mjs <siteDir> [shots]        # three friends, heavy server work, every screen
```

The tests run on `scripts/live-mock.mjs`, which stands in for the Claude runtime:
- one shared `db` store;
- assets served at `/_blob/<id>`;
- one room;
- a different signed-in viewer per page.

## Publishing
Publish `<outDir>/site/index.html` with:
- the files in `files.json`;
- capabilities `{db:{}, user:{}, assets:{}, room:{topics:{op:'interact', typing:'interact'}}, sample:{}, downloads:true}`.

Friends need to be able to write:
- in the owner's organization, share as **Contributor** or higher;
- people outside it, invite by email as **Editor**, and don't also share the artifact by public link.

Viewers see the app read-only, with a "View only" pill.

A friend opening the shared app signs up and is offered the owner's newest group. The Room Code on
the welcome screen joins any other group.
