import { useEffect, useState, useRef } from 'react';
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
  Heart,
  DollarSign,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  Play,
  Youtube,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

function CampaignDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCampaign: campaign, loading } = useSelector((state) => state.campaigns);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef(null);
  
  // Extract video ID from YouTube URL
  const getYoutubeId = (url) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
      return null;
    }
  };
  
  // Check if URL is a YouTube URL
  const isYoutubeUrl = (url) => {
    if (!url) return false;
    return url.match(/(youtube\.com|youtu\.be)/);
  };
  
  // Open video in modal
  const openVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setShowVideoModal(true);
  };
  
  // Close video modal
  const closeVideo = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  
  // Handle click outside video to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeVideo();
    }
  };

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
  
  // Extract videos from campaign
  const { video_url, related_videos = [] } = campaign;
  const hasMainVideo = !!video_url;
  const hasRelatedVideos = related_videos && related_videos.length > 0;

  const isCreator = user?.id === campaign.creator_id;
  const canPledge = isAuthenticated && !isCreator && campaign.status === 'active' && !campaign.is_expired;

  const getStatusBadge = () => {
    if (campaign.status === 'successful') {
      return (
        <motion.span 
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Funded Successfully</span>
        </motion.span>
      );
    } else if (campaign.status === 'failed') {
      return (
        <motion.span 
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <XCircle className="w-4 h-4" />
          <span>Funding Unsuccessful</span>
        </motion.span>
      );
    } else if (campaign.is_expired) {
      return (
        <motion.span 
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Clock className="w-4 h-4" />
          <span>Campaign Ended</span>
        </motion.span>
      );
    } else {
      return (
        <motion.span 
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <span>Active Campaign</span>
        </motion.span>
      );
    }
  };

  // Format campaign data
  const progressPercentage = Math.min(
    ((campaign.total_pledged || 0) / (campaign.goal_amount || 1)) * 100,
    100
  ).toFixed(1);

  const daysRemaining = Math.ceil(
    (new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Campaign not found</h2>
          <p className="text-gray-400 mb-4">The campaign you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Video Modal */}
        <AnimatePresence>
          {showVideoModal && selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={handleBackdropClick}
            >
              <button 
                onClick={closeVideo}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
                {isYoutubeUrl(selectedVideo) ? (
                  <div className="relative pt-[56.25%] h-0 overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Campaign video"
                    />
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={selectedVideo}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[80vh]"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Header */}
            <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Campaign Media */}
                  <div className="w-full md:w-1/3 lg:w-1/3">
                    <div className="relative group">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-700 rounded-xl overflow-hidden">
                        {campaign.image_url ? (
                          // If we have an image URL, show it with a play button overlay if there's a video
                          <>
                            <img 
                              src={campaign.image_url}
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to video thumbnail if image fails to load
                                if (hasMainVideo && video_url) {
                                  if (isYoutubeUrl(video_url)) {
                                    e.target.src = `https://img.youtube.com/vi/${getYoutubeId(video_url)}/hqdefault.jpg`;
                                  } else {
                                    e.target.src = 'https://via.placeholder.com/800x450/1f2937/9ca3af?text=Video+Available';
                                  }
                                } else {
                                  e.target.src = 'https://via.placeholder.com/800x450/1f2937/9ca3af?text=No+Image';
                                }
                              }}
                            />
                            {hasMainVideo && video_url && (
                              <div 
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => openVideo(video_url)}
                              >
                                <div className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
                                  <Play className="w-8 h-8 text-white" fill="currentColor" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : hasMainVideo && video_url ? (
                          // If no image but we have a video, show video thumbnail with play button
                          <>
                            {isYoutubeUrl(video_url) ? (
                              <img 
                                src={`https://img.youtube.com/vi/${getYoutubeId(video_url)}/hqdefault.jpg`}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                                onClick={() => openVideo(video_url)}
                              />
                            ) : (
                              <div className="relative w-full h-full">
                                <video 
                                  className="w-full h-full object-cover"
                                  onClick={() => openVideo(video_url)}
                                >
                                  <source src={video_url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                            <div 
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => openVideo(video_url)}
                            >
                              <div className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
                                <Play className="w-8 h-8 text-white" fill="currentColor" />
                              </div>
                            </div>
                          </>
                        ) : (
                          // If no image or video, show placeholder
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                              <span className="text-sm">No media available</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Related Media */}
                    {(hasRelatedVideos && related_videos && related_videos.length > 0) && (
                      <div className="mt-8">
                        <h3 className="text-base font-semibold text-gray-200 mb-4">Related Media</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {related_videos.filter(video => video && video.trim() !== '').map((video, index) => (
                            <div 
                              key={index}
                              className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                              onClick={() => openVideo(video)}
                            >
                              {isYoutubeUrl(video) ? (
                                <img 
                                  src={`https://img.youtube.com/vi/${getYoutubeId(video)}/mqdefault.jpg`}
                                  alt={`Related video ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/320x180/1f2937/9ca3af?text=Video+Preview';
                                  }}
                                />
                              ) : (
                                <video 
                                  src={video}
                                  className="w-full h-full object-cover"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-6 h-6 text-white" fill="currentColor" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-3">{campaign.title}</h1>
                    
                    {/* Creator and Date */}
                    <div className="flex items-center space-x-4 text-gray-300 mb-6">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">
                          by <span className="font-medium text-white">{campaign.creator_name}</span>
                        </span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">{format(new Date(campaign.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    {/* Campaign Status */}
                    <div className="mb-4">
                      {getStatusBadge()}
                    </div>
                    
                    {/* Campaign Description */}
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-white mb-4">About this project</h3>
                      <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                        {campaign.description.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backers List */}
            <motion.div 
              className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    Backers
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
                    {campaign.backers_count || 0} {campaign.backers_count === 1 ? 'backer' : 'backers'}
                  </span>
                </div>

                {campaign.backers && campaign.backers.length > 0 ? (
                  <div className="space-y-3">
                    {campaign.backers.slice(0, 5).map((backer, index) => (
                      <motion.div 
                        key={backer.id}
                        className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white line-clamp-1">
                              {backer.backer_name || 'Anonymous Backer'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(backer.timestamp), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            ${Number(backer.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          {backer.pledge_status && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              backer.pledge_status === 'completed' 
                                ? 'bg-green-900/30 text-green-400 border border-green-800' 
                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                            }`}>
                              {backer.pledge_status}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {campaign.backers_count > 5 && (
                      <button 
                        className="w-full mt-4 text-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center space-x-1"
                        onClick={() => {}}
                      >
                        <span>View all {campaign.backers_count} backers</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-2 text-sm font-medium text-white">No backers yet</h3>
                    <p className="mt-1 text-sm text-gray-400">Be the first to support this campaign!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              className="sticky top-8 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Funding Card */}
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-2xl font-bold text-white">
                        ${Number(campaign.total_pledged || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-gray-400">
                        {progressPercentage}% funded
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      raised of ${Number(campaign.goal_amount || 0).toLocaleString()} goal
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{campaign.backers_count || 0} backers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {daysRemaining < 0 
                            ? 'Ended' 
                            : daysRemaining === 0 
                              ? 'Ending today' 
                              : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Stats */}
                  <div className="space-y-4 py-6 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Target className="w-4 h-4" />
                        <span className="text-sm">Goal</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        ${Number(campaign.goal_amount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Daily Average</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        ${Math.round((campaign.total_pledged || 0) / Math.max(1, daysRemaining))} / day
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Deadline</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {format(new Date(campaign.deadline), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-700">
                    {canPledge ? (
                      <motion.button
                        onClick={() => setShowPledgeModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Heart className="w-5 h-5" />
                        <span>Back this project</span>
                      </motion.button>
                    ) : isCreator ? (
                      <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                        <p className="text-sm text-blue-300 font-medium">
                          This is your campaign
                        </p>
                      </div>
                    ) : !isAuthenticated ? (
                      <motion.button
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Login to Back This Project
                      </motion.button>
                    ) : (
                      <div className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-300 font-medium">
                          {campaign.status === 'successful' 
                            ? 'Campaign was successfully funded!'
                            : campaign.status === 'failed'
                            ? 'Campaign did not meet its goal'
                            : 'Campaign has ended'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Campaign Info */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="font-semibold text-white mb-3">All or Nothing</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      This project will only be funded if it reaches its goal by{' '}
                      <span className="text-white font-medium">
                        {format(new Date(campaign.deadline), 'MMMM d, yyyy')}
                      </span>. 
                      If not, all pledges will be automatically refunded.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pledge Modal */}
      <AnimatePresence>
        {showPledgeModal && (
          <PledgeModal
            campaign={campaign}
            onClose={() => setShowPledgeModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );

  // Handle pledge creation
  const handlePledge = async (pledgeData) => {
    try {
      // Check wallet balance first
      const walletResponse = await axios.get(`/api/wallet/me`);
      const walletBalance = walletResponse.data.balance || 0;
      
      if (walletBalance < pledgeData.amount) {
        throw new Error('Insufficient wallet balance. Please add funds to your wallet first.');
      }

      const response = await axios.post(`/api/pledges`, {
        campaign_id: id,
        amount: Number(pledgeData.amount),
        message: String(pledgeData.message || ''),
      });
      
      if (response.data.success) {
        toast.success('Pledge created successfully!');
        setShowPledgeModal(false);
        // Refresh campaign data
        dispatch(fetchCampaignById(id));
      }
    } catch (error) {
      console.error('Failed to create pledge:', error.response?.data?.message || error.message);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to create pledge. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      {/* ... rest of your JSX ... */}
      <AnimatePresence>
        {showPledgeModal && (
          <PledgeModal
            campaign={campaign}
            onClose={() => setShowPledgeModal(false)}
            onSubmit={handlePledge}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignDetails;
