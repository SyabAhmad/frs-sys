import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    address: '',
    department: '',
    occupation: '',
    gender: '',
    details: ''
  });
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    if (image) setImage(null);
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
    setUserImagePreview(dataUrl);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setUserImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Only update the handleSubmit function to connect with our new backend endpoint

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userImagePreview) {
      setError('Please provide an image for the user');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare form data for submission
      const formData = new FormData();
      
      // Add all user fields to the form data
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('address', newUser.address || '');
      formData.append('department', newUser.department || '');
      formData.append('occupation', newUser.occupation || '');
      formData.append('gender', newUser.gender || '');
      formData.append('details', newUser.details || '');
      
      // Add image to form data
      if (userImage) {
        // If we have a file object
        formData.append('image', userImage);
      } else if (userImagePreview) {
        // If we have a data URL, convert to blob first
        const response = await fetch(userImagePreview);
        const blob = await response.blob();
        formData.append('image', blob, 'user_image.jpg');
      }
      
      // Send to backend
      const response = await fetch('http://localhost:5000/add-user', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add user');
      }
      
      const data = await response.json();
      
      // Navigate back to dashboard after successful submission
      navigate('/dashboard', { 
        state: { 
          notification: {
            type: 'success',
            message: `User ${newUser.name} was successfully added!`
          }
        }
      });
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.message || 'Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto pt-4">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold text-purple-700">Add New User</h1>
          <button
            onClick={handleCancel}
            className="py-2 px-4 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User details section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">User Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newUser.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={newUser.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={newUser.occupation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Job title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={newUser.gender === 'male'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={newUser.gender === 'female'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2">Female</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={newUser.gender === 'other'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2">Other</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    name="details"
                    value={newUser.details}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Any additional information"
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Image capture section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">User Image</h2>
                
                {userImagePreview ? (
                  <div className="mb-4 text-center">
                    <img 
                      src={userImagePreview}
                      alt="User preview" 
                      className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-purple-300"
                    />
                    <button
                      type="button"
                      onClick={() => setUserImagePreview('')}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-lg text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-500">No image selected</p>
                  </div>
                )}
                
                <div className="flex space-x-2 mb-4">
                  <label className="flex-1">
                    <div className="py-2 px-3 bg-gray-200 text-center rounded-lg cursor-pointer hover:bg-gray-300 transition-colors">
                      Upload Image
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`flex-1 py-2 px-3 text-white rounded-lg transition-colors ${
                      cameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {cameraActive ? 'Hide Camera' : 'Use Camera'}
                  </button>
                </div>
                
                {cameraActive && (
                  <div className="mt-4 space-y-2">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        className="w-full h-auto"
                        style={{ maxHeight: '240px', objectFit: 'cover' }}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={capture}
                      className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Capture Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Adding User...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;