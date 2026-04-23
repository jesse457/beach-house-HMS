import React from 'react';
import { Head, Link } from '@inertiajs/react';

// 1. Define robust interfaces for your data
interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    user: User;
}

// 2. Use React.FC or standard function with type annotations
export default function Show({ user }: Props) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased">
            <Head title="Dashboard" />

            {/* --- TOP NAVIGATION --- */}
            <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">FocusApp</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex gap-4">
                                <Link href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Overview</Link>
                                <Link href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Analytics</Link>
                            </div>

                            <div className="h-6 w-px bg-slate-200" />

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">Administrator</p>
                                </div>
                                <button className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                                    {user.name.charAt(0)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- MAIN PAGE CONTENT --- */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Good morning, {user.name.split(' ')[0]} 👋
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Here’s what’s happening with your projects today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
                        >
                            Sign out
                        </Link>
                        <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                            + New Project
                        </button>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Active Tasks', value: '24', change: '+12%', icon: '🚀' },
                        { label: 'Hours Tracked', value: '164.5', change: '+8%', icon: '⏱️' },
                        { label: 'Success Rate', value: '98%', change: '+2%', icon: '📈' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    {stat.change}
                             </span>
                            </div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Content Area Placeholder */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center border-dashed border-2">
                   <div className="text-center">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        <h3 className="text-slate-900 font-semibold">No recent activity</h3>
                        <p className="text-slate-500 text-sm mt-1">Start by creating your first task or project.</p>
                   </div>
                </div>

            </main>
        </div>
    );
}
