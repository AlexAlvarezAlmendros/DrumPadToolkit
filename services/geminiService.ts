
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Pattern, DrumMachineSound, StepState, LanguageCode } from '../types';
import { GEMINI_MODEL_NAME, INSTRUMENTS_ORDER, MIN_BPM, MAX_BPM, DEFAULT_NUM_STEPS, DEFAULT_LANGUAGE } from '../constants';

interface SuggestPatternNameParams {
  steps: Record<DrumMachineSound, StepState[]>;
  bpm: number;
  numSteps: number;
}

interface AIPatternResponse {
  bpm?: number;
  [key: string]: StepState[] | number | undefined; 
}

interface GeneratedAIPattern {
    generatedSteps: Partial<Record<DrumMachineSound, StepState[]>>;
    generatedBpm: number;
}

const formatPatternForPrompt = (params: SuggestPatternNameParams): string => {
  let description = `BPM: ${params.bpm}\nNumber of Steps: ${params.numSteps}\nInstruments:\n`;
  INSTRUMENTS_ORDER.forEach(instrument => {
    const stepSequence = params.steps[instrument]?.map(s => s ? '1' : '0').join('') || Array(params.numSteps).fill('0').join('');
    description += `- ${instrument}: [${stepSequence}]\n`;
  });
  return description;
};

