import React, { useState, useCallback, useEffect } from 'react';
import { HomeView } from './components/HomeView';
import { CameraView } from './components/CameraView';
import { EditorView } from './components/EditorView';
import type { EditState, SavedSession } from './types';
import { INITIAL_EDIT_STATE } from './constants';
import { editImageWithAi } from './services/geminiService';

type View = 'home' | 'camera' | 'editor';
const LOCAL_STORAGE_KEY = 'ambursa-saved-edit';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageBeforeAi, setImageBeforeAi] = useState<string | null>(null);
  const [aiIntensity, setAiIntensity] = useState<number>(100);
  const [edits, setEdits] = useState<EditState>(INITIAL_EDIT_STATE);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savedSessionData, setSavedSessionData] = useState<SavedSession | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData: SavedSession = JSON.parse(savedData);
        if (parsedData.imageSrc && parsedData.edits) {
          setSavedSessionData(parsedData);
        }
      }
    } catch (error) {
      console.error("Failed to load saved session:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleCapture = useCallback((dataUrl: string) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSavedSessionData(null);
    setImageSrc(dataUrl);
    setImageBeforeAi(null);
    setEdits(INITIAL_EDIT_STATE);
    setView('editor');
  }, []);
  
  const handleImageUpload = useCallback((dataUrl: string) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSavedSessionData(null);
    setImageSrc(dataUrl);
    setImageBeforeAi(null);
    setEdits(INITIAL_EDIT_STATE);
    setView('editor');
  }, []);

  const handleContinueSession = useCallback(() => {
    if (savedSessionData) {
      setImageSrc(savedSessionData.imageSrc);
      setImageBeforeAi(savedSessionData.imageBeforeAi);
      setAiIntensity(savedSessionData.aiIntensity);
      setEdits(savedSessionData.edits);
      setView('editor');
    }
  }, [savedSessionData]);

  const handleGoToCamera = useCallback(() => {
    setView('camera');
  }, []);

  const handleBackToHome = useCallback(() => {
    if (imageSrc) {
      try {
        const sessionToSave: SavedSession = {
          imageSrc,
          imageBeforeAi,
          aiIntensity,
          edits,
        };
        const sessionString = JSON.stringify(sessionToSave);
        localStorage.setItem(LOCAL_STORAGE_KEY, sessionString);
        setSavedSessionData(sessionToSave);
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    }

    setImageSrc(null);
    setImageBeforeAi(null);
    setEdits(INITIAL_EDIT_STATE);
    setView('home');
  }, [imageSrc, imageBeforeAi, aiIntensity, edits]);

  const handleAiEdit = useCallback(async (prompt: string) => {
    if (!imageSrc) return;

    setIsAiProcessing(true);
    setAiError(null);
    setImageBeforeAi(imageSrc);
    try {
      const editedImage = await editImageWithAi(imageSrc, prompt);
      if (editedImage) {
        setImageSrc(editedImage);
        setAiIntensity(100);
        setEdits(INITIAL_EDIT_STATE);
      } else {
        setAiError("AI couldn't edit the image. Please try a different prompt.");
        setImageBeforeAi(null);
      }
    } catch (error: any) {
      console.error("AI Editing Error:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";
       if (error.message) {
        if (error.message.startsWith('BLOCKED:')) {
          errorMessage = "This edit was blocked for safety reasons. Please try a different prompt or image.";
        } else if (error.message.startsWith('NO_IMAGE:')) {
          errorMessage = "The AI didn't return an image. Try being more specific or rephrasing your request.";
        }
      }
      setAiError(errorMessage);
      setImageBeforeAi(null);
    } finally {
      setIsAiProcessing(false);
    }
  }, [imageSrc]);

  const handleResetAiEdit = useCallback(() => {
    if (imageBeforeAi) {
      setImageSrc(imageBeforeAi);
      setImageBeforeAi(null);
      setAiIntensity(100);
    }
  }, [imageBeforeAi]);

  const renderView = () => {
    switch(view) {
      case 'home':
        return <HomeView onGoToCamera={handleGoToCamera} onImageUpload={handleImageUpload} hasSavedSession={!!savedSessionData} onContinueSession={handleContinueSession} />;
      case 'camera':
        return <CameraView onCapture={handleCapture} onBack={handleBackToHome} />;
      case 'editor':
        if (imageSrc) {
          return <EditorView
            imageSrc={imageSrc}
            imageBeforeAi={imageBeforeAi}
            edits={edits}
            setEdits={setEdits}
            onBack={handleBackToHome}
            onAiEdit={handleAiEdit}
            isAiProcessing={isAiProcessing}
            aiError={aiError}
            aiIntensity={aiIntensity}
            onAiIntensityChange={setAiIntensity}
            onResetAiEdit={handleResetAiEdit}
          />;
        }
        handleBackToHome();
        return null;
      default:
        return <HomeView onGoToCamera={handleGoToCamera} onImageUpload={handleImageUpload} hasSavedSession={!!savedSessionData} onContinueSession={handleContinueSession} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center font-sans">
      <div className="relative w-full h-full max-w-lg mx-auto bg-black">
        {renderView()}
      </div>
    </div>
  );
};

export default App;