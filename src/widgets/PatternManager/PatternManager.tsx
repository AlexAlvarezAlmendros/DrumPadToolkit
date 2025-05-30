
import React from 'react';
import { Pattern } from '../../shared/model/types';
import { SaveIcon, TrashIcon, SparklesIcon, DownloadIcon, MidiFileIcon, WaveFileIcon } from '../../shared/ui/Icon';
import { useTranslations } from '../../shared/lib/hooks/useTranslations';

type MidiLibraryStatus = 'loading' | 'loaded' | 'failed';

interface PatternManagerProps {
  currentPatternName: string;
  currentPatternId: string;
  onPatternNameChange: (newName: string) => void;
  savedPatterns: Pattern[];
  onSaveCurrentPattern: () => void;
  onLoadPattern: (patternId: string) => void;
  onDeletePattern: (patternId: string) => void;
  onSuggestName: () => void;
  isSuggestingName: boolean;
  disabled?: boolean; 
  onExportMidi: () => void;
  onExportWav: () => void;
  isExportingMidi: boolean;
  isExportingWav: boolean;
  midiLibraryStatus: MidiLibraryStatus;
  aiAvailableGenreKeys: string[]; // Now expects keys
  selectedAIGenreKey: string;    // Now expects key
  onSelectedAIGenreKeyChange: (genreKey: string) => void;
  onGenerateAIPattern: () => void;
  isGeneratingAIPattern: boolean;
}

