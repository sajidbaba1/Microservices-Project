"use client";

import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, Globe, Github } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 border-b border-white/10 glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">E</div>
          <span className="text-xl font-bold tracking-tight">Eurusys</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition">Sign In</Link>
          <Link href="/auth/register" className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            Microservices <span className="gradient-text">Observable.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            A high-performance ecosystem built with Kafka, ClickHouse, and Postgres.
            Monitor events, manage users, and scale with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition">
              View Dashboard
            </Link>
            <Link href="/docs" className="glass px-8 py-3 rounded-full font-bold hover:bg-white/10 transition">
              Read Docs
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 mb-20 text-left">
          <div className="glass p-8 rounded-3xl">
            <Shield className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Secure Auth</h3>
            <p className="text-slate-400">JWT-based authentication with bcrypt hashing and user event auditing.</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <Zap className="text-yellow-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Real-time Kafka</h3>
            <p className="text-slate-400">Sub-millisecond event streaming between services using Confluent Kafka.</p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <BarChart3 className="text-purple-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">OLAP Analytics</h3>
            <p className="text-slate-400">Billions of rows processed instantly via ClickHouse column-store engine.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Eurusys Project. Built with a QA First Mindset.</p>
      </footer>
    </div>
  );
}
