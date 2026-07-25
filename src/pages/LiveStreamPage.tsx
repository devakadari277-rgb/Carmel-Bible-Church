import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Video, Calendar, Loader } from 'lucide-react';

export const LiveStreamPage: React.FC = () => {
  const [activeStream, setActiveStream] = useState<any>(null);
  const [archiveStreams, setArchiveStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/live-streams/')
      .then((res) => {
        const active = res.data.find((s: any) => s.is_active);
        const archives = res.data.filter((s: any) => !s.is_active);
        setActiveStream(active || null);
        setArchiveStreams(archives);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-church-gold uppercase tracking-wider block mb-1">Broadcast</span>
          <h1 className="text-3xl sm:text-5xl font-black text-church-blue dark:text-white font-display">Ceremonies & Live Stream</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Participate in our service live stream or listen to ceremony recordings of past sunday services.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader className="w-10 h-10 animate-spin text-church-gold" /></div>
        ) : (
          <div className="space-y-16">
            
            {/* Active Live Broadcaster */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-church-blue dark:text-white font-display mb-4 text-center">
                {activeStream ? 'Join Current Live Stream' : 'Live Service Status'}
              </h2>
              
              <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-205 dark:border-slate-800/80 bg-slate-900">
                {activeStream && activeStream.youtube_id ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${activeStream.youtube_id}?autoplay=1`}
                    title={activeStream.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Video className="w-14 h-14 text-slate-700 mb-4" />
                    <h4 className="text-lg font-bold text-white">Broadcast is Offline</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Our live services are broadcasted on Sundays starting at 10:00 AM. Please browse past ceremonies below in the time.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Archives Grid */}
            <div>
              <h2 className="text-2xl font-bold text-church-blue dark:text-white font-display mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
                Archived Ceremonies & Services
              </h2>
              
              {archiveStreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {archiveStreams.map((s) => (
                    <div 
                      key={s.id}
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                        {s.youtube_id ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${s.youtube_id}`}
                            title={s.title}
                            frameBorder="0"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs">Video Unavailable</div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(s.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-snug">{s.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6">No archived ceremonies available.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
