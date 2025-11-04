
import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const comparisons = [
  { feature: 'Task Management', solosync: true, others: true },
  { feature: 'Goal Tracking', solosync: true, others: false },
  { feature: 'Finance Dashboard', solosync: true, others: false },
  { feature: 'Invoice Creation', solosync: true, others: false },
  { feature: 'Content Calendar', solosync: true, others: false },
  { feature: 'Habit Tracking', solosync: true, others: false },
  { feature: 'Weekly Planner', solosync: true, others: true },
  { feature: 'Customizable Widgets', solosync: true, others: false },
  { feature: 'All-in-One Platform', solosync: true, others: false },
  { feature: 'Mobile Optimized', solosync: true, others: true },
  { feature: 'Unified Sync', solosync: true, others: false },
  { feature: 'Smart Insights', solosync: true, others: false }
];

export default function ComparisonSection() {
  return (
    <section id="comparison" className="py-20 px-4 md:px-8 relative">
      {/* Alternating background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%)'
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
            <span className="text-gray-800">Why Choose </span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SoloSync?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how SoloSync compares to juggling multiple productivity apps
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[24px] overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: `
              0 20px 60px rgba(167, 139, 250, 0.2),
              inset 0 4px 12px rgba(255, 255, 255, 0.9),
              inset 0 -4px 12px rgba(167, 139, 250, 0.15)
            `
          }}
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-purple-100">
            <div className="text-gray-600 font-semibold">Feature</div>
            <div className="text-center">
              <div
                className="inline-block px-6 py-2 rounded-[14px]"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: `
                    0 4px 16px rgba(139, 92, 246, 0.3),
                    inset 0 2px 6px rgba(255, 255, 255, 0.3),
                    inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                  `
                }}
              >
                <span className="text-white font-bold">SoloSync</span>
              </div>
            </div>
            <div className="text-center">
              <div
                className="inline-block px-6 py-2 rounded-[14px]"
                style={{
                  background: 'rgba(156, 163, 175, 0.2)',
                  boxShadow: `
                    inset 0 2px 6px rgba(156, 163, 175, 0.15),
                    0 2px 8px rgba(156, 163, 175, 0.1)
                  `
                }}
              >
                <span className="text-gray-600 font-semibold">Other Apps</span>
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-purple-50">
            {comparisons.map((item, index) => (
              <motion.div
                key={item.feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="grid grid-cols-3 gap-4 p-6 hover:bg-purple-50/30 transition-colors"
              >
                <div className="text-gray-700 font-medium">{item.feature}</div>
                <div className="flex justify-center">
                  {item.solosync ? (
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
                        boxShadow: `
                          0 4px 12px rgba(16, 185, 129, 0.3),
                          inset 0 2px 4px rgba(255, 255, 255, 0.3)
                        `
                      }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        boxShadow: `inset 0 2px 4px rgba(239, 68, 68, 0.1)`
                      }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  {item.others ? (
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
                        boxShadow: `
                          0 4px 12px rgba(16, 185, 129, 0.3),
                          inset 0 2px 4px rgba(255, 255, 255, 0.3)
                        `
                      }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        boxShadow: `inset 0 2px 4px rgba(239, 68, 68, 0.1)`
                      }}
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA - Enhanced */}
          <div
            className="p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
            }}
          >
            <p className="text-xl text-gray-700 mb-4 font-bold">
              Get everything you need in one platform
            </p>
            <p className="text-gray-600 mb-6">
              Say goodbye to app-switching and hello to productivity
            </p>
            <Button
              size="lg"
              className="rounded-[18px] px-10 py-6 text-white font-bold text-lg transition-all hover:scale-105 group"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                boxShadow: `
                  0 12px 40px rgba(139, 92, 246, 0.4),
                  inset 0 2px 8px rgba(255, 255, 255, 0.3),
                  inset 0 -2px 8px rgba(0, 0, 0, 0.1)
                `
              }}
            >
              Try SoloSync Free
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Join 10,000+ professionals who made the switch
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
