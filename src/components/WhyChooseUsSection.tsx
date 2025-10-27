import React from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  FileText,
  MessageSquareQuote,
  Users,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react'

// === Features data ===
const featuresData = [
  {
    icon: <CheckCircle2 size={32} className="transition-colors duration-300 text-green-900 group-hover:text-white" />,
    title: 'Experienced & professional',
    description:
      'Our skilled team brings years of expertise and a commitment to high-quality, reliable cleaning—every time.',
  },
  {
    icon: <FileText size={32} className="transition-colors duration-300 text-green-900 group-hover:text-white" />,
    title: 'Background & reference checked',
    description:
      'All cleaners are carefully vetted through background checks and verified references for your peace of mind.',
  },
  {
    icon: <MessageSquareQuote size={32} className="transition-colors duration-300 text-green-900 group-hover:text-white" />,
    title: 'English speaking',
    description:
      'All cleaners speak fluent English for clear communication and easy coordination.',
  },
  {
    icon: <Users size={32} className="transition-colors duration-300 text-green-900 group-hover:text-white" />,
    title: 'Interviewed in-person',
    description:
      'Every cleaner is personally interviewed to ensure quality and professionalism.',
  },
  {
    icon: <ThumbsUp size={32} className="transition-colors duration-300 text-green-900 group-hover:text-white" />,
    title: 'Highly rated by Blue Spring Customers',
    description:
      'Consistently rated 5 stars by our happy customers. Loved and highly recommended by our clients.',
  },
]

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* === Section Header === */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-green-900">
            Why Choose Our House Cleaning Services?
          </h2>
          <p className="mt-4 text-gray-600">
            We take pride in our exceptional house cleaning services, but that's not all. 
            We go the extra mile to provide incredible benefits that truly enhance your experience with us!
          </p>

          {/* Buttons */}
          <div className="mt-8 md:flex justify-center sm:flex-row gap-4">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-black bg-lime-500 hover:bg-lime-600 hover:text-white transition-all duration-300"
            >
              Book a Clean
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-black text-black text-base font-medium rounded-full bg-transparent hover:bg-black hover:text-white transition-all duration-300"
            >
              View Services
            </Link>
          </div>
        </div>

        {/* === Features Grid === */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 hover:bg-green-900 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.15)]"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-800 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2 transition-colors duration-300 group-hover:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm transition-colors duration-300 group-hover:text-gray-200">
                {feature.description}
              </p>
            </div>
          ))}

          {/* === Special Card === */}
          <Link
            to="/services"
            className="bg-green-900 rounded-2xl shadow-lg p-8 flex flex-col justify-center items-start hover:bg-green-800 transition-all duration-300"
          >
            <h3 className="text-4xl text-lime-400 font-bold">12+ Services</h3>
            <span className="text-lg text-gray-300 mb-4">you can explore</span>
            <ArrowRight size={32} className="text-lime-400" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
