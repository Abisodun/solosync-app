
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 500) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div
            className="rounded-[20px] p-6 shadow-2xl relative"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              boxShadow: `
                0 20px 60px rgba(139, 92, 246, 0.3),
                inset 0 2px 8px rgba(255, 255, 255, 0.9),
                inset 0 -2px 8px rgba(167, 139, 250, 0.1)
              `
            }}
          >
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Ready to get organized?
              </h3>
              <p className="text-sm text-gray-600">
                Join 10,000+ solo professionals using SoloSync
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => window.location.href = createPageUrl('Onboarding')}
              className="w-full py-3 px-6 rounded-[16px] text-white font-semibold flex items-center justify-center gap-2 group transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                boxShadow: `
                  0 8px 24px rgba(139, 92, 246, 0.4),
                  inset 0 2px 6px rgba(255, 255, 255, 0.3),
                  inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                `
              }}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Badge */}
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                ⭐ 4.9/5 from 1,200+ reviews
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
