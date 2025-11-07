import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Activity, Award, AlertCircle } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

function AnalyticsDashboard() {
  const [platformStats, setPlatformStats] = useState({
    totalCampaigns: 0,
    totalPledges: 0,
    totalAmountPledged: 0,
    activeCampaigns: 0,
    successfulCampaigns: 0
  });
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [successRates, setSuccessRates] = useState({
    successRate: 0,
    averageFunding: 0,
    totalCampaigns: 0
  });
  const [pledgeStats, setPledgeStats] = useState({
    totalPledges: 0,
    totalAmount: 0,
    averagePledge: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch platform stats from analytics API
      const platformRes = await analyticsAPI.getPlatformStats();
      const stats = platformRes.data.stats || {};
      setPlatformStats({
        total_users: stats.total_users || 0,
        total_campaigns: stats.total_campaigns || 0,
        active_campaigns: stats.active_campaigns || 0,
        successful_campaigns: stats.successful_campaigns || 0,
        total_funds_raised: stats.total_funds_raised || 0,
        total_pledges: stats.total_pledges || 0,
        total_pledged_amount: stats.total_pledged_amount || 0,
        avg_user_balance: stats.avg_user_balance || 0,
        active_backers: stats.active_backers || 0
      });
      
      // Fetch top campaigns
      const topCampaignsRes = await analyticsAPI.getTopCampaigns(5);
      setTopCampaigns(topCampaignsRes.data.campaigns || []);
      
      // Fetch success rates
      const successRatesRes = await analyticsAPI.getSuccessRates();
      setSuccessRates(successRatesRes.data.rates || {
        total_campaigns: 0,
        successful_count: 0,
        failed_count: 0,
        active_count: 0,
        success_rate: 0,
        avg_successful_amount: 0,
        avg_failed_amount: 0
      });
      
      // Fetch pledge stats
      const pledgeStatsRes = await analyticsAPI.getPledgeStats();
      setPledgeStats(pledgeStatsRes.data.stats || {
        total_backers: 0,
        total_pledges: 0,
        total_amount: 0,
        avg_pledge_amount: 0,
        min_pledge: 0,
        max_pledge: 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <ThreeBackground />
        <div className="text-center relative z-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative py-8">
      <ThreeBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <BarChart3 className="w-10 h-10 mr-3 text-primary-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-300">Platform-wide statistics and insights</p>
        </motion.div>

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {platformStats?.total_users || 0}
            </h3>
            <p className="text-sm text-gray-300">Registered Users</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {platformStats?.total_campaigns || 0}
            </h3>
            <p className="text-sm text-gray-300">Campaigns Created</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              ${platformStats?.total_funds_raised?.toLocaleString() || '0'}
            </h3>
            <p className="text-sm text-gray-300">Funds Raised</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">
              {platformStats?.active_campaigns || 0}
            </h3>
            <p className="text-sm text-gray-300">Active Campaigns</p>
          </motion.div>
        </div>

        {/* Success Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary-400" />
              Campaign Success Rates
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">Success Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {successRates?.success_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${successRates?.success_rate || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {successRates?.successful_count || 0}
                  </p>
                  <p className="text-xs text-gray-400">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {successRates?.failed_count || 0}
                  </p>
                  <p className="text-xs text-gray-400">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {successRates?.active_count || 0}
                  </p>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Avg Successful Amount</span>
                  <span className="font-semibold text-white">
                    ${successRates?.avg_successful_amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg Failed Amount</span>
                  <span className="font-semibold text-white">
                    ${successRates?.avg_failed_amount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
              Pledge Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-400 mb-1">Total Backers</p>
                  <p className="text-2xl font-bold text-white">
                    {pledgeStats?.total_backers || 0}
                  </p>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <p className="text-sm text-green-400 mb-1">Total Pledges</p>
                  <p className="text-2xl font-bold text-white">
                    {pledgeStats?.total_pledges || 0}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Average Pledge</span>
                  <span className="font-semibold text-white">
                    ${pledgeStats?.avg_pledge_amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Minimum Pledge</span>
                  <span className="font-semibold text-white">
                    ${pledgeStats?.min_pledge?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Maximum Pledge</span>
                  <span className="font-semibold text-white">
                    ${pledgeStats?.max_pledge?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Amount</span>
                  <span className="font-semibold text-primary-600 text-lg">
                    ${pledgeStats?.total_amount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Campaigns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Top 5 Campaigns by Funding
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Raised</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Backers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topCampaigns.map((campaign, index) => (
                  <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{campaign.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {campaign.creator_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${campaign.goal_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        ${campaign.current_funds?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(campaign.funding_percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          {campaign.funding_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.total_backers || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        campaign.status === 'successful' ? 'badge-success' :
                        campaign.status === 'failed' ? 'badge-danger' :
                        'badge-info'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6"
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Advanced Analytics Features</h4>
              <p className="text-sm text-gray-300 mb-2">
                This dashboard demonstrates advanced DBMS concepts including:
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Aggregate Functions:</strong> SUM, AVG, COUNT, MIN, MAX</li>
                <li>• <strong>Complex Joins:</strong> Multi-table queries with LEFT JOIN</li>
                <li>• <strong>GROUP BY & HAVING:</strong> Data grouping and filtering</li>
                <li>• <strong>Subqueries:</strong> Nested SELECT statements</li>
                <li>• <strong>Views:</strong> Pre-computed statistics for performance</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
