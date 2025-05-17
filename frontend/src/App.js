import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import Login from './components/login';
import Signup from './components/Signup'; // Import the Signup component

// A wrapper component is needed to use the useNavigate hook
// because App itself is where Router is defined.
const AppContent = () => {
  const navigate = useNavigate(); // Hook for navigation

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
    <div className="flex flex-col min-h-screen bg-gray-50"> {/* Ensures footer can be at bottom */}
      <Header scrollToSection={scrollToSection} navigateTo={handleNavigate} />
      <main className="flex-grow"> {/* Allows content to fill space */}
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} /> {/* Add Signup route */}
          {/* Add other routes like /scan etc. here */}
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