import React from 'react';
// Make sure to install react-icons if you haven't: npm install react-icons
import { FaLightbulb, FaUsers, FaGraduationCap, FaCode, FaHandsHelping } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <section id="about-us" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-3">
            The Story Behind Our System
          </h2>
          <p className="text-lg text-pink-600 font-medium">
            Crafted with Dedication for Our Final Year Project
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaGraduationCap className="text-purple-600 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-purple-700">
                A Capstone Endeavor
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              This Face Recognition System represents the culmination of our academic journey and efforts for the Final Year Project (FYP) at [Your University/Institution Name]. Developed by <strong>[Your Name/Team Name: e.g., "Tech Innovators Alpha" or "Jane Doe & John Smith"]</strong>, this project is a testament to our passion for applying cutting-edge technology to create practical and impactful solutions. We embarked on this journey to explore the fascinating field of artificial intelligence and its real-world applications.
            </p>
          </div>

          {/* Core Objective */}
          <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaLightbulb className="text-pink-500 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-purple-700">
                Our Core Objective
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              The primary goal of this FYP is to <strong>design, develop, and evaluate an efficient and accurate facial recognition system capable of identifying individuals from a database. We aimed to implement a solution that could potentially be used for enhancing security, streamlining attendance tracking, or personalizing user experiences.</strong> Key objectives included achieving a high accuracy rate in varied lighting conditions, ensuring a user-friendly interface, and exploring the ethical considerations surrounding facial recognition technology.
            </p>
          </div>
          
          {/* Acknowledgements */}
          <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaHandsHelping className="text-purple-600 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-purple-700">
                Guidance and Support
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We are profoundly grateful to our instructor, <strong>[Instructor's Full Name and Title, e.g., "Dr. Eleanor Vance, Professor of Computer Science"]</strong>, for their invaluable mentorship, insightful guidance, and unwavering support throughout the development of this project. Their expertise in machine learning and project management, along with their constructive feedback, were pivotal to navigating challenges and achieving our project goals.
            </p>
          </div>

          {/* Optional: Technology Stack */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <FaCode className="text-pink-500 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold text-purple-700">
                Technologies Used
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              <em>This system was built using React for a dynamic frontend experience, Python with Flask for a robust backend API, and leveraged libraries such as OpenCV for image processing and TensorFlow/Keras for developing and training our deep learning model for facial recognition.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;