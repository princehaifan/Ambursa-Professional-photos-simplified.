import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Icon } from './Icon';

interface CameraViewProps {
  onCapture: (dataUrl: string) => void;
  onBack: () => void;
}

type CameraStatus = 'loading' | 'ready' | 'error';

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<CameraStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    // Ensure we start in a clean state on mount
    setStatus('loading');
    setError(null);

    const setupCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API is not supported by your browser.");
        }
        
        const constraints = {
            video: { facingMode: 'environment' },
            audio: false,
        };

        let mediaStream: MediaStream;
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            console.warn("Could not get environment camera, trying default camera.", err);
            const fallbackConstraints = { video: true, audio: false };
            mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        }
        
        activeStream = mediaStream;
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.srcObject = activeStream;
            // Wait for the video to be ready to play before enabling capture
            videoElement.onloadedmetadata = () => {
                setStatus('ready');
            };
        } else {
            throw new Error("Video element not found.");
        }
      } catch (err: any) {
          console.error("Error accessing camera:", err);
          if (err instanceof DOMException) {
              if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                  setError("No camera found on this device. Please connect a camera and try again.");
              } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                  setError("Camera permission denied. Please enable it in your browser settings to continue.");
              } else {
                  setError(`An unexpected error occurred: ${err.name}. Please ensure your camera is not in use by another app.`);
              }
          } else {
              setError(err.message || "Could not access the camera. It might be in use or not supported.");
          }
          setStatus('error');
      }
    };

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current && status === 'ready') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
      }
    }
  }, [onCapture, status]);
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
            <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-400">Starting camera...</p>
          </div>
        );
      case 'error':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-center p-8">
            <p className="text-red-400">{error}</p>
          </div>
        );
      case 'ready':
        return (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
       <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-gradient-to-b from-black/70 to-transparent">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/50 transition" aria-label="Back to home">
          <Icon name="back" />
        </button>
        <h1 className="text-xl font-bold text-white bg-black/30 px-3 py-1 rounded-full">Ambursa</h1>
        <div className="w-10 h-10" /> {/* Spacer to balance the header */}
      </header>
      
      <main className="flex-1 w-full h-full overflow-hidden">
        {renderContent()}
      </main>

      <canvas ref={canvasRef} className="hidden" />

      {status !== 'error' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center bg-gradient-to-t from-black/70 to-transparent">
          <button
            onClick={handleCapture}
            disabled={status !== 'ready'}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-black/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition disabled:bg-zinc-400 disabled:cursor-not-allowed"
            aria-label="Capture photo"
          >
            <div className="w-16 h-16 bg-white rounded-full border-2 border-black/50"></div>
          </button>
        </div>
      )}
    </div>
  );
};
