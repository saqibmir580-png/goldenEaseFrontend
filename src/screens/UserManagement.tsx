import React, { useState } from "react";
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
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ 
    fullName: "", 
    email: "", 
    phoneNumber: "", 
    image: "", 
    isVerified: false,
    dob: "",
    address: "",
    gender: "Male",
    role: "User"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [verificationResults, setVerificationResults] = useState<any>({});
  const [showDetailsModal, setShowDetailsModal] = useState<User | null>(null);
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

  const addUser = () => {
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    const userToAdd = {
      ...newUser,
      id: newId,
      isVerified: false // Default to pending status
    };
    setUsers([...users, userToAdd]);
    setNewUser({ 
      fullName: "", 
      email: "", 
      phoneNumber: "", 
      image: "", 
      isVerified: false,
      dob: "",
      address: "",
      gender: "Male",
      role: "User"
    });
    setImageFile(null);
    setShowForm(false);
  };

  const viewDetails = async (user: User) => {
    setShowDetailsModal(user);
    setActionMenuOpen(null);
    setVerificationStep('photo');
    setVerificationResults({});
    
    try {
      // Step 1: Photo Verification (Face Recognition)
      setVerificationStep('photo_processing');
      const token = localStorage.getItem('auth_token');
      
      // Simulate API call for photo verification
      setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:8000/admin/users/${user.id}/verify-documents`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const verificationData = await response.json();
            setVerificationResults(verificationData);
            setVerificationStep('completed');
            
            // Update user verification status
            setUsers(users.map(u => u.id === user.id ? { ...u, isVerified: true } : u));
          } else {
            setVerificationStep('error');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationStep('error');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error starting verification:', error);
      setVerificationStep('error');
    }
  };

  const toggleActionMenu = (id: number) => {
    setActionMenuOpen(actionMenuOpen === id ? null : id);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(null);
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

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
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="mr-1" />
                              Unverified
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            onClick={() => viewDetails(user)} 
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
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
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
                                  onClick={() => viewDetails(user)} 
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
                              : "bg-gray-100 text-gray-700"}`}
                        >
                          {user.isVerified ? (
                            <>
                              <CheckCircle size={14} className="mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="mr-1" />
                              Unverified
                            </>
                          )}
                        </button>
                        
                        <Button 
                          onClick={() => viewDetails(user)} 
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
              <Input 
                name="dob" 
                value={newUser.dob} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Date of Birth" 
              />
              <Input 
                name="address" 
                value={newUser.address} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Address" 
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={newUser.gender} 
                  onChange={(e: any) => handleChange(e, setNewUser)} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select 
                  name="role" 
                  value={newUser.role} 
                  onChange={(e: any) => handleChange(e, setNewUser)} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
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
      
      {/* Details Modal with Verification */}
      {showDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Officer Details & Verification</h2>
              <button
                onClick={closeDetailsModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Officer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={showDetailsModal.image} 
                        alt={showDetailsModal.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <h4 className="font-medium text-lg">{showDetailsModal.fullName}</h4>
                        <p className="text-sm text-gray-600">ID: #{showDetailsModal.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{showDetailsModal.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{showDetailsModal.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                        <p className="text-sm text-gray-900">{showDetailsModal.dob}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Address</p>
                        <p className="text-sm text-gray-900">{showDetailsModal.address}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Gender</p>
                        <p className="text-sm text-gray-900">{showDetailsModal.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Role</p>
                        <p className="text-sm text-gray-900">{showDetailsModal.role}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Verification Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          showDetailsModal.isVerified 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {showDetailsModal.isVerified ? '✅ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Process */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Verification Process</h3>
                  <div className="space-y-3">
                    <div className={`rounded-lg p-4 ${
                      verificationStep === 'photo_processing' ? 'bg-blue-50' : 
                      verificationStep === 'completed' ? 'bg-green-50' : 
                      verificationStep === 'error' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <h4 className="font-medium mb-2 flex items-center">
                        📸 Photo Verification
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          verificationStep === 'photo_processing' ? 'bg-blue-100 text-blue-700' :
                          verificationStep === 'completed' ? 'bg-green-100 text-green-700' :
                          verificationStep === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {verificationStep === 'photo_processing' ? 'Processing...' :
                           verificationStep === 'completed' ? 'Completed ✅' :
                           verificationStep === 'error' ? 'Failed ❌' :
                           'Pending'}
                        </span>
                      </h4>
                      <div className="mt-3">
                        <img 
                          src={showDetailsModal.image} 
                          alt="Verification Photo"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-blue-200"
                        />
                        <p className={`text-sm mt-2 ${
                          verificationStep === 'photo_processing' ? 'text-blue-600' :
                          verificationStep === 'completed' ? 'text-green-600' :
                          verificationStep === 'error' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {verificationStep === 'photo_processing' ? 'Analyzing facial features for verification...' :
                           verificationStep === 'completed' ? 'Face recognition completed successfully!' :
                           verificationStep === 'error' ? 'Verification failed. Please try again.' :
                           'Click View Details to start verification'}
                        </p>
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 ${
                      verificationStep === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <h4 className="font-medium mb-2 flex items-center">
                        📘 Document Verification
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          verificationStep === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {verificationStep === 'completed' ? 'Completed ✅' : 'Pending'}
                        </span>
                      </h4>
                      <p className={`text-sm ${
                        verificationStep === 'completed' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {verificationStep === 'completed' ? 
                          'Document verification completed successfully!' : 
                          'Waiting for photo verification to complete...'}
                      </p>
                    </div>

                    <div className={`rounded-lg p-4 ${
                      verificationStep === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <h4 className="font-medium mb-2 flex items-center">
                        🆔 ID Verification
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          verificationStep === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {verificationStep === 'completed' ? 'Completed ✅' : 'Pending'}
                        </span>
                      </h4>
                      <p className={`text-sm ${
                        verificationStep === 'completed' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {verificationStep === 'completed' ? 
                          'ID verification completed successfully!' : 
                          'Waiting for previous steps to complete...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default OfficerManagement;