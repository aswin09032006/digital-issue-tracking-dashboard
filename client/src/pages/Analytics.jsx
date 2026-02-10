import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
    const { user } = useAuth(); // Get user context
    const [stats, setStats] = useState({ 
        total: 0, 
        byStatus: { Open: 0, 'In Progress': 0, Resolved: 0 },
        byPriority: { Low: 0, Medium: 0, High: 0 },
        byCategory: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
             try {
                 // Admins see global analytics, Users see personal
                 const endpoint = user.role === 'admin' ? '/issues' : '/issues/my';
                 const { data } = await axios.get(endpoint); 
                 
                 const byStatus = { Open: 0, 'In Progress': 0, Resolved: 0 };
                const byPriority = { Low: 0, Medium: 0, High: 0 };
                const byCategory = {};

                data.forEach(issue => {
                    // Status
                    if (byStatus[issue.status] !== undefined) byStatus[issue.status]++;
                    
                    // Priority
                    if (byPriority[issue.priority] !== undefined) byPriority[issue.priority]++;
                    
                    // Category
                    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
                });

                setStats({
                    total: data.length,
                    byStatus,
                    byPriority,
                    byCategory
                });
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchAnalytics();
    }, [user]);

    const Bar = ({ label, value, total, color = "bg-corporate-text" }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs uppercase font-medium text-corporate-muted mb-1">
                    <span>{label}</span>
                    <span>{value} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full h-2 bg-corporate-sidebar border border-corporate-border">
                    <div 
                        className={`h-full ${color} transition-all duration-500`} 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-sm text-corporate-muted">Loading analytics...</div>;

    return (
        <div className="bg-corporate-bg border border-corporate-border shadow-sm p-8 transition-colors duration-200">
            <h2 className="text-2xl font-medium text-corporate-text mb-8 border-b border-corporate-border pb-4 tracking-tight uppercase">Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Status Distribution */}
                <div>
                     <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-6">Issues by Status</h3>
                     <Bar label="Open" value={stats.byStatus['Open']} total={stats.total} color="bg-red-500" />
                     <Bar label="In Progress" value={stats.byStatus['In Progress']} total={stats.total} color="bg-yellow-500" />
                     <Bar label="Resolved" value={stats.byStatus['Resolved']} total={stats.total} color="bg-green-500" />
                </div>

                {/* Priority Distribution */}
                <div>
                     <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-6">Issues by Priority</h3>
                     <Bar label="High Priority" value={stats.byPriority['High']} total={stats.total} color="bg-red-600" />
                     <Bar label="Medium Priority" value={stats.byPriority['Medium']} total={stats.total} color="bg-blue-600" />
                     <Bar label="Low Priority" value={stats.byPriority['Low']} total={stats.total} color="bg-gray-400" />
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="mt-12 pt-8 border-t border-corporate-border">
                 <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-6">Issues by Category</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {Object.entries(stats.byCategory).map(([cat, count]) => (
                         <div key={cat} className="bg-corporate-sidebar p-4 border border-corporate-border text-center">
                             <div className="text-2xl font-medium text-corporate-text">{count}</div>
                             <div className="text-xs uppercase font-medium text-corporate-muted mt-1">{cat}</div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};
export default Analytics;
