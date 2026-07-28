import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Megaphone, Calendar, Loader } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/announcements/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setAnnouncements(data);
      }).catch((err) => {
        console.error('Fetch Announcements Error:', err);
        setAnnouncements([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-church-gold uppercase tracking-wider block mb-1">Board</span>
          <h1 className="text-3xl sm:text-5xl font-black text-church-blue dark:text-white font-display">Weekly Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Stay updated with our weekly meeting shifts, church plans, and general news postings.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader className="w-10 h-10 animate-spin text-church-gold" /></div>
        ) : announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-205 dark:border-slate-800 shadow-sm flex gap-4 items-start"
              >
                <div className="p-3 bg-church-gold/10 text-church-gold rounded-2xl shrink-0 mt-0.5">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex justify-between items-start mb-2 gap-4 flex-wrap">
                    <h3 className="text-lg font-bold text-church-blue dark:text-white font-display leading-tight">{ann.title}</h3>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            No active announcements.
          </div>
        )}
      </div>
    </div>
  );
};
