import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaignById } from '../store/campaignSlice';
import PledgeModal from '../components/PledgeModal';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Clock,
  User,
  Heart
} from 'lucide-react';

function CampaignDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCampaign: campaign, loading } = useSelector((state) => state.campaigns);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showPledgeModal, setShowPledgeModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaignById(id));
  }, [dispatch, id]);

  if (loading || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  const isCreator = user?.id === campaign.creator_id;
  const canPledge = isAuthenticated && !isCreator && campaign.status === 'active' && !campaign.is_expired;

  const getStatusBadge = () => {
    if (campaign.status === 'successful') {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          ✓ Successfully Funded
        </span>
      );
    } else if (campaign.status === 'failed') {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          ✗ Funding Failed
        </span>
      );
    } else if (campaign.is_expired) {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
          ⏰ Campaign Ended
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
          ● Active Campaign
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <div className="card p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">
                  {campaign.title}
                </h1>
                {getStatusBadge()}
              </div>

              {/* Creator Info */}
              <div className="flex items-center space-x-2 text-gray-600 mb-6">
                <User className="w-4 h-4" />
                <span className="text-sm">
                  by <span className="font-medium text-gray-900">{campaign.creator_name}</span>
                </span>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About this project</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {campaign.description}
                </p>
              </div>
            </div>

            {/* Backers List */}
            {campaign.backers && campaign.backers.length > 0 && (
              <div className="card p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Backers ({campaign.backers_count})
                </h3>
                <div className="space-y-4">
                  {campaign.backers.map((backer) => (
                    <div 
                      key={backer.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{backer.backer_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(backer.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          ${backer.amount.toLocaleString()}
                        </p>
                        {backer.transaction_status && (
                          <p className="text-xs text-gray-500 capitalize">
                            {backer.transaction_status}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              {/* Funding Progress */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ${campaign.total_pledged?.toLocaleString() || 0}
                </div>
                <div className="text-gray-600 mb-4">
                  pledged of ${campaign.goal_amount?.toLocaleString()} goal
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {campaign.progress_percentage}% funded
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>Backers</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {campaign.backers_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>Deadline</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Date(campaign.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>Time Left</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {campaign.days_remaining < 0 
                      ? 'Ended' 
                      : campaign.days_remaining === 0 
                      ? 'Last day!' 
                      : `${campaign.days_remaining} days`}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {canPledge ? (
                <button
                  onClick={() => setShowPledgeModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>Back this project</span>
                </button>
              ) : isCreator ? (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    This is your campaign
                  </p>
                </div>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary"
                >
                  Login to Back This Project
                </button>
              ) : (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">
                    Campaign has ended
                  </p>
                </div>
              )}

              {/* Campaign Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">All or Nothing</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This project will only be funded if it reaches its goal by{' '}
                  {new Date(campaign.deadline).toLocaleDateString()}. 
                  If not, all pledges will be automatically refunded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pledge Modal */}
      {showPledgeModal && (
        <PledgeModal
          campaign={campaign}
          onClose={() => setShowPledgeModal(false)}
        />
      )}
    </div>
  );
}

export default CampaignDetails;
