import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const isAuthPage = location.pathname === '/login';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (isAuthPage) {
        return (
            <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#101622]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="size-8 text-blue-600">
                                <Briefcase className="w-full h-full" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GigFlow</span>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="text-blue-600 size-8 flex items-center justify-center">
                            <Briefcase className="w-full h-full" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">GigFlow</h1>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600'}`}
                        >
                            Browse
                        </Link>
                        {user && (
                            <>
                                {/* <Link
                                    to="/messages"
                                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === '/messages' ? 'text-blue-600' : 'text-slate-600'}`}
                                >
                                    Messages
                                </Link> */}
                                <Link
                                    to="/create-gig"
                                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${location.pathname === '/create-gig' ? 'text-blue-600' : 'text-slate-600'}`}
                                >
                                    Post a Gig
                                </Link>
                            </>
                        )}

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const Footer = () => {
    return (
        <footer className="mt-auto w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© 2024 GigFlow. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export const Layout = ({ children }) => {
    return (
        <div className="bg-slate-50 dark:bg-[#101622] font-sans text-slate-900 dark:text-gray-100 min-h-screen flex flex-col antialiased selection:bg-blue-600/20 selection:text-blue-700">
            <Navbar />
            <main className="flex-grow w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
};
