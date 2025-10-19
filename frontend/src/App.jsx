import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Landing page layout (no sidebar)
  if (!isAuthenticated && window.location.pathname === '/') {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  // Dashboard layout (with sidebar)
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/campaigns/:id" 
            element={<CampaignDetails />} 
          />
          <Route 
            path="/create-campaign" 
            element={isAuthenticated ? <CreateCampaign /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-pledges" 
            element={isAuthenticated ? <MyPledges /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/wallet" 
            element={isAuthenticated ? <WalletDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/analytics" 
            element={<AnalyticsDashboard />} 
          />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
