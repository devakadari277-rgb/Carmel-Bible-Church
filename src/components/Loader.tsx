import React from 'react';
import { motion } from 'framer-motion';
import churchLogoImg from '../assets/church_logo.png';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ 
  size = 'md', 
  color = 'border-church-gold' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-t-transparent ${color} ${sizeClasses[size]}`}></div>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-church-blue">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="flex flex-col items-center mb-6"
      >
        <img 
          src={churchLogoImg} 
          alt="Carmel Bible Church Logo" 
          className="w-20 h-20 object-contain mb-4 filter drop-shadow-2xl" 
        />
        <span className="text-2xl font-extrabold tracking-wider text-church-gold font-display text-center">
          CARMEL BIBLE CHURCH
        </span>
      </motion.div>
      <LoadingSpinner size="lg" color="border-church-gold" />
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`}></div>
  );
};
