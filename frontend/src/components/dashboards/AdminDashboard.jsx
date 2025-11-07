import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Users, TrendingUp, DollarSign, Activity, Shield, AlertCircle,
  CheckCircle, XCircle, BarChart3, PieChart, Clock, Zap
} from 'lucide-react';

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard/admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const roleStats = dashboardData?.roleStats || [];
  const recentActivities = dashboardData?.recentActivities || [];
  const topCampaigns = dashboardData?.topCampaigns || [];
  const recentUsers = dashboardData?.recentUsers || [];

  const statCards = [
    {
      title: 'Total Users',
      value: overview.total_users || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      subtitle: `${overview.total_entrepreneurs || 0} Entrepreneurs, ${overview.total_investors || 0} Investors`
    },
    {
      title: 'Active Campaigns',
      value: overview.active_campaigns || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+8%',
      subtitle: `${overview.total_campaigns || 0} Total Campaigns`
    },
    {
      title: 'Total Funds Raised',
      value: `$${(overview.total_funds_raised || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      change: '+23%',
      subtitle: `${overview.total_pledges || 0} Total Pledges`
    },
    {
      title: 'Platform Activity',
      value: overview.today_activities || 0,
      icon: Activity,
      color: 'from-orange-500 to-red-500',
      change: '+15%',
      subtitle: 'Activities Today'
    }
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 text-lg">
                Platform Overview & Management
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm mb-2">{stat.title}</div>
                <div className="text-gray-500 text-xs">{stat.subtitle}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <PieChart className="w-6 h-6 mr-2 text-primary-400" />
                User Distribution by Role
              </h2>

              <div className="space-y-4">
                {roleStats.map((role, index) => {
                  const percentage = (role.user_count / overview.total_users) * 100;
                  const colors = {
                    investor: 'from-blue-500 to-cyan-500',
                    entrepreneur: 'from-purple-500 to-pink-500',
                    admin: 'from-orange-500 to-red-500'
                  };

                  return (
                    <motion.div
                      key={role.role}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${colors[role.role]} rounded-lg flex items-center justify-center`}>
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-semibold capitalize">{role.role}s</div>
                            <div className="text-gray-400 text-sm">{role.user_count} users</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{Math.round(percentage)}%</div>
                          <div className="text-gray-400 text-xs">{role.verified_users} verified</div>
                        </div>
                      </div>

                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${colors[role.role]}`}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Avg Balance: </span>
                          <span className="text-white font-semibold">${Math.round(role.avg_wallet_balance)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Balance: </span>
                          <span className="text-white font-semibold">${role.total_wallet_balance?.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Campaigns */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                Top Performing Campaigns
              </h2>

              {topCampaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No campaigns yet
                </div>
              ) : (
                <div className="space-y-3">
                  {topCampaigns.slice(0, 5).map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/50 rounded-lg p-4 border border-white/5 hover:border-primary-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{campaign.title}</h4>
                          <p className="text-gray-400 text-sm">by {campaign.creator_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">${campaign.current_funds?.toLocaleString()}</div>
                          <div className="text-gray-400 text-xs">{campaign.total_backers} backers</div>
                        </div>
                      </div>

                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${Math.min((campaign.current_funds / campaign.goal_amount) * 100, 100)}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {Math.round((campaign.current_funds / campaign.goal_amount) * 100)}% of ${campaign.goal_amount?.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-semibold ${
                          campaign.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : campaign.status === 'successful'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-400" />
                Recent Platform Activity
              </h2>

              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No recent activities
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivities.slice(0, 10).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-white/5"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.activity_type === 'login' ? 'bg-blue-500/20' :
                        activity.activity_type === 'register' ? 'bg-green-500/20' :
                        activity.activity_type === 'pledge' ? 'bg-purple-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        {activity.activity_type === 'login' ? <CheckCircle className="w-4 h-4 text-blue-400" /> :
                         activity.activity_type === 'register' ? <Users className="w-4 h-4 text-green-400" /> :
                         activity.activity_type === 'pledge' ? <DollarSign className="w-4 h-4 text-purple-400" /> :
                         <Activity className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">{activity.activity_description}</div>
                        <div className="text-gray-500 text-xs">{new Date(activity.timestamp).toLocaleString()}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                System Health
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-semibold">Healthy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">API Server</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-semibold">Online</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Response Time</span>
                  <span className="text-white text-sm font-semibold">45ms</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Uptime</span>
                  <span className="text-white text-sm font-semibold">99.9%</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-400" />
                Recent Users
              </h2>

              {recentUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No recent users
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.slice(0, 5).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-white/5"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{user.name}</div>
                        <div className="text-gray-400 text-xs capitalize">{user.role}</div>
                      </div>
                      {user.is_verified ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-orange-400" />
                Admin Actions
              </h2>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Manage Users</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-gray-800/50 text-white rounded-lg font-medium flex items-center justify-center space-x-2 border border-white/10"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Review Campaigns</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-gray-800/50 text-white rounded-lg font-medium flex items-center justify-center space-x-2 border border-white/10"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Reports</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-gray-800/50 text-white rounded-lg font-medium flex items-center justify-center space-x-2 border border-white/10"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>System Logs</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Platform Stats Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                Platform Stats
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Success Rate</span>
                  <span className="text-green-400 font-bold">
                    {overview.total_campaigns > 0 
                      ? Math.round((overview.active_campaigns / overview.total_campaigns) * 100)
                      : 0}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Avg Campaign Size</span>
                  <span className="text-white font-bold">
                    ${overview.total_campaigns > 0 
                      ? Math.round(overview.total_funds_raised / overview.total_campaigns).toLocaleString()
                      : 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Wallet Balance</span>
                  <span className="text-white font-bold">${overview.total_wallet_balance?.toLocaleString() || 0}</span>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Platform Health</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 font-bold text-sm">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
