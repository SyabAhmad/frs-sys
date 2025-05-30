import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ScanPeople() {
  const [capturedImages, setCapturedImages] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const webcamRef = useRef(null);
  const captureInterval = useRef(null);
  const navigate = useNavigate();

  // Start automatic image capture when component mounts
  useEffect(() => {
    // Wait a bit for webcam to initialize
    const timeoutId = setTimeout(() => {
      startCapturing();
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      if (captureInterval.current) {
        clearInterval(captureInterval.current);
      }
    };
  }, []);

  const startCapturing = () => {
    // Capture and send image every 3 seconds
    captureInterval.current = setInterval(() => {
      if (webcamRef.current && !isScanning) {
        captureAndSendImage();
      }
    }, 3000);
  };

  const captureAndSendImage = async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    
    // Store the captured image (without result data yet)
    const newCapture = { 
      src: imageSrc, 
      timestamp: new Date().toISOString(),
      processing: true
    };
    
    // Add new image to the array and keep only the last 3
    setCapturedImages(prevImages => {
      const newImages = [...prevImages, newCapture];
      if (newImages.length > 3) {
        return newImages.slice(1);
      }
      return newImages;
    });
    
    // Send to server for recognition and update the capture with results
    const result = await scanFace(imageSrc);
    
    // Update the captured image with recognition results
    setCapturedImages(prevImages => {
      const updatedImages = [...prevImages];
      const lastIndex = updatedImages.length - 1;
      
      if (lastIndex >= 0) {
        updatedImages[lastIndex] = {
          ...updatedImages[lastIndex],
          processing: false,
          recognitionData: result.success ? result.data : null,
          error: result.success ? null : result.error
        };
      }
      
      return updatedImages;
    });
  };

  // For face recognition results
  const scanFace = async (faceBlob) => {
    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch(faceBlob);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('faceImage', blob, 'captured-face.jpg');
      
      const scanResponse = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        body: formData
      });
      
      const data = await scanResponse.json();
      
      if (scanResponse.ok) {
        // If faces were recognized
        if (data.length > 0 || data.recognized_people?.length > 0) {
          toast.success(`${Array.isArray(data) ? data.length : 1} person(s) recognized!`, {
            icon: "👤"
          });
        }
        return { success: true, data: Array.isArray(data) ? data[0] : data };
      } else {
        const errorMsg = data.error || 'Failed to recognize face';
        toast.warn(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      toast.error('An error occurred during face scanning');
      console.error('Error during face scanning:', error);
      const errorMsg = 'An error occurred during face scanning';
      setScanError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsScanning(false);
    }
  };

  // Format the timestamp to a readable date/time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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
        <div className="max-w-6xl mx-auto p-8 bg-slate-800 shadow-xl rounded-xl border border-slate-700">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">Automatic Face Recognition</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Camera */}
            <div className="w-full md:w-1/2 flex flex-col space-y-6">
              <div className="bg-slate-700 p-6 rounded-lg shadow-lg border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Live Camera</h3>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-md border-2 border-slate-600"
                />
                <div className="mt-4 text-center text-sm text-slate-300">
                  {isScanning ? 'Processing face...' : 'Continuous scanning active'}
                </div>
              </div>
            </div>
            
            {/* Right side - Results and Captured Images with recognition data */}
            <div className="w-full md:w-1/2 flex flex-col space-y-6">
              {/* Recognition Results */}
              <div className="bg-slate-700 p-6 rounded-lg shadow-lg border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Recognition Results</h3>
                
                {isScanning && (
                  <div className="flex items-center justify-center p-6">
                    <svg className="animate-spin h-10 w-10 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg">Processing...</span>
                  </div>
                )}
                
                {scanResult && !isScanning && (
                  <div className="bg-emerald-900 p-6 rounded-lg border border-emerald-700 shadow-lg">
                    <h3 className="text-xl font-bold text-emerald-300 mb-4">
                      {scanResult.length > 1 ? `${scanResult.length} Matches Found!` : "Match Found!"}
                    </h3>
                    
                    {scanResult.map((person, index) => (
                      <div key={index} className="mb-4 pb-4 border-b border-emerald-700 last:border-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="font-semibold text-emerald-200">Name:</div>
                          <div className="text-white">{person.full_name}</div>
                          
                          <div className="font-semibold text-emerald-200">Department:</div>
                          <div className="text-white">{person.department || 'N/A'}</div>
                          
                          <div className="font-semibold text-emerald-200">Email:</div>
                          <div className="text-white">{person.email || 'N/A'}</div>
                          
                          <div className="font-semibold text-emerald-200">Phone:</div>
                          <div className="text-white">{person.phone_number || 'N/A'}</div>
                          
                          <div className="font-semibold text-emerald-200">Confidence:</div>
                          <div className="text-white">{(person.confidence * 100).toFixed(2)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {scanError && !isScanning && (
                  <div className="bg-rose-900 p-6 rounded-lg border border-rose-700 shadow-lg">
                    <p className="text-rose-200">{scanError}</p>
                  </div>
                )}
                
                {!scanResult && !scanError && !isScanning && (
                  <div className="flex items-center justify-center h-32 text-slate-400">
                    <p>Waiting for face detection...</p>
                  </div>
                )}
              </div>
              
              {/* Captured Images with their recognition data */}
              {capturedImages.length > 0 && (
                <div className="bg-slate-700 p-6 rounded-lg shadow-lg border border-slate-600">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Captures</h3>
                  <div className="flex flex-col space-y-6">
                    {/* Display images in reverse order (newest at top) */}
                    {[...capturedImages].reverse().map((img, index) => (
                      <div key={index} className={`bg-slate-800 rounded-lg overflow-hidden border ${
                        img.processing ? 'border-amber-500' : 
                        img.recognitionData ? 'border-emerald-600' : 'border-rose-600'
                      }`}>
                        {/* Two-column layout for each capture */}
                        <div className="flex flex-col md:flex-row">
                          {/* Image column */}
                          <div className="md:w-2/5">
                            <div className="relative">
                              <img 
                                src={img.src} 
                                alt={`Capture ${capturedImages.length - index}`} 
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-slate-800 bg-opacity-75 px-3 py-2 text-xs">
                                <div className="flex items-center">
                                  <FaClock className="mr-1 text-amber-400" size={12} />
                                  <span>{formatTimestamp(img.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Recognition data column */}
                          <div className="p-4 md:w-3/5">
                            {img.processing && (
                              <div className="flex items-center text-amber-400">
                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                              </div>
                            )}
                            
                            {!img.processing && img.recognitionData && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <FaCheckCircle className="text-emerald-400 mr-2" />
                                  <h4 className="text-emerald-300 font-bold">Match Found</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <div className="text-slate-400">Name:</div>
                                  <div className="text-white">{img.recognitionData.full_name}</div>
                                  
                                  <div className="text-slate-400">Department:</div>
                                  <div className="text-white">{img.recognitionData.department || 'N/A'}</div>
                                  
                                  <div className="text-slate-400">Confidence:</div>
                                  <div className="text-white">{(img.recognitionData.confidence * 100).toFixed(2)}%</div>
                                </div>
                              </div>
                            )}
                            
                            {!img.processing && img.error && (
                              <div>
                                <div className="flex items-center mb-2">
                                  <FaTimesCircle className="text-rose-400 mr-2" />
                                  <h4 className="text-rose-300 font-bold">No Match</h4>
                                </div>
                                <p className="text-rose-200 text-sm">{img.error}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}