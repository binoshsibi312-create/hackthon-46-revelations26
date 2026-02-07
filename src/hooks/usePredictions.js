import { useState, useEffect, useCallback } from 'react';
import { predictionService } from '../services/predictionService';

export const usePredictions = (vendorId) => {
  const [predictions, setPredictions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = useCallback(async (itemId) => {
    try {
      const prediction = await predictionService.getQuickEstimate(vendorId, itemId);
      setPredictions(prev => ({
        ...prev,
        [itemId]: prediction,
      }));
      return prediction;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [vendorId]);

  const fetchBatchPredictions = useCallback(async (itemIds) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const predictionsData = await predictionService.getBatchPredictions(vendorId, itemIds);
      setPredictions(predictionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    // Subscribe to real-time updates
    if (vendorId) {
      const unsubscribe = predictionService.subscribeToPredictions(vendorId, (update) => {
        if (update.type === 'PREDICTION_UPDATE') {
          setPredictions(prev => ({
            ...prev,
            [update.itemId]: update.prediction,
          }));
        }
      });

      return unsubscribe;
    }
  }, [vendorId]);

  return {
    predictions,
    isLoading,
    error,
    fetchPrediction,
    fetchBatchPredictions,
  };
};