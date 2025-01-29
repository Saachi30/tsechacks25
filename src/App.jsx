import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  Music2, 
  Users,
  Upload,
  Shield,
  Radio,
  AlertTriangle,
  DollarSign,
  Settings,
  Search,
  Bell,
  Wallet,
  Target,
  Home
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import { MyMusic } from './pages/MyMusic';
import { RightsManagement } from './pages/RightsManagement';
import { Streaming } from './pages/Streaming';
import { Issues } from './pages/Issues';
import { Crowdfunding } from './pages/Crowdfunding';
import { Collaborators } from './pages/Collaborators';
import { UploadMusic } from './pages/UploadMusic';
// Main App Layout Component
const AppContent = () => {
  const location = useLocation();
  
  const navigationItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'my-music', path: '/mymusic', label: 'My Music', icon: <Music2 className="w-5 h-5" /> },
    { id: 'upload', path: '/upload', label: 'Upload Music', icon: <Upload className="w-5 h-5" /> },
    { id: 'rights', path: '/rights', label: 'Rights Management', icon: <Shield className="w-5 h-5" /> },
    { id: 'collaborators', path: '/collaborators', label: 'Collaborators', icon: <Users className="w-5 h-5" /> },
    { id: 'crowdfunding', path: '/crowdfunding', label: 'Crowdfunding', icon: <Target className="w-5 h-5" /> },
    { id: 'streaming', path: '/streaming', label: 'Streaming', icon: <Radio className="w-5 h-5" /> },
    { id: 'issues', path: '/issues', label: 'Issues', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#0D1117] text-gray-300 flex flex-col flex-shrink-0">
        <div className="p-4 flex items-center space-x-3">
          <div className="text-blue-500">
            <Music2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">MusicChain</h1>
        </div>
        <nav className="mt-8 flex-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`w-full flex items-center px-6 py-3 text-gray-300 hover:bg-[#1c2128] hover:text-white transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white h-16 border-b flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center w-96">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search music, artists, or rights..."
              className="ml-2 w-full outline-none text-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Wallet className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mymusic" element={<MyMusic />} />
            <Route path="/upload" element={<UploadMusic />} />
            <Route path="/rights" element={<RightsManagement />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/crowdfunding" element={<Crowdfunding />} />
            <Route path="/streaming" element={<Streaming />} />
            <Route path="/issues" element={<Issues />} />
            {/* <Route path="/settings" element={<Settings />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Main App component that provides Router context
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;