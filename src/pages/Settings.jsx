
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, CreditCard, Globe, Sparkles, Check, Crown, Zap, AlertCircle, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import Sidebar from '../components/common/Sidebar';
import { Switch } from "@/components/ui/switch";

const validateInput = (value, maxLength = 100) => {
  if (!value) return '';
  return String(value).trim().slice(0, maxLength);
};

const sanitizeInput = (input) => {
  if (!input) return '';
  return String(input).replace(/[<>]/g, '').trim();
};

const COUNTRIES = [
  { name: 'Afghanistan', currency: 'AFN' },
  { name: 'Albania', currency: 'ALL' },
  { name: 'Algeria', currency: 'DZD' },
  { name: 'Andorra', currency: 'EUR' },
  { name: 'Angola', currency: 'AOA' },
  { name: 'Argentina', currency: 'ARS' },
  { name: 'Armenia', currency: 'AMD' },
  { name: 'Australia', currency: 'AUD' },
  { name: 'Austria', currency: 'EUR' },
  { name: 'Azerbaijan', currency: 'AZN' },
  { name: 'Bahamas', currency: 'BSD' },
  { name: 'Bahrain', currency: 'BHD' },
  { name: 'Bangladesh', currency: 'BDT' },
  { name: 'Barbados', currency: 'BBD' },
  { name: 'Belarus', currency: 'BYN' },
  { name: 'Belgium', currency: 'EUR' },
  { name: 'Belize', currency: 'BZD' },
  { name: 'Benin', currency: 'XOF' },
  { name: 'Bhutan', currency: 'BTN' },
  { name: 'Bolivia', currency: 'BOB' },
  { name: 'Bosnia and Herzegovina', currency: 'BAM' },
  { name: 'Botswana', currency: 'BWP' },
  { name: 'Brazil', currency: 'BRL' },
  { name: 'Brunei', currency: 'BND' },
  { name: 'Bulgaria', currency: 'BGN' },
  { name: 'Burkina Faso', currency: 'XOF' },
  { name: 'Burundi', currency: 'BIF' },
  { name: 'Cambodia', currency: 'KHR' },
  { name: 'Cameroon', currency: 'XAF' },
  { name: 'Canada', currency: 'CAD' },
  { name: 'Cape Verde', currency: 'CVE' },
  { name: 'Central African Republic', currency: 'XAF' },
  { name: 'Chad', currency: 'XAF' },
  { name: 'Chile', currency: 'CLP' },
  { name: 'China', currency: 'CNY' },
  { name: 'Colombia', currency: 'COP' },
  { name: 'Comoros', currency: 'KMF' },
  { name: 'Congo', currency: 'XAF' },
  { name: 'Costa Rica', currency: 'CRC' },
  { name: 'Croatia', currency: 'EUR' },
  { name: 'Cuba', currency: 'CUP' },
  { name: 'Cyprus', currency: 'EUR' },
  { name: 'Czech Republic', currency: 'CZK' },
  { name: 'Denmark', currency: 'DKK' },
  { name: 'Djibouti', currency: 'DJF' },
  { name: 'Dominica', currency: 'XCD' },
  { name: 'Dominican Republic', currency: 'DOP' },
  { name: 'Ecuador', currency: 'USD' },
  { name: 'Egypt', currency: 'EGP' },
  { name: 'El Salvador', currency: 'USD' },
  { name: 'Equatorial Guinea', currency: 'XAF' },
  { name: 'Eritrea', currency: 'ERN' },
  { name: 'Estonia', currency: 'EUR' },
  { name: 'Eswatini', currency: 'SZL' },
  { name: 'Ethiopia', currency: 'ETB' },
  { name: 'Fiji', currency: 'FJD' },
  { name: 'Finland', currency: 'EUR' },
  { name: 'France', currency: 'EUR' },
  { name: 'Gabon', currency: 'XAF' },
  { name: 'Gambia', currency: 'GMD' },
  { name: 'Georgia', currency: 'GEL' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'Ghana', currency: 'GHS' },
  { name: 'Greece', currency: 'EUR' },
  { name: 'Grenada', currency: 'XCD' },
  { name: 'Guatemala', currency: 'GTQ' },
  { name: 'Guinea', currency: 'GNF' },
  { name: 'Guinea-Bissau', currency: 'XOF' },
  { name: 'Guyana', currency: 'GYD' },
  { name: 'Haiti', currency: 'HTG' },
  { name: 'Honduras', currency: 'HNL' },
  { name: 'Hungary', currency: 'HUF' },
  { name: 'Iceland', currency: 'ISK' },
  { name: 'India', currency: 'INR' },
  { name: 'Indonesia', currency: 'IDR' },
  { name: 'Iran', currency: 'IRR' },
  { name: 'Iraq', currency: 'IQD' },
  { name: 'Ireland', currency: 'EUR' },
  { name: 'Israel', currency: 'ILS' },
  { name: 'Italy', currency: 'EUR' },
  { name: 'Jamaica', currency: 'JMD' },
  { name: 'Japan', currency: 'JPY' },
  { name: 'Jordan', currency: 'JOD' },
  { name: 'Kazakhstan', currency: 'KZT' },
  { name: 'Kenya', currency: 'KES' },
  { name: 'Kiribati', currency: 'AUD' },
  { name: 'Kuwait', currency: 'KWD' },
  { name: 'Kyrgyzstan', currency: 'KGS' },
  { name: 'Laos', currency: 'LAK' },
  { name: 'Latvia', currency: 'EUR' },
  { name: 'Lebanon', currency: 'LBP' },
  { name: 'Lesotho', currency: 'LSL' },
  { name: 'Liberia', currency: 'LRD' },
  { name: 'Libya', currency: 'LYD' },
  { name: 'Liechtenstein', currency: 'CHF' },
  { name: 'Lithuania', currency: 'EUR' },
  { name: 'Luxembourg', currency: 'EUR' },
  { name: 'Madagascar', currency: 'MGA' },
  { name: 'Malawi', currency: 'MWK' },
  { name: 'Malaysia', currency: 'MYR' },
  { name: 'Maldives', currency: 'MVR' },
  { name: 'Mali', currency: 'XOF' },
  { name: 'Malta', currency: 'EUR' },
  { name: 'Marshall Islands', currency: 'USD' },
  { name: 'Mauritania', currency: 'MRU' },
  { name: 'Mauritius', currency: 'MUR' },
  { name: 'Mexico', currency: 'MXN' },
  { name: 'Micronesia', currency: 'USD' },
  { name: 'Moldova', currency: 'MDL' },
  { name: 'Monaco', currency: 'EUR' },
  { name: 'Mongolia', currency: 'MNT' },
  { name: 'Montenegro', currency: 'EUR' },
  { name: 'Morocco', currency: 'MAD' },
  { name: 'Mozambique', currency: 'MZN' },
  { name: 'Myanmar', currency: 'MMK' },
  { name: 'Namibia', currency: 'NAD' },
  { name: 'Nauru', currency: 'AUD' },
  { name: 'Nepal', currency: 'NPR' },
  { name: 'Netherlands', currency: 'EUR' },
  { name: 'New Zealand', currency: 'NZD' },
  { name: 'Nicaragua', currency: 'NIO' },
  { name: 'Niger', currency: 'XOF' },
  { name: 'Nigeria', currency: 'NGN' },
  { name: 'North Korea', currency: 'KPW' },
  { name: 'North Macedonia', currency: 'MKD' },
  { name: 'Norway', currency: 'NOK' },
  { name: 'Oman', currency: 'OMR' },
  { name: 'Pakistan', currency: 'PKR' },
  { name: 'Palau', currency: 'USD' },
  { name: 'Palestine', currency: 'ILS' },
  { name: 'Panama', currency: 'PAB' },
  { name: 'Papua New Guinea', currency: 'PGK' },
  { name: 'Paraguay', currency: 'PYG' },
  { name: 'Peru', currency: 'PEN' },
  { name: 'Philippines', currency: 'PHP' },
  { name: 'Poland', currency: 'PLN' },
  { name: 'Portugal', currency: 'EUR' },
  { name: 'Qatar', currency: 'QAR' },
  { name: 'Romania', currency: 'RON' },
  { name: 'Russia', currency: 'RUB' },
  { name: 'Rwanda', currency: 'RWF' },
  { name: 'Saint Kitts and Nevis', currency: 'XCD' },
  { name: 'Saint Lucia', currency: 'XCD' },
  { name: 'Saint Vincent and the Grenadines', currency: 'XCD' },
  { name: 'Samoa', currency: 'WST' },
  { name: 'San Marino', currency: 'EUR' },
  { name: 'Sao Tome and Principe', currency: 'STN' },
  { name: 'Saudi Arabia', currency: 'SAR' },
  { name: 'Senegal', currency: 'XOF' },
  { name: 'Serbia', currency: 'RSD' },
  { name: 'Seychelles', currency: 'SCR' },
  { name: 'Sierra Leone', currency: 'SLL' },
  { name: 'Singapore', currency: 'SGD' },
  { name: 'Slovakia', currency: 'EUR' },
  { name: 'Slovenia', currency: 'EUR' },
  { name: 'Solomon Islands', currency: 'SBD' },
  { name: 'Somalia', currency: 'SOS' },
  { name: 'South Africa', currency: 'ZAR' },
  { name: 'South Korea', currency: 'KRW' },
  { name: 'South Sudan', currency: 'SSP' },
  { name: 'Spain', currency: 'EUR' },
  { name: 'Sri Lanka', currency: 'LKR' },
  { name: 'Sudan', currency: 'SDG' },
  { name: 'Suriname', currency: 'SRD' },
  { name: 'Sweden', currency: 'SEK' },
  { name: 'Switzerland', currency: 'CHF' },
  { name: 'Syria', currency: 'SYP' },
  { name: 'Taiwan', currency: 'TWD' },
  { name: 'Tajikistan', currency: 'TJS' },
  { name: 'Tanzania', currency: 'TZS' },
  { name: 'Thailand', currency: 'THB' },
  { name: 'Timor-Leste', currency: 'USD' },
  { name: 'Togo', currency: 'XOF' },
  { name: 'Tonga', currency: 'TOP' },
  { name: 'Trinidad and Tobago', currency: 'TTD' },
  { name: 'Tunisia', currency: 'TND' },
  { name: 'Turkey', currency: 'TRY' },
  { name: 'Turkmenistan', currency: 'TMT' },
  { name: 'Tuvalu', currency: 'AUD' },
  { name: 'Uganda', currency: 'UGX' },
  { name: 'Ukraine', currency: 'UAH' },
  { name: 'United Arab Emirates', currency: 'AED' },
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'United States', currency: 'USD' },
  { name: 'Uruguay', currency: 'UYU' },
  { name: 'Uzbekistan', currency: 'UZS' },
  { name: 'Vanuatu', currency: 'VUV' },
  { name: 'Vatican City', currency: 'EUR' },
  { name: 'Venezuela', currency: 'VES' },
  { name: 'Vietnam', currency: 'VND' },
  { name: 'Yemen', currency: 'YER' },
  { name: 'Zambia', currency: 'ZMW' },
  { name: 'Zimbabwe', currency: 'ZWL' }
];

