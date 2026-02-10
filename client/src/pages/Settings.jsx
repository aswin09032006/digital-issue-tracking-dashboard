import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { theme, setTheme, compact, setCompact, realTime, setRealTime } = useTheme();
    const { user, updateProfile } = useAuth();
    
    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [notifications, setNotifications] = useState(user?.notifications ?? true);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const themes = [
        { id: 'light', name: 'Light (Corporate)', color: 'bg-white border-gray-200' },
        { id: 'dark', name: 'Dark', color: 'bg-gray-900 border-gray-700' },
        { id: 'midnight', name: 'Midnight', color: 'bg-slate-900 border-slate-700' },
    ];

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({ name, email, password, notifications });
            setMessage('Profile updated successfully');
            setPassword('');
            setIsEditing(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile');
        }
    };

    return (
        <div className="bg-corporate-bg p-8 border border-corporate-border shadow-sm transition-colors duration-200">
             <h2 className="text-2xl font-medium text-corporate-text mb-8 border-b border-corporate-border pb-4 tracking-tight uppercase">Settings</h2>
             
             {message && (
                 <div className={`p-4 mb-6 text-sm font-medium uppercase tracking-wide ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                     {message}
                 </div>
             )}

             <div className="space-y-12">
                 {/* Theme Settings */}
                 <div>
                    <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-4">Appearance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`p-4 border text-left transition-all ${
                                    theme === t.id 
                                    ? 'border-corporate-accent ring-1 ring-corporate-accent bg-corporate-sidebar' 
                                    : 'border-corporate-border hover:border-corporate-text bg-corporate-bg text-corporate-muted hover:text-corporate-text'
                                }`}
                            >
                                <div className={`w-full h-24 mb-3 border border-corporate-border ${t.color}`}></div>
                                <span className="font-medium text-corporate-text text-sm block">{t.name}</span>
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Profile Settings */}
                 <div className="pt-8 border-t border-corporate-border">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted">Account Profile</h3>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-xs font-medium uppercase tracking-widest text-corporate-accent hover:underline"
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                     </div>

                     <div className="border border-corporate-border bg-corporate-sidebar p-8 transition-colors">
                         {isEditing ? (
                             <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                 <div>
                                     <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Full Name</label>
                                     <input 
                                         type="text" 
                                         value={name} 
                                         onChange={(e) => setName(e.target.value)}
                                         className="w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 bg-corporate-bg text-corporate-text"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Email Address</label>
                                     <input 
                                         type="email" 
                                         value={email} 
                                         onChange={(e) => setEmail(e.target.value)}
                                         className="w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 bg-corporate-bg text-corporate-text"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">New Password (Optional)</label>
                                     <input 
                                         type="password" 
                                         value={password} 
                                         onChange={(e) => setPassword(e.target.value)}
                                         placeholder="Leave blank to keep current"
                                         className="w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 bg-corporate-bg text-corporate-text"
                                     />
                                 </div>
                                 <button type="submit" className="bg-corporate-text text-corporate-bg px-6 py-3 font-medium uppercase tracking-widest hover:opacity-90">
                                     Save Changes
                                 </button>
                             </form>
                         ) : (
                             <div className="space-y-4">
                                 <div className="flex items-center space-x-4">
                                     <div className="w-16 h-16 bg-corporate-text text-corporate-bg rounded-none flex items-center justify-center text-xl font-medium">
                                         {user?.name?.charAt(0).toUpperCase()}
                                     </div>
                                     <div>
                                         <h4 className="text-lg font-medium text-corporate-text">{user?.name}</h4>
                                         <p className="text-sm text-corporate-muted">{user?.email}</p>
                                         <p className="text-xs text-corporate-muted uppercase mt-1 tracking-wider">{user?.role} Role</p>
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>

                 {/* System Preferences */}
                 <div className="pt-8 border-t border-corporate-border">
                     <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-4">System Preferences</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Density Settings */}
                         <div className="p-6 border border-corporate-border bg-corporate-sidebar flex items-center justify-between">
                             <div>
                                <h3 className="font-medium text-corporate-text">Compact View</h3>
                                <p className="text-xs text-corporate-muted uppercase tracking-wider mt-1">Decrease spacing in lists</p>
                             </div>
                             <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="toggle" 
                                    id="toggle" 
                                    checked={compact}
                                    onChange={(e) => setCompact(e.target.checked)}
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-corporate-accent"
                                />
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                             </div>
                         </div>

                         {/* Real-Time Settings */}
                         <div className="p-6 border border-corporate-border bg-corporate-sidebar flex items-center justify-between">
                             <div>
                                <h3 className="font-medium text-corporate-text">Real-Time Updates</h3>
                                <p className="text-xs text-corporate-muted uppercase tracking-wider mt-1">Live issue tracking via WebSockets</p>
                             </div>
                             <div className="flex items-center space-x-2">
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input 
                                        type="checkbox" 
                                        name="rt-toggle" 
                                        id="rt-toggle" 
                                        checked={realTime}
                                        onChange={(e) => setRealTime(e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-corporate-accent"
                                    />
                                    <label htmlFor="rt-toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                                {realTime && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Notifications */}
                 <div className="pt-8 border-t border-corporate-border">
                     <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-4">Notifications</h3>
                     <div className="p-6 border border-corporate-border bg-corporate-sidebar flex items-center justify-between group">
                         <div>
                            <h3 className="font-medium text-corporate-text">Enable Notifications</h3>
                            <p className="text-xs text-corporate-muted uppercase tracking-wider mt-1">Receive updates on your issues</p>
                         </div>
                         <button 
                            type="button"
                            onClick={() => {
                                setNotifications(!notifications);
                                if (!isEditing) {
                                    updateProfile({ name, email, notifications: !notifications }).catch(() => setNotifications(notifications));
                                }
                            }}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${notifications ? 'bg-corporate-accent' : 'bg-gray-300'}`}
                         >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${notifications ? 'right-1' : 'left-1'}`}></div>
                         </button>
                     </div>
                 </div>
             </div>
        </div>
    );
};
export default Settings;
