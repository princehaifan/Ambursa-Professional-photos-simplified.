import React, { useState, useMemo, useEffect } from 'react';
import type { EditState } from '../types';
import { INITIAL_EDIT_STATE, FILTERS } from '../constants';
import { Slider } from './Slider';
import { FilterStrip } from './FilterStrip';
import { GeminiAIEditor } from './GeminiAIEditor';
import { Icon } from './Icon';

interface EditorViewProps {
  imageSrc: string;
  imageBeforeAi: string | null;
  edits: EditState;
  setEdits: React.Dispatch<React.SetStateAction<EditState>>;
  onBack: () => void;
  onAiEdit: (prompt: string) => Promise<void>;
  isAiProcessing: boolean;
  aiError: string | null;
  aiIntensity: number;
  onAiIntensityChange: (value: number) => void;
  onResetAiEdit: () => void;
}

// Applies a sharpening convolution kernel to the canvas context.
const applySharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, sharpness: number) => {
  const s = sharpness / 100 * 0.5;
  if (s <= 0) return;

  const kernel = [
    [0, -s, 0],
    [-s, 1 + 4 * s, -s],
    [0, -s, 0]
  ];

  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);
  
  const side = 3;
  const halfSide = Math.floor(side / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstOff = (y * width + x) * 4;
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;

          if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
            const srcOff = (scy * width + scx) * 4;
            const wt = kernel[cy][cx];
            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = src[dstOff + 3];
    }
  }
  
  imageData.data.set(dst);
  ctx.putImageData(imageData, 0, 0);
};

const TabButton = ({ name, isActive, onClick }: { name: string, isActive: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex-1 pb-2 border-b-2 transition-colors duration-200 ${isActive ? 'text-white border-white' : 'text-zinc-400 border-transparent'}`}>
      <span className="font-semibold text-sm">{name}</span>
    </button>
  );

export const EditorView: React.FC<EditorViewProps> = ({
  imageSrc,
  imageBeforeAi,
  edits,
  setEdits,
  onBack,
  onAiEdit,
  isAiProcessing,
  aiError,
  aiIntensity,
  onAiIntensityChange,
  onResetAiEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'magic'>('adjust');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Update SVG filter for live preview of sharpness
    const matrix = document.getElementById('sharpen-matrix');
    if (matrix) {
      const s = edits.sharpness / 100 * 0.5;
      const kernel = `0 ${-s} 0 ${-s} ${1 + 4 * s} ${-s} 0 ${-s} 0`;
      matrix.setAttribute('kernelMatrix', kernel);
    }
  }, [edits.sharpness]);

  const imageStyle = useMemo(() => {
    const filters = [
      `brightness(${edits.exposure / 100})`,
      `contrast(${edits.contrast / 100})`,
      `saturate(${edits.saturation / 100})`,
      `sepia(${edits.temperature > 0 ? edits.temperature / 2 : 0}%)`,
      `hue-rotate(${edits.temperature < 0 ? edits.temperature * 1.5 : 0}deg)`,
    ];
    
    if (edits.sharpness > 0) {
      filters.push(`url(#sharpen-filter)`);
    }

    return { filter: filters.join(' '), willChange: 'filter' };
  }, [edits]);

  const handleSliderChange = (key: keyof EditState, value: number) => {
    setEdits(prev => ({ ...prev, [key]: value }));
  };

  const applyFilter = (filterName: string) => {
    const filter = FILTERS.find(f => f.name === filterName);
    if (filter) {
      setEdits({ ...INITIAL_EDIT_STATE, ...filter.edits });
    }
  };
  
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
      });

      const baseImage = await loadImage(imageBeforeAi || imageSrc);
      const canvas = document.createElement('canvas');
      canvas.width = baseImage.naturalWidth;
      canvas.height = baseImage.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get canvas context");
      
      let imageToProcess: HTMLImageElement | HTMLCanvasElement = baseImage;
      
      // Step 1: If an AI edit exists, blend the original and AI images first.
      if (imageBeforeAi && imageSrc !== imageBeforeAi) {
          const aiImage = await loadImage(imageSrc);
          const blendedCanvas = document.createElement('canvas');
          blendedCanvas.width = canvas.width;
          blendedCanvas.height = canvas.height;
          const blendedCtx = blendedCanvas.getContext('2d');
          if(!blendedCtx) throw new Error("Could not get blended canvas context");
          
          blendedCtx.drawImage(baseImage, 0, 0);
          blendedCtx.globalAlpha = aiIntensity / 100;
          blendedCtx.drawImage(aiImage, 0, 0, canvas.width, canvas.height);
          
          imageToProcess = blendedCanvas;
      }
      
      // Step 2: Apply manual adjustments (brightness, contrast, etc.)
      const cssFilters = [
        `brightness(${edits.exposure / 100})`,
        `contrast(${edits.contrast / 100})`,
        `saturate(${edits.saturation / 100})`,
        `sepia(${edits.temperature > 0 ? edits.temperature / 2 : 0}%)`,
        `hue-rotate(${edits.temperature < 0 ? edits.temperature * 1.5 : 0}deg)`,
      ].join(' ');
      
      ctx.filter = cssFilters;
      ctx.drawImage(imageToProcess, 0, 0);
      
      // Step 3: Apply sharpness (must be done after other filters)
      ctx.filter = 'none';
      if (edits.sharpness > 0) {
         applySharpen(ctx, canvas.width, canvas.height, edits.sharpness);
      }

      // Step 4: Apply overlays (vignette, grain)
      if (edits.vignette > 0) {
        const outerRadius = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, outerRadius - (edits.vignette * canvas.width * 0.035),
          canvas.width / 2, canvas.height / 2, outerRadius
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${0.8 * (edits.vignette / 100)})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      if (edits.grain > 0) {
        const grainImg = await loadImage(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAQMAAABKLAcXAAAABlBMVEUAAAAAAAClZ7nPAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVRIx+3OsQkAMAwDwYT/n3+6e6gSC1QxsbAsiFighA+Z4Kli4eO5MV/+ACi3Amo6PnwHAAAAAElFTkSuQmCC`);
        ctx.globalAlpha = edits.grain / 100 * 0.15;
        const pattern = ctx.createPattern(grainImg, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalAlpha = 1.0;
      }
      
      // Step 5: Trigger download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = 'ambursa-edit.jpg';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Failed to download image:", error);
      alert("Could not download the image. An error occurred during processing.");
    } finally {
      setIsDownloading(false);
    }
  };
  
  const vignetteOverlayStyle = {
      boxShadow: `inset 0 0 ${edits.vignette * 2.5}px ${edits.vignette * 1.5}px rgba(0,0,0,${0.8 * (edits.vignette / 100)})`
  };
  
  const grainOverlayStyle = {
      opacity: edits.grain / 100 * 0.15,
      backgroundImage: `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAQMAAABKLAcXAAAABlBMVEUAAAAAAAClZ7nPAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVRIx+3OsQkAMAwDwYT/n3+6e6gSC1QxsbAsiFighA+Z4Kli4eO5MV/+ACi3Amo6PnwHAAAAAElFTSuQmCC')`,
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/50 transition" aria-label="Back to home">
          <Icon name="back" />
        </button>
        <h1 className="text-xl font-bold text-white bg-black/30 px-3 py-1 rounded-full">Editor</h1>
        <button onClick={handleDownload} disabled={isDownloading} className="p-2 rounded-full hover:bg-black/50 transition disabled:opacity-50 disabled:cursor-wait" aria-label="Download image">
          {isDownloading ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <Icon name="download" />
          )}
        </button>
      </header>
      
      <main className="flex-1 w-full flex items-center justify-center overflow-hidden p-2 relative">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            <img
              key={imageSrc}
              src={imageSrc}
              alt="Editable"
              className="max-w-full max-h-full object-contain block transition-opacity duration-300"
              style={{
                ...imageStyle,
                opacity: imageBeforeAi ? 1.0 - (aiIntensity / 100) : 1,
              }}
            />
            {imageBeforeAi && (
              <img
                key={imageBeforeAi}
                src={imageBeforeAi}
                alt="Before AI Edit"
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300"
                style={{
                  ...imageStyle,
                   opacity: aiIntensity / 100,
                   zIndex: -1, // Blend behind
                }}
              />
            )}
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={vignetteOverlayStyle}></div>
           <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={grainOverlayStyle}></div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-black/80 backdrop-blur-sm pt-4 pb-2 z-10">
        <div className="flex justify-around items-center border-b border-zinc-700/80 px-4">
          <TabButton name="Adjust" isActive={activeTab === 'adjust'} onClick={() => setActiveTab('adjust')} />
          <TabButton name="Filters" isActive={activeTab === 'filters'} onClick={() => setActiveTab('filters')} />
          <TabButton name="Magic" isActive={activeTab === 'magic'} onClick={() => setActiveTab('magic')} />
        </div>
        
        <div className="pt-6 pb-2 h-48 overflow-y-auto">
          {activeTab === 'adjust' && (
            <div className="px-4 space-y-4">
              <Slider label="Exposure" value={edits.exposure} onChange={v => handleSliderChange('exposure', v)} min={50} max={150} />
              <Slider label="Contrast" value={edits.contrast} onChange={v => handleSliderChange('contrast', v)} min={50} max={150} />
              <Slider label="Saturation" value={edits.saturation} onChange={v => handleSliderChange('saturation', v)} min={0} max={200} />
              <Slider label="Temperature" value={edits.temperature} onChange={v => handleSliderChange('temperature', v)} min={-50} max={50} />
              <Slider label="Vignette" value={edits.vignette} onChange={v => handleSliderChange('vignette', v)} min={0} max={100} />
              <Slider label="Grain" value={edits.grain} onChange={v => handleSliderChange('grain', v)} min={0} max={100} />
              <Slider label="Sharpness" value={edits.sharpness} onChange={v => handleSliderChange('sharpness', v)} min={0} max={100} />
            </div>
          )}
          {activeTab === 'filters' && <FilterStrip imageSrc={imageSrc} onSelectFilter={applyFilter} />}
          {activeTab === 'magic' && (
            <GeminiAIEditor 
              onAiEdit={onAiEdit}
              isProcessing={isAiProcessing}
              error={aiError}
              hasAiEdit={!!imageBeforeAi}
              aiIntensity={aiIntensity}
              onAiIntensityChange={onAiIntensityChange}
              onResetAiEdit={onResetAiEdit}
            />
          )}
        </div>
      </footer>
    </div>
  );
};
