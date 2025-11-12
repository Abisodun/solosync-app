import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles, Target, DollarSign, Calendar, Heart, LayoutGrid, TrendingUp, Users, Star, Play, Check, Zap, Clock, FileText, BarChart3, LogIn, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import HeroSection from '../components/landing/HeroSection';
import FeaturesShowcase from '../components/landing/FeaturesShowcase';
import DayInLifeSection from '../components/landing/DayInLifeSection';
import ComparisonSection from '../components/landing/ComparisonSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import DemoSection from '../components/landing/DemoSection';
import PricingSection from '../components/landing/PricingSection';
import Footer from '../components/landing/Footer';
import FloatingCTA from '../components/landing/FloatingCTA';
import Logo from '../components/landing/Logo';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = () => {
    // Redirect to login/signup, then to onboarding after successful auth
    base44.auth.redirectToLogin(createPageUrl('Onboarding'));
  };

  const handleLoginClick = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF]">
      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          scrolled ? 'w-[95%] max-w-6xl' : 'w-[95%] sm:w-[90%] max-w-5xl'
        }`}
      >
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 rounded-[16px] sm:rounded-[20px] backdrop-blur-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            boxShadow: `
              0 8px 32px rgba(167, 139, 250, 0.15),
              inset 0 2px 8px rgba(255, 255, 255, 0.8),
              inset 0 -2px 8px rgba(167, 139, 250, 0.1)
            `
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SoloSync
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Features</button>
              <button onClick={() => scrollToSection('comparison')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Compare</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Reviews</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Pricing</button>
              <button
                onClick={handleLoginClick}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
            </div>

            {/* Mobile & Tablet - CTA + Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={handleCTAClick}
                size="sm"
                className="rounded-[10px] sm:rounded-[14px] px-3 sm:px-6 text-xs sm:text-sm text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: `
                    0 4px 16px rgba(139, 92, 246, 0.3),
                    inset 0 2px 4px rgba(255, 255, 255, 0.3),
                    inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                  `
                }}
              >
                Start Free
              </Button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-[10px] hover:bg-purple-50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-2"
              >
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full text-left px-4 py-2 rounded-[10px] text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('comparison')}
                  className="w-full text-left px-4 py-2 rounded-[10px] text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
                >
                  Compare
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="w-full text-left px-4 py-2 rounded-[10px] text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="w-full text-left px-4 py-2 rounded-[10px] text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium"
                >
                  Pricing
                </button>
                <button
                  onClick={handleLoginClick}
                  className="w-full text-left px-4 py-2 rounded-[10px] text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* Features Showcase */}
      <div id="features">
        <FeaturesShowcase />
      </div>

      {/* Day in Life Section */}
      <DayInLifeSection />

      {/* Comparison Section */}
      <div id="comparison">
        <ComparisonSection />
      </div>

      {/* Demo Section */}
      <DemoSection />

      {/* Testimonials */}
      <div id="testimonials">
        <TestimonialsSection />
      </div>

      {/* Pricing */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
}