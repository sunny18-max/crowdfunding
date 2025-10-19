import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/wallet/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletData(response.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/wallet/${user.id}/add-funds`,
        { amount: parseFloat(addAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddAmount('');
      setShowAddFunds(false);
      fetchWalletData();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
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
            <Wallet className="w-8 h-8 mr-3 text-primary-600" />
            My Wallet
          </h1>
          <p className="text-gray-600">Manage your funds and view transaction history</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-primary-100 text-sm mb-2">Available Balance</p>
              <h2 className="text-5xl font-bold">
                ${walletData?.user?.wallet_balance?.toLocaleString() || '0.00'}
              </h2>
            </div>
            <button
              onClick={() => setShowAddFunds(true)}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Funds</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary-500">
            <div>
              <p className="text-primary-100 text-sm">Total Debits</p>
              <p className="text-2xl font-semibold">
                ${walletData?.stats?.total_debits?.toLocaleString() || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Total Credits</p>
              <p className="text-2xl font-semibold">
                ${walletData?.stats?.total_credits?.toLocaleString() || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Total Refunds</p>
              <p className="text-2xl font-semibold">
                ${walletData?.stats?.total_refunds?.toLocaleString() || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* ACID Transaction Demo */}
        <div className="card p-6 mb-8 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            ACID Transaction Demonstration
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            All wallet operations use ACID transactions: <strong>Atomicity</strong>, <strong>Consistency</strong>, 
            <strong>Isolation</strong>, and <strong>Durability</strong>. Every pledge operation either completes 
            fully or rolls back completely.
          </p>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <p className="font-semibold text-blue-900">Atomicity</p>
              <p className="text-gray-600 text-xs">All or nothing</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-semibold text-blue-900">Consistency</p>
              <p className="text-gray-600 text-xs">Valid state</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-semibold text-blue-900">Isolation</p>
              <p className="text-gray-600 text-xs">No interference</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="font-semibold text-blue-900">Durability</p>
              <p className="text-gray-600 text-xs">Persists</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 flex items-center justify-between">
              <span>Transaction History</span>
              <span className="text-sm font-normal text-gray-500">
                {walletData?.stats?.total_transactions || 0} transactions
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {walletData?.transactions?.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance Before</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {walletData?.transactions?.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        ${transaction.balance_before.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        ${transaction.balance_after.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Funds to Wallet</h3>
              <p className="text-gray-600 mb-6">Enter the amount you want to add to your wallet.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="input-field pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  disabled={!addAmount || parseFloat(addAmount) <= 0}
                  className="flex-1 btn-primary"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletDashboard;
