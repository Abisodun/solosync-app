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
  LogOut,
  Calculator,
  Users,
  Zap,
  Settings as SettingsIcon,
  FolderKanban
} from 'lucide-react';
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
      
      if (currentUser.subscription_status === 'trial' && currentUser.trial_end_date) {
        const daysLeft = differenceInDays(parseISO(currentUser.trial_end_date), new Date());
        if (daysLeft < 0) {
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
    const interval = setInterval(loadUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUser]);

  // Don't show layout on landing or onboarding pages
  if (currentPageName === 'Landing' || currentPageName === 'Onboarding') {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #9333ea', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  // ABSOLUTE SIMPLEST SIDEBAR - NO FLEX, JUST FIXED POSITIONING
  return (
    <>
      {/* DEBUG: Visible marker at top of page */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: 'red', 
        color: 'white', 
        padding: '4px', 
        textAlign: 'center', 
        zIndex: 9999,
        fontSize: '12px'
      }}>
        🔴 LAYOUT IS LOADED - Page: {currentPageName} - User: {user?.email}
      </div>

      {/* SIDEBAR - Fixed Position */}
      <div style={{
        position: 'fixed',
        top: '24px', // Below debug bar
        left: 0,
        bottom: 0,
        width: '256px',
        backgroundColor: '#0f172a',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #334155' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            🔵 SoloSync
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px 12px' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '12px',
                  backgroundColor: isActive ? '#9333ea' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
              >
                <Icon style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Settings & Logout */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', borderTop: '1px solid #334155', backgroundColor: '#0f172a' }}>
          <Link
            to={createPageUrl('Settings')}
            style={{
              display: 'block',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '12px',
              backgroundColor: currentPageName === 'Settings' ? '#9333ea' : 'transparent',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            <SettingsIcon style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
            Settings
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            style={{
              width: '100%',
              display: 'block',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left'
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
            Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - With left margin for sidebar */}
      <div style={{
        marginLeft: '256px',
        marginTop: '24px', // Below debug bar
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        {showBanner && (
          <div style={{ marginBottom: '24px' }}>
            <SubscriptionBanner user={user} onDismiss={() => setShowBanner(false)} />
          </div>
        )}
        {children}
      </div>
    </>
  );
}