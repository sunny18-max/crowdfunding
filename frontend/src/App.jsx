import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CampaignDetails from './pages/CampaignDetails';
import CreateCampaign from './pages/CreateCampaign';
import MyPledges from './pages/MyPledges';
import WalletDashboard from './pages/WalletDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Layout for authenticated users (with sidebar)
const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
      <Outlet />
    </main>
  </div>
);

// Layout for public pages (no sidebar)
const PublicLayout = () => (
  <div className="min-h-screen bg-white">
    <main>
      <Outlet />
    </main>
  </div>
);

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/landing" element={!isAuthenticated ? <Landing /> : <Navigate to="/" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        </Route>

        {/* Authenticated Routes */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/landing" />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/my-pledges" element={<MyPledges />} />
          <Route path="/wallet" element={<WalletDashboard />} />
        </Route>

        {/* Routes accessible to both logged-in and public users */}
        <Route element={<DashboardLayout />}>
           <Route path="/campaigns/:id" element={<CampaignDetails />} />
           <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/landing"} />} />
      </Routes>
    </Router>
  );
}

export default App;
