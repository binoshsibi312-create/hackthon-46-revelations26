import { useState, useCallback } from 'react';
import axios from 'axios';

// Assuming you have this service or file
import { predictionService } from '../services/predictionService';

export function usePredictions() {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getPrediction = useCallback(async (cartItems, vendorId) => {
        if (!cartItems || cartItems.length === 0 || !vendorId) {
            setPrediction(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await predictionService.predictOrderReadyTime(cartItems, vendorId);
            setPrediction(result);
        } catch (err) {
            console.error("Failed to get prediction", err);
            setError(err);
            // Fallback handled inside service, but if catastrophic failure:
            setPrediction(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return { prediction, loading, error, getPrediction };
}
