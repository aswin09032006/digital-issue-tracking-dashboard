import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminUsers from './pages/AdminUsers';
import AllIssues from './pages/AllIssues';
import Analytics from './pages/Analytics';
import CreateIssue from './pages/CreateIssue';
import Dashboard from './pages/Dashboard';
import IssueDetail from './pages/IssueDetail';
import KanbanBoard from './pages/KanbanBoard';
import Login from './pages/Login';
import MyIssues from './pages/MyIssues';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Settings from './pages/Settings';


const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <Layout title="Issue Tracker">
        <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/create" element={<CreateIssue />} />
                        <Route path="/my-issues" element={<MyIssues />} />
                        <Route path="/issues/:id" element={<IssueDetail />} />
                        <Route path="/kanban" element={<KanbanBoard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>

                    <Route element={<ProtectedRoute adminOnly={true} />}>
                        <Route path="/all-issues" element={<AllIssues />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
