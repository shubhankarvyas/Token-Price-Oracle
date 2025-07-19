import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface PriceState {
  // Input fields
  token: string;
  network: string;
  timestamp: string;
  
  // Result fields
  price: number | null;
  source: string | null;
  
  // Status flags
  loading: boolean;
  error: string | null;
  success: boolean;
  
  // Scheduling fields
  isScheduling: boolean;
  scheduleProgress: number;
  
  // Actions
  setToken: (token: string) => void;
  setNetwork: (network: string) => void;
  setTimestamp: (timestamp: string) => void;
  setResult: (price: number, source: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  
  // Scheduling actions
  setIsScheduling: (isScheduling: boolean) => void;
  setScheduleProgress: (progress: number) => void;
  resetSchedule: () => void;
  
  // Reset functions
  resetPrice: () => void;
  resetAll: () => void;
}

const initialState = {
  token: '',
  network: 'ethereum',
  timestamp: '',
  price: null,
  source: null,
  loading: false,
  error: null,
  success: false,
  isScheduling: false,
  scheduleProgress: 0,
};

export const usePriceStore = create<PriceState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Basic setters
      setToken: (token: string) => 
        set({ token, error: null, success: false }, false, 'setToken'),
      
      setNetwork: (network: string) => 
        set({ network, error: null, success: false }, false, 'setNetwork'),
      
      setTimestamp: (timestamp: string) => 
        set({ timestamp, error: null, success: false }, false, 'setTimestamp'),
      
      setResult: (price: number, source: string) => 
        set({ 
          price, 
          source, 
          loading: false, 
          error: null, 
          success: true 
        }, false, 'setResult'),
      
      setLoading: (loading: boolean) => 
        set({ loading, error: null }, false, 'setLoading'),
      
      setError: (error: string | null) => 
        set({ 
          error, 
          loading: false, 
          success: false 
        }, false, 'setError'),
      
      setSuccess: (success: boolean) => 
        set({ success }, false, 'setSuccess'),
      
      // Scheduling actions
      setIsScheduling: (isScheduling: boolean) => 
        set({ isScheduling }, false, 'setIsScheduling'),
      
      setScheduleProgress: (progress: number) => 
        set({ scheduleProgress: Math.min(100, Math.max(0, progress)) }, false, 'setScheduleProgress'),
      
      resetSchedule: () => 
        set({ 
          isScheduling: false, 
          scheduleProgress: 0 
        }, false, 'resetSchedule'),
      
      // Reset functions
      resetPrice: () => 
        set({ 
          price: null, 
          source: null, 
          loading: false, 
          error: null, 
          success: false 
        }, false, 'resetPrice'),
      
      resetAll: () => 
        set({ ...initialState }, false, 'resetAll'),
    }),
    {
      name: 'price-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for better performance
export const useTokenData = () => usePriceStore((state) => ({
  token: state.token,
  network: state.network,
  timestamp: state.timestamp,
}));

export const usePriceData = () => usePriceStore((state) => ({
  price: state.price,
  source: state.source,
}));

export const usePriceStatus = () => usePriceStore((state) => ({
  loading: state.loading,
  error: state.error,
  success: state.success,
}));

export const useScheduleStatus = () => usePriceStore((state) => ({
  isScheduling: state.isScheduling,
  scheduleProgress: state.scheduleProgress,
}));
