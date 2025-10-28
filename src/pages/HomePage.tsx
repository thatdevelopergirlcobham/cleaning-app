// import React from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowRight, Check, Star } from 'lucide-react';
// import Navbar from '../components/Navbar';

// // Dummy data
// const services = [
//   {
//     id: 1,
//     title: 'Standard Cleaning',
//     description: 'Basic cleaning for your home or office',
//     price: 120,
//     duration: '2-3 hours',
//     features: ['Dusting', 'Vacuuming', 'Bathroom cleaning', 'Kitchen cleaning']
//   },
//   {
//     id: 2,
//     title: 'Deep Cleaning',
//     description: 'Thorough cleaning for a spotless space',
//     price: 250,
//     duration: '4-5 hours',
//     features: ['Includes Standard Cleaning', 'Inside appliances', 'Baseboards', 'Window sills']
//   },
//   {
//     id: 3,
//     title: 'Move In/Out',
//     description: 'Complete cleaning for moving',
//     price: 350,
//     duration: '5-6 hours',
//     features: ['Includes Deep Cleaning', 'Inside cabinets', 'Light fixtures', 'Walls and doors']
//   }
// ];

// const testimonials = [
//   {
//     id: 1,
//     name: 'Sarah Johnson',
//     rating: 5,
//     comment: 'The team did an amazing job cleaning my apartment. It looks brand new!',
//     date: '2 days ago'
//   },
//   {
//     id: 2,
//     name: 'Michael Chen',
//     rating: 5,
//     comment: 'Professional and thorough service. Will definitely book again!',
//     date: '1 week ago'
//   },
//   {
//     id: 3,
//     name: 'Emma Williams',
//     rating: 4,
//     comment: 'Great service, very reliable cleaners. My house has never been cleaner!',
//     date: '3 days ago'
//   }
// ];

// const HomePage: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-white">
//       <Navbar />
      
//       {/* Hero Section */}
//       <section className="bg-green-900 text-white py-20">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto text-center">
//             <h1 className="text-4xl md:text-6xl font-bold mb-6">Professional Cleaning Services</h1>
//             <p className="text-xl md:text-2xl mb-8">Book a professional cleaner in minutes. 100% satisfaction guaranteed.</p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link 
//                 to="/book" 
//                 className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center transition-colors"
//               >
//                 Book Now <ArrowRight className="ml-2" />
//               </Link>
//               <Link 
//                 to="/services" 
//                 className="border-2 border-white hover:bg-white hover:bg-opacity-10 text-white font-bold py-3 px-8 rounded-full inline-flex items-center transition-colors"
//               >
//                 Our Services
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section className="py-20 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">Choose from our range of professional cleaning services tailored to your needs.</p>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             {services.map((service) => (
//               <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
//                   <p className="text-gray-600 mb-4">{service.description}</p>
//                   <div className="mb-6">
//                     <span className="text-3xl font-bold text-green-700">${service.price}</span>
//                     <span className="text-gray-500 ml-2">/ session</span>
//                   </div>
//                   <ul className="space-y-2 mb-6">
//                     {service.features.map((feature, index) => (
//                       <li key={index} className="flex items-center">
//                         <Check className="text-green-500 mr-2" size={18} />
//                         <span className="text-gray-700">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                   <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
//                     Book Now
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Here's what our clients say about our services.</p>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial) => (
//               <div key={testimonial.id} className="bg-gray-50 p-6 rounded-xl">
//                 <div className="flex items-center mb-4">
//                   <div className="flex text-yellow-400">
//                     {[...Array(5)].map((_, i) => (
//                       <Star 
//                         key={i} 
//                         className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : ''}`} 
//                       />
//                     ))}
//                   </div>
//                 </div>
//                 <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
//                 <div className="flex items-center">
//                   <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold mr-3">
//                     {testimonial.name.charAt(0)}
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-900">{testimonial.name}</p>
//                     <p className="text-sm text-gray-500">{testimonial.date}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="bg-green-800 text-white py-16">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience a Cleaner Home?</h2>
//           <p className="text-xl mb-8 max-w-2xl mx-auto">Book your cleaning service today and enjoy a spotless home without lifting a finger.</p>
//           <Link 
//             to="/book" 
//             className="inline-flex items-center bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
//           >
//             Book Your Cleaning Now <ArrowRight className="ml-2" />
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-12">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-4 gap-8">
//             <div>
//               <h3 className="text-xl font-bold mb-4">CleanCal</h3>
//               <p className="text-gray-400">Professional cleaning services for your home and office.</p>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Services</h4>
//               <ul className="space-y-2">
//                 <li><a href="#" className="text-gray-400 hover:text-white">House Cleaning</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white">Office Cleaning</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white">Deep Cleaning</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white">Move In/Out</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Company</h4>
//               <ul className="space-y-2">
//                 <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
//                 <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-semibold mb-4">Contact Us</h4>
//               <ul className="space-y-2 text-gray-400">
//                 <li>123 Clean Street</li>
//                 <li>Denver, CO 80202</li>
//                 <li>Phone: (555) 123-4567</li>
//                 <li>Email: info@cleancal.com</li>
//               </ul>
//             </div>
//           </div>
//           <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
//             <p>© {new Date().getFullYear()} CleanCal. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default HomePage;
