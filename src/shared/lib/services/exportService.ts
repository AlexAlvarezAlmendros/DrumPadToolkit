
import { Pattern } from '../../../entities/Pattern/model/types';
import { INSTRUMENTS_ORDER, GENERAL_MIDI_DRUM_MAP, MIDI_TICKS_PER_QUARTER_NOTE } from '../../config/constants';
import { AudioService } from './audioService';

// Augment the Window interface to include MIDIWriter
// This tells TypeScript that window.MIDIWriter is expected to exist,
// typically when the library is loaded via a CDN.
declare global {
  interface Window {
    MidiWriter: any; // You could define a more specific type if you have one
  }
}

export class ExportService {
  private downloadFile(dataUri: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke object URL if it was created, but data URI doesn't need revoking
  }

  public exportPatternToMidi(pattern: Pattern): void {
    // Access MIDIWriter via the window object
    if (!(window as any).MidiWriter || typeof (window as any).MidiWriter.Writer !== 'function') {
      console.error('MidiWriter library or MidiWriter.Writer is not loaded.');
      throw new Error('MIDI export library not available.');
    }

    const track = new (window as any).MidiWriter.Track();
    track.setTempo(pattern.bpm);

    // Each step in the UI is a 16th note.
    // MIDIWriter's default ticks per beat (quarter note) is 128 (MIDI_TICKS_PER_QUARTER_NOTE).
    // So, a 16th note step has a duration of MIDI_TICKS_PER_QUARTER_NOTE / 4 = 32 ticks.
    const ticksPerUiStep = MIDI_TICKS_PER_QUARTER_NOTE / 4;

    INSTRUMENTS_ORDER.forEach(instrument => {
      const midiNote = GENERAL_MIDI_DRUM_MAP[instrument];
      if (midiNote === undefined) return; // Skip if instrument not in MIDI map

      pattern.steps[instrument].forEach((isActive: boolean, stepIndex: number) => {
        if (isActive) {
          const noteEvent = new (window as any).MidiWriter.NoteEvent({
            pitch: [midiNote],
            duration: '16', // Duration of the MIDI note itself (a 16th note long)
            startTick: stepIndex * ticksPerUiStep,
            channel: 10 // General MIDI drum channel is 10 (0-indexed: 9, 1-indexed: 10, MIDIWriter uses 1-indexed)
          });
          track.addEvent(noteEvent);
        }
      });
    });

    const writer = new (window as any).MidiWriter.Writer([track]);
    const dataUri = writer.dataUri();
    const filename = `${pattern.name.replace(/\s+/g, '_') || 'drum_pattern'}.mid`;
    this.downloadFile(dataUri, filename);
  }

  private audioBufferToWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const numOfChan = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result: Float32Array;
    if (numOfChan === 2) { // Stereo to Mono: average the two channels
      const ch0 = audioBuffer.getChannelData(0);
      const ch1 = audioBuffer.getChannelData(1);
      result = new Float32Array(ch0.length);
      for (let i = 0; i < ch0.length; i++) {
        result[i] = (ch0[i] + ch1[i]) / 2;
      }
    } else { // Mono
      result = audioBuffer.getChannelData(0);
    }

    const pcmDataLength = result.length;
    const dataSize = pcmDataLength * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataSize); // 44 bytes for header
    const view = new DataView(buffer);

    // Helper to write string to DataView
    const writeString = (viewDV: DataView, offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        viewDV.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // fileSize - 8
    writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // chunkSize (16 for PCM)
    view.setUint16(20, format, true); // audioFormat
    view.setUint16(22, 1, true); // numChannels (mono output)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 1 * (bitDepth / 8), true); // byteRate (sampleRate * numChannels * bytesPerSample)
    view.setUint16(32, 1 * (bitDepth / 8), true); // blockAlign (numChannels * bytesPerSample)
    view.setUint16(34, bitDepth, true);

    // DATA sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data (Float32 to 16-bit PCM)
    let offset = 44;
    for (let i = 0; i < pcmDataLength; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return buffer;
  }

  public async exportPatternToWav(pattern: Pattern, audioService: AudioService): Promise<void> {
    const sampleRate = audioService.getSampleRate();
    // Duration of one 16th note step in seconds
    const stepDurationSec = (60 / pattern.bpm) / 4;
    const totalDurationSec = pattern.numSteps * stepDurationSec;

    // Create OfflineAudioContext (mono, total duration, sample rate)
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(totalDurationSec * sampleRate), sampleRate);

    for (const instrument of INSTRUMENTS_ORDER) {
      const audioBuffer = audioService.getAudioBuffer(instrument);
      if (!audioBuffer) {
        console.warn(`No audio buffer for ${instrument}, skipping in WAV export.`);
        continue;
      }

      pattern.steps[instrument].forEach((isActive: boolean, stepIndex: number) => {
        if (isActive) {
          const startTime = stepIndex * stepDurationSec;
          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineCtx.destination);
          source.start(startTime);
        }
      });
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const wavData = this.audioBufferToWAV(renderedBuffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const dataUri = URL.createObjectURL(blob);
    const filename = `${pattern.name.replace(/\s+/g, '_') || 'drum_pattern'}.wav`;
    
    this.downloadFile(dataUri, filename);
    URL.revokeObjectURL(dataUri); // Clean up object URL
  }
}
