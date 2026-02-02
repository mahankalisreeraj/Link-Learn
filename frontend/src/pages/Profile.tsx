import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { User, Star, BookOpen, Wallet, Calendar } from 'lucide-react';

interface ProfileData {
    id: number;
    email: string;
    name: string;
    wallet?: {
        balance: number;
        last_support_claim: string | null;
    };
    avg_rating: number;
    reviews: Array<{
        id: number;
        reviewer_name: string;
        score: number;
        comment: string;
        timestamp: string;
    }>;
    posts: Array<{
        id: number;
        topic_to_learn: string;
        topic_to_teach: string;
        status: string;
        timestamp: string;
    }>;
}

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                // If no ID, fetch 'me', else fetch specific user
                const endpoint = id ? `/users/${id}/` : '/users/me/';
                const response = await api.get(endpoint);
                setProfile(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (isLoading) return <Layout title="Loading..."><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
    if (error || !profile) return <Layout title="Error"><div className="text-center py-20 text-red-600">{error || 'User not found'}</div></Layout>;

    return (
        <Layout title={`${profile.name}'s Profile`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
                            <User size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                        <p className="text-slate-500 text-sm mb-4">{profile.email}</p>

                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
                            <Star size={16} fill="currentColor" />
                            {profile.avg_rating.toFixed(1)} / 5.0
                        </div>
                    </div>

                    {/* Wallet (Only visible on own profile) */}
                    {profile.wallet && (
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/20">
                            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Wallet size={14} /> Account Credits
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">{profile.wallet.balance}</span>
                                <span className="text-slate-400">credits</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                                Credits are earned by teaching and used for learning.
                                Claim support if your balance is low.
                            </p>
                        </div>
                    )}
                </div>

                {/* Content Tabs/Sections */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Learning Requests */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-blue-600" />
                            Learning Requests
                        </h3>
                        <div className="space-y-4">
                            {profile.posts.length > 0 ? profile.posts.map(post => (
                                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {post.status}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(post.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">Learning: {post.topic_to_learn}</h4>
                                    {post.topic_to_teach && (
                                        <p className="text-sm text-slate-500 italic">Teaching: {post.topic_to_teach}</p>
                                    )}
                                </div>
                            )) : (
                                <div className="bg-white p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                                    No requests created yet.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Reviews */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Star size={20} className="text-amber-500" />
                            Reviews & Ratings
                        </h3>
                        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                            {profile.reviews.length > 0 ? profile.reviews.map(review => (
                                <div key={review.id} className="p-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-slate-900 text-sm">{review.reviewer_name}</span>
                                        <div className="flex items-center text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.score ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm">{review.comment || "No comment left."}</p>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-400 italic">
                                    No reviews received yet.
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </Layout>
    );
};

export default Profile;
