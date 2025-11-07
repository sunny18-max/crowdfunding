import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import EntrepreneurDashboard from '../components/dashboards/EntrepreneurDashboard';
import InvestorDashboard from '../components/dashboards/InvestorDashboard';
import { Loader2 } from 'lucide-react';

function EnhancedDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <ThreeBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <Loader2 className="w-16 h-16 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'entrepreneur':
        return <EntrepreneurDashboard />;
      case 'investor':
        return <InvestorDashboard />;
      default:
        return <InvestorDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      <ThreeBackground />
      <div className="relative z-10">
        {renderDashboard()}
      </div>
    </div>
  );
}

export default EnhancedDashboard;
