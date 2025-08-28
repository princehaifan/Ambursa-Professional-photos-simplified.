export interface EditState {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  saturation: number;
  temperature: number;
  vignette: number;
  grain: number; // Will be simulated with an overlay
  sharpness: number;
}

export interface Filter {
  name: string;
  edits: Partial<EditState>;
}

export interface SavedSession {
  imageSrc: string;
  imageBeforeAi: string | null;
  aiIntensity: number;
  edits: EditState;
}

export interface Preset {
  name: string;
  prompt: string;
}

export interface PresetCollection {
  collectionName: string;
  description: string;
  presets: Preset[];
}