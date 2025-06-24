/**
 * Consistent icon colors used throughout the application
 * These colors ensure visual consistency across all pages and components
 */

export const ICON_COLORS = {
  // Building related icons
  building: "text-blue-500",
  buildings: "text-blue-500",

  // Apartment related icons
  apartment: "text-blue-500",
  home: "text-blue-500",

  water: "text-blue-500",

  // Floor/Level related icons
  floor: "text-purple-500",
  levels: "text-purple-500",

  // User/People related icons
  user: "text-indigo-500",
  users: "text-indigo-500",
  residents: "text-indigo-500",

  // Location related icons
  location: "text-red-500",
  address: "text-red-500",
  mapPin: "text-red-500",

  // Status related icons
  occupied: "text-green-500",
  available: "text-orange-500",
  vacant: "text-orange-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",

  // Actions related icons
  edit: "text-blue-500",
  settings: "text-gray-500",
  add: "text-white",
  create: "text-green-500",
  generate: "text-yellow-500",
  delete: "text-red-500",

  // Time/Calendar related icons
  calendar: "text-emerald-500",
  time: "text-emerald-500",
  date: "text-emerald-500",

  // Statistics related icons
  stats: "text-purple-500",
  chart: "text-purple-500",
  analytics: "text-purple-500",

  // Navigation related icons
  back: "text-gray-600",
  forward: "text-gray-600",

  // Generic/Utility icons
  info: "text-blue-400",
  help: "text-blue-400",
  check: "text-green-500",
  close: "text-gray-500",
  search: "text-gray-500",
} as const;

export type IconColorKey = keyof typeof ICON_COLORS;

/**
 * Get icon color by key
 * @param key - The icon color key
 * @returns The Tailwind CSS color class
 */
export function getIconColor(key: IconColorKey): string {
  return ICON_COLORS[key];
}

/**
 * Icon color mappings for specific use cases
 */
export const ICON_COLOR_MAPPINGS = {
  // Building page icons
  buildingPage: {
    building: ICON_COLORS.building,
    calendar: ICON_COLORS.calendar,
    address: ICON_COLORS.address,
    totalApartments: ICON_COLORS.apartment,
    occupiedApartments: ICON_COLORS.occupied,
    vacantApartments: ICON_COLORS.vacant,
    floors: ICON_COLORS.floor,
    edit: ICON_COLORS.edit,
    settings: ICON_COLORS.settings,
    generate: ICON_COLORS.generate,
    add: ICON_COLORS.add,
  },

  // Apartment page icons
  apartmentPage: {
    apartment: ICON_COLORS.apartment,
    building: ICON_COLORS.building,
    floor: ICON_COLORS.floor,
    occupants: ICON_COLORS.user,
    surface: ICON_COLORS.location,
    status: {
      occupied: ICON_COLORS.occupied,
      vacant: ICON_COLORS.vacant,
    },
    edit: ICON_COLORS.edit,
    settings: ICON_COLORS.settings,
    calendar: ICON_COLORS.calendar,
    address: ICON_COLORS.address,
    residents: ICON_COLORS.residents,
    water: ICON_COLORS.water,
  },

  // Admin dashboard icons
  adminDashboard: {
    buildings: ICON_COLORS.buildings,
    apartments: ICON_COLORS.apartment,
    users: ICON_COLORS.users,
    stats: ICON_COLORS.stats,
    add: ICON_COLORS.add,
    manage: ICON_COLORS.settings,
  },
} as const;
