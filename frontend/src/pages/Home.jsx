import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCampaigns } from '../store/campaignSlice';
import CampaignCard from '../components/CampaignCard';
import { Search, TrendingUp, Clock, CheckCircle } from 'lucide-react';

function Home() {
  const dispatch = useDispatch();
  const { campaigns, loading } = useSelector((state) => state.campaigns);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && campaign.status === 'active';
    if (filter === 'successful') return matchesSearch && campaign.status === 'successful';
    if (filter === 'trending') return matchesSearch && campaign.progress_percentage > 50;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20" data-aos="fade-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Bring Creative Projects to Life
            </h1>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Discover and support innovative campaigns. Help creators reach their goals and make dreams come true.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </Link>
              <Link to="/create-campaign" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                Start a Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-aos="fade-up">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {campaigns.length}
              </div>
              <div className="text-gray-600">Total Campaigns</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {campaigns.filter(c => c.status === 'successful').length}
              </div>
              <div className="text-gray-600">Successful Projects</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${campaigns.reduce((sum, c) => sum + (c.total_pledged || 0), 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Funded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8" data-aos="fade-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Active</span>
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'trending'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => setFilter('successful')}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'successful'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Successful</span>
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No campaigns found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
