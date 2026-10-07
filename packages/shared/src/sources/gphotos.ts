import { BRAND } from '../brand.ts';

/**
 * Google Photos: Create tab ("Your tools"), Remix styles, Me Meme, AI disclosure, Memories.
 * Research: research/06 §1 and research/16 §1. "Google AI" → "roll. AI".
 */
export const gphotos = {
  /** [V] bottom-nav tab */
  create: 'Create',
  /** [V-weak] heading of the tools grid */
  yourTools: 'Your tools',
  /** [V] tool names (blog order; on-screen order UNKNOWN) */
  tools: {
    photoToVideo: 'Photo to video',
    remix: 'Remix',
    collage: 'Collage',
    highlight: 'Highlight videos',
    cinematic: 'Cinematic photos',
    animation: 'Animations',
    meMeme: 'Me Meme',
  },
  /** [V-weak] Remix style names (Android Authority list) */
  remixStyles: { threeD: '3D animation', anime: 'Anime', sketch: 'Sketch', comic: 'Comic book' },
  /** [V-weak] Photo to video prompts */
  subtleMovement: 'Subtle movement',
  /** [V-weak] */
  feelingLucky: "I'm feeling lucky",
  /** [V] Me Meme / Remix button */
  generate: 'Generate',
  /** [V] Me Meme result actions */
  save: 'Save',
  /** [V] */
  regenerate: 'Regenerate',
  /** [V] */
  share: 'Share',
  /** [V] Me Meme step 1: choose a preset template or upload your own funny picture */
  chooseTemplate: 'Choose a template',
  /** [V] "upload your own funny picture" */
  uploadOwn: 'Upload your own',
  /** [V] photo guidance: "well-lit, focused, and front-facing" */
  selfieGuidance: 'well-lit, focused, and front-facing',
  /** [V-weak] experimental note: results "may not perfectly match the original photo" */
  mayNotMatch: 'may not perfectly match the original photo',
  /** [V] AI disclosure note "Edited with Google AI" · subst Google AI→roll. AI */
  editedWith: `Edited with ${BRAND.name} AI`,
  /** [V] credit "Made by Google AI" · subst */
  madeBy: `Made by ${BRAND.name} AI`,
  /** [V-weak] section in Details */
  aiInfo: 'AI info',
  /** [B-low-med] Memories card title "N years ago" */
  yearsAgo: (n: number) => `${n} ${n === 1 ? 'year' : 'years'} ago`,
} as const;
