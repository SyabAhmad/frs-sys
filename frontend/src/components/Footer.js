import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; // Example icons

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg p-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h5 className="text-xl font-bold mb-3">Face Recognition System</h5>
            <p className="text-pink-100 text-sm">
              Advanced solutions for secure and efficient identification. Our technology is designed for reliability and ease of use.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xl font-bold mb-3">Quick Links</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-pink-100 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-pink-100 hover:text-white transition-colors">Services</a></li>
              <li><a href="/login" className="text-pink-100 hover:text-white transition-colors">Login</a></li>
              <li><a href="#" className="text-pink-100 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div>
            <h5 className="text-xl font-bold mb-3">Contact Us</h5>
            <p className="text-pink-100 text-sm mb-1">123 Innovation Drive, Tech City</p>
            <p className="text-pink-100 text-sm mb-3">Email: info@frs.example.com</p>
            <h5 className="text-lg font-semibold mb-2 mt-4">Follow Us</h5>
            <div className="flex space-x-4">
              <a href="#" className="text-pink-100 hover:text-white transition-colors"><FaFacebookF size={20} /></a>
              <a href="#" className="text-pink-100 hover:text-white transition-colors"><FaTwitter size={20} /></a>
              <a href="#" className="text-pink-100 hover:text-white transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="text-pink-100 hover:text-white transition-colors"><FaLinkedinIn size={20} /></a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-pink-500 text-center">
          <p className="text-sm text-pink-200">
            &copy; {new Date().getFullYear()} Face Recognition System. All rights reserved.
          </p>
          <div className="mt-2">
            <a href="#" className="text-sm text-pink-200 hover:text-white transition-colors mx-2">
              Terms of Service
            </a>
            <span className="text-pink-300">|</span>
            <a href="#" className="text-sm text-pink-200 hover:text-white transition-colors mx-2">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;