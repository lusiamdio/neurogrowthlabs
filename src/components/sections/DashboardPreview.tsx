import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, LineChart, Globe, GitBranch, Cpu, Terminal, Database, Shield, Zap, Server } from 'lucide-react';

export default function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'topology' | 'logs'>('metrics');

  const [logs, setLogs] = useState([
    "[SYSTEM] Quantum orchestration initialized",
    "[WARN] Traffic spike on Node Alpha - 2M req/s",
    "[INFO] Allocating additional neural capacity...",
    "[SUCCESS] Neural mesh synced globally",
  ]);

  useEffect(() => {
    if (activeTab === 'logs') {
      const interval = setInterval(() => {
        setLogs(prev => [
          ...prev.slice(-3),
          `[${new Date().toISOString().split('T')[1].slice(0, 8)}] Edge synchronization complete - Latency 1.${Math.floor(Math.random() * 9)}ms`
        ]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <section className="py-32 px-6 bg-midnight-black relative overflow-hidden border-t border-glass-border">
      
      {/* Decorative Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-electric-blue/10 blur-[150px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-glow/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-cyan/10 border border-ai-cyan/20 text-ai-cyan text-sm tracking-wide font-mono mb-4">
            <Zap className="w-4 h-4" />
            V8.4 Core Deployed
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Command Center Visualization
          </h2>
          <p className="text-quantum-silver text-lg max-w-2xl mx-auto">
            Experience our unified command interface, engineered to distill billions of data points into actionable institutional intelligence.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl mx-auto rounded-xl sm:rounded-3xl border border-glass-border bg-graphite-grey/40 backdrop-blur-2xl shadow-[0_0_80px_rgba(37,99,235,0.15)] overflow-hidden"
        >
          {/* Mac-style Window Header */}
          <div className="h-14 border-b border-glass-border flex items-center px-6 gap-2 bg-gradient-to-b from-white/10 to-transparent">
             <div className="flex gap-2 w-20">
               <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
               <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
               <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             </div>
             
             <div className="flex-1 flex justify-center">
               <div className="flex bg-midnight-black/60 rounded-xl p-1 border border-glass-border gap-1">
                 <button onClick={() => setActiveTab('metrics')} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'metrics' ? 'bg-electric-blue/20 text-ai-cyan' : 'text-quantum-silver hover:text-white'}`}>Metrics</button>
                 <button onClick={() => setActiveTab('topology')} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'topology' ? 'bg-electric-blue/20 text-ai-cyan' : 'text-quantum-silver hover:text-white'}`}>Topology</button>
                 <button onClick={() => setActiveTab('logs')} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${activeTab === 'logs' ? 'bg-electric-blue/20 text-ai-cyan' : 'text-quantum-silver hover:text-white'}`}>System Logs</button>
               </div>
             </div>
             <div className="w-20 flex justify-end">
                <Shield className="w-4 h-4 text-ai-cyan" />
             </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[450px]">
            
            {/* Sidebar / Left Col */}
            <div className="flex flex-col gap-6 lg:col-span-1">
               <div className="bg-midnight-black/50 border border-glass-border rounded-2xl p-5 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-ai-cyan to-transparent" />
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-xs font-mono text-quantum-silver uppercase">Core Load</span>
                     <Activity className="w-4 h-4 text-ai-cyan" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-3 tracking-tighter">78<span className="text-lg text-quantum-silver">%</span></div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ duration: 1, ease: 'easeOut' }}
                       className="h-full bg-gradient-to-r from-ai-cyan to-electric-blue"
                     />
                  </div>
               </div>

               <div className="bg-midnight-black/50 border border-glass-border rounded-2xl p-5 relative">
                  <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-violet-glow to-transparent" />
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-xs font-mono text-quantum-silver uppercase">Active Nodes</span>
                     <Server className="w-4 h-4 text-violet-glow" />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tighter mb-4">2,604</div>
                  <div className="flex gap-1 h-10 items-end">
                     {[40, 60, 45, 80, 50, 90, 70, 85].map((height, i) => (
                       <motion.div 
                         key={i}
                         initial={{ height: 0 }}
                         animate={{ height: `${height}%` }}
                         transition={{ duration: 0.5, delay: 0.2 + (i * 0.05) }}
                         className="flex-1 bg-violet-glow/60 rounded-t-sm"
                       />
                     ))}
                  </div>
               </div>

               <div className="bg-midnight-black/50 border border-glass-border rounded-2xl p-5">
                  <div className="flex gap-4 items-center">
                    <Database className="w-8 h-8 text-electric-blue p-1.5 bg-electric-blue/10 rounded-lg" />
                    <div>
                      <div className="text-xs font-mono text-quantum-silver uppercase mb-1">Total Throughput</div>
                      <div className="text-xl font-bold text-white">4.82 PB/s</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Main Area */}
            <div className="lg:col-span-3 bg-midnight-black/40 border border-glass-border rounded-2xl p-6 relative overflow-hidden flex flex-col">
               
               {activeTab === 'metrics' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                         <span className="text-xs font-mono text-quantum-silver uppercase tracking-wider block mb-2">Neural Prediction Accuracy</span>
                         <span className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-ai-cyan to-white">99.98%</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-ai-cyan/10 border border-ai-cyan/20 text-ai-cyan text-xs font-mono">LIVE</span>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">+0.02%</span>
                      </div>
                   </div>
                   
                   {/* Cool Chart Visualization */}
                   <div className="relative flex-1 w-full min-h-[250px] flex items-end justify-center border-b border-l border-white/5">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                      
                      <svg className="w-full h-full overflow-visible absolute bottom-0 z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <motion.path 
                           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}
                           d="M0,80 Q10,75 20,60 T40,40 T60,50 T80,20 T100,5"
                           fill="none" stroke="url(#lineGrad)" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                        />
                        <motion.path 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.5 }}
                           d="M0,80 Q10,75 20,60 T40,40 T60,50 T80,20 T100,5 L100,100 L0,100 Z"
                           fill="url(#fillGrad)" className="opacity-30"
                        />
                        
                        {/* Data Points */}
                        {[ {x:20, y:60}, {x:40, y:40}, {x:60, y:50}, {x:80, y:20} ].map((pt, i) => (
                           <motion.circle 
                             key={i} cx={pt.x} cy={pt.y} r="1.5" fill="#00E5FF" 
                             initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 + i * 0.2 }}
                             className="drop-shadow-[0_0_4px_rgba(0,229,255,1)]"
                           />
                        ))}

                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#2563EB" />
                            <stop offset="50%" stopColor="#00E5FF" />
                            <stop offset="100%" stopColor="#7B61FF" />
                          </linearGradient>
                          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="var(--color-midnight-black)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                   </div>
                   <div className="flex justify-between w-full mt-4 text-[10px] text-quantum-silver font-mono uppercase">
                     <span>T-60m</span>
                     <span>T-45m</span>
                     <span>T-30m</span>
                     <span>T-15m</span>
                     <span>Now</span>
                   </div>
                 </motion.div>
               )}

               {activeTab === 'topology' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center relative">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,97,255,0.1)_0%,transparent_70%)] pointer-events-none" />
                   
                   {/* Simplified Server Topology */}
                   <div className="relative w-full max-w-md aspect-video">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-ai-cyan/30 flex items-center justify-center bg-midnight-black z-20">
                       <GitBranch className="w-8 h-8 text-ai-cyan animate-pulse" />
                     </div>
                     
                     {/* Orbital rings */}
                     <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-dashed border-white/10 z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-violet-glow rounded-full shadow-[0_0_10px_#7B61FF]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-electric-blue rounded-full shadow-[0_0_10px_#00E5FF]" />
                     </motion.div>
                     
                     <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/5 z-0">
                        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-ai-cyan rounded-full shadow-[0_0_10px_#00FFFF]" />
                        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full shadow-[0_0_10px_#F87171]" />
                     </motion.div>
                   </div>
                   
                   <div className="absolute bottom-0 text-center w-full pb-4">
                     <p className="text-xs font-mono text-quantum-silver uppercase tracking-widest bg-black/40 inline-px-3 py-1 rounded">Mesh Router Active</p>
                   </div>
                 </motion.div>
               )}

               {activeTab === 'logs' && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col font-mono text-xs sm:text-sm">
                   <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                     <Terminal className="w-5 h-5 text-ai-cyan" />
                     <span className="text-quantum-silver uppercase tracking-wider">System Terminal</span>
                   </div>
                   
                   <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                     {logs.map((log, i) => (
                       <motion.div 
                         key={log + i} 
                         initial={{ opacity: 0, x: -10 }} 
                         animate={{ opacity: 1, x: 0 }} 
                         className="flex gap-4 px-3 py-2 bg-white/5 border border-white/5 rounded text-quantum-silver hover:bg-white/10 transition-colors"
                       >
                         <span className="text-electric-blue shrink-0">~</span>
                         <span className={log.includes('[SUCCESS]') || log.includes('complete') ? 'text-green-400' : log.includes('[WARN]') ? 'text-yellow-400' : 'text-quantum-silver'}>
                           {log}
                         </span>
                       </motion.div>
                     ))}
                     <div className="flex gap-4 px-3 py-2 items-center">
                        <span className="text-electric-blue">~</span>
                        <div className="w-2 h-4 bg-white/50 animate-pulse" />
                     </div>
                   </div>
                 </motion.div>
               )}

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
