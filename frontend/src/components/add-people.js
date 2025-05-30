import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FaArrowLeft, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function AddPeople() {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    department: '',
    home_address: '',
    phone_number: '',
    email: '',
    occupation: '',
    education: '',
    interests: '',
    hobbies: '',
    bio: '',
    faceImage: null
  });
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'faceImage') {
      setFormData({ ...formData, [name]: files[0] });
      setCapturedImage(null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleWebcam = () => {
    setShowWebcam(!showWebcam);
    if (showWebcam) {
      setCapturedImage(null);
    }
  };

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
          setFormData(prev => ({ ...prev, faceImage: file }));
        });
    }
  }, [webcamRef]);

  const resetCapture = () => {
    setCapturedImage(null);
    setFormData(prev => ({ ...prev, faceImage: null }));
  };

  // For adding a new person
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.faceImage && !capturedImage) {
      toast.error("Please provide a face image", {
        icon: "🖼️"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const response = await fetch('/api/people', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${formData.full_name} has been added successfully!`, {
          icon: "➕"
        });
        // Clear form or navigate
        navigate('/dashboard');
      } else {
        toast.error(`Failed to add person: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="max-w-4xl mx-auto p-8 bg-slate-800 shadow-xl rounded-xl border border-slate-700">
          <h2 className="text-3xl font-bold mb-6 text-white text-center">Add Person Record</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input 
              type="text" 
              name="full_name" 
              placeholder="Full Name" 
              value={formData.full_name} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
              required 
            />
            
            <input 
              type="number" 
              name="age" 
              placeholder="Age" 
              value={formData.age} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />

            <input 
              type="text" 
              name="department" 
              placeholder="Department" 
              value={formData.department} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />
            
            <input 
              type="text" 
              name="home_address" 
              placeholder="Home Address" 
              value={formData.home_address} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />

            <input 
              type="tel" 
              name="phone_number" 
              placeholder="Phone Number" 
              value={formData.phone_number} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />
            
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />

            <input 
              type="text" 
              name="occupation" 
              placeholder="Occupation" 
              value={formData.occupation} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />
            
            <input 
              type="text" 
              name="education" 
              placeholder="Education" 
              value={formData.education} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />

            <textarea 
              name="interests" 
              placeholder="Interests" 
              value={formData.interests} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />
            
            <textarea 
              name="hobbies" 
              placeholder="Hobbies" 
              value={formData.hobbies} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
            />

            <textarea 
              name="bio" 
              placeholder="Bio" 
              value={formData.bio} 
              onChange={handleChange} 
              className="p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent md:col-span-2" 
            />

            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="font-semibold text-teal-300">Face Image:</label>
                  <button 
                    type="button"
                    onClick={toggleWebcam}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                      showWebcam 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-teal-600 hover:bg-teal-700'
                    } text-white transition-colors`}
                  >
                    <FaCamera className="mr-2" />
                    {showWebcam ? 'Turn Off Camera' : 'Use Webcam'}
                  </button>
                </div>
                
                {showWebcam && (
                  <div className="bg-slate-700 p-6 rounded-lg flex flex-col items-center space-y-4 border border-slate-600">
                    {!capturedImage ? (
                      <>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full max-w-md border-2 border-slate-600 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={captureImage}
                          className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-md shadow-md"
                        >
                          Capture Photo
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="font-medium text-teal-300 mb-2">Image Captured!</div>
                        <img
                          src={capturedImage}
                          alt="Captured"
                          className="w-full max-w-md border-2 border-slate-600 rounded-md"
                        />
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={resetCapture}
                            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-md shadow-md"
                          >
                            Retake Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {(!showWebcam || !capturedImage) && !formData.faceImage && (
                  <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
                    <label className="block mb-3 font-semibold text-teal-300">Upload Face Image</label>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/bmp" 
                      name="faceImage" 
                      onChange={handleChange} 
                      className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-teal-600 file:text-white
                        hover:file:bg-teal-500"
                      required={!capturedImage} 
                    />
                  </div>
                )}
                
                {!capturedImage && formData.faceImage && (
                  <div className="text-teal-300 bg-slate-700 p-4 rounded-lg border border-slate-600">
                    Selected file: <span className="font-semibold">{formData.faceImage.name}</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="md:col-span-2 bg-teal-600 text-white py-3 px-6 rounded-xl hover:bg-teal-500 transition-all duration-300 flex justify-center items-center shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Face...
                </>
              ) : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}