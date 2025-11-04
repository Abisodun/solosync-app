
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, CreditCard, Globe, Sparkles, Check, Crown, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

// Helper function to sanitize input
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return '';
  // Basic sanitization: trim whitespace. Additional sanitization for XSS prevention might be required
  // if these inputs are rendered directly in HTML in other parts of the application.
  return value.trim();
};

// Helper function to validate and truncate input
const validateInput = (value, maxLength) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
};

// Helper function to handle errors
const handleError = (error, context = 'Operation') => {
  console.error(`${context} failed:`, error);
  let message = 'An unexpected error occurred. Please try again.';
  if (error.response && error.response.data && error.response.data.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  return { message, error };
};

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    country: '',
    state_province: '',
    currency: 'USD'
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setProfileData({
        full_name: validateInput(currentUser.full_name || '', 100),
        country: validateInput(currentUser.country || '', 100),
        state_province: validateInput(currentUser.state_province || '', 100),
        currency: currentUser.currency || 'USD'
      });
    } catch (error) {
      handleError(error, 'Loading user settings');
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      loadUser();
      setSuccessMessage('Profile updated successfully!');
      setErrors({}); // Clear any previous errors
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    },
    onError: (error) => {
      const errorInfo = handleError(error, 'Updating profile');
      setErrors({ submit: errorInfo.message });
      setSuccessMessage(''); // Ensure success message is cleared on error
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.full_name || profileData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters.';
    } else if (profileData.full_name.trim().length > 100) {
      newErrors.full_name = 'Name cannot exceed 100 characters.';
    }
    
    if (profileData.country && profileData.country.trim().length < 2) {
      newErrors.country = 'Please enter a valid country name.';
    } else if (profileData.country.trim().length > 100) {
      newErrors.country = 'Country name cannot exceed 100 characters.';
    }

    if (profileData.state_province && profileData.state_province.trim().length > 100) {
      newErrors.state_province = 'State/Province name cannot exceed 100 characters.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const sanitizedData = {
      full_name: sanitizeInput(profileData.full_name),
      country: sanitizeInput(profileData.country),
      state_province: sanitizeInput(profileData.state_province),
      currency: profileData.currency
    };
    
    updateProfileMutation.mutate(sanitizedData);
  };

  const startTrial = async () => {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);
      
      await base44.auth.updateMe({
        subscription_tier: 'pro',
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString()
      });
      
      loadUser();
      setSuccessMessage('🎉 Your 14-day Pro trial has started! Enjoy all premium features.');
      setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
      setErrors({}); // Clear any previous errors
    } catch (error) {
      const errorInfo = handleError(error, 'Starting trial');
      setErrors({ trial: errorInfo.message });
      setSuccessMessage(''); // Ensure success message is cleared on error
    }
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
              {errors.trial && ( // Display trial specific error
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[12px]">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.trial}
                  </p>
                </div>
              )}
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

            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-[12px]">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMessage}
                </p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[12px]">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="full-name">
                  Full Name *
                </label>
                <Input
                  id="full-name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: validateInput(e.target.value, 100) })}
                  className={`rounded-[12px] ${errors.full_name ? 'border-red-500' : ''}`}
                  placeholder="Your full name"
                  maxLength={100}
                  aria-invalid={!!errors.full_name}
                  aria-describedby={errors.full_name ? 'name-error' : undefined}
                  required
                />
                {errors.full_name && (
                  <p id="name-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.full_name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="rounded-[12px] bg-gray-50"
                  aria-describedby="email-note"
                />
                <p id="email-note" className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="country">
                    Country
                  </label>
                  <Input
                    id="country"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: validateInput(e.target.value, 100) })}
                    className={`rounded-[12px] ${errors.country ? 'border-red-500' : ''}`}
                    placeholder="e.g., United States"
                    maxLength={100}
                    aria-invalid={!!errors.country}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.country}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="state">
                    State/Province
                  </label>
                  <Input
                    id="state"
                    value={profileData.state_province}
                    onChange={(e) => setProfileData({ ...profileData, state_province: validateInput(e.target.value, 100) })}
                    className={`rounded-[12px] ${errors.state_province ? 'border-red-500' : ''}`}
                    placeholder="e.g., California"
                    maxLength={100}
                    aria-invalid={!!errors.state_province}
                  />
                  {errors.state_province && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.state_province}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="currency">
                  Currency
                </label>
                <Select
                  value={profileData.currency}
                  onValueChange={(value) => setProfileData({ ...profileData, currency: value })}
                >
                  <SelectTrigger id="currency" className="rounded-[12px]">
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
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
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
