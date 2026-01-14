import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const CreateGig = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const gigData = {
            title: formData.get('title'),
            description: formData.get('description'),
            budget: Number(formData.get('budget'))
        };

        try {
            await api.post('/gigs', gigData);
            toast.success('Gig created successfully');
            navigate('/');
        } catch (err) {
            console.error('Failed to create gig', err);
            toast.error(err.response?.data?.message || 'Failed to create gig');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Create New Gig</h1>
                <p className="text-slate-600 dark:text-slate-400">Share the details of your project to find the perfect developer.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-900 dark:text-white">Gig Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        className="block w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all p-3"
                        placeholder="e.g., React Frontend Developer needed..."
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label htmlFor="description" className="block text-sm font-semibold text-slate-900 dark:text-white">Description</label>
                        <span className="text-xs text-slate-400">0/2000 characters</span>
                    </div>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={8}
                        className="block w-full rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all p-3 resize-none"
                        placeholder="Describe the project requirements, tech stack, and deliverables..."
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label htmlFor="budget" className="block text-sm font-semibold text-slate-900 dark:text-white">Budget (USD)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            $
                        </div>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            required
                            min="1"
                            className="block w-full pl-8 rounded-lg border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all p-3"
                            placeholder="500"
                        />
                    </div>
                    <p className="text-xs text-slate-500">Estimated budget for the entire project.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-4">
                    <Link
                        to="/"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-4 py-2 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : 'Post Gig'}
                    </button>
                </div>
            </form>
        </div>
    );
};
