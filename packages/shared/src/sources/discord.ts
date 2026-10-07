/**
 * Discord Orbs & Shop → Sparks & shop (spec §J/§U). Spec omits ad-paying Quests.
 * Research: research/13 §3. Orbs → Sparks by the noun table.
 */
export const discord = {
  /** [V] "Orbs Balance" · subst Orbs→Sparks */
  balance: 'Sparks Balance',
  /** [V] "Earn Orbs" · subst */
  earn: 'Earn Sparks',
  /** [V] "Redeem Orbs in Shop" · subst */
  redeem: 'Redeem Sparks in Shop',
  /** [V] Shop tab "Orbs Exclusives" · subst */
  exclusives: 'Sparks Exclusives',
  /** [V] Shop tab */
  shopAll: 'Shop All',
  /** [V] Shop title */
  shop: 'Shop',
  /** [V] bundles "come with a discount" */
  bundles: 'Bundles',
  /** [V] "special member pricing on eligible purchases" */
  memberPricing: 'member pricing',
  /** [V] items can be previewed on your own profile before buying */
  preview: 'Preview',
  /** [V] gifting is supported */
  gift: 'Gift',
  /** [V] Quests FAQ: rewards are "automatically added to your Discord account once you claim it" → "Claim Reward" button */
  claimReward: 'Claim Reward',
  /** [V] blog headline "Reward Your Play: Complete Quests. Earn Orbs. Get Sweet Stuff." · subst Orbs→Sparks */
  headline: 'Earn Sparks. Get Sweet Stuff.',
} as const;
