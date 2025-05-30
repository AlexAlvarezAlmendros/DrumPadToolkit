import React, { useState, useEffect, useCallback } from 'react';
import { Pattern } from '../entities/Pattern/model/types';
import { createNewPattern } from '../entities/Pattern/lib/createNewPattern';
import { LanguageCode } from '../shared/model/types';
import { DEFAULT_NUM_STEPS, AI_PATTERNING_GENRE_KEYS } from 'shared/config/constants'; // AI_GENRE_API_MAP, INSTRUMENTS_ORDER, SUPPORTED_STEP_COUNTS are used in hooks
import { Sequencer } from 'widgets/Sequencer';
import { Controls } from 'widgets/Controls';
import { PatternManager } from 'widgets/PatternManager';
// AudioService and ExportService are now managed by useCoreServices
import { usePatternSaving } from '../features/pattern-saving/lib/usePatternSaving';
import { usePlaybackControl } from '../features/playback-control/lib/usePlaybackControl';
import { useAIPatternGeneration } from '../features/ai-pattern-generation/lib/useAIPatternGeneration';
import { useStepSequencing } from '../features/step-sequencing/lib/useStepSequencing';
import { useSoundManagement } from '../features/sound-management/lib/useSoundManagement';
import { usePatternExport, UsePatternExportProps } from '../features/pattern-export/lib/usePatternExport';
import { useCoreServices } from './lib/hooks/useCoreServices';
import { LanguageProvider } from 'shared/lib/contexts';
import { useTranslations } from 'shared/lib/hooks';
// MidiLibraryStatus type is implicitly handled by useCoreServices output



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
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as LanguageCode)}
        className="bg-slate-700 text-slate-100 border border-slate-600 rounded-md p-1.5 text-sm focus:ring-sky-500 focus:border-sky-500"
      >
        {supportedLanguages.map((lang: { code: LanguageCode; name: string }) => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { t, language } = useTranslations();
  const { savedPatterns, updateAndSavePattern, setSavedPatternsDirectly } = usePatternSaving();

  const [currentPattern, setCurrentPattern] = useState<Pattern>(() => 
    savedPatterns.length > 0 ? savedPatterns[0] : createNewPattern()
  );
  const [error, setError] = useState<string | null>(null);
  const [appMessage, setAppMessage] = useState<string | null>(null);

  // Core Services (Audio, Export, MIDI)
  const { 
    audioServiceRef: coreAudioServiceRef, 
    exportServiceRef, 
    audioReady, 
    midiLibraryStatus, 
    initializationError 
  } = useCoreServices({
    t,
    onAudioServiceReady: () => {
      // This callback signals that AudioService has loaded default sounds.
      // The useEffect below will handle preparing sounds for the currentPattern once audioReady is true.
    }
  });

  useEffect(() => {
    if (initializationError) {
      setError(initializationError);
    }
  }, [initializationError]);

  // Sound Management
  const { 
    prepareSoundsForPattern, 
    handleCustomSoundUpload,
    handleClearCustomSound 
  } = useSoundManagement({
    audioServiceRef: coreAudioServiceRef, // Pass the ref from useCoreServices
    currentPattern,
    setCurrentPattern,
    setError,
    setAppMessage,
    t,
  });

  // Playback Control
  const { 
    isPlaying, 
    currentStep, 
    togglePlayPause, 
    stopPlayback, 
    changeBPM 
  } = usePlaybackControl({
    currentPattern,
    audioServiceRef: coreAudioServiceRef,
    audioReady,
    onPatternUpdate: setCurrentPattern,
  });

  // AI Pattern Generation
  const { 
    selectedAIGenreKey, 
    setSelectedAIGenreKey, 
    isGeneratingAIPattern, 
    isLoadingAISuggestion, 
    handleGenerateAIPattern, 
    handleSuggestPatternName 
  } = useAIPatternGeneration({
    currentPattern,
    language,
    onPatternGenerated: setCurrentPattern,
    onNameSuggested: (newName) => setCurrentPattern(prev => prev ? { ...prev, name: newName } : createNewPattern()),
    setAppMessage,
    setError,
  });

  // Step Sequencing
  const {
    toggleStep,
    clearPattern,
    changeNumSteps,
  } = useStepSequencing({
    currentPattern,
    setCurrentPattern,
    isPlaying,
    audioReady,
    audioServiceRef: coreAudioServiceRef,
    setAppMessage,
    t,
  });

  // Pattern Export
  const { 
    handleExportMidi, 
    handleExportWav, 
    isExportingMidi, 
    isExportingWav 
  } = usePatternExport({
    currentPattern,
    audioServiceRef: coreAudioServiceRef,
    exportServiceRef,
    midiLibraryStatus,
    setAppMessage,
    setError,
    t,
  } as UsePatternExportProps);

  // Effect to prepare sounds for the current pattern when it changes or audio becomes ready
  useEffect(() => {
    if (audioReady && currentPattern && coreAudioServiceRef.current?.isReady() && typeof prepareSoundsForPattern === 'function') {
      prepareSoundsForPattern(currentPattern.customSounds);
    }
  }, [currentPattern, audioReady, prepareSoundsForPattern, coreAudioServiceRef]);


  const handleSaveCurrentPattern = useCallback(() => {
    if (currentPattern) {
      updateAndSavePattern(currentPattern);
      setAppMessage(t('app.message.patternSaved', { name: currentPattern.name }));
    }
  }, [currentPattern, updateAndSavePattern, t, setAppMessage]);

  const handleCreateNewPattern = useCallback(() => {
    const newPattern = createNewPattern();
    setCurrentPattern(newPattern);
    // Optionally, save the new pattern immediately or prompt user
    // updateAndSavePattern(newPattern); 
    setAppMessage(t('app.message.newPatternCreated'));
  }, [setCurrentPattern, t, setAppMessage]);

  const handleLoadPattern = useCallback((patternId: string) => {
    const patternToLoad = savedPatterns.find(p => p.id === patternId);
    if (patternToLoad) {
      setCurrentPattern(patternToLoad);
      setAppMessage(t('app.message.patternLoaded', { name: patternToLoad.name }));
    } else {
      setError(t('app.error.patternNotFound'));
    }
  }, [savedPatterns, setCurrentPattern, t, setAppMessage, setError]);

  const handleDeletePattern = useCallback((patternId: string) => {
    const newPatterns = savedPatterns.filter(p => p.id !== patternId);
    setSavedPatternsDirectly(newPatterns);
    if (currentPattern && currentPattern.id === patternId) {
      // If deleting current pattern, load the first available or create new
      setCurrentPattern(newPatterns.length > 0 ? newPatterns[0] : createNewPattern());
    }
    setAppMessage(t('app.message.patternDeleted'));
  }, [savedPatterns, setSavedPatternsDirectly, currentPattern, setCurrentPattern, t, setAppMessage]);

  // Display loading or error states
  if (midiLibraryStatus === 'loading' && !audioReady) {
    return <div className="flex items-center justify-center h-screen bg-slate-800 text-slate-100">{t('app.status.initializing')}</div>;
  }
  if (midiLibraryStatus === 'failed') {
    // Error state for MIDI loading failure is handled by the global error display
  }

  return (
    <div className="container mx-auto p-4 bg-slate-800 min-h-screen text-slate-100 flex flex-col font-sans">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-sky-400">Drum Pad Toolkit</h1>
        <LanguageSwitcher />
      </header>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4 shadow-lg animate-fadeIn">
          <p><strong className="font-semibold">{t('app.error.title')}:</strong> {error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-sm underline">{t('app.error.dismiss')}</button>
        </div>
      )}
      {appMessage && (
        <div className="bg-sky-500 text-white p-3 rounded-md mb-4 shadow-lg animate-fadeIn">
          <p>{appMessage}</p>
          <button onClick={() => setAppMessage(null)} className="mt-2 text-sm underline">{t('app.message.dismiss')}</button>
        </div>
      )}

      <Controls
        bpm={currentPattern.bpm}
        numSteps={currentPattern.numSteps ?? DEFAULT_NUM_STEPS}
        onBPMChange={changeBPM}
        onNumStepsChange={changeNumSteps}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onStop={stopPlayback}
        onClearPattern={clearPattern}
        onNewPattern={handleCreateNewPattern} 
      />

      <main className="flex-grow mt-6">
        {audioReady ? (
          <Sequencer
            pattern={currentPattern}
            onStepToggle={toggleStep}
            currentSequencerStep={currentStep}
            isPlaying={isPlaying}
            onCustomSoundUpload={handleCustomSoundUpload}
            onClearCustomSound={handleClearCustomSound}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-slate-400">{t('app.status.loadingSounds')}</p>
          </div>
        )}
      </main>

      <PatternManager
        currentPatternName={currentPattern.name}
        currentPatternId={currentPattern.id}
        onPatternNameChange={(name: string) => setCurrentPattern(p => p ? ({ ...p, name }) : createNewPattern())}
        savedPatterns={savedPatterns}
        onSaveCurrentPattern={handleSaveCurrentPattern}
        onLoadPattern={handleLoadPattern}
        onDeletePattern={handleDeletePattern}
        onSuggestName={handleSuggestPatternName}
        isSuggestingName={isLoadingAISuggestion}
        onExportMidi={handleExportMidi}
        onExportWav={handleExportWav}
        isExportingMidi={isExportingMidi}
        isExportingWav={isExportingWav}
        midiLibraryStatus={midiLibraryStatus}
        aiAvailableGenreKeys={AI_PATTERNING_GENRE_KEYS}
        selectedAIGenreKey={selectedAIGenreKey}
        onSelectedAIGenreKeyChange={setSelectedAIGenreKey}
        onGenerateAIPattern={handleGenerateAIPattern}
        isGeneratingAIPattern={isGeneratingAIPattern}
      />

      <footer className="mt-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Drum Pad Toolkit. {t('app.footer.inspiredBy')}.</p>
      </footer>
    </div>
  );


};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
