import React from 'react';
import { FaLightbulb, FaUsers, FaGraduationCap, FaCode, FaHandsHelping } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <section id="about-us" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            The Vision Behind Our Platform
          </h2>
          <p className="text-lg text-slate-700 font-medium">
            Built to Redefine Identity Verification with Intelligence & Precision
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Company Mission */}
          <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaLightbulb className="text-slate-700 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-slate-900">
                Our Mission
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to revolutionize the way organizations identify and authenticate individuals using state-of-the-art facial recognition technology. We are committed to developing intelligent, reliable, and secure systems that enhance operational efficiency, improve security, and offer seamless user experiences across diverse sectors—from enterprise environments to smart public services.
            </p>
          </div>

          {/* Origins */}
          <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaGraduationCap className="text-slate-800 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-slate-900">
                Our Journey
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              What began as a passion project among AI practitioners has grown into a powerful, intelligent system capable of transforming identity verification. Our team recognized a clear need for a modern solution—one that not only performs with high accuracy in real-world conditions but also respects ethical standards and user privacy.
            </p>
          </div>

          {/* Gratitude */}
          <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaHandsHelping className="text-slate-800 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-slate-900">
                Collaboration & Support
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We are deeply thankful for the collaboration and support received from industry professionals, researchers, and advisors who have guided our development process. Their insights into machine learning, data privacy, and system architecture were instrumental in shaping a solution that's not only innovative, but also scalable and secure.
            </p>
          </div>

          {/* Technology Stack */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaCode className="text-slate-700 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-slate-900">
                Technologies Powering Our Platform
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              <em>Our solution is engineered using a modern tech stack including React for the frontend, Flask and Python for the backend, OpenCV for real-time image processing, and TensorFlow/Keras for deep learning-based facial recognition. Each layer of our system is designed with performance, reliability, and user privacy at its core.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
