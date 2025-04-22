import { create } from 'zustand';
import esTranslations from '@/translations/es';
import enTranslations from '@/translations/en';

// Definir los tipos para nuestros idiomas
export type Language = 'es' | 'en';

// Definir el tipo para nuestro estado
interface I18nState {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Crear el store para el estado de idioma
export const useI18nStore = create<I18nState>((set) => ({
  language: 'es', // Idioma predeterminado: español
  setLanguage: (language) => set({ language }),
}));

// Función para obtener traducción
export function t(key: string, language?: Language): string {
  const currentLanguage = language || useI18nStore.getState().language;
  
  // Usar los archivos externos de traducciones
  const translations = currentLanguage === 'es' ? esTranslations : enTranslations;
  
  return translations[key] || key;
}