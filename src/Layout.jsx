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
  // CRITICAL DEBUG - This will fire if Layout is executed
  console.log('🔴🔴🔴 LAYOUT COMPONENT IS RENDERING - Page:', currentPageName);
  
  const [user, setUser] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      console.log('✅ User loaded in Layout:', currentUser?.email);
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
      console.error('❌ Error loading user in layout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔵 Layout useEffect running for page:', currentPageName);
    loadUser();
    const interval = setInterval(loadUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUser]);

  // Don't show layout on landing or onboarding pages
  if (currentPageName === 'Landing' || currentPageName === 'Onboarding') {
    console.log('⚪ Skipping layout for:', currentPageName);
    return <>{children}</>;
  }

  if (loading || !user) {
    console.log('⏳ Layout loading...');
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #9333ea', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  console.log('✅ Rendering full Layout with sidebar for:', currentPageName);

  return (
    <>
      {/* SIDEBAR - Fixed Position with extreme visibility */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '256px',
        backgroundColor: '#0f172a',
        zIndex: 99999,
        overflowY: 'auto',
        boxShadow: '10px 0 50px rgba(255,0,0,0.5)',
        border: '3px solid red'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #334155', background: '#1e293b' }}>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
            🔵 SIDEBAR HERE
          </div>
          <div style={{ color: 'yellow', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
            Page: {currentPageName}
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
                  backgroundColor: isActive ? '#9333ea' : '#1e293b',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  border: isActive ? '2px solid yellow' : 'none'
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
              backgroundColor: currentPageName === 'Settings' ? '#9333ea' : '#1e293b',
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
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              fontWeight: 'bold'
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
            Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        marginLeft: '256px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        <div style={{ 
          background: 'yellow', 
          color: 'black', 
          padding: '12px', 
          marginBottom: '20px',
          fontWeight: 'bold',
          border: '3px solid red',
          textAlign: 'center'
        }}>
          🟡 LAYOUT IS ACTIVE - You should see a dark sidebar on the left with red border
        </div>
        
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