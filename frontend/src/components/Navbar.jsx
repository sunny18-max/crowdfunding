import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Rocket, User, LogOut, LayoutDashboard, Heart, Plus, Wallet, BarChart3 } from 'lucide-react';

function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Rocket className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
            <span className="text-xl font-bold text-gray-900">FundStarter</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Explore
            </Link>

            <Link 
              to="/analytics" 
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link 
                  to="/wallet" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Wallet</span>
                </Link>

                <Link 
                  to="/my-pledges" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>My Pledges</span>
                </Link>

                <Link 
                  to="/create-campaign" 
                  className="flex items-center space-x-1 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Campaign</span>
                </Link>

                <div className="flex items-center space-x-4 pl-4 border-l border-gray-300">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
