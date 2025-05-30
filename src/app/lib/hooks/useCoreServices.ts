import { useState, useEffect, useRef } from 'react';
import { AudioService, ExportService } from '../../../shared/lib/services';
import { LanguageContextType } from '../../../shared/lib/contexts'; // For t function

type MidiLibraryStatus = 'loading' | 'loaded' | 'failed';

export interface UseCoreServicesOutput {
  audioServiceRef: React.RefObject<AudioService | null>;
  exportServiceRef: React.RefObject<ExportService | null>;
  audioReady: boolean;
  midiLibraryStatus: MidiLibraryStatus;
  initializationError: string | null; // Renamed from 'error' to be specific to this hook
}

interface UseCoreServicesProps {
  t: LanguageContextType['t'];
  onAudioServiceReady?: () => void; // Signal that audio service default sounds are loaded and service is ready
}

export const useCoreServices = ({ t, onAudioServiceReady }: UseCoreServicesProps): UseCoreServicesOutput => {
  const audioServiceRef = useRef<AudioService | null>(null);
  const exportServiceRef = useRef<ExportService | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [midiLibraryStatus, setMidiLibraryStatus] = useState<MidiLibraryStatus>('loading');
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    audioServiceRef.current = new AudioService();
    exportServiceRef.current = new ExportService();

    let attempts = 0;
    const MAX_ATTEMPTS = 25;
    const midiCheckInterval = setInterval(() => {
      if (typeof (window as any).MidiWriter === 'object' && typeof (window as any).MidiWriter.Writer === 'function') {
        setMidiLibraryStatus('loaded');
        clearInterval(midiCheckInterval);
      } else {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(midiCheckInterval);
          setMidiLibraryStatus('failed');
          setInitializationError(t('app.error.midiLoadFailed'));
        }
      }
    }, 200);

    audioServiceRef.current.loadDefaultSounds()
      .then(() => {
        if (audioServiceRef.current?.isReady()) {
          setAudioReady(true);
          if (onAudioServiceReady) {
            onAudioServiceReady(); // Signal readiness
          }
        } else {
          setInitializationError(t('app.status.loadingSounds'));
        }
      })
      .catch(loadError => {
        setInitializationError(t('app.error.failedToPrepareSounds', { message: (loadError as Error).message }));
      });

    return () => {
      clearInterval(midiCheckInterval);
      // Potentially add cleanup for audio context if needed
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]); // onAudioServiceReady should be stable or wrapped in useCallback if passed from parent

  return {
    audioServiceRef,
    exportServiceRef,
    audioReady,
    midiLibraryStatus,
    initializationError,
  };
};
