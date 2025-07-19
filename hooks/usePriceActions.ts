import { useCallback } from 'react';
import { usePriceStore } from '../stores/usePriceStore';
import { priceApi, handleApiError, PriceRequest, ScheduleRequest } from '../lib/api/priceApi';

/**
 * Custom hook for handling price fetching functionality
 */
export const usePriceActions = () => {
  const {
    token,
    network,
    timestamp,
    setResult,
    setLoading,
    setError,
    setSuccess,
    resetPrice,
  } = usePriceStore();

  const handleGetPrice = useCallback(async (): Promise<void> => {
    // Validation
    if (!token.trim()) {
      setError('Token is required');
      return;
    }

    if (!network.trim()) {
      setError('Network is required');
      return;
    }

    try {
      // Reset previous states
      resetPrice();
      setLoading(true);
      setError(null);

      // Prepare request data - timestamp is optional
      const requestData: PriceRequest = {
        token: token.trim(),
        network: network.trim(),
        timestamp: timestamp.trim() ? new Date(timestamp.trim()).toISOString() : new Date().toISOString(),
      };

      console.log('Fetching price for:', requestData);

      // Make API call
      const response = await priceApi.getPrice(requestData);

      // Update store with results
      setResult(response.price, response.source);
      setSuccess(true);

      console.log('Price fetched successfully:', response);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('Error fetching price:', error);
    } finally {
      setLoading(false);
    }
  }, [token, network, timestamp, setResult, setLoading, setError, setSuccess, resetPrice]);

  return {
    handleGetPrice,
    canFetchPrice: !!(token.trim() && network.trim()), // Remove timestamp requirement
  };
};

/**
 * Custom hook for handling scheduling functionality
 */
export const useScheduleActions = () => {
  const {
    token,
    network,
    isScheduling,
    scheduleProgress,
    setIsScheduling,
    setScheduleProgress,
    resetSchedule,
    setError,
  } = usePriceStore();

  const simulateProgress = useCallback(async (): Promise<void> => {
    const progressSteps = [0, 10, 25, 40, 55, 70, 85, 100];
    const delay = 300; // 300ms between steps

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, delay));
      setScheduleProgress(step);
    }
  }, [setScheduleProgress]);

  const handleSchedule = useCallback(async (): Promise<void> => {
    // Validation
    if (!token.trim()) {
      setError('Token is required for scheduling');
      return;
    }

    if (!network.trim()) {
      setError('Network is required for scheduling');
      return;
    }

    try {
      // Reset previous states
      resetSchedule();
      setIsScheduling(true);
      setError(null);

      // Prepare request data
      const requestData: ScheduleRequest = {
        token: token.trim(),
        network: network.trim(),
      };

      console.log('Scheduling job for:', requestData);

      // Start progress simulation
      const progressPromise = simulateProgress();

      // Make API call
      const apiPromise = priceApi.scheduleJob(requestData);

      // Wait for both to complete
      const [response] = await Promise.all([apiPromise, progressPromise]);

      console.log('Job scheduled successfully:', response);

      // Keep the progress at 100% for a moment before resetting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('Error scheduling job:', error);
    } finally {
      setIsScheduling(false);
    }
  }, [token, network, setIsScheduling, setError, resetSchedule, simulateProgress]);

  const cancelSchedule = useCallback((): void => {
    resetSchedule();
  }, [resetSchedule]);

  return {
    handleSchedule,
    cancelSchedule,
    canSchedule: !!(token.trim() && network.trim()),
    isScheduling,
    scheduleProgress,
  };
};

/**
 * Combined hook for all price-related actions
 */
export const usePriceManager = () => {
  const priceActions = usePriceActions();
  const scheduleActions = useScheduleActions();

  return {
    ...priceActions,
    ...scheduleActions,
  };
};
