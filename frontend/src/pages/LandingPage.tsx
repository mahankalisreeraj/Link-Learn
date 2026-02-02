import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const [learnQuery, setLearnQuery] = useState('');
    const [teachQuery, setTeachQuery] = useState('');
    const [justLearning, setJustLearning] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!learnQuery.trim()) return;

        console.log("Searching for:", { learnQuery, teachQuery, justLearning });
        navigate(`/discovery?q=${encodeURIComponent(learnQuery)}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Navbar Placeholder */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-50">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Link & Learn
                </div>
                <div className="space-x-4">
                    <button
                        onClick={() => {
                            console.log("Navigating to login");
                            navigate('/login');
                        }}
                        className="text-slate-600 font-medium hover:text-blue-600 transition p-2"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => {
                            console.log("Navigating to signup");
                            navigate('/signup');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 -mt-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Exchange Time, <span className="text-blue-600">Share Skills.</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                        A peer-to-peer learning platform where your time is the currency. Teach what you know, learn what you don't.
                    </p>
                </div>

                {/* Search Box */}
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100">
                    <form onSubmit={handleSearch} className="space-y-4">

                        {/* Learn Input */}
                        <div className="group">
                            <label htmlFor="learn" className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
                                What do you want to learn? <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="learn"
                                    type="text"
                                    required
                                    value={learnQuery}
                                    onChange={(e) => setLearnQuery(e.target.value)}
                                    placeholder="e.g. React, Guitar, Spanish..."
                                    className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-lg text-slate-800 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Teach Input & Checkbox */}
                        <div className={`transition-all duration-300 ease-in-out ${justLearning ? 'opacity-50 grayscale select-none' : 'opacity-100'}`}>
                            <label htmlFor="teach" className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
                                What can you teach? <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="teach"
                                type="text"
                                disabled={justLearning}
                                value={teachQuery}
                                onChange={(e) => setTeachQuery(e.target.value)}
                                placeholder="e.g. Photoshop, Math, Coding..."
                                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-lg text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Checkbox and Button Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={justLearning}
                                        onChange={(e) => setJustLearning(e.target.checked)}
                                        className="checkbox-input peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                                    <svg className="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-slate-600 font-medium group-hover:text-slate-800 transition-colors select-none">
                                    I'm generic student (just learning)
                                </span>
                            </label>

                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                            >
                                Start Learning
                            </button>
                        </div>

                    </form>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-6 text-center text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Link & Learn. Time is currency.
            </footer>
        </div>
    );
};

export default LandingPage;
