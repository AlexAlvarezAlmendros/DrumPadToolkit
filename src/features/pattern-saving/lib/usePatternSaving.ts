import { useState, useEffect, useCallback } from 'react';
import { Pattern } from '../../../entities/Pattern/model/types';
import { createNewPattern } from '../../../entities/Pattern/lib/createNewPattern';
import { loadPatternsFromStorage, savePatternsToStorage } from '../../../shared/lib/services/localStorageService';
import { DEFAULT_NUM_STEPS } from '../../../shared/config/constants';

export interface UsePatternSavingOutput {
  savedPatterns: Pattern[];
  updateAndSavePattern: (patternToSave: Pattern) => void;
  setSavedPatternsDirectly: (patterns: Pattern[]) => void; // For loading from file or other bulk operations
}

export const usePatternSaving = (): UsePatternSavingOutput => {
  const [savedPatterns, setSavedPatterns] = useState<Pattern[]>(() => {
    const loadedPatterns = loadPatternsFromStorage();
    if (loadedPatterns.length > 0) {
      return loadedPatterns.map((p: Pattern) => ({ 
        ...p, 
        numSteps: p.numSteps || DEFAULT_NUM_STEPS, 
        // Ensure customSounds is at least an empty object if undefined
        customSounds: p.customSounds || {}
      }));
    }
    // Start with one new pattern if storage is empty, ensuring customSounds is initialized
    const initialPattern = createNewPattern();
    initialPattern.customSounds = initialPattern.customSounds || {}; 
    return [initialPattern]; 
  });

  useEffect(() => {
    // Avoid saving the very initial default pattern immediately if storage was empty
    // and it's just that single default pattern.
    const initialDefaultPattern = createNewPattern("", savedPatterns.length > 0 ? savedPatterns[0].numSteps : DEFAULT_NUM_STEPS);
    initialDefaultPattern.customSounds = initialDefaultPattern.customSounds || {};

    if (savedPatterns.length > 1 || 
        (savedPatterns.length === 1 && JSON.stringify(savedPatterns[0]) !== JSON.stringify(initialDefaultPattern))) {
      savePatternsToStorage(savedPatterns);
    } else if (savedPatterns.length === 0) {
      savePatternsToStorage([]); // Handle case where all patterns are deleted
    }
  }, [savedPatterns]);

  const updateAndSavePattern = useCallback((patternToSave: Pattern) => {
    setSavedPatterns(prevPatterns => {
      const existingPatternIndex = prevPatterns.findIndex(p => p.id === patternToSave.id);
      if (existingPatternIndex !== -1) {
        const updatedPatterns = [...prevPatterns];
        updatedPatterns[existingPatternIndex] = patternToSave;
        return updatedPatterns;
      } else {
        return [...prevPatterns, patternToSave];
      }
    });
  }, []);

  const setSavedPatternsDirectly = useCallback((patterns: Pattern[]) => {
    setSavedPatterns(patterns.map((p: Pattern) => ({ 
        ...p, 
        numSteps: p.numSteps || DEFAULT_NUM_STEPS,
        customSounds: p.customSounds || {}
      })));
  }, []);

  return {
    savedPatterns,
    updateAndSavePattern,
    setSavedPatternsDirectly,
  };
};
