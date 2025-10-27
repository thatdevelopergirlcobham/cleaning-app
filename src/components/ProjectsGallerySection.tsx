import React from 'react';

const projects = [
  '/img/project1.jpg',
  '/img/project2.jpg',
  '/img/project3.jpg',
  '/img/project4.jpg',
  '/img/project5.jpg',
  '/img/project6.jpg',
];

const ProjectsGallerySection: React.FC = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Our Projects
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See the difference our cleaning services make.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-105"
            >
              <img
                src={project}
                alt={`Project ${index + 1}`}
                className="w-full h-48 object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsGallerySection;