import React from 'react';

const ServiceAreaMapSection: React.FC = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Serving Homes Across [City/Region]
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We proudly serve homes and businesses across [City/Region].
          </p>
        </div>

        <div className="mt-8">
          <img
            src="/img/map.jpg"
            alt="Service area map"
            className="rounded-xl shadow-lg w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceAreaMapSection;