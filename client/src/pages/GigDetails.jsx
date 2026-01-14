import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { GigStatus } from '../constants';

export const GigDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [gig, setGig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bidLoading, setBidLoading] = useState(false);

    useEffect(() => {
        const fetchGig = async () => {
            try {
                setLoading(true);
                // Backend limitation: Fetch all gigs to find one
                const { data } = await api.get('/gigs?status=all');
                if (data.success) {
                    const foundGig = data.gigs.find(g => (g._id || g.id) === id);
                    setGig(foundGig || null);
                }
            } catch (err) {
                console.error('Failed to fetch gig', err);
                setError('Failed to load gig details.');
            } finally {
                setLoading(false);
            }
        };

        fetchGig();
    }, [id]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        const message = e.target.elements['bid-message'].value;
        if (!message.trim()) {
            toast.error('Please enter a cover letter.');
            return;
        }

        try {
            setBidLoading(true);
            await api.post('/bids', {
                gigId: id,
                message: message
            });
            toast.success('Bid submitted successfully!');
            e.target.reset();
        } catch (err) {
            console.error('Failed to submit bid', err);
            toast.error(err.response?.data?.message || 'Failed to submit bid.');
        } finally {
            setBidLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
    }

    if (!gig) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold text-slate-900">Gig not found</h2>
                <Link to="/" className="text-blue-600 hover:underline mt-4">Back to Browse</Link>
            </div>
        );
    }

    // Check ownership (handle both populated object and direct ID string just in case)
    const ownerId = gig.ownerId?._id || gig.ownerId;
    const isOwner = user && ownerId === user._id;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Gigs
            </Link>

            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
                <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${gig.status === GigStatus.Open
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${gig.status === GigStatus.Open ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                            {gig.status === GigStatus.Open ? 'Open for Bids' : gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-white mb-6">
                        {gig.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                <Building2 size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Client</p>
                                <p className="font-bold text-slate-900 dark:text-white">{gig.ownerId?.name || 'Unknown Client'}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                <Wallet size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Budget</p>
                                <p className="font-bold text-slate-900 dark:text-white">${gig.budget.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Project Description</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {gig.description}
                    </p>
                </div>

                {isOwner && (
                    <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900 flex justify-between items-center">
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">You are the owner of this gig.</p>
                        <Link
                            to={`/gigs/${gig._id || gig.id}/hire`}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
                        >
                            Manage Proposals
                        </Link>
                    </div>
                )}
            </div>

            {!isOwner && gig.status === GigStatus.Open && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
                    {!user ? (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Sign in to place a bid</h3>
                            <p className="text-slate-500 mb-6">You need an account to bid on projects.</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
                            >
                                Sign In / Register
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Place Your Bid</h3>
                            <form onSubmit={handleBidSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="bid-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Cover Letter
                                        </label>
                                        <textarea
                                            id="bid-message"
                                            name="bid-message"
                                            rows={6}
                                            className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                                            placeholder="Describe why you're the best fit for this project..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={bidLoading}
                                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {bidLoading ? 'Submitting...' : 'Submit Bid'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
