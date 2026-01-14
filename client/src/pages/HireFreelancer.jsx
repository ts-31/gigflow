import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { GigStatus } from '../constants';

export const HireFreelancer = () => {
    const { id } = useParams();
    const [gig, setGig] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hiringId, setHiringId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Gig (workaround)
                const gigsRes = await api.get('/gigs?status=all');
                if (gigsRes.data.success) {
                    const foundGig = gigsRes.data.gigs.find(g => (g._id || g.id) === id);
                    if (foundGig) {
                        setGig(foundGig);
                        // Fetch Bids for Gig
                        const bidsRes = await api.get(`/bids/${foundGig._id || foundGig.id}`);
                        if (bidsRes.data.success) {
                            setBids(bidsRes.data.bids);
                        }
                    } else {
                        setError('Gig not found');
                    }
                }
            } catch (err) {
                console.error('Failed to load data', err);
                setError('Failed to load details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleHire = async (bidId) => {
        if (!window.confirm('Are you sure you want to hire this freelancer? This action cannot be undone.')) {
            return;
        }

        try {
            setHiringId(bidId);
            const { data } = await api.patch(`/bids/${bidId}/hire`);
            if (data.success) {
                toast.success('Freelancer hired successfully!');
                // Update local state to reflect changes
                setGig(prev => ({ ...prev, status: GigStatus.Assigned }));
                setBids(prev => prev.map(bid =>
                    bid._id === bidId
                        ? ({ ...bid, status: 'hired' }) // Assuming backend sets accepted/hired
                        : ({ ...bid, status: 'rejected' })
                ));
            }
        } catch (err) {
            console.error('Hiring failed', err);
            toast.error(err.response?.data?.message || 'Failed to hire freelancer.');
        } finally {
            setHiringId(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error || !gig) return <div className="p-8 text-center text-red-500">{error || 'Gig not found'}</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <Link to={`/gigs/${id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to Gig Details
            </Link>

            <div className="mb-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] p-6 shadow-sm lg:p-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white lg:text-3xl">
                            {gig.title}
                        </h1>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${gig.status === GigStatus.Open
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {gig.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <DollarSign size={16} />
                        <span>Budget: ${gig.budget.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="mb-6 px-2">
                <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                    Received Bids ({bids.length})
                </h3>
            </div>

            <div className="flex flex-col gap-6">
                {bids.length === 0 ? (
                    <p className="text-slate-500 italic px-2">No bids received yet.</p>
                ) : (
                    bids.map((bid) => (
                        <div key={bid._id || bid.id} className={`flex flex-col rounded-xl border ${bid.status === 'hired' ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-[#1e293b] p-6 shadow-sm transition hover:shadow-md`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{bid.freelancerId?.name || 'Unknown Freelancer'}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{bid.freelancerId?.email}</p>
                                </div>
                                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${bid.status === 'hired' ? 'bg-green-100 text-green-800' :
                                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                </span>
                            </div>
                            <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {bid.message}
                            </p>

                            {gig.status === GigStatus.Open && bid.status === 'pending' && (
                                <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-700 gap-4">
                                    <button
                                        onClick={() => handleHire(bid._id || bid.id)}
                                        disabled={hiringId === (bid._id || bid.id)}
                                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                                    >
                                        {hiringId === (bid._id || bid.id) ? 'Processing...' : 'Hire Freelancer'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
