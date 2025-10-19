import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../store/campaignSlice';
import { FileText, DollarSign, Calendar, ArrowLeft } from 'lucide-react';

function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.campaigns);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(createCampaign({
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
      })).unwrap();

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create campaign:', err);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a New Campaign
          </h1>
          <p className="text-gray-600">
            Share your project with the world and get the funding you need
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Give your campaign a catchy title"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                className="input-field resize-none"
                placeholder="Describe your project, what you're building, and why people should support it..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Be clear and compelling. Explain what makes your project unique.
              </p>
            </div>

            {/* Goal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Goal *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="goal_amount"
                  value={formData.goal_amount}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="5000"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Set a realistic funding goal for your project
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="input-field pl-10"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Choose when your campaign should end
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Backers pledge money to support your campaign</li>
                <li>• If you reach your goal by the deadline, you receive the funds</li>
                <li>• If you don't reach your goal, all pledges are refunded</li>
                <li>• This is an all-or-nothing funding model</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Creating...' : 'Launch Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCampaign;
