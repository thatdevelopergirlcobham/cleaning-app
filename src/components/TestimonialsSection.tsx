import React, { useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'

// Testimonial data - no changes from last time
const testimonialsData = [
  {
    id: 1,
    name: 'Sarah K.',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    reviewText: "Incredible service! My home has never looked better. They were professional, on time, and so thorough. I'll be booking them monthly!",
    rating: 5,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=G',
    position: 'top-[10%] left-[10%]',
    size: 'w-24 h-24',
  },
  {
    id: 2,
    name: 'Michael B.',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    reviewText: 'They did a fantastic deep clean on my apartment before I moved out. I got my full deposit back. Thank you, GoGreen!',
    rating: 5,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=Y',
    position: 'top-[30%] left-[30%]',
    size: 'w-28 h-28',
  },
  {
    id: 3,
    name: 'Emily L.',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    reviewText: 'As a busy mom, having them come bi-weekly has been a lifesaver. I trust them in my home and they always do a great job.',
    rating: 5,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=G',
    position: 'top-[0] right-[10%]',
    size: 'w-20 h-20',
  },
  {
    id: 4,
    name: 'David R.',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    reviewText: "The team was very engaging & listened very carefully. The 3 person crew was amazing, efficient, and left my house sparkling.",
    rating: 4,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=F',
    position: 'bottom-[20%] left-[5%]',
    size: 'w-24 h-24',
  },
  {
    id: 5,
    name: 'Jessica T.',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    reviewText: 'Used them for our office space. The difference was night and day. Our employees are happier in a clean environment.',
    rating: 5,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=G',
    position: 'bottom-[20%] left-[50%]',
    size: 'w-20 h-20',
  },
  {
    id: 6,
    name: 'Carol Schmitz',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    reviewText: "The team leader was very engaging & listened very carefully. The 3 person crew was amazing, efficient, and left my house sparkling. I'm so glad I found them.",
    rating: 5,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=G',
    position: 'top-[35%] right-[25%]',
    size: 'w-32 h-32',
  },
  {
    id: 7,
    name: 'Tom Wilson',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    reviewText: 'Solid 5 stars. Easy to book online, fair pricing, and the quality of the clean was exceptional. What more could you ask for?',
    rating: 5,
    companyLogoUrl: 'https://placehold.co/24x24/ffffff/1E3928?text=Y',
    position: 'top-[60%] right-[10%]',
    size: 'w-28 h-28',
  },
]

const TestimonialsSection: React.FC = () => {
  // 1. New state to track just the ID
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* ... (Background shapes - no change) ... */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute -top-20 -left-40 w-[600px] h-[600px] rounded-full border-4 border-brand-green-light border-opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full border-4 border-brand-green-light border-opacity-20 animate-pulse-slow-delay"></div>
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full border-4 border-brand-green-light border-opacity-40 animate-pulse-slow-reverse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* ... (Central Text Header - no change) ... */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-green-dark">
            Testimonials
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our reputation speaks for itself through the countless glowing
            reviews from satisfied customers in Arvada. Find out what
            people are saying about us!
          </p>
        </div>

        {/* --- INTERACTIVE AREA --- */}
        <div className="mt-16 relative h-[400px] md:h-[500px] lg:h-[600px]">
          {/* 2. Map over the data */}
          {testimonialsData.map((testimonial) => (
            // 3. This is the parent container for one person
            <div
              key={testimonial.id}
              className={`absolute ${testimonial.position} ${testimonial.size} z-10`}
              onMouseEnter={() => setHoveredId(testimonial.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Avatar Image */}
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className={`w-full h-full object-cover rounded-full border-4 shadow-lg cursor-pointer transition-all duration-300
                            ${
                              hoveredId === testimonial.id
                                ? 'border-brand-green-light scale-110'
                                : 'border-gray-200'
                            }`}
              />

              {/* 4. The Review Bubble (Popover) */}
              <div
                className={`absolute w-[320px] p-6 rounded-2xl bg-brand-green-dark text-black shadow-xl z-30
                           top-full left-1/2 -translate-x-1/2 mt-4 transition-all duration-300 ease-in-out
                           ${
                             hoveredId === testimonial.id
                               ? 'opacity-100 translate-y-0 visible'
                               : 'opacity-0 -translate-y-4 visible'
                           }`}
              >
                {/* Upward-pointing triangle */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0
                              border-l-[15px] border-r-[15px] border-b-[20px]
                              border-l-transparent border-r-transparent border-b-brand-green-dark"></div>

                {/* Dynamic Content */}
                <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <img
                    src={testimonial.companyLogoUrl}
                    alt="Review source"
                    className="w-6 h-6"
                  />
                </div>
                <p className="text-sm md:text-base mt-8 leading-relaxed h-24 overflow-hidden">
                  "{testimonial.reviewText.substring(0, 150)}
                  {testimonial.reviewText.length > 150 ? '...' : ''}"
                  <Link
                    to="/testimonials"
                    className="underline text-brand-green-light ml-1"
                  >
                    Read more
                  </Link>
                </p>
                <div className="mt-4">
                  <p className="font-bold text-lg">{testimonial.name}</p>
                  <div className="flex items-center text-yellow-400 text-sm mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} fill="currentColor" size={16} />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} />
                    ))}
                    <span className="ml-2 text-white">{testimonial.rating}.0</span>
                  </div>
                </div>
                <Quote size={48} className="absolute bottom-4 right-4 text-white text-opacity-20" />
              </div>
            </div>
          ))}
          {/* 5. The old central bubble is now GONE */}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection