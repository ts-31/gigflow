import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { GigStatus } from '../constants';

export const BrowseGigs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/gigs?search=${searchTerm}&status=all`);
                if (data.success) {
                    setGigs(data.gigs);
                }
            } catch (err) {
                console.error('Failed to fetch gigs', err);
                setError('Failed to load gigs. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchGigs();
        }, 300); // Simple debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <section className="mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight self-start md:self-auto">Find your next gig</h2>
                    <div className="flex w-full md:w-auto gap-4">
                        <Link
                            to="/create-gig"
                            className="hidden md:flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
                        >
                            <PlusCircle size={20} />
                            <span>Post a Gig</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    <div className="relative flex-grow group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
                            placeholder="Search for roles or keywords..."
                        />
                    </div>
                    {/* Mobile Post Gig Button */}
                    <Link
                        to="/create-gig"
                        className="md:hidden flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all"
                    >
                        <PlusCircle size={20} />
                        <span>Post a Gig</span>
                    </Link>
                </div>
            </section>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading gigs...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">
                        <p>{error}</p>
                    </div>
                ) : (
                    gigs.map((gig) => (
                        <Link
                            key={gig._id || gig.id}
                            to={`/gigs/${gig._id || gig.id}`}
                            className="block group relative bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate pr-2 group-hover:text-blue-600 transition-colors">
                                        {gig.title}
                                    </h3>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${gig.status === GigStatus.Open
                                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900'
                                        : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900'
                                        }`}>
                                        {gig.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                                    {gig.description}
                                </p>

                                <div className="flex items-center justify-between text-sm pt-3 border-t border-dashed border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-x-4">
                                        <span className="font-bold text-slate-900 dark:text-slate-200">${gig.budget.toLocaleString()} Fixed</span>
                                        <span className="text-slate-500">posted {new Date(gig.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}

                {!loading && !error && gigs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No gigs found matching your search.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center">
                {/* Pagination is generic for now, removed 'Load more' as typically requires pagination API */}
            </div>
        </div>
    );
};
