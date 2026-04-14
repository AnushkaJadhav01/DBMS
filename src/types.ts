export type Screen = 'orders' | 'inventory' | 'receipt';

export type TransitionType = 'push' | 'push_back' | 'slide_up' | 'none';

export interface NavigationContextType {
  currentScreen: Screen;
  navigate: (screen: Screen, transition?: TransitionType) => void;
  transition: TransitionType;
}
