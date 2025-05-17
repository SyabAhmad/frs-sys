import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ScanFace = () => {
  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Turn camera on/off based on cameraActive state
  useEffect(() => {
    const startCamera = async () => {
      if (cameraActive) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
          setStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setCameraActive(false);
        }
      } else if (stream) {
        // Stop all tracks when camera is turned off
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    if (image) setImage(null); // Clear captured image when toggling camera
  };

  const capture = () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl);
    
    // Here you would typically send this image to your backend for processing
    console.log("Image captured, ready to send to backend");
  };

  // Only update the processImage function to connect with our backend
  const processImage = async () => {
    if (!image) return;
    
    setProcessing(true);
    
    try {
      // Prepare the image data for sending to backend
      // We convert the data URL to a base64 string the backend can process
      const base64Image = image.split(',')[1];
      
      // Call the recognition API
      const response = await fetch('http://localhost:5000/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process image');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error processing image:', error);
      setResult({
        recognized: false,
        error: error.message || 'Failed to process image'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold text-purple-700">Face Scanner</h1>
          <button
            onClick={handleBack}
            className="py-2 px-4 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="relative mb-4 bg-black rounded-lg overflow-hidden" style={{ height: cameraActive ? 'auto' : '300px' }}>
            {/* Camera placeholder when inactive */}
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p>Camera is turned off</p>
                </div>
              </div>
            )}
            
            {/* Video display */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              className={`w-full h-auto ${!cameraActive ? 'hidden' : ''}`}
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            
            {/* Hidden canvas for capturing images */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera controls */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={toggleCamera}
              className={`py-2 px-4 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                cameraActive 
                ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500' 
                : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
              }`}
            >
              {cameraActive ? '🔴 Turn Camera Off' : '🟢 Turn Camera On'}
            </button>
            
            <button
              onClick={capture}
              disabled={!cameraActive}
              className={`py-2 px-4 font-medium rounded-lg transition-colors ${
                cameraActive
                ? 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📸 Capture Image
            </button>
            
            {image && (
              <button
                onClick={() => setImage(null)}
                className="py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
              >
                ↻ Reset
              </button>
            )}
          </div>

          {image && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Captured Image:</h3>
              <div className="bg-gray-100 p-2 rounded-lg">
                <img 
                  src={image} 
                  alt="Captured" 
                  className="max-w-full rounded-lg mx-auto" 
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <div className="mt-2 text-center">
                <button
                  onClick={processImage}
                  disabled={processing}
                  className={`py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? 'Processing...' : 'Process Image'}
                </button>
              </div>
            </div>
          )}

          {/* Recognition Results */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${result.recognized ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className="font-medium text-lg mb-2">
                {result.recognized ? 'Person Identified' : 'No Match Found'}
              </h3>
              
              {result.recognized ? (
                <div>
                  <p><strong>Name:</strong> {result.user.name}</p>
                  <p><strong>Department:</strong> {result.user.department}</p>
                  <div className="mt-2">
                    <button
                      onClick={handleBack}
                      className="py-1 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <p>{result.error || "Could not identify the person in the image."}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanFace;