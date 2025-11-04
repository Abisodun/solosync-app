import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { differenceInDays, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function SubscriptionBanner({ user, onDismiss }) {
  if (!user) return null;

  const isOnTrial = user.subscription_status === 'trial' && user.trial_end_date;
  const isExpired = user.subscription_status === 'expired' || user.subscription_status === 'cancelled';
  const isPastDue = user.subscription_status === 'past_due';

  if (!isOnTrial && !isExpired && !isPastDue) return null;

  let message = '';
  let icon = Clock;
  let gradient = 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)';
  let bgColor = 'rgba(147, 197, 253, 0.1)';
  let daysLeft = 0;

  if (isOnTrial) {
    daysLeft = differenceInDays(parseISO(user.trial_end_date), new Date());
    if (daysLeft <= 0) {
      message = '🎉 Your trial has ended. Upgrade to Pro to continue using premium features!';
      icon = AlertCircle;
      gradient = 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)';
      bgColor = 'rgba(252, 165, 165, 0.1)';
    } else if (daysLeft <= 3) {
      message = `⏰ Only ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left in your trial. Upgrade now to keep access!`;
      icon = AlertCircle;
      gradient = 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)';
      bgColor = 'rgba(252, 211, 77, 0.1)';
    } else {
      message = `✨ You have ${daysLeft} days left in your Pro trial. Enjoying it?`;
      icon = Clock;
    }
  } else if (isExpired) {
    message = '⚠️ Your subscription has expired. Upgrade to restore access to Pro features.';
    icon = AlertCircle;
    gradient = 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)';
    bgColor = 'rgba(252, 165, 165, 0.1)';
  } else if (isPastDue) {
    message = '⚠️ Payment failed. Please update your payment method to continue your subscription.';
    icon = AlertCircle;
    gradient = 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)';
    bgColor = 'rgba(252, 165, 165, 0.1)';
  }

  const Icon = icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative"
      >
        <div
          className="flex items-center justify-between gap-4 px-6 py-4 rounded-[16px] shadow-lg"
          style={{
            background: bgColor,
            border: '2px solid rgba(147, 197, 253, 0.3)'
          }}
        >
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: gradient }}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-800 font-medium">{message}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={createPageUrl('Settings')}>
              <Button
                className="rounded-[12px] text-white font-semibold"
                style={{ background: gradient }}
              >
                {isPastDue ? 'Update Payment' : 'Upgrade Now'}
              </Button>
            </a>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 hover:bg-gray-200 rounded-[8px] transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}