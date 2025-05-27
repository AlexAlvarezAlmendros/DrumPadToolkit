
export enum DrumMachineSound {
  KICK = 'Kick',
  SNARE = 'Snare',
  HH_CLOSED = 'HH Closed',
  HH_OPEN = 'HH Open',
  CLAP = 'Clap',
  TOM = 'Tom',
}

export type StepState = boolean;

export interface CustomSoundData {
  dataURI: string; // Base64 encoded audio data
  fileName: string;
}

export type LanguageCode = 'en' | 'es' | 'ca';

export interface Pattern {
  id: string;
  name: string;
  bpm: number;
  steps: Record<DrumMachineSound, StepState[]>;
  numSteps: number;
  customSounds?: Partial<Record<DrumMachineSound, CustomSoundData | null>>;
}