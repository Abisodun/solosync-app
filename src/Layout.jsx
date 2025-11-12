import React, { useState, useEffect, useCallback } from 'react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import HabitReminders from './components/habits/HabitReminders';
import { differenceInDays, parseISO } from 'date-fns';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
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
      // Only set loading to false, don't fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't load user for public pages
    if (currentPageName === 'Landing' || currentPageName === 'Onboarding') {
      setLoading(false);
      return;
    }
    
    loadUser();
    const interval = setInterval(loadUser, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUser, currentPageName]);

  // Don't show layout on landing or onboarding pages - just render children
  if (currentPageName === 'Landing' || currentPageName === 'Onboarding') {
    return <>{children}</>;
  }

  // For authenticated pages, show loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #9333ea', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  // If not loading but no user, redirect to landing (authentication failed)
  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = createPageUrl('Landing');
    }
    return null;
  }

  return (
    <>
      {/* Habit Reminders - Global */}
      <HabitReminders />

      {/* MAIN CONTENT */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)'
      }}>
        {children}
      </div>
    </>
  );
}