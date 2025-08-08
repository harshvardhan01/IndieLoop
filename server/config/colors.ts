export const craftColors = {
  brown: "#8B4513",
  tan: "#D2B48C", 
  peru: "#CD853F",
  beige: "#F5F5DC",
  green: "#228B22",
  crimson: "#DC143C",
} as const;

export type CraftColor = typeof craftColors[keyof typeof craftColors];
