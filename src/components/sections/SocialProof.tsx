import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Network, Globe, Lock, Shield } from 'lucide-react';

const partners = [
  { icon: Wallet, name: "Fintech Infrastructure" },
  { icon: Network, name: "Pan-African Infrastructure" },
  { icon: Globe, name: "Intra Trade & Global Trade" },
  { icon: Lock, name: "Cybersecurity" },
  { icon: Shield, name: "Defense and Disaster Response" },
];

export default function SocialProofSection() {
  return (
    <section className="py-24 px-6 bg-midnight-black border-t border-glass-border overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        
        <div className="lg:w-1/3">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
           >
             <div className="inline-block px-3 py-1 rounded-full bg-violet-glow/10 border border-violet-glow/20 text-violet-glow text-xs font-mono uppercase tracking-widest mb-4">
               Trust & Scale
             </div>
             <h2 className="text-3xl font-bold text-white mb-4">
               We build Infrastructure Ecosystem
             </h2>
             <p className="text-quantum-silver text-sm leading-relaxed">
               Our highly qualified executives are open to provide high value technological capacity programs, advisory and AI infrastructure projects development for governments, national-scale institutions, and elite enterprises with AI powered intelligent decision making and automation ecosystem.
             </p>
           </motion.div>
        </div>

        <div className="lg:w-2/3 w-full">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {partners.map((partner, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl bg-glass-white/5 border border-glass-border hover:border-violet-glow/30 transition-all group"
                >
                   <partner.icon className="w-10 h-10 text-violet-glow group-hover:scale-110 transition-transform" />
                   <span className="text-sm font-semibold text-white text-center">{partner.name}</span>
                </motion.div>
              ))}
           </div>
        </div>

      </div>
    </section>
  );
}
