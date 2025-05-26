import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaTachometerAlt, FaSignOutAlt, FaBars, FaTimes, FaHome, FaInfoCircle, FaUsers, FaEnvelope, FaCogs, FaCamera } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleScanFace = () => {
    if (isAuthenticated) {
      navigate('/scan');
    } else {
      alert('Please log in to scan a face.');
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: sectionId } });
    } else {
      scrollToSection(sectionId);
    }
    setIsMenuOpen(false);
  };
  
  const handleHomeNavigation = (e) => {
    e.preventDefault();
    navigate('/');
    setIsMenuOpen(false); 
  };

  const handleLoginNavigation = (e) => {
    e.preventDefault();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleDashboardNavigation = (e) => {
    e.preventDefault();
    navigate('/dashboard');
    setIsMenuOpen(false); 
  };

  useEffect(() => {
    if (location.state && location.state.scrollToSection && location.pathname === '/') {
      scrollToSection(location.state.scrollToSection);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, scrollToSection]);


  const navLinks = [
    { id: 'home', label: 'Home', icon: <FaHome className="mr-2" />, action: handleHomeNavigation, sectionId: 'hero' },
    { id: 'about-us', label: 'About', icon: <FaInfoCircle className="mr-2" />, action: (e) => handleNavClick(e, 'about-us'), sectionId: 'about-us' },
    { id: 'workflow', label: 'Workflow', icon: <FaCogs className="mr-2" />, action: (e) => handleNavClick(e, 'workflow'), sectionId: 'workflow' },
    { id: 'team', label: 'Team', icon: <FaUsers className="mr-2" />, action: (e) => handleNavClick(e, 'team'), sectionId: 'team' },
    { id: 'contact-us', label: 'Contact', icon: <FaEnvelope className="mr-2" />, action: (e) => handleNavClick(e, 'contact-us'), sectionId: 'contact-us' },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg fixed w-full z-50 top-0 overflow-hidden">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <a href="/" onClick={handleHomeNavigation} className="text-2xl font-bold hover:text-slate-300 transition-colors flex items-center">
            {/* <img src={logo} alt="FRS Logo" className="h-8 w-auto mr-2" /> */}
            FRS
          </a>

          <div className="hidden md:flex flex-grow justify-center items-center space-x-1">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.sectionId}`}
                onClick={link.action}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center"
              >
                {link.icon} {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={handleScanFace}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center text-sm"
            >
              <FaCamera className="mr-2" /> Scan Face
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleDashboardNavigation}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center text-sm"
                >
                  <FaTachometerAlt className="mr-2" /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center text-sm"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginNavigation}
                  className="bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center text-sm"
                >
                  <FaSignInAlt className="mr-2" /> Login
                </button>

              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-3 space-y-1 bg-slate-800 rounded-md shadow-xl p-2">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.sectionId}`}
                onClick={link.action}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-700 transition-colors flex items-center"
              >
                {link.icon} {link.label}
              </a>
            ))}
            <hr className="border-slate-700 my-2" />
            <button
              onClick={handleScanFace}
              className="w-full text-left bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md shadow-sm transition-colors duration-150 flex items-center"
            >
              <FaCamera className="mr-2" /> Scan Face
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleDashboardNavigation}
                  className="w-full text-left mt-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-3 rounded-md shadow-sm transition-colors duration-150 flex items-center"
                >
                  <FaTachometerAlt className="mr-2" /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left mt-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-md shadow-sm transition-colors duration-150 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginNavigation}
                  className="w-full text-left mt-1 bg-teal-500 hover:bg-teal-400 text-white font-semibold py-2 px-3 rounded-md shadow-sm transition-colors duration-150 flex items-center"
                >
                  <FaSignInAlt className="mr-2" /> Login
                </button>

              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;