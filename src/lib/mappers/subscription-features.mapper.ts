// Feature key to Romanian label mapping
export const subscriptionFeatureLabels: Record<string, string> = {
  maxUsers: "Numărul maxim de utilizatori",
  apiAccess: "Acces API",
  basicReports: "Rapoarte de bază",
  emailSupport: "Suport prin email",
  phoneSupport: "Suport telefonic",
  customReports: "Rapoarte personalizate",
  waterReadings: "Citiri contor apă",
  advancedReports: "Rapoarte avansate",
  prioritySupport: "Suport prioritar",
  automaticBilling: "Facturare automată",
  dedicatedManager: "Manager dedicat",
  smsNotifications: "Notificări SMS",
  automaticNotifications: "Notificări automate",
  customApi: "API personalizat",
  teamTraining: "Training pentru echipă",
  customImplementation: "Implementare personalizată",
};

// Feature categories for better organization
export const featureCategories = {
  core: {
    label: "Funcționalități de bază",
    features: ["waterReadings", "automaticBilling", "basicReports"],
  },
  users: {
    label: "Gestionare utilizatori",
    features: ["maxUsers"],
  },
  reports: {
    label: "Rapoarte și analize",
    features: ["basicReports", "advancedReports", "customReports"],
  },
  support: {
    label: "Suport și asistență",
    features: ["emailSupport", "phoneSupport", "prioritySupport", "dedicatedManager", "teamTraining"],
  },
  notifications: {
    label: "Notificări",
    features: ["automaticNotifications", "smsNotifications"],
  },
  integration: {
    label: "Integrări și API",
    features: ["apiAccess", "customApi", "customImplementation"],
  },
};

/**
 * Maps a feature key to its Romanian label
 * 
 * @param featureKey - The feature key from the features object
 * @returns The Romanian label for the feature
 * 
 * @example
 * ```typescript
 * const label = getFeatureLabel("maxUsers"); // "Numărul maxim de utilizatori"
 * ```
 */
export function getFeatureLabel(featureKey: string): string {
  return subscriptionFeatureLabels[featureKey] || featureKey;
}

/**
 * Maps a features object to display format with labels and values
 * 
 * @param features - The features object from subscription plan
 * @returns Array of feature objects with labels and formatted values
 * 
 * @example
 * ```typescript
 * const displayFeatures = mapFeaturesToDisplay(plan.features);
 * // Returns: [{ key: "maxUsers", label: "Numărul maxim de utilizatori", value: "5", enabled: true }]
 * ```
 */
export function mapFeaturesToDisplay(features: Record<string, any>) {
  return Object.entries(features).map(([key, value]) => ({
    key,
    label: getFeatureLabel(key),
    value: formatFeatureValue(key, value),
    enabled: getFeatureEnabled(key, value),
    rawValue: value,
  }));
}

/**
 * Formats feature values for display
 * 
 * @param featureKey - The feature key
 * @param value - The raw feature value
 * @returns Formatted string for display
 */
export function formatFeatureValue(featureKey: string, value: any): string {
  if (value === null) {
    return "Nelimitat";
  }
  
  if (typeof value === "boolean") {
    return value ? "Inclus" : "Nu este inclus";
  }
  
  if (typeof value === "number") {
    if (featureKey === "maxUsers") {
      return `${value} utilizatori`;
    }
    return value.toString();
  }
  
  return String(value);
}

/**
 * Determines if a feature is enabled/included
 * 
 * @param featureKey - The feature key
 * @param value - The raw feature value
 * @returns True if feature is enabled/included
 */
export function getFeatureEnabled(featureKey: string, value: any): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  
  if (typeof value === "number") {
    return value > 0;
  }
  
  if (value === null) {
    return true; // null usually means unlimited, which is enabled
  }
  
  return !!value;
}

/**
 * Gets features organized by categories
 * 
 * @param features - The features object from subscription plan
 * @returns Features organized by categories
 */
export function getFeaturesByCategory(features: Record<string, any>) {
  const displayFeatures = mapFeaturesToDisplay(features);
  
  return Object.entries(featureCategories).map(([categoryKey, category]) => ({
    key: categoryKey,
    label: category.label,
    features: category.features
      .map(featureKey => displayFeatures.find(f => f.key === featureKey))
      .filter(Boolean),
  }));
}

/**
 * Gets only the enabled/included features
 * 
 * @param features - The features object from subscription plan
 * @returns Array of enabled features with labels
 */
export function getEnabledFeatures(features: Record<string, any>) {
  return mapFeaturesToDisplay(features).filter(feature => feature.enabled);
} 