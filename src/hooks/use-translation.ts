import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import esTranslations from '@/translations/es';
import enTranslations from '@/translations/en';

type TranslationStore = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
};

// Constante para el idioma por defecto
const DEFAULT_LANGUAGE = 'es';

// Almacén de estado para el idioma
export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set, get) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang: string) => set({ language: lang }),
      t: (key: string, params?: Record<string, any>) => {
        const { language } = get();
        const translations = language === 'es' ? esTranslations : enTranslations;
        let text = translations[key] || key;
        
        if (params) {
          Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
          });
        }
        
        return text;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

// Hook personalizado para facilitar el uso de las traducciones
export const useTranslation = () => {
  const { language, setLanguage, t } = useTranslationStore();

  return {
    language,
    setLanguage,
    t,
  };
};

export default useTranslation;