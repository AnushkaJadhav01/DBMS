export type Screen = 'orders' | 'inventory' | 'receipt' | 'customers' | 'suppliers' | 'shipments' | 'payments' | string;

export type TransitionType = 'push' | 'push_back' | 'slide_up' | 'none';

export interface NavigationContextType {
  currentScreen: Screen;
  params?: any;
  navigate: (screen: Screen, transition?: TransitionType, params?: any) => void;
  transition: TransitionType;
}
