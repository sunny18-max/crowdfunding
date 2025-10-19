import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserCampaigns } from '../store/campaignSlice';
import { fetchUserPledges, fetchUserPledgeStats } from '../store/pledgeSlice';
import CampaignCard from '../components/CampaignCard';
import { Plus, TrendingUp, Heart, DollarSign, CheckCircle, XCircle } from 'lucide-react';

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userCampaigns, loading: campaignsLoading } = useSelector((state) => state.campaigns);
  const { pledges, stats } = useSelector((state) => state.pledges);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserCampaigns(user.id));
      dispatch(fetchUserPledges(user.id));
      dispatch(fetchUserPledgeStats(user.id));
    }
  }, [dispatch, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Manage your campaigns and track your pledges</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">My Campaigns</span>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {userCampaigns.length}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Pledges</span>
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_pledges || 0}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Amount Pledged</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats?.total_amount_pledged?.toLocaleString() || 0}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Success Rate</span>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.total_pledges > 0 
                ? Math.round((stats.successful_pledges / stats.total_pledges) * 100)
                : 0}%
            </div>
          </div>
        </div>

        {/* My Campaigns Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
            <Link to="/create-campaign" className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Campaign</span>
            </Link>
          </div>

          {campaignsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : userCampaigns.length === 0 ? (
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
              {userCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Pledges Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Pledges</h2>
            <Link to="/my-pledges" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {pledges.length === 0 ? (
            <div className="card p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No pledges yet
              </h3>
              <p className="text-gray-600 mb-6">
                Explore campaigns and support projects you believe in
              </p>
              <Link to="/" className="btn-primary">
                Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
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
                    {pledges.slice(0, 5).map((pledge) => (
                      <tr key={pledge.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/campaigns/${pledge.campaign_id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {pledge.campaign_title}
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
