/**
 * Sistema de feature flags para controlar funcionalidades
 * 
 * Uso:
 * import { isFeatureEnabled } from '@/lib/feature-flags';
 * 
 * if (isFeatureEnabled('classes')) {
 *   // Mostrar funcionalidad de clases
 * }
 */

export interface FeatureFlags {
  classes: boolean;    // Funcionalidad de clases
  trainers: boolean;   // Funcionalidad de entrenadores
  announcements: boolean; // Funcionalidad de anuncios
  equipment: boolean; // Funcionalidad de equipamiento
}

// Configuración central de feature flags
// Se puede cambiar a una carga dinámica desde API o localStorage en el futuro
export const FEATURES: FeatureFlags = {
  classes: false,        // Deshabilitar funcionalidad de clases
  trainers: false,       // Deshabilitar funcionalidad de entrenadores
  announcements: false,  // Deshabilitar funcionalidad de anuncios
  equipment: false,      // Deshabilitar funcionalidad de equipamiento
};

/**
 * Verificar si una funcionalidad está habilitada
 * @param feature Nombre de la funcionalidad a verificar
 * @returns true si la funcionalidad está habilitada, false en caso contrario
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURES[feature];
}