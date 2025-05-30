import { DrumMachineSound } from '../../entities/Pattern/model/types';
import type { LanguageCode } from '../model/types';

export const DEFAULT_BPM = 120;
export const MIN_BPM = 40;
export const MAX_BPM = 240;

export const DEFAULT_NUM_STEPS = 16;
export const SUPPORTED_STEP_COUNTS: number[] = [16, 32];
export const MAX_STEPS = 32; // Maximum supported steps

export const MAX_CUSTOM_SOUND_SIZE_BYTES = 500 * 1024; // 500 KB limit per sound file
export const MAX_PATTERN_SIZE_BYTES_WARN = 4 * 1024 * 1024; // 4MB warn for total pattern size in localStorage

export const INSTRUMENTS_ORDER: DrumMachineSound[] = [
  DrumMachineSound.KICK,
  DrumMachineSound.SNARE,
  DrumMachineSound.HH_CLOSED,
  DrumMachineSound.HH_OPEN,
  DrumMachineSound.CLAP,
  DrumMachineSound.TOM,
];

// NOTE: SOUND_LABELS is removed. Instrument names will be translated via i18n keys like 'instrument.kick'.

// NOTE: Ensure these sound files exist in your public/sounds directory (or equivalent static asset folder)
export const SOUND_FILES: Record<DrumMachineSound, string> = {
  [DrumMachineSound.KICK]: '/sounds/kick.wav',
  [DrumMachineSound.SNARE]: '/sounds/snare.wav',
  [DrumMachineSound.HH_CLOSED]: '/sounds/hh_closed.wav',
  [DrumMachineSound.HH_OPEN]: '/sounds/hh_open.wav',
  [DrumMachineSound.CLAP]: '/sounds/clap.wav',
  [DrumMachineSound.TOM]: '/sounds/tom.wav',
};

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

// For MIDI Export
export const MIDI_TICKS_PER_QUARTER_NOTE = 128; // Standard for midi-writer-js

export const GENERAL_MIDI_DRUM_MAP: Record<DrumMachineSound, number> = {
  [DrumMachineSound.KICK]: 36,
  [DrumMachineSound.SNARE]: 38,
  [DrumMachineSound.HH_CLOSED]: 42,
  [DrumMachineSound.HH_OPEN]: 46,
  [DrumMachineSound.CLAP]: 39,
  [DrumMachineSound.TOM]: 45,
};

// For AI Pattern Generation
// Keys for i18n. The actual display string will come from t(`genre.${key}`)
export const AI_PATTERNING_GENRE_KEYS: string[] = [
  "hip_hop",
  "house",
  "rock",
  "techno",
  "funk",
  "trap",
  "lo_fi",
  "pop",
  "reggaeton",
  "drum_and_bass",
  "ambient",
  "jazz_fusion"
];

// Map genre keys to English names for API calls to Gemini
export const AI_GENRE_API_MAP: Record<string, string> = {
  "hip_hop": "Hip Hop",
  "house": "House",
  "rock": "Rock",
  "techno": "Techno",
  "funk": "Funk",
  "trap": "Trap",
  "lo_fi": "Lo-Fi",
  "pop": "Pop",
  "reggaeton": "Reggaeton",
  "drum_and_bass": "Drum and Bass",
  "ambient": "Ambient",
  "jazz_fusion": "Jazz Fusion"
};


// For Internationalization (i18n)
export const SUPPORTED_LANGUAGES: { code: LanguageCode, name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ca', name: 'Català' },
];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'drumAppLanguage';
