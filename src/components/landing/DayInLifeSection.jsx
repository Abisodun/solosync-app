
import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Target, DollarSign, FileText, Calendar, TrendingUp, Award } from 'lucide-react';
import { createPageUrl } from '@/utils';

const timeline = [
  {
    time: '8:30 AM',
    icon: Coffee,
    title: 'Morning Review',
    description: 'Check today\'s tasks and weekly goals',
    color: '#A78BFA'
  },
  {
    time: '9:00 AM',
    icon: Target,
    title: 'Time Blocking',
    description: 'Block focused time for client projects',
    color: '#93C5FD'
  },
  {
    time: '10:00 AM',
    icon: DollarSign,
    title: 'Finance Check',
    description: 'Update expenses and revenue tracking',
    color: '#86EFAC'
  },
  {
    time: '12:00 PM',
    icon: FileText,
    title: 'Send Invoice',
    description: 'Create and send professional invoices',
    color: '#FCD34D'
  },
  {
    time: '2:00 PM',
    icon: Calendar,
    title: 'Content Planning',
    description: 'Schedule next week\'s social posts',
    color: '#F472B6'
  },
  {
    time: '5:00 PM',
    icon: Award,
    title: 'Habit Streak',
    description: 'Mark daily habits and celebrate progress',
    color: '#34D399'
  }
];

export default function DayInLifeSection() {
  return (
    <section className="py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.08) 0%, rgba(167, 139, 250, 0.08) 100%)'
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-800">A Day in the Life </span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              with SoloSync
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Alex, a freelance designer, uses SoloSync to stay organized and productive throughout the day
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden md:block"
            style={{
              background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.3) 0%, rgba(147, 197, 253, 0.3) 100%)'
            }}
          />

          {/* Timeline Items */}
          <div className="space-y-12">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div
                      className="inline-block p-6 rounded-[20px] text-left"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: `
                          0 8px 32px rgba(167, 139, 250, 0.15),
                          inset 0 2px 8px rgba(255, 255, 255, 0.9),
                          inset 0 -2px 8px rgba(167, 139, 250, 0.1)
                        `
                      }}
                    >
                      <div className="text-sm font-semibold text-purple-600 mb-2">{item.time}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-[18px] flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{
                      background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}CC 100%)`,
                      boxShadow: `
                        0 8px 24px ${item.color}66,
                        inset 0 2px 6px rgba(255, 255, 255, 0.3),
                        inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                      `
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => window.location.href = createPageUrl('Onboarding')}
            className="px-10 py-5 rounded-[18px] text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              boxShadow: `
                0 12px 40px rgba(139, 92, 246, 0.4),
                inset 0 2px 8px rgba(255, 255, 255, 0.3),
                inset 0 -2px 8px rgba(0, 0, 0, 0.1)
              `
            }}
          >
            Start Your Productive Day →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
