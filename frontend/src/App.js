import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import Login from './components/login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AddPeople from './components/add-people';
import ScanPeople from './components/scan-people';
import RemovePeople from './components/RemovePeople';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route that redirects to dashboard if already logged in
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// A wrapper component is needed to use the useAuth hook
// because App itself is where Router is defined.
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location
  
  // Update this line to include /scan-people in the hideHeader list
  const hideHeader = ['/dashboard', '/scan-people', '/add-people', "/remove-people"].includes(location.pathname);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // This function will be passed to Header
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Only render Header if not on dashboard, scan, or add-user pages */}
      {!hideHeader && (
        <Header 
          scrollToSection={scrollToSection} 
          navigateTo={handleNavigate}
        />
      )}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/signup" element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/scan-people" element={
            <ProtectedRoute>
              <ScanPeople />
            </ProtectedRoute>
          } />
          <Route path="/add-people" element={
            <ProtectedRoute>
              <AddPeople />
            </ProtectedRoute>
          } />
          <Route path="/remove-people" element={
            <ProtectedRoute>
              <RemovePeople />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;