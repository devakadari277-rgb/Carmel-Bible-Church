import React from 'react';
import { Heart, Landmark, Copy } from 'lucide-react';
import { useToast } from '../components/Toast';

export const GivePage: React.FC = () => {
  const { addToast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'success');
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 text-church-gold mx-auto mb-4" />
          <h1 className="text-3xl sm:text-5xl font-black text-church-blue dark:text-white font-display uppercase tracking-widest">
            Cheerfully Giving
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-lg mx-auto font-serif italic">
              "సణుగుకొనకయు బలవంతముగా కాకయు ప్రతివాడును తన హృδευములో నిశ్చయించుకొనిన ప్రకారము ఇయ్యవలెను; దేవుడు ఉత్సాహముగా ఇచ్చువానిని ప్రేమించును". 2 కొరింథీయులకు 9:7
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {/* Bank & Mobile Transfer Details */}
          <div className="p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 shadow-md">
            <h3 className="text-xl font-bold text-church-blue dark:text-white font-display mb-6 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-church-gold" />
              <span>Direct Transfer & PhonePe Details</span>
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              You can support the ministries, local aid, and missionary works of Carmel Bible Church by sending contributions to the following account or PhonePe number:
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850 text-sm">
                <span className="text-slate-400 text-xs">Account Name</span>
                <span className="font-semibold text-slate-800 dark:text-white">Carmel bible church</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850 text-sm">
                <span className="text-slate-400 text-xs">Account Holder Name</span>
                <span className="font-semibold text-slate-800 dark:text-white">Shyam Chevuri</span>
              </div>
              
              {/* Copyable Phone No */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-850 text-sm">
                <span className="text-slate-400 text-xs">Account Holder Phone No</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-800 dark:text-white">87908 73190</span>
                  <button 
                    onClick={() => copyToClipboard('8790873190', 'Phone number')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-church-gold"
                    title="Copy Phone Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Copyable PhonePe No */}
              <div className="flex justify-between items-center py-2.5 text-sm">
                <span className="text-slate-400 text-xs">PhonePe Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-800 dark:text-white">87908 73190</span>
                  <button 
                    onClick={() => copyToClipboard('8790873190', 'PhonePe number')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-church-gold"
                    title="Copy PhonePe Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
