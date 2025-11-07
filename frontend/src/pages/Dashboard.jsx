import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, TrendingUp, Users, Award, Clock, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_campaigns: 0,
      active_campaigns: 0,
      successful_campaigns: 0,
      total_raised: 0,
      total_backers: 0
    },
    campaigns: [],
    recentPledges: []
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/dashboard/entrepreneur`,
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const { stats, campaigns, recentPledges } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your campaigns and track your pledges</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6" data-aos="fade-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Campaigns</span>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_campaigns || 0}
            </div>
          </div>

          <div className="card p-6" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Active Campaigns</span>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.active_campaigns || 0}
            </div>
          </div>

          <div className="card p-6" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Raised</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${(stats?.total_raised || 0).toLocaleString()}
            </div>
          </div>

          <div className="card p-6" data-aos="fade-up" data-aos-delay="300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Backers</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_backers || 0}
            </div>
          </div>
        </div>

        {/* My Campaigns Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
            <Link to="/create-campaign" className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : campaigns.length === 0 ? ( 
            <div className="card p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your first campaign and bring your ideas to life
              </p>
              <Link to="/create-campaign" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Your First Campaign</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <Link to={`/campaigns/${campaign.id}`} className="block">
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      {campaign.image_url ? (
                        <img 
                          src={campaign.image_url} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {campaign.short_description || campaign.description?.substring(0, 100)}...
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (campaign.current_funds / campaign.goal_amount) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>${campaign.current_funds?.toLocaleString() || 0}</span>
                        <span>${campaign.goal_amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {campaign.funding_percentage ? `${Math.round(campaign.funding_percentage)}% funded` : '0% funded'}
                        </span>
                        <span className="text-gray-500">
                          {campaign.total_backers || 0} backers
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pledges Section */}
        <div>
          <div className="flex justify-between items-center mb-6" data-aos="fade-up">
            <h2 className="text-2xl font-bold text-gray-900">Recent Pledges</h2>
            <Link to="/my-pledges" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : !recentPledges || recentPledges.length === 0 ? (
            <div className="card p-12 text-center" data-aos="fade-up">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No pledges yet
              </h3>
              <p className="text-gray-600 mb-6">
                When you receive pledges on your campaigns, they'll appear here
              </p>
              <Link to="/create-campaign" className="btn-primary">
                Create a Campaign
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden" data-aos="fade-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPledges.map((pledge) => (
                      <tr key={pledge.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {pledge.backer_name ? pledge.backer_name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {pledge.backer_name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pledge.backer_email || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/campaigns/${pledge.campaign_id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            {pledge.campaign_title || 'Campaign'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">
                            ${pledge.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pledge.campaign_status === 'successful' ? (
                            <span className="badge badge-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Successful
                            </span>
                          ) : pledge.campaign_status === 'failed' ? (
                            <span className="badge badge-danger">
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </span>
                          ) : (
                            <span className="badge badge-info">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(pledge.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
