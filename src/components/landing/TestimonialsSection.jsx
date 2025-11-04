import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    content: 'SoloSync transformed how I manage my freelance business. Having everything in one place saves me hours every week. The interface is gorgeous!',
    rating: 5,
    color: 'purple'
  },
  {
    name: 'Marcus Johnson',
    role: 'Content Creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    content: 'Finally, a productivity app that actually works for creators. The content calendar and finance tracking are game-changers for my business.',
    rating: 5,
    color: 'blue'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Small Business Owner',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    content: 'I used to juggle 5 different apps. Now it\'s just SoloSync. The invoice management alone has paid for itself. Couldn\'t recommend it more!',
    rating: 5,
    color: 'emerald'
  },
  {
    name: 'David Park',
    role: 'Consultant',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    content: 'The habit tracking and goal features keep me accountable. The claymorphic design is so pleasant to use—I actually look forward to planning my day.',
    rating: 5,
    color: 'pink'
  },
  {
    name: 'Aisha Williams',
    role: 'Virtual Assistant',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    content: 'Managing multiple clients is so much easier now. The weekly planner with time blocking is exactly what I needed. Beautiful and functional!',
    rating: 5,
    color: 'orange'
  },
  {
    name: 'Tom Anderson',
    role: 'Photographer',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    content: 'As a visual person, the design of SoloSync immediately won me over. But it\'s the seamless sync between features that keeps me using it daily.',
    rating: 5,
    color: 'cyan'
  }
];

const colorGradients = {
  purple: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
  blue: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
  emerald: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
  pink: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
  orange: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
  cyan: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 100%)'
};

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
            filter: 'blur(100px)'
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

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
            <span className="text-gray-800">Loved by </span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Solo Professionals
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of freelancers, creators, and entrepreneurs who've transformed their workflow
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { label: 'Active Users', value: '10,000+' },
              { label: 'Average Rating', value: '4.9/5' },
              { label: 'Hours Saved', value: '50K+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="px-6 py-4 rounded-[16px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: `
                    0 8px 24px rgba(167, 139, 250, 0.15),
                    inset 0 2px 6px rgba(255, 255, 255, 0.8),
                    inset 0 -2px 6px rgba(167, 139, 250, 0.1)
                  `
                }}
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div
                className="p-8 rounded-[24px] h-full relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: `
                    0 8px 32px rgba(167, 139, 250, 0.15),
                    inset 0 2px 8px rgba(255, 255, 255, 0.9),
                    inset 0 -2px 8px rgba(167, 139, 250, 0.1)
                  `
                }}
              >
                {/* Quote Icon */}
                <div
                  className="absolute top-6 right-6 w-12 h-12 rounded-[14px] flex items-center justify-center opacity-20"
                  style={{
                    background: colorGradients[testimonial.color]
                  }}
                >
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-[14px] overflow-hidden"
                    style={{
                      boxShadow: `
                        0 4px 12px rgba(167, 139, 250, 0.2),
                        inset 0 2px 4px rgba(255, 255, 255, 0.3)
                      `
                    }}
                  >
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}