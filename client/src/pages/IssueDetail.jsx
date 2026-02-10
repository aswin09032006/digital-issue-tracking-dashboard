import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const IssueDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const notify = useNotification();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const [availableTechs, setAvailableTechs] = useState([]);

    const fetchIssue = async () => {
        try {
            const { data } = await axios.get(`/issues/${id}`);
            setIssue(data);
            setStatus(data.status);
            setAssignedTo(data.assignedTo || '');
        } catch (error) {
            console.error(error);
            notify.error("Failed to load issue details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchTechs = async () => {
             if (user.role === 'admin') {
                 try {
                     const { data } = await axios.get('/auth/users');
                     const techs = data.filter(u => u.role === 'admin' || u.role === 'technician');
                     setAvailableTechs(techs);
                 } catch (e) {
                     console.error("Failed to load technicians");
                 }
             }
        };
        fetchTechs();
    }, [user.role]);

    useEffect(() => {
        fetchIssue();
    }, [id]);

    const handleStatusUpdate = async () => {
        try {
            await axios.put(`/issues/${id}/status`, { status });
            notify.success(`Status updated to ${status}`);
            fetchIssue(); // Refresh
        } catch (error) {
            notify.error('Failed to update status');
        }
    };
    
    const handleAssignUpdate = async () => {
        try {
            await axios.put(`/issues/${id}/assign`, { assignedTo });
            notify.success(`Issue assigned to ${assignedTo}`);
            fetchIssue();
        } catch (error) {
            notify.error('Failed to assign user');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/issues/${id}/comment`, { text: comment });
            setComment('');
            fetchIssue();
            notify.success("Comment added");
        } catch (error) {
            notify.error('Failed to post comment');
        }
    };

    if (loading) return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
             <div className="lg:col-span-8 space-y-8">
                  <div className="bg-corporate-bg p-8 border border-corporate-border space-y-4">
                       <Skeleton className="h-6 w-1/4" />
                       <Skeleton className="h-10 w-3/4" />
                       <Skeleton className="h-40 w-full" />
                  </div>
             </div>
             <div className="lg:col-span-4 space-y-6">
                  <div className="bg-corporate-bg p-6 border border-corporate-border space-y-4">
                       <Skeleton className="h-6 w-1/2" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-full" />
                  </div>
             </div>
        </div>
    );

    if (!issue) return <div className="p-8 text-sm text-red-500">Issue not found</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
            {/* Main Content: 8 Cols */}
            <div className="lg:col-span-8 space-y-8">
                <div className="bg-corporate-bg p-8 border border-corporate-border shadow-sm transition-colors duration-200">
                    <div className="border-b border-corporate-border pb-6 mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="bg-corporate-text text-corporate-bg px-2 py-1 text-xs font-medium uppercase tracking-widest">
                                {issue.category}
                            </span>
                            <span className="text-xs font-medium uppercase tracking-wider text-corporate-muted">
                                {new Date(issue.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-medium text-corporate-text tracking-tight leading-tight">{issue.title}</h1>
                        <div className="mt-4 flex items-center space-x-2 text-sm text-corporate-muted">
                             <span className="font-medium">Reported by:</span>
                             <span className="bg-corporate-sidebar px-2 py-0.5 border border-corporate-border text-xs font-medium uppercase text-corporate-text">
                                {issue.createdBy?.name}
                             </span>
                        </div>
                    </div>

                    <div className="prose max-w-none text-corporate-text font-sans">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-corporate-muted mb-4">Description</h3>
                        <p className="whitespace-pre-wrap leading-relaxed">{issue.description}</p>
                    </div>
                </div>

                <div className="bg-corporate-bg p-8 border border-corporate-border shadow-sm transition-colors duration-200">
                    <h3 className="text-lg font-medium text-corporate-text mb-8 pb-4 border-b border-corporate-border uppercase tracking-tight">
                        Discussion ({issue.comments.length})
                    </h3>
                    <div className="space-y-8 mb-8">
                        {issue.comments.map((c, i) => (
                            <div key={i} className="flex space-x-4">
                                <div className="w-10 h-10 bg-corporate-sidebar border border-corporate-border flex flex-shrink-0 items-center justify-center text-sm font-medium text-corporate-text">
                                    {c.user.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="font-medium text-corporate-text text-sm">{c.user}</span>
                                        <span className="text-xs text-corporate-muted font-mono">{new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-corporate-sidebar p-4 border border-corporate-border text-sm text-corporate-text">
                                        {c.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {issue.comments.length === 0 && <p className="text-corporate-muted text-sm italic">No comments yet. Be the first to add one.</p>}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="mt-8">
                        <textarea 
                            className="w-full p-4 border border-corporate-border focus:border-corporate-text focus:ring-0 transition-colors bg-corporate-bg mb-4 text-sm font-sans text-corporate-text placeholder-corporate-muted"
                            rows="4"
                            placeholder="Type your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        ></textarea>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-corporate-text text-corporate-bg px-6 py-2 font-medium uppercase tracking-widest text-xs hover:opacity-90 transition-opacity">
                                Post Comment
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar Metadata: 4 Cols */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-corporate-bg p-6 border border-corporate-border shadow-sm transition-colors duration-200">
                    <h3 className="text-xs font-medium uppercase tracking-widest text-corporate-muted mb-4">Meta Information</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-corporate-muted mb-1">Status</label>
                            <span className="inline-block px-3 py-1 bg-corporate-sidebar border border-corporate-border text-sm font-medium text-corporate-text w-full text-center">
                                {issue.status}
                            </span>
                        </div>
                        <div>
                            <label className="block text-xs text-corporate-muted mb-1">Priority</label>
                            <span className="inline-block px-3 py-1 bg-corporate-sidebar border border-corporate-border text-sm font-medium text-corporate-text w-full text-center">
                                {issue.priority}
                            </span>
                        </div>
                         <div>
                            <label className="block text-xs text-corporate-muted mb-1">Assigned To</label>
                            <span className="inline-block px-3 py-1 bg-corporate-sidebar border border-corporate-border text-sm font-medium text-corporate-text w-full text-center">
                                {issue.assignedTo || 'Unassigned'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Panels */}
                <div className="space-y-6">
                    {/* Status Update - Visible to Admin OR Assignee */}
                    {(user.role === 'admin' || (issue.assignedTo && issue.assignedTo === user.name)) && (
                        <div className="bg-corporate-sidebar p-6 border border-corporate-border shadow-sm transition-colors duration-200">
                             <h3 className="text-xs font-medium uppercase tracking-widest text-corporate-text mb-4 flex items-center">
                                <span className="w-2 h-2 bg-corporate-text mr-2"></span>
                                Actions
                             </h3>
                             
                             <div>
                                <label className="block text-xs font-medium uppercase text-corporate-muted mb-1">Update Status</label>
                                <div className="flex space-x-2">
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="flex-1 text-sm p-2 border border-corporate-border focus:border-corporate-text focus:ring-0 bg-corporate-bg text-corporate-text"
                                    >
                                        <option>Open</option>
                                        <option>In Progress</option>
                                        <option>Resolved</option>
                                    </select>
                                    <button onClick={handleStatusUpdate} className="bg-corporate-bg border border-corporate-border hover:border-corporate-text text-corporate-text px-3 py-2 text-xs font-medium uppercase transition-colors">
                                        Update
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Admin Only Controls */}
                    {user.role === 'admin' && (
                        <div className="bg-corporate-bg p-6 border border-corporate-border shadow-sm transition-colors duration-200">
                             <h3 className="text-xs font-medium uppercase tracking-widest text-corporate-muted mb-4">Admin Controls</h3>
                             
                             <div>
                                <label className="block text-xs font-medium uppercase text-corporate-muted mb-1">Assign User</label>
                                <div className="flex space-x-2">
                                    <select 
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                        className="flex-1 text-sm p-2 border border-corporate-border focus:border-corporate-text focus:ring-0 bg-corporate-bg text-corporate-text"
                                    >
                                        <option value="">Unassigned</option>
                                        {availableTechs.map(tech => (
                                            <option key={tech._id} value={tech.name}>{tech.name} ({tech.role})</option>
                                        ))}
                                    </select>
                                    <button onClick={handleAssignUpdate} className="bg-corporate-sidebar border border-corporate-border hover:border-corporate-text text-corporate-text px-3 py-2 text-xs font-medium uppercase transition-colors">
                                        Assign
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
