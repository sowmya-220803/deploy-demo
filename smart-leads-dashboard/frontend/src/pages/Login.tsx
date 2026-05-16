import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-dark-bg">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-surface p-8 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                    <div className="mx-auto h-12 w-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 rounded-full flex items-center justify-center">
                        <LogIn className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-md text-sm border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                            <input
                                type="email"
                                required
                                className="input-field mt-1"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field mt-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex justify-center py-2.5"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
