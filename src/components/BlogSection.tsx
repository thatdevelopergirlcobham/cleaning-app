import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Home, Armchair } from 'lucide-react'

// 1. Data for the blog posts
const blogPostsData = [
  {
    image: '/img/cleaning.jpg',
    icon: <Sparkles size={20} className="text-brand-green-dark" />,
    title: '6 Cleaning Mistakes That Can Frustrate Your Cleaning Efforts',
    description: 'One-time cleaning services understand the frustration that comes with dust invading the tranquility of a pristine home. This unwelcome guest finds its way...',
    link: '/blog/cleaning-mistakes',
  },
  {
    image: '/img/cleaning.jpg',
    icon: <Home size={20} className="text-brand-green-dark" />,
    title: 'How Often Should You Get Your House Cleaned?',
    description: "Whether it's to give your home a fresh, clean feeling or enjoy great company during any given moment of the day, there are plenty of reasons to get...",
    link: '/blog/how-often-to-clean',
  },
  {
    image: '/img/cleanup.jpg',
    icon: <Armchair size={20} className="text-brand-green-dark" />, // Using as substitute
    title: 'Professional Mopping Tips',
    description: 'Mopping is a common chore for many people in the home or office. It is an effortless house cleaning task that can remove dirt, grime, and germs from surfaces...',
    link: '/blog/mopping-tips',
  },
]

// 2. The Component
const BlogSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* === Section Header === */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green-dark">
            Recent Blog Posts
          </h2>
          <p className="mt-4 text-gray-600">
            Looking to solve a small but tedious chore? Look no further! Our blog offers invaluable
            tips on tackling dirt and mess to keep your home clean and tidy.
          </p>
        </div>

        {/* === Blog Posts Grid === */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPostsData.map((post, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col"
            >
              {/* Image and Icon */}
              <div className="relative mb-6">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover rounded-2xl"
                />
                <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  {post.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-brand-green-dark">
                  {post.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm flex-grow line-clamp-3">
                  {post.description}
                </p>

                {/* Read More Link */}
                <Link
                  to={post.link}
                  className="mt-6 flex justify-between items-center bg-white rounded-full p-2 pr-3 shadow-md hover:shadow-lg transition-shadow"
                >
                  <span className="ml-3 text-sm font-medium text-brand-green-dark">
                    Read more
                  </span>
                  <div className="w-8 h-8 bg-brand-green-light rounded-full flex items-center justify-center">
                    <ArrowRight size={16} className="text-brand-green-dark" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogSection