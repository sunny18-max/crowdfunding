import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { 
  Home, 
  BarChart3, 
  LayoutDashboard, 
  Wallet, 
  Heart, 
  Plus, 
  LogOut, 
  User,
  Rocket,
  Menu,
  X,
  Shield,
  Users,
  TrendingUp,
  Settings,
  FileText
} from 'lucide-react';
import { useState } from 'react';

function Sidebar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/landing');
    setIsMobileOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Role-specific navigation items
  const getRoleNavItems = () => {
    const role = user?.role;
    
    const commonItems = [
      { path: '/', icon: Home, label: 'Explore', public: true },
    ];

    const roleItems = {
      admin: [
        { path: '/dashboard', icon: Shield, label: 'Admin Dashboard' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/users', icon: Users, label: 'Manage Users' },
        { path: '/campaigns', icon: TrendingUp, label: 'All Campaigns' },
        { path: '/settings', icon: Settings, label: 'Settings' },
      ],
      entrepreneur: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/create-campaign', icon: Plus, label: 'Create Campaign' },
        { path: '/my-campaigns', icon: TrendingUp, label: 'My Campaigns' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/wallet', icon: Wallet, label: 'My Wallet' },
      ],
      investor: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/my-pledges', icon: Heart, label: 'My Pledges' },
        { path: '/wallet', icon: Wallet, label: 'My Wallet' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
      ],
    };

    if (!isAuthenticated) return commonItems;
    
    return [...commonItems, ...(roleItems[role] || roleItems.investor)];
  };

  const navItems = getRoleNavItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/50">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">FundStarter</span>
          </Link>
          {isAuthenticated && user?.role && (
            <div className="mt-3 px-3 py-1.5 bg-primary-500/20 border border-primary-500/30 rounded-lg">
              <span className="text-xs font-semibold text-primary-300 uppercase">{user.role}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              // Show public items always, auth items only when authenticated
              if (item.auth && !isAuthenticated) return null;
              
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${active 
                      ? 'bg-primary-600 text-white font-medium shadow-lg shadow-primary-500/30' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMobileOpen(false)}
                className="block w-full text-center px-4 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileOpen(false)}
                className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
