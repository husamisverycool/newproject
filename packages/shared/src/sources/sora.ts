/**
 * Sora app cameos → likeness consent (spec §S). Research: research/06 §3 and research/16 §3.
 * Spec adapts the options to "no one / my groups / specific friends"; "Everyone" is dropped (no public surface).
 */
export const sora = {
  /** [V] option 1 */
  onlyMe: 'Only me',
  /** [V] option 2 */
  peopleIApprove: 'People I approve',
  /** [S] spec §S "my groups" in place of Sora's "Mutuals" */
  myGroups: 'My groups',
  /** [V-weak] path: edit cameo → cameo preferences → restrictions */
  editCameo: 'Edit Cameo',
  /** [V-weak] */
  preferences: 'Cameo preferences',
  /** [V-weak] */
  restrictions: 'Restrictions',
  /** [V] official examples of restriction instructions */
  restrictionExamples: ["don't put me in videos that involve political commentary", "don't let me say this word"] as const,
  /** [V-weak] setup: turn your face toward two of four directions ("up, down, left, right"), live, with the front camera. On-screen prompt wording is UNKNOWN, so only the direction words are shown. */
  directions: { left: 'left', right: 'right', up: 'up', down: 'down' },
  /** [V-weak] (summary wording) "You can see drafts that include your likeness, even if someone else created them" */
  draftsLine: 'You can see drafts that include your likeness, even if someone else created them',
  /** [V-weak] "you can remove or retake your cameo anytime" */
  retake: 'Retake',
  /** [V-weak] */
  removeCameo: 'Remove',
} as const;
