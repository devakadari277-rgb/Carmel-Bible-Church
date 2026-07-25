import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { Mail, Lock, UserPlus, LogIn, User, Phone } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // Sign In States
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sign Up States
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!emailOrUsername.trim() || !password) {
      setLoginError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(emailOrUsername.trim(), password);
      if (result.data.role === 'admin') {
        addToast('Login successful! Welcome to the Admin Dashboard.', 'success');
        navigate('/admin-dashboard');
      } else {
        addToast('Login successful! Welcome back.', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      let errMsg = 'Invalid credentials. Please check your username/email and password.';
      if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errMsg = err.response.data.detail;
      } else if (!err.response) {
        errMsg = 'Could not connect to the server. Please check if the Django backend server is running.';
      }
      setLoginError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Client-side validations (relaxed)
    const nameTrimmed = regFullName.trim();
    const usernameTrimmed = regUsername.trim();
    const emailTrimmed = regEmail.trim();
    const phoneTrimmed = regPhoneNumber.trim();

    if (!usernameTrimmed || !regPassword) {
      setRegError('Username and Password are required.');
      return;
    }

    setLoading(true);
    try {
      // 1. Send registration request
      await api.post('/api/auth/register/', {
        username: usernameTrimmed,
        email: emailTrimmed,
        password: regPassword,
        first_name: nameTrimmed,
        profile: {
          phone_number: phoneTrimmed
        }
      });

      // 2. Display success message
      setRegSuccess('✅ Registration Successful! Your account has been created successfully....');
      
      // 3. Clear fields
      setRegFullName('');
      setRegUsername('');
      setRegEmail('');
      setRegPhoneNumber('');
      setRegPassword('');

      // 4. Redirect to login after 2.5 seconds
      setTimeout(() => {
        setIsRegister(false);
        setRegSuccess('');
      }, 2500);

    } catch (err: any) {
      let errMsg = 'Failed to register. Please check your inputs.';
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          errMsg = Object.entries(errors)
            .map(([key, val]) => `${key.toUpperCase()}: ${Array.isArray(val) ? val.join(' ') : val}`)
            .join(' ');
        } else if (typeof errors === 'string') {
          errMsg = errors;
        }
      } else if (err.message) {
        errMsg = `Network Error: ${err.message}. Please verify if the backend  server is running.`;
      }
      setRegError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Warm Gold Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-church-blue-light/30 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-church-gold/10 rounded-full blur-3xl opacity-20"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 text-center">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display uppercase">
          {isRegister ? 'Member Sign Up' : 'Member Sign In'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {isRegister 
            ? 'Create an account to join the Carmel Bible Church portal' 
            : 'Enter credentials to access your church dashboard'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/60 border border-slate-800/85 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          
          {!isRegister ? (
            /* SIGN IN FORM */
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              {/* Login Error Box */}
              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 p-4 rounded-2xl text-xs font-semibold leading-relaxed animate-fade-in text-center">
                  ⚠️ {loginError}
                </div>
              )}

              {/* Username / Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="member@carmelbiblechurch.org"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
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

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-church-gold text-church-gold bg-transparent hover:bg-church-gold hover:text-church-blue rounded-2xl text-sm font-semibold transition-all shadow-lg hover:shadow-church-gold/15 disabled:opacity-50"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                  {!loading && <LogIn className="w-4 h-4" />}
                </button>
              </div>

              {/* Toggle Switch */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setLoginError('');
                  }}
                  className="text-xs text-church-gold hover:underline focus:outline-none font-medium"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP / REGISTRATION FORM */
            <form className="space-y-5" onSubmit={handleRegisterSubmit}>
              {/* Registration Alert Boxes */}
              {regSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 p-4 rounded-2xl text-xs font-semibold leading-relaxed animate-fade-in text-center">
                  {regSuccess}
                </div>
              )}
              {regError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-200 p-4 rounded-2xl text-xs font-semibold leading-relaxed animate-fade-in text-center">
                  ⚠️ {regError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Enter Your Name."
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Enter Your Username."
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="mail@gmail.com"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regPhoneNumber}
                    onChange={(e) => setRegPhoneNumber(e.target.value)}
                    placeholder="+91 0000000000"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
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
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={loading || !!regSuccess}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-church-gold text-church-gold bg-transparent hover:bg-church-gold hover:text-church-blue rounded-2xl text-sm font-semibold transition-all shadow-lg hover:shadow-church-gold/15 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                  {!loading && <UserPlus className="w-4 h-4" />}
                </button>
              </div>

              {/* Toggle Switch */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className="text-xs text-church-gold hover:underline focus:outline-none font-medium"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
