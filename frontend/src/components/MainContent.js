import React from 'react';
import AboutUs from './AboutUs'; // Assuming AboutUs.js is in the same directory
import Team from './Team';     // Assuming Team.js is in the same directory
import ContactUs from './ContactUs';
import Workflow from './workflow';
const MainContent = () => {
  return (
    <main>
      {/* Hero Section with Gradient Background */}
      <section 
        id="hero" 
        className="relative bg-gradient-to-r from-purple-700 to-pink-600 text-white py-20 md:py-32 shadow-lg" 
      >
        {/* Optional: Subtle pattern or texture overlay if desired, or remove if gradient is sufficient */}
        {/* <div className="absolute inset-0 bg-black opacity-10"></div> */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-md">
            Welcome to Our Face Recognition System
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-pink-100 drop-shadow-sm">
            Experience the future of identification technology. Secure, fast, and reliable.
          </p>
          {/* You can add a call-to-action button here if needed, styled to match */}
          <button className="bg-white hover:bg-purple-100 text-purple-700 font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105">
            Get Started
          </button>
        </div>
      </section>

      {/* Other Sections */}
      <Workflow />
      <Team />
      <AboutUs />
      <ContactUs />
      {/* You can add more components/sections here as needed */}
    </main>
  );
};

export default MainContent;