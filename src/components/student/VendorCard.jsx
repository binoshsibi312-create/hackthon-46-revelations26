import React, { useState } from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Users, 
  Zap, 
  ChevronRight,
  Coffee,
  Utensils,
  Pizza,
  IceCream
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PredictionBadge from './PredictionBadge';

const VendorCard = ({ vendor }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get vendor category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'coffee':
      case 'beverages':
        return Coffee;
      case 'food':
      case 'meals':
        return Utensils;
      case 'pizza':
      case 'fast food':
        return Pizza;
      case 'desserts':
      case 'ice cream':
        return IceCream;
      default:
        return Utensils;
    }
  };

  // Format average wait time
  const formatWaitTime = (minutes) => {
    if (!minutes) return '-- min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Calculate busy level
  const getBusyLevel = (load) => {
    if (load >= 80) return { level: 'Very Busy', color: 'text-red-600', bg: 'bg-red-100' };
    if (load >= 60) return { level: 'Busy', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (load >= 40) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Not Busy', color: 'text-green-600', bg: 'bg-green-100' };
  };

  // Get preparation speed badge
  const getSpeedBadge = (avgTime) => {
    if (avgTime <= 5) return { text: 'Very Fast', color: 'bg-green-500' };
    if (avgTime <= 10) return { text: 'Fast', color: 'bg-blue-500' };
    if (avgTime <= 15) return { text: 'Moderate', color: 'bg-yellow-500' };
    return { text: 'Slow', color: 'bg-red-500' };
  };

  const busyLevel = getBusyLevel(vendor.currentLoad || 0);
  const speedBadge = getSpeedBadge(vendor.avgPreparationTime || 15);
  const CategoryIcon = getCategoryIcon(vendor.category);

  return (
    <Link to={`/vendor/${vendor.id}`}>
      <div
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Vendor Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={vendor.imageUrl || '/api/placeholder/400/300'}
            alt={vendor.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <div className="flex flex-wrap gap-2">
              {/* Open Status */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                vendor.isOnline 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  vendor.isOnline ? 'animate-pulse bg-white' : 'bg-gray-300'
                }`}></div>
                {vendor.isOnline ? 'Open Now' : 'Closed'}
              </div>
              
              {/* Speed Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${speedBadge.color}`}>
                {speedBadge.text}
              </div>
              
              {/* Category Badge */}
              <div className="px-2 py-1 rounded-full bg-white/90 text-gray-800 text-xs font-medium flex items-center">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {vendor.category || 'Food'}
              </div>
            </div>
            
            {/* Rating */}
            <div className="px-2 py-1 rounded-full bg-black/70 text-white text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              {vendor.rating?.toFixed(1) || '4.5'}
            </div>
          </div>
          
          {/* Business Name */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-1">{vendor.businessName}</h3>
            <p className="text-sm text-gray-200 line-clamp-1">{vendor.description}</p>
          </div>
        </div>

        {/* Vendor Details */}
        <div className="p-4">
          {/* Location and Distance */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{vendor.location}</span>
            </div>
            <div className="text-xs text-gray-500">
              {vendor.distance ? `${vendor.distance} m away` : 'On Campus'}
            </div>
          </div>

          {/* Wait Time Prediction */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Estimated Wait</span>
              </div>
              <PredictionBadge 
                prediction={vendor.prediction}
                size="sm"
                interactive={false}
              />
            </div>
            
            {/* Prediction Breakdown */}
            {vendor.prediction?.breakdown && (
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Base prep:</span>
                  <span>{vendor.prediction.breakdown.baseTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Queue wait:</span>
                  <span>+{vendor.prediction.breakdown.queueEffect} min</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Busy Level */}
            <div className={`p-2 rounded-lg ${busyLevel.bg} text-center`}>
              <div className="text-xs text-gray-500 mb-1">Busy Level</div>
              <div className={`text-sm font-semibold ${busyLevel.color}`}>
                {busyLevel.level}
              </div>
            </div>
            
            {/* Active Orders */}
            <div className="p-2 rounded-lg bg-blue-50 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Users className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-500">Active Orders</span>
              </div>
              <div className="text-sm font-semibold text-blue-600">
                {vendor.currentActiveOrders || 0}
              </div>
            </div>
            
            {/* Avg Prep Time */}
            <div className="p-2 rounded-lg bg-green-50 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Zap className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-500">Avg Prep</span>
              </div>
              <div className="text-sm font-semibold text-green-600">
                {formatWaitTime(vendor.avgPreparationTime)}
              </div>
            </div>
          </div>

          {/* Special Features */}
          {vendor.features && vendor.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {vendor.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {vendor.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{vendor.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <div className="text-lg font-bold text-gray-800">
                ₹{vendor.minOrder || '50'}+
              </div>
              <div className="text-xs text-gray-500">Min. order</div>
            </div>
            
            <button className={`
              px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300
              ${isHovered 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }
            `}>
              <span>View Menu</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                isHovered ? 'translate-x-1' : ''
              }`} />
            </button>
          </div>

          {/* Prediction Accuracy */}
          {vendor.predictionAccuracy && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Prediction Accuracy</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    vendor.predictionAccuracy >= 90 ? 'bg-green-500' :
                    vendor.predictionAccuracy >= 80 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="font-medium">
                    {vendor.predictionAccuracy}% accurate
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Preview (on hover) */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-center text-white">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h4 className="text-lg font-bold mb-2">Smart Pre-Order Available</h4>
              <p className="text-sm text-gray-200 mb-4">
                Skip the queue with AI-powered time predictions
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{vendor.orderCount || 0}</div>
                  <div className="text-xs text-gray-300">Today's Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {vendor.fulfillmentRate || 95}%
                  </div>
                  <div className="text-xs text-gray-300">On-Time Rate</div>
                </div>
              </div>
              
              {/* Popular Items */}
              {vendor.popularItems && vendor.popularItems.length > 0 && (
                <div className="text-left">
                  <div className="text-sm font-medium mb-2">Popular Items:</div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {vendor.popularItems.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default VendorCard;