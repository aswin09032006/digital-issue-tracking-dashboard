import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/auth/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/auth/users/${id}`);
                fetchUsers();
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await axios.post('/auth/users', formData);
            } else {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password; // Don't send empty password
                await axios.put(`/auth/users/${editingUser._id}`, updateData);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    if (loading) return <div className="p-8 text-sm text-corporate-muted">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-corporate-border pb-4">
                <h2 className="text-2xl font-medium text-corporate-text tracking-tight">User Management</h2>
                <button 
                    onClick={openCreateModal}
                    className="bg-corporate-text text-corporate-bg px-4 py-2 text-sm font-medium uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                    Add User
                </button>
            </div>
            
            {/* User Table */}
            <div className="border border-corporate-border bg-corporate-bg shadow-sm overflow-x-auto transition-colors duration-200">
                <table className="min-w-full divide-y divide-corporate-border">
                    <thead className="bg-corporate-sidebar">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-corporate-muted uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-corporate-bg divide-y divide-corporate-border">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-corporate-sidebar transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-corporate-text text-corporate-bg flex items-center justify-center font-medium text-xs mr-3">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-medium text-corporate-text">{u.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-corporate-muted font-mono">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs font-medium uppercase tracking-wider border ${
                                        u.role === 'admin' 
                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                        : u.role === 'technician'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-corporate-sidebar text-corporate-text border-corporate-border'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {u._id !== currentUser._id && (
                                        <div className="flex items-center justify-end space-x-3">
                                            <button 
                                                onClick={() => openEditModal(u)}
                                                className="text-corporate-text hover:text-corporate-accent text-xs uppercase font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(u._id)}
                                                className="text-red-600 hover:text-red-900 text-xs uppercase font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-corporate-bg w-full max-w-md border border-corporate-border shadow-xl">
                        <div className="flex justify-between items-center p-6 border-b border-corporate-border bg-corporate-sidebar">
                            <h3 className="text-lg font-medium text-corporate-text uppercase tracking-tight">
                                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-corporate-muted hover:text-corporate-text">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Name</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-corporate-border bg-corporate-bg text-corporate-text text-sm focus:border-corporate-text outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Email</label>
                                <input 
                                    type="email" 
                                    className="w-full p-2 border border-corporate-border bg-corporate-bg text-corporate-text text-sm focus:border-corporate-text outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">
                                    Password {modalMode === 'edit' && <span className="text-xs normal-case opacity-50">(Leave blank to keep current)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    className="w-full p-2 border border-corporate-border bg-corporate-bg text-corporate-text text-sm focus:border-corporate-text outline-none"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required={modalMode === 'create'}
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Role</label>
                                <select 
                                    className="w-full p-2 border border-corporate-border bg-corporate-bg text-corporate-text text-sm focus:border-corporate-text outline-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="user">User</option>
                                    <option value="technician">Technician</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-corporate-border text-corporate-text text-xs font-medium uppercase tracking-widest hover:bg-corporate-sidebar"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-corporate-text text-corporate-bg text-xs font-medium uppercase tracking-widest hover:opacity-90"
                                >
                                    {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
