import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { HeartHandshake, Pin, User, Clock, Loader, Edit2, Trash2 } from 'lucide-react';

export const PrayersPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPrayers = () => {
    setLoading(true);
    api.get('/api/prayers/')
      .then((res) => {
        // Sort pinned first
        const sorted = res.data.sort((a: any, b: any) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setPrayers(sorted);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const handleEditClick = (prayer: any) => {
    setEditingId(prayer.id);
    setTitle(prayer.title);
    setDesc(prayer.description);
    setIsAnonymous(prayer.is_anonymous);
    setVisibility(prayer.visibility);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDesc('');
    setIsAnonymous(false);
    setVisibility('all');
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm("Are you sure you want to Delete this prayer request?")) return;
    try {
      await api.delete(`/api/prayers/${id}/`);
      addToast('Prayer request Deleted successfully.', 'success');
      fetchPrayers();
    } catch {
      addToast('Failed to Delete prayer request.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) {
      addToast('Please fill out the title and request description.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/prayers/${editingId}/`, {
          title,
          description: desc,
          is_anonymous: isAnonymous,
          visibility: visibility
        });
        addToast('Your prayer request has been updated successfully.', 'success');
      } else {
        await api.post('/api/prayers/', {
          title,
          description: desc,
          is_anonymous: isAnonymous,
          visibility: visibility
        });
        if (visibility === 'all') {
          addToast('Your prayer request has been submitted and is now visible on the Prayer wall.', 'success');
        } else {
          addToast('Your private prayer request has been sent to the administrator.', 'success');
        }
      }
      setTitle('');
      setDesc('');
      setIsAnonymous(false);
      setVisibility('all');
      setEditingId(null);
      fetchPrayers(); // Refresh
    } catch {
      addToast(editingId ? 'Failed to update prayer request.' : 'Failed to submit prayer request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-church-gold uppercase tracking-wider block mb-1">
            Prayer
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-church-blue dark:text-white font-display">
            Prayer Request
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed font-medium">
            Bear one another's burdens, and so fulfill the law of Christ (Galatians 6:2).
            Share your request or stand in prayer for others.
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 max-w-2xl mx-auto leading-relaxed font-medium">
            “ఒకరి భారములను ఒకరు భరించుడి; ఈ విధముగా క్రీస్తు ధర్మశాస్త్రమును నెరవేర్చుదురు.”
            (గలతీయులకు 6:2)
            <br />
            మీ ప్రార్థనా విజ్ఞప్తిని పంచుకోండి లేదా ఇతరుల కోసం ప్రార్థనలో నిలబడండి.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Submit form on left */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md">
              <h3 className="text-xl font-bold text-church-blue dark:text-white font-display mb-4 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-church-gold" />
                <span>{editingId ? 'Edit Prayer Request' : 'Submit Request'}</span>
              </h3>

              {user ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">Prayer Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Healing/Guidance/Thanksgiving..."
                      className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                      required
                      rows={5}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Describe your request in detail..."
                      className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">Who can view this request?</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="all"
                          checked={visibility === 'all'}
                          onChange={() => setVisibility('all')}
                          className="w-4 h-4 text-church-gold border-slate-300 dark:border-slate-700 focus:ring-church-gold focus:ring-2 cursor-pointer"
                        />
                        <span>Everyone (All)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="admin"
                          checked={visibility === 'admin'}
                          onChange={() => setVisibility('admin')}
                          className="w-4 h-4 text-church-gold border-slate-300 dark:border-slate-700 focus:ring-church-gold focus:ring-2 cursor-pointer"
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
                      className="w-4 h-4 text-church-gold border-slate-300 dark:border-slate-700 rounded focus:ring-church-gold focus:ring-2"
                    />
                    <label htmlFor="anonymous" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Submit Request Anonymously
                    </label>
                  </div>
                  <div className="flex gap-3">
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all text-sm animate-fade-in"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue font-bold rounded-2xl transition-all shadow-md disabled:opacity-50 text-sm"
                    >
                      {submitting ? 'Saving...' : editingId ? 'Save Changes' : ' Submit Prayer Request'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">Please log in and to submit a prayer request on our Prayer Request wall.</p>
                  <a
                    href="/login"
                    className="inline-block px-6 py-2.5 bg-church-blue hover:bg-church-blue-light text-white text-xs font-bold rounded-full transition-all"
                  >
                    Login to Account
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* List on right */}
          <div className="lg:col-span-7 space-y-6">
            {loading ? (
              <div className="py-12 flex justify-center"><Loader className="w-8 h-8 animate-spin text-church-gold" /></div>
            ) : prayers.length > 0 ? (
              prayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`p-6 rounded-3xl border bg-white dark:bg-dark-card shadow-sm transition-all ${prayer.is_pinned ? 'border-church-gold/40 ring-1 ring-church-gold/25' : 'border-slate-200 dark:border-slate-800'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white text-base leading-snug">{prayer.title}</h4>
                      {prayer.is_pinned && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-church-gold bg-church-gold/10 px-1.5 py-0.5 rounded border border-church-gold/20">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {user && (user.id === prayer.user_id || user.role === 'admin') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditClick(prayer)}
                            className="p-1.5 text-slate-400 hover:text-church-gold dark:hover:text-church-gold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                            title="Edit Request"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prayer.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(prayer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{prayer.description}</p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted by: {prayer.is_anonymous ? 'Anonymous' : prayer.username}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                No prayer requests are currently approved for display.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
