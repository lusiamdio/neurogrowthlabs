import React from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Database, Cpu } from 'lucide-react';
import DataCenter from '../three/DataCenter';

export default function AILabSection() {
  return (
    <section id="infrastructure" className="relative py-32 px-6 bg-midnight-black overflow-hidden border-t border-glass-border min-h-[100vh] flex items-center">
      
      {/* 3D Data Center Background */}
      <div className="absolute inset-0 z-0 opacity-50">
        <DataCenter />
      </div>
      
      {/* Overlay controls/analytics UI */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 items-center justify-between">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:w-1/2 p-10 bg-midnight-black/60 backdrop-blur-xl border border-glass-border rounded-3xl"
        >
          <div className="text-ai-cyan font-mono text-sm tracking-wider uppercase mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" /> Global Intelligence Network
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            Advanced Compute & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-violet-glow">Neural Infrastructure</span>
          </h2>
          <p className="text-quantum-silver text-lg leading-relaxed mb-8">
            Our 3D visualizer maps real-time data flow across our distributed compute clusters. 
            We architect self-healing, quantum-resilient infrastructure capable of orchestrating billions of neural parameters.
          </p>

          <div className="grid grid-cols-2 gap-6">
             <div className="border border-glass-border p-4 rounded-xl bg-white/5">
                <Database className="w-6 h-6 text-electric-blue mb-2" />
                <div className="text-2xl font-bold text-white mb-1">100+ PB</div>
                <div className="text-xs text-quantum-silver uppercase tracking-wider">Storage Capacity</div>
             </div>
             <div className="border border-glass-border p-4 rounded-xl bg-white/5">
                <Cpu className="w-6 h-6 text-violet-glow mb-2" />
                <div className="text-2xl font-bold text-white mb-1">99.999%</div>
                <div className="text-xs text-quantum-silver uppercase tracking-wider">Cluster Uptime</div>
             </div>
          </div>
        </motion.div>

        {/* Live Terminal Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="lg:w-1/3 w-full"
        >
          <div className="bg-graphite-grey/80 backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center px-4 py-3 bg-midnight-black/50 border-b border-glass-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto text-xs font-mono text-quantum-silver flex items-center gap-2">
                 <Activity className="w-3 h-3 text-ai-cyan" /> NODE_STATUS
              </div>
            </div>
            <div className="p-6 font-mono text-xs text-ai-cyan/80 min-h-[300px] flex flex-col gap-2">
               <p className="text-green-400">root@neurogrowth-cluster-01:~# tail -f /var/log/neural.sys</p>
               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-quantum-silver">[2026.05.25] INFO: Initializing tensor parallelization...</motion.p>
               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="text-quantum-silver">[2026.05.25] SUCCESS: Memory allocated across 4096 nodes</motion.p>
               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="text-violet-glow glow-text">[2026.05.25] SYNC: Quantum state preservation active.</motion.p>
               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }} className="animate-pulse-slow">Awaiting further instructions_</motion.p>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
