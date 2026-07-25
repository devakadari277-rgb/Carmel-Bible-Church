import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

interface UserProfile {
  phone_number: string;
  address: string;
  profile_photo: string | null;
  bio: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'member';
  is_staff: boolean;
  is_superuser: boolean;
  profile: UserProfile;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (emailOrUsername: string, password: string) => Promise<{ status: 'success'; data: any }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    // Check dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token by calling profile API
        api.get('/api/profile/')
          .then((res) => {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          })
          .catch(() => {
            // Token might be invalid, Axios response interceptor handles it, 
            // but if failed we can logout.
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const login = async (emailOrUsername: string, password: string): Promise<{ status: 'success'; data: any }> => {
    const res = await api.post('/api/auth/login/', { email_or_username: emailOrUsername, password });
    const { user: loggedUser, tokens } = res.data;
    localStorage.setItem('token', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return { status: 'success' as const, data: loggedUser };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
