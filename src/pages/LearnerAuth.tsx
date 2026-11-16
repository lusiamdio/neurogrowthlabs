import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { 
  Lock, UserPlus, LogIn, ShieldCheck, Mail, Key, User, 
  ArrowRight, Award, BookOpen, Download, CheckCircle, Globe 
} from 'lucide-react';

export default function LearnerAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithEmail, registerWithEmail, user } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/academy';
  const contextType = searchParams.get('context') || 'general';
  const itemTitle = searchParams.get('item');

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (user) {
      navigate(redirectUrl);
    }
  }, [user, redirectUrl, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'register') {
        const nameToUse = fullName.trim() || cleanEmail.split('@')[0];
        await registerWithEmail(cleanEmail, password, nameToUse, country);
      } else {
        await loginWithEmail(cleanEmail, password);
      }
      navigate(redirectUrl);
    } catch (err: any) {
      console.warn('Authentication feedback:', err?.message || err);
      setErrorMsg(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 flex flex-col justify-between selection:bg-ai-cyan selection:text-midnight-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero & Scholar Benefits */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-ai-cyan">
              <ShieldCheck className="w-4 h-4" />
              <span>SOVEREIGN ACADEMY SCHOLAR ACCESS</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {activeTab === 'register' ? 'Join the Sovereign Intelligence Academy' : 'Welcome Back, Scholar'}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                {itemTitle ? (
                  <span>Access requested for <strong className="text-white">"{itemTitle}"</strong>. Sign in or create your verified scholar profile below to proceed.</span>
                ) : (
                  <span>Accredited cybersecurity, enterprise AI, and sovereign computing tracks crafted for African engineers and architects.</span>
                )}
              </p>
            </div>

            {/* Scholar Benefits List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02]">
                <BookOpen className="w-5 h-5 text-ai-cyan shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">5 Accredited Technical Courses</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Defensive AI, Zero-Trust, Sovereign LLMs, and Cloud Security.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02]">
                <Download className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">Peer-Reviewed Research Papers</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Download full papers on AI in African mining, sustainability, and compute sovereignty.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02]">
                <Award className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">Verifiable Certificate of Completion</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Autogenerated cryptographic credentials upon achieving 70%+ on capstone exams.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="lg:col-span-6 bg-[#0c1018] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#080b11] rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-ai-cyan text-midnight-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-ai-cyan text-midnight-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'register' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Legal Name (for Certificate)</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Amara Kone"
                      className="w-full bg-[#080b11] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Academic or Professional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="scholar@organization.africa"
                    className="w-full bg-[#080b11] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Security Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#080b11] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Primary Jurisdiction</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-[#080b11] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                  >
                    <option value="South Africa">South Africa</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Angola">Angola</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Other Pan-African">Other Pan-African</option>
                    <option value="International">International Scholar</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {activeTab === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : activeTab === 'register' ? 'Register Scholar Profile' : 'Sign In to Academy'}</span>
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              By proceeding, you agree to the <Link to="/terms-of-service" className="text-slate-400 hover:text-white underline">Terms</Link> and <Link to="/privacy-policy" className="text-slate-400 hover:text-white underline">Privacy Policy</Link>.
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
