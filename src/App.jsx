import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { setupIframeMessaging } from './lib/iframe-messaging';
import PageNotFound from './lib/PageNotFound';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Import layout
import DashboardLayout from './components/layout/DashboardLayout';

// Import pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Finance from './pages/Finance';
import Content from './pages/Content';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import Mailbox from './pages/Mailbox';
import Settings from './pages/Settings';

// New pages - placeholders for now
import Appointments from './pages/Appointments';
import Community from './pages/Community';

setupIframeMessaging();

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <NavigationTracker />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Protected routes with Dashboard Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="finance" element={<Finance />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="community" element={<Community />} />
            <Route path="content" element={<Content />} />
            <Route path="goals" element={<Goals />} />
            <Route path="habits" element={<Habits />} />
            <Route path="mailbox" element={<Mailbox />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <Toaster />
        <VisualEditAgent />
      </Router>
    </QueryClientProvider>
  )
}

export default App
