import { useCallback, RefObject } from 'react';
import { Pattern, DrumMachineSound, StepState } from '../../../entities/Pattern/model/types';
import { AudioService } from '../../../shared/lib/services/audioService';
import { INSTRUMENTS_ORDER, SUPPORTED_STEP_COUNTS } from '../../../shared/config/constants';
import { LanguageContextType } from '../../../shared/lib/contexts';

export interface UseStepSequencingProps {
  currentPattern: Pattern | null;
  setCurrentPattern: React.Dispatch<React.SetStateAction<Pattern>>;
  isPlaying: boolean;
  audioReady: boolean;
  audioServiceRef: RefObject<AudioService | null>;
  setAppMessage: (message: string | null) => void;
  t: LanguageContextType['t'];
}

export interface UseStepSequencingOutput {
  toggleStep: (instrument: DrumMachineSound, stepIndex: number) => void;
  clearPattern: () => void;
  changeNumSteps: (newNumSteps: number) => void;
}

export const useStepSequencing = ({
  currentPattern,
  setCurrentPattern,
  isPlaying,
  audioReady,
  audioServiceRef,
  setAppMessage,
  t,
}: UseStepSequencingProps): UseStepSequencingOutput => {

  const toggleStep = useCallback((instrument: DrumMachineSound, stepIndex: number) => {
    setCurrentPattern((prevPattern: Pattern) => {
      if (!prevPattern) return prevPattern; // Should not happen if UI is disabled for null pattern
      const newSteps = { ...prevPattern.steps };
      const instrumentSteps = [...(newSteps[instrument] || Array(prevPattern.numSteps).fill(false))];
      instrumentSteps[stepIndex] = !instrumentSteps[stepIndex];
      newSteps[instrument] = instrumentSteps;
      
      if (instrumentSteps[stepIndex] && !isPlaying && audioReady) {
        audioServiceRef.current?.playSound(instrument);
      }
      return { ...prevPattern, steps: newSteps };
    });
  }, [isPlaying, audioReady, audioServiceRef, setCurrentPattern]);

  const clearPattern = useCallback(() => {
    if (!currentPattern) return;
    const clearedSteps: Record<DrumMachineSound, StepState[]> = {} as Record<DrumMachineSound, StepState[]>;
    INSTRUMENTS_ORDER.forEach(instrument => {
      clearedSteps[instrument] = Array(currentPattern.numSteps).fill(false);
    });
    setCurrentPattern((prev: Pattern) => ({ ...prev, steps: clearedSteps }));
    setAppMessage(t('app.message.patternCleared'));
  }, [currentPattern, setCurrentPattern, t, setAppMessage]);

  const changeNumSteps = useCallback((newNumSteps: number) => {
    if (SUPPORTED_STEP_COUNTS.includes(newNumSteps) && currentPattern) {
      setCurrentPattern(prev => {
        if (!prev) return prev; // Should not happen
        const newStepsState = { ...prev.steps };
        INSTRUMENTS_ORDER.forEach(instr => {
          const currentInstrumentSteps = prev.steps[instr] || [];
          if (newNumSteps > currentInstrumentSteps.length) {
            newStepsState[instr] = [
              ...currentInstrumentSteps,
              ...Array(newNumSteps - currentInstrumentSteps.length).fill(false)
            ];
          } else if (newNumSteps < currentInstrumentSteps.length) {
            newStepsState[instr] = currentInstrumentSteps.slice(0, newNumSteps);
          }
        });
        return { ...prev, numSteps: newNumSteps, steps: newStepsState };
      });
    }
  }, [currentPattern, setCurrentPattern]);

  return {
    toggleStep,
    clearPattern,
    changeNumSteps,
  };
};
