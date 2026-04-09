import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Screen, TransitionType, NavigationContextType } from '../types';

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('orders');
  const [transition, setTransition] = useState<TransitionType>('none');

  const navigate = (screen: Screen, type: TransitionType = 'none') => {
    setTransition(type);
    setCurrentScreen(screen);
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate, transition }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
