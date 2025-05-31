/**
 * Predefined color classes for StatCard icons
 * These are suggestions - you can use any Tailwind color class including custom ones
 */
export const STAT_CARD_COLORS = {
  // Primary colors
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  red: "text-red-600 dark:text-red-400",
  orange: "text-orange-600 dark:text-orange-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  pink: "text-pink-600 dark:text-pink-400",

  // Extended colors
  indigo: "text-indigo-600 dark:text-indigo-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  teal: "text-teal-600 dark:text-teal-400",
  violet: "text-violet-600 dark:text-violet-400",
  rose: "text-rose-600 dark:text-rose-400",
  sky: "text-sky-600 dark:text-sky-400",
  lime: "text-lime-600 dark:text-lime-400",
  amber: "text-amber-600 dark:text-amber-400",

  // Neutral
  muted: "text-muted-foreground",
  slate: "text-slate-600 dark:text-slate-400",
  gray: "text-gray-600 dark:text-gray-400",
  zinc: "text-zinc-600 dark:text-zinc-400",
  neutral: "text-neutral-600 dark:text-neutral-400",
  stone: "text-stone-600 dark:text-stone-400",
} as const;

/**
 * Type for predefined colors (optional - you can still use any string)
 */
export type StatCardColor =
  (typeof STAT_CARD_COLORS)[keyof typeof STAT_CARD_COLORS];

/**
 * Example usage:
 *
 * // Using predefined colors
 * <StatCard iconColor={STAT_CARD_COLORS.blue} />
 *
 * // Using custom Tailwind classes
 * <StatCard iconColor="text-custom-500 dark:text-custom-300" />
 *
 * // Using any Tailwind color
 * <StatCard iconColor="text-fuchsia-500 hover:text-fuchsia-600" />
 */
