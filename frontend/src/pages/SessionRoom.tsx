import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore';
import Whiteboard from '../components/Whiteboard';
import VideoPanel from '../components/VideoPanel';
import { Video, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';


const SessionRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        isActive,
        duration,
        isVideoEnabled,
        startSession,
        endSession,
        incrementDuration,
        toggleVideo
    } = useSessionStore();

    useEffect(() => {
        if (id) {
            startSession(id);
        }
        return () => endSession();
    }, [id, startSession, endSession]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                incrementDuration();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, incrementDuration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndSession = () => {
        if (window.confirm("End session? Credits will be calculated.")) {
            endSession();
            // Here we would call API to finalize transaction
            navigate('/dashboard'); // Summary page later
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
            {/* Top Bar */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-slate-700">Link & Learn Session</h2>
                    <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {isActive ? 'LIVE' : 'ENDED'}
                    </div>
                    <div className="text-xl font-mono font-medium text-slate-800 tabular-nums">
                        {formatTime(duration)}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleVideo}
                        className={`p-2 rounded-full transition-colors ${isVideoEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        title={isVideoEnabled ? "Turn Video Off" : "Turn Video On"}
                    >
                        {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    <button
                        onClick={handleEndSession}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition active:scale-95 shadow-md shadow-red-600/20"
                    >
                        <PhoneOff size={16} /> End Session
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Whiteboard (Main) */}
                <div className="flex-1 p-4 relative">
                    <Whiteboard />
                </div>

                {/* Right: Sidebar (Video/Chat) */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
                    {/* Video Area (30% height typically, or fixed aspect) */}
                    <div className="aspect-video bg-slate-900 p-2">
                        {isVideoEnabled ? (
                            <VideoPanel />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
                                <VideoOff size={24} />
                                <span>Video Off</span>
                            </div>
                        )}
                    </div>

                    {/* Chat Area (Remaining) */}
                    <div className="flex-1 flex flex-col border-t border-slate-200">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 font-semibold text-xs text-slate-500 uppercase flex items-center gap-2">
                            <MessageSquare size={14} /> Session Chat
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {/* Mock Chat Messages */}
                            <div className="bg-slate-100 p-2 rounded-lg rounded-tl-none self-start max-w-[85%] text-sm text-slate-700">
                                Hello! Ready to start?
                            </div>
                            <div className="bg-indigo-50 text-indigo-900 p-2 rounded-lg rounded-tr-none self-end max-w-[85%] text-sm ml-auto">
                                Yes, let's go over the problem.
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-3 border-t border-slate-200">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SessionRoom;
