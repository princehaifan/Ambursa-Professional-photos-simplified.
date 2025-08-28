
import React, { useState } from 'react';
import { Icon } from './Icon';
import { Slider } from './Slider';
import { PRO_PRESET_COLLECTIONS } from '../constants';
import type { PresetCollection } from '../types';

interface GeminiAIEditorProps {
  onAiEdit: (prompt: string) => void;
  isProcessing: boolean;
  error: string | null;
  hasAiEdit: boolean;
  aiIntensity: number;
  onAiIntensityChange: (value: number) => void;
  onResetAiEdit: () => void;
}

const SUGGESTIONS = [
  "Make it more cinematic",
  "Add a warm, golden hour glow",
  "Make the colors pop",
  "Give it a vintage, faded film look",
  "Convert to dramatic black and white",
  "Increase sharpness and detail",
  "Apply a soft, dreamy effect",
  "Make the sky more dramatic",
];

export const GeminiAIEditor: React.FC<GeminiAIEditorProps> = ({
  onAiEdit,
  isProcessing,
  error,
  hasAiEdit,
  aiIntensity,
  onAiIntensityChange,
  onResetAiEdit
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<PresetCollection | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing) {
      onAiEdit(prompt.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };
  
  const handlePresetClick = (presetPrompt: string) => {
    if (!isProcessing) {
      onAiEdit(presetPrompt);
    }
  };

  const renderPresetBrowser = () => {
    if (selectedCollection) {
      return (
        <div>
          <div className="flex items-center mb-3">
            <button onClick={() => setSelectedCollection(null)} className="p-1 rounded-full hover:bg-zinc-700 transition mr-2">
              <Icon name="back" className="w-5 h-5"/>
            </button>
            <h4 className="text-md font-semibold text-white">{selectedCollection.collectionName}</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedCollection.presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset.prompt)}
                disabled={isProcessing}
                className="w-full text-left px-3 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-md hover:bg-zinc-700 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PRO_PRESET_COLLECTIONS.map(collection => (
          <button
            key={collection.collectionName}
            onClick={() => setSelectedCollection(collection)}
            disabled={isProcessing}
            className="text-left p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition disabled:opacity-50"
          >
            <h5 className="font-semibold text-white text-sm">{collection.collectionName}</h5>
            <p className="text-xs text-zinc-400 mt-1">{collection.description}</p>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="px-2 space-y-6">
      {hasAiEdit && (
        <div className="border-b border-zinc-700/80 pb-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3 text-center">AI Edit Controls</h3>
          <div className="px-2">
            <Slider label="Intensity" value={aiIntensity} onChange={onAiIntensityChange} min={0} max={100} />
          </div>
          <button 
            onClick={onResetAiEdit}
            disabled={isProcessing}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-zinc-600 text-zinc-300 text-sm rounded-md hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
          >
            <Icon name="reset" className="w-4 h-4" />
            Reset AI Edit
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Pro Preset Collections</h3>
        {renderPresetBrowser()}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Custom Edit</h3>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Make the trees more green'"
            disabled={isProcessing}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/80 transition"
          />
          <button
            type="submit"
            disabled={isProcessing || !prompt.trim()}
            className="p-2 bg-white text-black rounded-md hover:bg-zinc-200 transition disabled:bg-zinc-600 disabled:cursor-not-allowed"
          >
            <Icon name="ai" />
          </button>
        </form>

        {error && (
          <div className="mt-3 bg-red-900/50 border border-red-500/50 text-red-300 text-xs rounded-md p-3 flex items-start gap-2">
            <Icon name="warning" className="w-4 h-4 mt-0.5 flex-shrink-0"/>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Suggestions</h3>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isProcessing}
              className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-full hover:bg-zinc-700 hover:text-white transition disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
