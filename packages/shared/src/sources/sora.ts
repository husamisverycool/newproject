/**
 * Sora app likeness permissions → likeness consent (spec §F, §S). Research: research/06 §3,
 * research/16 §3 and research/26 §12. A US court barred OpenAI from Sora's original feature name
 * (Feb 2026) and the feature is now "Characters" [V-weak]; the old name is not used anywhere here.
 * The four audience options are Sora's [V]; spec §S adds "my groups" for the onboarding picker.
 */
export const sora = {
  /** [V] option 1 */
  onlyMe: 'Only me',
  /** [V] option 2 */
  peopleIApprove: 'People I approve',
  /** [V] option 3: "Mutuals" (you follow them and they follow you) */
  mutuals: 'Mutuals',
  /** [V] option 4 */
  everyone: 'Everyone',
  /** [V-weak] path: edit → preferences → restrictions */
  restrictions: 'Restrictions',
  /** [V] official examples of restriction instructions */
  restrictionExamples: ["don't put me in videos that involve political commentary", "don't let me say this word"] as const,
  /** [V-weak] setup: turn your face toward two of four directions ("up, down, left, right"), live, with the front camera. On-screen prompt wording is UNKNOWN, so only the direction words are shown. */
  directions: { left: 'left', right: 'right', up: 'up', down: 'down' },
  /** [V-weak] (summary wording) "You can see drafts that include your likeness, even if someone else created them" */
  draftsLine: 'You can see drafts that include your likeness, even if someone else created them',
  /** [V-weak] from "you can remove or retake your [likeness] anytime" */
  retake: 'Retake',
  /** [V-weak] from "you can remove or retake your [likeness] anytime"; "you can always remove videos that include your [likeness]" */
  remove: 'Remove',
} as const;
