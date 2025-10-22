import React from 'react'

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="font-heading font-bold text-4xl text-gray-900 mb-4">About CleanCal</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A comprehensive, community-driven waste management platform designed to transform Calabar into a cleaner, greener city.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <h3 className="font-heading font-semibold text-xl text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-600">
            To bridge the gap between residents and waste management authorities through real-time data and actionable community engagement.
          </p>
        </div>

        <div className="card">
          <h3 className="font-heading font-semibold text-xl text-gray-900 mb-4">Two-Sided Solution</h3>
          <p className="text-gray-600">
            Community users report issues while administrators verify and manage responses, creating an efficient cleanup ecosystem.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-heading font-semibold text-2xl text-gray-900 mb-6">Key Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-2">For Community Users</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Real-time waste reporting with GPS</li>
              <li>• Community events and cleanup coordination</li>
              <li>• Agent hiring for professional services</li>
              <li>• Social feed of approved reports</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-2">For Administrators</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Report verification and approval system</li>
              <li>• Agent management and assignment</li>
              <li>• Performance tracking and KPIs</li>
              <li>• Resource optimization tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
