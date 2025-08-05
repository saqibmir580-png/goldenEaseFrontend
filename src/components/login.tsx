import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, CheckCircle, XCircle, Pencil, User, Search, X, Plus } from "lucide-react";
import Sidebar from "./layout/sidebar";

const API_BASE_URL = 'http://localhost:8000';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  image?: string;
  is_verified: boolean;
  role: string;
  created_at?: string;
}

const Input = ({ type = "text", name, value, onChange, placeholder, className = "" }: any) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm ${className}`}
  />
);

const Button = ({ onClick, children, className = "" }: any) => (
  <button onClick={onClick} className={`rounded-lg transition-all duration-200 ${className}`}>
    {children}
  </button>
);

const LoginPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    phone_number: "", 
    password: "",
    role: "user"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('auth_token');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    try {
      const token = getAuthToken();
      if (!newUser.name || !newUser.email || !newUser.password) {
        setError('Please fill in all required fields');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          contact_number: newUser.phone_number,
          role: newUser.role
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add user');
      }
      const userData = await response.json();
      setUsers([...users, userData.user]);
      setNewUser({ name: "", email: "", phone_number: "", password: "", role: "user" });
      setShowForm(false);
      setError("");
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    }
  };

  const toggleVerification = async (userId: number) => {
    try {
      const token = getAuthToken();
      const user = users.find(u => u.id === userId);
      if (!user) return;
      const response = await fetch(`${API_BASE_URL}/users/${userId}/verification-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_verified: !user.is_verified }),
      });
      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }
      setUsers(users.map(u => u.id === userId ? { ...u, is_verified: !u.is_verified } : u));
    } catch (err) {
      console.error('Error updating verification:', err);
      setError('Failed to update verification status');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) =>
    setter((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));

  const startEdit = (user: User) => {
    setEditUserId(user.id);
    setEditUser({ ...user });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editUser.full_name,
          email: editUser.email,
          contact_number: editUser.phone_number,
          role: editUser.role
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === editUser.id ? updatedUser : u));
      setEditUserId(null);
      setEditUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone_number && user.phone_number.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Officers Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and monitor officer accounts</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-teal-600 text-white hover:bg-teal-700 shadow-sm text-sm font-medium"
            >
              + Add Officer
            </Button>
          </div>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError("")}
              className="float-right text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-8 py-4 bg-white border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search officers by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center border-2 border-gray-200">
                          <User className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="ml-4">
                          {editUserId === user.id ? (
                            <Input 
                              name="full_name"
                              value={editUser?.full_name || ""} 
                              onChange={(e: any) => handleChange(e, setEditUser)} 
                              className="max-w-xs"
                            />
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
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
                            name="phone_number" 
                            value={editUser?.phone_number || ""} 
                            onChange={(e: any) => handleChange(e, setEditUser)}
                            className="max-w-xs" 
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone_number || 'No phone'}</p>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleVerification(user.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${user.is_verified 
                            ? "bg-teal-100 text-teal-700 hover:bg-teal-200" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {user.is_verified ? (
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
                          onClick={() => navigate(`/${user.id}`)} 
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 border border-gray-200"
                        >
                          View Details
                        </Button>
                        <Button 
                          onClick={() => (editUserId === user.id ? saveEdit() : startEdit(user))} 
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          onClick={() => setUsers(users.filter((u) => u.id !== user.id))} 
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
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

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
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
                name="name" 
                value={newUser.name} 
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
                name="phone_number" 
                value={newUser.phone_number} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Phone Number" 
              />
              <Input 
                type="password" 
                name="password" 
                value={newUser.password} 
                onChange={(e: any) => handleChange(e, setNewUser)} 
                placeholder="Password" 
              />
              <select
                name="role"
                value={newUser.role}
                onChange={(e: any) => setNewUser(prev => ({...prev, role: e.target.value}))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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
                className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 text-sm font-medium"
              >
                Add Officer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;









