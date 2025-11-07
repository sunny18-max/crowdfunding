import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Calendar, Target, Users, DollarSign, TrendingUp, Play, Edit, Share2 } from 'lucide-react';
import { useState } from 'react';

function CampaignDetailModal({ campaign, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [videoUrl, setVideoUrl] = useState(campaign.video_url || '');
  const [isEditingVideo, setIsEditingVideo] = useState(false);

  const fundingPercentage = (campaign.current_funds / campaign.goal_amount) * 100;
  const daysRemaining = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  const handleSaveVideo = () => {
    // TODO: API call to save video URL
    console.log('Saving video URL:', videoUrl);
    setIsEditingVideo(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'video', label: 'Campaign Video', icon: Video },
    { id: 'analytics', label: 'Analytics', icon: Target },
    { id: 'backers', label: 'Backers', icon: Users }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <h2 className="text-3xl font-bold text-white mb-2 pr-12">{campaign.title}</h2>
            <div className="flex items-center space-x-4 text-white/80 text-sm">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {daysRemaining} days left
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {campaign.total_backers || 0} backers
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                campaign.status === 'active' 
                  ? 'bg-green-500/20 text-green-300' 
                  : campaign.status === 'successful'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {campaign.status}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800/50 border-b border-white/10">
            <div className="flex space-x-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Funding Progress */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Funding Progress</h3>
                    <span className="text-2xl font-bold text-primary-400">
                      {Math.round(fundingPercentage)}%
                    </span>
                  </div>
                  
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Raised</div>
                      <div className="text-2xl font-bold text-white">
                        ${campaign.current_funds?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Goal</div>
                      <div className="text-2xl font-bold text-white">
                        ${campaign.goal_amount?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Remaining</div>
                      <div className="text-2xl font-bold text-white">
                        ${(campaign.goal_amount - (campaign.current_funds || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Campaign Description</h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {campaign.description}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Total Backers</div>
                        <div className="text-2xl font-bold text-white">{campaign.total_backers || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Avg. Pledge</div>
                        <div className="text-2xl font-bold text-white">
                          ${campaign.total_backers > 0 
                            ? Math.round((campaign.current_funds || 0) / campaign.total_backers)
                            : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Edit Campaign</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Campaign</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Campaign Video</h3>
                    <button
                      onClick={() => setIsEditingVideo(!isEditingVideo)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      {isEditingVideo ? 'Cancel' : 'Edit Video'}
                    </button>
                  </div>

                  {isEditingVideo ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Video URL (YouTube, Vimeo, or direct link)
                        </label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-3 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <button
                        onClick={handleSaveVideo}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
                      >
                        Save Video URL
                      </button>
                    </div>
                  ) : videoUrl ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={videoUrl.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : videoUrl.includes('vimeo.com') ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${videoUrl.split('/').pop()}`}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                      <Video className="w-16 h-16 text-gray-500 mb-4" />
                      <p className="text-gray-400 mb-4">No video added yet</p>
                      <button
                        onClick={() => setIsEditingVideo(true)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                      >
                        Add Campaign Video
                      </button>
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Play className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-blue-300 font-medium mb-1">Pro Tip</div>
                        <div className="text-gray-300 text-sm">
                          Campaigns with videos raise 105% more funds on average. Add a compelling video to showcase your project!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Campaign Analytics</h3>
                  <div className="text-gray-400 text-center py-12">
                    Analytics dashboard coming soon...
                  </div>
                </div>
              </div>
            )}

            {/* Backers Tab */}
            {activeTab === 'backers' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Campaign Backers</h3>
                  <div className="text-gray-400 text-center py-12">
                    Backers list coming soon...
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CampaignDetailModal;
