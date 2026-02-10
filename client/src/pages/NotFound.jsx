import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-corporate-bg flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
            <h1 className="text-9xl font-medium text-corporate-text tracking-tighter mb-4">404</h1>
            <div className="w-24 h-1 bg-corporate-accent mb-8"></div>
            <h2 className="text-2xl font-medium text-corporate-text uppercase tracking-widest mb-4">Page Not Found</h2>
            <p className="text-corporate-muted mb-8 max-w-md">
                The resource you are looking for does not exist or has been moved.
            </p>
            <button 
                onClick={() => navigate('/')}
                className="bg-corporate-text text-corporate-bg px-8 py-3 font-medium uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
                Return Home
            </button>
        </div>
    );
};
export default NotFound;
