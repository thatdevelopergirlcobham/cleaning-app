import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface NumberCounterProps {
  end: number
  duration?: number
  suffix?: string
}

const NumberCounter: React.FC<NumberCounterProps> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  const [isInView, setIsInView] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isInView) return

    const steps = 60
    const stepDuration = duration / steps
    const increment = end / steps
    let currentStep = 0

    const timer = setInterval(() => {
      if (currentStep < steps) {
        countRef.current = Math.min(Math.round(increment * (currentStep + 1)), end)
        setCount(countRef.current)
        currentStep++
      } else {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [end, duration, isInView])

  return (
    <div ref={elementRef} className="text-4xl font-extrabold" style={{ color: '#2F6B02' }}>
      {count}{suffix}
    </div>
  )
}

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4">
          <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:py-28 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-35 items-center">
              <div className="text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block" style={{ color: '#2F6B02' }}>Where Spotless</span>
                  <span className="block mt-2"> Meets Seamless.</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-xl">
                  Join our premium cleaning service platform connecting you with verified cleaning professionals. Experience spotless spaces and seamless scheduling with our community of trusted cleaners.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/auth?mode=signup"
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-base font-medium rounded-full text-white transition-colors"
                    style={{ backgroundColor: '#2F6B02' }}
                  >
                    Book a Clean
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center px-3  py-2 border-2 text-base font-medium rounded-full bg-white transition-colors"
                    style={{ borderColor: '#2F6B02', color: '#2F6B02' }}
                  >
                    View Services
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <img
                  src="/img/cleanup.jpg"
                  alt="People cleaning the environment"
                  className="rounded-2xl shadow-xl w-auto h-[500px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Everything You Need for a <span style={{ color: '#2F6B02' }}>Spotless Space</span>
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src="/img/cleaning.jpg"
                  alt="Smart booking interface"
                  className="w-full h-48 object-cover"
                />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900">Smart Scheduling</h3>
                  <p className="mt-4 text-gray-600">
                    Book professional cleaners with our AI-powered scheduling system. Find the perfect time slot that works for both you and our verified cleaning experts.
                  </p>
                  <div className="mt-6 flex items-center" style={{ color: '#2F6B02' }}>
                    <span className="text-sm font-medium">Schedule Now</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src="/img/cleaning.jpg"
                  alt="Professional cleaners at work"
                  className="w-full h-48 object-cover"
                />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900">Verified Professionals</h3>
                  <p className="mt-4 text-gray-600">
                    Connect with our network of background-checked, experienced cleaning professionals. Read reviews, compare rates, and choose the perfect match for your needs.
                  </p>
                  <div className="mt-6 flex items-center" style={{ color: '#2F6B02' }}>
                    <span className="text-sm font-medium">Meet Our Cleaners</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src="/img/cleaning.jpg"
                  alt="Quality tracking dashboard"
                  className="w-full h-48 object-cover"
                />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900">Quality Tracking</h3>
                  <p className="mt-4 text-gray-600">
                    Track cleaning progress in real-time, rate your experience, and maintain a consistent standard of cleanliness. We ensure every clean meets our high standards.
                  </p>
                  <div className="mt-6 flex items-center" style={{ color: '#2F6B02' }}>
                    <span className="text-sm font-medium">View Standards</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Real Change, <span style={{ color: '#2F6B02' }}>Real Numbers</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Every home cleaned and every satisfied client contributes to a cleaner, healthier community.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <NumberCounter end={5000} suffix="+" />
                <div className="mt-2 text-sm text-gray-600">Homes Cleaned Monthly</div>
                <div className="text-xs text-gray-500">And growing every day</div>
              </div>
              <div className="text-center">
                <NumberCounter end={1000} suffix="+" />
                <div className="mt-2 text-sm text-gray-600">Verified Cleaners</div>
                <div className="text-xs text-gray-500">Background checked and trained</div>
              </div>
              <div className="text-center">
                <NumberCounter end={150} suffix="+" />
                <div className="mt-2 text-sm text-gray-600">Local Communities</div>
                <div className="text-xs text-gray-500">Across multiple cities</div>
              </div>
              <div className="text-center">
                <NumberCounter end={50} suffix="+" />
                <div className="mt-2 text-sm text-gray-600">Business Partners</div>
                <div className="text-xs text-gray-500">Trusted cleaning suppliers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Stories from Our Community
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center mb-4">
                  <img
                    src="/img/cleaning.jpg"
                    alt="Sarah Johnson"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">Homeowner</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "As a busy professional, keeping my home clean was always a challenge. 
                  The cleaning service has been a lifesaver - professional, reliable, and thorough. 
                  My home has never looked better!"
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center mb-4">
                  <img
                    src="/img/cleaning.jpg"
                    alt="Mark Rodriguez"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">Mark Rodriguez</h3>
                    <p className="text-sm text-gray-600">Business Owner</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "We use their services for our office space, and the difference is remarkable. 
                  The team is always punctual, professional, and pays attention to every detail. 
                  Highly recommended!"
                </p>
              </div>
            </div>

            {/* <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our 2025 Goals</h3>
              <ul className="inline-block text-left text-gray-600 space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#2F6B02' }}></span>
                  Expand to 50 new cities
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#2F6B02' }}></span>
                  Train 2,000 new professional cleaners
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#2F6B02' }}></span>
                  Achieve 99% customer satisfaction
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#2F6B02' }}></span>
                  Implement eco-friendly cleaning in all services
                </li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ backgroundColor: '#2F6B02' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center py-16 sm:py-20">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready for a Spotless Space?</span>
              <span className="block">Book Your First Clean Today</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-white/90">
              Join thousands of satisfied customers who trust our professional cleaning services. Get started with a special first-time discount!
            </p>
            <Link
              to="/auth?mode=signup"
              className="mt-8 w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full bg-white md:py-4 md:text-lg md:px-10 transition-colors"
              style={{ color: '#2F6B02' }}
            >
              Book Your First Clean
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
