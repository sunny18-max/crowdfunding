import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Users, TrendingUp, DollarSign, Shield, Search, Filter, User, UserCheck, UserX,
  CheckCircle, XCircle, Edit, Trash2, Eye, MoreVertical, ChevronDown, X
} from 'lucide-react';

function AdminManagement() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  // Available roles for filtering
  const roles = [
    { id: 'admin', label: 'Admins', icon: Shield },
    { id: 'investor', label: 'Investors', icon: UserCheck },
    { id: 'entrepreneur', label: 'Entrepreneurs', icon: User },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      console.log('Fetching admin data...');
      
      // Handle base URL configuration
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      // Remove /api if it's at the end
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
      }
      
      console.log('Base URL:', baseUrl);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      try {
        // Fetch all users
        const usersRes = await axios.get(`${baseUrl}/api/admin/users`, { headers });
        console.log('Users response:', usersRes.data);
        // Handle different response formats
        const usersData = Array.isArray(usersRes.data) 
          ? usersRes.data 
          : (usersRes.data?.users || []);
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      }

      try {
        // Try multiple endpoints to fetch campaigns
        let campaignsRes;
        let campaignsData = [];
        
        // Try without /api prefix first (in case baseUrl already has it)
        try {
          campaignsRes = await axios.get(`${baseUrl}/campaigns`, { headers });
          console.log('Campaigns response (direct):', campaignsRes.data);
          campaignsData = Array.isArray(campaignsRes.data) 
            ? campaignsRes.data 
            : (campaignsRes.data?.campaigns || campaignsRes.data?.data || []);
        } catch (err1) {
          console.log('Trying alternative campaigns endpoint...');
          // Try with /api prefix
          try {
            campaignsRes = await axios.get(`${baseUrl}/api/campaigns`, { headers });
            console.log('Campaigns response (with /api):', campaignsRes.data);
            campaignsData = Array.isArray(campaignsRes.data) 
              ? campaignsRes.data 
              : (campaignsRes.data?.campaigns || campaignsRes.data?.data || []);
          } catch (err2) {
            console.error('All campaigns endpoints failed:', { err1, err2 });
          }
        }
        
        console.log('Processed campaigns data:', campaignsData);
        setCampaigns(campaignsData);
      } catch (err) {
        console.error('Error in campaigns fetch:', err);
        setCampaigns([]);
      }

      try {
        // Try multiple endpoints to fetch pledges
        let pledgesRes;
        let pledgesData = [];
        
        // Try without /api prefix first
        try {
          pledgesRes = await axios.get(`${baseUrl}/admin/pledges`, { headers });
          console.log('Pledges response (direct):', pledgesRes.data);
          pledgesData = Array.isArray(pledgesRes.data) 
            ? pledgesRes.data 
            : (pledgesRes.data?.pledges || pledgesRes.data?.data || []);
        } catch (err1) {
          console.log('Trying alternative pledges endpoint...');
          // Try with /api prefix
          try {
            pledgesRes = await axios.get(`${baseUrl}/api/admin/pledges`, { headers });
            console.log('Pledges response (with /api):', pledgesRes.data);
            pledgesData = Array.isArray(pledgesRes.data) 
              ? pledgesRes.data 
              : (pledgesRes.data?.pledges || pledgesRes.data?.data || []);
          } catch (err2) {
            console.error('All pledges endpoints failed:', { err1, err2 });
          }
        }
        
        console.log('Processed pledges data:', pledgesData);
        setPledges(pledgesData);
      } catch (err) {
        console.error('Error in pledges fetch:', err);
        setPledges([]);
      }

    } catch (error) {
      console.error('Error in fetchAllData:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'campaigns', label: 'Campaigns', icon: TrendingUp, count: campaigns.length },
    { id: 'pledges', label: 'Pledges', icon: DollarSign, count: pledges.length },
  ];

  // Filter users based on search term and selected roles
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRoles.length === 0 || 
        selectedRoles.includes(user.role);
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRoles]);

  // Toggle role filter
  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  // View item details
  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  // Edit item
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({...item});
    setIsEditModalOpen(true);
  };

  // Delete item
  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      let url = '';
      if (activeTab === 'users') {
        url = `${baseUrl}/api/admin/users/${selectedItem.id}`;
      } else if (activeTab === 'campaigns') {
        url = `${baseUrl}/api/campaigns/${selectedItem.id}`;
      } else if (activeTab === 'pledges') {
        url = `${baseUrl}/api/pledges/${selectedItem.id}`;
      }
      
      await axios.delete(url, { headers });
      
      // Refresh data
      fetchAllData();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      
      // Show success message
      alert(`${activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1).slice(0, -1)} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  // Save edited item
  const saveChanges = async () => {
    if (!selectedItem) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      let url = '';
      if (activeTab === 'users') {
        url = `${baseUrl}/api/admin/users/${selectedItem.id}`;
      } else if (activeTab === 'campaigns') {
        url = `${baseUrl}/api/campaigns/${selectedItem.id}`;
      } else if (activeTab === 'pledges') {
        url = `${baseUrl}/api/pledges/${selectedItem.id}`;
      }
      
      await axios.put(url, formData, { headers });
      
      // Refresh data
      await fetchAllData();
      setIsEditModalOpen(false);
      setSelectedItem(null);
      
      // Show success message
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  // Render modals
  const renderModals = () => {
    if (!selectedItem) return null;
    
    return (
      <>
        {/* View Modal */}
        {isViewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {activeTab === 'users' ? 'User Details' : 
                     activeTab === 'campaigns' ? 'Campaign Details' : 'Pledge Details'}
                  </h2>
                  <button 
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(selectedItem).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-700 pb-2">
                      <div className="text-gray-400 text-sm capitalize">{key.replace(/_/g, ' ')}</div>
                      <div className="text-white mt-1">
                        {value === null || value === undefined ? 'N/A' : 
                         typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Edit {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1).slice(0, -1)}
                  </h2>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value || ''}
                        onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md">
              <div className="p-6">
                <div className="text-center">
                  <Trash2 className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-2 text-lg font-medium text-white">
                    Delete {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(1).slice(0, -1)}?
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Are you sure you want to delete this {activeTab.slice(0, -1)}? This action cannot be undone.
                  </p>
                  
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Clear all role filters
  const clearRoleFilters = () => {
    setSelectedRoles([]);
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Data Management</h1>
              <p className="text-gray-300">View and manage all platform data</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-6 border border-white/20">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all flex-1 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
          <div className="flex flex-col space-y-4">
            {/* Search Input */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              {/* Role Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoleFilter(!showRoleFilter);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm whitespace-nowrap"
                >
                  <Filter className="w-4 h-4 flex-shrink-0" />
                  <span>Filter by Role</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showRoleFilter ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* Role Filter Dropdown Menu */}
                {showRoleFilter && (
                  <div className="absolute right-0 mt-1 w-64 bg-gray-800 rounded-lg shadow-xl z-50 border border-white/10 overflow-hidden">
                    <div className="p-3 border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-white">Filter by Role</h3>
                        {selectedRoles.length > 0 && (
                          <button 
                            onClick={clearRoleFilters}
                            className="text-xs text-primary-400 hover:text-primary-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-2">
                      {roles.map(role => (
                        <label 
                          key={role.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                            className="rounded border-white/20 text-primary-500 focus:ring-primary-500"
                          />
                          <role.icon className={`w-4 h-4 ${
                            role.id === 'admin' ? 'text-orange-400' : 
                            role.id === 'investor' ? 'text-blue-400' : 'text-purple-400'
                          }`} />
                          <span className="text-sm">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Filters */}
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map(role => {
                  const roleInfo = roles.find(r => r.id === role);
                  return (
                    <span 
                      key={role}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white"
                    >
                      {roleInfo?.label}
                      <button 
                        onClick={() => toggleRole(role)}
                        className="ml-2 text-gray-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white">Loading...</div>
          ) : (
            <>
              {/* Users Table */}
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Wallet</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Joined</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.name}</div>
                                <div className="text-gray-400 text-sm">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-orange-500/20 text-orange-300' :
                              user.role === 'entrepreneur' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-semibold">
                            ${user.wallet_balance?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {user.is_verified ? (
                              <span className="flex items-center text-green-400">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-400">
                                <XCircle className="w-4 h-4 mr-1" />
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-1">
                              <button 
                                onClick={() => handleView(user)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEdit(user)}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(user)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Campaigns Table */}
              {activeTab === 'campaigns' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Campaign</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Creator</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Goal</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Raised</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Deadline</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{campaign.title}</div>
                            <div className="text-gray-400 text-sm line-clamp-1">{campaign.description}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {campaign.creator_name || `User #${campaign.creator_id}`}
                          </td>
                          <td className="px-6 py-4 text-white font-semibold">
                            ${campaign.goal_amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-green-400 font-semibold">
                              ${campaign.current_funds?.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {Math.round((campaign.current_funds / campaign.goal_amount) * 100)}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              campaign.status === 'active' ? 'bg-green-500/20 text-green-300' :
                              campaign.status === 'successful' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(campaign.deadline).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-1">
                              <button 
                                onClick={() => handleView(campaign)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEdit(campaign)}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Edit Campaign"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(campaign)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete Campaign"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pledges Table */}
              {activeTab === 'pledges' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Campaign</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pledges.map((pledge) => (
                        <tr key={pledge.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-gray-400">#{pledge.id}</td>
                          <td className="px-6 py-4 text-white">{pledge.user_name || `User #${pledge.user_id}`}</td>
                          <td className="px-6 py-4 text-gray-300">{pledge.campaign_title || `Campaign #${pledge.campaign_id}`}</td>
                          <td className="px-6 py-4 text-green-400 font-semibold">${pledge.amount?.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              pledge.status === 'committed' ? 'bg-green-500/20 text-green-300' :
                              pledge.status === 'refunded' ? 'bg-red-500/20 text-red-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {pledge.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(pledge.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Render Modals */}
      {renderModals()}
    </div>
  );
}

export default AdminManagement;
