
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pattern, DrumMachineSound, StepState, CustomSoundData, LanguageCode } from './types';
import { 
  DEFAULT_BPM, DEFAULT_NUM_STEPS, INSTRUMENTS_ORDER, MIN_BPM, MAX_BPM, 
  MAX_CUSTOM_SOUND_SIZE_BYTES, AI_PATTERNING_GENRE_KEYS, SUPPORTED_STEP_COUNTS,
  AI_GENRE_API_MAP, SUPPORTED_LANGUAGES
} from './constants';
import Sequencer from './components/Sequencer';
import Controls from './components/Controls';
import PatternManager from './components/PatternManager';
import { savePatternsToStorage, loadPatternsFromStorage } from './services/localStorageService';
import { suggestPatternName as fetchSuggestedPatternName, generateDrumPattern as fetchAIDrumPattern } from './services/geminiService';
import { AudioService } from './services/audioService';
import { ExportService } from './services/exportService';
import { LanguageProvider } from './contexts/LanguageContext'; // Import LanguageProvider
import { useTranslations } from './hooks/useTranslations'; // Corrected import path

type MidiLibraryStatus = 'loading' | 'loaded' | 'failed';

const createNewPattern = (nameSuffix: string = '', numSteps: number = DEFAULT_NUM_STEPS): Pattern => {
  const initialSteps: Record<DrumMachineSound, StepState[]> = {} as Record<DrumMachineSound, StepState[]>;
  const initialCustomSounds: Partial<Record<DrumMachineSound, CustomSoundData | null>> = {};

  INSTRUMENTS_ORDER.forEach(instrument => {
    initialSteps[instrument] = Array(numSteps).fill(false);
    initialCustomSounds[instrument] = null;
  });
  return {
    id: crypto.randomUUID(),
    name: `New Pattern ${nameSuffix}`.trim(), // This will be translated or handled differently
    bpm: DEFAULT_BPM,
    steps: initialSteps,
    numSteps: numSteps,
    customSounds: initialCustomSounds,
  };
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, supportedLanguages, t } = useTranslations();

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm text-slate-400">
        {t('app.languageSwitcher.label')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="bg-slate-700 text-slate-100 border border-slate-600 rounded-md p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500"
      >
        {supportedLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
    </div>
  );
};


