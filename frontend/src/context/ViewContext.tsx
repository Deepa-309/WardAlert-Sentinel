// WardAlert Sentinel - View & Accessibility Context
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ViewContextType {
  simpleView: boolean;
  setSimpleView: (val: boolean) => void;
  toggleSimpleView: () => void;
  largeText: boolean;
  setLargeText: (val: boolean) => void;
  toggleLargeText: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  toggleReducedMotion: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simpleView, setSimpleView] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_simple_view') === 'true';
  });

  const [largeText, setLargeText] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_large_text') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_high_contrast') === 'true';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_reduced_motion') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('wardalert_simple_view', String(simpleView));
    if (simpleView) {
      document.documentElement.classList.add('simple-view');
      document.body.classList.add('simple-view');
    } else {
      document.documentElement.classList.remove('simple-view');
      document.body.classList.remove('simple-view');
    }
  }, [simpleView]);

  useEffect(() => {
    localStorage.setItem('wardalert_large_text', String(largeText));
    if (largeText) {
      document.documentElement.classList.add('large-text');
      document.body.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
      document.body.classList.remove('large-text');
    }
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('wardalert_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('wardalert_reduced_motion', String(reducedMotion));
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
      document.body.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
      document.body.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  const toggleSimpleView = () => setSimpleView(prev => !prev);
  const toggleLargeText = () => setLargeText(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleReducedMotion = () => setReducedMotion(prev => !prev);

  return (
    <ViewContext.Provider value={{
      simpleView,
      setSimpleView,
      toggleSimpleView,
      largeText,
      setLargeText,
      toggleLargeText,
      highContrast,
      setHighContrast,
      toggleHighContrast,
      reducedMotion,
      setReducedMotion,
      toggleReducedMotion
    }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
