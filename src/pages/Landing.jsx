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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SoloSync
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('comparison')} 
                className="text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm"
              >
                Compare
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')} 
                className="text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm"
              >
                Reviews
              </button>
              <button 
                onClick={() => scrollToSection('pricing')} 
                className="text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm"
              >
                Pricing
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Login Button */}
              <button
                onClick={handleLoginClick}
                className="hidden lg:inline-flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm"
              >
                Login
              </button>

              {/* Sign Up Button */}
              <Button
                onClick={handleCTAClick}
                className="hidden sm:inline-flex rounded-md px-5 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </Button>

              {/* Mobile: Compact CTA */}
              <Button
                onClick={handleCTAClick}
                size="sm"
                className="sm:hidden rounded-md px-3 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800"
              >
                Sign Up
              </Button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
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
                className="lg:hidden border-t border-gray-200"
              >
                <div className="py-4 space-y-1">
                  <button
                    onClick={() => scrollToSection('features')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold text-sm"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection('comparison')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold text-sm"
                  >
                    Compare
                  </button>
                  <button
                    onClick={() => scrollToSection('testimonials')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold text-sm"
                  >
                    Reviews
                  </button>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold text-sm"
                  >
                    Pricing
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors font-semibold text-sm flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Add padding-top to account for fixed header */}
      <div className="pt-16">
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
    </div>
  );
}