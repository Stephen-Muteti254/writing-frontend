import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

interface User { /* same as your type */ id: number; full_name: string; email: string; phone: string; country: string; subscription_level: string; role: string; }

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: User, token: string, remember?: boolean) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // helper to clear
  const clearStorage = () => {
    console.warn('[Auth] clearStorage() called — reason unknown yet');
    console.trace('[Auth] stack trace for clearStorage call');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    delete api.defaults.headers.common['Authorization'];
  };

  // robust validator: only clear on explicit 401/403 or explicit invalid token response
  const validateTokenWithBackend = async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/me');
      console.debug('[Auth] validate response:', response.status, response.data);

      const userData = response.data?.user || response.data?.data || response.data;

      if (response.status === 200 && userData?.id) {
        console.debug('[Auth] token valid, updating user.');
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }

      console.warn('[Auth] validate: no user in response, marking invalid.');
      return false;
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data || err?.message;
      console.error('[Auth] validateTokenWithBackend error:', status, msg);

      if (status === 401 || status === 403) {
        console.warn('[Auth] backend rejected token (401/403) -> calling clearStorage()');
        clearStorage();
      }

      return false;
    }
  };


  // load on mount
  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      const storedToken =
        localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const storedUser =
        localStorage.getItem('user') || sessionStorage.getItem('user');

      if (storedToken && storedUser) {
        // ✅ Immediately restore token and user before validation
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          const isValid = await validateTokenWithBackend();
          if (!cancelled && !isValid) {
            console.warn('[Auth] Token invalid, clearing storage.');
            clearStorage();
            setUser(null);
            setAccessToken(null);
          }
        } catch (error) {
          console.error('[Auth] Error validating stored token:', error);
        }
      } else {
        clearStorage();
      }

      if (!cancelled) setIsLoading(false);
    };

    loadAuthState();
    return () => {
      cancelled = true;
    };
  }, []);


  const validateToken = async (): Promise<boolean> => {
    if (!accessToken) return false;
    return validateTokenWithBackend();
  };

  const login = (userObj: User, token: string, remember = true) => {
    setUser(userObj);
    setAccessToken(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    if (remember) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
    } else {
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('user', JSON.stringify(userObj));
    }
  };

  const logout = () => {
    // Ideally call backend logout endpoint if needed
    clearStorage();
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    validateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
