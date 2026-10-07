import { BRAND } from '../brand.ts';

/**
 * Developer-only copy for the desktop demo stage (apps/web/src/stage). It is not part of the
 * product and never ships to a phone; it explains the demo controls. [DEMO]
 */
export const demo = {
  /** [DEMO] */
  viewAs: 'Demo · view as',
  /** [DEMO] */
  time: 'Demo · time',
  /** [DEMO] jump the server clock into the ritual window */
  jumpToRoll: 'Jump to roll day',
  /** [DEMO] */
  developNow: 'Develop now',
  /** [DEMO] */
  backToToday: 'Back to today',
  /** [DEMO] */
  provenance: 'Every string, color and layout traces to a source; see research/30-inspo-folder.md and packages/shared/src/sources.',
  /** [DEMO] */
  name: BRAND.name,
} as const;
