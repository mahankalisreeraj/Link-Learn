import React, { useState, useEffect } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import { useAuthStore } from '../store/useAuthStore';
import { Wallet, Heart, HandCoins, AlertCircle } from 'lucide-react';

const BankSidebar: React.FC = () => {
    const { user } = useAuthStore();
    const {
        balance,
        isEligibleForSupport,
        supportAmount,
        cooldownMessage,
        checkEligibility,
        claimSupport,
        donate,
        isLoading
    } = useWalletStore();

    const [donateAmount, setDonateAmount] = useState('');

    useEffect(() => {
        if (user) {
            checkEligibility();
            // Also need to fetch balance logic. 
            // For now, balance might be 0 until we wire up 'me' endpoint properly.
        }
    }, [user, checkEligibility]);

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(donateAmount);
        if (!isNaN(amount) && amount > 0) {
            await donate(amount);
            setDonateAmount('');
        }
    };

    if (!user) return null;

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 pt-16 hidden md:flex flex-col overflow-y-auto z-10">
            <div className="p-6">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Economy
                </h2>

                {/* Balance Card */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/20 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="relative z-10 flex flex-col">
                        <span className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                            <Wallet size={16} /> Current Balance
                        </span>
                        <span className="text-4xl font-bold tracking-tight">
                            {balance} <span className="text-lg font-normal text-slate-500">cr</span>
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-6">

                    {/* Support Grant */}
                    <div className={`p-4 rounded-xl border-2 ${isEligibleForSupport ? 'border-indigo-100 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'} transition-all`}>
                        <div className="flex items-center gap-2 mb-3">
                            <HandCoins className={`w-5 h-5 ${isEligibleForSupport ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <h3 className={`font-bold ${isEligibleForSupport ? 'text-indigo-900' : 'text-slate-500'}`}>
                                Support Grant
                            </h3>
                        </div>

                        {isEligibleForSupport ? (
                            <div>
                                <p className="text-sm text-indigo-700 mb-3">
                                    You are eligible for <span className="font-bold">{supportAmount} credits</span>.
                                </p>
                                <button
                                    onClick={() => claimSupport()}
                                    disabled={isLoading}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                                >
                                    {isLoading ? 'Claiming...' : 'Claim Credits'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">
                                <p className="mb-2">Not eligible currently.</p>
                                {cooldownMessage && (
                                    <div className="flex items-start gap-2 text-xs bg-white p-2 rounded border border-slate-200 text-slate-600">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                        <span>{cooldownMessage}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Donate */}
                    <div className="p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-slate-700">
                            <Heart size={18} className="text-rose-500" />
                            <h3 className="font-bold text-sm">Donate to Bank</h3>
                        </div>
                        <form onSubmit={handleDonate}>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={donateAmount}
                                    onChange={(e) => setDonateAmount(e.target.value)}
                                    placeholder="Amt"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !donateAmount}
                                    className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                                >
                                    Give
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Helps sustain the system.
                            </p>
                        </form>
                    </div>

                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-auto p-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                    Automatic payouts every session.
                </p>
            </div>
        </aside>
    );
};

export default BankSidebar;
