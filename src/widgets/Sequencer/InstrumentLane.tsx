
import React, { useRef } from 'react';
import { DrumMachineSound, StepState, CustomSoundData } from '../../entities/Pattern/model/types';
import { StepButton } from '../../shared/ui/StepButton';
import { UploadIcon, XCircleIcon, KickDrumIcon, SnareDrumIcon, HiHatClosedDrumIcon, HiHatOpenDrumIcon, ClapSoundIcon, TomDrumIcon } from '../../shared/ui/Icon'; // Placeholder SVG icon components
import { useTranslations } from '../../shared/lib/hooks/useTranslations';

interface InstrumentLaneProps {
  instrument: DrumMachineSound;
  steps: StepState[];
  customSoundData: CustomSoundData | null;
  onStepToggle: (stepIndex: number) => void;
  numSteps: number;
  currentSequencerStep: number;
  isPlaying: boolean;
  disabled?: boolean;
  onCustomSoundUpload: (file: File) => void;
  onClearCustomSound: () => void;
}

const InstrumentLane: React.FC<InstrumentLaneProps> = ({
  instrument,
  steps,
  customSoundData,
  onStepToggle,
  numSteps,
  currentSequencerStep,
  isPlaying,
  disabled = false,
  onCustomSoundUpload,
  onClearCustomSound,
}) => {
  const { t } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map DrumMachineSound to the actual SVG Icon Components (placeholders for now)
  const DefaultInstrumentIconComponents: Record<DrumMachineSound, React.FC<React.SVGProps<SVGSVGElement>>> = {
    [DrumMachineSound.KICK]: KickDrumIcon,
    [DrumMachineSound.SNARE]: SnareDrumIcon,
    [DrumMachineSound.HH_CLOSED]: HiHatClosedDrumIcon,
    [DrumMachineSound.HH_OPEN]: HiHatOpenDrumIcon,
    [DrumMachineSound.CLAP]: ClapSoundIcon,
    [DrumMachineSound.TOM]: TomDrumIcon,
  };

  const IconComponent = DefaultInstrumentIconComponents[instrument];

  const instrumentTranslationKey = `instrument.${instrument.toLowerCase().replace(/ /g, '_')}`;
  const instrumentName = t(instrumentTranslationKey);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onCustomSoundUpload(event.target.files[0]);
      event.target.value = ''; // Reset file input
    }
  };

  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <div className="w-28 md:w-36 flex flex-col items-end pr-1">
        <div className="w-8 h-8 flex items-center justify-center cursor-pointer" title={instrumentName} role="button" tabIndex={disabled ? -1 : 0} /* onClick will be added in Phase 2 */ >
          {IconComponent ? <IconComponent className="w-6 h-6 text-slate-300" /> : <span className="text-sm">{instrumentName.charAt(0)}</span>}
        </div>
        <div className="mt-0.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
            disabled={disabled}
          />
          {customSoundData ? (
            <div className="flex items-center space-x-1">
               <span 
                className="text-xs text-sky-400 truncate max-w-[70px] sm:max-w-[90px] cursor-pointer hover:underline"
                title={t('instrument.changeCustomSound', { fileName: customSoundData.fileName })}
                onClick={triggerFileInput}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => e.key === 'Enter' && triggerFileInput()}
                aria-label={t('instrument.aria.changeSound', {instrumentName})}
              >
                {customSoundData.fileName}
              </span>
              <button
                onClick={() => !disabled && onClearCustomSound()}
                className="text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed p-0.5"
                title={t('instrument.clearCustomSound', {instrumentName})}
                aria-label={t('instrument.aria.clearSound', {instrumentName})}
                disabled={disabled}
              >
                <XCircleIcon className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={triggerFileInput}
              className="text-xs text-slate-400 hover:text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              title={t('instrument.uploadCustomSound', {instrumentName})}
              aria-label={t('instrument.aria.uploadSound', {instrumentName})}
              disabled={disabled}
            >
              <UploadIcon className="w-3 h-3"/>
              <span>{t('instrument.uploadAction')}</span>
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${numSteps}, min-content)` }}>
        {steps.map((isActive, index) => (
          <StepButton
            key={index}
            isActive={isActive}
            isCurrent={isPlaying && index === currentSequencerStep}
            isBeatMarker={index % 4 === 0}
            onClick={() => onStepToggle(index)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default InstrumentLane;
