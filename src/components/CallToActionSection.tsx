import React from 'react';
import { Link } from 'react-router-dom';

const CallToActionSection: React.FC = () => {
  return (
    <div className="py-16 bg-green-700">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">
            Experience Your Cleanest Home Yet.
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Join thousands of satisfied customers who trust our professional cleaning services.
          </p>
          <Link
            to="/quote"
            className="mt-8 px-6 py-3 bg-white text-green-700 rounded-full hover:bg-gray-100 transition"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;