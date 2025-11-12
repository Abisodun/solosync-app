import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles, Briefcase, Palette, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const roles = [
  {
    id: 'freelancer',
    icon: Briefcase,
    title: 'Freelancer',
    description: 'Independent consultant or contractor',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    features: ['Client management', 'Project tracking', 'Invoice creation']
  },
  {
    id: 'creator',
    icon: Palette,
    title: 'Creator',
    description: 'Content creator or influencer',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    features: ['Content calendar', 'Brand partnerships', 'Analytics']
  },
  {
    id: 'small_business',
    icon: Store,
    title: 'Small Business',
    description: 'Small business owner or entrepreneur',
    gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
    features: ['Team tasks', 'Financial tracking', 'Growth metrics']
  }
];

const workspaceStyles = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, distraction-free interface',
    preview: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Colorful and energetic design',
    preview: 'linear-gradient(135deg, #A78BFA 0%, #93C5FD 50%, #86EFAC 100%)'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Sophisticated business aesthetic',
    preview: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)'
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('minimal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [savingSetup, setSavingSetup] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (!isAuthenticated) {
        // Not authenticated, redirect to landing with a message
        window.location.href = createPageUrl('Landing');
        return;
      }

      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLoading(false);
      
      // If already onboarded, redirect to dashboard
      if (currentUser.onboarding_completed) {
        window.location.href = createPageUrl('Dashboard');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // If there's an auth error, redirect to landing
      window.location.href = createPageUrl('Landing');
    }
  };

  const handleComplete = async () => {
    if (savingSetup) return;
    
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    if (!user) {
      setError('User data not loaded. Please refresh the page.');
      return;
    }
    
    setSavingSetup(true);
    setError(null);
    
    try {
      await base44.auth.updateMe({
        user_type: selectedRole,
        workspace_style: selectedStyle,
        onboarding_completed: true
      });

      // Redirect to dashboard
      window.location.href = createPageUrl('Dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error.message || 'Failed to complete setup. Please try again.');
      setSavingSetup(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-block mb-6"
              >
                <div
                  className="w-20 h-20 rounded-[20px] flex items-center justify-center mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                    boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                Welcome to <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">SoloSync</span>
              </h1>
              <p className="text-xl text-gray-600">
                Let's personalize your experience in just 2 simple steps
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              What best describes you?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-8 rounded-[24px] text-left transition-all ${
                      isSelected ? 'ring-4 ring-purple-400' : ''
                    }`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: isSelected
                        ? '0 20px 60px rgba(167, 139, 250, 0.3)'
                        : '0 8px 32px rgba(167, 139, 250, 0.15)'
                    }}
                    aria-label={`Select ${role.title} role`}
                  >
                    <div
                      className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-4"
                      style={{
                        background: role.gradient,
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{role.title}</h3>
                    <p className="text-gray-600 mb-4">{role.description}</p>
                    <div className="space-y-2">
                      {role.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Choose Your Workspace Style
              </h2>
              <p className="text-lg text-gray-600">
                Select a visual style that matches your personality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {workspaceStyles.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <motion.button
                    key={style.id}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`rounded-[24px] overflow-hidden transition-all ${
                      isSelected ? 'ring-4 ring-purple-400' : ''
                    }`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: isSelected
                        ? '0 20px 60px rgba(167, 139, 250, 0.3)'
                        : '0 8px 32px rgba(167, 139, 250, 0.15)'
                    }}
                    aria-label={`Select ${style.name} workspace style`}
                  >
                    <div
                      className="h-48"
                      style={{ background: style.preview }}
                    />
                    <div className="p-6 text-left">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{style.name}</h3>
                      <p className="text-gray-600">{style.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-12' : 'w-8'
                }`}
                style={{
                  background: s <= step
                    ? 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                    : 'rgba(167, 139, 250, 0.2)'
                }}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {step} of 2
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 max-w-5xl mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || savingSetup}
            className="rounded-[16px] px-8"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={() => {
              if (step < 2) {
                if (!selectedRole) {
                  setError('Please select a role to continue');
                  return;
                }
                setError(null);
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={savingSetup}
            className="rounded-[16px] px-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
            }}
            aria-label={step === 2 ? 'Complete setup and go to dashboard' : 'Continue to next step'}
          >
            {savingSetup ? 'Setting up...' : step === 2 ? 'Complete Setup' : 'Continue'}
            {!savingSetup && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}