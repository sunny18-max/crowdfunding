import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function CampaignCard({ campaign }) {
  const getStatusBadge = () => {
    if (campaign.status === 'successful') {
      return (
        <motion.span 
          className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Funded</span>
        </motion.span>
      );
    } else if (campaign.status === 'failed') {
      return (
        <motion.span 
          className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-800"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </motion.span>
      );
    } else if (campaign.is_expired) {
      return (
        <motion.span 
          className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Ended</span>
        </motion.span>
      );
    } else {
      return (
        <motion.span 
          className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
          <span>Active</span>
        </motion.span>
      );
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
      <motion.div 
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 h-full flex flex-col hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
            {campaign.title}
          </h3>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold text-blue-400">
              ${campaign.total_pledged?.toLocaleString() || 0}
            </span>
            <span className="text-sm text-gray-400">
              of ${campaign.goal_amount?.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              {parseFloat(campaign.progress_percentage || 0).toFixed(1)}% funded
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>{campaign.backers_count || 0} backers</span>
          </div>
          {getDaysRemainingText() && (
            <div className="flex items-center space-x-2 bg-blue-900/30 text-blue-300 px-2 py-1 rounded-md text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{getDaysRemainingText()}</span>
            </div>
          )}
        </div>

        {/* Creator */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-xs text-gray-400">
            by <span className="font-medium text-blue-300">{campaign.creator_name}</span>
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export default CampaignCard;
