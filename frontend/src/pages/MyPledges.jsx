import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserPledges, fetchUserPledgeStats } from '../store/pledgeSlice';
import { Heart, TrendingUp, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

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
    <div className="min-h-screen relative py-8">
      <ThreeBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">My Pledges</h1>
          <p className="text-gray-300">Track all your campaign contributions</p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Total Pledges</span>
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.total_pledges || 0}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Total Amount</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                ${stats.total_amount_pledged?.toLocaleString() || 0}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Successful</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.successful_pledges || 0}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm font-medium">Active</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.active_pledges || 0}
              </div>
            </motion.div>
          </div>
        )}

        {/* Pledges List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-300">Loading pledges...</p>
            </div>
          ) : pledges.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No pledges yet
              </h3>
              <p className="text-gray-300 mb-6">
                Start supporting amazing projects today!
              </p>
              <Link to="/" className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30 inline-block">
                Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Campaign Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pledges.map((pledge, index) => (
                    <tr key={`${pledge.id}-${index}`} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/campaigns/${pledge.campaign_id}`}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          {pledge.campaign_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-semibold text-white">
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
                          <span className="text-xs text-gray-300">
                            {Math.round((pledge.total_pledged / pledge.goal_amount) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(pledge.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h4 className="font-semibold text-blue-300 mb-2">Understanding Transaction Status</h4>
            <div className="space-y-2 text-sm text-gray-300">
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
