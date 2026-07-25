import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon, Sun, Moon, Bell } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../components/Toast';

export const Navbar: React.FC = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<any>({});
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Request browser push notification permission when logged in user mounts
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  const fetchNotifications = () => {
    if (user) {
      api.get('/api/notifications/')
        .then((res) => {
          const newNotifications = res.data || [];
          
          if (!isFirstLoad) {
            // Find notifications that are unread and were not in the previous state list
            const previousIds = new Set(notifications.map(n => n.id));
            const freshUnreads = newNotifications.filter((n: any) => !n.is_read && !previousIds.has(n.id));
            
            freshUnreads.forEach((n: any) => {
              // Trigger React Toast notification
              addToast(`New Notification: ${n.message}`, 'info');
              
              // Trigger browser desktop push notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(n.title, {
                  body: n.message,
                  icon: '/favicon.ico'
                });
              }
            });
          } else {
            setIsFirstLoad(false);
          }
          
          setNotifications(newNotifications);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchNotifications();
    let interval: any;
    if (user) {
      interval = setInterval(fetchNotifications, 30000); // poll every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = () => {
    api.post('/api/notifications/mark_all_read/')
      .then(() => {
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      })
      .catch(() => {});
  };

  const handleMarkSingleRead = (id: number, title: string) => {
    api.post(`/api/notifications/${id}/mark_read/`)
      .then(() => {
        setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
        
        // Redirect user based on notification title type
        const trimmedTitle = title.trim();
        if (trimmedTitle === "New Event Published") {
          navigate('/events');
        } else if (trimmedTitle === "New Ceremony Video Added") {
          navigate('/live-stream');
        } else if (trimmedTitle === "New Announcement Posted") {
          navigate('/announcements');
        } else if (trimmedTitle === "New Photo Gallery Upload") {
          navigate('/gallery');
        }
        
        // Close notifications dropdown pane
        setShowNotifications(false);
      })
      .catch(() => {});
  };

  useEffect(() => {
    api.get('/api/settings/')
      .then((res) => {
        if (res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close sidebar drawer on route or hash changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/#about' },
    { label: 'Locations', path: '/#locations' },
    { label: 'Connect', path: '/#connect' },
    { label: 'Ministries', path: '/#ministries' },
    { label: 'Watch', path: '/live-stream' },
    { label: 'Give', path: '/give' },
    { label: 'Events', path: '/events' },
    { label: 'Ceremonies', path: '/#sermons' },
    { label: 'Prayer Requests', path: '/prayers' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact Us', path: '/#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-church-blue/85 border-b border-church-gold/25 py-2.5 shadow-none'
            : 'bg-church-blue/40 border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-[95%] xl:max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Left Side: Hamburger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 rounded-xl text-slate-200 hover:text-church-gold hover:bg-white/5 transition-all duration-300 cursor-pointer focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Center: Logo & Title (Larger & Centered) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center shrink-0">
              <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group">
                <img 
                  src={settings.church_logo || "/church_logo.png"} 
                  alt="Carmel Bible Church Logo" 
                  className="h-14 w-14 sm:h-18 sm:w-18 object-cover rounded-full border-2 border-church-gold/40 shadow-none transition-transform duration-300 group-hover:scale-105" 
                />
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-church-gold via-church-gold-light to-church-gold font-display transition-all duration-300 group-hover:brightness-125 whitespace-nowrap">
                  CBC
                </span>
              </Link>
            </div>

            {/* Right Side: Theme toggle & Desktop User Portal (Quick Access) */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-250 hover:text-church-gold hover:bg-white/5 transition-all border border-transparent hover:border-church-gold/20 cursor-pointer"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* In-App Notifications Bell */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl text-slate-250 hover:text-church-gold hover:bg-white/5 transition-all border border-transparent hover:border-church-gold/20 cursor-pointer relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-church-blue animate-pulse" />
                    )}
                  </button>
                  
                  {/* Notifications Dropdown Panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2.5 w-80 max-h-96 overflow-y-auto bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl z-[100] p-4 space-y-3 no-scrollbar">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-church-gold hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all cursor-pointer ${
                                n.is_read 
                                  ? 'bg-slate-900/30 border-slate-900/40 text-slate-400' 
                                  : 'bg-slate-900/90 border-slate-800/80 text-white font-medium hover:border-church-gold/30'
                              }`}
                              onClick={() => handleMarkSingleRead(n.id, n.title)}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className={`font-bold uppercase tracking-wide ${n.is_read ? 'text-slate-400' : 'text-church-gold'}`}>{n.title}</span>
                                {!n.is_read && <span className="w-1.5 h-1.5 bg-church-gold rounded-full mt-1 shrink-0" />}
                              </div>
                              <p className="mb-1 text-slate-300">{n.message}</p>
                              <span className="text-[9px] text-slate-500">{new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 text-xs">
                            No notifications yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop-only quick link to portal / sign in to keep header clean on mobile */}
              <div className="hidden sm:flex items-center gap-2.5">
                {user ? (
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-church-gold/30 bg-church-gold/5 hover:bg-church-gold/10 text-white transition-all text-xs font-bold tracking-wider uppercase"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-church-gold" />
                      <span>{user.username}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3.5 py-2 rounded-xl border border-rose-500/50 text-rose-400 hover:text-white hover:bg-rose-600 text-xs font-black tracking-widest uppercase transition-all duration-350 shadow-lg hover:shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl border border-church-gold/50 text-church-gold hover:text-church-blue hover:bg-church-gold text-xs font-black tracking-widest uppercase transition-all duration-350 shadow-lg hover:shadow-church-gold/20"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* BACKDROP OVERLAY */}
      <div
        className={`fixed inset-0 z-[60] bg-transparent ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* SLIDING SIDEBAR DRAWER */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-[70] w-80 max-w-[85vw] bg-church-blue/95 border-r border-church-gold/20 shadow-none flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-church-gold/15">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 group shrink-0">
            <img 
              src={settings.church_logo || "/church_logo.png"} 
              alt="Logo" 
              className="h-11 w-11 object-cover rounded-full border border-church-gold/30 transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-church-gold via-church-gold-light to-church-gold font-display">
              CBC
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-350 hover:text-church-gold hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-1.5 no-scrollbar">
          {navLinks.map((link, index) => {
            const isHash = link.path.startsWith('/#');
            const isActive = isHash 
              ? location.pathname === '/' && location.hash === link.path.substring(1)
              : location.pathname === link.path;
            return (
              <Link
                key={index}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`relative flex items-center px-4 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 group border border-transparent ${
                  isActive 
                    ? 'text-church-gold bg-church-gold/10 font-extrabold shadow-[inset_0_0_12px_rgba(212,175,55,0.05)] border-l-2 border-church-gold' 
                    : 'text-slate-300 hover:text-church-gold hover:bg-white/5 hover:translate-x-1.5'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Drawer Footer (User Access controls for Mobile & Desktop) */}
        {user ? (
          <div className="p-5 border-t border-church-gold/15 bg-church-blue-light/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-church-gold/10 border border-church-gold/20 flex items-center justify-center text-church-gold shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Logged in as</p>
                <p className="text-xs font-black text-slate-200 truncate">{user.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-church-gold/30 text-[10px] font-bold text-center text-slate-200 hover:bg-church-gold/10 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-church-gold" />
                <span>Portal</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-500/30 text-[10px] font-bold text-center text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 border-t border-church-gold/15 bg-church-blue-light/20">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-church-gold to-church-gold-hover text-church-blue text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-church-gold/10 hover:shadow-church-gold/20 hover:brightness-110"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
