import { useState, useCallback, RefObject } from 'react';
import { Pattern } from '../../../entities/Pattern/model/types';
import { AudioService, ExportService } from '../../../shared/lib/services';
import { LanguageContextType } from '../../../shared/lib/contexts';

type MidiLibraryStatus = 'loading' | 'loaded' | 'failed';

export interface UsePatternExportProps {
  currentPattern: Pattern | null;
  audioServiceRef: RefObject<AudioService | null>;
  exportServiceRef: RefObject<ExportService | null>;
  midiLibraryStatus: MidiLibraryStatus;
  setAppMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  t: LanguageContextType['t'];
}

export interface UsePatternExportOutput {
  handleExportMidi: () => Promise<void>;
  handleExportWav: () => Promise<void>;
  isExportingMidi: boolean;
  isExportingWav: boolean;
}

export const usePatternExport = ({
  currentPattern,
  audioServiceRef,
  exportServiceRef,
  midiLibraryStatus,
  setAppMessage,
  setError,
  t,
}: UsePatternExportProps): UsePatternExportOutput => {
  const [isExportingMidi, setIsExportingMidi] = useState(false);
  const [isExportingWav, setIsExportingWav] = useState(false);

  const handleExportMidi = useCallback(async () => {
    if (!currentPattern || !exportServiceRef.current) {
      setError(t('app.error.cannotExport'));
      return;
    }
    if (midiLibraryStatus !== 'loaded') {
      setError(t('app.error.midiNotReady'));
      return;
    }
    setIsExportingMidi(true);
    try {
      await exportServiceRef.current.exportPatternToMidi(currentPattern);
      setAppMessage(t('app.message.midiExported', { name: currentPattern.name }));
    } catch (err) {
      setError(t('app.error.midiExportFailed', { message: (err as Error).message }));
    } finally {
      setIsExportingMidi(false);
    }
  }, [currentPattern, exportServiceRef, midiLibraryStatus, setAppMessage, setError, t]);

  const handleExportWav = useCallback(async () => {
    if (!currentPattern || !exportServiceRef.current || !audioServiceRef.current) {
      setError(t('app.error.cannotExportWav'));
      return;
    }
    if (!audioServiceRef.current.isReady()) {
        setError(t('app.error.audioServiceNotReady'));
        return;
    }

    setIsExportingWav(true);
    try {
      await exportServiceRef.current.exportPatternToWav(currentPattern, audioServiceRef.current);
      setAppMessage(t('app.message.wavExported', { name: currentPattern.name }));
    } catch (err) {
      setError(t('app.error.wavExportFailed', { message: (err as Error).message }));
    } finally {
      setIsExportingWav(false);
    }
  }, [currentPattern, exportServiceRef, audioServiceRef, setAppMessage, setError, t]);

  return {
    handleExportMidi,
    handleExportWav,
    isExportingMidi,
    isExportingWav,
  };
};
