import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-corporate-sidebar font-sans text-corporate-text transition-colors duration-200">
            <div className="col-span-1 md:col-span-12 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-corporate-bg border border-corporate-border p-8 md:p-12 shadow-sm transition-colors duration-200">
                    <div className="mb-8 text-center">
                        <div className="inline-block px-3 py-1 bg-corporate-text text-corporate-bg text-xs font-medium uppercase tracking-widest mb-4">
                            Fixr
                        </div>
                        <h2 className="text-3xl font-medium tracking-tight text-corporate-text">Create Account</h2>
                        <p className="mt-2 text-sm text-corporate-muted">Join the platform</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 transition-colors bg-corporate-sidebar text-corporate-text focus:bg-corporate-bg"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Email Address</label>
                            <input 
                                type="email" 
                                className="w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 transition-colors bg-corporate-sidebar text-corporate-text focus:bg-corporate-bg"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-corporate-muted mb-2">Password</label>
                            <input 
                                type="password" 
                                className="w-full p-3 border border-corporate-border focus:border-corporate-text focus:ring-0 transition-colors bg-corporate-sidebar text-corporate-text focus:bg-corporate-bg"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-corporate-text text-corporate-bg py-4 font-medium uppercase tracking-widest hover:opacity-90 transition-opacity">
                            Register
                        </button>
                    </form>
                    <div className="mt-8 text-center border-t border-corporate-border pt-6">
                        <p className="text-sm text-corporate-muted">
                           Already have an account? <Link to="/login" className="font-semibold text-corporate-text hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