const PatternManager: React.FC<PatternManagerProps> = ({
  currentPatternName,
  currentPatternId,
  onPatternNameChange,
  savedPatterns,
  onSaveCurrentPattern,
  onLoadPattern,
  onDeletePattern,
  onSuggestName,
  isSuggestingName,
  disabled = false,
  onExportMidi,
  onExportWav,
  isExportingMidi,
  isExportingWav,
  midiLibraryStatus,
  aiAvailableGenreKeys,
  selectedAIGenreKey,
  onSelectedAIGenreKeyChange,
  onGenerateAIPattern,
  isGeneratingAIPattern,
}) => {
  const { t } = useTranslations();
  const commonButtonClasses = "p-2 rounded-md transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed";
  
  const mainControlsDisabled = disabled || isSuggestingName || isGeneratingAIPattern;
  const midiExportDisabled = mainControlsDisabled || isExportingMidi || midiLibraryStatus !== 'loaded';
  const wavExportDisabled = mainControlsDisabled || isExportingWav;
  const aiGeneratorDisabled = mainControlsDisabled || isGeneratingAIPattern;

  return (
    <div className={`mt-6 bg-slate-700 p-4 rounded-lg shadow-md ${mainControlsDisabled && midiLibraryStatus !== 'failed' ? 'opacity-70' : ''}`}>
      <h2 className="text-xl font-semibold text-sky-400 mb-4">{t('patternManager.title')}</h2>
      
      <div className="mb-4">
        <label htmlFor="patternName" className="block text-sm font-medium text-slate-300 mb-1">
          {t('patternManager.currentPatternLabel')}
        </label>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            id="patternName"
            value={currentPatternName}
            onChange={(e) => onPatternNameChange(e.target.value)}
            className="flex-grow p-2 bg-slate-800 text-slate-100 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder={t('patternManager.patternNamePlaceholder')}
            disabled={mainControlsDisabled}
          />
          <div className="flex space-x-2">
            <button
              onClick={onSuggestName}
              disabled={mainControlsDisabled} 
              className={`${commonButtonClasses} bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none flex items-center justify-center space-x-1`}
              title={t('patternManager.suggestNameTitle')}
            >
              <SparklesIcon className="w-5 h-5"/> 
              <span className="hidden sm:inline">{isSuggestingName ? t('patternManager.suggestingName') : t('patternManager.suggestName')}</span>
            </button>
            <button
              onClick={onSaveCurrentPattern}
              className={`${commonButtonClasses} bg-green-600 hover:bg-green-700 flex-1 sm:flex-none flex items-center justify-center space-x-1`}
              title={t('patternManager.savePatternTitle')}
              disabled={mainControlsDisabled}
            >
              <SaveIcon className="w-5 h-5"/>
              <span className="hidden sm:inline">{t('patternManager.savePattern')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-slate-600 pt-4">
        <h3 className="text-lg font-semibold text-sky-300 mb-3">{t('patternManager.aiGeneratorTitle')}</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
          <label htmlFor="aiGenreSelect" className="sr-only">{t('patternManager.selectGenreLabel')}</label>
          <select
            id="aiGenreSelect"
            value={selectedAIGenreKey}
            onChange={(e) => onSelectedAIGenreKeyChange(e.target.value)}
            disabled={aiGeneratorDisabled}
            className="flex-grow p-2 bg-slate-800 text-slate-100 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {aiAvailableGenreKeys.map(genreKey => (
              <option key={genreKey} value={genreKey}>{t(`genre.${genreKey}`)}</option>
            ))}
          </select>
          <button
            onClick={onGenerateAIPattern}
            disabled={aiGeneratorDisabled}
            className={`${commonButtonClasses} bg-sky-600 hover:bg-sky-700 w-full sm:w-auto flex items-center justify-center space-x-1`}
            title={t('patternManager.generateWithAITitle')}
          >
            <SparklesIcon className="w-5 h-5" /> 
            <span>{isGeneratingAIPattern ? t('patternManager.generatingWithAI') : t('patternManager.generateWithAI')}</span>
          </button>
        </div>
      </div>

      <div className="mb-6 border-t border-slate-600 pt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={onExportMidi}
          disabled={midiExportDisabled}
          className={`${commonButtonClasses} bg-teal-600 hover:bg-teal-700 flex-1 flex items-center justify-center space-x-1`}
          title={midiLibraryStatus === 'failed' ? t('patternManager.midiFailedLoadTitle') : midiLibraryStatus === 'loading' ? t('patternManager.midiInitializingTitle') : t('patternManager.exportMIDITitle')}
        >
          <MidiFileIcon className="w-5 h-5"/>
          <span>
            {isExportingMidi 
              ? t('patternManager.exporting') 
              : midiLibraryStatus === 'failed' 
              ? t('patternManager.midiNA') 
              : midiLibraryStatus === 'loading' 
              ? t('patternManager.midiInitializing')
              : t('patternManager.exportMIDI')}
          </span>
        </button>
        <button
          onClick={onExportWav}
          disabled={wavExportDisabled}
          className={`${commonButtonClasses} bg-indigo-600 hover:bg-indigo-700 flex-1 flex items-center justify-center space-x-1`}
          title={t('patternManager.exportWAVTitle')}
        >
          <WaveFileIcon className="w-5 h-5"/>
          <span>{isExportingWav ? t('patternManager.exporting') : t('patternManager.exportWAV')}</span>
        </button>
      </div>

      {savedPatterns.length > 0 && (
        <div className="border-t border-slate-600 pt-4">
          <h3 className="text-lg font-medium text-slate-300 mb-2">{t('patternManager.savedPatternsTitle')}</h3>
          <ul className={`max-h-60 overflow-y-auto space-y-2 pr-1 ${mainControlsDisabled ? 'pointer-events-none opacity-60' : ''}`}>
            {savedPatterns.map(pattern => (
              <li
                key={pattern.id}
                className={`flex justify-between items-center p-3 rounded-md transition-colors ${pattern.id === currentPatternId ? 'bg-sky-700 ring-2 ring-sky-500' : 'bg-slate-600 hover:bg-slate-500'} ${mainControlsDisabled && pattern.id !== currentPatternId ? 'hover:bg-slate-600' : ''}`}
              >
                <span className="font-medium truncate" title={pattern.name}>{pattern.name}</span>
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => onLoadPattern(pattern.id)}
                    disabled={pattern.id === currentPatternId || mainControlsDisabled}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('patternManager.loadPattern')}
                  >
                    <DownloadIcon className="w-4 h-4"/>
                  </button>
                  <button
                    onClick={() => onDeletePattern(pattern.id)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('patternManager.deletePattern')}
                    disabled={mainControlsDisabled || savedPatterns.length <= 1}
                  >
                    <TrashIcon className="w-4 h-4"/>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatternManager;
