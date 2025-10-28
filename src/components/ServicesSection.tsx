import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";

const servicesData = [
  {
    image: "/img/cleaning.jpg",
    title: "House Cleaning",
    description:
      "We offer premium cleaning services for every room in your home to meet the specific needs of your family!",
    features: [
      "Premium cleaning tailored to every room in your home.",
      "Premium cleaning tailored to every room in your home.",
      "Premium cleaning tailored to every room in your home.",
    ],
  },
  {
    image: "https://placehold.co/400x450/e2f0c9/1E3928?text=Office+Cleaning",
    title: "Office Cleaning",
    description:
      "A clean office environment boosts productivity. We handle everything from desks to break rooms.",
    features: [
      "Flexible scheduling (after hours, weekends).",
      "Disinfection of high-touch surfaces.",
      "Reliable and professional janitorial services.",
    ],
  },
  {
    image: "https://placehold.co/400x450/e2f0c9/1E3928?text=Deep+Cleaning",
    title: "Deep Cleaning",
    description:
      "Our deep cleaning service is perfect for spring cleaning or moving in/out.",
    features: [
      "Inside of appliances (oven, fridge).",
      "Baseboards, window sills, and blinds.",
      "Detailed grout and tile scrubbing.",
    ],
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-[#f7f9f8] py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* === Header === */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f3b2e] leading-tight">
              Our Cleaning Services
            </h2>
            <p className="mt-4 text-gray-500 max-w-2xl leading-relaxed">
              At BlueSpring Cleaning, our goal is to provide tailored cleaning
              packages that cater to your specific needs. Choose the package
              that best fits your home best s and experience the difference!
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
            <Link
              to="/book"
              className="px-6 py-3 rounded-full bg-[#81d742] text-[#0f3b2e] font-semibold hover:bg-[#73c13c] transition"
            >
              Book A Cleaning Now
            </Link>
            <a
              href="tel:3033094226"
              className="px-6 py-3 rounded-full border border-[#0f3b2e] text-[#0f3b2e] font-semibold hover:bg-gray-100 transition"
            >
              (303) 309 4226
            </a>
          </div>
        </div>

        {/* === Slider === */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-next-services",
              prevEl: ".swiper-prev-services",
            }}
            pagination={{
              el: ".swiper-pagination-services",
              clickable: true,
            }}
            className="pb-16"
          >
            {servicesData.map((service, index) => (
              <SwiperSlide key={index}>
                <div className="relative flex flex-col md:flex-row items-center justify-center rounded-3xl shadow-xl ml-20 p-10 md:p-5 mx-7 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                    {/* Image */}
                    <div className="flex justify-center">
                      <div className="w-[250px] h-[250px] absolute -left-20 top-1/2 z-20 -translate-y-1/2 rounded-full overflow-hidden  ">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover z-40  "
                        />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-left ">
                      <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#81d742] text-[#0f3b2e] font-bold text-xl mb-4">
                        {index + 1}
                      </span>
                      <h3 className="text-3xl font-bold text-[#0f3b2e] mb-4">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {service.description}
                      </p>
                      <ul className="space-y-3">
                        {service.features.map((feature, fIndex) => (
                          <li
                            key={fIndex}
                            className="flex items-center gap-3 text-gray-700"
                          >
                            <Check size={20} className="text-[#81d742]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows */}
          <div className="swiper-prev-services absolute top-1/2 -translate-y-1/2 -left-10 z-10 cursor-pointer w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#0f3b2e] hover:bg-gray-100 -translate-x-1/2">
            <ChevronLeft size={24} />
          </div>
          <div className="swiper-next-services absolute top-1/2 -translate-y-1/2 -right-10 z-10 cursor-pointer w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center text-[#0f3b2e] hover:bg-gray-100 translate-x-1/2">
            <ChevronRight size={24} />
          </div>

          {/* Pagination Dots */}
          <div className="swiper-pagination-services text-center absolute bottom-[-40px] left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>

      {/* === Swiper Dot Custom Style === */}
      <style>{`
        .swiper-pagination-bullet {
          background: #cbd5c0 !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: #81d742 !important;
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;

