import React, { useRef, useCallback } from 'react';
import { Icon } from './Icon';

interface HomeViewProps {
  onGoToCamera: () => void;
  onImageUpload: (dataUrl: string) => void;
  hasSavedSession: boolean;
  onContinueSession: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onGoToCamera, onImageUpload, hasSavedSession, onContinueSession }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          onImageUpload(result);
        }
      };
      reader.onerror = () => {
        alert('Error reading file.');
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-white">Ambursa</h1>
        <p className="text-lg text-zinc-400 mt-2">Professional photos, simplified.</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        {hasSavedSession && (
          <button
            onClick={onContinueSession}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black font-semibold py-4 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-zinc-300"
            aria-label="Continue your last editing session"
          >
            <Icon name="history" className="w-7 h-7" />
            <span>Continue Last Session</span>
          </button>
        )}
        <button
          onClick={onGoToCamera}
          className={`w-full flex items-center justify-center gap-3 font-semibold py-4 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${hasSavedSession ? 'bg-zinc-800 hover:bg-zinc-700 text-white focus:ring-white' : 'bg-white hover:bg-zinc-200 text-black focus:ring-zinc-300'}`}
          aria-label="Take a photo with camera"
        >
          <Icon name="camera" className="w-7 h-7" />
          <span>Take Photo</span>
        </button>

        <button
          onClick={handleUploadClick}
          className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
          aria-label="Upload an image from your device"
        >
          <Icon name="upload" className="w-7 h-7" />
          <span>Upload Image</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
       <footer className="absolute bottom-4 text-center text-zinc-600 text-sm">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};