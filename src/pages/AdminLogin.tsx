import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { email?: string } | null;

  const [loading, setLoading] = useState(false);
  
  // Credentials State
  const [email, setEmail] = useState(state?.email || '');
  const [password, setPassword] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please provide your admin email/username and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/admin-login/', { email, password });
      if (res.data.status === 'success') {
        const { user: loggedUser, tokens } = res.data;
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        updateUser(loggedUser);
        addToast('Administrator authentication successful!', 'success');
        navigate('/admin-dashboard');
      }
    } catch (err: any) {
      let errMsg = 'Invalid administrator credentials.';
      if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (!err.response) {
        errMsg = 'Could not connect to the server. Please check if the Django backend server is running.';
      }
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Warm Gold Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-church-gold/10 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-church-blue-light/40 rounded-full blur-3xl opacity-30"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 text-center">
        <div className="inline-flex p-3 bg-church-gold/10 border border-church-gold/30 rounded-2xl text-church-gold mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight font-display">
          Admin Portal Verification
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Administrator authorization required to access administrative controls
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/60 border border-slate-800/80 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              {/* Email or Username Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Admin Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or Username"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-church-gold text-church-gold bg-transparent hover:bg-church-gold hover:text-church-blue rounded-2xl text-sm font-semibold transition-all shadow-lg hover:shadow-church-gold/15 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Authenticate Admin'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
