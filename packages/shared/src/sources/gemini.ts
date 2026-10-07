/**
 * Gemini / Nano Banana: figurine prompt, visible sparkle watermark, "Redo with Pro".
 * Research: research/06 §2 and research/16 §2.
 */
export const gemini = {
  /** [V] opening sentence of the Sept 2025 figurine prompt; later clauses [V-weak]; joined text [B-med-high] */
  figurinePrompt:
    'Create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is a 3D modeling process of this figurine. Next to the computer screen is a toy packaging box, designed in a style reminiscent of high-quality collectible figures, printed with original artwork. The packaging features two-dimensional flat illustrations.',
  /** [V-weak] paid re-generate button "Redo with Pro" · Pro→Remix+ (our AI tier) */
  redoWith: (tier: string) => `Redo with ${tier}`,
  /** [B-med-high] visible watermark: four-point sparkle, bottom-right */
  sparkle: '✦',
} as const;
