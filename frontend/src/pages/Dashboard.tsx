import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { Plus, BookOpen, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface Post {
    id: number;
    topic_to_learn: string;
    topic_to_teach: string;
    learning_only_flag: boolean;
    status: string;
    timestamp: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create Form State
    const [showCreate, setShowCreate] = useState(false);
    const [newLearn, setNewLearn] = useState('');
    const [newTeach, setNewTeach] = useState('');
    const [isSupport, setIsSupport] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/learning/posts/me/');
            setPosts(response.data);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/learning/posts/create/', {
                topic_to_learn: newLearn,
                topic_to_teach: isSupport ? '' : newTeach,
                learning_only_flag: isSupport
            });
            setNewLearn('');
            setNewTeach('');
            setShowCreate(false);
            fetchMyPosts();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to create post");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout title="Dashboard">
            <div className="space-y-8">

                {/* Welcome Header */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20">
                    <h2 className="text-3xl font-bold mb-2">Hello, {user?.name}!</h2>
                    <p className="text-blue-100 opacity-90 max-w-xl">
                        Ready to share or gain some knowledge today? You have {user?.wallet?.balance || 0} credits available.
                    </p>
                </section>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-medium uppercase">Active Requests</p><p className="text-xl font-bold text-slate-900">{posts.length}</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-medium uppercase">Pending Sessions</p><p className="text-xl font-bold text-slate-900">0</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-medium uppercase">Hours Shared</p><p className="text-xl font-bold text-slate-900">0</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={20} /></div>
                        <div><p className="text-xs text-slate-500 font-medium uppercase">Reputation</p><p className="text-xl font-bold text-slate-900">N/A</p></div>
                    </div>
                </div>

                {/* Requests & Creation Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* My Learning Requests */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <BookOpen size={22} className="text-blue-600" />
                                My Learning Needs
                            </h3>
                            <button
                                onClick={() => setShowCreate(!showCreate)}
                                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition py-1 px-3 rounded-lg border border-blue-100"
                            >
                                {showCreate ? 'Cancel' : '+ New Request'}
                            </button>
                        </div>

                        {showCreate && (
                            <form onSubmit={handleCreatePost} className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">I want to learn...</label>
                                        <input
                                            required
                                            value={newLearn}
                                            onChange={(e) => setNewLearn(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                            placeholder="e.g. Italian"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">I can teach...</label>
                                        <input
                                            disabled={isSupport}
                                            value={newTeach}
                                            onChange={(e) => setNewTeach(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition disabled:opacity-50"
                                            placeholder="e.g. Physics"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" checked={isSupport} onChange={(e) => setIsSupport(e.target.checked)} className="rounded text-blue-600 border-slate-300" />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">I need support (no trade)</span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Posting...' : 'Post Request'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="py-20 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div></div>
                            ) : posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${post.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                                                {post.status}
                                            </span>
                                            <span className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">Learn: {post.topic_to_learn}</h4>
                                        {post.topic_to_teach && <p className="text-sm text-slate-500 italic">Teach: {post.topic_to_teach}</p>}
                                        {post.learning_only_flag && <p className="text-xs text-purple-600 font-semibold mt-2">Support Request</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400">
                                    <p>You haven't posted any learning requests yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recommendations or Activity Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">Quick Tips</h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 grow-0 shrink-0"></div> Teaching 1 hour earns you 1 credit.</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 grow-0 shrink-0"></div> Learning 1 hour costs 1 credit.</li>
                                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 grow-0 shrink-0"></div> Support requests are tax-funded.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
