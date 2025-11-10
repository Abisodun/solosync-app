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
  Menu,
  X,
  LogOut,
  Calculator,
  Users,
  Zap,
  Settings as SettingsIcon,
  FolderKanban,
  UserCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import SubscriptionBanner from './components/subscription/SubscriptionBanner';
import Logo from './components/landing/Logo';
import { differenceInDays, parseISO } from 'date-fns';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Tasks', icon: CheckSquare, page: 'Tasks' },
  { name: 'Projects', icon: FolderKanban, page: 'Projects' },
  { name: 'Goals', icon: Target, page: 'Goals' },
  { name: 'Finance', icon: DollarSign, page: 'Finance' },
  { name: 'Clients', icon: Users, page: 'Clients' },
  { name: 'Workflows', icon: Zap, page: 'Workflows' },
  { name: 'Content', icon: Calendar, page: 'Content' },
  { name: 'Habits', icon: Heart, page: 'Habits' },
  { name: 'Tax Prep', icon: Calculator, page: 'TaxPrep' }
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
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
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user in layout:', error);
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
      {/* Left Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 z-50">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold text-white">
              SoloSync
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-4" role="navigation" aria-label="Sidebar navigation">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all group ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
          <div className="space-y-2">
            <Link
              to={createPageUrl('Settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all group ${
                currentPageName === 'Settings'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <SettingsIcon className={`w-5 h-5 ${currentPageName === 'Settings' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={() => base44.auth.logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-gray-300 hover:bg-slate-700 hover:text-white transition-all group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Shifted right to accommodate sidebar */}
      <main className="ml-64 min-h-screen" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subscription Banner */}
          {showBanner && (
            <div className="mb-6">
              <SubscriptionBanner user={user} onDismiss={() => setShowBanner(false)} />
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}