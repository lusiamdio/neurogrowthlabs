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

const SUPER_ADMIN_EMAILS = new Set([
  'simao@neurogrowthlabs.co.za',
  'lusimadio12@gmail.com',
]);

// SHA-256 digest of the super-admin emergency fallback passphrase
const SUPER_ADMIN_FALLBACK_HASH =
  'f493c8e0a2f7e6567210961ea84f52830f09772e581dc5cc404dff18f18512c7';

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Deterministic non-reversible FNV-1a fallback when WebCrypto is unavailable
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c ^ i;
    h2 = Math.imul(h2, 0x01000193);
  }
  return `fnv:${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

function readStoredLearners(): Record<string, any> {
  try {
    const raw = localStorage.getItem('ngl_registered_learners');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredLearners(accounts: Record<string, any>) {
  try {
    localStorage.setItem('ngl_registered_learners', JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors
  }
}

function deriveRole(email?: string | null, dbRole?: string | null): string {
  if (dbRole) return dbRole;
  const normalized = (email || '').trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.has(normalized) ? 'super_admin' : 'learner';
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
    // Migrate any legacy plaintext passwords in localStorage to hashed entries
    try {
      const existing = readStoredLearners();
      let mutated = false;
      Object.keys(existing).forEach((emailKey) => {
        const entry = existing[emailKey];
        if (entry && typeof entry.password === 'string' && !entry.passwordHash) {
          mutated = true;
          hashPassword(entry.password).then((hash) => {
            const latest = readStoredLearners();
            if (latest[emailKey]) {
              delete latest[emailKey].password;
              latest[emailKey].passwordHash = hash;
              writeStoredLearners(latest);
            }
          });
        }
      });
      if (mutated) {
        // Handled asynchronously per entry above
      }
    } catch {
      // Non-blocking migration
    }

    const getInitialSession = async () => {
      try {
        if (localStorage.getItem('local_admin_session') === 'true') {
          setUser({
            uid: 'simao-fallback-id',
            id: 'simao-fallback-id',
            email: 'simao@neurogrowthlabs.co.za',
            displayName: 'Mr. Lusimanadio Soki Simao, MBA',
            country: 'South Africa',
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
              setUserRole(parsed.role || deriveRole(parsed.email));
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse saved learner session, clearing invalid cache:', e);
            localStorage.removeItem('ngl_learner_session');
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const sUser = session.user;
          const cleanEmail = (sUser.email || '').trim().toLowerCase();
          const storedAccounts = readStoredLearners();
          const localReg = storedAccounts[cleanEmail] || {};
          let role = deriveRole(cleanEmail);

          try {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', sUser.id)
              .maybeSingle();

            if (data?.role) {
              role = data.role;
            } else {
              await supabase.from('users').upsert(
                {
                  id: sUser.id,
                  email: sUser.email,
                  role,
                },
                { onConflict: 'id' }
              );
            }
          } catch (dbErr) {
            console.warn("Database note fetching role (normal if 'users' table absent):", dbErr);
          }

          const mappedUser: CustomUser = {
            uid: sUser.id,
            id: sUser.id,
            email: sUser.email,
            displayName:
              sUser.user_metadata?.full_name ||
              localReg.displayName ||
              sUser.email?.split('@')[0] ||
              'Learner',
            country: sUser.user_metadata?.country || localReg.country || 'South Africa',
            registeredAt:
              sUser.user_metadata?.registered_at || localReg.registeredAt || sUser.created_at,
            role,
          };
          setUser(mappedUser);
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.warn('Session initialization fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (localStorage.getItem('local_admin_session') === 'true') {
          return;
        }

        if (session?.user) {
          const sUser = session.user;
          const cleanEmail = (sUser.email || '').trim().toLowerCase();
          const storedAccounts = readStoredLearners();
          const localReg = storedAccounts[cleanEmail] || {};
          let role = deriveRole(cleanEmail);

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
            console.warn('Database note on state change role fetch:', dbErr);
          }

          const mappedUser: CustomUser = {
            uid: sUser.id,
            id: sUser.id,
            email: sUser.email,
            displayName:
              sUser.user_metadata?.full_name ||
              localReg.displayName ||
              sUser.email?.split('@')[0] ||
              'Learner',
            country: sUser.user_metadata?.country || localReg.country || 'South Africa',
            registeredAt:
              sUser.user_metadata?.registered_at || localReg.registeredAt || sUser.created_at,
            role,
          };
          setUser(mappedUser);
          setUserRole(role);
        } else {
          const savedLearner = localStorage.getItem('ngl_learner_session');
          if (!savedLearner) {
            setUser(null);
            setUserRole(null);
          }
        }
        setLoading(false);
      });
      subscription = res.data?.subscription;
    } catch (subErr) {
      console.warn('Failed to subscribe to auth state changes:', subErr);
    }

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const updateDisplayName = (name: string) => {
    if (!name.trim()) return;
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, displayName: name.trim() };
      try {
        localStorage.setItem('ngl_learner_session', JSON.stringify(updated));
      } catch {
        // Ignore quota errors
      }
      return updated;
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    // 1. Super Admin emergency shortcut verified via SHA-256 digest
    if (cleanEmail === 'simao@neurogrowthlabs.co.za' && passwordHash === SUPER_ADMIN_FALLBACK_HASH) {
      localStorage.setItem('local_admin_session', 'true');
      const adminUser: CustomUser = {
        uid: 'simao-fallback-id',
        id: 'simao-fallback-id',
        email: 'simao@neurogrowthlabs.co.za',
        displayName: 'Mr. Lusimanadio Soki Simao, MBA',
        country: 'South Africa',
        role: 'super_admin',
      };
      setUser(adminUser);
      setUserRole('super_admin');
      return;
    }

    // 2. Check locally stored learner account when registered local-only or browser is offline
    const storedAccounts = readStoredLearners();
    const existingLocal = storedAccounts[cleanEmail];
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

    if (existingLocal && (existingLocal.localOnly || isOffline)) {
      const passwordMatches =
        (existingLocal.passwordHash && existingLocal.passwordHash === passwordHash) ||
        (!existingLocal.passwordHash && existingLocal.password === password);
      if (passwordMatches) {
        const uid =
          existingLocal.uid ||
          'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
        const role = deriveRole(cleanEmail);
        const learnerUser: CustomUser = {
          uid,
          id: uid,
          email: cleanEmail,
          displayName: existingLocal.displayName || cleanEmail.split('@')[0],
          country: existingLocal.country || 'South Africa',
          registeredAt: existingLocal.registeredAt,
          role,
        };
        setUser(learnerUser);
        setUserRole(role);
        localStorage.setItem('ngl_learner_session', JSON.stringify(learnerUser));
        return;
      }
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    // 3. Primary Supabase authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;
      if (data?.user) {
        const localReg = storedAccounts[cleanEmail] || {};
        const role = deriveRole(cleanEmail);
        const mappedUser: CustomUser = {
          uid: data.user.id,
          id: data.user.id,
          email: data.user.email,
          displayName:
            data.user.user_metadata?.full_name ||
            localReg.displayName ||
            cleanEmail.split('@')[0],
          country: data.user.user_metadata?.country || localReg.country || 'South Africa',
          registeredAt:
            data.user.user_metadata?.registered_at ||
            localReg.registeredAt ||
            data.user.created_at,
          role,
        };
        setUser(mappedUser);
        setUserRole(role);
        localStorage.setItem('ngl_learner_session', JSON.stringify(mappedUser));
        return;
      }
    } catch (err: any) {
      // Fallback ONLY to verified locally registered accounts (never accept arbitrary unverified passwords)
      const account = storedAccounts[cleanEmail];
      if (account) {
        const passwordMatches =
          (account.passwordHash && account.passwordHash === passwordHash) ||
          (!account.passwordHash && account.password === password);
        if (passwordMatches) {
          const uid =
            account.uid ||
            'learner-' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
          const role = deriveRole(cleanEmail);
          const learnerUser: CustomUser = {
            uid,
            id: uid,
            email: cleanEmail,
            displayName: account.displayName || cleanEmail.split('@')[0],
            country: account.country || 'South Africa',
            registeredAt: account.registeredAt,
            role,
          };
          setUser(learnerUser);
          setUserRole(role);
          localStorage.setItem('ngl_learner_session', JSON.stringify(learnerUser));
          return;
        }
        throw new Error('Invalid email or password. Please check your credentials.');
      }

      if (err?.message?.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials or register.');
      }
      throw new Error(
        err?.message ||
          'No registered account found for this email. Please register first or verify your credentials.'
      );
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    name?: string,
    country?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const formattedName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];
    const formattedCountry = country && country.trim() ? country.trim() : 'South Africa';
    const registeredAt = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: formattedName,
            country: formattedCountry,
            registered_at: registeredAt,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        const role = deriveRole(cleanEmail);
        const mappedUser: CustomUser = {
          uid: data.user.id,
          id: data.user.id,
          email: data.user.email,
          displayName: formattedName,
          country: formattedCountry,
          registeredAt,
          role,
        };
        setUser(mappedUser);
        setUserRole(role);
        localStorage.setItem('ngl_learner_session', JSON.stringify(mappedUser));

        const storedAccounts = readStoredLearners();
        storedAccounts[cleanEmail] = {
          uid: data.user.id,
          email: cleanEmail,
          displayName: formattedName,
          country: formattedCountry,
          registeredAt,
          passwordHash,
        };
        writeStoredLearners(storedAccounts);
        return;
      }
    } catch (err: any) {
      console.warn(
        'Sign up via remote API unavailable, activating resilient local learner profile:',
        err?.message || err
      );
      const newUid = 'learner-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const role = deriveRole(cleanEmail);
      const resilientLearner: CustomUser = {
        uid: newUid,
        id: newUid,
        email: cleanEmail,
        displayName: formattedName,
        country: formattedCountry,
        registeredAt,
        role,
      };

      const storedAccounts = readStoredLearners();
      storedAccounts[cleanEmail] = {
        uid: newUid,
        email: cleanEmail,
        displayName: formattedName,
        country: formattedCountry,
        registeredAt,
        passwordHash,
        localOnly: true,
      };
      writeStoredLearners(storedAccounts);

      setUser(resilientLearner);
      setUserRole(role);
      localStorage.setItem('ngl_learner_session', JSON.stringify(resilientLearner));
    }
  };

  const logout = async () => {
    localStorage.removeItem('local_admin_session');
    localStorage.removeItem('ngl_learner_session');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      setUser(null);
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, loading, loginWithEmail, registerWithEmail, updateDisplayName, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
