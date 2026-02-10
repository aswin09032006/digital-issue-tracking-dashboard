import {
    BarChart3,
    Bell,
    Files,
    KanbanSquare,
    LayoutDashboard,
    ListTodo,
    LogOut,
    Menu,
    PlusCircle,
    Settings,
    Users,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import socket from '../api/socket';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 border-r-2 transition-colors ${
      active 
        ? 'border-corporate-accent bg-corporate-bg/10 text-corporate-text font-semibold' 
        : 'border-transparent text-corporate-muted hover:bg-corporate-bg/5 hover:text-corporate-text'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm tracking-wider font-medium">{label}</span>
  </Link>
);

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { realTime } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
      try {
          const { data } = await axios.get('/notifications');
          setNotifications(data);
      } catch (error) {
          console.error("Failed to fetch notifications");
      }
  };

  useEffect(() => {
      fetchNotifications();
      // Listen for real-time updates to notification list
      if (realTime) {
          socket.on('notification', () => {
              fetchNotifications();
          });
      }
      return () => socket.off('notification');
  }, [realTime]);

  // Close dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (notifRef.current && !notifRef.current.contains(event.target)) {
              setShowNotifs(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markRead = async (id) => {
      try {
          await axios.put(`/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      } catch (error) { console.error(error); }
  };

  const markAllRead = async () => {
      try {
          await axios.put('/notifications/read-all');
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) { console.error(error); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
      logout();
      navigate('/login');
  };

  if (!user) return null;

  const SidebarContent = () => (
      <>
        <div className="h-16 flex items-center px-6 border-b border-corporate-border">
             <div className="w-8 h-8 bg-corporate-text text-corporate-bg flex items-center justify-center font-medium text-sm">IT</div>
             <span className="ml-3 font-medium tracking-tight text-lg text-corporate-text">TRACKER</span>
             {/* Mobile Close Button */}
             <button 
                className="md:hidden ml-auto text-corporate-muted"
                onClick={() => setIsMobileMenuOpen(false)}
             >
                 <X size={24} />
             </button>
        </div>
        
        <nav className="flex flex-col mt-6 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Overview" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={PlusCircle} label="New Issue" to="/create" active={location.pathname === '/create'} />
          
          {user.role !== 'admin' && (
            <SidebarItem icon={ListTodo} label="My Issues" to="/my-issues" active={location.pathname === '/my-issues'} />
          )}
          
          {user.role !== 'admin' && (
            <SidebarItem icon={KanbanSquare} label="Board" to="/kanban" active={location.pathname === '/kanban'} />
          )}

          {user.role === 'admin' && (
             <>
                <SidebarItem icon={Files} label="All Issues" to="/all-issues" active={location.pathname === '/all-issues'} />
                <SidebarItem icon={Users} label="Manage Users" to="/admin/users" active={location.pathname === '/admin/users'} />
             </>
          )}

          <SidebarItem icon={BarChart3} label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
          <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="mt-auto w-full p-6 border-t border-corporate-border">
             <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 text-corporate-muted hover:text-red-600 transition-colors"
             >
                <LogOut size={18} />
                <span className="text-sm font-medium uppercase tracking-wider">Logout</span>
             </button>
        </div>
      </>
  );

  return (
    // FULL PAGE FLEX CONTAINER
    <div className="min-h-screen bg-corporate-bg font-sans text-corporate-text flex transition-colors duration-200">
      
      {/* DESKTOP SIDEBAR - FIXED WIDTH */}
      <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 border-r border-corporate-border bg-corporate-sidebar sticky top-0 h-screen transition-colors duration-200">
          <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR (Slide-in) */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              ></div>
              
              {/* Drawer */}
              <aside className="absolute top-0 bottom-0 left-0 w-64 bg-corporate-sidebar border-r border-corporate-border flex flex-col shadow-2xl animate-slide-in">
                  <SidebarContent />
              </aside>
          </div>
      )}

      {/* MAIN CONTENT AREA - GROWS TO FILL */}
      <div className="flex-1 flex flex-col min-h-screen bg-corporate-bg transition-colors duration-200 min-w-0">
          {/* TOPBAR */}
          <header className="h-16 border-b border-corporate-border bg-corporate-bg flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-200">
              <div className="flex items-center">
                  {/* Hamburger (Mobile Only) */}
                  <button 
                    className="md:hidden mr-4 text-corporate-text"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                      <Menu size={24} />
                  </button>
                  <h1 className="text-xl font-medium tracking-tight text-corporate-text">{title}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                      <button 
                        className="text-corporate-text hover:bg-corporate-bg/10 p-2 rounded-full transition-colors relative"
                        onClick={() => setShowNotifs(!showNotifs)}
                      >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-corporate-bg"></span>
                          )}
                      </button>

                      {showNotifs && (
                          <div className="absolute right-0 mt-2 w-80 bg-corporate-bg border border-corporate-border shadow-xl z-50 animate-fade-in max-h-96 overflow-y-auto">
                              <div className="p-3 border-b border-corporate-border flex justify-between items-center bg-corporate-sidebar sticky top-0">
                                  <h3 className="text-xs font-medium uppercase tracking-widest text-corporate-text">Notifications</h3>
                                  {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-corporate-accent hover:underline">Mark all read</button>
                                  )}
                              </div>
                              <div className="divide-y divide-corporate-border">
                                  {notifications.length > 0 ? (
                                      notifications.map(n => (
                                          <div key={n._id} className={`p-4 hover:bg-corporate-sidebar transition-colors cursor-pointer ${!n.isRead ? 'bg-corporate-bg/50' : ''}`} onClick={() => markRead(n._id)}>
                                              <p className={`text-sm mb-1 ${!n.isRead ? 'font-medium text-corporate-text' : 'text-corporate-muted'}`}>
                                                  {n.text}
                                              </p>
                                              <p className="text-xs text-corporate-muted font-mono">{new Date(n.createdAt).toLocaleDateString()}</p>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="p-4 text-center text-sm text-corporate-muted italic">No notifications</div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>

                  <Link to="/profile" className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-corporate-text">{user.name}</p>
                          <p className="text-xs text-corporate-muted uppercase">{user.role}</p>
                      </div>
                      <div className="w-10 h-10 bg-corporate-sidebar border border-corporate-border flex items-center justify-center text-sm font-medium text-corporate-text">
                          {user.name.charAt(0).toUpperCase()}
                      </div>
                  </Link>
              </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          <main className="flex-1 bg-corporate-bg p-6 md:p-12 overflow-y-auto transition-colors duration-200">
              <div className="max-w-none">
                 {children}
              </div>
          </main>
      </div>
    </div>
  );
};

export default Layout;
