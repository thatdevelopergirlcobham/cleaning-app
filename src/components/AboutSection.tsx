import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AboutSection: React.FC = () => {
  return (
    <div className="py-16 bg-white ">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Things to Do in [City]
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover the best attractions and activities in [City] while we take
            care of your cleaning needs.
          </p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
          {/* Map Illustration */}
          <div className="md:w-1/2">
            <img
              src="/img/cleanup.jpg"
              alt="Map of the city"
              className="rounded-xl shadow-lg w-[500px] h-[400px]"
            />
          </div>

          {/* Description Card */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-green-700">Explore [City]</h3> */}
            <p className=" text-gray-600 items-start w-[500px]">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Impedit
              nemo tenetur necessitatibus mollitia commodi quibusdam corrupti
              voluptatibus provident rerum illum earum perferendis velit fuga
              nesciunt dolorum debitis aliquid, ducimus saepe! From historic
              landmarks to vibrant neighborhoods, [City] offers something for
              everyone. Let us handle your cleaning while you enjoy the city.
            </p>
            <div className="mt-8 md:flex items-start sm:flex-row gap-4 ">
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-black bg-lime-500 transition-colors"
          >
            Book a Clean
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center px-8  py-3 border-2 border-black text-black text-base font-medium rounded-full bg-transparent transition-colors"
          >
            View Services
          </Link>
        </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AboutSection;
