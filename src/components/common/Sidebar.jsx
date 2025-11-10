import React, { useState, useEffect } from 'react';
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
  FolderKanban,
  MessageSquare
} from 'lucide-react';
import Logo from '../landing/Logo';

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
  { name: 'Tax Prep', icon: Calculator, page: 'TaxPrep' },
  { name: 'Feedback', icon: MessageSquare, page: 'Feedback' }
];

export default function Sidebar({ currentPage }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '260px',
        backgroundColor: '#0f172a',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo className="w-10 h-10" />
          <span style={{ 
            color: 'white', 
            fontSize: '22px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #A78BFA 0%, #93C5FD 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SoloSync
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '16px 12px' }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;
          const isHovered = hoveredItem === item.name;

          return (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '12px',
                backgroundColor: isActive 
                  ? 'rgba(167, 139, 250, 0.2)' 
                  : isHovered 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'transparent',
                color: isActive ? '#A78BFA' : '#94a3b8',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid transparent'
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section - Settings & Logout */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#0a0f1f'
        }}
      >
        <Link
          to={createPageUrl('Settings')}
          onMouseEnter={() => setHoveredItem('Settings')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            marginBottom: '8px',
            borderRadius: '12px',
            backgroundColor: currentPage === 'Settings' 
              ? 'rgba(167, 139, 250, 0.2)' 
              : hoveredItem === 'Settings'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'transparent',
            color: currentPage === 'Settings' ? '#A78BFA' : '#94a3b8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: currentPage === 'Settings' ? '600' : '500',
            transition: 'all 0.2s ease'
          }}
        >
          <SettingsIcon style={{ width: '20px', height: '20px' }} />
          <span>Settings</span>
        </Link>

        <button
          onClick={() => base44.auth.logout()}
          onMouseEnter={() => setHoveredItem('Logout')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: hoveredItem === 'Logout' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            color: hoveredItem === 'Logout' ? '#ef4444' : '#94a3b8',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
        >
          <LogOut style={{ width: '20px', height: '20px' }} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}