import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const MyIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const { data } = await axios.get('/issues/my');
                setIssues(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Open': return 'bg-red-50 text-red-700 border-red-200';
            case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-corporate-bg text-corporate-muted border-corporate-border';
        }
    };

    if (loading) return <div className="p-8 text-sm text-corporate-muted">Loading data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-corporate-border pb-4">
                <h2 className="text-2xl font-medium text-corporate-text tracking-tight">My Issues</h2>
                <Link to="/create" className="bg-corporate-text text-corporate-bg text-xs px-4 py-2 font-medium uppercase tracking-widest hover:opacity-90 transition-opacity">
                    New Issue
                </Link>
            </div>
            
            <div className="border border-corporate-border bg-corporate-bg shadow-sm overflow-x-auto transition-colors duration-200">
                <table className="min-w-full divide-y divide-corporate-border">
                    <thead className="bg-corporate-sidebar">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-corporate-bg divide-y divide-corporate-border">
                        {issues.map(issue => (
                            <tr key={issue._id} className="hover:bg-corporate-sidebar transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link to={`/issues/${issue._id}`} className="text-corporate-text font-semibold hover:text-corporate-accent group-hover:underline">
                                        {issue.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-corporate-muted">{issue.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-corporate-muted">{issue.priority}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs font-medium uppercase tracking-wider border ${getStatusColor(issue.status)}`}>
                                        {issue.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-corporate-muted font-mono">
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {issues.length === 0 && <div className="p-8 text-center text-corporate-muted text-sm">No issues found. Create one to get started.</div>}
            </div>
        </div>
    );
};

export default MyIssues;
