import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles, Target, DollarSign, Calendar, Heart, LayoutGrid, TrendingUp, Users, Star, Play, Check, Zap, Clock, FileText, BarChart3, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF]">
      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          scrolled ? 'w-[95%] max-w-6xl' : 'w-[90%] max-w-5xl'
        }`}
      >
        <div
          className="px-6 py-4 rounded-[20px] backdrop-blur-lg"
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
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SoloSync
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Features</a>
              <a href="#comparison" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Compare</a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Reviews</a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Pricing</a>
              <button
                onClick={handleLoginClick}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCTAClick}
                className="rounded-[14px] px-6 text-white font-medium"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: `
                    0 4px 16px rgba(139, 92, 246, 0.3),
                    inset 0 2px 4px rgba(255, 255, 255, 0.3),
                    inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                  `
                }}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Showcase */}
      <FeaturesShowcase />

      {/* Day in Life Section */}
      <DayInLifeSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <PricingSection />

      {/* Footer */}
      <Footer />

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
}