export const suggestPatternName = async (patternData: SuggestPatternNameParams, targetLanguage: LanguageCode = DEFAULT_LANGUAGE): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not configured in process.env.API_KEY");
    throw new Error("API key not configured. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const patternDescription = formatPatternForPrompt(patternData);
  // Note: The prompt itself is in English to ensure consistent AI understanding.
  // The targetLanguage param is for potential future use if the API supports output lang, or for client-side adjustments.
  // For now, Gemini primarily responds based on prompt language.
  const prompt = `
You are a creative assistant for music producers.
Suggest one concise, cool, and descriptive name for a drum pattern with the following characteristics.
The name should be catchy and evoke a feeling or style.
Respond ONLY with the suggested name as a plain string, without any additional text, explanation, or markdown.
The suggested name should be suitable for the language code: "${targetLanguage}". If you can, make it sound natural in that language.

Pattern Details:
${patternDescription}

Example names: "Cosmic Funk", "LoFi Chill Groove", "Industrial Stomp", "Minimal Tech Pulse"

Suggested Name:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.8, // Keep some creativity for names
      }
    });
    
    let suggestedName = response.text.trim();
    // Remove potential quotes around the name
    if (suggestedName.startsWith('"') && suggestedName.endsWith('"')) {
      suggestedName = suggestedName.substring(1, suggestedName.length - 1);
    }
    return suggestedName || "Unnamed Beat";

  } catch (error) {
    console.error("Error calling Gemini API for name suggestion:", error);
    throw new Error("Failed to get suggestion from AI.");
  }
};


// Genre is passed in English to the API.
export const generateDrumPattern = async (genre: string, currentBpm: number, numStepsToGenerate: number = DEFAULT_NUM_STEPS): Promise<GeneratedAIPattern> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not configured in process.env.API_KEY");
    throw new Error("API key not configured for pattern generation.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const instrumentListString = INSTRUMENTS_ORDER.map(instrument => `"${instrument}"`).join(', ');

  // System instruction and prompt are in English for AI consistency
  const systemInstruction = `You are an expert drum machine programmer. Your sole purpose is to generate a ${numStepsToGenerate}-step drum pattern and suggest an appropriate BPM in JSON format. The pattern and BPM must be highly characteristic of the music genre provided by the user (which will be in English). Adhere strictly to the user's specified genre and the requested number of steps.`;

  const prompt = `
Generate a ${numStepsToGenerate}-step drum pattern and suggest a suitable BPM for the music genre: "${genre}".
The current BPM is ${currentBpm}, you can use this as a reference but suggest a BPM that is most typical for the "${genre}" style and the pattern you generate.

The pattern should include steps for these instruments: ${instrumentListString}.
For each instrument, provide an array of ${numStepsToGenerate} boolean values. 'true' indicates the step is active (sound plays), and 'false' means it's inactive.
Ensure the pattern is creative, rhythmically interesting, and authentically represents the "${genre}" style for a ${numStepsToGenerate}-step sequence. Avoid overly simplistic or monotonous rhythms. The pattern should feel complete and usable as a core beat for this genre.

Output ONLY a valid JSON object.
The JSON object must have a "bpm" field with a suggested integer BPM value.
The JSON object must also have keys corresponding to the instrument names (e.g., "Kick", "Snare", "HH Closed").
Each instrument key's value must be an array of exactly ${numStepsToGenerate} boolean values.

Example JSON structure for a ${numStepsToGenerate}-step pattern (this is just an example, be creative and true to the genre):
{
  "bpm": 120,
  "Kick": [${Array(numStepsToGenerate).fill('false').map((_,i) => i%4===0 ? 'true' : 'false').join(', ')}], 
  "Snare": [${Array(numStepsToGenerate).fill('false').map((_,i) => (i+2)%4===0 ? 'true' : 'false').join(', ')}],
  "HH Closed": [${Array(numStepsToGenerate).fill('true').join(', ')}],
  "HH Open": [${Array(numStepsToGenerate).fill('false').map((_,i) => (i+numStepsToGenerate/2 -1)% (numStepsToGenerate/2) === 0 ? 'true' : 'false').join(', ')}],
  "Clap": [${Array(numStepsToGenerate).fill('false').map((_,i) => (i+2)%4===0 ? 'true' : 'false').join(', ')}],
  "Tom": [${Array(numStepsToGenerate).fill('false').join(', ')}]
}

Music Genre (English): ${genre}
Current BPM (for reference): ${currentBpm}
Number of steps to generate: ${numStepsToGenerate}

JSON Output:`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.75, 
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    
    const parsedData = JSON.parse(jsonStr) as AIPatternResponse;
    const generatedSteps: Partial<Record<DrumMachineSound, StepState[]>> = {};
    let isValidPatternStructure = true;

    INSTRUMENTS_ORDER.forEach(instrument => {
        const steps = parsedData[instrument as string] as StepState[] | undefined; // Cast key to string for lookup
        if (Array.isArray(steps) && steps.length === numStepsToGenerate && steps.every(s => typeof s === 'boolean')) {
          generatedSteps[instrument] = steps;
        } else {
          console.warn(`AI returned invalid or missing steps for ${instrument} (expected ${numStepsToGenerate}). Defaulting to empty.`);
          generatedSteps[instrument] = Array(numStepsToGenerate).fill(false); 
          isValidPatternStructure = false;
        }
    });
    
    let generatedBpm = currentBpm; 
    if (typeof parsedData.bpm === 'number' && parsedData.bpm >= MIN_BPM && parsedData.bpm <= MAX_BPM) {
        generatedBpm = Math.round(parsedData.bpm);
    } else if (parsedData.bpm !== undefined) {
        console.warn(`AI suggested an invalid BPM: ${parsedData.bpm}. Defaulting to current BPM: ${currentBpm}.`);
    }

    if (!isValidPatternStructure) {
        console.warn(`AI pattern validation encountered issues for ${numStepsToGenerate}-step pattern. Some instruments might have default empty patterns.`, generatedSteps);
    }

    return { generatedSteps, generatedBpm };

  } catch (error) {
    console.error("Error calling Gemini API for pattern generation or parsing JSON:", error);
    if (error instanceof SyntaxError) {
      throw new Error(`AI returned invalid JSON for ${numStepsToGenerate}-step pattern. Could not parse the drum pattern.`);
    }
    throw new Error(`Failed to generate ${numStepsToGenerate}-step drum pattern from AI.`);
  }
};
