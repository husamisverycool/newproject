# 27 — Apple Human Interface Guidelines extracts (tag [HIG])

Fetched 2026-10-07 from Apple's HIG JSON
(`https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`):
live-activities, widgets, notifications, sheets, alerts, tab-bars, buttons, color, typography.
Unknown details in a source app fall back to these values.

## Live Activities (iPhone 393×852 pt)
| Presentation | Size (pt) |
|---|---|
| Compact leading / trailing | 52.33×36.67 |
| Minimal | 36.67–45×36.67 |
| Expanded | 371×84–160 |
| Lock Screen | 371×84–160 |

- "The standard layout margin for Live Activities on the Lock Screen is **14 points**."
- "The Dynamic Island uses a corner radius of **44 points**."
- Dynamic Island width: 230 pt compact/minimal and 371 pt expanded on 6.1″ phones (250/408 on the larger ones).
- Use even margins concentric with the Live Activity's rounded corners.

## Widgets (iPhone 393×852 pt)
| Family | Size (pt) |
|---|---|
| Small | 158×158 |
| Medium | 338×158 |
| Large | 338×354 |
| Accessory circular | 72×72 |
| Accessory rectangular | 160×72 |
| Accessory inline | 234×26 |

- "Use the standard margin width for widgets — **16 points** for most widgets … margins of **11 points** can work well" for tighter groupings.
- Text should be at least **11 pt**.
- Coordinate content corners with the widget's corners (ContainerRelativeShape).

## Typography — Dynamic Type, Large (default)
| Style | Size/Leading (pt) | Weight |
|---|---|---|
| Large Title | 34/41 | Regular |
| Title 1 | 28/34 | Regular |
| Title 2 | 22/28 | Regular |
| Title 3 | 20/25 | Regular |
| Headline | 17/22 | Semibold |
| Body | 17/22 | Regular |
| Callout | 16/21 | Regular |
| Subhead | 15/20 | Regular |
| Footnote | 13/18 | Regular |
| Caption 1 | 12/16 | Regular |
| Caption 2 | 11/13 | Regular |

## Color
- The HIG color page lists the system color names (systemRed, systemOrange, systemYellow, systemGreen, systemMint, systemTeal, systemCyan, systemBlue, systemIndigo, systemPurple, systemPink, systemBrown, systemGray…).
- Its swatches are images, so the light/dark hex values used in `apps/web/src/styles/tokens.css` come from the iOS SDK's documented sRGB values [HIG/B-high].

## Components used as fallbacks
- Sheets with a grabber and detents.
- Alerts with up to two side-by-side buttons; the preferred action is bold.
- Tab bars: floating capsule on iOS 26 (our app uses Yope's capsule [I] instead).
- Buttons: filled, tinted and gray.
- Notifications: app icon, title, body, time.

Full extracts: `scratchpad/hig-*.md` in the build session.
