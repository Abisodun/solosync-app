
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Circle, TrendingUp, Target, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

export default function HeroSection() {
  const handleCTAClick = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user.onboarding_completed) {
          window.location.href = createPageUrl('Dashboard');
        } else {
          window.location.href = createPageUrl('Onboarding');
        }
      } else {
        base44.auth.redirectToLogin(createPageUrl('Onboarding'));
      }
    } catch (error) {
      console.error('Error in CTA click:', error);
      base44.auth.redirectToLogin(createPageUrl('Onboarding'));
    }
  };

  return (
    <section className="pt-40 pb-20 px-4 md:px-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 rounded-[24px] opacity-40"
          style={{
            background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
            boxShadow: `
              0 8px 32px rgba(167, 139, 250, 0.4),
              inset 0 4px 8px rgba(255, 255, 255, 0.3)
            `
          }}
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-24 h-24 rounded-[20px] opacity-40"
          style={{
            background: 'linear-gradient(135deg, #86EFAC 0%, #6EE7B7 100%)',
            boxShadow: `
              0 8px 32px rgba(134, 239, 172, 0.4),
              inset 0 4px 8px rgba(255, 255, 255, 0.3)
            `
          }}
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-20 h-20 rounded-[18px] opacity-40"
          style={{
            background: 'linear-gradient(135deg, #93C5FD 0%, #BFDBFE 100%)',
            boxShadow: `
              0 8px 32px rgba(147, 197, 253, 0.4),
              inset 0 4px 8px rgba(255, 255, 255, 0.3)
            `
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[16px] mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: `
                0 4px 20px rgba(167, 139, 250, 0.2),
                inset 0 2px 6px rgba(255, 255, 255, 0.8),
                inset 0 -2px 6px rgba(167, 139, 250, 0.1)
              `
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-800">All-in-One Productivity Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-gray-800">Work. Create. Thrive.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              All in One Place
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-medium"
          >
            Task planning, habits, finances, invoices, and content—all synced in one beautiful workspace designed for solo professionals.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="rounded-[18px] px-8 py-6 text-lg font-semibold text-white group"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                boxShadow: `
                  0 8px 32px rgba(139, 92, 246, 0.4),
                  inset 0 2px 6px rgba(255, 255, 255, 0.3),
                  inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                `
              }}
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-[18px] px-8 py-6 text-lg font-semibold border-2"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'rgba(167, 139, 250, 0.3)',
                boxShadow: `
                  0 4px 20px rgba(167, 139, 250, 0.15),
                  inset 0 2px 6px rgba(255, 255, 255, 0.8),
                  inset 0 -2px 6px rgba(167, 139, 250, 0.1)
                `
              }}
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Cancel anytime</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual - Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          <div
            className="rounded-[24px] p-8 md:p-12"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `
                0 20px 60px rgba(167, 139, 250, 0.3),
                inset 0 4px 12px rgba(255, 255, 255, 0.9),
                inset 0 -4px 12px rgba(167, 139, 250, 0.15)
              `
            }}
          >
            {/* Mock Dashboard UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Task Widget */}
              <div
                className="p-6 rounded-[20px] col-span-1 md:col-span-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(196, 181, 253, 0.1) 100%)',
                  boxShadow: `
                    0 4px 16px rgba(167, 139, 250, 0.15),
                    inset 0 2px 8px rgba(255, 255, 255, 0.6),
                    inset 0 -2px 8px rgba(167, 139, 250, 0.1)
                  `
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                        boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">Today's Tasks</span>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">3/8 completed</span>
                </div>
                <div className="space-y-3">
                  {[
                    { task: 'Finish client proposal', done: true },
                    { task: 'Review marketing strategy', done: true },
                    { task: 'Update portfolio website', done: false }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-[14px]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        boxShadow: `
                          inset 0 2px 6px rgba(167, 139, 250, 0.1),
                          0 2px 8px rgba(167, 139, 250, 0.08)
                        `
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-[8px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: item.done
                            ? 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
                            : 'rgba(167, 139, 250, 0.15)',
                          boxShadow: item.done ? `inset 0 2px 4px rgba(255, 255, 255, 0.3)` : 'none'
                        }}
                      >
                        {item.done ? (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        ) : (
                          <Circle className="w-3 h-3 text-purple-400" />
                        )}
                      </div>
                      <span className={`text-sm ${item.done ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>
                        {item.task}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats Widget */}
              <div
                className="p-6 rounded-[20px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(110, 231, 183, 0.1) 100%)',
                  boxShadow: `
                    0 4px 16px rgba(134, 239, 172, 0.15),
                    inset 0 2px 8px rgba(255, 255, 255, 0.6),
                    inset 0 -2px 8px rgba(134, 239, 172, 0.1)
                  `
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #86EFAC 0%, #6EE7B7 100%)',
                      boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Progress</span>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Target, label: 'Weekly Goals', value: '7/10', color: '#F472B6' },
                    { icon: TrendingUp, label: 'Tasks Done', value: '24', color: '#A78BFA' },
                    { icon: DollarSign, label: 'Revenue', value: '$3.2K', color: '#86EFAC' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="px-3 py-2.5 rounded-[12px]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        boxShadow: `
                          inset 0 2px 6px rgba(134, 239, 172, 0.1),
                          0 2px 8px rgba(134, 239, 172, 0.08)
                        `
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                          <span className="text-xs text-gray-600">{stat.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{stat.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
