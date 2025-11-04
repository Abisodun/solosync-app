import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, CreditCard, Globe, Sparkles, Check, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    country: '',
    state_province: '',
    currency: 'USD'
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setProfileData({
      full_name: currentUser.full_name || '',
      country: currentUser.country || '',
      state_province: currentUser.state_province || '',
      currency: currentUser.currency || 'USD'
    });
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      loadUser();
      alert('Profile updated successfully!');
    }
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const startTrial = async () => {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    await base44.auth.updateMe({
      subscription_tier: 'pro',
      subscription_status: 'trial',
      trial_start_date: new Date().toISOString(),
      trial_end_date: trialEndDate.toISOString()
    });
    
    loadUser();
    alert('🎉 Your 14-day Pro trial has started! Enjoy all premium features.');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isFreeTier = user.subscription_tier === 'free';
  const isProTier = user.subscription_tier === 'pro';
  const isEnterpriseTier = user.subscription_tier === 'enterprise';
  const isOnTrial = user.subscription_status === 'trial';

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: Sparkles,
      gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
      features: ['Basic task management', 'Up to 3 goals', 'Habit tracking', 'Weekly planner']
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: '$12',
      period: 'per month',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      features: ['Everything in Free', 'Unlimited tasks & goals', 'Finance dashboard', 'Tax Prep Tools', 'AI Forecasting', 'Priority support']
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      icon: Crown,
      gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
      features: ['Everything in Pro', 'Team collaboration', 'Advanced security', 'Custom branding', 'Dedicated support']
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and subscription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Subscription & Billing</h2>
            </div>

            {/* Current Plan Status */}
            <div className="mb-6 p-5 rounded-[16px]" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Plan</div>
                  <div className="text-2xl font-bold text-gray-800 capitalize">
                    {user.subscription_tier}
                    {isOnTrial && <span className="ml-2 text-sm font-normal text-blue-600">(Trial)</span>}
                  </div>
                  {isOnTrial && user.trial_end_date && (
                    <div className="text-sm text-gray-600 mt-2">
                      Trial ends on {format(parseISO(user.trial_end_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                  {isProTier && !isOnTrial && (
                    <div className="text-sm text-gray-600 mt-2">
                      Billing cycle: {user.billing_cycle || 'monthly'}
                    </div>
                  )}
                </div>
                {isProTier && (
                  <div className="px-4 py-2 rounded-[10px] bg-green-100 text-green-700 text-sm font-semibold">
                    Active
                  </div>
                )}
              </div>
            </div>

            {/* Available Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Available Plans</h3>
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = user.subscription_tier === plan.tier;
                
                return (
                  <Card
                    key={plan.tier}
                    className={`p-6 rounded-[16px] ${isCurrent ? 'border-2 border-purple-400' : ''}`}
                    style={{ background: 'rgba(255, 255, 255, 0.95)' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.gradient }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                            {isCurrent && (
                              <span className="px-3 py-1 rounded-[8px] bg-purple-100 text-purple-700 text-xs font-semibold">
                                Current Plan
                              </span>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-gray-800 mb-3">
                            {plan.price}
                            {plan.price !== 'Custom' && <span className="text-sm text-gray-500 font-normal ml-2">/{plan.period}</span>}
                          </div>
                          <div className="space-y-2">
                            {plan.features.map((feature, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {!isCurrent && plan.tier === 'pro' && isFreeTier && (
                          <Button
                            onClick={startTrial}
                            className="rounded-[12px] text-white font-semibold"
                            style={{ background: plan.gradient }}
                          >
                            Start 14-Day Trial
                          </Button>
                        )}
                        {!isCurrent && plan.tier === 'enterprise' && (
                          <Button
                            className="rounded-[12px]"
                            variant="outline"
                          >
                            Contact Sales
                          </Button>
                        )}
                        {isCurrent && plan.tier !== 'free' && (
                          <Button
                            variant="outline"
                            className="rounded-[12px]"
                          >
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Payment Info Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-[12px] border border-blue-200">
              <p className="text-sm text-blue-800">
                💳 <strong>Secure Payment:</strong> Payments are processed securely via Stripe. Your card information is never stored on our servers.
              </p>
            </div>
          </Card>

          {/* Profile Settings */}
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
                <Input
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="rounded-[12px]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
                <Input
                  value={user.email}
                  disabled
                  className="rounded-[12px] bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Country</label>
                  <Input
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className="rounded-[12px]"
                    placeholder="e.g., United States"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">State/Province</label>
                  <Input
                    value={profileData.state_province}
                    onChange={(e) => setProfileData({ ...profileData, state_province: e.target.value })}
                    className="rounded-[12px]"
                    placeholder="e.g., California"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Currency</label>
                <Select value={profileData.currency} onValueChange={(value) => setProfileData({ ...profileData, currency: value })}>
                  <SelectTrigger className="rounded-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full rounded-[12px] text-white"
                style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
              >
                Save Changes
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <div className="font-medium text-gray-800">{user.email}</div>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <div className="font-medium text-gray-800 capitalize">{user.role}</div>
              </div>
              <div>
                <span className="text-gray-500">Member since:</span>
                <div className="font-medium text-gray-800">
                  {format(parseISO(user.created_date), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[20px]" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Have questions about your subscription or billing?
            </p>
            <Button
              variant="outline"
              className="w-full rounded-[12px]"
            >
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}