import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <>
          {/* Hero Section */}
      <div className="relative overflow-hidden bg-green-900 items-center ">
        <div className="container max-w-6xl mx-auto px-4 ">
          <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:py-28 max-w-6xl mx-auto">
            <div className="items-center">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block" style={{ color: 'white' }}>Where Spotless</span>
                  <span className="block mt-2 text-white"> Meets Seamless.</span>
                </h1>
                <p className="mt-6 text-lg text-gray-300 text-center ">
                  Join our premium cleaning service platform connecting you with verified cleaning professionals. Experience spotless spaces and seamless scheduling with our community of trusted cleaners.
                </p>
                <div className="mt-8 md:flex justify-center items-center sm:flex-row gap-4 ">
                  <Link
                    to="/auth?mode=signup"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-lime-500 transition-colors"
                  >
                    Book a Clean
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center px-8  py-3 border-2 border-lime-500 text-green-500 text-base font-medium rounded-full bg-transparent transition-colors"
                  >
                    View Services
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                {/* <img
                  src="/img/cleanup.jpg"
                  alt="People cleaning the environment"
                  className="rounded-2xl shadow-xl w-auto h-[500px]"
                /> */}
              </div> 
            </div>
          </div>
        </div>
      </div>
      </>
  );
};

export default HeroSection;