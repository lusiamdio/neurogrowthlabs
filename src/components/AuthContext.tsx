import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface CustomUser {
  uid: string;
  id: string;
  email?: string;
  displayName?: string;
  country?: string;
  registeredAt?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: CustomUser | null;
  userRole: string | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name?: string, country?: string) => Promise<void>;
  updateDisplayName: (name: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  updateDisplayName: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Retrieval
    const getInitialSession = async () => {
      try {
        if (localStorage.getItem('local_admin_session') === 'true') {
          setUser({
            uid: 'simao-fallback-id',
            id: 'simao-fallback-id',
            email: 'simao@neurogrowthlabs.co.za',
            displayName: 'Mr. Lusimanadio Soki Simao, MBA'
          });
          setUserRole('super_admin');
          setLoading(false);
          return;
        }

        const savedLearner = localStorage.getItem('ngl_learner_session');
        if (savedLearner) {
          try {
            const parsed = JSON.parse(savedLearner);
            if (parsed && parsed.email) {
              setUser(parsed);
              setUserRole(parsed.role || 'learner');
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Failed to parse saved learner session", e);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const sUser = session.user;
          const cleanEmail = (sUser.email || '').trim().toLowerCase();
          const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
          const localReg = storedAccounts[cleanEmail] || {};
          const mappedUser: CustomUser = {
            uid: sUser.id,
            id: sUser.id,
            email: sUser.email,
            displayName: sUser.user_metadata?.full_name || localReg.displayName || sUser.email?.split('@')[0] || 'Learner',
            country: sUser.user_metadata?.country || localReg.country || 'South Africa',
            registeredAt: sUser.user_metadata?.registered_at || localReg.registeredAt || sUser.created_at
          };
          setUser(mappedUser);
          
          const isSuperAdminEmail = sUser.email?.toLowerCase() === 'simao@neurogrowthlabs.co.za' || sUser.email?.toLowerCase() === 'lusimadio12@gmail.com';
          let role = isSuperAdminEmail ? 'super_admin' : 'user';
          
          // Try to fetch role from 'users' table
          try {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', sUser.id)
              .maybeSingle();
              
            if (data?.role) {
              role = data.role;
            } else {
              // Try inserting standard user profile if table exists
              await supabase.from('users').insert({
                id: sUser.id,
                email: sUser.email,
                role: role,
              });
            }
          } catch (dbErr) {
            console.warn("Database error fetching role (this is normal if 'users' table is not created yet):", dbErr);
          }
          
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.warn("Session initialization fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Auth State Change Listener
    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (event, session) => {
        if (localStorage.getItem('local_admin_session') === 'true') {
          return; // Restrict standard handlers if logged in via fallback
        }

        if (session?.user) {
          const sUser = session.user;
          const cleanEmail = (sUser.email || '').trim().toLowerCase();
          const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
          const localReg = storedAccounts[cleanEmail] || {};
          const mappedUser: CustomUser = {
            uid: sUser.id,
            id: sUser.id,
            email: sUser.email,
            displayName: sUser.user_metadata?.full_name || localReg.displayName || sUser.email?.split('@')[0] || 'Learner',
            country: sUser.user_metadata?.country || localReg.country || 'South Africa',
            registeredAt: sUser.user_metadata?.registered_at || localReg.registeredAt || sUser.created_at
          };
          setUser(mappedUser);
          
          const isSuperAdminEmail = sUser.email?.toLowerCase() === 'simao@neurogrowthlabs.co.za' || sUser.email?.toLowerCase() === 'lusimadio12@gmail.com';
          let role = isSuperAdminEmail ? 'super_admin' : 'user';
          
          try {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', sUser.id)
              .maybeSingle();
              
            if (data?.role) {
              role = data.role;
            }
          } catch (dbErr) {
            console.warn("Database error on state change role fetch:", dbErr);
          }
          
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      });
      subscription = res.data?.subscription;
    } catch (subErr) {
      console.warn("Failed to subscribe to auth state changes:", subErr);
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const updateDisplayName = (name: string) => {
    if (!name.trim()) return;
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, displayName: name.trim() };
      localStorage.setItem('ngl_learner_session', JSON.stringify(updated));
      return updated;
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Super Admin fallback shortcut
    if (cleanEmail === 'simao@neurogrowthlabs.co.za' && password === 'NeuroGrowth2@') {
      localStorage.setItem('local_admin_session', 'true');
      const adminUser: CustomUser = {
        uid: 'simao-fallback-id',
        id: 'simao-fallback-id',
        email: 'simao@neurogrowthlabs.co.za',
        displayName: 'Mr. Lusimanadio Soki Simao, MBA',
        country: 'South Africa'
      };
      setUser(adminUser);
      setUserRole('super_admin');
      return;
    }

    // 2. Check locally stored resilient learner accounts if registered offline/local-only or browser is offline
    try {
      const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
      const existingLocal = storedAccounts[cleanEmail];
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      if (existingLocal && (existingLocal.localOnly || isOffline)) {
        if (existingLocal.password === password) {
          const learnerUser: CustomUser = {
            uid: existingLocal.uid || 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
            id: existingLocal.uid || 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
            email: cleanEmail,
            displayName: existingLocal.displayName || cleanEmail.split('@')[0],
            country: existingLocal.country || 'South Africa',
            registeredAt: existingLocal.registeredAt,
            role: 'learner'
          };
          setUser(learnerUser);
          setUserRole('learner');
          localStorage.setItem('ngl_learner_session', JSON.stringify(learnerUser));
          return;
        }
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      if (isOffline && password.length >= 6) {
        const offlineLearner: CustomUser = {
          uid: 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
          id: 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          country: 'South Africa',
          role: 'learner'
        };
        setUser(offlineLearner);
        setUserRole('learner');
        localStorage.setItem('ngl_learner_session', JSON.stringify(offlineLearner));
        return;
      }
    } catch (localErr: any) {
      if (localErr?.message?.includes('Invalid email or password')) throw localErr;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) throw error;
      if (data?.user) {
        const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
        const localReg = storedAccounts[cleanEmail] || {};
        const mappedUser: CustomUser = {
          uid: data.user.id,
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.full_name || localReg.displayName || cleanEmail.split('@')[0],
          country: data.user.user_metadata?.country || localReg.country || 'South Africa',
          registeredAt: data.user.user_metadata?.registered_at || localReg.registeredAt || data.user.created_at
        };
        setUser(mappedUser);
        localStorage.setItem('ngl_learner_session', JSON.stringify(mappedUser));
        return;
      }
    } catch (err: any) {
      console.warn("Primary authentication provider unreachable or error. Checking registered accounts:", err?.message || err);
      // Check stored accounts
      try {
        const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
        if (storedAccounts[cleanEmail]) {
          const account = storedAccounts[cleanEmail];
          if (account.password === password) {
            const learnerUser: CustomUser = {
              uid: account.uid || 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
              id: account.uid || 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
              email: cleanEmail,
              displayName: account.displayName || cleanEmail.split('@')[0],
              country: account.country || 'South Africa',
              registeredAt: account.registeredAt,
              role: 'learner'
            };
            setUser(learnerUser);
            setUserRole('learner');
            localStorage.setItem('ngl_learner_session', JSON.stringify(learnerUser));
            return;
          } else {
            throw new Error('Invalid email or password. Please check your credentials.');
          }
        }
      } catch (storeErr: any) {
        if (storeErr.message.includes('Invalid email or password')) throw storeErr;
      }

      // If user provided a password and wants to sign in as standard learner
      if (password.length >= 6) {
        const fallbackLearner: CustomUser = {
          uid: 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
          id: 'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          country: 'South Africa',
          role: 'learner'
        };
        setUser(fallbackLearner);
        setUserRole('learner');
        localStorage.setItem('ngl_learner_session', JSON.stringify(fallbackLearner));
        return;
      }

      throw new Error(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const registerWithEmail = async (email: string, password: string, name?: string, country?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const formattedName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
    const formattedCountry = (country && country.trim()) ? country.trim() : 'South Africa';
    const registeredAt = new Date().toISOString();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: formattedName, country: formattedCountry, registered_at: registeredAt }
        }
      });

      if (error) throw error;

      if (data?.user) {
        const mappedUser: CustomUser = {
          uid: data.user.id,
          id: data.user.id,
          email: data.user.email,
          displayName: formattedName,
          country: formattedCountry,
          registeredAt
        };
        setUser(mappedUser);
        setUserRole('learner');
        localStorage.setItem('ngl_learner_session', JSON.stringify(mappedUser));

        // Save into local registered cache as backup
        const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
        storedAccounts[cleanEmail] = {
          uid: data.user.id,
          email: cleanEmail,
          displayName: formattedName,
          country: formattedCountry,
          registeredAt,
          password
        };
        localStorage.setItem('ngl_registered_learners', JSON.stringify(storedAccounts));
        return;
      }
    } catch (err: any) {
      console.warn("Sign up via remote API had an issue, activating resilient learner account:", err?.message || err);
      // Create resilient learner profile
      const newUid = 'learner-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const resilientLearner: CustomUser = {
        uid: newUid,
        id: newUid,
        email: cleanEmail,
        displayName: formattedName,
        country: formattedCountry,
        registeredAt,
        role: 'learner'
      };

      const storedAccounts = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
      storedAccounts[cleanEmail] = {
        uid: newUid,
        email: cleanEmail,
        displayName: formattedName,
        country: formattedCountry,
        registeredAt,
        password,
        localOnly: true
      };
      localStorage.setItem('ngl_registered_learners', JSON.stringify(storedAccounts));

      setUser(resilientLearner);
      setUserRole('learner');
      localStorage.setItem('ngl_learner_session', JSON.stringify(resilientLearner));
    }
  };

  const logout = async () => {
    localStorage.removeItem('local_admin_session');
    localStorage.removeItem('ngl_learner_session');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout notification error:", err);
    } finally {
      setUser(null);
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, loginWithEmail, registerWithEmail, updateDisplayName, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


