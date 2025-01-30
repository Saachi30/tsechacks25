import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  Music2, 
  Users,
  Upload,
  Shield,
  Radio,
  AlertTriangle,
  Settings,
  Search,
  Bell,
  Wallet,
  Target,
  Home,
  BarChart2 // Add this icon for Analytics Dashboard
} from 'lucide-react';
import { auth } from './components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Dashboard from './pages/Dashboard';
import { MyMusic } from './pages/MyMusic';
import { RightsManagement } from './pages/RightsManagement';
import { Streaming } from './pages/Streaming';
import { Issues } from './pages/Issues';
import { Crowdfunding } from './pages/Crowdfunding';
import { Collaborators } from './pages/Collaborators';
import { UploadMusic } from './pages/UploadMusic';
import GTranslate from './components/GTranslate';
import LicenseManager from './pages/LicenseManager';
import Login from './components/login';
import Register from './components/register';
import MusicRightsChatbot from './pages/AiAgent';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Navigation Items
const navigationItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'my-music', path: '/mymusic', label: 'My Music', icon: <Music2 className="w-5 h-5" /> },
  { id: 'upload', path: '/upload', label: 'Upload Music', icon: <Upload className="w-5 h-5" /> },
  { id: 'rights', path: '/rights', label: 'Rights Management', icon: <Shield className="w-5 h-5" /> },
  { id: 'collaborators', path: '/collaborators', label: 'Collaborators', icon: <Users className="w-5 h-5" /> },
  { id: 'license-manager', path: '/license-manager', label: 'License Manager', icon: <Shield className="w-5 h-5" /> },
  { id: 'crowdfunding', path: '/crowdfunding', label: 'Crowdfunding', icon: <Target className="w-5 h-5" /> },
  { id: 'streaming', path: '/streaming', label: 'Streaming', icon: <Radio className="w-5 h-5" /> },
  { id: 'issues', path: '/issues', label: 'Issues', icon: <AlertTriangle className="w-5 h-5" /> },
  
  { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
];


// Main Layout Component
const MainLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    // try {
    //     const provider = new ethers.providers.Web3Provider(window.ethereum);
    //     const accounts = await provider.send("eth_requestAccounts", []);
    //     setAccount(accounts[0]);

    //     const contractInstance = new ethers.Contract(
    //         CONTRACT_ADDRESS,
    //         abi,
    //         provider.getSigner()
    //     );
    //     setContract(contractInstance);
    //     toast.success("Wallet connected successfully!");
    // } catch (error) {
    //     toast.error("Failed to connect wallet");
    // }
};
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
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
                location.pathname === item.path ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white h-16 border-b flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center w-96"></div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button
                    onClick={connectWallet}
                    className="relative p-2 hover:bg-gray-100 rounded-full"
                    onMouseEnter={() => setShowFullAddress(true)}
                    onMouseLeave={() => setShowFullAddress(false)}
                >
                    <Wallet className="w-5 h-5 text-gray-600" />
                    
                    {account && showFullAddress && (
                        <div className="absolute bg-slate-500/50 text-gray-800 px-3 py-1 rounded-lg shadow-lg top-10 left-1/4 transform -translate-x-1/2">
                            {account}
                        </div>
                    )}
                </button>
                <GTranslate/>
            <div className="relative">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mymusic" element={<MyMusic />} />
            <Route path="/upload" element={<UploadMusic />} />
            <Route path="/rights" element={<RightsManagement />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/license-manager" element={<LicenseManager />} />
            <Route path="/crowdfunding" element={<Crowdfunding />} />
            <Route path="/streaming" element={<Streaming />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/analytics" element={<AnalyticsDashboard/>} /> {/* Add Analytics Dashboard route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// const ProtectedRoute = ({ children }) => {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(false);
  const [lastAuthPath, setLastAuthPath] = useState(null);

  useEffect(() => {
    const isAuthPath = location.pathname === '/' || location.pathname === '/register';
    const isMainLayoutPath = location.pathname.startsWith('/dashboard') || 
                            location.pathname.startsWith('/mymusic') ||
                            location.pathname.startsWith('/upload') ||
                            location.pathname.startsWith('/rights') ||
                            location.pathname.startsWith('/collaborators') ||
                            location.pathname.startsWith('/license-manager') ||
                            location.pathname.startsWith('/crowdfunding') ||
                            location.pathname.startsWith('/streaming') ||
                            location.pathname.startsWith('/issues');

    if (isAuthPath) {
      setLastAuthPath(location.pathname);
    } else if (isMainLayoutPath && lastAuthPath) {
      setShowPreloader(true);
      const timer = setTimeout(() => {
        setShowPreloader(false);
        setLastAuthPath(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, lastAuthPath]);

  return (
    <>
      {showPreloader && <Preloader />}
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

// Main App component
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;