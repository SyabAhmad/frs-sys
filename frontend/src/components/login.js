import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa'; // Using react-icons

// Placeholder for API call
const loginUser = async (email, password) => {
  console.log('Attempting to login with:', { email, password });
  // Replace with your actual API call
  // Example:
  // const response = await fetch('/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!response.ok) {
  //   const errorData = await response.json();
  //   throw new Error(errorData.message || 'Login failed');
  // }
  // return response.json();

  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "test@example.com" && password === "password") {
        resolve({ success: true, message: "Login successful!", token: "fake-jwt-token" });
      } else {
        reject(new Error("Invalid email or password."));
      }
    }, 1000);
  });
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleMessage, setGoogleMessage] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setGoogleMessage('');
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      console.log('Login successful:', data);
      // Handle successful login (e.g., redirect, store token)
      alert(data.message); // Replace with actual success handling
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setGoogleMessage('Google login is not yet supported. Please use email and password.');
    // Future implementation for Google OAuth
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-700 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">Please login to access your account.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
        {googleMessage && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-sm">
            {googleMessage}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-purple-600 hover:text-pink-500 transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-purple-600 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300 ease-in-out disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <FaGoogle className="mr-2 text-red-500" />
              Sign in with Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-purple-600 hover:text-pink-500 transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;