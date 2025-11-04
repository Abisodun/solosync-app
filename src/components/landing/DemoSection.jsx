import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, Target, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

export default function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-800">See </span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SoloSync in Action
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how SoloSync brings all your productivity tools together in one seamless experience
          </p>
        </motion.div>

        {/* Video Demo Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div
            className="rounded-[24px] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `
                0 20px 60px rgba(167, 139, 250, 0.3),
                inset 0 4px 12px rgba(255, 255, 255, 0.9),
                inset 0 -4px 12px rgba(167, 139, 250, 0.15)
              `
            }}
          >
            {/* Video Placeholder */}
            <div
              className="aspect-video relative flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)'
              }}
            >
              {/* Animated Dashboard Preview */}
              <div className="absolute inset-0 p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                  {/* Task Widget */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="p-6 rounded-[20px] col-span-1 md:col-span-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: `
                        0 4px 20px rgba(167, 139, 250, 0.15),
                        inset 0 2px 8px rgba(255, 255, 255, 0.8),
                        inset 0 -2px 8px rgba(167, 139, 250, 0.1)
                      `
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                          boxShadow: `0 4px 12px rgba(139, 92, 246, 0.3)`
                        }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800">Active Tasks</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Design landing page', progress: 80 },
                        { label: 'Client meeting prep', progress: 60 },
                        { label: 'Invoice follow-up', progress: 30 }
                      ].map((task, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="p-3 rounded-[14px]"
                          style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            boxShadow: `inset 0 2px 6px rgba(167, 139, 250, 0.08)`
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-700">{task.label}</span>
                            <span className="text-xs text-purple-600 font-medium">{task.progress}%</span>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'rgba(167, 139, 250, 0.15)' }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${task.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              className="h-full rounded-full"
                              style={{
                                background: 'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)'
                              }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Stats Widget */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="p-6 rounded-[20px] space-y-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: `
                        0 4px 20px rgba(134, 239, 172, 0.15),
                        inset 0 2px 8px rgba(255, 255, 255, 0.8),
                        inset 0 -2px 8px rgba(134, 239, 172, 0.1)
                      `
                    }}
                  >
                    {[
                      { icon: Target, label: 'Goals', value: '8/10' },
                      { icon: Calendar, label: 'Events', value: '12' },
                      { icon: TrendingUp, label: 'Revenue', value: '$8.5K' }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="p-3 rounded-[12px]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.7)',
                          boxShadow: `inset 0 2px 6px rgba(134, 239, 172, 0.08)`
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
                            }}
                          >
                            <stat.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">{stat.label}</div>
                            <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Play Button Overlay */}
              {!isPlaying && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
                >
                  <div
                    className="w-20 h-20 rounded-[18px] flex items-center justify-center transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                      boxShadow: `
                        0 12px 40px rgba(139, 92, 246, 0.5),
                        inset 0 2px 8px rgba(255, 255, 255, 0.3),
                        inset 0 -2px 8px rgba(0, 0, 0, 0.1)
                      `
                    }}
                  >
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </motion.button>
              )}
            </div>

            {/* Features List Below Video */}
            <div
              className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6"
              style={{
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.03) 0%, rgba(147, 197, 253, 0.03) 100%)'
              }}
            >
              {[
                { icon: Sparkles, label: 'Intuitive Interface', desc: 'Beautiful design that\'s a joy to use' },
                { icon: CheckCircle2, label: 'Seamless Sync', desc: 'All features work together perfectly' },
                { icon: TrendingUp, label: 'Smart Insights', desc: 'Data-driven productivity tips' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                      boxShadow: `0 4px 12px rgba(139, 92, 246, 0.2)`
                    }}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">{feature.label}</div>
                    <div className="text-sm text-gray-600">{feature.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Below Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to experience it yourself?
          </p>
          <Button
            size="lg"
            className="rounded-[18px] px-8 py-6 text-lg font-semibold text-white"
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
          </Button>
        </motion.div>
      </div>
    </section>
  );
}