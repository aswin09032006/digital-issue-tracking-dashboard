import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const CreateIssue = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Bug',
        priority: 'Medium'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/issues', formData);
            navigate('/my-issues');
        } catch (error) {
            console.error(error);
            alert('Failed to create issue');
        }
    };

    const inputClasses = "w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 transition-colors bg-corporate-bg text-corporate-text font-sans text-sm placeholder-corporate-muted";
    const labelClasses = "block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-corporate-bg p-8 border border-corporate-border shadow-sm transition-colors duration-200">
                <div className="mb-8 border-b border-corporate-border pb-4">
                    <h2 className="text-2xl font-medium text-corporate-text tracking-tight">New Issue</h2>
                    <p className="text-corporate-muted text-sm mt-1">Submit a new ticket to the system</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={labelClasses}>Title</label>
                        <input 
                            type="text" name="title" required
                            className={inputClasses}
                            placeholder="Briefly summarize the issue"
                            value={formData.title} onChange={handleChange}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Category</label>
                            <select name="category" 
                                 className={inputClasses}
                                 value={formData.category} onChange={handleChange}>
                                <option>Bug</option>
                                <option>Infrastructure</option>
                                <option>Academic</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Priority</label>
                            <select name="priority" 
                                 className={inputClasses}
                                 value={formData.priority} onChange={handleChange}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Description</label>
                        <textarea name="description" required rows="6"
                            className={inputClasses}
                            placeholder="Provide full details..."
                            value={formData.description} onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-corporate-text text-corporate-bg px-8 py-3 font-medium uppercase tracking-widest hover:opacity-90 transition-opacity">
                            Submit Issue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIssue;
