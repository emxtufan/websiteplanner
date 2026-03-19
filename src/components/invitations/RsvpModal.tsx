
import React, { useState } from 'react';
import { X, UserCheck, UserX, MessageSquare, Baby, Check, User, Plus, Minus } from 'lucide-react';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  guestName: string;
  isPublic?: boolean; // New Prop
}

const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, onSubmit, guestName, isPublic }) => {
  const [status, setStatus] = useState<'confirmed' | 'declined' | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState('');
  const [publicName, setPublicName] = useState(''); // State for manual name entry
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;
    if (isPublic && !publicName.trim()) return; // Validation for public mode
    
    setIsSubmitting(true);
    await onSubmit({
      status,
      name: isPublic ? publicName : undefined, // Send name if public
      rsvpData: {
        confirmedCount: status === 'confirmed' ? (adults + children) : 0,
        adultsCount: status === 'confirmed' ? adults : 0,
        childrenCount: status === 'confirmed' ? children : 0,
        hasChildren: status === 'confirmed' && children > 0,
        message
      }
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleCounter = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number) => {
      setter(prev => Math.max(min, prev + value));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Confirmare Prezență</h2>
              <p className="text-sm text-zinc-500">
                  {isPublic ? "Te rugăm să completezi detaliile." : <>pentru <span className="font-semibold text-zinc-700 dark:text-zinc-300">{guestName}</span></>}
              </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           
           {/* NAME INPUT FOR PUBLIC MODE */}
           {isPublic && (
               <div className="space-y-2">
                   <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                       <User className="w-4 h-4" /> Numele Tău / Familia Ta <span className="text-red-500">*</span>
                   </label>
                   <input 
                       type="text"
                       required
                       placeholder="Ex: Popescu Ion sau Familia Ionescu"
                       className="w-full h-10 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 focus:ring-2 focus:ring-black focus:outline-none"
                       value={publicName}
                       onChange={(e) => setPublicName(e.target.value)}
                   />
               </div>
           )}

           {/* Decision */}
           <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setStatus('confirmed')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  status === 'confirmed' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                 <div className={`p-2 rounded-full ${status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Check className="w-5 h-5" />
                 </div>
                 <span className="font-semibold">Confirm</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('declined')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  status === 'declined' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                 <div className={`p-2 rounded-full ${status === 'declined' ? 'bg-red-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    <UserX className="w-5 h-5" />
                 </div>
                 <span className="font-semibold">Nu pot ajunge</span>
              </button>
           </div>

           {status === 'confirmed' && (
               <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      {/* Adults Counter */}
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Adulți</label>
                          <div className="flex items-center gap-4">
                              <button type="button" onClick={() => handleCounter(setAdults, -1, 1)} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm border flex items-center justify-center hover:bg-zinc-100"><Minus className="w-4 h-4"/></button>
                              <span className="text-xl font-bold w-4 text-center">{adults}</span>
                              <button type="button" onClick={() => handleCounter(setAdults, 1, 1)} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm border flex items-center justify-center hover:bg-zinc-100"><Plus className="w-4 h-4"/></button>
                          </div>
                      </div>

                      {/* Children Counter */}
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1"><Baby className="w-3 h-3"/> Copii</label>
                          <div className="flex items-center gap-4">
                              <button type="button" onClick={() => handleCounter(setChildren, -1, 0)} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm border flex items-center justify-center hover:bg-zinc-100"><Minus className="w-4 h-4"/></button>
                              <span className="text-xl font-bold w-4 text-center">{children}</span>
                              <button type="button" onClick={() => handleCounter(setChildren, 1, 0)} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-sm border flex items-center justify-center hover:bg-zinc-100"><Plus className="w-4 h-4"/></button>
                          </div>
                      </div>
                  </div>
                  
                  {children > 0 && (
                      <div className="text-xs text-center text-zinc-500 italic">
                          Locurile pentru copii vor fi marcate automat cu meniu special.
                      </div>
                  )}
               </div>
           )}

           <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Mesaj pentru miri (opțional)
              </label>
              <textarea 
                className="w-full min-h-[80px] rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
                placeholder={status === 'declined' ? "Ne pare rău, dar..." : "Abia așteptăm să vă vedem!"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
           </div>

           {/* Footer Actions */}
           <button 
             type="submit" 
             disabled={!status || isSubmitting || (isPublic && !publicName.trim())}
             className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
               !status || (isPublic && !publicName.trim())
                 ? 'bg-zinc-300 cursor-not-allowed' 
                 : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-lg'
             }`}
           >
             {isSubmitting ? 'Se trimite...' : 'Trimite Răspunsul'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default RsvpModal;