/**
 * Co-pet apps: Widgetable "Raise Pets Together" and Pengu ("Friends – Pengu, Bao & Mellow").
 * The group mascot is a shared pet (spec §M). Research: research/14 §3–4.
 */
export const pets = {
  /** [V] Widgetable feature name */
  raiseTogether: 'Raise Pets Together',
  /** [V] "adopt adorable virtual pets and co-parent them with your friends" */
  adoptLine: 'adopt adorable virtual pets and co-parent them with your friends',
  /** [V] "feed, play, and watch them grow" */
  growLine: 'feed, play, and watch them grow',
  /** [V-weak] Widgetable species; Pengu adds the penguin [V] */
  species: [
    { id: 'cat', name: 'Cat' },
    { id: 'dog', name: 'Dog' },
    { id: 'bird', name: 'Bird' },
    { id: 'panda', name: 'Panda' },
    { id: 'polarbear', name: 'Polar bear' },
    { id: 'duck', name: 'Rubber duck' },
    { id: 'penguin', name: 'Penguin' },
  ] as const,
  /** [V-weak] flow: "Choose a pet, name it, invite a friend" */
  choosePet: 'Choose a pet',
  /** [V-weak] */
  nameIt: 'Name it',
  /** [V-weak] */
  inviteAFriend: 'Invite a friend',
  /** [V-weak] care actions "feed, bathe, hug, pet" */
  actions: { feed: 'Feed', bathe: 'Bathe', hug: 'Hug', pet: 'Pet' },
  /** [V-weak] coins buy "new clothes and house decorations" */
  clothes: 'Clothes',
  /** [V-weak] */
  decorations: 'House decorations',
  /** [V] Pengu dress-up "stylish outfits, accessories, and unique wallpapers" */
  outfits: 'Outfits',
  /**
   * [B-high] Duolingo shop outfits for Duo (background knowledge, drawn in components/Mascot.tsx):
   * "Formal Attire", "Champion Jersey", "Luxury Tracksuit". Pengu sells "stylish outfits" [V] (research/14 §4).
   */
  outfitNames: { outfit_formal: 'Formal Attire', outfit_jersey: 'Champion Jersey', outfit_tracksuit: 'Luxury Tracksuit' } as Record<string, string>,
  /** [V] */
  accessories: 'Accessories',
  /** [V] */
  wallpapers: 'Wallpapers',
  /** [V] Pengu: "send reactions and gifts, celebrate milestones" */
  milestonesLine: 'celebrate milestones',
  /** [V] Pengu widget: "check in, chat, and interact … directly from your home screen" */
  widgetLine: 'check in, chat, and interact directly from your home screen',
} as const;
