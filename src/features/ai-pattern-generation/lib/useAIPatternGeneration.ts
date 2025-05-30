import { useState, useCallback } from 'react';
import { Pattern, DrumMachineSound, StepState } from '../../../entities/Pattern/model/types';
import { createNewPattern } from '../../../entities/Pattern/lib/createNewPattern';
import { LanguageCode } from '../../../shared/model/types';
import { generateDrumPattern as fetchAIDrumPattern, suggestPatternName as fetchSuggestedPatternName } from '../../../shared/lib/services'; // Assumes services are exported from index
import { AI_PATTERNING_GENRE_KEYS, AI_GENRE_API_MAP } from '../../../shared/config/constants';

export interface UseAIPatternGenerationProps {
  currentPattern: Pattern | null;
  language: LanguageCode;
  onPatternGenerated: (newPattern: Pattern) => void;
  onNameSuggested: (newName: string) => void;
  setAppMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
}

export interface UseAIPatternGenerationOutput {
  selectedAIGenreKey: string;
  setSelectedAIGenreKey: React.Dispatch<React.SetStateAction<string>>;
  isGeneratingAIPattern: boolean;
  isLoadingAISuggestion: boolean;
  handleGenerateAIPattern: () => Promise<void>;
  handleSuggestPatternName: () => Promise<void>;
}

export const useAIPatternGeneration = ({
  currentPattern,
  language,
  onPatternGenerated,
  onNameSuggested,
  setAppMessage,
  setError,
}: UseAIPatternGenerationProps): UseAIPatternGenerationOutput => {
  const [selectedAIGenreKey, setSelectedAIGenreKey] = useState<string>(AI_PATTERNING_GENRE_KEYS[0]);
  const [isGeneratingAIPattern, setIsGeneratingAIPattern] = useState<boolean>(false);
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState<boolean>(false);

  const handleGenerateAIPattern = useCallback(async () => {
    if (!currentPattern) return;
    setIsGeneratingAIPattern(true);
    setError(null);
    try {
      const genreForAPI = AI_GENRE_API_MAP[selectedAIGenreKey] || selectedAIGenreKey;
      const generatedData = await fetchAIDrumPattern(genreForAPI, currentPattern.bpm, currentPattern.numSteps);
      if (generatedData) {
        // Map GeneratedAIPattern to a full Pattern object
        // Preserve ID and Name from the original pattern, update steps and BPM
        const updatedPattern: Pattern = {
          ...(currentPattern || createNewPattern()), // Fallback to new pattern if current is null
          id: currentPattern?.id || createNewPattern().id, // Ensure ID is present
          name: currentPattern?.name || 'AI Generated Pattern', // Keep original name or provide a default
          steps: {
            ...(currentPattern?.steps || {}),
            ...generatedData.generatedSteps as Record<DrumMachineSound, StepState[]> // Cast because generatedSteps is Partial
          },
          bpm: generatedData.generatedBpm || currentPattern.bpm,
          numSteps: currentPattern.numSteps, // numSteps should remain consistent with what was requested
          customSounds: currentPattern?.customSounds || {}
        };
        onPatternGenerated(updatedPattern);
        setAppMessage('AI pattern generated successfully!'); // Consider using i18n
      } else {
        setAppMessage('Failed to generate AI pattern.'); // Consider using i18n
      }
    } catch (err) {
      setError(`Error generating AI pattern: ${(err as Error).message}`);
    } finally {
      setIsGeneratingAIPattern(false);
    }
  }, [currentPattern, selectedAIGenreKey, language, onPatternGenerated, setAppMessage, setError]);

  const handleSuggestPatternName = useCallback(async () => {
    if (!currentPattern) return;
    setIsLoadingAISuggestion(true);
    setError(null);
    try {
      if (!currentPattern) { 
        setError('Cannot suggest name for a null pattern.'); 
        setIsLoadingAISuggestion(false); 
        return; 
      }
      const suggestedName = await fetchSuggestedPatternName(
        { steps: currentPattern.steps, bpm: currentPattern.bpm, numSteps: currentPattern.numSteps }, 
        language
      );
      if (suggestedName) {
        onNameSuggested(suggestedName);
        setAppMessage(`Suggested name: ${suggestedName}`); // Consider using i18n
      } else {
        setAppMessage('Failed to suggest a name.'); // Consider using i18n
      }
    } catch (err) {
      setError(`Error suggesting name: ${(err as Error).message}`);
    } finally {
      setIsLoadingAISuggestion(false);
    }
  }, [currentPattern, language, onNameSuggested, setAppMessage, setError]);

  return {
    selectedAIGenreKey,
    setSelectedAIGenreKey,
    isGeneratingAIPattern,
    isLoadingAISuggestion,
    handleGenerateAIPattern,
    handleSuggestPatternName,
  };
};
