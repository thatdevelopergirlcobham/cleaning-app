import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import ServiceAreaMapSection from '../components/ServiceAreaMapSection';
import ProjectsGallerySection from '../components/ProjectsGallerySection';
import TestimonialsSection from '../components/TestimonialsSection';
import BlogSection from '../components/BlogSection';
import CallToActionSection from '../components/CallToActionSection';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <ServiceAreaMapSection />
      <ProjectsGallerySection />
      <TestimonialsSection />
      <BlogSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
};

export default HomePage;
