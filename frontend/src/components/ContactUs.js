import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    alert('Thank you for your message! Our team will get back to you shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact-us" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Contact Our Team
          </h2>
          <p className="text-lg text-slate-700 font-medium">
            Whether you're a partner, investor, or just curious, we'd love to hear from you!
          </p>
        </div>

        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-slate-800 focus:border-slate-800 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-slate-800 focus:border-slate-800 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    id="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-slate-800 focus:border-slate-800 transition-colors"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="w-full lg:w-1/2 px-4">
            <div className="bg-white p-8 rounded-lg shadow-xl h-full">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Company Information</h3>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-start">
                  <FaMapMarkerAlt className="text-slate-900 mr-2 mt-1" />
                  <div>
                    <span className="font-semibold">Head Office:</span>
                    <span className="ml-1">Block B, Tech Incubator, Innovation Park, Peshawar, KP 25000</span>
                  </div>
                </p>
                <p className="flex items-start">
                  <FaEnvelope className="text-slate-900 mr-2 mt-1" />
                  <div>
                    <span className="font-semibold">Email:</span>
                    <a href="mailto:contact@ai3labs.com" className="ml-1 text-slate-700 hover:text-slate-900 transition-colors">
                      contact@ai3labs.com
                    </a>
                  </div>
                </p>
                <p className="flex items-start">
                  <FaPhone className="text-slate-900 mr-2 mt-1" />
                  <div>
                    <span className="font-semibold">Phone:</span>
                    <a href="tel:+92987654321" className="ml-1 text-slate-700 hover:text-slate-900 transition-colors">
                      +92 987 654321
                    </a>
                  </div>
                </p>
                <p className="mt-6 text-sm">
                  We're a growing AI startup revolutionizing intelligent solutions. Reach out to us for partnerships, product inquiries, or media.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
