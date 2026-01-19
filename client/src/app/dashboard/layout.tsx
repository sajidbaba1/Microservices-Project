"use client";

import { LayoutDashboard, Users, Settings, Database, Server, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Overview", href: "/dashboard" },
        { icon: <Users size={20} />, label: "Users", href: "/dashboard/users" },
        { icon: <Database size={20} />, label: "Analytics", href: "/dashboard/analytics" },
        { icon: <Server size={20} />, label: "Infrastructure", href: "/dashboard/infra" },
        { icon: <Settings size={20} />, label: "Settings", href: "/dashboard/settings" },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 glass hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-6 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">E</div>
                    <span className="text-xl font-bold tracking-tight text-white">Eurusys</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Header */}
                <header className="h-16 border-b border-white/10 glass flex items-center justify-end px-8 gap-6 sticky top-0 z-40">
                    <button className="text-slate-400 hover:text-white transition relative">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020617]"></span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-white">Project Admin</p>
                            <p className="text-[10px] text-slate-500">eurusys-core</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20"></div>
                    </div>
                </header>

                <div className="pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
