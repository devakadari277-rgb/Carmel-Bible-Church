import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import {
  User as UserIcon, HeartHandshake, Calendar,
  Settings, Loader, CheckCircle2, XCircle, Clock,
  Video, MapPin, Phone, LayoutDashboard, LogOut, Edit2, Trash2
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'prayers' | 'profile'>('overview');
  
  // Profile Update Form State
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phone_number || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Prayer Request Form State
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDesc, setPrayerDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayerVisibility, setPrayerVisibility] = useState('all');
  const [editingPrayerId, setEditingPrayerId] = useState<number | null>(null);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [myPrayers, setMyPrayers] = useState<any[]>([]);

  // Events List State
  const [events, setEvents] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Fetch Member Dashboard details
  useEffect(() => {
    if (user) {
      setLoadingOverview(true);
      // Fetch user's prayer requests
      api.get('/api/prayers/my_requests/')
        .then((res) => setMyPrayers(res.data))
        .catch(() => {});
      
      // Fetch upcoming events
      api.get('/api/events/')
        .then((res) => {
          const future = res.data.filter((e: any) => new Date(e.event_date) > new Date());
          setEvents(future.slice(0, 4));
        })
        .catch(() => {})
        .finally(() => setLoadingOverview(false));
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      addToast('Username and Email are required.', 'warning');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/api/profile/', {
        username,
        email,
        profile: {
          phone_number: phoneNumber,
          address,
          bio
        }
      });
      updateUser(res.data);
      addToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEditPrayerClick = (prayer: any) => {
    setEditingPrayerId(prayer.id);
    setPrayerTitle(prayer.title);
    setPrayerDesc(prayer.description);
    setIsAnonymous(prayer.is_anonymous);
    setPrayerVisibility(prayer.visibility || 'all');
  };

  const handleCancelPrayerEdit = () => {
    setEditingPrayerId(null);
    setPrayerTitle('');
    setPrayerDesc('');
    setIsAnonymous(false);
    setPrayerVisibility('all');
  };

  const handleDeletePrayerClick = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this prayer request?")) return;
    try {
      await api.delete(`/api/prayers/${id}/`);
      setMyPrayers(myPrayers.filter((p) => p.id !== id));
      addToast('Prayer request deleted successfully.', 'success');
    } catch {
      addToast('Failed to delete prayer request.', 'error');
    }
  };

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerTitle || !prayerDesc) {
      addToast('Please fill out the prayer title and description.', 'warning');
      return;
    }

    setSubmittingPrayer(true);
    try {
      if (editingPrayerId) {
        const res = await api.put(`/api/prayers/${editingPrayerId}/`, {
          title: prayerTitle,
          description: prayerDesc,
          is_anonymous: isAnonymous,
          visibility: prayerVisibility
        });
        setMyPrayers(myPrayers.map((p) => p.id === editingPrayerId ? res.data : p));
        addToast('Prayer request updated successfully!', 'success');
      } else {
        const res = await api.post('/api/prayers/', {
          title: prayerTitle,
          description: prayerDesc,
          is_anonymous: isAnonymous,
          visibility: prayerVisibility
        });
        // Add to local prayer requests list
        setMyPrayers((prev) => [res.data, ...prev]);
        if (prayerVisibility === 'all') {
          addToast('Prayer request submitted and is now visible on the prayer wall.', 'success');
        } else {
          addToast('Your private prayer request has been sent to the administrator.', 'success');
        }
      }
      setPrayerTitle('');
      setPrayerDesc('');
      setIsAnonymous(false);
      setPrayerVisibility('all');
      setEditingPrayerId(null);
    } catch (err) {
      addToast(editingPrayerId ? 'Failed to update prayer request.' : 'Failed to submit prayer request.', 'error');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-church-blue text-white border border-church-gold/15 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <UserIcon className="w-52 h-52" />
          </div>
          <span className="text-xs font-bold text-church-gold uppercase tracking-wider">Member Portal</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-1.5">
            Welcome, {user.username}!
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-xl">
            You are logged in as a registered member. You can submit prayer points, browse church activities, and modify your profile records below.
          </p>
          
          <div className="mt-5 flex gap-3 flex-wrap">
            {user.role === 'admin' && (
              <Link
                to="/admin-login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-church-gold/45 bg-church-gold/10 hover:bg-church-gold/25 text-church-gold text-xs font-bold tracking-wider uppercase transition-all shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}
            
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs font-bold tracking-wider uppercase transition-all shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-church-gold text-church-gold font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Portal Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('prayers')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'prayers'
                ? 'border-church-gold text-church-gold font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>My Prayers ({myPrayers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-church-gold text-church-gold font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div>
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left column: Quick details and upcoming events */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Events list */}
                <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md">
                  <h3 className="text-lg font-bold text-church-blue dark:text-white font-display mb-4">
                    Upcoming Church Gatherings
                  </h3>
                  
                  {loadingOverview ? (
                    <div className="py-12 flex justify-center"><Loader className="w-8 h-8 animate-spin text-church-gold" /></div>
                  ) : events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((e) => (
                        <div key={e.id} className="p-4 rounded-2xl bg-light-bg dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">{e.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(e.event_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{e.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-6 text-center">No upcoming events scheduled currently.</p>
                  )}
                </div>

                {/* Profile card preview */}
                <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="sm:col-span-1 flex flex-col items-center border-r border-slate-100 dark:border-slate-800 pr-0 sm:pr-6">
                    <div className="w-20 h-20 rounded-full bg-church-gold/10 flex items-center justify-center text-church-gold text-2xl font-bold mb-3 border-2 border-church-gold/20">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white text-center">{user.username}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                  <div className="sm:col-span-2 flex flex-col justify-center space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-4 h-4 text-church-gold" />
                      <span>{user.profile?.phone_number || 'No contact phone listed'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-4 h-4 text-church-gold" />
                      <span>{user.profile?.address || 'No physical address listed'}</span>
                    </div>
                    <div className="text-xs text-slate-400 italic">
                      {user.profile?.bio || '"No bio written yet. Click profile settings to update your profile details."'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right column: Quick shortcuts */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md">
                  <h4 className="font-bold text-slate-800 dark:text-white font-display mb-4">Quick Actions</h4>
                  <div className="space-y-3.5">
                    <button
                      onClick={() => setActiveTab('prayers')}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-light-bg dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-church-gold/30 hover:bg-church-gold/5 transition-all text-left group"
                    >
                      <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-white">Submit Prayer Request</span>
                        <span className="text-[10px] text-slate-400">Share your needs with intercessors</span>
                      </div>
                    </button>
                    <a
                      href="/live-stream"
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-light-bg dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-church-gold/30 hover:bg-church-gold/5 transition-all text-left group"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-white">Watch Live Stream</span>
                        <span className="text-[10px] text-slate-400">Join our weekly Sunday services</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 2. PRAYER REQUESTS TAB */}
          {activeTab === 'prayers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form to submit request */}
              <div className="lg:col-span-5">
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md">
                  <h3 className="text-lg font-bold text-church-blue dark:text-white font-display mb-6">
                    {editingPrayerId ? 'Edit Prayer Request' : 'File a Prayer Request'}
                  </h3>
                  
                  <form onSubmit={handlePrayerSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Prayer Title</label>
                      <input
                        type="text"
                        value={prayerTitle}
                        onChange={(e) => setPrayerTitle(e.target.value)}
                        placeholder="Healing for my grandmother"
                        className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Prayer Description / Request</label>
                      <textarea
                        rows={4}
                        value={prayerDesc}
                        onChange={(e) => setPrayerDesc(e.target.value)}
                        placeholder="Please pray for her recovery from pneumonia..."
                        className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">Who can view this request?</label>
                      <div className="flex gap-6 mt-1 mb-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input
                            type="radio"
                            name="prayerVisibility"
                            value="all"
                            checked={prayerVisibility === 'all'}
                            onChange={() => setPrayerVisibility('all')}
                            className="w-4 h-4 text-church-gold border-slate-300 focus:ring-church-gold focus:ring-2 cursor-pointer"
                          />
                          <span>Everyone (All)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input
                            type="radio"
                            name="prayerVisibility"
                            value="admin"
                            checked={prayerVisibility === 'admin'}
                            onChange={() => setPrayerVisibility('admin')}
                            className="w-4 h-4 text-church-gold border-slate-300 focus:ring-church-gold focus:ring-2 cursor-pointer"
                          />
                          <span>Only Admin</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4 text-church-gold border-slate-300 rounded focus:ring-church-gold focus:ring-2"
                      />
                      <label htmlFor="anonymous" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Submit Anonymously (Hide my name in public list)
                      </label>
                    </div>

                    <div className="flex gap-3">
                      {editingPrayerId && (
                        <button
                          type="button"
                          onClick={handleCancelPrayerEdit}
                          className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submittingPrayer}
                        className="flex-1 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 text-sm"
                      >
                        {submittingPrayer ? 'Saving...' : editingPrayerId ? 'Save Changes' : 'Prayer Point'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* History list */}
              <div className="lg:col-span-7">
                <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md">
                  <h3 className="text-lg font-bold text-church-blue dark:text-white font-display mb-4">
                    My Prayer Requests Archive
                  </h3>
                  
                  {myPrayers.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-850">
                      {myPrayers.map((prayer) => (
                        <div key={prayer.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{prayer.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prayer.description}</p>
                              <div className="flex gap-3 items-center mt-2.5 flex-wrap">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(prayer.created_at).toLocaleDateString()}</span>
                                {prayer.is_anonymous && (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-250/50 dark:border-slate-700">Anonymous</span>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  prayer.visibility === 'admin' 
                                    ? 'text-church-gold bg-church-gold/10 border border-church-gold/20' 
                                    : 'text-slate-400 bg-slate-500/10 border border-slate-400/20'
                                }`}>
                                  {prayer.visibility === 'admin' ? 'Only Admin' : 'All'}
                                </span>
                                <div className="flex gap-1.5 items-center shrink-0">
                                  <button
                                    onClick={() => handleEditPrayerClick(prayer)}
                                    className="p-1 text-slate-400 hover:text-church-gold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                                    title="Edit Request"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePrayerClick(prayer.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"
                                    title="Delete Request"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Status label */}
                            <div className="shrink-0">
                              {prayer.status === 'approved' && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-full border border-emerald-250">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>We can pray for you.</span>
                                </span>
                              )}
                              {prayer.status === 'rejected' && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-full border border-rose-250">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>We can't pray for you.</span>
                                </span>
                              )}
                              {prayer.status === 'pending' && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-full border border-amber-250">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Pending Prayer Request...</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No prayer requests submitted by you.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. PROFILE SETTINGS TAB */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md max-w-3xl mx-auto">
              <h3 className="text-lg font-bold text-church-blue dark:text-white font-display mb-6">
                Update Account Details
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 99999 88888"
                    className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Physical Home Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street coordinates..."
                    className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Short Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a few lines about yourself..."
                    className="block w-full px-4 py-3 border border-slate-250 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 text-sm"
                >
                  {savingProfile ? 'Saving Details...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
