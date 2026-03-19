
import React, { useState, useEffect } from 'react';
import { Loader2, Check, Mail, ExternalLink, AlertTriangle, ShieldCheck, Pencil } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import Button from './ui/button';
import Input from './ui/input';
import { API_URL, PLAN_LIMITS } from '../constants';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string;
  onUpgradeSuccess: (payments?: any[]) => void;
  premiumPrice?: number; // Optional prop
  oldPrice?: number; // Optional prop for marketing
}

const CartIcon = () => (
  <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    <path d="M26 24.75C26.4142 24.75 26.75 24.4142 26.75 24C26.75 23.5858 26.4142 23.25 26 23.25V24.75ZM26 23.25H11V24.75H26V23.25ZM8.75 21V15H7.25V21H8.75ZM11 23.25C9.75736 23.25 8.75 22.2426 8.75 21H7.25C7.25 23.0711 8.92893 24.75 11 24.75V23.25Z" fill="currentColor"></path>
    <path d="M1.5 3.25C1.08579 3.25 0.75 3.58579 0.75 4C0.75 4.41421 1.08579 4.75 1.5 4.75V3.25ZM1.5 4.75H6V3.25H1.5V4.75ZM7.25 6V21H8.75V6H7.25ZM6 4.75C6.69036 4.75 7.25 5.30964 7.25 6H8.75C8.75 4.48122 7.51878 3.25 6 3.25V4.75Z" fill="currentColor"></path>
    <path d="M22 21.75C22.4142 21.75 22.75 21.4142 22.75 21C22.75 20.5858 22.4142 20.25 22 20.25V21.75ZM22 20.25H11V21.75H22V20.25ZM8.75 18V12H7.25V18H8.75ZM11 20.25C9.75736 20.25 8.75 19.2426 8.75 18H7.25C7.25 20.0711 8.92893 21.75 11 21.75V20.25Z" fill="currentColor"></path>
    <path d="M27.2057 19.754C27.0654 20.1438 26.6357 20.346 26.246 20.2057C25.8562 20.0654 25.654 19.6357 25.7943 19.246L27.2057 19.754ZM30.0361 9.67744L29.3305 9.4234L29.3305 9.4234L30.0361 9.67744ZM25.7943 19.246L29.3305 9.4234L30.7418 9.93148L27.2057 19.754L25.7943 19.246ZM28.1543 7.75L8 7.75V6.25L28.1543 6.25V7.75ZM29.3305 9.4234C29.6237 8.60882 29.0201 7.75 28.1543 7.75V6.25C30.059 6.25 31.3869 8.13941 30.7418 9.93148L29.3305 9.4234Z" fill="currentColor"></path>
    <path d="M13.5 21.75C13.0858 21.75 12.75 21.4142 12.75 21C12.75 20.5858 13.0858 20.25 13.5 20.25V21.75ZM26.7111 19.009L27.4174 19.2613L27.4174 19.2613L26.7111 19.009ZM13.5 20.25H23.8858V21.75H13.5V20.25ZM26.0048 18.7568L27.7937 13.7477L29.2063 14.2523L27.4174 19.2613L26.0048 18.7568ZM23.8858 20.25C24.8367 20.25 25.6849 19.6522 26.0048 18.7568L27.4174 19.2613C26.8843 20.7537 25.4706 21.75 23.8858 21.75V20.25Z" fill="currentColor"></path>
    <path d="M21.1694 10.5806L14.5651 17.1849" stroke="currentColor"></path>
    <path d="M22.1694 14.5806L18.5632 18.1868" stroke="currentColor"></path>
    <circle cx="13.1" cy="26.1" r="1.7" stroke="currentColor"></circle>
    <circle cx="22.1" cy="26.1" r="1.7" stroke="currentColor"></circle>
  </svg>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, userId, userEmail, onUpgradeSuccess, premiumPrice, oldPrice }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingEmail, setBillingEmail] = useState(userEmail || '');
  const [isEditingEmail, setIsEditingEmail] = useState(!userEmail || !userEmail.includes('@'));
  const [error, setError] = useState<string | null>(null);

  // Format price (cents to unit)
  const displayPrice = premiumPrice ? (premiumPrice / 100).toFixed(0) : "49";
  const displayOldPrice = oldPrice ? (oldPrice / 100).toFixed(0) : null;

  useEffect(() => {
      if (isOpen) {
          setError(null);
          const initialEmail = userEmail || '';
          setBillingEmail(initialEmail);
          const hasValidEmail = initialEmail.includes('@') && initialEmail.length > 3;
          setIsEditingEmail(!hasValidEmail);
      }
  }, [isOpen, userEmail]);

  const handlePayment = async () => {
    setError(null);
    let emailToSend = billingEmail || userEmail || '';
    emailToSend = emailToSend.trim();

    if (!emailToSend || !emailToSend.includes('@')) {
        setError("Te rugăm să introduci o adresă de email validă pentru factură.");
        setIsEditingEmail(true); 
        return;
    }

    setIsProcessing(true);
    const session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    
    try {
        const res = await fetch(`${API_URL}/upgrade`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}` 
            },
            body: JSON.stringify({ 
                userId,
                email: emailToSend
            })
        });

        const data = await res.json();

        if (res.ok && data.url) {
            window.location.href = data.url; 
        } else {
            console.error("❌ Payment failed:", data.error);
            setError(data.error || "Eroare la inițierea plății.");
            setIsProcessing(false);
        }
    } catch (error) {
        console.error("❌ Network/Fetch Error:", error);
        setError("Eroare de conexiune cu serverul de plăți.");
        setIsProcessing(false);
    }
  };

  const features = [
    `Invitați Nelimitați`,
    "Planificator Mese Nelimitat",
    "Acces la Tema Modern Dark & Floral",
    "Calculator Buget Automat",
    "Export PDF (În curând)"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-2xl">
            
            {/* Header Section */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 flex flex-col items-center justify-center border-b border-neutral-100 dark:border-neutral-800">
                <div className="mb-4 p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                    <CartIcon />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Upgrade la Premium</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center max-w-[280px] leading-relaxed">
                   Deblochează toate funcționalitățile.
                </p>
            </div>
            
            <div className="p-6">
                <div className="space-y-3 mb-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 group">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="mb-6">
                    {!isEditingEmail && billingEmail ? (
                        <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg animate-in fade-in">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <div className="text-xs overflow-hidden">
                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">Factura se trimite la:</p>
                                    <p className="font-semibold text-indigo-900 dark:text-indigo-200 truncate">{billingEmail}</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                onClick={() => setIsEditingEmail(true)}
                            >
                                <Pencil className="w-3 h-3 mr-1" /> Modifică
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                            <label className="text-xs font-semibold text-muted-foreground ml-1">Email Facturare</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    value={billingEmail} 
                                    onChange={(e) => setBillingEmail(e.target.value)} 
                                    placeholder={userEmail || "adresa@email.com"} 
                                    className="pl-9"
                                    autoFocus={isEditingEmail}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1">Vom trimite factura și confirmarea plății aici.</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/10 rounded-md text-red-600 text-xs font-medium animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Preț Unic</span>
                        <div className="flex items-baseline gap-1.5">
                            {displayOldPrice && (
                                <span className="text-sm text-neutral-400 line-through decoration-neutral-400/50">{displayOldPrice} LEI</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                         <span className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{displayPrice} LEI</span>
                    </div>
                </div>

                <Button 
                    type="button"
                    className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-[#635BFF] hover:bg-[#5851E3] text-white" 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se inițiază plata...</>
                    ) : (
                        <><ExternalLink className="w-4 h-4 mr-2" /> Plătește cu Stripe</>
                    )}
                </Button>
                
                <p className="text-[10px] text-center text-neutral-400 mt-4">
                    Plată securizată. Nu stocăm datele cardului tău.
                </p>
            </div>
        </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
