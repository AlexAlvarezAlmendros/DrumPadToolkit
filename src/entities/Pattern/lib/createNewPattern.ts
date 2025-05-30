import { Pattern, StepState, DrumMachineSound, CustomSoundData } from '../model/types';
import { DEFAULT_NUM_STEPS, DEFAULT_BPM, INSTRUMENTS_ORDER } from '../../../shared/config/constants';

export const createNewPattern = (nameSuffix: string = '', numSteps: number = DEFAULT_NUM_STEPS): Pattern => {
  const initialSteps = Object.fromEntries(
    INSTRUMENTS_ORDER.map(instrument => [instrument, Array(numSteps).fill(false) as StepState[]])
  ) as Record<DrumMachineSound, StepState[]>;

  const initialCustomSounds = Object.fromEntries(
    INSTRUMENTS_ORDER.map(instrument => [instrument, null as CustomSoundData | null])
  ) as Partial<Record<DrumMachineSound, CustomSoundData | null>>;

  return {
    id: crypto.randomUUID(),
    name: `New Pattern ${nameSuffix}`.trim(),
    bpm: DEFAULT_BPM,
    steps: initialSteps,
    numSteps: numSteps,
    customSounds: initialCustomSounds,
  };
};
