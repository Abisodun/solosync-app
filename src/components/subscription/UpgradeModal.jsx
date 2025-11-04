import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Zap, Crown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createPageUrl } from '@/utils';

const plans = [
  {
    tier: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'per month',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    features: [
      'Unlimited tasks & goals',
      'Finance dashboard',
      'Invoice management',
      'Tax Prep Tools',
      'AI Financial Forecasting',
      'Advanced analytics',
      'Priority support'
    ],
    popular: true
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced security',
      'Custom branding',
      'API access',
      'Dedicated support',
      'SLA guarantee'
    ],
    popular: false
  }
];

export default function UpgradeModal({ isOpen, onClose, featureName }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <Card
            className="p-8 rounded-[24px]"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-[10px] transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Unlock {featureName || 'Premium Features'}
              </h2>
              <p className="text-lg text-gray-600">
                Upgrade to Pro or Enterprise to access this feature and more
              </p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <motion.div
                    key={plan.tier}
                    whileHover={{ y: -4 }}
                    className="relative"
                  >
                    {plan.popular && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-[10px] text-xs font-bold text-white z-10"
                        style={{ background: plan.gradient }}
                      >
                        MOST POPULAR
                      </div>
                    )}
                    <Card
                      className={`p-6 rounded-[20px] h-full ${plan.popular ? 'border-2 border-purple-300' : ''}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: plan.popular
                          ? '0 12px 40px rgba(167, 139, 250, 0.25)'
                          : '0 8px 24px rgba(167, 139, 250, 0.15)'
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                        style={{ background: plan.gradient }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                        {plan.price !== 'Custom' && (
                          <span className="text-gray-500 ml-2">/{plan.period}</span>
                        )}
                      </div>
                      <a href={createPageUrl('Settings')}>
                        <Button
                          className="w-full rounded-[12px] mb-6 text-white font-semibold"
                          style={{ background: plan.gradient }}
                        >
                          {plan.tier === 'enterprise' ? 'Contact Sales' : 'Start 14-Day Trial'}
                        </Button>
                      </a>
                      <div className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div
                              className="w-5 h-5 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>✓ 14-day free trial • No credit card required • Cancel anytime</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}