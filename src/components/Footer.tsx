import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import api from '../utils/api';
import churchLogoImg from '../assets/church_logo.png';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    church_name: 'Carmel Bible Church',
    contact_phone: '87908 73190',
    contact_email: 'pastor@carmelbiblechurch.org',
    contact_address: 'Carmel Bible Church, side of the water tank, Dolapeta, Rajam Pin: 532127',
    map_embed_url: 'https://www.google.com/maps?q=Carmel+Bible+Church,+Rajam,+Andhra+Pradesh+532127&output=embed',
    facebook_url: 'https://www.facebook.com/syam.chevuri.9',
    youtube_url: 'https://www.youtube.com/@Shyam_Chevuri',
    instagram_url: 'https://www.instagram.com'
  });

  useEffect(() => {
    api.get('/api/settings/')
      .then((res) => {
        if (res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-church-blue text-slate-300 border-t border-church-gold/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Church Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={churchLogoImg} 
                alt="Carmel Bible Church Logo" 
                className="h-10 w-10 object-cover rounded-full border border-church-gold/30" 
              />
              <h3 className="text-xl font-bold text-church-gold font-display">
                {settings.church_name}
              </h3>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              A place of faith, prayer, worship, and spiritual growth. Dedicated to preaching sound reformed doctrine and making disciples of all nations.
            </p>
            <div className="flex gap-4">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-church-gold hover:text-church-blue transition-all" aria-label="Facebook">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-church-gold hover:text-church-blue transition-all" aria-label="YouTube">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-church-gold hover:text-church-blue transition-all" aria-label="Instagram">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white font-display mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-church-gold transition-colors">Home</Link></li>
              <li><Link to="/events" className="hover:text-church-gold transition-colors">Upcoming Events</Link></li>
              <li><Link to="/prayers" className="hover:text-church-gold transition-colors">Prayer Requests</Link></li>
              <li><Link to="/live-stream" className="hover:text-church-gold transition-colors">Watch Live Stream</Link></li>
              <li><Link to="/gallery" className="hover:text-church-gold transition-colors">Photo Gallery</Link></li>
              <li><Link to="/announcements" className="hover:text-church-gold transition-colors">Announcements</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-lg font-semibold text-white font-display mb-4">Contact Info</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-church-gold shrink-0 mt-0.5" />
                <span>{settings.contact_address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-church-gold shrink-0" />
                <span>{settings.contact_phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-church-gold shrink-0" />
                <span>{settings.contact_email}</span>
              </li>
            </ul>
          </div>

          {/* Map Location */}
          <div>
            <h4 className="text-lg font-semibold text-white font-display mb-4">Our Location</h4>
            <div className="w-full h-44 rounded-xl overflow-hidden shadow-inner border border-slate-700/50">
              {settings.map_embed_url ? (
                <iframe
                  title="Church Location Map"
                  src={settings.map_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-slate-500">
                  Map View Unavailable
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Carmel Bible Church. All rights are reserved.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-church-gold">Admin Access Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
