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
  /** [V-weak] one-line tile descriptions under "Your tools" (research/06 §1.2, 9to5Google; single source) */
  toolLines: {
    /** "Transform your photos into different styles like 'Anime'" */
    remix: "Transform your photos into different styles like 'Anime'",
    /** "Combine multiple photos in one stylish layout" */
    collage: 'Combine multiple photos in one stylish layout',
    /** "Animate your photo and turn static moments into dynamic six-second video clips" (may be the blog's wording, not the tile's) */
    photoToVideo: 'Animate your photo and turn static moments into dynamic six-second video clips',
    /** "A 3D effect added to photos" */
    cinematic: 'A 3D effect added to photos',
    /** "A quick-moving GIF of selected photos and videos" */
    animation: 'A quick-moving GIF of selected photos and videos',
    /** "A video with music that uses photos and videos" */
    highlight: 'A video with music that uses photos and videos',
  },
  /**
   * [V-weak] Remix style names, keyed by the server's style ids (apps/server/src/ai/local.ts).
   * Launch four from Android Authority (research/06 §1.4, 16 §1); Dec 2025 additions from
   * jetstream/Yahoo (research/26 §3; CONFLICT: 9to5Google says "enamel pins" where this list says
   * "Metal Pin"); "8-bit" from 9to5Google prose; the last two from the descriptive template list
   * (research/26 §3, "these look like descriptions, not chip labels").
   */
  remixStyles: {
    comic: 'Comic book',
    anime: 'Anime',
    sketch: 'Sketch',
    '3d': '3D animation',
    watercolor: 'Watercolor',
    '8bit': '8-bit',
    sticker: 'Chibi Sticker',
    enamel_pin: 'Metal Pin',
    polaroid: 'Instant film with flash',
    figurine: 'Collectible figurine',
  } as Record<string, string>,
  /** [V-weak] Me Meme: "tap Compare to compare the uploaded photo to the generated meme" (support.google.com 16763021, research/26 §3) */
  compare: 'Compare',
  /** [V] AI info field label "Credit" (9to5Google 2024-10-24, research/06 §1.6) */
  credit: 'Credit',
  /** [V] AI info field label "Digital source type" */
  digitalSourceType: 'Digital source type',
  /** [V] AI info value "Edited using Generative AI" */
  editedUsingGenAI: 'Edited using Generative AI',
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
  /** [V-weak] Photo to video output: "six-second video clips" (research/06 §1.2) */
  photoToVideoSeconds: 6,
  /** [B-med] Library › "Creations": where Google Photos keeps the movies, animations, collages and cinematic photos you made */
  creations: 'Creations',
} as const;
