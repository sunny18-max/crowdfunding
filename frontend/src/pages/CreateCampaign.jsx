import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createCampaign, uploadCampaignVideo } from '../store/campaignSlice';
import { FileText, DollarSign, Calendar, ArrowLeft, Rocket, Sparkles, Video, X, Upload, Youtube, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import ThreeBackground from '../components/ThreeBackground';
import { toast } from 'react-toastify';

function CreateCampaign() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_amount: '',
    deadline: '',
    video_url: '',
    related_videos: ['']
  });
  
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState('');
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.campaigns);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file size should be less than 50MB');
      return;
    }

    setUploading(true);
    try {
      // In a real app, you would upload to a storage service like S3
      // For now, we'll create a local URL for preview
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setFormData(prev => ({
        ...prev,
        video_file: file,
        video_url: videoUrl
      }));
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoPreview('');
    setFormData(prev => ({
      ...prev,
      video_file: null,
      video_url: ''
    }));
  };

  const addRelatedVideo = () => {
    setFormData(prev => ({
      ...prev,
      related_videos: [...prev.related_videos, '']
    }));
  };

  const removeRelatedVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      related_videos: prev.related_videos.filter((_, i) => i !== index)
    }));
  };

  const handleRelatedVideoChange = (index, value) => {
    const newRelatedVideos = [...formData.related_videos];
    newRelatedVideos[index] = value;
    setFormData(prev => ({
      ...prev,
      related_videos: newRelatedVideos.filter(url => url.trim() !== '')
    }));
  };

  const isYoutubeUrl = (url) => {
    return url.match(/(youtube\.com|youtu\.be)/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.video_url && !formData.related_videos.some(v => v.trim() !== '')) {
      toast.warning('Please add at least one video to increase trust from investors');
      return;
    }

    const campaignData = new FormData();
    campaignData.append('title', formData.title);
    campaignData.append('description', formData.description);
    campaignData.append('goal_amount', parseFloat(formData.goal_amount));
    campaignData.append('deadline', formData.deadline);
    
    if (formData.video_file) {
      campaignData.append('video', formData.video_file);
    }
    
    // Add related videos
    formData.related_videos
      .filter(url => url.trim() !== '')
      .forEach((url, index) => {
        campaignData.append('related_videos[]', url);
      });

    try {
      await dispatch(createCampaign(campaignData)).unwrap();
      toast.success('Campaign created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create campaign:', err);
      toast.error(err.message || 'Failed to create campaign');
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen relative py-8">
      <ThreeBackground />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Create a New Campaign
              </h1>
            </div>
          </div>
          <p className="text-gray-300 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-primary-400" />
            Share your project with the world and get the funding you need
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign Details */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="E.g., Eco-Friendly Water Bottles"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
                  Campaign Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell your story, explain your goals, and why people should support you..."
                  required
                />
              </div>

              {/* Main Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Main Campaign Video *
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  {!videoPreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <Video className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400 mb-1">
                        <span className="font-medium text-primary-500 hover:text-primary-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        MP4, WebM or MOV (max. 50MB)
                      </p>
                    </div>
                  ) : (
                    <div className="w-full relative">
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full h-64 rounded-lg object-cover"
                      />
                      <button
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  A compelling video can increase your chances of success by up to 50%
                </p>
              </div>

              {/* Related Videos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Related Videos (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addRelatedVideo}
                    className="text-xs text-primary-500 hover:text-primary-400 flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Video
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.related_videos.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Youtube className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleRelatedVideoChange(index, e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Paste YouTube or video URL"
                        />
                      </div>
                      {formData.related_videos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRelatedVideo(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove video"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Add YouTube links or video URLs to showcase more about your campaign
                </p>
              </div>
            </div>

            {/* Goal Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="5000"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Set a realistic funding goal for your project
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Choose when your campaign should end
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-300 mb-2">How it works:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
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
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Launch Campaign'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateCampaign;
