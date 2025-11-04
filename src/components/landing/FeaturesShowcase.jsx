
import React from 'react';
import { CheckCircle2, Target, DollarSign, Calendar, Heart, LayoutGrid, TrendingUp, Clock, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CheckCircle2,
    title: 'Task Management',
    description: 'Organize, prioritize, and track your tasks with intuitive boards and smart reminders.',
    example: 'Example: Organize your web design project into phases with deadline tracking',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set ambitious goals and break them down into actionable milestones with visual progress.',
    example: 'Example: Track "Acquire 5 new clients this quarter" with weekly milestones',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)'
  },
  {
    icon: DollarSign,
    title: 'Finance Management',
    description: 'Track income, expenses, and profits with beautiful dashboards and smart insights.',
    example: 'Example: See monthly revenue trends and categorize business expenses',
    gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
  },
  {
    icon: Calendar,
    title: 'Content Calendar',
    description: 'Plan, schedule, and manage all your content across platforms in one unified view.',
    example: 'Example: Plan Instagram posts, blog articles, and newsletters for the month',
    gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(147, 197, 253, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
  },
  {
    icon: Heart,
    title: 'Habit Tracking',
    description: 'Build positive routines and break bad habits with streaks, reminders, and motivation.',
    example: 'Example: Build a 30-day meditation habit with daily check-ins and streaks',
    gradient: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(252, 165, 165, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
  },
  {
    icon: Clock,
    title: 'Weekly Planner',
    description: 'Visualize your week at a glance with drag-and-drop scheduling and time blocking.',
    example: 'Example: Block Mondays for client calls, Wednesdays for deep work sessions',
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(252, 211, 77, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
  },
  {
    icon: TrendingUp,
    title: 'Invoice Management',
    description: 'Create professional invoices, track payments, and manage client billing effortlessly.',
    example: 'Example: Generate branded invoices and track which clients still need to pay',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)'
  },
  {
    icon: Calculator,
    title: 'Tax Prep Tools',
    description: 'Organize finances, get AI deduction tips, and export reports for tax season prep.',
    example: 'Example: Generate annual income/expense summaries with deduction recommendations',
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(252, 211, 77, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
  },
  {
    icon: LayoutGrid,
    title: 'Customizable Widgets',
    description: 'Design your perfect workspace with drag-and-drop widgets tailored to your workflow.',
    example: 'Example: Create a dashboard with tasks, revenue, and upcoming deadlines',
    gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    bgGradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
  }
];

export default function FeaturesShowcase() {
  return (
    <section id="features" className="py-20 px-4 md:px-8 relative">
      {/* Background with better contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(249, 250, 251, 0.95) 0%, rgba(243, 244, 246, 0.95) 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-gray-800">In One Platform</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stop juggling multiple apps. SoloSync brings all your productivity tools together in one beautiful, intuitive workspace.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div
                  className="p-8 rounded-[24px] h-full transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: `
                      0 8px 32px rgba(167, 139, 250, 0.15),
                      inset 0 2px 8px rgba(255, 255, 255, 0.8),
                      inset 0 -2px 8px rgba(167, 139, 250, 0.1)
                    `
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-[18px] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: feature.gradient,
                      boxShadow: `
                        0 8px 24px ${feature.gradient.match(/rgba?\([^)]+\)/)?.[0] || 'rgba(167, 139, 250, 0.3)'},
                        inset 0 2px 6px rgba(255, 255, 255, 0.3),
                        inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                      `
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  
                  {/* Example */}
                  <p className="text-sm text-purple-600 italic leading-relaxed">
                    {feature.example}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-block px-8 py-6 rounded-[20px]"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `
                0 12px 40px rgba(167, 139, 250, 0.25),
                inset 0 2px 8px rgba(255, 255, 255, 0.9),
                inset 0 -2px 8px rgba(167, 139, 250, 0.15)
              `
            }}
          >
            <p className="text-xl text-gray-700 mb-4 font-semibold">
              Ready to sync your entire workflow?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-[16px] px-8 py-6 text-white font-semibold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: `
                    0 8px 24px rgba(139, 92, 246, 0.4),
                    inset 0 2px 6px rgba(255, 255, 255, 0.3),
                    inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                  `
                }}
              >
                Start Free Trial →
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-[16px] px-8 py-6 font-semibold border-2"
                style={{
                  borderColor: 'rgba(167, 139, 250, 0.3)',
                  boxShadow: `
                    0 4px 16px rgba(167, 139, 250, 0.1),
                    inset 0 2px 6px rgba(255, 255, 255, 0.8)
                  `
                }}
              >
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✓ 14-day free trial • No credit card required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
