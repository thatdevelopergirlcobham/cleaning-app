import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-green-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-lime-500">CleanCal</div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-green-700">Home</Link>
          <Link to="/services" className="text-white hover:text-green-700">Services</Link>
          <Link to="/about" className="text-white hover:text-green-700">About</Link>
          <Link to="/locations" className="text-white hover:text-green-700">Locations</Link>
          <Link to="/blog" className="text-white hover:text-green-700">Blog</Link>
          <Link to="/contact" className="text-white hover:text-green-700">Contact</Link>
        </div>

        {/* Book Now Button */}
        <Link
          to="/book"
          className="px-4 py-2 bg-lime-500 text-white rounded-full hover:bg-green-800 transition"
        >
          Book Now
        </Link>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700 focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;