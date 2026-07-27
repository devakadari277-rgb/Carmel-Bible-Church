import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ImageIcon, Loader } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/gallery/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.results)
            ? res.data.results
            : [];

        setPhotos(data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-church-gold uppercase tracking-wider block mb-1">Gallery</span>
          <h1 className="text-3xl sm:text-5xl font-black text-church-blue dark:text-white font-display">Photo Gallery</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Glimpses of our Sunday fellowships, community works, Worships camps, and church gatherings.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader className="w-10 h-10 animate-spin text-church-gold" /></div>
        ) : photos.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.map((p) => (
              <div
                key={p.id}
                className="break-inside-avoid rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <img
                  src={p.image}
                  alt={p.caption}
                  className="w-full h-auto object-cover max-h-[400px] hover:scale-101 transition-transform duration-300"
                />

                {p.caption && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/40">
                    <p className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">{p.caption}</p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-1">Uploaded: {new Date(p.uploaded_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-350 mb-3" />
            <p>No photos posted in the gallery yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
