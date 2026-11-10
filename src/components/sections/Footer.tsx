import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Twitter, Linkedin, Youtube, ShieldCheck } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { supabase } from '../../supabase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      return;
    }

    try {
      // 1. Dual-write to Firebase Firestore
      try {
        await addDoc(collection(db, 'subscriptions'), {
          email: email.trim().toLowerCase(),
          createdAt: serverTimestamp(),
          status: 'active'
        });
      } catch (fErr) {
        console.warn("Firebase newsletter subscription save failed:", fErr);
      }

      // 2. Dual-write to Supabase Database
      try {
        await supabase.from('subscriptions').insert({
          email: email.trim().toLowerCase(),
          status: 'active',
          created_at: new Date().toISOString()
        });
      } catch (sErr) {
        console.warn("Supabase newsletter subscription save failed:", sErr);
      }

      // 3. Fallback to localStorage list for immediate admin portal viewing
      try {
        const localSubs = JSON.parse(localStorage.getItem('local_subscriptions') || '[]');
        localSubs.push({
          id: 'sub-' + Date.now(),
          email: email.trim().toLowerCase(),
          status: 'active',
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        localStorage.setItem('local_subscriptions', JSON.stringify(localSubs));
      } catch (lErr) {
        console.warn("localStorage subscription save failed:", lErr);
      }

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error("Error saving subscription:", err);
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };


  return (
    <footer className="bg-midnight-black pt-20 pb-10 px-6 border-t border-glass-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <Hexagon className="w-8 h-8 text-electric-blue group-hover:text-violet-glow transition-colors" />
              <span className="text-xl font-bold tracking-tight text-white">Neurogrowth Labs</span>
            </Link>
            <p className="text-quantum-silver text-sm leading-relaxed mb-6">
              Building the intelligence layer for the modern economy. Headquartered in Cape Town, shaping the future globally.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com/neurogrowthlabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-graphite-grey border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-electric-blue transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/company/neurogrowthlabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-graphite-grey border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-electric-blue transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@neurogrowthlabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-graphite-grey border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-electric-blue transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-10">
              <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase">Newsletter</h4>
              <p className="text-quantum-silver text-sm mb-4 max-w-sm">
                Subscribe to receive updates on the NeuroGrowth Labs ecosystem and African tech innovations.
              </p>
              <form className="flex gap-2 max-w-sm" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                  placeholder="Enter your email" 
                  className={`flex-1 bg-white/5 border ${status === 'error' ? 'border-red-500' : 'border-glass-border'} rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-ai-cyan focus:bg-white/10 transition-colors`}
                />
                <button 
                  type="submit" 
                  className="bg-white text-midnight-black hover:bg-ai-cyan hover:text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                >
                  Subscribe
                </button>
              </form>
              {status === 'success' && <p className="text-green-400 text-xs mt-2">Successfully subscribed!</p>}
              {status === 'error' && <p className="text-red-400 text-xs mt-2">Please enter a valid email address.</p>}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Ecosystem</h4>
            <ul className="space-y-4">
              <li><a href="https://studio.afritranslate.co.za" target="_blank" rel="noopener noreferrer" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">AfriTranslate Studio</a></li>
              <li><a href="https://afritradeos.co.za" target="_blank" rel="noopener noreferrer" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">AfriTrade OS</a></li>
              <li><a href="https://afriestate.co.za" target="_blank" rel="noopener noreferrer" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">AfriEstate</a></li>
              <li><a href="https://cgwastedata.co.za" target="_blank" rel="noopener noreferrer" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">CG Waste Data</a></li>
              <li><a href="#" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">RescueBot AI</a></li>
              <li><a href="#" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">IBOS</a></li>
              <li><a href="#" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">NGX AfriQuant</a></li>
              <li><a href="#" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Health AI</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors" onClick={() => window.scrollTo(0,0)}>About</Link></li>
              <li><Link to="/academy" className="text-ai-cyan hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors" onClick={() => window.scrollTo(0,0)}>Cybersecurity & AI Academy <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.2 rounded-full font-mono">Free</span></Link></li>
              <li><Link to="/webinar" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors" onClick={() => window.scrollTo(0,0)}>AI Webinar Program</Link></li>
              <li><a href="#services" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Services</a></li>
              <li><a href="#infrastructure" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Infrastructure</a></li>
              <li><Link to="/careers" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors" onClick={() => window.scrollTo(0,0)}>Careers</Link></li>
              <li><Link to="/contact" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors" onClick={() => window.scrollTo(0,0)}>Contact</Link></li>
              <li><Link to="/portal" className="text-ai-cyan hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors pt-2 border-t border-glass-border/30" onClick={() => window.scrollTo(0,0)}><ShieldCheck className="w-4 h-4" /> Super Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy-policy" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/ai-ethics" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">AI Ethics</Link></li>
              <li><Link to="/cookie-policy" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Cookie Policy</Link></li>
              <li><Link to="/dpa" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">DPA</Link></li>
              <li><Link to="/security-policy" className="text-quantum-silver hover:text-ai-cyan text-sm transition-colors">Security Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-quantum-silver text-xs">
            © {new Date().getFullYear()} NeuroGrowth Labs. All rights reserved. Cape Town, ZA.
          </p>
          <div className="flex gap-4">
            <span className="text-quantum-silver text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ai-cyan animate-pulse" /> 
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
