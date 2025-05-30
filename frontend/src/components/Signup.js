import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// API call function with more detailed error handling
const registerUser = async (name, email, password) => {
  const response = await fetch('http://localhost:5000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: name, email: email, password: password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      message: data.error || 'Registration failed',
      field: data.field || null
    };
  }
  
  return data;
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors({...errors, name: null});
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({...errors, email: null});
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors({...errors, password: null});
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors({...errors, confirmPassword: null});
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    
    // Validation
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "User name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(name, email, password);
      setSuccessMessage(data.message + " Redirecting to login...");
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 2000); 
    } catch (err) {
      if (err.field === 'email') {
        setErrors({...errors, email: err.message});
      } else if (err.field === 'username') {
        setErrors({...errors, name: err.message});
      } else {
        setErrors({...errors, general: err.message || 'Failed to register. Please try again.'});
      }
    } finally {
      setLoading(false);
    }
  };


  // For registration
  const handleRegisterSubmit = async (userData) => {
    try {
      await registerUser(userData);
      toast.success('Registration successful! Please log in.', {
        icon: "✅"
      });
      navigate('/login');
    } catch (error) {
      toast.error(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Create Account
          </h1>
          <p className="text-slate-300 text-sm mt-1">Please fill in your information below</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-rose-900 text-rose-200 border border-rose-800 rounded text-sm">
            {errors.general}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-900 text-emerald-200 border border-emerald-800 rounded text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
              User Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={handleNameChange}
                className={`w-full pl-10 pr-3 py-2 bg-slate-700 border ${errors.name ? 'border-rose-500' : 'border-slate-600'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-white placeholder-slate-400`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-3 py-2 bg-slate-700 border ${errors.email ? 'border-rose-500' : 'border-slate-600'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-white placeholder-slate-400`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={handlePasswordChange}
                className={`w-full pl-10 pr-3 py-2 bg-slate-700 border ${errors.password ? 'border-rose-500' : 'border-slate-600'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-white placeholder-slate-400`}
                placeholder="Minimum 6 characters"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full pl-10 pr-3 py-2 bg-slate-700 border ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-600'} rounded focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent text-white placeholder-slate-400`}
                placeholder="Confirm your password"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded bg-teal-600 text-white font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors duration-300"
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;