
import React from 'react';
import { Pattern, DrumMachineSound, CustomSoundData } from '../types';
import { INSTRUMENTS_ORDER } from '../constants';
import InstrumentLane from './InstrumentLane';

interface SequencerProps {
  pattern: Pattern;
  onStepToggle: (instrument: DrumMachineSound, stepIndex: number) => void;
  currentSequencerStep: number;
  isPlaying: boolean;
  disabled?: boolean;
  onCustomSoundUpload: (instrument: DrumMachineSound, file: File) => void;
  onClearCustomSound: (instrument: DrumMachineSound) => void;
}

const Sequencer: React.FC<SequencerProps> = ({
  pattern,
  onStepToggle,
  currentSequencerStep,
  isPlaying,
  disabled = false,
  onCustomSoundUpload,
  onClearCustomSound,
}) => {
  return (
    <div className={`mt-6 space-y-1 md:space-y-2 overflow-x-auto pb-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {INSTRUMENTS_ORDER.map(instrument => (
        <InstrumentLane
          key={instrument}
          instrument={instrument}
          steps={pattern.steps[instrument]}
          customSoundData={pattern.customSounds?.[instrument] || null}
          onStepToggle={(stepIndex) => onStepToggle(instrument, stepIndex)}
          numSteps={pattern.numSteps}
          currentSequencerStep={currentSequencerStep}
          isPlaying={isPlaying}
          disabled={disabled}
          onCustomSoundUpload={(file) => onCustomSoundUpload(instrument, file)}
          onClearCustomSound={() => onClearCustomSound(instrument)}
        />
      ))}
    </div>
  );
};

export default Sequencer;
