import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, CameraOff, Check, X, RotateCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QRScanner = ({ onScan, onClose, autoStart = true, mode = 'student' }) => {
  const [isScanning, setIsScanning] = useState(autoStart);
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize scanner
  useEffect(() => {
    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning, facingMode]);

  const startScanner = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setHasPermission(true);
      setCameraError(null);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start scanning loop
      requestAnimationFrame(scanFrame);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError(error.message);
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please enable camera access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Failed to access camera. Please try again.');
      }
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current || scannedData) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR detection (in production, use a proper QR library)
    // For now, we'll simulate detection
    detectQRCode(imageData);

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanFrame);
    }
  };

  const detectQRCode = (imageData) => {
    // In production, integrate with a QR library like jsQR
    // For now, we'll simulate detection after 2 seconds
    if (!scannedData && isScanning && Math.random() < 0.05) {
      simulateQRDetection();
    }
  };

  const simulateQRDetection = () => {
    // Simulate QR code detection with random order data
    const simulatedData = {
      orderId: `ORD${Date.now().toString().slice(-8)}`,
      token: Math.random().toString(36).substring(2, 10).toUpperCase(),
      vendorId: 'VEN001',
      studentId: 'STU' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      timestamp: new Date().toISOString()
    };
    
    setScannedData(simulatedData);
    setIsProcessing(true);
    
    // Process the scanned data
    setTimeout(() => {
      processScannedData(simulatedData);
    }, 1000);
  };

  const processScannedData = async (data) => {
    try {
      // In production, this would be an API call
      const response = await fetch('/api/orders/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('QR code verified successfully!');
        onScan?.(data, result);
      } else {
        toast.error(result.message || 'Invalid QR code');
        setScannedData(null);
      }
    } catch (error) {
      toast.error('Failed to verify QR code');
      setScannedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualInput = () => {
    const token = prompt('Enter order token or code:');
    if (token) {
      const simulatedData = {
        orderId: `ORD${Date.now().toString().slice(-8)}`,
        token: token.toUpperCase(),
        vendorId: 'VEN001',
        timestamp: new Date().toISOString()
      };
      
      setScannedData(simulatedData);
      processScannedData(simulatedData);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const resetScanner = () => {
    setScannedData(null);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      {/* Scanner Container */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {mode === 'student' ? 'Scan to Pickup' : 'Scan Order QR'}
              </h2>
              <p className="text-sm text-gray-300">
                {mode === 'student' 
                  ? 'Scan vendor QR to confirm pickup' 
                  : 'Scan student QR to verify order'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative">
          {/* Video Element */}
          <video
            ref={videoRef}
            className={`w-full h-96 object-cover ${!isScanning || !hasPermission ? 'hidden' : ''}`}
            muted
            playsInline
          />
          
          {/* Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanner Overlay */}
          {isScanning && hasPermission && !scannedData && (
            <div className="absolute inset-0">
              {/* Scanner Frame */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 border-2 border-blue-400 rounded-lg relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br"></div>
                  
                  {/* Scanning line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 animate-pulse rounded-full"></div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="absolute bottom-8 left-0 right-0 text-center text-white">
                <p className="text-lg font-medium mb-2">Align QR code within frame</p>
                <p className="text-sm text-gray-300">Hold steady for automatic detection</p>
              </div>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="h-96 flex flex-col items-center justify-center p-4">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Camera Error</h3>
              <p className="text-gray-300 text-center mb-4">{cameraError}</p>
              <button
                onClick={handleManualInput}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enter Token Manually
              </button>
            </div>
          )}

          {/* No Permission */}
          {hasPermission === false && (
            <div className="h-96 flex flex-col items-center justify-center p-4">
              <CameraOff className="w-16 h-16 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Camera Access Required</h3>
              <p className="text-gray-300 text-center mb-4">
                Please enable camera permissions in your browser settings
              </p>
              <button
                onClick={handleManualInput}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enter Token Manually
              </button>
            </div>
          )}

          {/* Processing/Scanned State */}
          {scannedData && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
              {isProcessing ? (
                <>
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Verifying QR Code</h3>
                  <p className="text-gray-300">Please wait...</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">QR Code Verified!</h3>
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 max-w-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="font-mono text-white">{scannedData.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token:</span>
                        <span className="font-mono text-white">{scannedData.token}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={resetScanner}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Scan Another
                    </button>
                    <button
                      onClick={() => onClose?.()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {/* Toggle Camera Button */}
              <button
                onClick={toggleCamera}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Switch Camera"
              >
                <RotateCw className="w-5 h-5 text-white" />
              </button>
              
              {/* Toggle Scanner Button */}
              <button
                onClick={() => setIsScanning(!isScanning)}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {isScanning ? (
                  <CameraOff className="w-5 h-5 text-white" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              
              {/* Manual Input Button */}
              <button
                onClick={handleManualInput}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Enter Token Manually"
              >
                <span className="text-white font-medium">#</span>
              </button>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                hasPermission === true && isScanning 
                  ? 'bg-green-500 animate-pulse' 
                  : hasPermission === false 
                  ? 'bg-red-500' 
                  : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-300">
                {hasPermission === true && isScanning 
                  ? 'Scanning...' 
                  : hasPermission === false 
                  ? 'Camera Off' 
                  : 'Ready'}
              </span>
            </div>
          </div>

          {/* Instructions for Students */}
          {mode === 'student' && (
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-300 mb-1">How to pick up:</h4>
              <ol className="text-xs text-blue-200 space-y-1">
                <li>1. Go to the vendor's pickup counter</li>
                <li>2. Ask the vendor to show their QR code</li>
                <li>3. Scan the QR code with this scanner</li>
                <li>4. Show confirmation to collect your order</li>
              </ol>
            </div>
          )}

          {/* Instructions for Vendors */}
          {mode === 'vendor' && (
            <div className="mt-4 p-3 bg-green-900/30 rounded-lg">
              <h4 className="text-sm font-medium text-green-300 mb-1">How to verify:</h4>
              <ol className="text-xs text-green-200 space-y-1">
                <li>1. Ask student to show their order QR code</li>
                <li>2. Scan the QR code with this scanner</li>
                <li>3. Verify order details match</li>
                <li>4. Mark order as collected if verified</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;