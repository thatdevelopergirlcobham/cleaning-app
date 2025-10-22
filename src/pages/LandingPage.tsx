import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users, TrendingUp, ArrowRight } from 'lucide-react'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Transform Calabar into a</span>
                  <span className="block text-primary">Cleaner, Greener City</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                  Join CleanCal - the community-driven platform connecting residents with waste management solutions.
                  Report issues, join cleanup events, and make a real difference in your neighborhood.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
                  <div className="rounded-md shadow">
                    <Link
                      to="/auth?mode=signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-2xl text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/about"
                      className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How CleanCal Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Simple, effective, and community-powered waste management
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Report Issues</h3>
              <p className="mt-2 text-gray-500">
                Spot waste problems in your area and report them with photos and GPS location for quick resolution.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mx-auto">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Join Events</h3>
              <p className="mt-2 text-gray-500">
                Participate in community cleanup events and connect with neighbors working towards a cleaner city.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Track Impact</h3>
              <p className="mt-2 text-gray-500">
                Monitor resolution progress and see the collective impact of community cleanup efforts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block">Join the CleanCal community today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-foreground/80">
            Connect with your community, report waste issues, and help create a cleaner Calabar for everyone.
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-8 w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-2xl text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
          >
            Create Your Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
