import React from 'react';
import { motion } from 'framer-motion';
import { Network, Fingerprint, Coins, Cog } from 'lucide-react';

const services = [
  {
    icon: Cog,
    title: "Intelligence Orchestration",
    desc: "Custom-trained machine learning architectures tailored to proprietary enterprise data streams, delivering predictive insights automatically.",
    colSpan: "lg:col-span-2",
  },
  {
    icon: Coins,
    title: "Next-Gen Fintech",
    desc: "Decentralized, cross-border payment rails and algorithmic compliance engines.",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Network,
    title: "Sovereign AI Systems",
    desc: "On-premise infrastructure deployments for governments requiring absolute data autonomy.",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Fingerprint,
    title: "Zero-Trust Architecture",
    desc: "Continuous authentication, cryptographic data sharding, and threat detection natively integrated at the edge.",
    colSpan: "lg:col-span-2",
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-32 px-6 bg-deep-charcoal border-t border-glass-border">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 max-w-2xl"
        >
          <div className="text-violet-glow font-mono text-sm tracking-wider uppercase mb-3 flex items-center gap-2">
            <Cog className="w-4 h-4" /> Professional Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Architecture for the <br/> Autonomous Enterprise
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: idx * 0.1 }}
               className={`p-10 rounded-3xl bg-glass-surface border border-glass-border hover:bg-white/5 transition-colors group flex flex-col justify-between ${service.colSpan} min-h-[300px]`}
             >
               <service.icon className="w-12 h-12 text-electric-blue mb-8 group-hover:scale-110 group-hover:text-ai-cyan transition-all" />
               <div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-electric-blue transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-quantum-silver text-lg leading-relaxed">
                    {service.desc}
                  </p>
               </div>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
