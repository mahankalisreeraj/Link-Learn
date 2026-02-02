import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { User, Star, Search, MapPin } from 'lucide-react';

interface DiscoveryPost {
    id: number;
    creator: number;
    creator_name: string;
    topic_to_learn: string;
    topic_to_teach: string;
    learning_only_flag: boolean;
    bounty_mode: boolean;
    status: string;
    timestamp: string;
}

const Discovery: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<DiscoveryPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/learning/discovery/?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (err) {
                console.error("Discovery failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <Layout title="Discover Mentors">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Search Header */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <Search className="text-slate-400" />
                    <input
                        type="text"
                        readOnly
                        value={query}
                        className="flex-grow bg-transparent outline-none text-lg font-medium text-slate-800"
                        placeholder="Search results..."
                    />
                </div>

                {/* Results List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : results.length > 0 ? (
                        results.map(post => (
                            <div key={post.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                    <User size={32} />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-900">{post.creator_name}</h3>
                                        {post.learning_only_flag && (
                                            <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                                Support Request
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-700 font-medium">
                                            Wants to learn: <span className="text-blue-600 font-bold">{post.topic_to_learn}</span>
                                        </p>
                                        {post.topic_to_teach && (
                                            <p className="text-slate-500 text-sm">
                                                Can teach: <span className="text-indigo-500 font-medium">{post.topic_to_teach}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    to={`/profile/${post.creator}`}
                                    className="bg-slate-900 shadow-lg shadow-slate-900/10 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition whitespace-nowrap"
                                >
                                    View Profile
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                            <p className="text-slate-500 text-lg">No mentors found for "{query}"</p>
                            <Link to="/" className="text-blue-600 font-bold mt-4 inline-block">Try a different search</Link>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Discovery;
