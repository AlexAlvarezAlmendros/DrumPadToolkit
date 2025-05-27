import { DrumMachineSound } from '../types';
import { SOUND_FILES, INSTRUMENTS_ORDER } from '../constants';

export class AudioService {
  private audioContext: AudioContext | null = null;
  private defaultAudioBuffers: Map<DrumMachineSound, AudioBuffer> = new Map();
  private currentAudioBuffers: Map<DrumMachineSound, AudioBuffer> = new Map();
  private isLoadingDefaults: boolean = false;
  private defaultsLoadedSuccessfully: boolean = false;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
    }
  }

  private async loadSoundFile(path: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText} (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Error loading sound from ${path}:`, error);
      return null;
    }
  }

  public async loadDefaultSounds(): Promise<void> {
    if (!this.audioContext) {
      console.warn("AudioContext not available. Default sounds cannot be loaded.");
      return Promise.reject(new Error("AudioContext not available."));
    }
    if (this.isLoadingDefaults || this.defaultsLoadedSuccessfully) {
      return Promise.resolve();
    }

    this.isLoadingDefaults = true;
    this.defaultsLoadedSuccessfully = false;
    
    const loadPromises = INSTRUMENTS_ORDER.map(async (instrument) => {
      const path = SOUND_FILES[instrument];
      const buffer = await this.loadSoundFile(path);
      if (buffer) {
        this.defaultAudioBuffers.set(instrument, buffer);
        // Initially, current buffers are the defaults
        this.currentAudioBuffers.set(instrument, buffer);
      }
    });

    try {
      await Promise.all(loadPromises);
      if (this.defaultAudioBuffers.size === INSTRUMENTS_ORDER.length) {
        this.defaultsLoadedSuccessfully = true;
        console.log("All default sounds loaded successfully.");
      } else {
        console.warn("Not all default sounds were loaded successfully.");
      }
    } catch (error) {
      console.error("Error during the process of loading default sounds:", error);
    } finally {
      this.isLoadingDefaults = false;
    }
  }
  
  public async loadCustomSoundFromArrayBuffer(instrument: DrumMachineSound, arrayBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      console.warn("AudioContext not available. Custom sound cannot be loaded.");
      return Promise.reject(new Error("AudioContext not available."));
    }
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0)); // Use slice(0) to copy buffer
      this.currentAudioBuffers.set(instrument, audioBuffer);
      console.log(`Custom sound loaded for ${instrument}`);
    } catch (error) {
      console.error(`Error decoding custom sound for ${instrument}:`, error);
      this.revertToDefaultSound(instrument); // Fallback to default if decoding fails
      throw error; // Re-throw to notify the caller
    }
  }

  public revertToDefaultSound(instrument: DrumMachineSound): void {
    const defaultBuffer = this.defaultAudioBuffers.get(instrument);
    if (defaultBuffer) {
      this.currentAudioBuffers.set(instrument, defaultBuffer);
      console.log(`Reverted ${instrument} to default sound.`);
    } else {
      console.warn(`No default sound buffer found for ${instrument} to revert to.`);
      this.currentAudioBuffers.delete(instrument);
    }
  }

  public async prepareSoundsForPattern(customSounds?: Partial<Record<DrumMachineSound, { dataURI: string } | null>>): Promise<void> {
    if (!this.defaultsLoadedSuccessfully) {
      console.warn("Default sounds not loaded. Cannot prepare pattern sounds.");
      await this.loadDefaultSounds(); 
      if(!this.defaultsLoadedSuccessfully) return Promise.reject(new Error("Defaults failed to load after attempt in prepareSoundsForPattern."));
    }

    for (const instrument of INSTRUMENTS_ORDER) {
      const customSoundData = customSounds?.[instrument];
      if (customSoundData && customSoundData.dataURI) {
        try {
          const fetchRes = await fetch(customSoundData.dataURI);
          const arrayBuffer = await fetchRes.arrayBuffer();
          await this.loadCustomSoundFromArrayBuffer(instrument, arrayBuffer);
        } catch (error) {
          console.error(`Failed to load custom sound for ${instrument} from Data URI. Reverting to default.`, error);
          this.revertToDefaultSound(instrument);
        }
      } else {
        this.revertToDefaultSound(instrument);
      }
    }
  }

  public playSound(sound: DrumMachineSound): void {
    if (!this.audioContext || !this.defaultsLoadedSuccessfully) {
      return;
    }
    const audioBuffer = this.currentAudioBuffers.get(sound);
    if (audioBuffer) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      } catch (e) {
        console.error(`Error playing sound ${sound}:`, e);
      }
    }
  }

  public isReady(): boolean {
    return !!this.audioContext && this.defaultsLoadedSuccessfully && !this.isLoadingDefaults;
  }
  
  public getContextCurrentTime(): number | undefined {
      return this.audioContext?.currentTime;
  }

  public getAudioBuffer(instrument: DrumMachineSound): AudioBuffer | null {
    return this.currentAudioBuffers.get(instrument) || null;
  }

  public getSampleRate(): number {
    return this.audioContext?.sampleRate || 44100; // Default to 44100 if context not ready
  }
}