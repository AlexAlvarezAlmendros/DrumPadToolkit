import { useCallback, RefObject } from 'react';
import { Pattern, DrumMachineSound, CustomSoundData } from '../../../entities/Pattern/model/types';
import { AudioService } from '../../../shared/lib/services/audioService';
import { LanguageContextType } from '../../../shared/lib/contexts';

export interface UseSoundManagementProps {
  currentPattern: Pattern | null;
  setCurrentPattern: React.Dispatch<React.SetStateAction<Pattern>>;
  audioServiceRef: RefObject<AudioService | null>;
  setAppMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  t: LanguageContextType['t'];
}

export interface UseSoundManagementOutput {
  handleCustomSoundUpload: (instrument: DrumMachineSound, file: File) => Promise<void>;
  handleClearCustomSound: (instrument: DrumMachineSound) => void;
  prepareSoundsForPattern: (customSounds?: Pattern['customSounds']) => Promise<void>;
}

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const fileToDataURI = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useSoundManagement = ({
  currentPattern,
  setCurrentPattern,
  audioServiceRef,
  setAppMessage,
  setError,
  t,
}: UseSoundManagementProps): UseSoundManagementOutput => {

  const prepareSoundsForPattern = useCallback(async (customSounds?: Pattern['customSounds']) => {
    if (audioServiceRef.current && customSounds) {
      try {
        await audioServiceRef.current.prepareSoundsForPattern(customSounds);
      } catch (e) {
        setError(t('app.error.failedToPrepareSounds', { message: (e as Error).message }));
      }
    }
  }, [audioServiceRef, setError, t]);

  const handleCustomSoundUpload = useCallback(async (instrument: DrumMachineSound, file: File) => {
    if (!currentPattern || !audioServiceRef.current) {
      setError(t('app.error.cannotUploadSound'));
      return;
    }
    try {
      setAppMessage(t('app.message.uploadingSound', { fileName: file.name }));
      const arrayBuffer = await fileToArrayBuffer(file);
      // We still need dataURI for prepareSoundsForPattern if it re-fetches
      // Alternatively, AudioService could store ArrayBuffers directly if custom sounds are persisted differently
      const dataURI = await fileToDataURI(file); 
      const newCustomSoundData: CustomSoundData = { dataURI, fileName: file.name };

      await audioServiceRef.current.loadCustomSoundFromArrayBuffer(instrument, arrayBuffer);
      
      setCurrentPattern(prevPattern => {
        if (!prevPattern) return prevPattern;
        const newCustomSounds = {
          ...(prevPattern.customSounds || {}),
          [instrument]: newCustomSoundData,
        };
        return { ...prevPattern, customSounds: newCustomSounds };
      });
      setAppMessage(t('app.message.soundUploaded', { instrument }));
    } catch (e) {
      setError(t('app.error.soundUploadFailed', { message: (e as Error).message }));
      setAppMessage(null);
    }
  }, [currentPattern, setCurrentPattern, audioServiceRef, setAppMessage, setError, t]);

  const handleClearCustomSound = useCallback((instrument: DrumMachineSound) => {
    if (!currentPattern || !audioServiceRef.current) return;

    audioServiceRef.current.revertToDefaultSound(instrument);

    setCurrentPattern(prevPattern => {
      if (!prevPattern) return prevPattern;
      const newCustomSounds = { ...(prevPattern.customSounds || {}) };
      delete newCustomSounds[instrument]; // Or set to null if your AudioService handles it that way
      return { ...prevPattern, customSounds: newCustomSounds };
    });
    setAppMessage(t('app.message.customSoundCleared', { instrument }));
  }, [currentPattern, setCurrentPattern, audioServiceRef, setAppMessage, t]);

  return {
    handleCustomSoundUpload,
    handleClearCustomSound,
    prepareSoundsForPattern,
  };
};
