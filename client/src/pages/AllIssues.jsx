import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const AllIssues = () => {
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const { data } = await axios.get('/issues');
                // Handle pagination response { issues: [], ... } or legacy []
                const issuesData = Array.isArray(data) ? data : data.issues || [];
                setIssues(issuesData);
                setFilteredIssues(issuesData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    useEffect(() => {
        let result = issues;

        if (search) {
            result = result.filter(i => 
                i.title.toLowerCase().includes(search.toLowerCase()) || 
                i.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter) {
            result = result.filter(i => i.status === statusFilter);
        }

        if (priorityFilter) {
            result = result.filter(i => i.priority === priorityFilter);
        }

        if (categoryFilter) {
            result = result.filter(i => i.category === categoryFilter);
        }

        setFilteredIssues(result);
    }, [search, statusFilter, priorityFilter, categoryFilter, issues]);

    const handleExportCSV = () => {
        if (filteredIssues.length === 0) return;

        const headers = ['ID', 'Title', 'Creator', 'Category', 'Priority', 'Status', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredIssues.map(issue => [
                issue._id,
                `"${issue.title.replace(/"/g, '""')}"`, // Escape quotes
                issue.createdBy?.name || 'Unknown',
                issue.category,
                issue.priority,
                issue.status,
                new Date(issue.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `issues_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Extract unique categories for filter dropdown
    const categories = [...new Set(issues.map(i => i.category))].filter(Boolean).sort();

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
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-corporate-border pb-4 gap-4">
                <h2 className="text-2xl font-medium text-corporate-text tracking-tight">All Issues (Admin)</h2>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="text" 
                        placeholder="Search issues..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-2 text-sm border border-corporate-border bg-corporate-bg text-corporate-text focus:border-corporate-text outline-none placeholder-corporate-muted"
                    />
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="p-2 text-sm border border-corporate-border bg-corporate-bg text-corporate-text focus:border-corporate-text outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 text-sm border border-corporate-border bg-corporate-bg text-corporate-text focus:border-corporate-text outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                    <select 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="p-2 text-sm border border-corporate-border bg-corporate-bg text-corporate-text focus:border-corporate-text outline-none"
                    >
                        <option value="">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                    <button 
                        onClick={handleExportCSV}
                        className="bg-corporate-text text-corporate-bg px-4 py-2 text-sm font-medium uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap"
                        disabled={filteredIssues.length === 0}
                    >
                        Export CSV
                    </button>
                </div>
            </div>
            
            <div className="border border-corporate-border bg-corporate-bg shadow-sm overflow-x-auto transition-colors duration-200">
                <table className="min-w-full divide-y divide-corporate-border">
                    <thead className="bg-corporate-sidebar">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Creator</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-corporate-muted uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-corporate-bg divide-y divide-corporate-border">
                        {filteredIssues.map(issue => (
                            <tr key={issue._id} className="hover:bg-corporate-sidebar transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link to={`/issues/${issue._id}`} className="text-corporate-text font-semibold hover:text-corporate-accent group-hover:underline">
                                        {issue.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-corporate-muted">
                                    <span className="inline-flex items-center px-2 py-0.5 bg-corporate-sidebar text-xs font-medium text-corporate-text border border-corporate-border">
                                        {issue.createdBy?.name || 'Unknown'}
                                    </span>
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
                {filteredIssues.length === 0 && <div className="p-8 text-center text-corporate-muted text-sm">No issues found matching your filters.</div>}
            </div>
        </div>
    );
};

export default AllIssues;
