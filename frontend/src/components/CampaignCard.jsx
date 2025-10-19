import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

function CampaignCard({ campaign }) {
  const getStatusBadge = () => {
    if (campaign.status === 'successful') {
      return <span className="badge badge-success">✓ Successful</span>;
    } else if (campaign.status === 'failed') {
      return <span className="badge badge-danger">✗ Failed</span>;
    } else if (campaign.is_expired) {
      return <span className="badge badge-warning">⏰ Expired</span>;
    } else {
      return <span className="badge badge-info">● Active</span>;
    }
  };

  const getDaysRemainingText = () => {
    if (campaign.status !== 'active') return null;
    
    if (campaign.days_remaining < 0) {
      return 'Expired';
    } else if (campaign.days_remaining === 0) {
      return 'Last day!';
    } else if (campaign.days_remaining === 1) {
      return '1 day left';
    } else {
      return `${campaign.days_remaining} days left`;
    }
  };

  return (
    <Link to={`/campaigns/${campaign.id}`}>
      <div className="card p-6 h-full hover:scale-[1.02] transition-transform duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {campaign.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-primary-600">
              ${campaign.total_pledged?.toLocaleString() || 0}
            </span>
            <span className="text-sm text-gray-500">
              of ${campaign.goal_amount?.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {campaign.progress_percentage}% funded
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{campaign.backers_count || 0} backers</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{getDaysRemainingText()}</span>
          </div>
        </div>

        {/* Creator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            by <span className="font-medium text-gray-700">{campaign.creator_name}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default CampaignCard;
