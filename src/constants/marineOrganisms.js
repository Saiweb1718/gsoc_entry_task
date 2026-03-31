export const ORGANISMS = [
  { id: "clownfish", name: "Clownfish",  emoji: "🐠", type: "organism" },
  { id: "turtle",    name: "Sea Turtle", emoji: "🐢", type: "organism" },
  { id: "shark",     name: "Shark",      emoji: "🦈", type: "organism" },
  { id: "octopus",   name: "Octopus",    emoji: "🐙", type: "organism" },
  { id: "dolphin",   name: "Dolphin",    emoji: "🐬", type: "organism" },
  { id: "crab",      name: "Crab",       emoji: "🦀", type: "organism" },
  { id: "jellyfish", name: "Jellyfish",  emoji: "🪼", type: "organism" },
  { id: "whale",     name: "Whale",      emoji: "🐋", type: "organism" },
];

export const EMOJI_MAP = ORGANISMS.reduce((m, a) => {
  m[a.id] = a.emoji;
  return m;
}, {});

export const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23e0e6ee' stroke-width='1'/%3E%3C/svg%3E")`;