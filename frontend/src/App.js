import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import Login from './components/login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AddPeople from './components/add-people';
import ScanPeople from './components/scan-people'; // Import the new component

// A wrapper component is needed to use the useNavigate hook
// because App itself is where Router is defined.
const AppContent = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location
  
  // Update this line to include /scan-people in the hideHeader list
  const hideHeader = ['/dashboard', '/scan-people', '/add-people'].includes(location.pathname);

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
          <Route path="/scan-people" element={<ScanPeople />} /> {/* Add this new route */}
          <Route path="/add-people" element={<AddPeople />} />
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