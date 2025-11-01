// import React, { useState, useEffect, useRef } from 'react'
// import { Link } from 'react-router-dom'
// import { ArrowRight } from 'lucide-react'
import CallToActionSection from '../components/CallToActionSection'
import Footer from '../components/Footer'
// import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import ServicesSection from '../components/ServicesSection'
import WhyChooseUsSection from '../components/WhyChooseUsSection'
import TestimonialsSection from '../components/TestimonialsSection'
// import BlogSection from '../components/BlogSection'

// interface NumberCounterProps {
//   end: number
//   duration?: number
//   suffix?: string
// }

// const NumberCounter: React.FC<NumberCounterProps> = ({ end, duration = 2000, suffix = '' }) => {
//   const [count, setCount] = useState(0)
//   const countRef = useRef(count)
//   const [isInView, setIsInView] = useState(false)
//   const elementRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsInView(true)
//         }
//       },
//       { threshold: 0.1 }
//     )

//     if (elementRef.current) {
//       observer.observe(elementRef.current)
//     }

//     return () => {
//       if (elementRef.current) {
//         observer.unobserve(elementRef.current)
//       }
//     }
//   }, [])

//   useEffect(() => {
//     if (!isInView) return

//     const steps = 60
//     const stepDuration = duration / steps
//     const increment = end / steps
//     let currentStep = 0

//     const timer = setInterval(() => {
//       if (currentStep < steps) {
//         countRef.current = Math.min(Math.round(increment * (currentStep + 1)), end)
//         setCount(countRef.current)
//         currentStep++
//       } else {
//         clearInterval(timer)
//       }
//     }, stepDuration)

//     return () => clearInterval(timer)
//   }, [end, duration, isInView])

//   return (
//     <div ref={elementRef} className="text-4xl font-extrabold" style={{ color: '#2F6B02' }}>
//       {count}{suffix}
//     </div>
//   )
// }

const LandingPage: React.FC = () => {
  return (
    <>
    
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <HeroSection/>
    <AboutSection/>
    <ServicesSection/>
    <WhyChooseUsSection/>
    <TestimonialsSection/>
      <CallToActionSection />
      <Footer />
    </div>
    </>
  )
}

export default LandingPage
