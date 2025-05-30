import { Pattern, LanguageCode } from '../../model/types';
import { MAX_PATTERN_SIZE_BYTES_WARN, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '../../config/constants';

const PATTERNS_STORAGE_KEY = 'drumPatterns';

export const savePatternsToStorage = (patterns: Pattern[]): void => {
  try {
    const serializedPatterns = JSON.stringify(patterns);
    const sizeInBytes = new TextEncoder().encode(serializedPatterns).length;
    
    if (sizeInBytes > MAX_PATTERN_SIZE_BYTES_WARN) {
      console.warn(
        `Total size of saved patterns (${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB) is large. ` +
        `Browser localStorage has limits (typically 5-10MB). ` +
        `Consider using fewer/smaller custom sounds or exporting patterns if you encounter issues.`
      );
    }
    localStorage.setItem(PATTERNS_STORAGE_KEY, serializedPatterns);
  } catch (error) {
    console.error("Error saving patterns to local storage:", error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert("Error: Could not save patterns. Browser storage limit exceeded. Please try removing some custom sounds or deleting older patterns.");
    }
  }
};

export const loadPatternsFromStorage = (): Pattern[] => {
  try {
    const storedPatterns = localStorage.getItem(PATTERNS_STORAGE_KEY);
    if (storedPatterns) {
      const parsedPatterns: Pattern[] = JSON.parse(storedPatterns);
      return parsedPatterns.map(p => ({
        ...p,
        customSounds: p.customSounds || {} 
      }));
    }
  } catch (error) {
    console.error("Error loading patterns from local storage:", error);
  }
  return [];
};

// Language Preference
export const saveLanguagePreference = (language: LanguageCode): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error("Error saving language preference to local storage:", error);
  }
};

export const loadLanguagePreference = (): LanguageCode | null => {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode;
    if (storedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === storedLanguage)) {
      return storedLanguage;
    }
  } catch (error) {
    console.error("Error loading language preference from local storage:", error);
  }
  return null;
};
