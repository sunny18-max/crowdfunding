import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp, DollarSign, Users, Award, Plus, Eye, Edit, Video,
  Calendar, Target, Bell, BarChart3, Zap, Clock, CheckCircle
} from 'lucide-react';
import CampaignDetailModal from '../CampaignDetailModal';

function EntrepreneurDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching dashboard data from:', `${import.meta.env.VITE_API_URL}/dashboard/entrepreneur`);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dashboard/entrepreneur`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );
      
      console.log('Dashboard API response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      // Set default data to prevent UI from breaking
      setDashboardData({
        stats: {
          total_campaigns: 0,
          active_campaigns: 0,
          successful_campaigns: 0,
          total_raised: 0,
          total_backers: 0
        },
        campaigns: [],
        recentPledges: [],
        notifications: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailModal(true);
  };

  const handleEditCampaign = (campaignId) => {
    // Navigate to the edit campaign page with the campaign ID
    window.location.href = `/edit-campaign/${campaignId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const campaigns = dashboardData?.campaigns || [];
  const recentPledges = dashboardData?.recentPledges || [];
  const notifications = dashboardData?.notifications || [];

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats.total_campaigns || 0,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Active Campaigns',
      value: stats.active_campaigns || 0,
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      change: '+5%'
    },
    {
      title: 'Total Raised',
      value: `$${(stats.total_raised || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      change: '+23%'
    },
    {
      title: 'Total Backers',
      value: stats.total_backers || 0,
      icon: Users,
      color: 'from-orange-500 to-red-500',
      change: '+18%'
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.name}! 🚀
              </h1>
              <p className="text-gray-300 text-lg">
                Manage your campaigns and track your success
              </p>
            </div>
            <Link to="/create-campaign">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Campaign</span>
              </motion.button>
            </Link>
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
                <div className="text-gray-400 text-sm">{stat.title}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Campaigns List */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-primary-400" />
                  Your Campaigns
                </h2>
                <Link to="/create-campaign" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View All →
                </Link>
              </div>

              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No campaigns yet</p>
                  <Link to="/create-campaign">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg"
                    >
                      Create Your First Campaign
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-xl p-4 border border-white/10 hover:border-primary-500/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                            {campaign.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{campaign.description}</p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(campaign)}
                            className="p-2 bg-primary-600/20 text-primary-400 rounded-lg hover:bg-primary-600/30"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <Link to={`/edit-campaign/${campaign.id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
                              title="Edit Campaign"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditCampaign(campaign.id);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                          </Link>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-semibold">
                            {Math.round((campaign.current_funds / campaign.goal_amount) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((campaign.current_funds / campaign.goal_amount) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                          />
                        </div>
                      </div>

                      {/* Campaign Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Raised</div>
                          <div className="text-white font-semibold">${campaign.current_funds?.toLocaleString() || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Goal</div>
                          <div className="text-white font-semibold">${campaign.goal_amount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Backers</div>
                          <div className="text-white font-semibold">{campaign.total_backers || 0}</div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : campaign.status === 'successful'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {campaign.status}
                        </span>
                        <div className="flex items-center text-gray-400 text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Pledges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-400" />
                Recent Pledges
              </h2>

              {recentPledges.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No pledges yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPledges.slice(0, 5).map((pledge, index) => (
                    <motion.div
                      key={pledge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">${pledge.amount}</div>
                          <div className="text-gray-400 text-sm">{pledge.campaign_title}</div>
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(pledge.timestamp).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-yellow-400" />
                Notifications
              </h2>

              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No new notifications
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-gray-800/50 rounded-lg border border-white/5"
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notif.type === 'success' ? 'bg-green-400' :
                          notif.type === 'warning' ? 'bg-yellow-400' :
                          notif.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium mb-1">{notif.title}</div>
                          <div className="text-gray-400 text-xs">{notif.message}</div>
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(notif.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-primary-400" />
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Link to="/create-campaign">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Campaign</span>
                  </motion.button>
                </Link>

                <Link to="/campaign-analytics" className="w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 bg-gray-800/50 text-white rounded-lg font-medium flex items-center justify-center space-x-2 border border-white/10 hover:border-blue-500/50 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Analytics</span>
                  </motion.button>
                </Link>

                <Link to="/manage-backers" className="w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 bg-gray-800/50 text-white rounded-lg font-medium flex items-center justify-center space-x-2 border border-white/10 hover:border-blue-500/50 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage Backers</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Performance Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Performance
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-white font-semibold">
                      {stats.total_campaigns > 0 
                        ? Math.round((stats.successful_campaigns / stats.total_campaigns) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${stats.total_campaigns > 0 ? (stats.successful_campaigns / stats.total_campaigns) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Successful</span>
                    <span className="text-green-400 font-semibold">{stats.successful_campaigns || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Active</span>
                    <span className="text-blue-400 font-semibold">{stats.active_campaigns || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-semibold">{stats.total_campaigns || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {showDetailModal && selectedCampaign && (
        <CampaignDetailModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
}

export default EntrepreneurDashboard;
