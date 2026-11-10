import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { Network, Search, Filter, Download, MoreHorizontal, CheckCircle2, XCircle, Clock, ShieldCheck, Activity, BarChart3, TrendingUp, Users } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

const candidates = [
  { id: 'C-8802', name: 'Zainab Ahmed', role: 'Lead AI Engineer', score: 98, status: 'Interview', match: 'A+', date: 'Just now' },
  { id: 'C-8801', name: 'David Okafor', role: 'Enterprise Product Manager', score: 92, status: 'Reviewing', match: 'A', date: '2 hrs ago' },
  { id: 'C-8799', name: 'Sarah Mensah', role: 'Cybersecurity Analyst', score: 85, status: 'Reviewing', match: 'B+', date: '5 hrs ago' },
  { id: 'C-8798', name: 'Kabo Dlamini', role: 'Frontend Architect', score: 95, status: 'Interview', match: 'A', date: '1 day ago' },
  { id: 'C-8795', name: 'Amira Hassan', role: 'Quantitative Analyst', score: 78, status: 'Archived', match: 'C', date: '2 days ago' },
];

export default function AdminDashboard() {
  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white pb-20">
      <Navbar />

      <main className="pt-32 px-6 h-full min-h-screen relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-8">
           
           {/* Header */}
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-glass-border pb-6">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-xs tracking-widest font-mono uppercase mb-4">
                    <Activity className="w-3 h-3" /> Core OS Dashboard
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-tight">Recruitment Intelligence</h1>
                 <p className="text-sm text-quantum-silver mt-1">Live AI analytics and candidate pipeline overview.</p>
              </div>

              <div className="flex items-center gap-3">
                 <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                 </button>
                 <MagneticButton className="px-4 py-2 rounded-lg bg-electric-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors">
                    System Settings
                 </MagneticButton>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard title="Active Pipeline" value="1,248" trend="+12%" icon={<Users className="w-5 h-5 text-ai-cyan" />} />
              <MetricCard title="AI Selected (Top 5%)" value="64" trend="+3%" icon={<ShieldCheck className="w-5 h-5 text-green-400" />} />
              <MetricCard title="Processing Latency" value="1.2s" trend="-0.4s" icon={<Activity className="w-5 h-5 text-violet-glow" />} />
              <MetricCard title="Hiring Velocity" value="8 days" trend="-2 days" icon={<TrendingUp className="w-5 h-5 text-electric-blue" />} />
           </div>

           {/* Main Content Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              
              {/* Candidate Pipeline */}
              <div className="lg:col-span-2 bg-graphite-grey/40 backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                 <div className="p-6 border-b border-glass-border flex justify-between items-center bg-white/5">
                    <h3 className="text-lg font-bold text-white">Candidates Evaluated</h3>
                    <div className="flex gap-2">
                       <div className="relative">
                          <Search className="w-4 h-4 text-quantum-silver absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="text" placeholder="Search ID or Name" className="bg-midnight-black/40 border border-glass-border rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:border-ai-cyan/50 outline-none w-48 transition-colors" />
                       </div>
                       <button className="w-8 h-8 rounded-lg border border-glass-border bg-midnight-black/40 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Filter className="w-4 h-4 text-quantum-silver" />
                       </button>
                    </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="border-b border-glass-border text-xs text-quantum-silver font-mono uppercase tracking-wider bg-midnight-black/20">
                             <th className="p-4 font-medium">Candidate</th>
                             <th className="p-4 font-medium">Applied Role</th>
                             <th className="p-4 font-medium">AI Score</th>
                             <th className="p-4 font-medium">Status</th>
                             <th className="p-4 font-medium">Timestamp</th>
                             <th className="p-4 font-medium text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          {candidates.map((c, i) => (
                             <tr key={i} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ai-cyan/20 to-electric-blue/20 border border-electric-blue/30 flex items-center justify-center text-xs text-white font-bold uppercase">
                                         {c.name.split(' ').map(n => n[0]).join('')}
                                      </div>
                                      <div>
                                         <div className="text-sm font-medium text-white">{c.name}</div>
                                         <div className="text-xs text-quantum-silver font-mono">{c.id}</div>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-4 text-sm text-slate-300">{c.role}</td>
                                <td className="p-4">
                                   <div className="flex items-center gap-2">
                                      <div className="text-sm font-bold text-white">{c.score}%</div>
                                      <div className={`text-xs px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                                         c.match === 'A+' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                         c.match === 'A' ? 'bg-ai-cyan/10 text-ai-cyan border border-ai-cyan/20' :
                                         'bg-white/5 border border-white/10 text-quantum-silver'
                                      }`}>
                                         {c.match}
                                      </div>
                                   </div>
                                </td>
                                <td className="p-4 text-sm">
                                   {c.status === 'Interview' && <span className="flex items-center gap-1.5 text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> High Priority</span>}
                                   {c.status === 'Reviewing' && <span className="flex items-center gap-1.5 text-electric-blue"><Clock className="w-3.5 h-3.5" /> Pending HR</span>}
                                   {c.status === 'Archived' && <span className="flex items-center gap-1.5 text-quantum-silver"><XCircle className="w-3.5 h-3.5" /> Archived</span>}
                                </td>
                                <td className="p-4 text-xs text-quantum-silver">{c.date}</td>
                                <td className="p-4 text-right">
                                   <button className="text-quantum-silver hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1">
                                      <MoreHorizontal className="w-5 h-5" />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* AI Insights Panel */}
              <div className="flex flex-col gap-6">
                 <div className="bg-graphite-grey/40 backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-ai-cyan/5 to-transparent pointer-events-none" />
                    <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-2">
                       <Network className="w-5 h-5 text-ai-cyan" /> Neural Network Feed
                    </h3>

                    <div className="space-y-4 relative z-10">
                       <InsightRow title="Anomaly Detected" desc="Surge in Quantum Engineering applications (A+ tier) originating from Nairobi hub." time="10 min ago" type="alert" />
                       <InsightRow title="Algorithm Update" desc="Cognitive assessment bias threshold recalibrated to v2.4.9 successfully." time="An hour ago" type="system" />
                       <InsightRow title="Model Optimization" desc="Time-to-hire prediction accuracy increased to 96.4%." time="3 hours ago" type="success" />
                    </div>
                 </div>

                 <div className="bg-graphite-grey/40 backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Competency Distribution</h3>
                    <div className="flex items-end gap-2 h-40 bg-midnight-black/30 border border-glass-border rounded-xl p-4">
                       {/* Placeholder Chart */}
                       {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-electric-blue/20 to-ai-cyan/80 rounded-sm hover:brightness-125 transition-all" style={{ height: `${h * 100}%` }} />
                       ))}
                    </div>
                    <div className="flex justify-between text-xs text-quantum-silver mt-2 font-mono uppercase tracking-wider">
                       <span>Tech</span>
                       <span>Strategy</span>
                       <span>Ops</span>
                       <span>Prod</span>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </main>
      <Footer />

    </div>
  );
}

function MetricCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
   return (
      <div className="bg-graphite-grey/40 backdrop-blur-md border border-glass-border rounded-2xl p-5 hover:border-white/20 transition-colors">
         <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
               {icon}
            </div>
            <div className={`text-xs font-mono font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-quantum-silver'}`}>
               {trend}
            </div>
         </div>
         <div className="text-sm text-quantum-silver font-medium mb-1">{title}</div>
         <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      </div>
   );
}

function InsightRow({ title, desc, time, type }: { title: string, desc: string, time: string, type: string }) {
   return (
      <div className="flex gap-3">
         <div className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-ai-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
         <div>
            <div className="text-sm font-bold text-white">{title}</div>
            <div className="text-xs text-quantum-silver mt-0.5 leading-relaxed">{desc}</div>
            <div className="text-[10px] text-quantum-silver/70 font-mono mt-1">{time}</div>
         </div>
      </div>
   );
}
