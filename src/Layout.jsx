import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  DollarSign, 
  Calendar, 
  Heart,
  Sparkles,
  Menu,
  X,
  LogOut,
  Calculator,
  Settings as SettingsIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SubscriptionBanner from './components/subscription/SubscriptionBanner';
import { handleError } from '@/utils/errorHandler';
import { differenceInDays, parseISO } from 'date-fns';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Tasks', icon: CheckSquare, page: 'Tasks' },
  { name: 'Goals', icon: Target, page: 'Goals' },
  { name: 'Finance', icon: DollarSign, page: 'Finance' },
  { name: 'Content', icon: Calendar, page: 'Content' },
  { name: 'Habits', icon: Heart, page: 'Habits' },
  { name: 'Tax Prep', icon: Calculator, page: 'TaxPrep', proBadge: true },
  { name: 'Settings', icon: SettingsIcon, page: 'Settings' }
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check trial expiration in real-time
      if (currentUser.subscription_status === 'trial' && currentUser.trial_end_date) {
        const daysLeft = differenceInDays(parseISO(currentUser.trial_end_date), new Date());
        if (daysLeft < 0) {
          // Trial has expired, update status
          await base44.auth.updateMe({
            subscription_status: 'expired',
            subscription_tier: 'free'
          });
          // Reload user data
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
        }
      }
    } catch (error) {
      handleError(error, 'Loading user in layout');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    
    // Check trial status every 5 minutes
    const interval = setInterval(loadUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUser]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPageName]);

  // Keyboard navigation for mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Don't show layout on landing or onboarding pages
  if (currentPageName === 'Landing' || currentPageName === 'Onboarding') {
    return children;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF]">
      {/* Top Navigation */}
      <nav className="bg-white/50 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-40" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
                }}
                aria-hidden="true"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SoloSync
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] transition-all relative ${
                      isActive
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:bg-white/70'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium">{item.name}</span>
                    {item.proBadge && (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-purple-100 text-purple-700" aria-label="Pro feature">
                        PRO
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right mr-2">
                <div className="text-sm font-medium text-gray-800">{user.full_name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => base44.auth.logout()}
                className="rounded-[10px] hidden sm:flex"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                Logout
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-[10px] hover:bg-white/70 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-purple-100 bg-white/90 backdrop-blur-lg"
            role="menu"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all ${
                      isActive
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">{item.name}</span>
                    {item.proBadge && (
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-purple-100 text-purple-700 ml-auto" aria-label="Pro feature">
                        PRO
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={() => base44.auth.logout()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-gray-600 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* Subscription Banner */}
        {showBanner && (
          <div className="mb-6">
            <SubscriptionBanner user={user} onDismiss={() => setShowBanner(false)} />
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}