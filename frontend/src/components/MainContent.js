import React from 'react';
import AboutUs from './AboutUs'; 
import Team from './Team';
import ContactUs from './ContactUs';
import Workflow from './workflow';

const MainContent = () => {
  return (
    <main>
      {/* Hero Section with Updated Gradient Background */}
      <section 
        id="hero" 
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 shadow-lg" 
      >
        {/* Custom visual elements for interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 opacity-5 rounded-full -mt-24 -mr-24"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500 opacity-5 rounded-full -mb-16 -ml-16"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-md">
            Welcome to Our Face Recognition System
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-slate-300 drop-shadow-sm">
            Experience the future of identification technology. Secure, fast, and reliable.
          </p>
          
          {/* Updated button styling to match Dashboard */}
          <div className="flex justify-center space-x-4">
            <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg">
              Get Started
            </button>
            <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <Workflow />
      <Team />
      <AboutUs />
      <ContactUs />
    </main>
  );
};

export default MainContent;