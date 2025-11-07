import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Plus, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import { walletAPI, transactionsAPI } from '../services/api';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';

function WalletDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet data
      const walletRes = await walletAPI.getWallet(user.id);
      
      // Backend returns { user, transactions, stats }
      setWalletData({
        user: walletRes.data.user || { wallet_balance: 0 },
        transactions: walletRes.data.transactions || [],
        stats: walletRes.data.stats || {
          total_transactions: 0,
          total_debits: 0,
          total_credits: 0,
          total_refunds: 0
        }
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Set default values if there's an error
      setWalletData({
        user: { wallet_balance: 0 },
        transactions: [],
        stats: {
          total_transactions: 0,
          total_debits: 0,
          total_credits: 0,
          total_refunds: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!addAmount || isNaN(addAmount) || parseFloat(addAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      // Add funds to wallet
      await walletAPI.addFunds(user.id, parseFloat(addAmount));
      
      setAddAmount('');
      setShowAddFunds(false);
      await fetchWalletData(); // Refresh wallet data
      alert('Funds added successfully!');
    } catch (error) {
      console.error('Error adding funds:', error);
      alert(error.response?.data?.error || 'Failed to add funds');
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'debit':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return 'text-green-600';
      case 'debit':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <ThreeBackground />
        <div className="text-center relative z-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-300">Loading wallet...</p>
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
            <Wallet className="w-10 h-10 mr-3 text-primary-400" />
            My Wallet
          </h1>
          <p className="text-gray-300">Manage your funds and view transaction history</p>
        </motion.div>

        {/* User Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {walletData?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{walletData?.user?.name}</h2>
              <p className="text-gray-300">{walletData?.user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-300 text-xs font-semibold uppercase">
                  {walletData?.user?.role}
                </span>
                {walletData?.user?.is_verified && (
                  <span className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          {walletData?.user?.bio && (
            <p className="mt-4 text-gray-300 text-sm">{walletData.user.bio}</p>
          )}
          {(walletData?.user?.location || walletData?.user?.phone) && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
              {walletData?.user?.location && (
                <span>📍 {walletData.user.location}</span>
              )}
              {walletData?.user?.phone && (
                <span>📞 {walletData.user.phone}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary-600/30 to-primary-800/30 backdrop-blur-lg border border-primary-500/30 rounded-2xl p-8 mb-8 text-white shadow-2xl"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-primary-100 text-sm mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold">
                ${walletData?.user?.wallet_balance?.toLocaleString() || '0.00'}
              </h2>
            </div>
            <button
              onClick={() => setShowAddFunds(true)}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2 border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Funds</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
            <div>
              <p className="text-gray-300 text-sm">Total Debits</p>
              <p className="text-2xl font-semibold">
                ${walletData?.stats?.total_debits?.toLocaleString() || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Total Credits</p>
              <p className="text-2xl font-semibold">
                ${walletData?.stats?.total_credits?.toLocaleString() || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Total Refunds</p>
              <p className="text-2xl font-semibold">
                ${walletData?.stats?.total_refunds?.toLocaleString() || '0.00'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ACID Transaction Demo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-500/10 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            ACID Transaction Demonstration
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            All wallet operations use ACID transactions: <strong>Atomicity</strong>, <strong>Consistency</strong>, 
            <strong>Isolation</strong>, and <strong>Durability</strong>. Every pledge operation either completes 
            fully or rolls back completely.
          </p>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-blue-300">Atomicity</p>
              <p className="text-gray-400 text-xs">All or nothing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-blue-300">Consistency</p>
              <p className="text-gray-400 text-xs">Valid state</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-blue-300">Isolation</p>
              <p className="text-gray-400 text-xs">No interference</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <p className="font-semibold text-blue-300">Durability</p>
              <p className="text-gray-400 text-xs">Persists</p>
            </div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center justify-between">
              <span>Transaction History</span>
              <span className="text-sm font-normal text-gray-400">
                {walletData?.stats?.total_transactions || 0} transactions
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {walletData?.transactions?.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300">No transactions yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Balance Before</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Balance After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {walletData?.transactions?.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          <span className={`font-medium capitalize ${getTransactionColor(transaction.transaction_type)}`}>
                            {transaction.transaction_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                          ${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        ${transaction.balance_before.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                        ${transaction.balance_after.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Add Funds to Wallet</h3>
              <p className="text-gray-300 mb-6">Enter the amount you want to add to your wallet.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  disabled={!addAmount || parseFloat(addAmount) <= 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Funds
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletDashboard;
