import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Wallet, TrendingUp, Heart, DollarSign, Target, Bell, BarChart3,
  ArrowUpRight, ArrowDownRight, Eye, Calendar, Users, Sparkles
} from 'lucide-react';

function InvestorDashboard() {
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
        `${import.meta.env.VITE_API_URL}/dashboard/investor`,
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

  const stats = dashboardData?.stats || {};
  const pledges = dashboardData?.pledges || [];
  const backedCampaigns = dashboardData?.backedCampaigns || [];
  const transactions = dashboardData?.transactions || [];
  const notifications = dashboardData?.notifications || [];
  const recommendedCampaigns = dashboardData?.recommendedCampaigns || [];

  const statCards = [
    {
      title: 'Wallet Balance',
      value: `$${(stats.wallet_balance || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'from-blue-500 to-cyan-500',
      change: '+$500'
    },
    {
      title: 'Total Invested',
      value: `$${(stats.total_invested || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      change: '+15%'
    },
    {
      title: 'Campaigns Backed',
      value: stats.campaigns_backed || 0,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      change: '+3'
    },
    {
      title: 'Avg. Pledge',
      value: `$${Math.round(stats.avg_pledge_amount || 0)}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      change: '+8%'
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
                Welcome, {user?.name}! 💰
              </h1>
              <p className="text-gray-300 text-lg">
                Track your investments and discover new opportunities
              </p>
            </div>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Discover Campaigns</span>
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
                  <span className="text-green-400 text-sm font-semibold flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.title}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Backed Campaigns */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-pink-400" />
                  Backed Campaigns
                </h2>
                <Link to="/my-pledges" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View All →
                </Link>
              </div>

              {backedCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No backed campaigns yet</p>
                  <Link to="/">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg"
                    >
                      Explore Campaigns
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {backedCampaigns.slice(0, 5).map((campaign, index) => (
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
                          <p className="text-gray-400 text-sm">Your pledge: ${campaign.your_pledge?.toLocaleString()}</p>
                        </div>
                        <Link to={`/campaigns/${campaign.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-primary-600/20 text-primary-400 rounded-lg hover:bg-primary-600/30"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </Link>
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
                          <div className="text-white font-semibold text-sm">${campaign.current_funds?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Goal</div>
                          <div className="text-white font-semibold text-sm">${campaign.goal_amount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Status</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : campaign.status === 'successful'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
                Recent Transactions
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'credit'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                            : 'bg-gradient-to-br from-red-500 to-pink-500'
                        }`}>
                          {transaction.transaction_type === 'credit' ? (
                            <ArrowUpRight className="w-5 h-5 text-white" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {transaction.transaction_type === 'credit' ? '+' : '-'}${transaction.amount}
                          </div>
                          <div className="text-gray-400 text-sm">{transaction.description}</div>
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
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

            {/* Recommended Campaigns */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary-400" />
                Recommended For You
              </h2>

              {recommendedCampaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No recommendations yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedCampaigns.slice(0, 3).map((campaign, index) => (
                    <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-gray-800/50 rounded-lg border border-white/5 hover:border-primary-500/50 transition-all group cursor-pointer"
                      >
                        <h4 className="text-white font-medium mb-2 group-hover:text-primary-400 transition-colors">
                          {campaign.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {Math.round((campaign.current_funds / campaign.goal_amount) * 100)}% funded
                          </span>
                          <span className="text-primary-400 font-semibold">
                            ${campaign.current_funds?.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Investment Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Investment Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Pledges</span>
                  <span className="text-white font-bold">{stats.total_pledges || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Investments</span>
                  <span className="text-white font-bold">{backedCampaigns.filter(c => c.status === 'active').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Successful</span>
                  <span className="text-green-400 font-bold">{backedCampaigns.filter(c => c.status === 'successful').length}</span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Portfolio Value</span>
                    <span className="text-2xl font-bold text-white">${(stats.total_invested || 0).toLocaleString()}</span>
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

export default InvestorDashboard;
