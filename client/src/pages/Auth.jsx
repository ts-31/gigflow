import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');

        try {
            if (isLogin) {
                await login(email, password);
                toast.success('Logged in successfully');
            } else {
                await register(name, email, password);
                toast.success('Account created successfully');
            }
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {isLogin ? 'Enter your credentials to access your account.' : 'Join the community of top-tier developers.'}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1e293b] shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-all ${isLogin
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-all ${!isLogin
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="name">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-shadow"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-shadow"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder={isLogin ? "Enter your password" : "Create a password"}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-shadow"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        Must be at least 8 characters.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
                            </button>
                        </form>

                        {!isLogin && (
                            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                                By registering, you agree to our <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Privacy Policy</a>.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
