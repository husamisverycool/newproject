/**
 * Telegram collectible gifts → numbered card upgrades (spec §J). Research: research/13 §2.
 * Spec omits blockchain transfer, auctions and crafting.
 */
export const telegram = {
  /** [V-weak] title format "Gem Signet – Collectible #5475" */
  collectibleTitle: (name: string, n: number) => `${name} – Collectible #${n}`,
  /** [V] attribute rows, each with a rarity % */
  model: 'Model',
  /** [V] */
  backdrop: 'Backdrop',
  /** [V] */
  symbol: 'Symbol',
  /** [V-weak] */
  owner: 'Owner',
  /** [V-weak] "Quantity" e.g. "6 030 / 6 962 issued" */
  quantity: 'Quantity',
  /** [V-weak] */
  issued: (n: number, of: number) => `${n.toLocaleString('fr-FR')} / ${of.toLocaleString('fr-FR')} issued`,
  /** [V] button on a collectible: "select 'Wear'" */
  wear: 'Wear',
  /** [B-low-med] while worn */
  takeOff: 'Take Off',
  /** [B-med] upgrade sheet title "Upgrade Gift" · subst gift→card */
  upgradeTitle: 'Upgrade Card',
  /** [B-med] upgrade sheet row "Unique" */
  unique: 'Unique',
  /** [B-med] "get a unique number, model, backdrop and symbol" */
  uniqueLine: 'Get a unique number, model, backdrop and symbol.',
  /** [B-med] button "Upgrade for ⭐ N" · Stars → Shinedust */
  upgradeFor: (cost: string) => `Upgrade for ${cost}`,
  /** [V] blog: collectibles "receive a random set of secondary traits, including a background color, icon and number" */
  traitsLine: 'a background color, icon and number',
  /** [V] "Every collectible gift is a unique work of art — and some will be more rare than others" · subst gift→card */
  rarityLine: 'Every collectible card is a unique work of art — and some will be more rare than others',
  /** [V] wearing gives "a glittering star effect" and matches the profile to "the backdrop and symbol" */
  wearLine: 'a glittering star effect',
  /** [V] blog (Jan 2025): a collectible "can be posted to your story — generating an elegant animated preview"; path "Share > Post to Story" */
  postToStory: 'Post to Story',
} as const;
