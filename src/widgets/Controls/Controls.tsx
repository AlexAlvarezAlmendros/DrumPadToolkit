
import React from 'react';
import { PlayIcon, StopIcon, TrashIcon, PlusIcon, PauseIcon, PlusCircleIcon, MinusCircleIcon } from '../../shared/ui/Icon';
import { MIN_BPM, MAX_BPM, SUPPORTED_STEP_COUNTS, DEFAULT_NUM_STEPS } from '../../shared/config/constants';
import { useTranslations } from '../../shared/lib/hooks/useTranslations';

interface ControlsProps {
  bpm: number;
  numSteps: number;
  onBPMChange: (newBpm: number) => void;
  onNumStepsChange: (newNumSteps: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onClearPattern: () => void;
  onNewPattern: () => void;
  disabled?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  bpm,
  numSteps,
  onBPMChange,
  onNumStepsChange,
  isPlaying,
  onPlayPause,
  onStop,
  onClearPattern,
  onNewPattern,
  disabled = false,
}) => {
  const { t } = useTranslations();

  const handleBpmInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value, 10);
    if (!isNaN(newBpm)) {
      onBPMChange(newBpm);
    }
  };

  const handleToggleNumSteps = () => {
    if (numSteps === SUPPORTED_STEP_COUNTS[0] && SUPPORTED_STEP_COUNTS.length > 1) {
      onNumStepsChange(SUPPORTED_STEP_COUNTS[1]);
    } else if (numSteps === SUPPORTED_STEP_COUNTS[1]) {
      onNumStepsChange(SUPPORTED_STEP_COUNTS[0]);
    }
  };

  const commonButtonClasses = "p-2 rounded-md transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed";
  const canChangeSteps = SUPPORTED_STEP_COUNTS.length > 1;
  const nextStepCount = numSteps === SUPPORTED_STEP_COUNTS[0] ? SUPPORTED_STEP_COUNTS[1] : SUPPORTED_STEP_COUNTS[0];

  return (
    <div className={`bg-slate-700 p-4 rounded-lg shadow-md mb-6 ${disabled ? 'opacity-70' : ''}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:items-center md:justify-start gap-4">
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onPlayPause}
            className={`${commonButtonClasses} ${isPlaying ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
            aria-label={isPlaying ? t('controls.pause') : t('controls.play')}
            disabled={disabled}
            title={isPlaying ? t('controls.pause') : t('controls.play')}
          >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={onStop}
            className={`${commonButtonClasses} bg-red-600 hover:bg-red-700`}
            aria-label={t('controls.stop')}
            title={t('controls.stop')}
            disabled={disabled || !isPlaying}
          >
            <StopIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="bpm" className="text-sm font-medium text-slate-300">{t('controls.bpmLabel')}</label>
          <input
            type="number"
            id="bpm"
            value={bpm}
            onChange={handleBpmInputChange}
            min={MIN_BPM}
            max={MAX_BPM}
            className="w-20 p-2 bg-slate-800 text-slate-100 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-center disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={disabled}
            aria-label={t('controls.bpmAriaLabel', {bpm})}
          />
        </div>
        
        <div className="flex items-center space-x-2 col-span-2 sm:col-span-1 md:col-auto">
          <button
            onClick={onNewPattern}
            className={`${commonButtonClasses} bg-blue-600 hover:bg-blue-700 flex items-center space-x-1`}
            title={t('controls.newPatternTitle')}
            disabled={disabled}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{t('controls.newPattern')}</span>
          </button>
          <button
            onClick={onClearPattern}
            className={`${commonButtonClasses} bg-orange-600 hover:bg-orange-700 flex items-center space-x-1`}
            title={t('controls.clearPatternTitle')}
            disabled={disabled}
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden sm:inline">{t('controls.clearPattern')}</span>
          </button>
        </div>

        {canChangeSteps && (
          <div className="flex items-center space-x-2 col-span-2 sm:col-span-3 md:col-auto md:ml-auto">
             <span className="text-sm font-medium text-slate-300">{t('controls.stepsLabel', { numSteps })}</span>
            <button
              onClick={handleToggleNumSteps}
              className={`${commonButtonClasses} ${numSteps === DEFAULT_NUM_STEPS ? 'bg-sky-600 hover:bg-sky-700' : 'bg-indigo-600 hover:bg-indigo-700'} flex items-center space-x-1.5`}
              title={numSteps === DEFAULT_NUM_STEPS ? t('controls.expandStepsTitle', { count: nextStepCount }) : t('controls.shrinkStepsTitle', { count: nextStepCount})}
              disabled={disabled}
              aria-live="polite"
              aria-label={numSteps === DEFAULT_NUM_STEPS ? t('controls.expandStepsAriaLabel', { count: nextStepCount }) : t('controls.shrinkStepsAriaLabel', { count: nextStepCount, numSteps })}
            >
              {numSteps === DEFAULT_NUM_STEPS ? <PlusCircleIcon className="w-5 h-5"/> : <MinusCircleIcon className="w-5 h-5"/>}
              <span className="hidden xl:inline">{t('controls.stepsCount', { count: nextStepCount })}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
