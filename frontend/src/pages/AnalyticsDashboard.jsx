import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Activity, Award, AlertCircle } from 'lucide-react';
import { analyticsAPI } from '../services/api';

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
      setPlatformStats(platformRes.data.stats || {
        total_users: 0,
        total_campaigns: 0,
        active_campaigns: 0,
        successful_campaigns: 0,
        total_funds_raised: 0,
        total_pledges: 0,
        total_pledged_amount: 0,
        avg_user_balance: 0,
        active_backers: 0
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-primary-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Platform-wide statistics and insights</p>
        </div>

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {platformStats?.total_users || 0}
            </h3>
            <p className="text-sm text-gray-600">Registered Users</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {platformStats?.total_campaigns || 0}
            </h3>
            <p className="text-sm text-gray-600">Campaigns Created</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              ${platformStats?.total_funds_raised?.toLocaleString() || '0'}
            </h3>
            <p className="text-sm text-gray-600">Funds Raised</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {platformStats?.active_campaigns || 0}
            </h3>
            <p className="text-sm text-gray-600">Active Campaigns</p>
          </div>
        </div>

        {/* Success Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary-600" />
              Campaign Success Rates
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Success Rate</span>
                  <span className="text-2xl font-bold text-green-600">
                    {successRates?.success_rate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
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
                  <p className="text-xs text-gray-600">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {successRates?.failed_count || 0}
                  </p>
                  <p className="text-xs text-gray-600">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {successRates?.active_count || 0}
                  </p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Avg Successful Amount</span>
                  <span className="font-semibold text-gray-900">
                    ${successRates?.avg_successful_amount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Failed Amount</span>
                  <span className="font-semibold text-gray-900">
                    ${successRates?.avg_failed_amount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Pledge Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total Backers</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {pledgeStats?.total_backers || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Total Pledges</p>
                  <p className="text-2xl font-bold text-green-900">
                    {pledgeStats?.total_pledges || 0}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Pledge</span>
                  <span className="font-semibold text-gray-900">
                    ${pledgeStats?.avg_pledge_amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Minimum Pledge</span>
                  <span className="font-semibold text-gray-900">
                    ${pledgeStats?.min_pledge?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maximum Pledge</span>
                  <span className="font-semibold text-gray-900">
                    ${pledgeStats?.max_pledge?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-semibold text-primary-600 text-lg">
                    ${pledgeStats?.total_amount?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Top 5 Campaigns by Funding
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raised</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCampaigns.map((campaign, index) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{campaign.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(campaign.funding_percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
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
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Advanced Analytics Features</h4>
              <p className="text-sm text-blue-800 mb-2">
                This dashboard demonstrates advanced DBMS concepts including:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Aggregate Functions:</strong> SUM, AVG, COUNT, MIN, MAX</li>
                <li>• <strong>Complex Joins:</strong> Multi-table queries with LEFT JOIN</li>
                <li>• <strong>GROUP BY & HAVING:</strong> Data grouping and filtering</li>
                <li>• <strong>Subqueries:</strong> Nested SELECT statements</li>
                <li>• <strong>Views:</strong> Pre-computed statistics for performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
