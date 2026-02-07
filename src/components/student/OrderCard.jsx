import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Pending',
      description: 'Waiting for vendor confirmation'
    },
    confirmed: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Confirmed',
      description: 'Order accepted by vendor'
    },
    preparing: {
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      label: 'Preparing',
      description: 'Your order is being prepared'
    },
    ready: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Ready for Pickup',
      description: 'Your order is ready!'
    },
    collected: {
      icon: CheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      label: 'Collected',
      description: 'Order picked up successfully'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Cancelled',
      description: 'Order has been cancelled'
    },
    expired: {
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      label: 'Expired',
      description: 'Pickup window expired'
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!order.pickupWindow) return null;
    
    const now = new Date();
    const pickupTime = new Date(order.pickupWindow.start);
    const diffMs = pickupTime - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) {
      const overdueMins = Math.abs(diffMins);
      return `Overdue by ${overdueMins} min${overdueMins !== 1 ? 's' : ''}`;
    }
    
    if (diffMins < 60) {
      return `In ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `In ${hours}h ${mins}m`;
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const timeRemaining = getTimeRemaining();

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
      {/* Order Header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">
              {order.vendor?.businessName || 'Vendor'}
            </h3>
            <p className="text-sm text-gray-500">
              Order #{order.orderNumber}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
              <status.icon className="w-3 h-3 inline mr-1" />
              {status.label}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Timing Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Pickup Time</div>
              <div className="font-medium">
                {order.pickupWindow ? (
                  <>
                    {formatTime(order.pickupWindow.start)}
                    <span className="text-gray-400 mx-1">-</span>
                    {formatTime(order.pickupWindow.end)}
                  </>
                ) : (
                  '--:--'
                )}
              </div>
              {timeRemaining && (
                <div className={`text-xs ${timeRemaining.startsWith('Overdue') ? 'text-red-600' : 'text-blue-600'}`}>
                  {timeRemaining}
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Pickup Location</div>
              <div className="font-medium">
                Counter {order.counterNumber || 'A'}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                {order.vendor?.location || 'Vendor Location'}
              </div>
            </div>
          </div>

          {/* Order Value */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Order Value</div>
              <div className="font-bold text-lg">₹{order.totalAmount?.toFixed(2) || '0.00'}</div>
              <div className="text-xs text-gray-500">
                {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            to={`/track-order/${order.id}`}
            className="flex-1 min-w-[120px] px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Track Order</span>
          </Link>
          
          <Link
            to={`/order/${order.id}/qr`}
            className="flex-1 min-w-[120px] px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR</span>
          </Link>
          
          {order.status === 'ready' && (
            <button className="flex-1 min-w-[120px] px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
              I've Picked Up
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t px-4 py-4 bg-gray-50 rounded-b-xl">
          {/* Items List */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Items</h4>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.imageUrl || '/api/placeholder/100/100'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Order Timeline</h4>
            <div className="space-y-3">
              {order.timeline?.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    event.status === 'completed' ? 'bg-green-500' : 
                    event.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className={`font-medium ${
                        event.status === 'completed' ? 'text-green-700' : 
                        event.status === 'current' ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {event.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          {order.payment && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Payment</h4>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <div>
                  <div className="font-medium">{order.payment.method}</div>
                  <div className="text-sm text-gray-500">
                    {order.payment.status === 'paid' ? 'Paid' : 'Pending'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{order.totalAmount?.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(order.payment.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Accuracy */}
          {order.predictionAccuracy && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Prediction Accuracy</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  order.predictionAccuracy.error <= 3 
                    ? 'bg-green-100 text-green-700' 
                    : order.predictionAccuracy.error <= 5
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {order.predictionAccuracy.error <= 3 ? 'Excellent' : 
                   order.predictionAccuracy.error <= 5 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Predicted: {formatTime(order.predictedReadyTime)} • 
                Actual: {order.actualReadyTime ? formatTime(order.actualReadyTime) : '--:--'} • 
                Difference: {order.predictionAccuracy?.error || 0} min
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;