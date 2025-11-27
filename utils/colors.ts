// Cool colors for Outer Wheel (Students)
export const COLD_COLORS = [
  '#3B82F6', // Blue 500
  '#6366F1', // Indigo 500
  '#8B5CF6', // Violet 500
  '#0EA5E9', // Sky 500
  '#06B6D4', // Cyan 500
  '#14B8A6', // Teal 500
  '#2563EB', // Blue 600
  '#4F46E5', // Indigo 600
  '#7C3AED', // Violet 600
  '#0284C7', // Sky 600
];

// Warm colors for Inner Wheel (Questions/Gifts)
export const HOT_COLORS = [
  '#EF4444', // Red 500
  '#F97316', // Orange 500
  '#F59E0B', // Amber 500
  '#EAB308', // Yellow 500
  '#F43F5E', // Rose 500
  '#DC2626', // Red 600
  '#EA580C', // Orange 600
  '#D97706', // Amber 600
  '#CA8A04', // Yellow 600
  '#E11D48', // Rose 600
];

// Nature colors for Extra Wheel (Time)
export const NATURE_COLORS = [
  '#10B981', // Emerald 500
  '#84CC16', // Lime 500
  '#22C55E', // Green 500
  '#14B8A6', // Teal 500
  '#059669', // Emerald 600
  '#65A30D', // Lime 600
  '#16A34A', // Green 600
  '#0D9488', // Teal 600
];

export const getColor = (index: number, palette: string[]) => {
  return palette[index % palette.length];
};