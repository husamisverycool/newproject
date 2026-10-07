/**
 * Disposable-camera apps: Lapse and Dispo. The week's roll "develops" (spec §D).
 * Research: research/01 and research/11.
 */
export const film = {
  /** [V] Dispo: photos develop "the next morning at 9 a.m." */
  develops: 'develops',
  /** [V] Dispo: users create "film rolls" */
  roll: 'roll',
  /** [V] Lapse: photos "develop" at a surprise time */
  developed: 'developed',
  /** [V-weak] Lapse: 36 photos per roll (early version) */
  shots: 36,
} as const;
