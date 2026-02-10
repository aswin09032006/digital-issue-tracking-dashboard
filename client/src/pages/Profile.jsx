import { Key, Mail, PenSquare, Save, Shield, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const notify = useNotification();
    
    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || ''); // Email is usually immutable or requires special flow
    const [password, setPassword] = useState('');
    
    // Stats State
    const [myIssuesCount, setMyIssuesCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/issues/my');
                setMyIssuesCount(data.length);
            } catch (error) {
                console.error("Failed to fetch stats");
            }
        };
        fetchStats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({ name, password });
            notify.success("Profile updated successfully");
            setIsEditing(false);
            setPassword('');
        } catch (error) {
            notify.error("Failed to update profile");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header / Banner */}
            <div className="bg-corporate-sidebar border border-corporate-border p-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-corporate-text text-corporate-bg flex items-center justify-center text-4xl font-light uppercase tracking-tighter">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-medium text-corporate-text tracking-tight uppercase">{user?.name}</h1>
                        <div className="flex items-center space-x-2 mt-2 text-corporate-muted">
                            <Mail size={16} />
                            <span className="text-sm font-mono">{user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-corporate-accent">
                            <Shield size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">{user?.role} Role</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 text-sm uppercase tracking-widest font-medium text-corporate-text border border-corporate-text px-4 py-2 hover:bg-corporate-text hover:text-corporate-bg transition-all"
                >
                    {isEditing ? <X size={16} /> : <PenSquare size={16} />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-corporate-bg border border-corporate-border p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-corporate-muted text-xs uppercase tracking-widest font-medium mb-2">Issues Reported</h3>
                    <div className="text-4xl font-light text-corporate-text">{myIssuesCount}</div>
                </div>
                {/* Placeholder for future stats */}
                <div className="bg-corporate-bg border border-corporate-border p-6 shadow-sm opacity-50">
                    <h3 className="text-corporate-muted text-xs uppercase tracking-widest font-medium mb-2">Completion Rate</h3>
                    <div className="text-4xl font-light text-corporate-text">--</div>
                    <div className="text-xs mt-2 text-corporate-muted">Coming Soon</div>
                </div>
                <div className="bg-corporate-bg border border-corporate-border p-6 shadow-sm opacity-50">
                    <h3 className="text-corporate-muted text-xs uppercase tracking-widest font-medium mb-2">Team Rank</h3>
                    <div className="text-4xl font-light text-corporate-text">--</div>
                    <div className="text-xs mt-2 text-corporate-muted">Coming Soon</div>
                </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div className="bg-corporate-bg border border-corporate-border p-8 shadow-md">
                    <h3 className="text-lg font-medium uppercase tracking-tight text-corporate-text mb-6 pb-2 border-b border-corporate-border">Update Details</h3>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-corporate-muted" size={18} />
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 p-3 border border-corporate-border bg-corporate-bg text-corporate-text focus:border-corporate-text focus:ring-0 outline-none transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">New Password (Optional)</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-corporate-muted" size={18} />
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 p-3 border border-corporate-border bg-corporate-bg text-corporate-text focus:border-corporate-text focus:ring-0 outline-none transition-colors"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                className="flex items-center space-x-2 bg-corporate-text text-corporate-bg px-8 py-3 font-medium uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                <Save size={18} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
