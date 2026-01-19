"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { Users, LogIn, Activity, AlertCircle, RefreshCcw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function DashboardPage() {
    const { data: analyticsData, loading, refresh } = useAnalytics();
    const [timelineData, setTimelineData] = useState([
        { time: '09:00', events: 40 },
        { time: '10:00', events: 70 },
        { time: '11:00', events: 120 },
        { time: '12:00', events: 90 },
        { time: '13:00', events: 150 },
    ]);

    // Transform raw ClickHouse counters into chart-friendly data
    // Logic: converts [{event_type: 'user-login', count: 5}] -> [{name: 'Login', count: 5}]
    const barChartData = (analyticsData || []).map((item: any) => ({
        name: item.event_type === 'user-login' ? 'Login' : item.event_type === 'user-registered' ? 'Register' : item.event_type,
        count: parseInt(item.count)
    }));

    // Summarize KPI totals
    const totalUsers = barChartData.find(d => d.name === 'Register')?.count || 0;
    const todayLogins = barChartData.find(d => d.name === 'Login')?.count || 0;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">System Overview</h1>
                    <p className="text-slate-400">Real-time metrics from ClickHouse & Kafka</p>
                </div>
                <button
                    onClick={refresh}
                    className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:bg-white/5 transition"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                    Refresh
                </button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard icon={<Users size={20} />} label="Total Users" value={totalUsers.toLocaleString()} trend="+12%" color="blue" />
                <KpiCard icon={<LogIn size={20} />} label="Today's Logins" value={todayLogins.toLocaleString()} trend="+5%" color="green" />
                <KpiCard icon={<Activity size={20} />} label="Kafka Events" value={(totalUsers + todayLogins).toLocaleString()} trend="+24%" color="purple" />
                <KpiCard icon={<AlertCircle size={20} />} label="System Errors" value="0" trend="0%" color="red" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[2rem]">
                    <h3 className="text-xl font-bold mb-6">Event Distribution</h3>
                    {loading && !barChartData.length ? (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">Loading Analytics...</div>
                    ) : (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="glass p-8 rounded-[2rem]">
                    <h3 className="text-xl font-bold mb-6">Real-time Traffic (Hourly)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="time" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Area type="monotone" dataKey="events" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ icon, label, value, trend, color }: any) {
    const colorMap: any = {
        blue: 'bg-blue-500/10 text-blue-500',
        green: 'bg-emerald-500/10 text-emerald-500',
        purple: 'bg-indigo-500/10 text-indigo-500',
        red: 'bg-red-500/10 text-red-500',
    };

    return (
        <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-[2rem]">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
                {icon}
            </div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <div className="flex items-end gap-3 mt-1">
                <h4 className="text-2xl font-black tracking-tight">{value}</h4>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">{trend}</span>
            </div>
        </motion.div>
    );
}
