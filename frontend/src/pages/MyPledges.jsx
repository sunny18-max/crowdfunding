import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserPledges, fetchUserPledgeStats } from '../store/pledgeSlice';
import { Heart, TrendingUp, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

function MyPledges() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { pledges, stats, loading } = useSelector((state) => state.pledges);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserPledges(user.id));
      dispatch(fetchUserPledgeStats(user.id));
    }
  }, [dispatch, user]);

  const getStatusBadge = (pledge) => {
    if (pledge.campaign_status === 'successful') {
      return (
        <span className="badge badge-success flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          Successful
        </span>
      );
    } else if (pledge.campaign_status === 'failed') {
      return (
        <span className="badge badge-danger flex items-center">
          <XCircle className="w-3 h-3 mr-1" />
          Failed - Refunded
        </span>
      );
    } else {
      return (
        <span className="badge badge-info flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
  };

  const getTransactionStatus = (status) => {
    if (status === 'committed') {
      return <span className="text-green-600 text-sm font-medium">✓ Committed</span>;
    } else if (status === 'rolled_back') {
      return <span className="text-red-600 text-sm font-medium">↩ Refunded</span>;
    } else {
      return <span className="text-yellow-600 text-sm font-medium">⏳ Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Pledges</h1>
          <p className="text-gray-600">Track all your campaign contributions</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Pledges</span>
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.total_pledges || 0}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Amount</span>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.total_amount_pledged?.toLocaleString() || 0}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Successful</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.successful_pledges || 0}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Active</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.active_pledges || 0}
              </div>
            </div>
          </div>
        )}

        {/* Pledges List */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading pledges...</p>
            </div>
          ) : pledges.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No pledges yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start supporting amazing projects today!
              </p>
              <Link to="/" className="btn-primary inline-block">
                Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pledges.map((pledge) => (
                    <tr key={pledge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          to={`/campaigns/${pledge.campaign_id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {pledge.campaign_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-semibold text-gray-900">
                          ${pledge.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pledge)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTransactionStatus(pledge.transaction_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (pledge.total_pledged / pledge.goal_amount) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {Math.round((pledge.total_pledged / pledge.goal_amount) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(pledge.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(pledge.deadline).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        {pledges.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Understanding Transaction Status</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>⏳ Pending:</strong> Campaign is still active. Your pledge is held until the deadline.</p>
              <p><strong>✓ Committed:</strong> Campaign reached its goal! Your pledge has been transferred to the creator.</p>
              <p><strong>↩ Refunded:</strong> Campaign didn't reach its goal. Your pledge has been refunded.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPledges;