const AppContent: React.FC = () => {
  const { t, language } = useTranslations(); // Hook for translations
  const [savedPatterns, setSavedPatterns] = useState<Pattern[]>([]);
  const [currentPattern, setCurrentPattern] = useState<Pattern>(() => createNewPattern(t('app.message.newPatternCreated')));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appMessage, setAppMessage] = useState<string | null>(null);

  const [isExportingMidi, setIsExportingMidi] = useState(false);
  const [isExportingWav, setIsExportingWav] = useState(false);

  const audioServiceRef = useRef<AudioService | null>(null);
  const exportServiceRef = useRef<ExportService | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [midiLibraryStatus, setMidiLibraryStatus] = useState<MidiLibraryStatus>('loading');

  const [selectedAIGenreKey, setSelectedAIGenreKey] = useState<string>(AI_PATTERNING_GENRE_KEYS[0]);
  const [isGeneratingAIPattern, setIsGeneratingAIPattern] = useState<boolean>(false);

  const getInstrumentName = useCallback((instrument: DrumMachineSound) => {
    const key = `instrument.${instrument.toLowerCase().replace(/ /g, '_')}`;
    return t(key);
  }, [t]);

  // Initialize services and load initial data
  useEffect(() => {
    audioServiceRef.current = new AudioService();
    exportServiceRef.current = new ExportService();

    let attempts = 0;
    const MAX_ATTEMPTS = 25; 
    const midiCheckInterval = setInterval(() => {
      if (typeof window.MIDIWriter === 'function') {
        setMidiLibraryStatus('loaded');
        clearInterval(midiCheckInterval);
      } else {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(midiCheckInterval);
          setMidiLibraryStatus('failed');
          setError(t('app.error.midiLoadFailed'));
        }
      }
    }, 200);

    audioServiceRef.current.loadDefaultSounds()
      .then(() => {
        if (audioServiceRef.current?.isReady()) {
          setAudioReady(true);
          const loadedPatterns = loadPatternsFromStorage();
          if (loadedPatterns.length > 0) {
            setSavedPatterns(loadedPatterns.map(p => ({...p, numSteps: p.numSteps || DEFAULT_NUM_STEPS })));
            const firstPattern = loadedPatterns[0];
            setCurrentPattern({...firstPattern, numSteps: firstPattern.numSteps || DEFAULT_NUM_STEPS});
            audioServiceRef.current?.prepareSoundsForPattern(firstPattern.customSounds)
              .catch(e => setError(t('app.error.failedToPrepareSounds', { message: (e as Error).message })));
          } else {
            const initialPattern = createNewPattern(t('app.message.newPatternCreated')); // Use translated name
            setSavedPatterns([initialPattern]);
            setCurrentPattern(initialPattern);
          }
        } else {
          setError(t('app.status.loadingSounds')); // More generic error if not fully ready
        }
      })
      .catch(loadError => {
        setError(t('app.error.failedToPrepareSounds', { message: (loadError as Error).message }));
      });
      
      return () => {
        clearInterval(midiCheckInterval);
      };
  }, [t]); // Add t to dependencies


  useEffect(() => {
    // Avoid saving initial empty/default pattern immediately on load if no patterns existed
    if (savedPatterns.length > 0 && 
        (savedPatterns.length > 1 || JSON.stringify(savedPatterns[0]) !== JSON.stringify(createNewPattern(t('app.message.newPatternCreated'), currentPattern.numSteps)))) {
       savePatternsToStorage(savedPatterns);
    }
  }, [savedPatterns, currentPattern, t]);

  useEffect(() => {
    let timerId: number | undefined;
    if (isPlaying && currentPattern.bpm > 0 && audioReady && currentPattern.numSteps > 0) {
      const intervalTime = (60 * 1000) / currentPattern.bpm / (currentPattern.numSteps / 4); 
      timerId = window.setInterval(() => {
        setCurrentStep(prevStep => {
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
      if (!isPlaying) setCurrentStep(-1); 
    }
    return () => clearInterval(timerId);
  }, [isPlaying, currentPattern.bpm, currentPattern.numSteps, currentPattern.steps, audioReady]);

  const handleStepToggle = useCallback((instrument: DrumMachineSound, stepIndex: number) => {
    setCurrentPattern(prevPattern => {
      const newSteps = { ...prevPattern.steps };
      const instrumentSteps = [...newSteps[instrument]];
      instrumentSteps[stepIndex] = !instrumentSteps[stepIndex];
      newSteps[instrument] = instrumentSteps;
      
      if (instrumentSteps[stepIndex] && !isPlaying && audioReady) {
        audioServiceRef.current?.playSound(instrument);
      }
      return { ...prevPattern, steps: newSteps };
    });
  }, [isPlaying, audioReady]);

  const handleBPMChange = useCallback((newBpm: number) => {
    setCurrentPattern(prev => ({ ...prev, bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, newBpm)) }));
  }, []);

  const handlePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);
  const handleStop = useCallback(() => { setIsPlaying(false); setCurrentStep(-1); }, []);

  const handleChangePatternLength = useCallback((newLength: number) => {
    if (!SUPPORTED_STEP_COUNTS.includes(newLength)) return;
    setCurrentPattern(prevPattern => {
        const updatedSteps: Record<DrumMachineSound, StepState[]> = {} as Record<DrumMachineSound, StepState[]>;
        INSTRUMENTS_ORDER.forEach(instrument => {
            const currentInstrumentSteps = prevPattern.steps[instrument] || [];
            if (newLength > currentInstrumentSteps.length) {
                updatedSteps[instrument] = [...currentInstrumentSteps, ...Array(newLength - currentInstrumentSteps.length).fill(false)];
            } else {
                updatedSteps[instrument] = currentInstrumentSteps.slice(0, newLength);
            }
        });
        setIsPlaying(false);
        setCurrentStep(-1);
        setAppMessage(t('app.message.patternLengthChanged', { numSteps: newLength }));
        return { ...prevPattern, numSteps: newLength, steps: updatedSteps };
    });
  }, [t]);

  const handleClearPattern = useCallback(async () => {
    setCurrentPattern(prev => {
      const clearedSteps: Record<DrumMachineSound, StepState[]> = {} as Record<DrumMachineSound, StepState[]>;
      const clearedCustomSounds: Partial<Record<DrumMachineSound, CustomSoundData | null>> = {};
      INSTRUMENTS_ORDER.forEach(instrument => {
        clearedSteps[instrument] = Array(prev.numSteps).fill(false);
        clearedCustomSounds[instrument] = null;
      });
      if (audioServiceRef.current) {
        audioServiceRef.current.prepareSoundsForPattern({})
          .catch(e => setError(t('app.error.failedToPrepareSounds', {message: (e as Error).message})));
      }
      return { ...prev, steps: clearedSteps, customSounds: clearedCustomSounds };
    });
    setAppMessage(t('app.message.patternCleared'));
  }, [t]);

  const handleSavePattern = useCallback(() => {
    setSavedPatterns(prev => {
      const existingIndex = prev.findIndex(p => p.id === currentPattern.id);
      if (existingIndex !== -1) {
        const updatedPatterns = [...prev];
        updatedPatterns[existingIndex] = currentPattern;
        return updatedPatterns;
      }
      return [...prev, currentPattern];
    });
    setAppMessage(t('app.message.patternSaved'));
  }, [currentPattern, t]);

  const handleLoadPattern = useCallback(async (patternId: string) => {
    const patternToLoadFromStorage = savedPatterns.find(p => p.id === patternId);
    if (patternToLoadFromStorage && audioServiceRef.current) {
      try {
        const patternToLoad = {...patternToLoadFromStorage, numSteps: patternToLoadFromStorage.numSteps || DEFAULT_NUM_STEPS };
        setAppMessage(t('app.message.patternLoading', {name: patternToLoad.name}));
        await audioServiceRef.current.prepareSoundsForPattern(patternToLoad.customSounds);
        setCurrentPattern(patternToLoad);
        setIsPlaying(false); 
        setCurrentStep(-1);
        setAppMessage(t('app.message.patternLoaded', {name: patternToLoad.name}));
      } catch (e: any) {
        setError(t('app.error.failedToLoadSoundsForPattern', {patternName: patternToLoadFromStorage.name, message: e.message}));
        const patternWithDefaultSounds = { ...patternToLoadFromStorage, numSteps: patternToLoadFromStorage.numSteps || DEFAULT_NUM_STEPS, customSounds: {} };
        await audioServiceRef.current.prepareSoundsForPattern({});
        setCurrentPattern(patternWithDefaultSounds);
      }
    }
  }, [savedPatterns, t]);
  
  const handleNewPattern = useCallback(async () => {
    const newPattern = createNewPattern(`${t('app.message.newPatternCreated')} ${savedPatterns.length + 1}`);
    if (audioServiceRef.current) await audioServiceRef.current.prepareSoundsForPattern({});
    setCurrentPattern(newPattern);
    setSavedPatterns(prev => [...prev, newPattern]); 
    setIsPlaying(false);
    setCurrentStep(-1);
    setAppMessage(t('app.message.newPatternCreated'));
  }, [savedPatterns.length, t]);

  const handleDeletePattern = useCallback((patternId: string) => {
    if (savedPatterns.length <= 1) {
      setAppMessage(t('app.message.cannotDeleteLastPattern'));
      return;
    }
    const newSavedPatterns = savedPatterns.filter(p => p.id !== patternId);
    setSavedPatterns(newSavedPatterns);

    if (currentPattern.id === patternId) {
      const nextPatternData = newSavedPatterns[0] || createNewPattern(t('app.message.newPatternCreated'));
      const nextPatternToLoad = {...nextPatternData, numSteps: nextPatternData.numSteps || DEFAULT_NUM_STEPS};
      audioServiceRef.current?.prepareSoundsForPattern(nextPatternToLoad.customSounds)
        .then(() => {
            setCurrentPattern(nextPatternToLoad);
            setAppMessage(t('app.message.patternDeletedAndLoaded', {name: nextPatternToLoad.name}));
        })
        .catch(e => setError(t('app.error.failedToPrepareSounds', {message: (e as Error).message})));
    } else {
      setAppMessage(t('app.message.patternDeleted'));
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  }, [savedPatterns, currentPattern.id, t]);

  const handlePatternNameChange = useCallback((newName: string) => {
    setCurrentPattern(prev => ({ ...prev, name: newName }));
  }, []);

  const suggestPatternName = useCallback(async () => {
    setIsLoadingAISuggestion(true); setError(null);
    try {
      const { steps, bpm, numSteps } = currentPattern;
      const suggestedName = await fetchSuggestedPatternName({ steps, bpm, numSteps }, language); // Pass language
      if (suggestedName) {
        setCurrentPattern(prev => ({ ...prev, name: suggestedName }));
        setAppMessage(t('app.message.aiNameSuggested'));
      } else {
        setError(t('app.error.nameSuggestionFailed'));
      }
    } catch (e: any) {
      setError(t('app.error.nameSuggestionApi', {message:e.message}));
    } finally {
      setIsLoadingAISuggestion(false);
    }
  }, [currentPattern, t, language]);

  const handleCustomSoundUpload = useCallback(async (instrument: DrumMachineSound, file: File) => {
    setError(null); setAppMessage(null);
    if (!file) return;
    const instrumentName = getInstrumentName(instrument);

    if (file.size > MAX_CUSTOM_SOUND_SIZE_BYTES) {
      setError(t('app.error.fileTooLarge', {instrumentName, maxSizeKB: MAX_CUSTOM_SOUND_SIZE_BYTES / 1024}));
      return;
    }
    if (!file.type.startsWith('audio/')) {
        setError(t('app.error.invalidFileType', {instrumentName}));
        return;
    }

    try {
      setAppMessage(t('app.message.loadingCustomSound', {fileName: file.name, instrumentName}));
      const arrayBuffer = await readFileAsArrayBuffer(file); 
      const dataURI = await readFileAsDataURL(file); 

      audioServiceRef.current?.loadCustomSoundFromArrayBuffer(instrument, arrayBuffer.slice(0));
      
      setCurrentPattern(prev => ({
        ...prev, customSounds: { ...prev.customSounds, [instrument]: { dataURI, fileName: file.name } }
      }));
      setAppMessage(t('app.message.customSoundLoaded', {fileName: file.name, instrumentName}));
    } catch (e: any) {
      setError(t('app.error.couldNotLoadSound', {instrumentName, message: e.message}));
      audioServiceRef.current?.revertToDefaultSound(instrument);
      setCurrentPattern(prev => ({ ...prev, customSounds: { ...prev.customSounds, [instrument]: null } }));
    }
  }, [t, getInstrumentName]);

  const handleClearCustomSound = useCallback((instrument: DrumMachineSound) => {
    audioServiceRef.current?.revertToDefaultSound(instrument);
    setCurrentPattern(prev => ({ ...prev, customSounds: { ...prev.customSounds, [instrument]: null } }));
    setAppMessage(t('app.message.customSoundCleared', {instrumentName: getInstrumentName(instrument)}));
  }, [t, getInstrumentName]);

  const handleExportMidi = useCallback(async () => {
    if (midiLibraryStatus !== 'loaded') {
      setError(t('app.error.midiNotAvailable')); setAppMessage(null); return;
    }
    if (!currentPattern || !exportServiceRef.current || !audioReady) {
      setError(t('app.error.exportNotReady', {format: "MIDI"})); return;
    }
    setIsExportingMidi(true); setAppMessage(t('app.message.midiExporting')); setError(null);
    try {
      exportServiceRef.current.exportPatternToMidi(currentPattern);
      setAppMessage(t('app.message.midiExported', {name: currentPattern.name}));
    } catch (e: any) {
      setError(t('app.error.generic', {message: e.message})); setAppMessage(null);
    } finally {
      setIsExportingMidi(false);
    }
  }, [currentPattern, audioReady, midiLibraryStatus, t]);

  const handleExportWav = useCallback(async () => {
    if (!currentPattern || !exportServiceRef.current || !audioServiceRef.current || !audioReady) {
      setError(t('app.error.exportNotReady', {format: "WAV"})); return;
    }
    setIsExportingWav(true); setAppMessage(t('app.message.wavExporting')); setError(null);
    try {
      await exportServiceRef.current.exportPatternToWav(currentPattern, audioServiceRef.current);
      setAppMessage(t('app.message.wavExported', {name: currentPattern.name}));
    } catch (e: any) {
      setError(t('app.error.generic', {message: e.message})); setAppMessage(null);
    } finally {
      setIsExportingWav(false);
    }
  }, [currentPattern, audioReady, t]);

  const handleSelectedAIGenreChange = useCallback((newGenreKey: string) => {
    setSelectedAIGenreKey(newGenreKey);
  }, []);

  const handleGenerateAIPattern = useCallback(async () => {
    setIsGeneratingAIPattern(true); setError(null);
    const genreForAPI = AI_GENRE_API_MAP[selectedAIGenreKey] || selectedAIGenreKey; // Fallback to key if not in map
    const genreForDisplay = t(`genre.${selectedAIGenreKey}`);
    setAppMessage(t('app.message.aiPatternGenerating', {genre: genreForDisplay}));
    
    try {
      const aiResult = await fetchAIDrumPattern(genreForAPI, currentPattern.bpm, currentPattern.numSteps);
      const newSteps: Record<DrumMachineSound, StepState[]> = {} as Record<DrumMachineSound, StepState[]>;
      const newCustomSounds: Partial<Record<DrumMachineSound, CustomSoundData | null>> = {};

      INSTRUMENTS_ORDER.forEach(instrument => {
        const aiInstrumentSteps = aiResult.generatedSteps[instrument] || [];
        if (aiInstrumentSteps.length > currentPattern.numSteps) {
            newSteps[instrument] = aiInstrumentSteps.slice(0, currentPattern.numSteps);
        } else if (aiInstrumentSteps.length < currentPattern.numSteps) {
            newSteps[instrument] = [...aiInstrumentSteps, ...Array(currentPattern.numSteps - aiInstrumentSteps.length).fill(false)];
        } else { newSteps[instrument] = aiInstrumentSteps; }
        newCustomSounds[instrument] = null;
      });
      
      const aiPatternName = `${genreForDisplay} Beat @ ${aiResult.generatedBpm} BPM (${currentPattern.numSteps} steps AI)`;
      setCurrentPattern(prev => ({
        ...prev, name: aiPatternName, bpm: aiResult.generatedBpm, steps: newSteps, customSounds: newCustomSounds,
      }));
      audioServiceRef.current?.prepareSoundsForPattern({});
      setAppMessage(t('app.message.aiPatternGenerated', {genre: genreForDisplay, bpm: aiResult.generatedBpm, numSteps: currentPattern.numSteps}));
      setIsPlaying(false); setCurrentStep(-1);
    } catch (e: any) {
      setError(t('app.error.aiPatternApi', {message:e.message})); setAppMessage(null);
    } finally {
      setIsGeneratingAIPattern(false);
    }
  }, [selectedAIGenreKey, currentPattern.bpm, currentPattern.numSteps, t]);

  useEffect(() => {
    if (appMessage) { 
      const timer = setTimeout(() => setAppMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [appMessage]);

  const generalControlsDisabled = !audioReady || isExportingMidi || isExportingWav || isGeneratingAIPattern || isLoadingAISuggestion;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8 selection:bg-sky-500 selection:text-white">
      <header className="w-full max-w-screen-2xl mb-6 md:mb-8 text-center">
        <div className="flex justify-between items-center mb-2">
            <div></div> {/* Spacer */}
            <h1 className="text-4xl md:text-5xl font-bold text-sky-400">{t('app.title')}</h1>
            <LanguageSwitcher />
        </div>
        <p className="text-slate-400 mt-1 text-lg">{t('app.subtitle')}</p>
      </header>

      {appMessage && (
        <div className="w-full max-w-3xl p-3 mb-4 text-sm text-sky-300 bg-sky-800 border border-sky-700 rounded-md" role="status">
          {appMessage}
        </div>
      )}
      {error && (
        <div className="w-full max-w-3xl p-3 mb-4 text-sm text-red-400 bg-red-900 border border-red-700 rounded-md" role="alert">
          {error} <button onClick={() => setError(null)} className="ml-2 px-2 py-0.5 bg-red-700 hover:bg-red-600 rounded text-xs">{t('common.dismiss')}</button>
        </div>
      )}
      {!audioReady && !error && midiLibraryStatus !== 'failed' && ( 
         <div className="w-full max-w-3xl p-3 mb-4 text-sm text-yellow-400 bg-yellow-900 border border-yellow-700 rounded-md" role="status">
          {t('app.status.loadingSounds')}
        </div>
      )}
       {midiLibraryStatus === 'loading' && ( 
         <div className="w-full max-w-3xl p-3 mb-4 text-sm text-yellow-400 bg-yellow-900 border border-yellow-700 rounded-md" role="status">
          {t('app.status.loadingMidi')}
        </div>
      )}

      <div className="w-full max-w-screen-2xl bg-slate-800 shadow-2xl rounded-lg p-4 md:p-6">
        <Controls
          bpm={currentPattern.bpm}
          numSteps={currentPattern.numSteps}
          onBPMChange={handleBPMChange}
          onNumStepsChange={handleChangePatternLength}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onClearPattern={handleClearPattern}
          onNewPattern={handleNewPattern}
          disabled={generalControlsDisabled}
        />
        <Sequencer
          pattern={currentPattern}
          onStepToggle={handleStepToggle}
          currentSequencerStep={currentStep}
          isPlaying={isPlaying}
          disabled={generalControlsDisabled}
          onCustomSoundUpload={handleCustomSoundUpload}
          onClearCustomSound={handleClearCustomSound}
        />
        <PatternManager
          currentPatternName={currentPattern.name}
          onPatternNameChange={handlePatternNameChange}
          savedPatterns={savedPatterns}
          onSaveCurrentPattern={handleSavePattern}
          onLoadPattern={handleLoadPattern}
          onDeletePattern={handleDeletePattern}
          onSuggestName={suggestPatternName}
          isSuggestingName={isLoadingAISuggestion}
          currentPatternId={currentPattern.id}
          disabled={generalControlsDisabled} 
          onExportMidi={handleExportMidi}
          onExportWav={handleExportWav}
          isExportingMidi={isExportingMidi}
          isExportingWav={isExportingWav}
          midiLibraryStatus={midiLibraryStatus}
          aiAvailableGenreKeys={AI_PATTERNING_GENRE_KEYS}
          selectedAIGenreKey={selectedAIGenreKey}
          onSelectedAIGenreKeyChange={handleSelectedAIGenreChange}
          onGenerateAIPattern={handleGenerateAIPattern}
          isGeneratingAIPattern={isGeneratingAIPattern}
        />
      </div>
      <footer className="mt-8 text-center text-slate-500">
        <p>{t('app.footer.poweredBy')}</p>
        <p className="text-xs mt-1">{t('app.footer.warning')}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
