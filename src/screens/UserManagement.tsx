import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, CheckCircle, XCircle, Pencil, User, Search, X, MoreVertical, Info ,Eye,Edit,Delete } from "lucide-react";
import { initialUsers } from "../data.ts";
import Marquee from "../components/Marquee.tsx";

interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  image: string;
  isVerified: boolean;
  status?: string; 
  dob: String;
  address: String;
  gender: String;
  role: String;
}

const Input = ({ type = "text", name, value, onChange, placeholder, className = "" }: any) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${className}`}
  />
);

const Button = ({ onClick, children, className = "" }: any) => (
  <button onClick={onClick} className={`rounded-lg transition-all duration-200 ${className}`}>
    {children}
  </button>
);

const OfficerManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", phoneNumber: "", image: "", isVerified: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<User | null>(null);
  const [verificationStep, setVerificationStep] = useState<string>('idle'); // idle, processing, completed, failed
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<any>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) =>
    setter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setNewUser((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const toggleVerification = (id: number) =>
    setUsers(users.map((user) => (user.id === id ? { ...user, isVerified: !user.isVerified } : user)));

  const startEdit = (user: User) => {
    setEditUserId(user.id);
    setEditUser({ ...user });
    setActionMenuOpen(null);
  };

  const saveEdit = () => {
    if (editUser) {
      setUsers(users.map((user) => (user.id === editUser.id ? editUser : user)));
      setEditUserId(null);
      setEditUser(null);
    }
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    setActionMenuOpen(null);
  };

  const viewDetails = (id: number) => {
    navigate(`/${id}`);
    setActionMenuOpen(null);
  };

  const toggleActionMenu = (id: number) => {
    setActionMenuOpen(actionMenuOpen === id ? null : id);
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

  const addUser = () => {
    const newUserId = users.length + 1;
    const newUserObject = { ...newUser, id: newUserId };
    setUsers([...users, newUserObject]);
    setShowForm(false);
    setNewUser({ fullName: "", email: "", phoneNumber: "", image: "", isVerified: false });
  };

  const verifyUser = (id: number) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, isVerified: true } : user)));
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/public/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthenticated. Please login again.');
          navigate('/');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      // Map backend data to frontend format
      const mappedUsers = data.map((user: any) => ({
        ...user,
        fullName: user.name || user.fullName,
        phoneNumber: user.contact_number || user.phoneNumber,
        status: user.status || 'Pending' // Default to Pending
      }));
      setUsers(mappedUsers);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      // Fallback to initial users if API fails
      setUsers(initialUsers.map(user => ({ ...user, status: 'Pending' })));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    setVerificationStep('processing');
    try {
      console.log('DEBUG: Fetching user details for ID:', userId);

      const response = await fetch(`http://localhost:8000/public/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('DEBUG: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('DEBUG: User data received:', data);
      // The backend returns all user data including document statuses directly on the user object
      setDocumentStatus(data || {}); 
      setVerificationStep('completed');
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
      setVerificationStep('failed');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showDetailsModal) {
      setDocumentStatus({}); // Reset previous status
      fetchUserDetails(showDetailsModal.id);
    }
  }, [showDetailsModal]);

  const closeDetailsModal = () => {
    setShowDetailsModal(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py- sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Officers Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor officer accounts</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm text-sm font-medium self-start sm:self-auto"
            >
              + Add Officer
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search officers by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Users Table - Desktop Version (Hidden on small screens) */}
        <div className="hidden md:block flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Officer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={user.image} 
                            alt={user.fullName} 
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200" 
                          />
                          <div className="ml-4">
                            {editUserId === user.id ? (
                              <Input 
                                name="fullName" 
                                value={editUser?.fullName || ""} 
                                onChange={(e: any) => handleChange(e, setEditUser)} 
                                className="max-w-xs"
                              />
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                                <p className="text-xs text-gray-500">ID: #{user.id}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editUserId === user.id ? (
                          <div className="space-y-2">
                            <Input 
                              type="email" 
                              name="email" 
                              value={editUser?.email || ""} 
                              onChange={(e: any) => handleChange(e, setEditUser)}
                              className="max-w-xs" 
                            />
                            <Input 
                              name="phoneNumber" 
                              value={editUser?.phoneNumber || ""} 
                              onChange={(e: any) => handleChange(e, setEditUser)}
                              className="max-w-xs" 
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleVerification(user.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors
                            ${user.isVerified 
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                              : user.status === 'Pending' 
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                                : user.status === 'Approved' 
                                  ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                  : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Verified
                            </>
                          ) : user.status === 'Pending' ? (
                            <>
                              <XCircle size={14} className="mr-1" />
                              Pending
                            </>
                          ) : user.status === 'Approved' ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="mr-1" />
                              Rejected
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            onClick={() => viewDetails(user.id)} 
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 border border-gray-200"
                          >
                            View Details
                          </Button>
                          <Button 
                            onClick={() => (editUserId === user.id ? saveEdit() : startEdit(user))} 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            onClick={() => deleteUser(user.id)} 
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Cards - Mobile Version (Shown only on small screens) */}
        <div className="md:hidden flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No officers found matching your search.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {editUserId === user.id ? (
                    // Edit mode
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <img 
                            src={user.image} 
                            alt={user.fullName} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                          />
                          <div className="ml-3 flex-1">
                            <Input 
                              name="fullName" 
                              value={editUser?.fullName || ""} 
                              onChange={(e: any) => handleChange(e, setEditUser)} 
                              className="max-w-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                          <Input 
                            type="email" 
                            name="email" 
                            value={editUser?.email || ""} 
                            onChange={(e: any) => handleChange(e, setEditUser)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                          <Input 
                            name="phoneNumber" 
                            value={editUser?.phoneNumber || ""} 
                            onChange={(e: any) => handleChange(e, setEditUser)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          onClick={() => setEditUserId(null)} 
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 border border-gray-200"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={saveEdit} 
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <img 
                              src={user.image} 
                              alt={user.fullName} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                            />
                            <div className="ml-3">
                              <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500">ID: #{user.id}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <button 
                              onClick={() => toggleActionMenu(user.id)} 
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical size={18} className="text-gray-500" />
                            </button>
                            
                            {actionMenuOpen === user.id && (
                              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button 
                                  onClick={() => viewDetails(user.id)} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  <Info size={16} className="mr-2" /> View Details
                                </button>
                                <button 
                                  onClick={() => startEdit(user)} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  <Pencil size={16} className="mr-2" /> Edit
                                </button>
                                <button 
                                  onClick={() => deleteUser(user.id)} 
                                  className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} className="mr-2" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm text-gray-800">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm text-gray-800">{user.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <button
                          onClick={() => toggleVerification(user.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors
                            ${user.isVerified 
                              ? "bg-blue-100 text-blue-700" 
                              : user.status === 'Pending' 
                                ? "bg-yellow-100 text-yellow-700" 
                                : user.status === 'Approved' 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"}`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Verified
                            </>
                          ) : user.status === 'Pending' ? (
                            <>
                              <XCircle size={14} className="mr-1" />
                              Pending
                            </>
                          ) : user.status === 'Approved' ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="mr-1" />
                              Rejected
                            </>
                          )}
                        </button>
                        
                        <Button 
                          onClick={() => viewDetails(user.id)} 
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 border border-gray-200"
                        >
                          View Details
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Add New Officer</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <Input 
                name="fullName" 
                value={newUser.fullName} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Full Name" 
              />
              <Input 
                type="email" 
                name="email" 
                value={newUser.email} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Email Address" 
              />
              <Input 
                name="phoneNumber" 
                value={newUser.phoneNumber} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Phone Number" 
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imageFile && (
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full mt-4 object-cover border-2 border-blue-200" 
                  />
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end rounded-b-xl">
              <Button 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </Button>
              <Button 
                onClick={addUser} 
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
              >
                Add Officer
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Document Verification Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-blue-600">Document Verification Center</h1>
              </div>
              <button
                onClick={closeDetailsModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Verification Overview */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Overview</h2>
                <p className="text-sm text-gray-600">All listed documents are required for visa processing. Please ensure all documents are valid.</p>
              </div>

              {/* User Details Section */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.fullName || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">E-mail ID</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.email || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Address</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.address || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Role</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.role || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.dob || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Contact Number</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.phoneNumber || 'N/A'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-sm text-gray-900">{showDetailsModal.gender || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Status Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Status Summary</h3>
                {verificationStep === 'processing' ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-gray-600">Loading document status...</p>
                  </div>
                ) : verificationStep === 'failed' ? (
                  <div className="text-center py-10 text-red-600">
                    <p>Failed to load document details. Please try again.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {[
                        { name: 'Passport', key: 'passport_status' },
                        { name: 'Marriage Certificate', key: 'marriage_certificate_status' },
                        { name: 'Emirates ID', key: 'emirates_id_status' },
                        { name: 'Property Ownership', key: 'property_document_status' }
                      ].map((doc) => {
                        const status = documentStatus?.[doc.key] || 'pending';
                        const isApproved = status === 'approved' || status === 'Approved';
                        const isRejected = status === 'rejected' || status === 'Rejected';

                        return (
                          <div key={doc.key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                            <div className="flex items-center space-x-3">
                              {isApproved ? (
                                <CheckCircle2 size={16} className="text-green-500" />
                              ) : isRejected ? (
                                <XCircle size={16} className="text-red-500" />
                              ) : (
                                <X size={16} className="text-gray-400" />
                              )}
                              <span className="text-sm font-medium text-gray-700">{doc.name}</span>
                            </div>
                            <span className={`text-sm font-medium ${
                              isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Required for Visa'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        {documentStatus && (
                          documentStatus.passport_status === 'approved' &&
                          documentStatus.marriage_certificate_status === 'approved' &&
                          documentStatus.emirates_id_status === 'approved' &&
                          documentStatus.property_document_status === 'approved'
                        )
                          ? 'All documents have been successfully verified.'
                          : 'Some documents require verification. Please review the statuses above.'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  onClick={() => {
                    setVerificationStep('processing');
                    // Start verification process
                  }}
                >
                  📋 Verification Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">{error}</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerManagement;