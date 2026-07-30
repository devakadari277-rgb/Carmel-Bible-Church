import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import {
  Users, Calendar, HeartHandshake, Video, Megaphone,
  Image as ImageIcon, Settings, Mail, ClipboardList,
  Edit2, Trash2, CheckCircle2, XCircle, Pin,
  LogOut, ShieldAlert, ArrowLeft, Loader, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper function to format time as 12-hour hh:mm AM/PM consistently
const formatEventTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr.slice(0, 16));
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr} ${ampm}`;
  } catch (e) {
    return '';
  }
};

export const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'events' | 'prayers' | 'streams' | 'announcements' | 'gallery' | 'settings' | 'messages'
  >('overview');

  // Stats and Overview States
  const [stats, setStats] = useState<any>({
    total_members: 0,
    total_events: 0,
    total_prayers: 0,
    total_live_videos: 0,
    recent_messages: [],
    recent_activities: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Data Lists States
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form Editing States
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Search and Excel Exporter States
  const [memberSearch, setMemberSearch] = useState('');
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const response = await api.get('/api/members/export_excel/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'registered_members.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Excel list exported successfully!', 'success');
    } catch (err) {
      addToast('Failed to export member list to Excel.', 'error');
    } finally {
      setExportingExcel(false);
    }
  };

  // CRUD Form States
  // 1. Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDateOnly, setEventDateOnly] = useState('');
  const [eventTimeOnly, setEventTimeOnly] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);

  // 2. Stream Form
  const [streamTitle, setStreamTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamActive, setStreamActive] = useState(false);

  // 3. Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // 4. Gallery Form
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // 5. Website Setting Form (Singleton)
  const [churchName, setChurchName] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSubtitleTelugu, setHeroSubtitleTelugu] = useState('');
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [vision, setVision] = useState('');
  const [visionTelugu, setVisionTelugu] = useState('');
  const [mission, setMission] = useState('');
  const [missionTelugu, setMissionTelugu] = useState('');
  const [pastorName, setPastorName] = useState('');
  const [pastorDesg, setPastorDesg] = useState('');
  const [pastorBio, setPastorBio] = useState('');
  const [pastorWelcome, setPastorWelcome] = useState('');
  const [pastorMinistry, setPastorMinistry] = useState('');
  const [phone, setPhone] = useState('');
  const [emailSetting, setEmailSetting] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [fbUrl, setFbUrl] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [igUrl, setIgUrl] = useState('');
  // Photo file upload states for Settings
  const [churchLogoFile, setChurchLogoFile] = useState<File | null>(null);
  const [pastorPhotoFile, setPastorPhotoFile] = useState<File | null>(null);

  // Fetch stats on load
  const fetchOverviewStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/api/admin/stats/');
      setStats(res.data);
    } catch (err) {
      addToast('Failed to load dashboard statistics.', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  // Fetch lists based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewStats();
      return;
    }
    
    setLoadingData(true);
    setEditMode(false);
    setEditId(null);
    
    const endpoints: Record<string, string> = {
      members: '/api/members/',
      events: '/api/events/',
      prayers: '/api/prayers/',
      streams: '/api/live-streams/',
      announcements: '/api/announcements/',
      gallery: '/api/gallery/',
      messages: '/api/contact-messages/',
      settings: '/api/settings/'
    };

    api.get(endpoints[activeTab])
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];

        if (activeTab === 'members') setMembers(data);
        else if (activeTab === 'events') setEvents(data);
        else if (activeTab === 'prayers') setPrayers(data);
        else if (activeTab === 'streams') setStreams(data);
        else if (activeTab === 'announcements') setAnnouncements(data);
        else if (activeTab === 'gallery') setPhotos(data);
        else if (activeTab === 'messages') setMessagesList(data);
        else if (activeTab === 'settings') {
          const d = res.data || {};
          setChurchName(d.church_name || '');
          setHeroTitle(d.hero_title || '');
          setHeroSubtitle(d.hero_subtitle || '');
          setHeroSubtitleTelugu(d.hero_subtitle_telugu || '');
          setWelcomeMsg(d.welcome_message || '');
          setVision(d.vision || '');
          setVisionTelugu(d.vision_telugu || '');
          setMission(d.mission || '');
          setMissionTelugu(d.mission_telugu || '');
          setPastorName(d.pastor_name || '');
          setPastorDesg(d.pastor_designation || '');
          setPastorBio(d.pastor_bio || '');
          setPastorWelcome(d.pastor_welcome_message || '');
          setPastorMinistry(d.pastor_ministry_info || '');
          setPhone(d.contact_phone || '');
          setEmailSetting(d.contact_email || '');
          setAddress(d.contact_address || '');
          setMapUrl(d.map_embed_url || '');
          setFbUrl(d.facebook_url || '');
          setYtUrl(d.youtube_url || '');
          setIgUrl(d.instagram_url || '');
        }
      })
      .catch(() => {
        addToast(`Failed to load data for ${activeTab}.`, 'error');
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [activeTab]);

  // --- CRUD ACTIONS ---

  // User deletion
  const handleDeleteMember = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this member account? This action is permanent.')) return;
    try {
      await api.delete(`/api/members/${id}/`);
      setMembers(members.filter((m) => m.id !== id));
      addToast('Member deleted successfully.', 'success');
    } catch {
      addToast('Failed to delete member.', 'error');
    }
  };

  // Event CRUD
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDateOnly || !eventTimeOnly) {
      addToast('Please specify both Date and Time for the event.', 'warning');
      return;
    }
    // Combine Date (YYYY-MM-DD) and Time (HH:MM) to standard ISO format
    const combinedDateTime = `${eventDateOnly}T${eventTimeOnly}`;
    
    const formData = new FormData();
    formData.append('title', eventTitle);
    formData.append('description', eventDesc);
    formData.append('event_date', combinedDateTime);
    formData.append('location', eventLoc);
    if (eventImageFile) {
      formData.append('event_image', eventImageFile);
    }

    try {
      let res: any;
      if (editMode && editId) {
        res = await api.put(`/api/events/${editId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEvents(events.map((ev) => (ev.id === editId ? res.data : ev)));
        addToast('Event updated successfully.', 'success');
      } else {
        res = await api.post('/api/events/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEvents([res.data, ...events]);
        addToast('Event created successfully.', 'success');
      }
      // Reset form
      setEventTitle('');
      setEventDesc('');
      setEventDateOnly('');
      setEventTimeOnly('');
      setEventLoc('');
      setEventImageFile(null);
      const fileInput = document.getElementById('eventImageFileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setEditMode(false);
      setEditId(null);
    } catch {
      addToast('Failed to save event.', 'error');
    }
  };

  const startEditEvent = (ev: any) => {
    setEditMode(true);
    setEditId(ev.id);
    setEventTitle(ev.title);
    setEventDesc(ev.description);
    
    // Safely extract Date (YYYY-MM-DD) and Time (HH:MM) via string splitting to prevent browser Date engine parsing failures
    if (ev.event_date && ev.event_date.includes('T')) {
      const parts = ev.event_date.split('T');
      setEventDateOnly(parts[0]); // e.g., "2026-07-08"
      setEventTimeOnly(parts[1].slice(0, 5)); // e.g., "13:10"
    } else {
      setEventDateOnly('');
      setEventTimeOnly('');
    }
    
    setEventImageFile(null);
    const fileInput = document.getElementById('eventImageFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    setEventLoc(ev.location);
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/events/${id}/`);
      setEvents(events.filter((ev) => ev.id !== id));
      addToast('Event deleted successfully.', 'success');
    } catch {
      addToast('Failed to delete event.', 'error');
    }
  };

  // Prayer management (Approve, Reject, Pin, Delete)
  const handlePrayerAction = async (id: number, actionType: 'approve' | 'reject' | 'toggle_pin' | 'delete') => {
    try {
      if (actionType === 'delete') {
        if (!window.confirm('Delete this prayer request?')) return;
        await api.delete(`/api/prayers/${id}/`);
        setPrayers(prayers.filter((p) => p.id !== id));
        addToast('Prayer request deleted.', 'success');
      } else {
        const res = await api.post(`/api/prayers/${id}/${actionType}/`);
        // Refresh prayers list
        if (actionType === 'toggle_pin') {
          setPrayers(prayers.map((p) => (p.id === id ? { ...p, is_pinned: res.data.is_pinned } : p)));
          addToast(`Prayer request ${res.data.is_pinned ? 'pinned' : 'unpinned'} successfully.`, 'success');
        } else {
          setPrayers(prayers.map((p) => (p.id === id ? { ...p, status: actionType === 'approve' ? 'approved' : 'rejected' } : p)));
          addToast(`Prayer request ${actionType}d.`, 'success');
        }
      }
    } catch {
      addToast('Action execution failed.', 'error');
    }
  };

  // Live Stream CRUD
  const handleStreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: streamTitle, youtube_url: streamUrl, is_active: streamActive };
    try {
      if (editMode && editId) {
        const res = await api.put(`/api/live-streams/${editId}/`, payload);
        setStreams(streams.map((s) => (s.id === editId ? res.data : s)));
        addToast('Live stream details updated.', 'success');
      } else {
        const res = await api.post('/api/live-streams/', payload);
        setStreams([res.data, ...streams]);
        addToast('Live stream link added.', 'success');
      }
      setStreamTitle('');
      setStreamUrl('');
      setStreamActive(false);
      setEditMode(false);
      setEditId(null);
    } catch {
      addToast('Failed to save live stream.', 'error');
    }
  };

  const startEditStream = (s: any) => {
    setEditMode(true);
    setEditId(s.id);
    setStreamTitle(s.title);
    setStreamUrl(s.youtube_url);
    setStreamActive(s.is_active);
  };

  const handleDeleteStream = async (id: number) => {
    if (!window.confirm('Remove this video stream link?')) return;
    try {
      await api.delete(`/api/live-streams/${id}/`);
      setStreams(streams.filter((s) => s.id !== id));
      addToast('Live stream removed.', 'success');
    } catch {
      addToast('Failed to delete live stream link.', 'error');
    }
  };

  // Announcement CRUD
  const handleAnnounceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: annTitle, content: annContent };
    try {
      if (editMode && editId) {
        const res = await api.put(`/api/announcements/${editId}/`, payload);
        setAnnouncements(announcements.map((a) => (a.id === editId ? res.data : a)));
        addToast('Announcement updated.', 'success');
      } else {
        const res = await api.post('/api/announcements/', payload);
        setAnnouncements([res.data, ...announcements]);
        addToast('Announcement published successfully.', 'success');
      }
      setAnnTitle('');
      setAnnContent('');
      setEditMode(false);
      setEditId(null);
    } catch {
      addToast('Failed to save announcement.', 'error');
    }
  };

  const startEditAnnounce = (a: any) => {
    setEditMode(true);
    setEditId(a.id);
    setAnnTitle(a.title);
    setAnnContent(a.content);
  };

  const handleDeleteAnnounce = async (id: number) => {
    if (!window.confirm('Delete announcement?')) return;
    try {
      await api.delete(`/api/announcements/${id}/`);
      setAnnouncements(announcements.filter((a) => a.id !== id));
      addToast('Announcement deleted successfully.', 'success');
    } catch {
      addToast('Failed to delete announcement.', 'error');
    }
  };

  // Gallery CRUD
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile && !editMode) {
      addToast('Please select a photo file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('caption', photoCaption);
    if (photoFile) {
      formData.append('image', photoFile);
    }

    try {
      const res = await api.post('/api/gallery/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotos([res.data, ...photos]);
      addToast('Image uploaded to gallery.', 'success');
      setPhotoCaption('');
      setPhotoFile(null);
      // Reset input element
      const fileInput = document.getElementById('photoFileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch {
      addToast('Failed to upload image.', 'error');
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!window.confirm('Remove photo from gallery?')) return;
    try {
      await api.delete(`/api/gallery/${id}/`);
      setPhotos(photos.filter((p) => p.id !== id));
      addToast('Photo removed successfully.', 'success');
    } catch {
      addToast('Failed to delete photo.', 'error');
    }
  };

  // Website customizer settings PUT (Singleton)
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('church_name', churchName);
    formData.append('hero_title', heroTitle);
    formData.append('hero_subtitle', heroSubtitle);
    formData.append('hero_subtitle_telugu', heroSubtitleTelugu);
    formData.append('welcome_message', welcomeMsg);
    formData.append('vision', vision);
    formData.append('vision_telugu', visionTelugu);
    formData.append('mission', mission);
    formData.append('mission_telugu', missionTelugu);
    formData.append('pastor_name', pastorName);
    formData.append('pastor_designation', pastorDesg);
    formData.append('pastor_bio', pastorBio);
    formData.append('pastor_welcome_message', pastorWelcome);
    formData.append('pastor_ministry_info', pastorMinistry);
    formData.append('contact_phone', phone);
    formData.append('contact_email', emailSetting);
    formData.append('contact_address', address);
    formData.append('map_embed_url', mapUrl);
    formData.append('facebook_url', fbUrl);
    formData.append('youtube_url', ytUrl);
    formData.append('instagram_url', igUrl);
    if (churchLogoFile) formData.append('church_logo', churchLogoFile);
    if (pastorPhotoFile) formData.append('pastor_photo', pastorPhotoFile);

    try {
      await api.patch('/api/settings/1/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast('Church settings updated successfully!', 'success');
      setChurchLogoFile(null);
      setPastorPhotoFile(null);
      const logoInput = document.getElementById('churchLogoInput') as HTMLInputElement;
      const photoInput = document.getElementById('pastorPhotoInput') as HTMLInputElement;
      if (logoInput) logoInput.value = '';
      if (photoInput) photoInput.value = '';
    } catch {
      addToast('Failed to save website settings.', 'error');
    }
  };

  // Contact messages deletion
  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Delete message copy?')) return;
    try {
      await api.delete(`/api/contact-messages/${id}/`);
      setMessagesList(messagesList.filter((msg) => msg.id !== id));
      addToast('Contact message deleted.', 'success');
    } catch {
      addToast('Failed to remove message.', 'error');
    }
  };

  // Render Sidebar Links
  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: ClipboardList },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'prayers', label: 'Prayers', icon: HeartHandshake },
    { id: 'streams', label: 'Live Streams', icon: Video },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'settings', label: 'Customize Site', icon: Settings },
    { id: 'messages', label: 'Messages', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col md:flex-row">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-950/75 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="p-4 bg-church-blue/40 border border-church-gold/25 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-church-gold/10 text-church-gold rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Secure Panel</span>
              <span className="text-sm font-black text-white font-display">CBC Admin Panel.</span>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === link.id
                      ? 'bg-church-gold text-church-blue font-bold shadow-lg shadow-church-gold/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800/80 pt-4 mt-6 space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Visit Website</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main dashboard body */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {/* Mobile Header with visible Logout button */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 md:hidden">
          <span className="font-extrabold text-sm text-church-gold font-display">CBC ADMIN PANEL.</span>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-3.5 py-1.5 rounded-xl border border-rose-500/40 text-rose-450 hover:text-white hover:bg-rose-600 text-xs font-bold uppercase transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">Dashboard Overview</h1>
                <p className="text-xs text-slate-400 mt-1">Real-time counts, messages log, and admin activities</p>
              </div>
              <button
                onClick={fetchOverviewStats}
                className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Refresh Data
              </button>
            </div>

            {loadingStats ? (
              <div className="py-24 flex justify-center"><Loader className="w-10 h-10 animate-spin text-church-gold" /></div>
            ) : (
              <>
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800/80 shadow-md flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><Users className="w-6 h-6" /></div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">Total Members</span>
                      <span className="text-2xl font-black text-white font-mono">{stats.total_members}</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800/80 shadow-md flex items-center gap-4">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl"><Calendar className="w-6 h-6" /></div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">Total Events</span>
                      <span className="text-2xl font-black text-white font-mono">{stats.total_events}</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800/80 shadow-md flex items-center gap-4">
                    <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl"><HeartHandshake className="w-6 h-6" /></div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">Prayer Requests</span>
                      <span className="text-2xl font-black text-white font-mono">{stats.total_prayers}</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800/80 shadow-md flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Video className="w-6 h-6" /></div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">Video Live</span>
                      <span className="text-2xl font-black text-white font-mono">{stats.total_live_videos}</span>
                    </div>
                  </div>
                </div>

                {/* Split grid for message snippets and activity log */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Activity log */}
                  <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                    <h3 className="text-lg font-bold font-display mb-4">Recent Admin Actions</h3>
                    {stats.recent_activities.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {stats.recent_activities.map((act: any) => (
                          <div key={act.id} className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl text-xs flex justify-between gap-4">
                            <div>
                              <span className="font-bold text-church-gold">{act.username}</span>
                              <p className="text-slate-300 mt-0.5">{act.action}</p>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0 font-mono">{new Date(act.created_at).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">No staff log entries recorded.</p>
                    )}
                  </div>

                  {/* Messages Snippet */}
                  <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                    <h3 className="text-lg font-bold font-display mb-4">Recent Contact Messages</h3>
                    {stats.recent_messages.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recent_messages.map((msg: any) => (
                          <div key={msg.id} className="p-3.5 bg-slate-900 border border-slate-800/60 rounded-xl">
                            <div className="flex justify-between items-start text-xs font-bold mb-1">
                              <span className="text-white">{msg.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{new Date(msg.created_at).toLocaleDateString()}</span>
                            </div>
                            <span className="block text-[10px] text-church-gold">{msg.subject}</span>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{msg.message}</p>
                          </div>
                        ))}
                        <button
                          onClick={() => setActiveTab('messages')}
                          className="w-full text-center py-2 border border-slate-800 bg-slate-950/65 hover:bg-slate-900 text-xs font-semibold rounded-xl text-slate-400 hover:text-white transition-all mt-2"
                        >
                          View All Inbox
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">No inbox messages at this time.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* LOADING STATE FOR OTHER PANELS */}
        {activeTab !== 'overview' && loadingData && (
          <div className="py-32 flex justify-center"><Loader className="w-10 h-10 animate-spin text-church-gold" /></div>
        )}

        {/* 2. MEMBERS PANEL */}
        {activeTab === 'members' && !loadingData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Manage Registered Members</h1><br/>
                <p className="text-xs color: whitetext-slate-400">Total Registered Members: {members.length}</p>
              </div>
            </div>

            {/* Search and Excel Download controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950/65 p-4 border border-slate-800 rounded-3xl">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by name, username, email, phone..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-slate-800 rounded-xl bg-slate-900 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-church-gold"
                />
              </div>
              <button
                onClick={handleExportExcel}
                disabled={exportingExcel}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-church-gold text-church-gold hover:bg-church-gold hover:text-church-blue text-xs font-bold uppercase transition-all shadow-md disabled:opacity-50"
              >
                <span>{exportingExcel ? 'Exporting...' : 'Download Excel'}</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
              {members.length > 0 ? (
                (() => {
                  const filtered = members.filter(m => 
                    (m.first_name && m.first_name.toLowerCase().includes(memberSearch.toLowerCase())) ||
                    (m.username && m.username.toLowerCase().includes(memberSearch.toLowerCase())) ||
                    (m.email && m.email.toLowerCase().includes(memberSearch.toLowerCase())) ||
                    (m.profile?.phone_number && m.profile.phone_number.includes(memberSearch))
                  );
                  return filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <th className="py-4 px-4">Full Name</th>
                            <th className="py-4 px-4">Username</th>
                            <th className="py-4 px-4">Email</th>
                            <th className="py-4 px-4">Phone Number</th>
                            <th className="py-4 px-4">Registration Date & Time</th>
                            <th className="py-4 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {filtered.map((m) => (
                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-semibold text-white">{m.first_name || 'N/A'}</td>
                              <td className="py-4 px-4 text-slate-350">{m.username}</td>
                              <td className="py-4 px-4 text-slate-350">{m.email}</td>
                              <td className="py-4 px-4 text-slate-350">{m.profile?.phone_number || 'N/A'}</td>
                              <td className="py-4 px-4 text-xs text-slate-400 font-mono">{new Date(m.date_joined).toLocaleString()}</td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteMember(m.id)}
                                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                                  title="Delete Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-12 text-center">No matching members found.</p>
                  );
                })()
              ) : (
                <p className="text-xs text-slate-500 py-12 text-center">No standard members registered currently.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. EVENTS CRUD PANEL */}
        {activeTab === 'events' && !loadingData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CRUD Form */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-6">
                  {editMode ? 'Edit Event Details' : 'Create Upcoming Event'}
                </h3>
                
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Event Title</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Special Sunday Service"
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Event Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={eventDateOnly}
                        onChange={(e) => setEventDateOnly(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-church-gold">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Event Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        value={eventTimeOnly}
                        onChange={(e) => setEventTimeOnly(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-church-gold">
                        <Clock className="w-4.5 h-4.5 text-church-gold" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Location</label>
                    <input
                      type="text"
                      required
                      value={eventLoc}
                      onChange={(e) => setEventLoc(e.target.value)}
                      placeholder="Main Church Sanctuary"
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Event  Image (Optional)</label>
                    <input
                      type="file"
                      id="eventImageFileInput"
                      accept="image/*"
                      onChange={(e) => setEventImageFile(e.target.files ? e.target.files[0] : null)}
                      className="block w-full px-3 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-xs focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      placeholder="Describe the fellowship schedule..."
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditId(null);
                          setEventTitle('');
                          setEventDesc('');
                          setEventDateOnly('');
                          setEventTimeOnly('');
                          setEventLoc('');
                          setEventImageFile(null);
                          const fileInput = document.getElementById('eventImageFileInput') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue text-xs font-bold rounded-2xl transition-all shadow-md"
                    >
                      {editMode ? 'Save Changes' : 'Publish Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-7">
              <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-4">Current Published Events</h3>
                {events.length > 0 ? (
                  <div className="divide-y divide-slate-850">
                    {events.map((ev) => (
                      <div key={ev.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                          <span className="block text-[11px] text-church-gold mt-0.5">
                            {new Date(ev.event_date.slice(0, 16)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {formatEventTime(ev.event_date)}
                          </span>
                          <span className="block text-[10px] text-slate-400">{ev.location}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditEvent(ev)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No events found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. PRAYER REQUESTS MANAGEMENT */}
        {activeTab === 'prayers' && !loadingData && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Manage Prayer Requests</h1>
              <p className="text-xs text-slate-400">We Pray For You,We Can't Pray For You , pin, or delete prayer requests filed by portal members</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
              {prayers.length > 0 ? (
                <div className="space-y-6 divide-y divide-slate-850">
                  {prayers.map((pr) => (
                    <div key={pr.id} className="pt-6 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{pr.title}</h4>
                          {pr.is_pinned && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-church-gold bg-church-gold/10 px-1.5 py-0.5 rounded border border-church-gold/20">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            pr.status === 'approved' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' :
                            pr.status === 'rejected' ? 'text-rose-500 bg-rose-500/10 border border-rose-500/20' :
                            'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                          }`}>
                            {pr.status}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            pr.visibility === 'admin' 
                              ? 'text-church-gold bg-church-gold/10 border border-church-gold/20' 
                              : 'text-slate-400 bg-slate-400/10 border border-slate-400/20'
                          }`}>
                            {pr.visibility === 'admin' ? 'Only Admin' : 'All'}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-500 mt-1">Submitted by: {pr.is_anonymous ? 'Anonymous' : pr.username} ({new Date(pr.created_at).toLocaleDateString()})</span>
                        <p className="text-xs text-slate-350 mt-2 max-w-2xl leading-relaxed">{pr.description}</p>
                      </div>

                      {/* Control buttons */}
                      <div className="flex gap-2.5 self-end sm:self-center shrink-0">
                        {pr.status !== 'approved' && (
                          <button
                            onClick={() => handlePrayerAction(pr.id, 'approve')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-xl transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> We Pray For You
                          </button>
                        )}
                        {pr.status !== 'rejected' && (
                          <button
                            onClick={() => handlePrayerAction(pr.id, 'reject')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-650 hover:bg-rose-550 text-xs font-semibold text-white rounded-xl transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> We Can't Pray For You
                          </button>
                        )}
                        <button
                          onClick={() => handlePrayerAction(pr.id, 'toggle_pin')}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                          title="Toggle Pin Status"
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrayerAction(pr.id, 'delete')}
                          className="p-2 text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 rounded-xl"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-12 text-center">No prayer requests filed in the portal.</p>
              )}
            </div>
          </div>
        )}

        {/* 5. LIVE STREAMS CRUD */}
        {activeTab === 'streams' && !loadingData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-6">
                  {editMode ? 'Edit Video Details' : 'Add Live / Ceremony Link'}
                </h3>
                
                <form onSubmit={handleStreamSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Video Title</label>
                    <input
                      type="text"
                      required
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Sunday Service Ceremony"
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">YouTube Video URL</label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="streamActive"
                      checked={streamActive}
                      onChange={(e) => setStreamActive(e.target.checked)}
                      className="w-4 h-4 text-church-gold border-slate-800 rounded bg-slate-900"
                    />
                    <label htmlFor="streamActive" className="text-xs font-medium text-slate-400">
                      Set as ACTIVE Live broadcast (Replaces current live video)
                    </label>
                  </div>

                  <div className="flex gap-3">
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditId(null);
                          setStreamTitle('');
                          setStreamUrl('');
                          setStreamActive(false);
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue text-xs font-bold rounded-2xl transition-all shadow-md"
                    >
                      {editMode ? 'Save Details' : 'Save Video'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-4">Saved Video Database</h3>
                {streams.length > 0 ? (
                  <div className="divide-y divide-slate-850">
                    {streams.map((s) => (
                      <div key={s.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{s.title}</h4>
                            {s.is_active && (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">Live</span>
                            )}
                          </div>
                          <span className="block text-[10px] text-slate-400 truncate max-w-md mt-1">{s.youtube_url}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditStream(s)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                            title="Edit Link"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStream(s.id)}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No video references logged.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. ANNOUNCEMENTS CRUD */}
        {activeTab === 'announcements' && !loadingData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-6">
                  {editMode ? 'Edit Announcement' : 'Publish Announcement'}
                </h3>
                
                <form onSubmit={handleAnnounceSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Announcement Title</label>
                    <input
                      type="text"
                      required
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Midweek Prayer Meeting Timing"
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Content Text</label>
                    <textarea
                      required
                      rows={5}
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Write weekly church announcement details here..."
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditId(null);
                          setAnnTitle('');
                          setAnnContent('');
                        }}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue text-xs font-bold rounded-2xl transition-all shadow-md"
                    >
                      {editMode ? 'Save Details' : 'Publish Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-4">Active Board Announcements</h3>
                {announcements.length > 0 ? (
                  <div className="divide-y divide-slate-850">
                    {announcements.map((a) => (
                      <div key={a.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-white text-sm">{a.title}</h4>
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{new Date(a.created_at).toLocaleDateString()}</span>
                          <p className="text-xs text-slate-350 mt-2 line-clamp-2 leading-relaxed">{a.content}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditAnnounce(a)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnounce(a.id)}
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No announcements published.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. GALLERY CRUD PANEL */}
        {activeTab === 'gallery' && !loadingData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-6">Upload Image to Gallery</h3>
                
                <form onSubmit={handleGallerySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Image Caption</label>
                    <input
                      type="text"
                      required
                      value={photoCaption}
                      onChange={(e) => setPhotoCaption(e.target.value)}
                      placeholder="Youth Gathering 2026"
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Image File</label>
                    <input
                      type="file"
                      id="photoFileInput"
                      required
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                      className="block w-full px-3 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-xs focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue text-xs font-bold rounded-2xl transition-all shadow-md"
                  >
                    Upload Image
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold font-display mb-4">Gallery Inventory</h3>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto pr-1">
                    {photos.map((p) => (
                      <div key={p.id} className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square">
                        <img src={p.image} alt={p.caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <span className="text-[10px] font-semibold text-white leading-relaxed line-clamp-2">{p.caption}</span>
                          <button
                            onClick={() => handleDeletePhoto(p.id)}
                            className="self-end p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                            title="Delete image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">No images uploaded.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. WEBSITE SETTINGS PANEL */}
        {activeTab === 'settings' && !loadingData && (
          <form onSubmit={handleSettingsSubmit} className="space-y-8 max-w-4xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Website Customizer Panel</h1>
              <p className="text-xs text-slate-400">Modify global descriptions, pastor profile cards, contact points, and links</p>
            </div>

            {/* General Layout details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-church-gold font-display border-b border-slate-800 pb-2.5">Church General Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Church Name</label>
                  <input
                    type="text"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Hero Headline Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Hero Subtitle (English)</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Hero Subtitle (Telugu)</label>
                  <input
                    type="text"
                    value={heroSubtitleTelugu}
                    onChange={(e) => setHeroSubtitleTelugu(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Home Welcome Statement</label>
                <textarea
                  rows={4}
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Vision Description (English)</label>
                  <textarea
                    rows={3}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Mission Description (English)</label>
                  <textarea
                    rows={3}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Vision Description (Telugu)</label>
                  <textarea
                    rows={3}
                    value={visionTelugu}
                    onChange={(e) => setVisionTelugu(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Mission Description (Telugu)</label>
                  <textarea
                    rows={3}
                    value={missionTelugu}
                    onChange={(e) => setMissionTelugu(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Pastor Profile Card customizer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-church-gold font-display border-b border-slate-800 pb-2.5">Pastor Profile Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Pastor's Name</label>
                  <input
                    type="text"
                    value={pastorName}
                    onChange={(e) => setPastorName(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Role Designation</label>
                  <input
                    type="text"
                    value={pastorDesg}
                    onChange={(e) => setPastorDesg(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quote / Welcome Message</label>
                <input
                  type="text"
                  value={pastorWelcome}
                  onChange={(e) => setPastorWelcome(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Biography</label>
                <textarea
                  rows={4}
                  value={pastorBio}
                  onChange={(e) => setPastorBio(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Ministry Areas Focus Details</label>
                <input
                  type="text"
                  value={pastorMinistry}
                  onChange={(e) => setPastorMinistry(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                />
              </div>

              {/* Pastor Photo Upload */}
              <div className="p-4 rounded-2xl border border-church-gold/20 bg-church-gold/5">
                <label className="block text-xs font-bold uppercase tracking-wider text-church-gold mb-2">📷 Pastor Photo Upload</label>
                <p className="text-[10px] text-slate-400 mb-3">Upload pastor gari actual photo — website లో కనిపిస్తుంది</p>
                <input
                  type="file"
                  id="pastorPhotoInput"
                  accept="image/*"
                  onChange={(e) => setPastorPhotoFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full px-3 py-3 border border-slate-700 rounded-xl bg-slate-900 text-xs text-slate-300 focus:outline-none transition-all"
                />
                {pastorPhotoFile && (
                  <p className="text-[10px] text-emerald-400 mt-1.5">✅ Selected: {pastorPhotoFile.name}</p>
                )}
              </div>
            </div>

            {/* Church Logo Upload Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-church-gold font-display border-b border-slate-800 pb-2.5">Church Logo Upload</h3>
              <div className="p-4 rounded-2xl border border-church-gold/20 bg-church-gold/5">
                <label className="block text-xs font-bold uppercase tracking-wider text-church-gold mb-2">🖼️ Church Logo Upload</label>
                <p className="text-[10px] text-slate-400 mb-3">Upload church logo — Navbar లో కనిపిస్తుంది</p>
                <input
                  type="file"
                  id="churchLogoInput"
                  accept="image/*"
                  onChange={(e) => setChurchLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="block w-full px-3 py-3 border border-slate-700 rounded-xl bg-slate-900 text-xs text-slate-300 focus:outline-none transition-all"
                />
                {churchLogoFile && (
                  <p className="text-[10px] text-emerald-400 mt-1.5">✅ Selected: {churchLogoFile.name}</p>
                )}
              </div>
            </div>

            {/* Coordinates and Social URLs */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-church-gold font-display border-b border-slate-800 pb-2.5">Contact Coordinates & Social Handles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={emailSetting}
                    onChange={(e) => setEmailSetting(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contact Physical Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Google Map Embed iframe URL</label>
                <input
                  type="text"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Facebook URL</label>
                  <input
                    type="url"
                    value={fbUrl}
                    onChange={(e) => setFbUrl(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">YouTube Channel URL</label>
                  <input
                    type="url"
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Instagram URL</label>
                  <input
                    type="url"
                    value={igUrl}
                    onChange={(e) => setIgUrl(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-church-gold hover:bg-church-gold-hover text-church-blue font-bold rounded-2xl transition-all shadow-lg hover:shadow-church-gold/20"
            >
              Save Custom Settings Changes
            </button>
          </form>
        )}

        {/* 9. CONTACT MESSAGES INBOX PANEL */}
        {activeTab === 'messages' && !loadingData && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Contact Us Message Inbox</h1>
              <p className="text-xs text-slate-400">View message inquiries sent by public visitors through the homepage</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/65 border border-slate-800 shadow-md">
              {messagesList.length > 0 ? (
                <div className="space-y-4 divide-y divide-slate-850">
                  {messagesList.map((msg) => (
                    <div key={msg.id} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{msg.subject}</h4>
                          <span className="text-[10px] text-church-gold font-mono">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                        <span className="block text-[11px] text-slate-400 mt-1">From: {msg.name} ({msg.email})</span>
                        <p className="text-xs text-slate-300 mt-2 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">{msg.message}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-2 text-rose-450 hover:text-rose-350 hover:bg-rose-500/10 rounded-xl shrink-0 self-center"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-12 text-center">Inbox is empty.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
