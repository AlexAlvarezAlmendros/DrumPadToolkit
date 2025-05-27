
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { LanguageCode } from '../types';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '../constants';
import { loadLanguagePreference, saveLanguagePreference } from '../services/localStorageService';

export type Translations = Record<string, string>;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  translations: Translations;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return loadLanguagePreference() || DEFAULT_LANGUAGE;
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = useCallback(async (lang: LanguageCode) => {
    setIsLoading(true);
    try {
      // Use fetch with a path relative to the HTML document's location (index.html)
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${response.url}`);
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error(`Could not load translations for ${lang}:`, error);
      // Fallback to default language if current one fails
      if (lang !== DEFAULT_LANGUAGE) {
        console.warn(`Falling back to default language (${DEFAULT_LANGUAGE}) translations.`);
        try {
          const fallbackResponse = await fetch(`./locales/${DEFAULT_LANGUAGE}.json`);
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${fallbackResponse.status} for ${fallbackResponse.url}`);
          }
          const fallbackData = await fallbackResponse.json();
          setTranslations(fallbackData);
          setLanguageState(DEFAULT_LANGUAGE); // Also reset language state to default
          saveLanguagePreference(DEFAULT_LANGUAGE);
        } catch (fallbackError) {
            console.error(`Could not load default translations ${DEFAULT_LANGUAGE}:`, fallbackError);
            setTranslations({}); // Set to empty if even default fails
        }
      } else {
        console.error(`Failed to load default language (${DEFAULT_LANGUAGE}) translations directly.`);
        setTranslations({}); // Set to empty if default itself fails
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  const setLanguage = (lang: LanguageCode) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
        setLanguageState(lang);
        saveLanguagePreference(lang);
    } else {
        console.warn(`Attempted to set unsupported language: ${lang}. Falling back to ${DEFAULT_LANGUAGE}`);
        setLanguageState(DEFAULT_LANGUAGE);
        saveLanguagePreference(DEFAULT_LANGUAGE);
        loadTranslations(DEFAULT_LANGUAGE); // Reload translations for default
    }
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key; // Return key if translation not found
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }
    return translation;
  }, [translations]);

  if (isLoading) {
    // Render a basic loading message that doesn't need translation itself.
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center items-center">
        <p>Loading application...</p>
      </div>
    );
  }
  
  const value = { language, setLanguage, translations, t, supportedLanguages: SUPPORTED_LANGUAGES };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
