import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  DollarSign, 
  Calendar,
  MessageSquare,
  FileText,
  Target,
  TrendingUp,
  Mail,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-purple-500' },
    { path: '/clients', icon: Users, label: 'Clients', color: 'text-blue-500' },
    { path: '/projects', icon: FolderKanban, label: 'Projects', color: 'text-green-500' },
    { path: '/finance', icon: DollarSign, label: 'Finance', color: 'text-emerald-500' },
    { path: '/appointments', icon: Calendar, label: 'Appointments', color: 'text-orange-500' },
    { path: '/community', icon: MessageSquare, label: 'Community', color: 'text-pink-500' },
    { path: '/content', icon: FileText, label: 'Content', color: 'text-indigo-500' },
    { path: '/goals', icon: Target, label: 'Goals', color: 'text-red-500' },
    { path: '/habits', icon: TrendingUp, label: 'Habits', color: 'text-cyan-500' },
    { path: '/mailbox', icon: Mail, label: 'Mailbox', color: 'text-yellow-500' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SoloSync
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.email?.split('@')[0] || 'User'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-purple-50 text-purple-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                active ? item.color : 'text-gray-400'
              }`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/settings')
              ? 'bg-purple-50 text-purple-600 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5 text-gray-400" />
          <span>Settings</span>
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
