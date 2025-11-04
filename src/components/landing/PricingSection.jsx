import React from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
    features: [
      'Basic task management',
      'Up to 3 goals',
      'Habit tracking',
      'Weekly planner',
      'Content calendar (limited)',
      'Mobile app access'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For serious solo professionals',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    features: [
      'Everything in Free',
      'Unlimited tasks & goals',
      'Finance dashboard',
      'Invoice management',
      'Advanced analytics',
      'Custom widgets',
      'Priority support',
      'Integrations'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For teams and agencies',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced security',
      'Custom branding',
      'API access',
      'Dedicated support',
      'Training & onboarding',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-800">Simple, </span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>

          {/* 14-Day Trial Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-6 py-3 rounded-[16px]"
            style={{
              background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
              boxShadow: `
                0 4px 20px rgba(16, 185, 129, 0.15),
                inset 0 2px 6px rgba(255, 255, 255, 0.8),
                inset 0 -2px 6px rgba(16, 185, 129, 0.1)
              `
            }}
          >
            <span className="text-emerald-700 font-semibold">
              ✨ Try Pro free for 14 days—no credit card required
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative ${plan.popular ? 'md:scale-105' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-[12px] z-10"
                    style={{
                      background: plan.gradient,
                      boxShadow: `
                        0 4px 16px rgba(139, 92, 246, 0.4),
                        inset 0 2px 4px rgba(255, 255, 255, 0.3)
                      `
                    }}
                  >
                    <span className="text-white font-bold text-sm">MOST POPULAR</span>
                  </div>
                )}

                <div
                  className={`rounded-[24px] p-8 h-full ${
                    plan.popular ? 'border-2' : ''
                  }`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderColor: plan.popular ? 'rgba(167, 139, 250, 0.3)' : 'transparent',
                    boxShadow: plan.popular
                      ? `
                        0 20px 60px rgba(167, 139, 250, 0.3),
                        inset 0 4px 12px rgba(255, 255, 255, 0.9),
                        inset 0 -4px 12px rgba(167, 139, 250, 0.15)
                      `
                      : `
                        0 8px 32px rgba(167, 139, 250, 0.15),
                        inset 0 2px 8px rgba(255, 255, 255, 0.8),
                        inset 0 -2px 8px rgba(167, 139, 250, 0.1)
                      `
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-6"
                    style={{
                      background: plan.gradient,
                      boxShadow: `
                        0 8px 24px rgba(139, 92, 246, 0.3),
                        inset 0 2px 6px rgba(255, 255, 255, 0.3),
                        inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                      `
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Plan Name & Description */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-5xl font-bold text-gray-800">{plan.price}</span>
                      {plan.price !== 'Custom' && (
                        <span className="text-gray-500 mb-2">/{plan.period}</span>
                      )}
                    </div>
                    {plan.price === 'Custom' && (
                      <p className="text-sm text-gray-500">{plan.period}</p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full rounded-[16px] py-6 font-semibold text-lg mb-8 ${
                      plan.popular ? 'text-white' : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    style={
                      plan.popular
                        ? {
                            background: plan.gradient,
                            boxShadow: `
                              0 8px 24px rgba(139, 92, 246, 0.3),
                              inset 0 2px 6px rgba(255, 255, 255, 0.3),
                              inset 0 -2px 6px rgba(0, 0, 0, 0.1)
                            `
                          }
                        : {
                            borderWidth: '2px',
                            borderColor: 'rgba(167, 139, 250, 0.3)',
                            boxShadow: `
                              0 4px 16px rgba(167, 139, 250, 0.1),
                              inset 0 2px 6px rgba(255, 255, 255, 0.8)
                            `
                          }
                    }
                  >
                    {plan.cta}
                  </Button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <div
                          className="w-5 h-5 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
                            boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.3)`
                          }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ / Additional Info */}
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
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: `
                0 8px 32px rgba(167, 139, 250, 0.15),
                inset 0 2px 8px rgba(255, 255, 255, 0.8),
                inset 0 -2px 8px rgba(167, 139, 250, 0.1)
              `
            }}
          >
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Not sure which plan is right for you?</span>
            </p>
            <p className="text-gray-600">
              Start with our free plan and upgrade anytime. Questions?{' '}
              <a href="#" className="text-purple-600 font-semibold hover:text-purple-700">
                Contact us
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}