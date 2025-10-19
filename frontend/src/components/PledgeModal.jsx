import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, DollarSign } from 'lucide-react';
import { createPledge } from '../store/pledgeSlice';
import { fetchCampaignById } from '../store/campaignSlice';

function PledgeModal({ campaign, onClose }) {
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.pledges);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    try {
      await dispatch(createPledge({
        campaign_id: campaign.id,
        amount: parseFloat(amount)
      })).unwrap();

      setSuccess(true);
      
      // Refresh campaign data
      dispatch(fetchCampaignById(campaign.id));

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to create pledge:', err);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pledge Successful!</h3>
          <p className="text-gray-600">
            Thank you for backing this campaign with ${amount}!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Back this project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Campaign Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{campaign.title}</h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Goal: ${campaign.goal_amount?.toLocaleString()}</span>
            <span>Pledged: ${campaign.total_pledged?.toLocaleString()}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pledge Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 btn-primary"
            >
              {loading ? 'Processing...' : 'Pledge Now'}
            </button>
          </div>
        </form>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your pledge will be held until the campaign deadline. If the goal is met, funds will be transferred to the creator.
        </p>
      </div>
    </div>
  );
}

export default PledgeModal;