const CURRENCY_SYMBOLS = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥', 'AUD': '$', 'CAD': '$', 
  'CHF': 'Fr', 'INR': '₹', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R', 'MXN': '$', 'KRW': '₩',
  'SGD': '$', 'HKD': '$', 'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'TRY': '₺',
  'THB': '฿', 'IDR': 'Rp', 'MYR': 'RM', 'PHP': '₱', 'AED': 'د.إ', 'SAR': '﷼', 'ILS': '₪',
  'NZD': '$', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei', 'BGN': 'лв', 'CLP': '$', 'ARS': '$',
  'COP': '$', 'PEN': 'S/', 'VND': '₫', 'EGP': '£', 'NGN': '₦', 'KES': 'KSh', 'PKR': '₨',
  'AFN': '؋', 'ALL': 'Lek', 'DZD': 'د.ج', 'AOA': 'Kz', 'AMD': '֏', 'AZN': '₼', 'BSD': '$',
  'BHD': '.د.ب', 'BDT': '৳', 'BBD': '$', 'BYN': 'Br', 'BZD': 'BZ$', 'XOF': 'CFA', 'BTN': 'Nu.',
  'BOB': 'Bs.', 'BAM': 'KM', 'BWP': 'P', 'BND': '$', 'BIF': 'FBu', 'KHR': '៛', 'XAF': 'FCFA',
  'CVE': '$', 'KMF': 'CF', 'CRC': '₡', 'CUP': '₱', 'DJF': 'Fdj', 'XCD': '$', 'DOP': 'RD$',
  'ERN': 'Nfk', 'ETB': 'Br', 'FJD': '$', 'GMD': 'D', 'GEL': '₾', 'GNF': 'FG', 'GTQ': 'Q',
  'GYD': '$', 'HTG': 'G', 'ISK': 'kr', 'IQD': 'ع.د', 'JMD': 'J$', 'JOD': 'JD', 'KZT': '₸',
  'KWD': 'KD', 'KGS': 'с', 'LAK': '₭', 'LBP': 'ل.ل', 'LSL': 'L', 'LRD': '$', 'LYD': 'ل.د',
  'MGA': 'Ar', 'MWK': 'MK', 'MVR': 'Rf', 'MRU': 'UM', 'MUR': '₨', 'MDL': 'L', 'MNT': '₮',
  'MZN': 'MT', 'MMK': 'Ks', 'NAD': '$', 'NPR': '₨', 'NIO': 'C$', 'OMR': 'ر.ع.', 'PAB': 'B/.',
  'PGK': 'K', 'PYG': '₲', 'QAR': 'ر.ق', 'RWF': 'RF', 'WST': 'T', 'STN': 'Db', 'SCR': '₨',
  'SLL': 'Le', 'SBD': '$', 'SOS': 'Sh', 'SSP': '£', 'LKR': 'Rs', 'SDG': '£', 'SRD': '$',
  'SYP': '£', 'TWD': 'NT$', 'TJS': 'ЅМ', 'TZS': 'TSh', 'TOP': 'T$', 'TTD': 'TT$', 'TND': 'د.ت',
  'TMT': 'm', 'UGX': 'USh', 'UAH': '₴', 'UYU': '$U', 'UZS': 'soʻm', 'VUV': 'Vt', 'VES': 'Bs.S',
  'YER': '﷼', 'ZMW': 'ZK', 'ZWL': '$'
};

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: '',
    country: '',
    state_province: '',
    currency: 'USD'
  });
  const [dashboardPrefs, setDashboardPrefs] = useState({
    show_upcoming_tasks: true,
    show_recent_tasks: true,
    show_active_goals: true,
    show_active_habits: true,
    show_content_calendar: true,
    show_reminders: true,
    show_stats: true,
    show_ai_tip: true,
    show_projects: true
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
      
      if (currentUser.dashboard_preferences) {
        setDashboardPrefs(currentUser.dashboard_preferences);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      loadUser();
      setSuccessMessage('Profile updated successfully!');
      setErrors({});
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.message || 'Failed to update profile' });
    }
  });

  const updateDashboardPrefsMutation = useMutation({
    mutationFn: (prefs) => base44.auth.updateMe({ dashboard_preferences: prefs }),
    onSuccess: () => {
      loadUser();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setSuccessMessage('Dashboard preferences updated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.full_name || profileData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const sanitizedData = {
      full_name: sanitizeInput(profileData.full_name),
      country: sanitizeInput(profileData.country),
      state_province: sanitizeInput(profileData.state_province),
      currency: profileData.currency
    };
    
    updateProfileMutation.mutate(sanitizedData);
  };

  const handleCountryChange = (countryName) => {
    const country = COUNTRIES.find(c => c.name === countryName);
    setProfileData({
      ...profileData,
      country: countryName,
      currency: country ? country.currency : profileData.currency
    });
  };

  const handleDashboardPrefChange = (key, value) => {
    const newPrefs = { ...dashboardPrefs, [key]: value };
    setDashboardPrefs(newPrefs);
    updateDashboardPrefsMutation.mutate(newPrefs);
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
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error starting trial:', error);
      setErrors({ trial: error.message || 'Failed to start trial' });
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

  const dashboardWidgets = [
    { key: 'show_stats', label: 'Statistics Cards', description: 'Show key metrics at the top' },
    { key: 'show_ai_tip', label: 'AI Productivity Tip', description: 'Get personalized daily tips' },
    { key: 'show_upcoming_tasks', label: 'Upcoming Deadlines', description: 'Tasks due soon' },
    { key: 'show_recent_tasks', label: 'Recent Tasks', description: 'Your latest active tasks' },
    { key: 'show_active_goals', label: 'Active Goals', description: 'Goal progress tracking' },
    { key: 'show_active_habits', label: 'Active Habits', description: 'Habit streak tracking' },
    { key: 'show_projects', label: 'Projects Widget', description: 'Active projects overview' },
    { key: 'show_content_calendar', label: 'Content Calendar', description: 'Upcoming content schedule' },
    { key: 'show_reminders', label: 'Reminders', description: 'Pending notifications' }
  ];

  return (
    <>
      <Sidebar currentPage="Settings" />
      
      <div className="w-full pt-[72px] md:pt-6" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '24px 16px'
      }}
      >
        <div className="w-full max-w-full" style={{ padding: '0 4px' }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[12px]">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {successMessage}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Card */}
              <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Subscription & Billing</h2>
                </div>

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

                <div className="mt-6 p-4 bg-blue-50 rounded-[12px] border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💳 <strong>Secure Payment:</strong> Payments are processed securely via Stripe. Your card information is never stored on our servers.
                  </p>
                </div>
              </Card>

              {/* Dashboard Customization */}
              <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)' }}>
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Dashboard Widgets</h2>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Choose which widgets to display on your dashboard. Changes are saved automatically.
                </p>

                <div className="space-y-4">
                  {dashboardWidgets.map((widget) => (
                    <div key={widget.key} className="flex items-center justify-between p-4 rounded-[12px] bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{widget.label}</h4>
                        <p className="text-xs text-gray-600 mt-1">{widget.description}</p>
                      </div>
                      <Switch
                        checked={dashboardPrefs[widget.key]}
                        onCheckedChange={(checked) => handleDashboardPrefChange(widget.key, checked)}
                      />
                    </div>
                  ))}
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
                      <Select
                        value={profileData.country}
                        onValueChange={handleCountryChange}
                      >
                        <SelectTrigger id="country" className="rounded-[12px]">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.name} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block" htmlFor="state">
                        State/Province
                      </label>
                      <Input
                        id="state"
                        value={profileData.state_province}
                        onChange={(e) => setProfileData({ ...profileData, state_province: validateInput(e.target.value, 100) })}
                        className="rounded-[12px]"
                        placeholder="e.g., California"
                        maxLength={100}
                      />
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
                      <SelectContent className="max-h-[300px]">
                        {Array.from(new Set(COUNTRIES.map(c => c.currency))).sort().map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency} ({CURRENCY_SYMBOLS[currency] || currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-selected based on your country. You can change it manually.
                    </p>
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
                    <span className="text-gray-500">Type:</span>
                    <div className="font-medium text-gray-800 capitalize">{user.user_type || 'Professional'}</div>
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
      </div>
    </>
  );
}
