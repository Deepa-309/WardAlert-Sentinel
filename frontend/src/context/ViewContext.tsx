// WardAlert Sentinel - View & Accessibility Context
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ViewContextType {
  simpleView: boolean;
  setSimpleView: (val: boolean) => void;
  toggleSimpleView: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simpleView, setSimpleView] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_simple_view') === 'true';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_high_contrast') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('wardalert_simple_view', String(simpleView));
    if (simpleView) {
      document.body.classList.add('simple-view');
    } else {
      document.body.classList.remove('simple-view');
    }
  }, [simpleView]);

  useEffect(() => {
    localStorage.setItem('wardalert_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleSimpleView = () => setSimpleView(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  return (
    <ViewContext.Provider value={{ simpleView, setSimpleView, toggleSimpleView, highContrast, toggleHighContrast }}>
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
