import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AboutSection: React.FC = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            About Clean Calabar Initiative
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join our community-driven initiative to transform Calabar into a
            cleaner, healthier, and more sustainable city.
          </p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-1/2 flex justify-center">
            <img
              src="/img/cleanup.jpg"
              alt="Community cleanup"
              className="rounded-xl shadow-lg w-[500px] h-[400px] object-cover"
            />
          </div>

          <div className="md:w-1/2">
            <p className="text-gray-600 leading-relaxed">
              Clean Calabar is a community platform that empowers residents to
              take action for a cleaner environment. Our platform enables you to
              report waste management issues, organize community cleanup events,
              and track the progress of environmental initiatives across the
              city. Together, we can create lasting change and make Calabar a
              model for sustainable urban development in Nigeria.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white w-full bg-lime-500 transition-colors"
              >
                Join the Movement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
