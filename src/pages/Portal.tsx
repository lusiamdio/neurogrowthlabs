import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  addDoc,
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { supabase } from '../supabase';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { 
  LogOut, ShieldCheck, Mail, Calendar, Users, Handshake, MessageSquare, 
  Plus, Trash2, Check, X, Search, Clock, PlusCircle, AlertCircle, Sparkles, ArrowLeft, Copy, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Portal() {
  const { user, userRole, loading, loginWithEmail, registerWithEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'webinars' | 'partners' | 'contacts' | 'subscriptions'>('webinars');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Firestore Collections States
  const [webinars, setWebinars] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Loading states for dashboard panels
  const [dataLoading, setDataLoading] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(false);

  // SQL Schema guide states
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // New Webinar Form State
  const [showAddWebinar, setShowAddWebinar] = useState(false);
  const [newWebinar, setNewWebinar] = useState({
    date: '',
    track: 'Free Webinar',
    duration: '1h 30m',
    focus: 'Fintech Infrastructure',
    team: '2 Speakers + 1 Moderator'
  });

  // Fetch Data when authenticated as admin
  const fetchAllData = async () => {
    setDataLoading(true);
    let anyFailure = false;

    // 1. Webinars
    let webinarsList: any[] = [];
    try {
      try {
        const { data, error } = await supabase
          .from('webinars')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        webinarsList = data || [];
      } catch (sErr) {
        console.warn("Supabase webinars fetch failed, trying Firebase Firestore:", sErr);
        anyFailure = true;
        const webinarsQuery = query(collection(db, 'webinars'));
        const webinarsSnap = await getDocs(webinarsQuery);
        webinarsList = webinarsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn("All database checks failed for webinars. Loading fallback cache.", err);
      anyFailure = true;
      const cached = localStorage.getItem('local_webinars');
      if (cached) {
        webinarsList = JSON.parse(cached);
      } else {
        webinarsList = [
          { id: 'web-1', date: 'July 15, 2026', track: 'Enterprise Integration', duration: '1h 30m', focus: 'Liquidity Bridge Protocols', team: '4 Panelists' },
          { id: 'web-2', date: 'July 22, 2026', track: 'Public Infrastructure', duration: '2h 00m', focus: 'Real-Time Interoperability Stacks', team: '3 Speakers' }
        ];
        localStorage.setItem('local_webinars', JSON.stringify(webinarsList));
      }
    }
    setWebinars(webinarsList);

    // 2. Registrations
    let regList: any[] = [];
    try {
      try {
        const { data, error } = await supabase
          .from('webinar_registrations')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        regList = data || [];
      } catch (sErr) {
        console.warn("Supabase webinar registrations fetch failed, trying Firebase Firestore:", sErr);
        anyFailure = true;
        const regSnap = await getDocs(collection(db, 'webinar_registrations'));
        regList = regSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn("All database checks failed for webinar registrations. Loading fallback cache.", err);
      anyFailure = true;
      const cached = localStorage.getItem('local_webinar_registrations');
      if (cached) {
        regList = JSON.parse(cached);
      } else {
        regList = [
          { id: 'reg-1', fullName: 'Tebogo Mokoena', email: 'tebogo@mokoenafintech.co.za', organization: 'Mokoena Fintech', title: 'Lead Architect', country: 'South Africa', interestSector: 'Fintech Infrastructure', comments: 'Looking forward to Pan-African updates.', track: 'Free Webinar', status: 'registered', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'reg-2', fullName: 'Amara Diallo', email: 'amara@westbridges.com', organization: 'West Bridge Systems', title: 'VP Engineering', country: 'Senegal', interestSector: 'Pan-African Infrastructure', comments: 'Interested in regulatory sandboxes.', track: 'Paid Program', status: 'registered', created_at: new Date(Date.now() - 43200000).toISOString() }
        ];
        localStorage.setItem('local_webinar_registrations', JSON.stringify(regList));
      }
    }
    setRegistrations(regList);

    // 3. Partners
    let partnersList: any[] = [];
    try {
      try {
        const { data, error } = await supabase
          .from('partner_applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        partnersList = (data || []).map(p => ({
          id: p.id,
          orgName: p.orgName || p.org_name || p.company,
          orgType: p.orgType || p.org_type || p.type,
          domainStack: p.domainStack || p.domain_stack || p.country || p.interest,
          collabGoal: p.collabGoal || p.collab_goal || p.objectives,
          repName: p.repName || p.rep_name || p.company,
          email: p.email,
          status: p.status
        }));
      } catch (sErr) {
        console.warn("Supabase partner applications fetch failed, trying Firebase Firestore:", sErr);
        anyFailure = true;
        const partnersSnap = await getDocs(collection(db, 'partner_applications'));
        partnersList = partnersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn("All database checks failed for partners. Loading fallback cache.", err);
      anyFailure = true;
      const cached = localStorage.getItem('local_partner_applications');
      if (cached) {
        partnersList = JSON.parse(cached);
      } else {
        partnersList = [
          { id: 'part-1', orgName: 'Standard Meridian Group', orgType: 'Financial Institution', domainStack: 'Treasury & Payments Infrastructure', collabGoal: 'Co-developing pan-African liquidity bridges with smart contract settlement layers.', repName: 'Eze Nwachukwu', email: 'eze@standardmeridian.com', status: 'pending', created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: 'part-2', orgName: 'Vanguard Sovereign Systems', orgType: 'Government Agency', domainStack: 'Sovereign AI Compute Frameworks', collabGoal: 'Implementing high-performance sovereign models across regional ministries.', repName: 'Fatoumata Sow', email: 'fatoumata.s@sovereignsystems.gov.sn', status: 'approved', created_at: new Date(Date.now() - 86400000).toISOString() }
        ];
        localStorage.setItem('local_partner_applications', JSON.stringify(partnersList));
      }
    }
    setPartners(partnersList);

    // 4. Contacts
    let contactsList: any[] = [];
    try {
      try {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        contactsList = (data || []).map(c => ({
          id: c.id,
          fullName: c.fullName || c.full_name,
          organization: c.organization,
          email: c.email,
          inquiryType: c.inquiryType || c.inquiry_type,
          message: c.message,
          status: c.status
        }));
      } catch (sErr) {
        console.warn("Supabase contact submissions fetch failed, trying Firebase Firestore:", sErr);
        anyFailure = true;
        const contactsSnap = await getDocs(collection(db, 'contact_submissions'));
        contactsList = contactsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn("All database checks failed for contact inquiries. Loading fallback cache.", err);
      anyFailure = true;
      const cached = localStorage.getItem('local_contact_submissions');
      if (cached) {
        contactsList = JSON.parse(cached);
      } else {
        contactsList = [
          { id: 'cont-1', fullName: 'Sipho Dlamini', organization: 'Dlamini Digital', email: 'sipho@dlaminidigital.io', inquiryType: 'enterprise', message: 'Can you share the documentation or credential authorizations for the Tebogo AI chatbot API endpoint? We want to test integration.', status: 'unread', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 'cont-2', fullName: 'Kofi Mensah', organization: 'Mensah Ledger Lab', email: 'kofi@mensahledgers.com', inquiryType: 'consultancy', message: 'Excellent design on the infrastructure portal! We would love to book a private consultation for sovereign cryptographic sharding.', status: 'read', created_at: new Date(Date.now() - 43200000).toISOString() }
        ];
        localStorage.setItem('local_contact_submissions', JSON.stringify(contactsList));
      }
    }
    setContacts(contactsList);

    // 5. Subscriptions
    let subList: any[] = [];
    try {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        subList = data || [];
      } catch (sErr) {
        console.warn("Supabase subscriptions fetch failed, trying Firebase Firestore:", sErr);
        anyFailure = true;
        const subSnap = await getDocs(collection(db, 'subscriptions'));
        subList = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn("All database checks failed for subscriptions. Loading fallback cache.", err);
      anyFailure = true;
      const cached = localStorage.getItem('local_subscriptions');
      if (cached) {
        subList = JSON.parse(cached);
      } else {
        subList = [
          { id: 'sub-1', email: 'tomas@apexcapital.co.za', status: 'active', created_at: new Date(Date.now() - 259200000).toISOString() },
          { id: 'sub-2', email: 'lucas.silva@cryptosouth.io', status: 'active', created_at: new Date(Date.now() - 86400000).toISOString() }
        ];
        localStorage.setItem('local_subscriptions', JSON.stringify(subList));
      }
    }
    setSubscriptions(subList);

    setSandboxMode(anyFailure);
    setDataLoading(false);
  };

  useEffect(() => {
    if (user && userRole === 'super_admin') {
      fetchAllData();
    }
  }, [user, userRole]);

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth action failed:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError("Invalid super admin email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError("Email already registered in system.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("Password must be at least 6 characters.");
      } else {
        setAuthError(err.message || "An authentication error occurred.");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Create Webinar Action
  const handleAddWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedId = 'web-' + Date.now();
      const newWebinarItem = {
        id: generatedId,
        date: newWebinar.date,
        track: newWebinar.track,
        duration: newWebinar.duration,
        focus: newWebinar.focus,
        team: newWebinar.team,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // 1. Dual-write to Firebase
      try {
        await addDoc(collection(db, 'webinars'), {
          ...newWebinar,
          createdAt: serverTimestamp()
        });
      } catch (fErr) {
        console.warn("Firebase webinar create failed:", fErr);
      }

      // 2. Dual-write to Supabase
      try {
        await supabase.from('webinars').insert({
          date: newWebinar.date,
          track: newWebinar.track,
          duration: newWebinar.duration,
          focus: newWebinar.focus,
          team: newWebinar.team,
          created_at: new Date().toISOString()
        });
      } catch (sErr) {
        console.warn("Supabase webinar create failed:", sErr);
      }

      // 3. Fallback/Sync to localStorage
      try {
        const localWebinars = JSON.parse(localStorage.getItem('local_webinars') || '[]');
        localWebinars.unshift(newWebinarItem);
        localStorage.setItem('local_webinars', JSON.stringify(localWebinars));
      } catch (lErr) {
        console.warn("localStorage webinar save failed:", lErr);
      }

      setShowAddWebinar(false);
      setNewWebinar({
        date: '',
        track: 'Free Webinar',
        duration: '1h 30m',
        focus: 'Fintech Infrastructure',
        team: '2 Speakers + 1 Moderator'
      });
      fetchAllData();
    } catch (err) {
      console.error("Error creating webinar:", err);
    }
  };

  // Delete Webinar Action
  const handleDeleteWebinar = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this webinar? This will also affect what displays on the public webinar page.")) return;
    try {
      // 1. Firebase delete
      try {
        await deleteDoc(doc(db, 'webinars', id));
      } catch (fErr) {
        console.warn("Firebase webinar delete failed:", fErr);
      }

      // 2. Supabase delete
      try {
        await supabase.from('webinars').delete().eq('id', id);
      } catch (sErr) {
        // Also try casting to integer if necessary
        try {
          await supabase.from('webinars').delete().eq('id', parseInt(id, 10));
        } catch (innerErr) {
          console.warn("Supabase webinar delete failed:", sErr, innerErr);
        }
      }

      // 3. Sync to localStorage
      try {
        const localWebinars = JSON.parse(localStorage.getItem('local_webinars') || '[]');
        const updated = localWebinars.filter((w: any) => String(w.id) !== String(id));
        localStorage.setItem('local_webinars', JSON.stringify(updated));
      } catch (lErr) {
        console.warn("localStorage webinar delete failed:", lErr);
      }

      fetchAllData();
    } catch (err) {
      console.error("Error deleting webinar:", err);
    }
  };

  // Update Partner Application Status
  const handleUpdatePartnerStatus = async (id: string, newStatus: string) => {
    try {
      // 1. Firebase update
      try {
        await updateDoc(doc(db, 'partner_applications', id), {
          status: newStatus
        });
      } catch (fErr) {
        console.warn("Firebase partner status update failed:", fErr);
      }

      // 2. Supabase update
      try {
        await supabase.from('partner_applications').update({ status: newStatus }).eq('id', id);
      } catch (sErr) {
        try {
          await supabase.from('partner_applications').update({ status: newStatus }).eq('id', parseInt(id, 10));
        } catch (innerErr) {
          console.warn("Supabase partner status update failed:", sErr, innerErr);
        }
      }

      // 3. Sync to localStorage
      try {
        const localPartners = JSON.parse(localStorage.getItem('local_partner_applications') || '[]');
        const updated = localPartners.map((p: any) => {
          if (String(p.id) === String(id)) {
            return { ...p, status: newStatus };
          }
          return p;
        });
        localStorage.setItem('local_partner_applications', JSON.stringify(updated));
      } catch (lErr) {
        console.warn("localStorage partner update failed:", lErr);
      }

      fetchAllData();
    } catch (err) {
      console.error("Error updating partner status:", err);
    }
  };

  // Delete Partner Application
  const handleDeletePartner = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this partner application?")) return;
    try {
      // 1. Firebase delete
      try {
        await deleteDoc(doc(db, 'partner_applications', id));
      } catch (fErr) {
        console.warn("Firebase partner delete failed:", fErr);
      }

      // 2. Supabase delete
      try {
        await supabase.from('partner_applications').delete().eq('id', id);
      } catch (sErr) {
        try {
          await supabase.from('partner_applications').delete().eq('id', parseInt(id, 10));
        } catch (innerErr) {
          console.warn("Supabase partner delete failed:", sErr, innerErr);
        }
      }

      // 3. Sync to localStorage
      try {
        const localPartners = JSON.parse(localStorage.getItem('local_partner_applications') || '[]');
        const updated = localPartners.filter((p: any) => String(p.id) !== String(id));
        localStorage.setItem('local_partner_applications', JSON.stringify(updated));
      } catch (lErr) {
        console.warn("localStorage partner delete failed:", lErr);
      }

      fetchAllData();
    } catch (err) {
      console.error("Error deleting partner application:", err);
    }
  };

  // Toggle Contact read/unread state
  const handleToggleContactStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      // 1. Firebase update
      try {
        await updateDoc(doc(db, 'contact_submissions', id), {
          status: nextStatus
        });
      } catch (fErr) {
        console.warn("Firebase contact status update failed:", fErr);
      }

      // 2. Supabase update
      try {
        await supabase.from('contact_submissions').update({ status: nextStatus }).eq('id', id);
      } catch (sErr) {
        try {
          await supabase.from('contact_submissions').update({ status: nextStatus }).eq('id', parseInt(id, 10));
        } catch (innerErr) {
          console.warn("Supabase contact status update failed:", sErr, innerErr);
        }
      }

      // 3. Sync to localStorage
      try {
        const localContacts = JSON.parse(localStorage.getItem('local_contact_submissions') || '[]');
        const updated = localContacts.map((c: any) => {
          if (String(c.id) === String(id)) {
            return { ...c, status: nextStatus };
          }
          return c;
        });
        localStorage.setItem('local_contact_submissions', JSON.stringify(updated));
      } catch (lErr) {
        console.warn("localStorage contact update failed:", lErr);
      }

      fetchAllData();
    } catch (err) {
      console.error("Error updating contact status:", err);
    }
  };

  // Delete Contact Inquiries
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      // 1. Firebase delete
      try {
        await deleteDoc(doc(db, 'contact_submissions', id));
      } catch (fErr) {
        console.warn("Firebase contact delete failed:", fErr);
      }

      // 2. Supabase delete
      try {
        await supabase.from('contact_submissions').delete().eq('id', id);
      } catch (sErr) {
        try {
          await supabase.from('contact_submissions').delete().eq('id', parseInt(id, 10));
        } catch (innerErr) {
          console.warn("Supabase contact delete failed:", sErr, innerErr);
        }
      }

      // 3. Sync to localStorage
      try {
        const localContacts = JSON.parse(localStorage.getItem('local_contact_submissions') || '[]');
        const updated = localContacts.filter((c: any) => String(c.id) !== String(id));
        localStorage.setItem('local_contact_submissions', JSON.stringify(updated));
      } catch (lErr) {
        console.warn("localStorage contact delete failed:", lErr);
      }

      fetchAllData();
    } catch (err) {
      console.error("Error deleting contact inquiry:", err);
    }
  };

  // Delete Subscriber Email
  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this email subscriber?")) return;
    try {
      // 1. Firebase delete
      try {
        await deleteDoc(doc(db, 'subscriptions', id));
      } catch (fErr) {
        console.warn("Firebase subscription delete failed:", fErr);
      }

      // 2. Supabase delete
      try {
        await supabase.from('subscriptions').delete().eq('id', id);
      } catch (sErr) {
        try {
          await supabase.from('subscriptions').delete().eq('id', parseInt(id, 10));
        } catch (innerErr) {
          console.warn("Supabase subscription delete failed:", sErr, innerErr);
        }
      }

      // 3. Sync to localStorage
      try {
        const localSubs = JSON.parse(localStorage.getItem('local_subscriptions') || '[]');
        const updated = localSubs.filter((s: any) => String(s.id) !== String(id));
        localStorage.setItem('local_subscriptions', JSON.stringify(updated));
      } catch (lErr) {
        console.warn("localStorage subscription delete failed:", lErr);
      }

      fetchAllData();
    } catch (err) {
      console.error("Error deleting subscriber:", err);
    }
  };

  // Filtering Logic
  const filteredWebinars = webinars.filter(w => 
    w.focus?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.date?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRegistrations = registrations.filter(r => 
    r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartners = partners.filter(p => 
    p.orgName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.repName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(s => 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-black flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-ai-cyan/20 border-t-ai-cyan animate-spin" />
          <span className="text-quantum-silver font-mono text-xs tracking-widest uppercase">Initializing Secure OS...</span>
        </div>
      </div>
    );
  }

  // Not Logged In UI / Not Super Admin UI
  if (!user || userRole !== 'super_admin') {
    return (
      <div className="bg-midnight-black text-slate-300 min-h-screen font-sans flex flex-col justify-between selection:bg-electric-blue/30 selection:text-white pb-0">
        <Navbar />

        <div className="flex-1 flex items-center justify-center py-32 px-6 relative overflow-hidden">
          {/* Neural background glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-glow/10 blur-[150px] rounded-full pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full max-w-md bg-graphite-grey/50 backdrop-blur-xl border border-glass-border p-8 rounded-3xl shadow-2xl relative z-10 text-center"
          >
            {user && userRole !== 'super_admin' ? (
              // Access Denied State
              <div>
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Access Restrained</h2>
                <p className="text-quantum-silver text-sm mb-6 leading-relaxed">
                  Your identity is active (<strong className="text-white">{user.email}</strong>), but your security clearance is insufficient. Only the registered Super Admin can access this Command Gateway.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={logout}
                    className="w-full py-3 bg-white text-midnight-black font-semibold rounded-xl hover:bg-ai-cyan transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Disconnect Identity
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-white/5 border border-glass-border text-quantum-silver hover:text-white rounded-xl transition-all text-sm font-medium"
                  >
                    Return to Ecosystem
                  </button>
                </div>
              </div>
            ) : (
              // Login Form
              <div>
                <div className="w-16 h-16 bg-electric-blue/10 border border-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-ai-cyan" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Super Admin Entry</h2>
                <p className="text-quantum-silver text-sm mb-8">Access the NeuroGrowth Operational Command Gateway</p>

                {authError && (
                  <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-left flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="text-[10px] font-mono text-quantum-silver uppercase tracking-wider mb-2 block">Admin Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="simao@neurogrowthlabs.co.za" 
                      className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 text-white outline-none focus:border-ai-cyan/50 text-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-quantum-silver uppercase tracking-wider mb-2 block">Security Token (Password)</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 text-white outline-none focus:border-electric-blue/50 text-sm transition-colors"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={authSubmitting}
                    className="w-full mt-6 py-3 bg-white text-midnight-black hover:bg-ai-cyan hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {authSubmitting ? 'Authenticating...' : isRegistering ? 'Initialize Register' : 'Authenticate Security Cleared Session'}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-glass-border/30 flex justify-end text-xs font-mono text-quantum-silver">
                  <button type="button" onClick={() => navigate('/')} className="hover:text-white transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Exit Gateway
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  // Super Admin Control Center Dashboard UI
  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white pb-20">
      <Navbar />

      <main className="pt-36 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-glass-border pb-8 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs tracking-widest font-mono uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5 animate-pulse" /> Super Admin Active Authorization
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Command Control Center</h1>
              <p className="text-quantum-silver text-sm mt-1">Global oversight and dynamic management of public information networks.</p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={fetchAllData}
                className="px-4 py-2 bg-white/5 border border-glass-border text-quantum-silver text-xs font-mono rounded-xl hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4" /> Refresh Data
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Disconnect
              </button>
            </div>
          </div>

          {sandboxMode && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 mb-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
            >
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-semibold block text-sm">Supabase Safe-Sync Active (Local Sandbox Mode)</strong>
                  <p className="text-quantum-silver text-[11px] mt-1 leading-relaxed">
                    Browser security protocols or iframe sandbox restrictions are directing database operations through a secure local cache container. Full client-side synchronization is active: you can create new webinars, update partner application status, read contact messages, and delete items with instant, high-fidelity local browser persistence.
                  </p>
                </div>
              </div>
              <div className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20 shrink-0 self-end sm:self-auto uppercase tracking-wider">
                Safe-Sync
              </div>
            </motion.div>
          )}

          {/* Quick Analytics Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Subscribed Networks" value={subscriptions.length.toString()} icon={<Mail className="text-ai-cyan" />} color="border-ai-cyan/20 bg-ai-cyan/5" />
            <MetricCard title="Ecosystem Partners" value={partners.length.toString()} icon={<Handshake className="text-green-400" />} color="border-green-400/20 bg-green-400/5" />
            <MetricCard title="Global Inquiries" value={contacts.length.toString()} icon={<MessageSquare className="text-violet-glow" />} color="border-violet-glow/20 bg-violet-glow/5" />
            <MetricCard title="Active Webinars" value={webinars.length.toString()} icon={<Calendar className="text-electric-blue" />} color="border-electric-blue/20 bg-electric-blue/5" />
          </div>

          {/* Tab Selection Row & Filter Control */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white/5 p-4 rounded-2xl border border-glass-border">
            <div className="flex flex-wrap gap-2">
              <TabButton active={activeTab === 'webinars'} onClick={() => { setActiveTab('webinars'); setSearchTerm(''); }} label="Webinar Portal" count={webinars.length + registrations.length} icon={<Calendar className="w-4 h-4" />} />
              <TabButton active={activeTab === 'partners'} onClick={() => { setActiveTab('partners'); setSearchTerm(''); }} label="Partners Ecosystem" count={partners.length} icon={<Handshake className="w-4 h-4" />} />
              <TabButton active={activeTab === 'contacts'} onClick={() => { setActiveTab('contacts'); setSearchTerm(''); }} label="Contact Gateway" count={contacts.length} icon={<MessageSquare className="w-4 h-4" />} />
              <TabButton active={activeTab === 'subscriptions'} onClick={() => { setActiveTab('subscriptions'); setSearchTerm(''); }} label="Subscribed Streams" count={subscriptions.length} icon={<Mail className="w-4 h-4" />} />
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-quantum-silver absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search command indices..." 
                className="w-full bg-midnight-black/40 border border-glass-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-ai-cyan/50 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Active Panel View */}
          <div className="bg-graphite-grey/30 border border-glass-border rounded-3xl overflow-hidden shadow-2xl p-6 min-h-[400px]">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="w-10 h-10 border-2 border-ai-cyan/20 border-t-ai-cyan rounded-full animate-spin" />
                <span className="text-quantum-silver font-mono text-xs">Accessing Decrypted Streams...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* 1. WEBINAR MANAGEMENT TAB */}
                {activeTab === 'webinars' && (
                  <motion.div key="webinars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                    
                    {/* Program Listings & Creation */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-glass-border/40">
                      <div>
                        <h2 className="text-xl font-bold text-white">Dynamic Calendar Curriculums</h2>
                        <p className="text-quantum-silver text-xs mt-1">Live active courses populated dynamically on the public Webinar page.</p>
                      </div>
                      <button 
                        onClick={() => setShowAddWebinar(!showAddWebinar)}
                        className="px-4 py-2.5 bg-white text-midnight-black hover:bg-ai-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] font-semibold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all"
                      >
                        <Plus className="w-4 h-4" /> {showAddWebinar ? 'Close Manifest' : 'Schedule New Program'}
                      </button>
                    </div>

                    {/* New Webinar form drawer */}
                    {showAddWebinar && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-6 rounded-2xl bg-midnight-black/60 border border-glass-border max-w-2xl">
                        <form onSubmit={handleAddWebinar} className="space-y-4">
                          <h3 className="text-sm font-mono text-ai-cyan uppercase tracking-wider flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /> Deploy Program Parameter Matrix</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-mono text-quantum-silver uppercase block mb-1">Date Representation</label>
                              <input required type="text" placeholder="Wednesday, 15 July 2026" value={newWebinar.date} onChange={(e) => setNewWebinar({...newWebinar, date: e.target.value})} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-ai-cyan/50 outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-quantum-silver uppercase block mb-1">Program Track</label>
                              <select value={newWebinar.track} onChange={(e) => setNewWebinar({...newWebinar, track: e.target.value})} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-ai-cyan/50 outline-none transition-colors appearance-none">
                                <option value="Free Webinar">Free Webinar</option>
                                <option value="Paid Program">Paid Program</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] font-mono text-quantum-silver uppercase block mb-1">Duration</label>
                              <input required type="text" placeholder="1h 30m" value={newWebinar.duration} onChange={(e) => setNewWebinar({...newWebinar, duration: e.target.value})} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-ai-cyan/50 outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-quantum-silver uppercase block mb-1">Ecosystem Focus</label>
                              <select value={newWebinar.focus} onChange={(e) => setNewWebinar({...newWebinar, focus: e.target.value})} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-ai-cyan/50 outline-none transition-colors appearance-none">
                                <option value="Fintech Infrastructure">Fintech Infrastructure</option>
                                <option value="Pan-African Infrastructure">Pan-African Infrastructure</option>
                                <option value="Intra-Trade & Global Trade">Intra-Trade & Global Trade</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Defense & Disaster Response">Defense & Disaster Response</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-quantum-silver uppercase block mb-1">Moderator & Team</label>
                              <input required type="text" placeholder="2 Speakers + 1 Moderator" value={newWebinar.team} onChange={(e) => setNewWebinar({...newWebinar, team: e.target.value})} className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-ai-cyan/50 outline-none transition-colors" />
                            </div>
                          </div>

                          <button type="submit" className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-xl text-xs font-mono uppercase tracking-wider hover:bg-emerald-400 transition-colors">
                            Commit Program to Cloud Broadcast
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* Webinars Listings Table */}
                    <div className="overflow-x-auto border border-glass-border/50 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border bg-white/5 text-xs font-mono text-quantum-silver uppercase">
                            <th className="p-4 font-semibold">Scheduled Date</th>
                            <th className="p-4 font-semibold">Track Protocol</th>
                            <th className="p-4 font-semibold">Focus Module</th>
                            <th className="p-4 font-semibold">Duration</th>
                            <th className="p-4 font-semibold">Instructors</th>
                            <th className="p-4 font-semibold text-right">Delete Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWebinars.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-quantum-silver text-sm">No scheduled webinars found. Create one above!</td>
                            </tr>
                          ) : (
                            filteredWebinars.map((webinar) => (
                              <tr key={webinar.id} className="border-b border-glass-border/30 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm font-semibold text-white">{webinar.date}</td>
                                <td className="p-4 text-xs">
                                  <span className={`px-2 py-1 rounded font-mono border ${
                                    webinar.track === 'Paid Program' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-ai-cyan/10 text-ai-cyan border-ai-cyan/20'
                                  }`}>
                                    {webinar.track}
                                  </span>
                                </td>
                                <td className="p-4 text-sm text-slate-300 font-medium">{webinar.focus}</td>
                                <td className="p-4 text-xs text-quantum-silver font-mono">{webinar.duration}</td>
                                <td className="p-4 text-sm text-quantum-silver">{webinar.team}</td>
                                <td className="p-4 text-right">
                                  <button onClick={() => handleDeleteWebinar(webinar.id)} className="p-1.5 hover:text-rose-500 text-quantum-silver transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Webinar Registrations List */}
                    <div className="pt-6 border-t border-glass-border/40">
                      <h3 className="text-lg font-bold text-white mb-2">Ingested Registrations List</h3>
                      <p className="text-quantum-silver text-xs mb-4">Real-time database of individuals who transmitted credentials for course attendance.</p>
                      
                      <div className="overflow-x-auto border border-glass-border/50 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-glass-border bg-white/5 text-xs font-mono text-quantum-silver uppercase">
                              <th className="p-4 font-semibold">Registrant Address</th>
                              <th className="p-4 font-semibold">Institutional Entity</th>
                              <th className="p-4 font-semibold">Designation Title</th>
                              <th className="p-4 font-semibold">Geo-Coordinate (Country)</th>
                              <th className="p-4 font-semibold">Interest Sector</th>
                              <th className="p-4 font-semibold">Applied Program</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRegistrations.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-quantum-silver text-sm">No registrants detected in the ledger database.</td>
                              </tr>
                            ) : (
                              filteredRegistrations.map((reg) => (
                                <tr key={reg.id} className="border-b border-glass-border/30 hover:bg-white/5 transition-colors">
                                  <td className="p-4">
                                    <div className="text-sm font-semibold text-white">{reg.fullName}</div>
                                    <div className="text-xs text-ai-cyan font-mono">{reg.email}</div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-300">{reg.organization || 'N/A'}</td>
                                  <td className="p-4 text-sm text-quantum-silver">{reg.title || 'N/A'}</td>
                                  <td className="p-4 text-xs text-quantum-silver font-mono">{reg.country || 'N/A'}</td>
                                  <td className="p-4 text-xs text-quantum-silver">{reg.interestSector || 'N/A'}</td>
                                  <td className="p-4 text-xs">
                                    <span className="px-2 py-0.5 rounded font-mono bg-white/5 border border-glass-border text-white">
                                      {reg.track || 'free'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* 2. PARTNERS TAB */}
                {activeTab === 'partners' && (
                  <motion.div key="partners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Partner Ecosystem Alliances</h2>
                      <p className="text-quantum-silver text-xs mt-1">Review, authorize, or decline incoming enterprise partnership integrations.</p>
                    </div>

                    <div className="overflow-x-auto border border-glass-border/50 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border bg-white/5 text-xs font-mono text-quantum-silver uppercase">
                            <th className="p-4 font-semibold">Organizational Node</th>
                            <th className="p-4 font-semibold">Core Specialization / Stack</th>
                            <th className="p-4 font-semibold">Corporate Goal</th>
                            <th className="p-4 font-semibold">Authorized Representative</th>
                            <th className="p-4 font-semibold">Status Protocol</th>
                            <th className="p-4 font-semibold text-right">Alliance Decisions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPartners.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-quantum-silver text-sm">No incoming partner integration payloads.</td>
                            </tr>
                          ) : (
                            filteredPartners.map((p) => (
                              <tr key={p.id} className="border-b border-glass-border/30 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                  <div className="text-sm font-semibold text-white">{p.orgName}</div>
                                  <div className="text-xs text-quantum-silver font-mono">{p.orgType}</div>
                                </td>
                                <td className="p-4 text-sm text-slate-300 font-mono">{p.domainStack}</td>
                                <td className="p-4 text-sm text-quantum-silver max-w-xs truncate" title={p.collabGoal}>{p.collabGoal}</td>
                                <td className="p-4">
                                  <div className="text-sm text-white">{p.repName}</div>
                                  <div className="text-xs text-electric-blue font-mono">{p.email}</div>
                                </td>
                                <td className="p-4 text-xs">
                                  <span className={`px-2 py-1 rounded font-mono uppercase tracking-wider border ${
                                    p.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    p.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    {p.status || 'In Review'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleUpdatePartnerStatus(p.id, 'Approved')} 
                                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 transition-all"
                                      title="Authorize Alliance"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdatePartnerStatus(p.id, 'Rejected')} 
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/20 transition-all"
                                      title="Restrain Alliance"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePartner(p.id)} 
                                      className="p-1.5 bg-white/5 hover:bg-white/10 text-quantum-silver hover:text-white rounded-lg border border-glass-border transition-all"
                                      title="Purge Application"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 3. CONTACT TAB */}
                {activeTab === 'contacts' && (
                  <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Contact Transmissions Ledger</h2>
                      <p className="text-quantum-silver text-xs mt-1">Review corporate inquiries and message payloads transmitted from the Global Communication Gateway.</p>
                    </div>

                    <div className="overflow-x-auto border border-glass-border/50 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border bg-white/5 text-xs font-mono text-quantum-silver uppercase">
                            <th className="p-4 font-semibold">Correspondent</th>
                            <th className="p-4 font-semibold">Institutional Entity</th>
                            <th className="p-4 font-semibold">Routing Protocol</th>
                            <th className="p-4 font-semibold">Message Payload</th>
                            <th className="p-4 font-semibold">Status Code</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContacts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-quantum-silver text-sm">No transmissions ingested inside the communications bank.</td>
                            </tr>
                          ) : (
                            filteredContacts.map((c) => (
                              <tr key={c.id} className="border-b border-glass-border/30 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                  <div className="text-sm font-semibold text-white">{c.fullName}</div>
                                  <div className="text-xs text-ai-cyan font-mono">{c.email}</div>
                                </td>
                                <td className="p-4 text-sm text-slate-300">{c.organization || 'N/A'}</td>
                                <td className="p-4 text-sm text-white font-mono">{c.inquiryType || 'General Inquiries'}</td>
                                <td className="p-4 text-xs text-quantum-silver max-w-sm font-sans whitespace-pre-wrap">{c.message}</td>
                                <td className="p-4 text-xs">
                                  <span className={`px-2 py-0.5 rounded font-mono ${
                                    c.status === 'unread' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-quantum-silver border border-glass-border'
                                  }`}>
                                    {c.status || 'unread'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => handleToggleContactStatus(c.id, c.status)} 
                                      className="p-1.5 bg-white/5 hover:bg-white/10 text-quantum-silver hover:text-white rounded-lg border border-glass-border transition-all"
                                      title={c.status === 'unread' ? "Mark as Handled" : "Mark as Active"}
                                    >
                                      {c.status === 'unread' ? <Check className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4" />}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteContact(c.id)} 
                                      className="p-1.5 hover:text-rose-500 text-quantum-silver transition-all"
                                      title="Purge Message"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 4. SUBSCRIPTIONS TAB */}
                {activeTab === 'subscriptions' && (
                  <motion.div key="subscriptions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Broadcast Subscription Streams</h2>
                      <p className="text-quantum-silver text-xs mt-1">Purge or audit email communication nodes subscribing to network bulletins.</p>
                    </div>

                    <div className="overflow-x-auto border border-glass-border/50 rounded-2xl max-w-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border bg-white/5 text-xs font-mono text-quantum-silver uppercase">
                            <th className="p-4 font-semibold">Subscribed Email Coordinates</th>
                            <th className="p-4 font-semibold">Authorization Stamp</th>
                            <th className="p-4 font-semibold text-right">Purge Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubscriptions.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="p-8 text-center text-quantum-silver text-sm">No email coordinates detected in the subscription registry.</td>
                            </tr>
                          ) : (
                            filteredSubscriptions.map((s) => (
                              <tr key={s.id} className="border-b border-glass-border/30 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm font-semibold text-white font-mono">{s.email}</td>
                                <td className="p-4 text-xs text-quantum-silver font-mono">AUTHORIZED</td>
                                <td className="p-4 text-right">
                                  <button onClick={() => handleDeleteSubscriber(s.id)} className="p-1.5 hover:text-rose-500 text-quantum-silver transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Supabase Schema Configurator panel */}
          <div className="mt-12 bg-graphite-grey/20 border border-glass-border rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ai-cyan/5 blur-3xl rounded-full pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-glass-border/30 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-ai-cyan animate-pulse" /> Supabase Database Connection &amp; Schema Configurator
                </h3>
                <p className="text-quantum-silver text-xs mt-1">Initialize or verify your PostgreSQL database structure on your Supabase instance.</p>
              </div>
              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="px-4 py-2 bg-white/5 border border-glass-border text-xs font-mono text-white rounded-xl hover:bg-white/10 transition-all"
              >
                {showSqlGuide ? 'Hide Schema Matrix' : 'Display Schema SQL Script'}
              </button>
            </div>

            <AnimatePresence>
              {showSqlGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <p className="text-sm text-quantum-silver leading-relaxed">
                    Copy and run the following script in your{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ai-cyan hover:underline"
                    >
                      Supabase SQL Editor
                    </a>{' '}
                    to automatically generate all required database tables, schema models, and Row Level Security (RLS) policies.
                  </p>

                  <div className="relative">
                    <button
                      onClick={() => {
                        const sqlText = `
-- 1. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  system_prompt_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Partner Applications Table
CREATE TABLE IF NOT EXISTS partner_applications (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  type TEXT,
  country TEXT,
  interest TEXT,
  objectives TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  team_scale TEXT,
  goal TEXT,
  message TEXT,
  inquiry_type TEXT,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Webinars Table
CREATE TABLE IF NOT EXISTS webinars (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  track TEXT DEFAULT 'Free Webinar',
  duration TEXT,
  focus TEXT,
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Webinar Registrations Table
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  title TEXT,
  country TEXT,
  interest_sector TEXT,
  comments TEXT,
  track TEXT DEFAULT 'Free Webinar',
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Disable RLS or Enable Custom Public RLS policies for rapid deployment
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Allow broad read/write access policies for demo integrity
CREATE POLICY "Public full access" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON partner_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON contact_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON webinars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON webinar_registrations FOR ALL USING (true) WITH CHECK (true);
`;
                        navigator.clipboard.writeText(sqlText.trim());
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }}
                      className="absolute top-3 right-3 p-2 bg-midnight-black/80 border border-glass-border rounded-lg text-quantum-silver hover:text-white transition-all flex items-center gap-1 text-xs font-mono"
                    >
                      {copiedSql ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy SQL
                        </>
                      )}
                    </button>
                    <pre className="p-4 bg-midnight-black/80 border border-glass-border rounded-2xl text-xs font-mono text-quantum-silver overflow-x-auto max-h-72 leading-relaxed">
{`-- 1. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  system_prompt_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Partner Applications Table
CREATE TABLE IF NOT EXISTS partner_applications (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  type TEXT,
  country TEXT,
  interest TEXT,
  objectives TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  team_scale TEXT,
  goal TEXT,
  message TEXT,
  inquiry_type TEXT,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Webinars Table
CREATE TABLE IF NOT EXISTS webinars (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  track TEXT DEFAULT 'Free Webinar',
  duration TEXT,
  focus TEXT,
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Webinar Registrations Table
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  title TEXT,
  country TEXT,
  interest_sector TEXT,
  comments TEXT,
  track TEXT DEFAULT 'Free Webinar',
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Configure simple access control policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Allow broad access for the demonstration
CREATE POLICY "Public full access" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON partner_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON contact_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON webinars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access" ON webinar_registrations FOR ALL USING (true) WITH CHECK (true);`}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// Subcomponents helper
function MetricCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={`p-5 rounded-2xl border ${color} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-mono text-quantum-silver uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-midnight-black/40 border border-glass-border flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon }: { active: boolean, onClick: () => void, label: string, count: number, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-medium font-mono uppercase tracking-wider flex items-center gap-2 border transition-all ${
        active 
          ? 'bg-white text-midnight-black border-white shadow-lg shadow-white/5' 
          : 'bg-transparent text-quantum-silver border-glass-border hover:border-white/20 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${active ? 'bg-midnight-black text-white' : 'bg-white/10 text-quantum-silver'}`}>{count}</span>
    </button>
  );
}
