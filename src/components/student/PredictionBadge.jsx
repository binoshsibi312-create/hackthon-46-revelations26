import React from 'react';
import { Clock, Users, AlertTriangle, Zap } from 'lucide-react';

const PredictionBadge = ({ prediction }) => {
    if (!prediction) return null;

    const { estimated_minutes, queue_position, confidence, rush_detected, method } = prediction;

    // Format Ready Time
    const readyDate = new Date(prediction.predicted_ready_time);
    const formattedTime = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine Color Scheme based on Confidence
    let colorClass = 'bg-gray-100 text-gray-800';
    let iconColor = 'text-gray-500';
    let label = 'Estimate';

    if (confidence >= 0.8) {
        colorClass = 'bg-green-100 text-green-800 border-green-200';
        iconColor = 'text-green-600';
        label = 'Reliable Prediction';
    } else if (confidence >= 0.6) {
        colorClass = 'bg-yellow-50 text-yellow-800 border-yellow-200';
        iconColor = 'text-yellow-600';
        label = 'Rough Estimate';
    } else {
        colorClass = 'bg-orange-50 text-orange-800 border-orange-200';
        iconColor = 'text-orange-600';
        label = 'Low Confidence';
    }

    // Handle fallback or rush specifically
    if (method === 'rule_based_fallback' || method === 'client_fallback') {
        label = 'Approximate';
    }

    return (
        <div className={`flex flex-col gap-2 p-3 rounded-lg border ${colorClass} transition-all`}>
            {/* Main Prediction */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${iconColor}`} />
                    <span className="font-bold text-lg">Ready by {formattedTime}</span>
                </div>
                {rush_detected && (
                    <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                        <Zap className="w-3 h-3" />
                        <span>RUSH HOUR</span>
                    </div>
                )}
            </div>

            {/* Details Row */}
            <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-1" title="Estimated wait time">
                    <span>⏱ {Math.round(estimated_minutes)} min</span>
                </div>

                {queue_position > 0 && (
                    <div className="flex items-center gap-1" title="Orders ahead of you">
                        <Users className="w-3 h-3" />
                        <span>#{queue_position} in queue</span>
                    </div>
                )}

                <div className="flex items-center gap-1" title={`Confidence: ${(confidence * 100).toFixed(0)}%`}>
                    {confidence < 0.6 ? <AlertTriangle className="w-3 h-3" /> : null}
                    <span className="text-xs">{label}</span>
                </div>
            </div>
        </div>
    );
};

export default PredictionBadge;
