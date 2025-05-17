import React, { useState } from 'react';
// You can import icons for contact details if you like
// import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

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
    // Handle form submission logic here (e.g., send data to a backend)
    console.log('Form data submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' }); // Reset form
  };

  return (
    <section id="contact-us" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-pink-600 font-medium">
            We'd love to hear from you! Send us a message or find our contact details below.
          </p>
        </div>

        <div className="flex flex-wrap -mx-4">
          {/* Contact Form Column */}
          <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <h3 className="text-2xl font-semibold text-purple-700 mb-6">Send Us a Message</h3>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="w-full lg:w-1/2 px-4">
            <div className="bg-white p-8 rounded-lg shadow-xl h-full"> {/* Added h-full for consistent height if desired */}
              <h3 className="text-2xl font-semibold text-purple-700 mb-6">Contact Information</h3>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-start">
                  {/* <FaMapMarkerAlt className="text-purple-600 mr-3 mt-1 flex-shrink-0" size={20} /> */}
                  <span className="font-semibold mr-2">Address:</span>
                  <span>123 Innovation Drive, Tech City, TC 54321</span>
                </p>
                <p className="flex items-start">
                  {/* <FaEnvelope className="text-purple-600 mr-3 mt-1 flex-shrink-0" size={20} /> */}
                  <span className="font-semibold mr-2">Email:</span>
                  <a href="mailto:info@frs.example.com" className="text-pink-600 hover:text-pink-700 transition-colors">info@frs.example.com</a>
                </p>
                <p className="flex items-start">
                  {/* <FaPhone className="text-purple-600 mr-3 mt-1 flex-shrink-0" size={20} /> */}
                  <span className="font-semibold mr-2">Phone:</span>
                  <a href="tel:+1234567890" className="text-pink-600 hover:text-pink-700 transition-colors">(123) 456-7890</a>
                </p>
                <p className="mt-6 text-sm">
                  Feel free to reach out through any of these channels. We aim to respond to all inquiries within 24-48 hours.
                </p>
              </div>
              {/* Optional: Add a map here */}
              {/* <div className="mt-8 rounded-lg overflow-hidden shadow-md">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..." // Replace with your Google Maps embed link
                  width="100%" 
                  height="250" 
                  style={{ border:0 }} 
                  allowFullScreen="" 
                  loading="lazy"
                  title="Our Location"
                ></iframe>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;