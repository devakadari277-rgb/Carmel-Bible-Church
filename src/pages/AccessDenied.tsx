import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { motion } from 'framer-motion';



export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();


  
  useEffect(() => {
    // Automatically redirect home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl animate-pulse">
            <ShieldAlert className="w-16 h-16 text-rose-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-white font-display mb-2">
          Access Denied
        </h1>
        
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You do not have administrative privileges to access this area. Admin access only. You will be automatically redirected to the Home page.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-rose-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Page</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
