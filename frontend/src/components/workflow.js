import React from 'react';
import { FaUserPlus, FaCamera, FaListAlt } from 'react-icons/fa';

const Workflow = () => {
  const steps = [
    {
      id: 1,
      icon: <FaUserPlus className="text-slate-600 text-4xl md:text-5xl mb-4" />,
      title: 'Create an Account',
      description: 'Sign up quickly and easily to get started with our secure system.',
    },
    {
      id: 2,
      icon: <FaCamera className="text-slate-500 text-4xl md:text-5xl mb-4" />,
      title: 'Detect Face',
      description: 'Utilize our advanced technology to accurately detect and analyze faces.',
    },
    {
      id: 3,
      icon: <FaListAlt className="text-slate-600 text-4xl md:text-5xl mb-4" />,
      title: 'See Details',
      description: 'Access comprehensive information and insights based on the facial detection.',
    },
  ];

  return (
    <section id="workflow" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            A Simple and Efficient Process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="bg-white p-8 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-xl"
            >
              {step.icon}
              <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;