import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase } from '../supabase';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import webinarHeroBg from '../assets/images/iStock-2183335357.jpg';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Layers, 
  FileText, 
  Award, 
  Video, 
  Cpu, 
  ShieldAlert, 
  Globe, 
  Coins, 
  ShieldCheck, 
  Compass, 
  Filter, 
  Search, 
  Lock, 
  Info, 
  AlertCircle,
  HelpCircle,
  Mail,
  User,
  Building
} from 'lucide-react';

// Monthly rotation curriculum
const focusRotation = [
  { 
    month: "July 2026", 
    pillar: "Fintech Infrastructure", 
    focus: "Digital payments, regulatory technology, AI-driven financial inclusion, and core banking modernization across African markets.",
    icon: Coins,
    color: "from-amber-500/20 to-orange-500/20"
  },
  { 
    month: "August 2026", 
    pillar: "Pan-African Infrastructure", 
    focus: "Cross-border digital infrastructure, national data systems, smart-city enablement, and AI-powered public infrastructure planning.",
    icon: Globe,
    color: "from-blue-500/20 to-electric-blue/20"
  },
  { 
    month: "September 2026", 
    pillar: "Intra-Trade & Global Trade", 
    focus: "AI in customs and logistics, AfCFTA-aligned trade systems, supply chain intelligence, and global market access technology.",
    icon: Compass,
    color: "from-emerald-500/20 to-teal-500/20"
  },
  { 
    month: "October 2026", 
    pillar: "Cybersecurity", 
    focus: "National cyber-resilience, AI-powered threat detection, critical infrastructure protection, and institutional security governance.",
    icon: ShieldCheck,
    color: "from-red-500/20 to-rose-500/20"
  },
  { 
    month: "November 2026", 
    pillar: "Defense & Disaster Response", 
    focus: "AI-enabled early-warning systems, defense decision-support platforms, and disaster preparedness and response automation.",
    icon: ShieldAlert,
    color: "from-purple-500/20 to-violet-glow/20"
  },
  { 
    month: "December 2026", 
    pillar: "Fintech Infrastructure", 
    focus: "Digital payments, regulatory technology, AI-driven financial inclusion, and core banking modernization across African markets.",
    icon: Coins,
    color: "from-amber-500/20 to-orange-500/20"
  },
  { 
    month: "January 2027", 
    pillar: "Pan-African Infrastructure", 
    focus: "Cross-border digital infrastructure, national data systems, smart-city enablement, and AI-powered public infrastructure planning.",
    icon: Globe,
    color: "from-blue-500/20 to-electric-blue/20"
  },
  { 
    month: "February 2027", 
    pillar: "Intra-Trade & Global Trade", 
    focus: "AI in customs and logistics, AfCFTA-aligned trade systems, supply chain intelligence, and global market access technology.",
    icon: Compass,
    color: "from-emerald-500/20 to-teal-500/20"
  },
  { 
    month: "March 2027", 
    pillar: "Cybersecurity", 
    focus: "National cyber-resilience, AI-powered threat detection, critical infrastructure protection, and institutional security governance.",
    icon: ShieldCheck,
    color: "from-red-500/20 to-rose-500/20"
  }
];

// Full program calendar data
const calendarSessions = [
  { date: "Wednesday, 15 July 2026", track: "Free Webinar", duration: "1h 30m", focus: "Fintech Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 22 July 2026", track: "Paid Program", duration: "2h 00m", focus: "Fintech Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 29 July 2026", track: "Free Webinar", duration: "1h 30m", focus: "Fintech Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 05 August 2026", track: "Paid Program", duration: "2h 00m", focus: "Pan-African Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 12 August 2026", track: "Free Webinar", duration: "1h 30m", focus: "Pan-African Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 19 August 2026", track: "Paid Program", duration: "2h 00m", focus: "Pan-African Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 26 August 2026", track: "Free Webinar", duration: "1h 30m", focus: "Pan-African Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 02 September 2026", track: "Paid Program", duration: "2h 00m", focus: "Intra-Trade & Global Trade", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 09 September 2026", track: "Free Webinar", duration: "1h 30m", focus: "Intra-Trade & Global Trade", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 16 September 2026", track: "Paid Program", duration: "2h 00m", focus: "Intra-Trade & Global Trade", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 23 September 2026", track: "Free Webinar", duration: "1h 30m", focus: "Intra-Trade & Global Trade", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 30 September 2026", track: "Paid Program", duration: "2h 00m", focus: "Intra-Trade & Global Trade", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 07 October 2026", track: "Free Webinar", duration: "1h 30m", focus: "Cybersecurity", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 14 October 2026", track: "Paid Program", duration: "2h 00m", focus: "Cybersecurity", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 21 October 2026", track: "Free Webinar", duration: "1h 30m", focus: "Cybersecurity", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 28 October 2026", track: "Paid Program", duration: "2h 00m", focus: "Cybersecurity", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 04 November 2026", track: "Free Webinar", duration: "1h 30m", focus: "Defense & Disaster Response", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 11 November 2026", track: "Paid Program", duration: "2h 00m", focus: "Defense & Disaster Response", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 18 November 2026", track: "Free Webinar", duration: "1h 30m", focus: "Defense & Disaster Response", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 25 November 2026", track: "Paid Program", duration: "2h 00m", focus: "Defense & Disaster Response", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 02 December 2026", track: "Free Webinar", duration: "1h 30m", focus: "Fintech Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 09 December 2026", track: "Paid Program", duration: "2h 00m", focus: "Fintech Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 16 December 2026", track: "Free Webinar", duration: "1h 30m", focus: "Fintech Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 23 December 2026", track: "Paid Program", duration: "2h 00m", focus: "Fintech Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 30 December 2026", track: "Free Webinar", duration: "1h 30m", focus: "Fintech Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 06 January 2027", track: "Paid Program", duration: "2h 00m", focus: "Pan-African Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 13 January 2027", track: "Free Webinar", duration: "1h 30m", focus: "Pan-African Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 20 January 2027", track: "Paid Program", duration: "2h 00m", focus: "Pan-African Infrastructure", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 27 January 2027", track: "Free Webinar", duration: "1h 30m", focus: "Pan-African Infrastructure", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 03 February 2027", track: "Paid Program", duration: "2h 00m", focus: "Intra-Trade & Global Trade", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 10 February 2027", track: "Free Webinar", duration: "1h 30m", focus: "Intra-Trade & Global Trade", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 17 February 2027", track: "Paid Program", duration: "2h 00m", focus: "Intra-Trade & Global Trade", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 24 February 2027", track: "Free Webinar", duration: "1h 30m", focus: "Intra-Trade & Global Trade", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 03 March 2027", track: "Paid Program", duration: "2h 00m", focus: "Cybersecurity", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 10 March 2027", track: "Free Webinar", duration: "1h 30m", focus: "Cybersecurity", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 17 March 2027", track: "Paid Program", duration: "2h 00m", focus: "Cybersecurity", team: "1 Facilitator + 1 Trainer" },
  { date: "Wednesday, 24 March 2027", track: "Free Webinar", duration: "1h 30m", focus: "Cybersecurity", team: "2 Speakers + 1 Moderator" },
  { date: "Wednesday, 31 March 2027", track: "Paid Program", duration: "2h 00m", focus: "Cybersecurity", team: "1 Facilitator + 1 Trainer" }
];

export default function Webinar() {
  const [sessions, setSessions] = useState<any[]>(calendarSessions);
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid'>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [registrationTrack, setRegistrationTrack] = useState<'free' | 'paid'>('free');

  React.useEffect(() => {
    const fetchDynamicWebinars = async () => {
      let dbWebinars: any[] = [];
      try {
        // 1. Try fetching from Supabase first
        try {
          const { data, error } = await supabase
            .from('webinars')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            dbWebinars = data;
          }
        } catch (sErr) {
          console.warn("Supabase fetch webinars failed, falling back to Firebase:", sErr);
        }

        // 2. Fallback to Firebase Firestore if Supabase empty
        if (dbWebinars.length === 0) {
          try {
            const snap = await getDocs(collection(db, 'webinars'));
            if (!snap.empty) {
              dbWebinars = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
          } catch (fErr) {
            console.warn("Firebase fetch webinars failed:", fErr);
          }
        }
      } catch (err) {
        console.error("Database retrieval error for webinars:", err);
      }

      // Merge with any locally created webinars in localStorage
      try {
        const localWebinars = JSON.parse(localStorage.getItem('local_webinars') || '[]');
        const combined = [...localWebinars, ...dbWebinars];
        
        // De-duplicate by some keys if needed, or if empty use defaults
        if (combined.length > 0) {
          // Filter duplicates by focus/date combination
          const seen = new Set();
          const unique = combined.filter(w => {
            const key = `${w.date}-${w.focus}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setSessions(unique);
        } else {
          setSessions(calendarSessions);
        }
      } catch (lErr) {
        console.error("Local storage processing failed for webinars:", lErr);
        setSessions(calendarSessions);
      }
    };
    fetchDynamicWebinars();
  }, []);
  
  // Registration form states
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    title: '',
    country: '',
    interestSector: 'Fintech Infrastructure',
    comments: ''
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;
    
    // 1. Dual-write to Firebase
    try {
      await addDoc(collection(db, 'webinar_registrations'), {
        ...formData,
        track: registrationTrack,
        status: 'registered',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving webinar registration in Firebase:", err);
    }

    // 2. Dual-write to Supabase
    try {
      await supabase.from('webinar_registrations').insert({
        fullName: formData.fullName,
        email: formData.email,
        organization: formData.organization,
        title: formData.title,
        country: formData.country,
        interestSector: formData.interestSector,
        comments: formData.comments,
        track: registrationTrack,
        status: 'registered',
        full_name: formData.fullName,
        interest_sector: formData.interestSector,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error saving webinar registration in Supabase:", err);
    }

    // 3. Fallback to localStorage list for immediate admin portal viewing
    try {
      const localRegs = JSON.parse(localStorage.getItem('local_webinar_registrations') || '[]');
      localRegs.push({
        id: 'reg-' + Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        organization: formData.organization,
        title: formData.title,
        country: formData.country,
        interestSector: formData.interestSector,
        comments: formData.comments,
        track: registrationTrack === 'free' ? 'Free Webinar' : 'Paid Program',
        status: 'registered',
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('local_webinar_registrations', JSON.stringify(localRegs));
    } catch (lErr) {
      console.warn("localStorage webinar registration save failed:", lErr);
    }
    
    setSubmitted(true);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      organization: '',
      title: '',
      country: '',
      interestSector: 'Fintech Infrastructure',
      comments: ''
    });
    setSubmitted(false);
  };

  // Extract unique pillars for filtering
  const pillars = ["All", "Fintech Infrastructure", "Pan-African Infrastructure", "Intra-Trade & Global Trade", "Cybersecurity", "Defense & Disaster Response"];

  // Filter calendar sessions
  const filteredSessions = sessions.filter(session => {
    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'free' && session.track === 'Free Webinar') || 
                     (activeTab === 'paid' && session.track === 'Paid Program');
    const matchesPillar = pillarFilter === 'All' || session.focus === pillarFilter;
    const matchesSearch = session.date.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          session.focus.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesPillar && matchesSearch;
  });

  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 min-h-[90vh] flex items-center overflow-hidden">
        {/* Hero Background Image with Atmospheric Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={webinarHeroBg} 
            alt="Webinar Hero Background" 
            className="w-full h-full object-cover object-center opacity-30 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-black/80 via-midnight-black/85 to-midnight-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.12),transparent_70%)]" />
        </div>

        {/* Background Gradients and Grid */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-glow/10 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ai-cyan/10 border border-ai-cyan/20 text-ai-cyan text-xs tracking-wider font-mono uppercase mb-6">
                  <Video className="w-3.5 h-3.5" /> High-Level Executive Capacity Program
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white leading-tight">
                  Africa AI Infrastructure <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan via-electric-blue to-violet-glow">
                    Capacity Building Program
                  </span>
                </h1>

                <p className="text-lg text-quantum-silver mb-8 leading-relaxed font-light max-w-2xl">
                  A structured, twice-monthly strategic learning initiative designed to strengthen AI capabilities, technological governance, and foundational digital frameworks for governments, national institutions, and elite corporate leaders.
                </p>

                {/* Co-conveners badges */}
                <div className="flex flex-wrap items-center gap-6 mb-8 p-4 rounded-2xl bg-white/5 border border-glass-border">
                  <div className="text-xs uppercase tracking-wider font-mono text-quantum-silver">Co-Convened By:</div>
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="text-sm font-semibold text-white tracking-wide border-r border-white/10 pr-4">NeuroGrowth Labs</span>
                    <span className="text-sm font-semibold text-ai-cyan tracking-wide">Elmwood Field Leadership Alliance</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <a 
                    href="#registration-portal" 
                    className="px-8 py-4 rounded-full bg-white text-midnight-black font-semibold tracking-wide hover:bg-ai-cyan hover:text-white transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_25px_rgba(0,229,255,0.35)] flex items-center gap-2"
                  >
                    Secure Enrollment <ArrowRight className="w-4 h-4" />
                  </a>
                  <a 
                    href="#program-overview" 
                    className="px-8 py-4 rounded-full border border-glass-border hover:bg-white/5 text-white font-medium tracking-wide transition-all"
                  >
                    Explore Curriculum
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right Column Highlights */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative p-8 rounded-3xl bg-graphite-grey/40 backdrop-blur-3xl border border-glass-border shadow-2xl relative overflow-hidden"
              >
                {/* Visual decoration overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-ai-cyan/10 rounded-full blur-2xl pointer-events-none" />

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-ai-cyan" /> Program Fast Facts
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-glass-border flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-electric-blue" />
                    </div>
                    <div>
                      <div className="text-xs text-quantum-silver uppercase font-mono">Duration Timeline</div>
                      <div className="text-white font-semibold mt-0.5">15 July 2026 — 31 March 2027</div>
                      <div className="text-xs text-quantum-silver/70 mt-0.5">Continuous 9-Month Cadence</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-glass-border flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-ai-cyan" />
                    </div>
                    <div>
                      <div className="text-xs text-quantum-silver uppercase font-mono">Delivery Platform</div>
                      <div className="text-white font-semibold mt-0.5">Microsoft Teams</div>
                      <div className="text-xs text-quantum-silver/70 mt-0.5">Live Interactive & Guided Sessions</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-glass-border flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-violet-glow" />
                    </div>
                    <div>
                      <div className="text-xs text-quantum-silver uppercase font-mono">Timezone Standard</div>
                      <div className="text-white font-semibold mt-0.5">West Africa Time (WAT / UTC+1)</div>
                      <div className="text-xs text-quantum-silver/70 mt-0.5">With localized time equivalents provided</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-glass-border flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs text-quantum-silver uppercase font-mono">Program Scope</div>
                      <div className="text-white font-semibold mt-0.5">Two Core Interactive Tracks</div>
                      <div className="text-xs text-quantum-silver/70 mt-0.5">Free Capacity Webinar + Paid Executive Program</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-glass-border flex items-center justify-between text-xs text-quantum-silver font-mono">
                  <span>STATUS: OPEN FOR ENROLLMENT</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live System
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Program Overview & Objectives */}
      <section id="program-overview" className="py-24 px-6 bg-deep-charcoal border-t border-glass-border relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Core Overview text */}
            <div className="lg:col-span-7">
              <h2 className="text-xs font-mono uppercase tracking-widest text-ai-cyan mb-4">01. Strategic Initiative</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Program Overview</h3>
              <p className="text-quantum-silver leading-relaxed mb-6 text-lg font-light">
                NeuroGrowth Labs, in strategic partnership with <span className="text-white font-medium">Elmwood Field Leadership Alliance</span>, is pleased to introduce the <span className="text-white font-medium">Africa AI Infrastructure Capacity Building Program</span> — a structured, twice-monthly learning initiative designed to strengthen technological capacity across government, national institutions, and enterprise leadership on the continent.
              </p>
              <p className="text-quantum-silver leading-relaxed mb-8">
                The program is delivered through two complementary tracks: a <span className="text-white font-medium">Free Capacity Building Webinar Series</span> for broad ecosystem access, and a <span className="text-white font-medium">Paid Executive Capacity Building Program</span> for deeper, applied technical and advisory development. Both tracks run twice per month, two weeks apart, entirely via Microsoft Teams.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-midnight-black/40 border border-glass-border hover:border-electric-blue/30 transition-all">
                  <div className="text-white font-bold text-lg mb-2">Weekly Cadence</div>
                  <p className="text-sm text-quantum-silver">Together, the two tracks form a continuous capacity-building cadence — a session occurring approximately every week across the nine-month program period.</p>
                </div>
                <div className="p-5 rounded-2xl bg-midnight-black/40 border border-glass-border hover:border-electric-blue/30 transition-all">
                  <div className="text-white font-bold text-lg mb-2">Strategic Partnership</div>
                  <p className="text-sm text-quantum-silver">Elmwood Field Leadership Alliance co-convenes this program, contributing leadership development, executive network access, and leadership-alignment frameworks.</p>
                </div>
              </div>
            </div>

            {/* Curriculum Pillars visual layout */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-midnight-black/60 border border-glass-border">
                <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider font-mono text-ai-cyan">Five Core Ecosystem Pillars</h4>
                <div className="space-y-4">
                  {[
                    { num: "01", title: "Fintech Infrastructure", desc: "Digital payments, regulatory systems & AI-driven financial integration." },
                    { num: "02", title: "Pan-African Infrastructure", desc: "Cross-border data networks & public sector smart infrastructure." },
                    { num: "03", title: "Intra-Trade & Global Trade", desc: "AfCFTA-aligned trading systems & supply chain intelligence." },
                    { num: "04", title: "Cybersecurity", desc: "National defense resilience & critical system security frameworks." },
                    { num: "05", title: "Defense & Disaster Response", desc: "AI-enabled warning platforms & smart automation response." }
                  ].map((p, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="font-mono text-electric-blue font-bold text-sm">{p.num}</div>
                      <div>
                        <div className="font-bold text-white text-sm">{p.title}</div>
                        <div className="text-xs text-quantum-silver mt-0.5">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Program Tracks & Dual Framework */}
      <section className="py-24 px-6 bg-midnight-black relative border-t border-glass-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ai-cyan mb-4">02. Curated Architecture</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">Program Tracks</h3>
            <p className="text-quantum-silver max-w-2xl mx-auto text-lg font-light">Choose the track that fits your strategic role — from ecosystem literacy to hands-on enterprise-level advisory tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* Free Track Card */}
            <div className="relative p-8 rounded-3xl bg-graphite-grey/30 border border-glass-border hover:border-amber-500/30 transition-all duration-500 flex flex-col justify-between overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono tracking-wider uppercase font-semibold">
                    Complimentary Access
                  </div>
                  <span className="text-3xl font-bold text-white/10 font-mono group-hover:text-amber-500/10 transition-colors">Track A</span>
                </div>

                <h4 className="text-2xl font-bold text-white mb-4">Free Capacity Building Webinar Series</h4>
                <p className="text-quantum-silver text-sm leading-relaxed mb-6">
                  An open-access webinar series designed to build broad awareness and ecosystem literacy across the five thematic pillars. Ideal for public sector stakeholders, students, professionals, and general ecosystem audiences.
                </p>

                <div className="space-y-4 border-t border-glass-border pt-6 mb-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Frequency:</span>
                    <span className="text-white font-medium">Twice monthly, two weeks apart</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Duration:</span>
                    <span className="text-white font-medium">1 hour 30 minutes per session</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Facilitation Team:</span>
                    <span className="text-white font-medium">2 Speakers + 1 Moderator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Platform:</span>
                    <span className="text-white font-medium">Microsoft Teams</span>
                  </div>
                </div>
              </div>

              <a 
                href="#registration-portal" 
                onClick={() => setRegistrationTrack('free')}
                className="w-full py-3.5 rounded-xl bg-white/5 border border-glass-border hover:bg-amber-500 hover:text-white hover:border-amber-500 text-white text-center font-semibold text-sm transition-all"
              >
                Register For Free Series
              </a>
            </div>

            {/* Paid Executive Track Card */}
            <div className="relative p-8 rounded-3xl bg-graphite-grey/30 border border-glass-border hover:border-electric-blue/30 transition-all duration-500 flex flex-col justify-between overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-electric-blue/5 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-xs font-mono tracking-wider uppercase font-semibold">
                    Paid Executive Enrollment
                  </div>
                  <span className="text-3xl font-bold text-white/10 font-mono group-hover:text-electric-blue/10 transition-colors">Track B</span>
                </div>

                <h4 className="text-2xl font-bold text-white mb-4">Paid Executive Capacity Building Program</h4>
                <p className="text-quantum-silver text-sm leading-relaxed mb-6">
                  A deeper, highly interactive, applied program for institutions and enterprises seeking hands-on technical capability, advisory frameworks, and executive-level AI infrastructure tools. Suitable for government leads & enterprise heads.
                </p>

                <div className="space-y-4 border-t border-glass-border pt-6 mb-8 text-sm">
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Frequency:</span>
                    <span className="text-white font-medium">Twice monthly, offset by 1 week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Duration:</span>
                    <span className="text-white font-medium">2 hours per session (hands-on)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Facilitation Team:</span>
                    <span className="text-white font-medium">1 Facilitator + 1 Trainer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-quantum-silver">Platform:</span>
                    <span className="text-white font-medium">Microsoft Teams + Lab Tools</span>
                  </div>
                </div>
              </div>

              <a 
                href="#registration-portal" 
                onClick={() => setRegistrationTrack('paid')}
                className="w-full py-3.5 rounded-xl bg-white text-midnight-black hover:bg-electric-blue hover:text-white font-semibold text-sm text-center transition-all shadow-md"
              >
                Apply For Executive Track
              </a>
            </div>

          </div>

          {/* Track Comparison at a Glance Table */}
          <div className="border border-glass-border rounded-2xl overflow-hidden bg-deep-charcoal/50 backdrop-blur-md">
            <div className="p-6 border-b border-glass-border bg-midnight-black/40">
              <h4 className="font-bold text-white text-lg">Track Comparison at a Glance</h4>
              <p className="text-xs text-quantum-silver mt-0.5">Quick reference mapping the key architectural variations between tracks.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm text-quantum-silver">
                <thead>
                  <tr className="bg-midnight-black/60 border-b border-glass-border text-xs uppercase font-mono tracking-wider text-white">
                    <th className="p-4 pl-6">Feature</th>
                    <th className="p-4">Free Capacity Building Webinar</th>
                    <th className="p-4 pr-6">Paid Executive Capacity Building Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { f: "Frequency", a: "Twice monthly, two weeks apart", b: "Twice monthly, two weeks apart (offset by one week)" },
                    { f: "Duration", a: "1 hour 30 minutes", b: "2 hours" },
                    { f: "Facilitation Team", a: "2 Speakers + 1 Moderator", b: "1 Facilitator + 1 Trainer" },
                    { f: "Platform", a: "Microsoft Teams", b: "Microsoft Teams" },
                    { f: "Access Level", a: "Open / complimentary registration", b: "Paid enrollment (fee schedule issued separately)" },
                    { f: "Content Depth", a: "Awareness, ecosystem literacy, thought leadership", b: "Applied skills, advisory frameworks, executive tools" },
                    { f: "Primary Audience", a: "General professionals, public-sector staff, students, ecosystem stakeholders", b: "Government agencies, national institutions, enterprise executives, technical leads" },
                    { f: "Materials Provided", a: "Session recording & summary brief", b: "Full toolkit, interactive templates, certificate of completion" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-white font-mono text-xs">{row.f}</td>
                      <td className="p-4">{row.a}</td>
                      <td className="p-4 pr-6 text-white font-medium">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Focus Rotation (Interactive Timeline) */}
      <section className="py-24 px-6 bg-deep-charcoal border-t border-glass-border relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ai-cyan mb-4">03. Thematic Curriculum</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">Monthly Focus Rotation</h3>
            <p className="text-quantum-silver max-w-2xl mx-auto text-lg font-light">Each calendar month centers on one of the five ecosystem pillars, rotating in sequence. Both tracks address that month's focus from distinct awareness (Free) and applied/advisory (Paid) lenses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusRotation.map((rotation, idx) => {
              const IconComp = rotation.icon;
              return (
                <div 
                  key={idx}
                  className="group relative p-6 rounded-2xl bg-midnight-black/50 border border-glass-border hover:border-electric-blue/40 transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle color glow based on month */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${rotation.color} opacity-40 blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />
                  
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-ai-cyan font-semibold">{rotation.month}</span>
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-quantum-silver group-hover:text-white transition-colors">
                      <IconComp className="w-4 h-4 text-electric-blue" />
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-ai-cyan transition-colors">{rotation.pillar}</h4>
                  <p className="text-sm text-quantum-silver leading-relaxed font-light">{rotation.focus}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Interactive Program Calendar with filters */}
      <section className="py-24 px-6 bg-midnight-black border-t border-glass-border relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-ai-cyan mb-4">04. Session Schedules</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-3">Program Calendar</h3>
              <p className="text-quantum-silver max-w-xl text-sm">Browse chronologically. Free Webinar sessions are highlighted in gold accents; Paid Executive sessions have blue indicators. Note the year-end holiday window is subject to rescheduling.</p>
            </div>

            {/* Quick search & filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <div className="flex items-center bg-graphite-grey border border-glass-border rounded-full px-4 py-2 text-sm text-white focus-within:border-ai-cyan">
                <Search className="w-4 h-4 text-quantum-silver mr-2" />
                <input 
                  type="text" 
                  placeholder="Search dates, pillars..." 
                  className="bg-transparent border-none outline-none text-white text-xs w-36 sm:w-48 placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center bg-graphite-grey border border-glass-border rounded-full px-3 py-1">
                <Filter className="w-3.5 h-3.5 text-quantum-silver mr-2" />
                <select 
                  className="bg-transparent text-white border-none outline-none text-xs pr-2"
                  value={pillarFilter}
                  onChange={(e) => setPillarFilter(e.target.value)}
                >
                  {pillars.map((p, idx) => (
                    <option key={idx} value={p} className="bg-midnight-black">{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Track selection tabs */}
          <div className="flex gap-2 mb-8 bg-graphite-grey/40 p-1 rounded-xl w-fit border border-glass-border">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'all' ? 'bg-white text-midnight-black shadow-md' : 'text-quantum-silver hover:text-white'}`}
            >
              All Tracks
            </button>
            <button 
              onClick={() => setActiveTab('free')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'free' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-quantum-silver hover:text-white'}`}
            >
              Free Webinar Series
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all uppercase ${activeTab === 'paid' ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30' : 'text-quantum-silver hover:text-white'}`}
            >
              Paid Executive Track
            </button>
          </div>

          {/* Table calendar implementation */}
          <div className="border border-glass-border rounded-2xl overflow-hidden bg-deep-charcoal/30 backdrop-blur-sm max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-midnight-black/80 border-b border-glass-border text-xs uppercase font-mono tracking-wider text-white sticky top-0 z-20 backdrop-blur-md">
                      <th className="p-4 pl-6">Date</th>
                      <th className="p-4">Track</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Thematic Focus</th>
                      <th className="p-4 pr-6">Facilitation Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-quantum-silver">
                    {filteredSessions.map((session, idx) => {
                      const isFree = session.track === 'Free Webinar';
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4 pl-6 font-semibold text-white">{session.date}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                              isFree 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20'
                            }`}>
                              {session.track}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs">{session.duration}</td>
                          <td className="p-4 font-semibold text-white group-hover:text-ai-cyan transition-colors">{session.focus}</td>
                          <td className="p-4 pr-6 text-xs font-light">{session.team}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-quantum-silver">
                <AlertCircle className="w-12 h-12 text-quantum-silver/40 mx-auto mb-4" />
                <h4 className="font-bold text-white text-lg">No Sessions Found</h4>
                <p className="text-sm mt-2 max-w-md mx-auto">We couldn't find any sessions matching your search or filters. Try adjusting your parameters above.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Program Roles, Facilitation & Logistics */}
      <section className="py-24 px-6 bg-deep-charcoal border-t border-glass-border relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Roles Descriptions */}
            <div className="lg:col-span-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-ai-cyan mb-4">05. Educational Delivery</h2>
              <h3 className="text-3xl font-bold text-white mb-6">Roles & Facilitation Team</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-amber-400 text-lg mb-2">Free Webinar Roles</h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white font-medium">Speaker 1 & Speaker 2</strong>
                        <p className="text-sm text-quantum-silver mt-0.5">Subject-matter experts presenting core strategic content and case insights for the month's pillar.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white font-medium">Moderator</strong>
                        <p className="text-sm text-quantum-silver mt-0.5">Manages session flow, introduces speakers, curates audience Q&A, and ensures rigorous time discipline within the 90-minute window.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-glass-border">
                  <h4 className="font-bold text-electric-blue text-lg mb-2">Paid Program Roles</h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-electric-blue rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white font-medium">Facilitator</strong>
                        <p className="text-sm text-quantum-silver mt-0.5">Leads overall session structure, guides discussion, and manages deep executive engagement and applied exercises.</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 bg-electric-blue rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white font-medium">Trainer</strong>
                        <p className="text-sm text-quantum-silver mt-0.5">Delivers targeted technical and advisory instructions, hands-on enterprise-level frameworks, and pillar-specific toolkits.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Logistics details */}
            <div className="lg:col-span-6">
              <div className="p-8 rounded-3xl bg-midnight-black/60 border border-glass-border h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider font-mono text-ai-cyan flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-electric-blue" /> Delivery Platform & Logistics
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 bg-ai-cyan rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white block font-medium">Microsoft Teams Architecture</strong>
                        <span className="text-sm text-quantum-silver">All sessions are hosted live via Microsoft Teams. Calendar invites and direct joining links are issued to registrants ahead of each session.</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 bg-ai-cyan rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white block font-medium">Recorded Session Archives</strong>
                        <span className="text-sm text-quantum-silver">Free Webinar sessions are recorded and shared as a summary brief. Paid Program sessions include complete supplementary toolkits, action templates, and certificates of completion.</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 bg-ai-cyan rounded-full shrink-0 mt-2" />
                      <div>
                        <strong className="text-white block font-medium">WAT Reference Timezone</strong>
                        <span className="text-sm text-quantum-silver">All times are confirmed and standardized centrally on West Africa Time (WAT). Local equivalents are automatically generated for global regional participants.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-xl bg-ai-cyan/5 border border-ai-cyan/20 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-ai-cyan shrink-0 mt-0.5" />
                  <p className="text-xs text-quantum-silver leading-relaxed">
                    Registration for the Free capacity building webinar series opens via a dedicated sign-up portal, ahead of the **15 July 2026** launch. Enrolment fee schedule and payment terms for the Paid Program are issued separately.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Registration & Enrollment Portal Form */}
      <section id="registration-portal" className="py-24 px-6 bg-midnight-black relative border-t border-glass-border">
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-[20%] top-0 w-[80vw] h-[80vw] rounded-full border border-glass-border opacity-10 pointer-events-none" />
          <div className="absolute -right-[20%] bottom-0 w-[60vw] h-[60vw] rounded-full border border-glass-border opacity-10 pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ai-cyan mb-4 font-bold">06. Action Vector</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">Program Registration</h3>
            <p className="text-quantum-silver max-w-2xl mx-auto text-sm">Select your desired track below to initialize your application or reserve a complimentary seat.</p>
          </div>

          <div className="bg-graphite-grey/50 backdrop-blur-3xl border border-glass-border rounded-3xl p-8 md:p-12 shadow-2xl">
            
            {/* Track selector switch in Form */}
            <div className="flex gap-4 p-1.5 bg-midnight-black/60 rounded-2xl w-full mb-10 border border-glass-border">
              <button 
                type="button"
                onClick={() => { setRegistrationTrack('free'); setSubmitted(false); }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-wider transition-all uppercase ${registrationTrack === 'free' ? 'bg-amber-500 text-white shadow-lg' : 'text-quantum-silver hover:text-white'}`}
              >
                Free Webinar Series
              </button>
              <button 
                type="button"
                onClick={() => { setRegistrationTrack('paid'); setSubmitted(false); }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-wider transition-all uppercase ${registrationTrack === 'paid' ? 'bg-electric-blue text-white shadow-lg' : 'text-quantum-silver hover:text-white'}`}
              >
                Paid Executive Program
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form 
                  key="registration-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onSubmit={handleRegisterSubmit} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Full Name *</label>
                      <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                        <User className="w-5 h-5 text-quantum-silver mr-3" />
                        <input 
                          type="text" 
                          required
                          placeholder="Linford Musiyambodza" 
                          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-700 text-sm" 
                          value={formData.fullName} 
                          onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Email Address *</label>
                      <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                        <Mail className="w-5 h-5 text-quantum-silver mr-3" />
                        <input 
                          type="email" 
                          required
                          placeholder="linford@neurogrowth.co.za" 
                          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-700 text-sm" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Organization / Agency *</label>
                      <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                        <Building className="w-5 h-5 text-quantum-silver mr-3" />
                        <input 
                          type="text" 
                          required
                          placeholder="NeuroGrowth Labs" 
                          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-700 text-sm" 
                          value={formData.organization} 
                          onChange={e => setFormData({...formData, organization: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Executive Title / Role</label>
                      <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                        <Award className="w-5 h-5 text-quantum-silver mr-3" />
                        <input 
                          type="text" 
                          placeholder="Head of AI Product Development" 
                          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-700 text-sm" 
                          value={formData.title} 
                          onChange={e => setFormData({...formData, title: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Country of Residence *</label>
                      <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                        <Globe className="w-5 h-5 text-quantum-silver mr-3" />
                        <input 
                          type="text" 
                          required
                          placeholder="South Africa" 
                          className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-700 text-sm" 
                          value={formData.country} 
                          onChange={e => setFormData({...formData, country: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Primary Curricular Focus</label>
                      <select 
                        className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 text-white outline-none focus:border-ai-cyan/50 transition-colors text-sm appearance-none"
                        value={formData.interestSector} 
                        onChange={e => setFormData({...formData, interestSector: e.target.value})}
                      >
                        <option value="Fintech Infrastructure">Fintech Infrastructure</option>
                        <option value="Pan-African Infrastructure">Pan-African Infrastructure</option>
                        <option value="Intra-Trade & Global Trade">Intra-Trade & Global Trade</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Defense & Disaster Response">Defense & Disaster Response</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block font-semibold">Collaboration Objectives & Custom Goals</label>
                    <div className="bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                      <textarea 
                        placeholder="State any particular outcomes, tools, or research guidance your team is seeking to acquire from this nine-month capacity initiative..." 
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-700 h-32 resize-none text-sm" 
                        value={formData.comments}
                        onChange={e => setFormData({...formData, comments: e.target.value})}
                      />
                    </div>
                  </div>

                  {registrationTrack === 'paid' && (
                    <div className="p-4 rounded-xl bg-electric-blue/5 border border-electric-blue/20 flex gap-3 items-start">
                      <Info className="w-5 h-5 text-electric-blue shrink-0 mt-0.5" />
                      <div className="text-xs text-quantum-silver leading-relaxed">
                        <strong className="text-white font-semibold">Executive Application Process:</strong> Paid Executive Program enrollment is subject to capacity alignment. Upon form submission, an alliance coordinator will issue the comprehensive fee schedule, syllabus package, and corporate invoicing details under separate cover.
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-glass-border flex justify-end">
                    <button 
                      type="submit" 
                      className={`px-8 py-3.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 text-midnight-black bg-white hover:bg-ai-cyan hover:text-white ${
                        registrationTrack === 'free' 
                          ? 'hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                          : 'hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                      }`}
                    >
                      {registrationTrack === 'free' ? 'Secure My Complimentary Seat' : 'Submit Executive Application'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  
                  <h4 className="text-2xl font-bold text-white mb-3">Alignment Successful</h4>
                  <p className="text-quantum-silver max-w-lg mx-auto text-sm leading-relaxed mb-8">
                    Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. We have logged your strategic interest in the **{formData.interestSector}** rotation. 
                    {registrationTrack === 'free' ? (
                      <span> A calendar invite with live Microsoft Teams access credentials will be routed to <strong className="text-white">{formData.email}</strong> shortly ahead of the 15 July 2026 launch.</span>
                    ) : (
                      <span> An Elmwood Field Leadership Alliance coordinator will contact you at <strong className="text-white">{formData.email}</strong> with your customized fee structure, credential authorization, and corporate logistics details.</span>
                    )}
                  </p>

                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={handleResetForm}
                      className="px-6 py-2.5 rounded-full border border-glass-border text-quantum-silver hover:text-white hover:bg-white/5 text-xs font-mono font-semibold uppercase tracking-wider transition-all"
                    >
                      Register Another Account
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
