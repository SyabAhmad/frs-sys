import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FaArrowLeft } from 'react-icons/fa';

export default function ScanPeople() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Capture image from webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setScanResult(null);
      setScanError(null);
    }
  }, [webcamRef]);

  // Reset captured image
  const resetCapture = () => {
    setCapturedImage(null);
    setScanResult(null);
    setScanError(null);
  };

  // Handle scanning the captured image
  const handleScan = async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create form data with the captured image
      const formData = new FormData();
      formData.append('faceImage', blob, 'captured-face.jpg');
      
      // Send the image to the backend for scanning/recognition
      const scanResponse = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        body: formData
      });
      
      const data = await scanResponse.json();
      
      if (scanResponse.ok) {
        setScanResult(data);
      } else {
        setScanError(data.error || 'Failed to recognize face');
      }
    } catch (error) {
      console.error('Error during face scanning:', error);
      setScanError('An error occurred during face scanning');
    } finally {
      setIsScanning(false);
    }
  };

  // Navigate back to dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Custom Header */}
      <div className="bg-slate-800 text-white p-4 shadow-md border-b border-slate-700">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold">Face Recognition System</h2>
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-300"
          >
            <FaArrowLeft className="mr-1" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto p-8 bg-slate-800 shadow-xl rounded-xl border border-slate-700">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">Scan Face</h2>
          
          <div className="flex flex-col items-center space-y-8">
            {/* Webcam or Captured Image */}
            <div className="w-full max-w-xl bg-slate-700 p-6 rounded-lg shadow-lg border border-slate-600">
              {!capturedImage ? (
                <div className="flex flex-col items-center space-y-6">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-md border-2 border-slate-600"
                  />
                  <button
                    onClick={captureImage}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-md"
                  >
                    Capture Image
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6">
                  <img 
                    src={capturedImage}
                    alt="Captured" 
                    className="w-full rounded-md border-2 border-slate-600"
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={resetCapture}
                      className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors shadow-md"
                    >
                      Retake
                    </button>
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className={`px-6 py-3 rounded-lg text-white transition-colors shadow-md ${
                        isScanning 
                          ? 'bg-amber-700 cursor-not-allowed' 
                          : 'bg-amber-600 hover:bg-amber-500'
                      }`}
                    >
                      {isScanning ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Scanning...
                        </div>
                      ) : 'Scan Face'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scan Results Area */}
            {scanResult && (
              <div className="w-full max-w-xl bg-emerald-900 p-6 rounded-lg border border-emerald-700 shadow-lg">
                <h3 className="text-xl font-bold text-emerald-300 mb-4">Match Found!</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="font-semibold text-emerald-200">Name:</div>
                  <div className="text-white">{scanResult.full_name}</div>
                  
                  <div className="font-semibold text-emerald-200">Department:</div>
                  <div className="text-white">{scanResult.department || 'N/A'}</div>
                  
                  <div className="font-semibold text-emerald-200">Email:</div>
                  <div className="text-white">{scanResult.email || 'N/A'}</div>
                  
                  <div className="font-semibold text-emerald-200">Phone:</div>
                  <div className="text-white">{scanResult.phone_number || 'N/A'}</div>
                  
                  <div className="font-semibold text-emerald-200">Confidence:</div>
                  <div className="text-white">{(scanResult.confidence * 100).toFixed(2)}%</div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {scanError && (
              <div className="w-full max-w-xl bg-rose-900 p-6 rounded-lg border border-rose-700 shadow-lg">
                <p className="text-rose-200">{scanError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}