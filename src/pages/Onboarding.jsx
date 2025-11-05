
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles, Briefcase, Palette, Store, Upload, CheckCircle2 } from 'lucide-react';
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
  const [useSampleData, setUseSampleData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // If already onboarded, redirect to dashboard
      if (currentUser.onboarded) {
        window.location.href = createPageUrl('Dashboard');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update user profile
      await base44.auth.updateMe({
        user_type: selectedRole,
        workspace_style: selectedStyle,
        onboarded: true
      });

      // Create sample data if selected
      if (useSampleData) {
        await createSampleData(selectedRole);
      }

      // Redirect to dashboard
      window.location.href = createPageUrl('Dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setLoading(false);
    }
  };

  const createSampleData = async (role) => {
    const userEmail = user.email;
    
    // Sample tasks based on role
    const tasksByRole = {
      freelancer: [
        { title: 'Complete client proposal', description: 'Finish and send proposal to new client', status: 'in_progress', priority: 'high', project: 'New Client Onboarding' },
        { title: 'Update portfolio', description: 'Add recent projects to portfolio website', status: 'todo', priority: 'medium', project: 'Marketing' },
        { title: 'Send invoice to Client A', description: 'Create and send monthly invoice', status: 'todo', priority: 'high', project: 'Client A' },
        { title: 'Follow up on leads', description: 'Reach out to 3 potential clients', status: 'todo', priority: 'medium', project: 'Business Development' }
      ],
      creator: [
        { title: 'Plan next week\'s content', description: 'Create content calendar for Instagram and TikTok', status: 'todo', priority: 'high', project: 'Content Strategy' },
        { title: 'Edit video for YouTube', description: 'Finish editing tutorial video', status: 'in_progress', priority: 'high', project: 'YouTube Channel' },
        { title: 'Respond to brand inquiry', description: 'Reply to collaboration email', status: 'todo', priority: 'medium', project: 'Brand Partnerships' },
        { title: 'Update media kit', description: 'Refresh stats and portfolio', status: 'todo', priority: 'low', project: 'Marketing Materials' }
      ],
      small_business: [
        { title: 'Review monthly financials', description: 'Analyze revenue and expenses', status: 'todo', priority: 'high', project: 'Finance' },
        { title: 'Team check-in meeting', description: 'Weekly sync with team members', status: 'todo', priority: 'medium', project: 'Team Management' },
        { title: 'Update inventory', description: 'Check stock levels and reorder', status: 'todo', priority: 'medium', project: 'Operations' },
        { title: 'Marketing campaign launch', description: 'Finalize and launch Q1 campaign', status: 'in_progress', priority: 'high', project: 'Marketing' }
      ]
    };

    const goalsByRole = {
      freelancer: [
        { title: 'Acquire 5 new clients', description: 'Reach out to prospects and close deals', progress: 40, category: 'business', target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
        { title: 'Increase rate by 25%', description: 'Negotiate higher rates with existing clients', progress: 20, category: 'financial', target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      creator: [
        { title: 'Reach 50K followers', description: 'Grow audience across platforms', progress: 65, category: 'business', target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() },
        { title: 'Launch digital product', description: 'Create and sell online course', progress: 30, category: 'business', target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      small_business: [
        { title: 'Grow revenue by 30%', description: 'Increase monthly recurring revenue', progress: 50, category: 'financial', target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() },
        { title: 'Hire 2 team members', description: 'Expand team with key hires', progress: 25, category: 'business', target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    };

    const transactionsByRole = {
      freelancer: [
        { type: 'income', amount: 2500, description: 'Website design project', category: 'Client Work', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), client_name: 'Tech Startup Inc' },
        { type: 'income', amount: 1800, description: 'Logo design', category: 'Client Work', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), client_name: 'Fashion Brand' },
        { type: 'expense', amount: 49, description: 'Adobe Creative Cloud', category: 'Software', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 120, description: 'Marketing ads', category: 'Marketing', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      creator: [
        { type: 'income', amount: 3200, description: 'Brand partnership', category: 'Sponsorships', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), client_name: 'Beauty Brand Co' },
        { type: 'income', amount: 850, description: 'Ad revenue', category: 'Platform Earnings', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 200, description: 'Video equipment', category: 'Equipment', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 79, description: 'Editing software', category: 'Software', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      small_business: [
        { type: 'income', amount: 8500, description: 'Product sales', category: 'Sales', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'income', amount: 5200, description: 'Service contracts', category: 'Services', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 2500, description: 'Inventory restock', category: 'Inventory', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { type: 'expense', amount: 1200, description: 'Office rent', category: 'Overhead', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    };

    try {
      // Create tasks
      await base44.entities.Task.bulkCreate(tasksByRole[role] || tasksByRole.freelancer);
      
      // Create goals
      await base44.entities.Goal.bulkCreate(goalsByRole[role] || goalsByRole.freelancer);
      
      // Create transactions
      await base44.entities.Transaction.bulkCreate(transactionsByRole[role] || transactionsByRole.freelancer);
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

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
                Let's personalize your experience in just a few steps
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

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Get Started Instantly
              </h2>
              <p className="text-lg text-gray-600">
                Start with sample data or import your existing work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUseSampleData(true)}
                className={`p-8 rounded-[24px] text-left transition-all ${
                  useSampleData ? 'ring-4 ring-purple-400' : ''
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: useSampleData
                    ? '0 20px 60px rgba(167, 139, 250, 0.3)'
                    : '0 8px 32px rgba(167, 139, 250, 0.15)'
                }}
              >
                <div
                  className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Use Sample Data</h3>
                <p className="text-gray-600 mb-4">
                  Start with pre-loaded tasks, goals, and transactions to explore features instantly
                </p>
                <div className="text-sm text-purple-600 font-medium">
                  ✓ Recommended for first-time users
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUseSampleData(false)}
                className={`p-8 rounded-[24px] text-left transition-all ${
                  !useSampleData ? 'ring-4 ring-purple-400' : ''
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: !useSampleData
                    ? '0 20px 60px rgba(167, 139, 250, 0.3)'
                    : '0 8px 32px rgba(167, 139, 250, 0.15)'
                }}
              >
                <div
                  className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Start Fresh</h3>
                <p className="text-gray-600 mb-4">
                  Begin with a clean slate and build your workspace from scratch
                </p>
                <div className="text-sm text-gray-500">
                  You can import data later from settings
                </div>
              </motion.button>
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
            {[1, 2, 3].map((s) => (
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
            Step {step} of 3
          </p>
        </div>

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
            disabled={step === 1}
            className="rounded-[16px] px-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={() => {
              if (step < 3) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={(step === 1 && !selectedRole) || loading}
            className="rounded-[16px] px-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
            }}
          >
            {loading ? 'Setting up...' : step === 3 ? 'Complete Setup' : 'Continue'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
