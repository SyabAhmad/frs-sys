import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import Login from './components/login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ScanFace from './components/ScanFace';
import AddUser from './components/AddUser';

// A wrapper component is needed to use the useNavigate hook
// because App itself is where Router is defined.
const AppContent = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location
  
  // Check if current path should have header
  const hideHeader = ['/dashboard', '/scan', '/add-user'].includes(location.pathname);

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
        <Header scrollToSection={scrollToSection} navigateTo={handleNavigate} />
      )}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ScanFace />} />
          <Route path="/add-user" element={<AddUser />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;