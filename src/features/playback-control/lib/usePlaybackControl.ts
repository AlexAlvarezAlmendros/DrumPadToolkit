import { useState, useEffect, useCallback, RefObject } from 'react';
import { Pattern } from '../../../entities/Pattern/model/types';
import { AudioService } from '../../../shared/lib/services/audioService';
import { DEFAULT_BPM, MAX_BPM, INSTRUMENTS_ORDER } from '../../../shared/config/constants';

export interface UsePlaybackControlProps {
  currentPattern: Pattern | null;
  audioServiceRef: RefObject<AudioService | null>;
  audioReady: boolean;
  onPatternUpdate: (newPattern: Pattern) => void; // To update BPM in App.tsx's currentPattern
}

export interface UsePlaybackControlOutput {
  isPlaying: boolean;
  currentStep: number;
  togglePlayPause: () => void;
  stopPlayback: () => void;
  changeBPM: (newBpm: number) => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export const usePlaybackControl = ({
  currentPattern,
  audioServiceRef,
  audioReady,
  onPatternUpdate,
}: UsePlaybackControlProps): UsePlaybackControlOutput => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1); // Start at -1 to indicate stopped/paused initially

  useEffect(() => {
    let timerId: number | undefined;
    if (isPlaying && currentPattern && currentPattern.bpm > 0 && audioReady && currentPattern.numSteps > 0) {
      const intervalTime = (60 * 1000) / currentPattern.bpm / (currentPattern.numSteps / 4); // Assuming 4 beats per measure for typical step display
      timerId = window.setInterval(() => {
        setCurrentStep((prevStep) => {
          const nextStep = (prevStep + 1) % currentPattern.numSteps;
          INSTRUMENTS_ORDER.forEach(instrument => {
            if (currentPattern.steps[instrument]?.[nextStep]) {
              audioServiceRef.current?.playSound(instrument);
            }
          });
          return nextStep;
        });
      }, intervalTime);
    } else {
      // Clear interval if not playing or conditions not met
      if (timerId) clearInterval(timerId);
      if (!isPlaying && currentStep !== -1) setCurrentStep(-1); // Reset step if explicitly stopped or paused
    }
    return () => clearInterval(timerId);
  }, [isPlaying, currentPattern, audioReady, audioServiceRef]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prevIsPlaying) => {
      const newIsPlaying = !prevIsPlaying;
      if (newIsPlaying) {
        // If starting playback, set currentStep to 0 if it was -1 (stopped/paused)
        setCurrentStep(prev => (prev === -1 ? 0 : prev)); 
      } else {
        // If pausing, keep currentStep as is, or set to -1 if you want to reset on pause
        // For now, let's keep it, useEffect will set to -1 if isPlaying becomes false
      }
      return newIsPlaying;
    });
  }, [setIsPlaying, setCurrentStep]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1); // Reset step to indicate stopped state
    // audioServiceRef.current?.stopAll(); // Consider if stopAll is needed and how to implement
  }, [setIsPlaying, setCurrentStep]);

  const changeBPM = useCallback((newBpm: number) => {
    if (currentPattern) {
      const updatedBpm = Math.max(DEFAULT_BPM, Math.min(MAX_BPM, newBpm));
      onPatternUpdate({ ...currentPattern, bpm: updatedBpm });
    }
  }, [currentPattern, onPatternUpdate]);

  return {
    isPlaying,
    currentStep,
    togglePlayPause,
    stopPlayback,
    changeBPM,
    setCurrentStep,
  };
};
