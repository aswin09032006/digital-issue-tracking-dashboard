import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
    const [recentIssues, setRecentIssues] = useState([]);
    const [criticalIssues, setCriticalIssues] = useState([]);
    const [priorityStats, setPriorityStats] = useState({ High: 0, Medium: 0, Low: 0 });
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });

    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Get user context
    const notify = useNotification();

    useEffect(() => {
        const fetchIssues = async () => {
             try {
                 // Admins see all issues, Users see only theirs
                 const endpoint = user.role === 'admin' ? '/issues' : '/issues/my';
                 const { data } = await axios.get(endpoint);
                 
                 // Handle pagination response { issues: [], ... } or legacy []
                 const issuesData = Array.isArray(data) ? data : data.issues || [];
                 
                 const total = issuesData.length;
                 const open = issuesData.filter(i => i.status === 'Open').length;
                 const inProgress = issuesData.filter(i => i.status === 'In Progress').length;
                 const resolved = issuesData.filter(i => i.status === 'Resolved').length;
                 setStats({ total, open, inProgress, resolved });

                 // Get 5 most recent issues
                 const sorted = [...issuesData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                 setRecentIssues(sorted.slice(0, 5));

                 // Critical Issues: Open & High Priority
                 const critical = issuesData.filter(i => i.priority === 'High' && i.status === 'Open');
                 setCriticalIssues(critical.slice(0, 5));

                 // Priority Distribution
                 const low = issuesData.filter(i => i.priority === 'Low').length;
                 const medium = issuesData.filter(i => i.priority === 'Medium').length;
                 const high = issuesData.filter(i => i.priority === 'High').length;
                 setPriorityStats({ Low: low, Medium: medium, High: high });

             } catch (e) {
                 console.error(e);
                 notify.error("Failed to load dashboard data");
             } finally {
                 setLoading(false);
             }
        };
        if (user) fetchIssues();
    }, [user]);

    const StatCard = ({ label, value, color }) => (
        <div className="bg-corporate-bg p-6 border border-corporate-border shadow-sm hover:shadow-md transition-all duration-200 group">
            <h3 className="text-corporate-muted text-xs font-medium uppercase tracking-widest group-hover:text-corporate-text transition-colors">{label}</h3>
            <p className={`text-3xl font-medium mt-2 ${color}`}>{value}</p>
        </div>
    );

    const PriorityBar = ({ label, value, total, color }) => {
        const percent = total > 0 ? (value / total) * 100 : 0;
        if (loading) {
        return (
            <div className="space-y-8">
                 <div className="flex justify-between items-center pb-2 border-b border-corporate-border">
                     <div className="h-8 w-40 bg-corporate-sidebar animate-pulse"></div>
                 </div>
                 <CardSkeleton count={4} />
                 <TableSkeleton rows={3} />
            </div>
        );
    }

    return (
            <div className="mb-3">
                <div className="flex justify-between text-xs font-medium uppercase text-corporate-muted mb-1">
                    <span>{label}</span>
                    <span>{value}</span>
                </div>
                <div className="w-full h-1.5 bg-corporate-sidebar">
                    <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center pb-2 border-b border-corporate-border">
                 <h2 className="text-2xl font-medium text-corporate-text tracking-tight">Dashboard</h2>
                 <span className="text-xs font-mono text-corporate-muted uppercase">Overview</span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Issues" value={stats.total} color="text-corporate-text" />
                <StatCard label="Open" value={stats.open} color="text-red-500" />
                <StatCard label="In Progress" value={stats.inProgress} color="text-yellow-500" />
                <StatCard label="Resolved" value={stats.resolved} color="text-green-500" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border border-corporate-border bg-corporate-bg shadow-sm">
                        <div className="px-6 py-4 border-b border-corporate-border bg-corporate-sidebar flex justify-between items-center">
                            <h3 className="text-sm font-medium text-corporate-text uppercase tracking-widest">Recent Activity</h3>
                            <a href={user?.role === 'admin' ? '/all-issues' : '/my-issues'} className="text-xs text-corporate-accent hover:underline font-medium uppercase">View All</a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-corporate-border">
                                <thead className="bg-corporate-bg">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Issue</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-corporate-bg divide-y divide-corporate-border">
                                    {recentIssues.map(issue => (
                                        <tr key={issue._id} className="hover:bg-corporate-sidebar transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-corporate-text">{issue.title}</div>
                                                <div className="text-xs text-corporate-muted">{issue.category} • {issue.priority}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs font-medium uppercase tracking-wider border ${
                                                    issue.status === 'Open' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    issue.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                    {issue.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-corporate-muted font-mono">
                                                {new Date(issue.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentIssues.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-sm text-corporate-muted">No recent activity.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Insight Column */}
                <div className="space-y-6">
                    {/* Critical Issues */}
                    <div className="border border-corporate-border bg-corporate-bg shadow-sm">
                        <div className="px-6 py-4 border-b border-corporate-border bg-red-50">
                            <h3 className="text-sm font-medium text-red-800 uppercase tracking-widest flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                                Critical Attention
                            </h3>
                        </div>
                        <div className="divide-y divide-corporate-border">
                            {criticalIssues.map(issue => (
                                <div key={issue._id} className="p-4 hover:bg-corporate-sidebar transition-colors">
                                    <div className="text-sm font-medium text-corporate-text mb-1">{issue.title}</div>
                                    <div className="text-xs text-corporate-muted flex justify-between">
                                        <span>{issue.createdBy?.name || 'Unknown'}</span>
                                        <span className="font-mono">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {criticalIssues.length === 0 && (
                                <div className="p-6 text-center text-sm text-corporate-muted">
                                    No critical priority issues.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="border border-corporate-border bg-corporate-bg shadow-sm p-6">
                         <h3 className="text-sm font-medium text-corporate-text uppercase tracking-widest mb-4">Workload by Priority</h3>
                         <PriorityBar label="High" value={priorityStats.High} total={stats.total} color="bg-red-600" />
                         <PriorityBar label="Medium" value={priorityStats.Medium} total={stats.total} color="bg-blue-600" />
                         <PriorityBar label="Low" value={priorityStats.Low} total={stats.total} color="bg-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
