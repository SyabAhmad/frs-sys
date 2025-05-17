import React, { useState } from 'react';

const Header = ({ scrollToSection, navigateTo }) => { // Added navigateTo prop
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isAuthenticated = () => {
    // Replace with your actual authentication logic
    return false;
  };

  const handleScanFace = () => {
    // Replace with your actual scan face logic, e.g., navigation
    console.log('Scan Face button clicked');
    // If this should navigate, you could use navigateTo here too:
    // if (navigateTo) navigateTo('/scan'); 
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (scrollToSection) {
      scrollToSection(sectionId);
    }
    if (isMenuOpen) { // Close mobile menu after click
      setIsMenuOpen(false);
    }
  };

  const handleLoginNavigation = (e) => {
    e.preventDefault(); // Prevent default anchor action
    if (navigateTo) {
      navigateTo('/login'); // Use the passed navigateTo function
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Add a similar handler for logout if needed
  const handleLogout = (e) => {
    e.preventDefault();
    // Implement logout logic (e.g., clear token, update auth state)
    console.log('Logout clicked');
    // Optionally navigate after logout:
    // if (navigateTo) navigateTo('/'); 
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };


  return (
    <nav className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Title */}
          <div 
            className="text-2xl md:text-3xl font-bold text-white cursor-pointer"
            onClick={(e) => handleNavClick(e, 'hero')}
          >
            <i className="fas fa-face-recognition mr-2"></i>
            Face Recognition
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="text-pink-100 hover:text-white transition duration-300">
              Home
            </a>
            <a href="#workflow" onClick={(e) => handleNavClick(e, 'workflow')} className="text-pink-100 hover:text-white transition duration-300">
              How It Works
            </a>
            <a href="#about-us" onClick={(e) => handleNavClick(e, 'about-us')} className="text-pink-100 hover:text-white transition duration-300">
              About Us
            </a>
            <a href="#team" onClick={(e) => handleNavClick(e, 'team')} className="text-pink-100 hover:text-white transition duration-300">
              Team
            </a>
            <a href="#contact-us" onClick={(e) => handleNavClick(e, 'contact-us')} className="text-pink-100 hover:text-white transition duration-300">
              Contact Us
            </a>
            <button
              onClick={handleScanFace}
              className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Scan Face
            </button>
            {isAuthenticated() ? (
              <a href="#" onClick={handleLogout} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
                Logout
              </a>
            ) : (
              <a href="/login" onClick={handleLoginNavigation} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
                Login
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-pink-100 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#hero" onClick={(e) => handleNavClick(e, 'hero')} className="block text-pink-100 hover:text-white px-3 py-2 rounded-md text-base font-medium">Home</a>
            <a href="#workflow" onClick={(e) => handleNavClick(e, 'workflow')} className="block text-pink-100 hover:text-white px-3 py-2 rounded-md text-base font-medium">How It Works</a>
            <a href="#about-us" onClick={(e) => handleNavClick(e, 'about-us')} className="block text-pink-100 hover:text-white px-3 py-2 rounded-md text-base font-medium">About Us</a>
            <a href="#team" onClick={(e) => handleNavClick(e, 'team')} className="block text-pink-100 hover:text-white px-3 py-2 rounded-md text-base font-medium">Team</a>
            <a href="#contact-us" onClick={(e) => handleNavClick(e, 'contact-us')} className="block text-pink-100 hover:text-white px-3 py-2 rounded-md text-base font-medium">Contact Us</a>
            <button
              onClick={() => { handleScanFace(); if (isMenuOpen) setIsMenuOpen(false); }}
              className="w-full text-left block bg-white text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-md text-base font-medium mt-1"
            >
              Scan Face
            </button>
            {isAuthenticated() ? (
              <a href="#" onClick={handleLogout} className="block bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-md shadow-md transition duration-300 ease-in-out mt-1">
                Logout
              </a>
            ) : (
              <a href="/login" onClick={handleLoginNavigation} className="block bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded-md shadow-md transition duration-300 ease-in-out mt-1">
                Login
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;