import React, { useEffect, useState } from 'react';
import { Loader2, Check, Mail, ExternalLink, AlertTriangle, CreditCard } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import Button from './ui/button';
import Input from './ui/input';
import { API_URL } from '../constants';
import { UserProfile } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string;
  userProfile?: Partial<UserProfile>;
  onUpgradeSuccess: (payments?: any[]) => void;
  premiumPrice?: number;
  oldPrice?: number;
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

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userProfile,
  onUpgradeSuccess,
  premiumPrice,
  oldPrice,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingNetopia, setIsProcessingNetopia] = useState(false);
  const [billingEmail, setBillingEmail] = useState(userEmail || '');
  const [billingType, setBillingType] = useState<'individual' | 'company'>('individual');
  const [billingName, setBillingName] = useState('');
  const [billingCompany, setBillingCompany] = useState('');
  const [billingVatCode, setBillingVatCode] = useState('');
  const [billingRegNo, setBillingRegNo] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingCounty, setBillingCounty] = useState('');
  const [billingCountry, setBillingCountry] = useState('Romania');
  const [billingPhone, setBillingPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const displayPrice = premiumPrice ? (premiumPrice / 100).toFixed(0) : '49';
  const displayOldPrice = oldPrice ? (oldPrice / 100).toFixed(0) : null;

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    const profile = userProfile || {};
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

    setBillingType(profile.billingType === 'company' ? 'company' : 'individual');
    setBillingName(profile.billingName || fullName || '');
    setBillingCompany(profile.billingCompany || '');
    setBillingVatCode(profile.billingVatCode || '');
    setBillingRegNo(profile.billingRegNo || '');
    setBillingAddress(profile.billingAddress || profile.address || '');
    setBillingCity(profile.billingCity || profile.city || '');
    setBillingCounty(profile.billingCounty || profile.county || '');
    setBillingCountry(profile.billingCountry || profile.country || 'Romania');
    setBillingPhone(profile.billingPhone || profile.phone || '');

    const initialEmail = (profile.billingEmail || userEmail || profile.email || '').trim();
    setBillingEmail(initialEmail);
  }, [isOpen, userEmail, userProfile]);

  const getBillingPayload = () => {
    const email = (billingEmail || userEmail || '').trim();
    return {
      type: billingType,
      name: billingName.trim(),
      company: billingCompany.trim(),
      vatCode: billingVatCode.trim(),
      regNo: billingRegNo.trim(),
      address: billingAddress.trim(),
      city: billingCity.trim(),
      county: billingCounty.trim(),
      country: billingCountry.trim(),
      email,
      phone: billingPhone.trim(),
    };
  };

  const validateBilling = () => {
    const payload = getBillingPayload();
    if (!payload.email || !payload.email.includes('@')) {
      return 'Te rugam sa introduci o adresa de email valida pentru factura.';
    }
    if (!payload.name) {
      return 'Completeaza numele persoanei de facturare.';
    }
    if (payload.type === 'company' && !payload.company) {
      return 'Pentru firma, completeaza numele companiei.';
    }
    if (!payload.address) {
      return 'Completeaza adresa de facturare.';
    }
    if (!payload.city) {
      return 'Completeaza orasul de facturare.';
    }
    if (!payload.country) {
      return 'Completeaza tara de facturare.';
    }
    return null;
  };

  const handlePayment = async () => {
    setError(null);
    const validationError = validateBilling();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    const session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');

    try {
      const billing = getBillingPayload();
      const res = await fetch(`${API_URL}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          userId,
          email: billing.email,
          billing,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Eroare la initierea platii.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Eroare de conexiune cu serverul de plati.');
      setIsProcessing(false);
    }
  };

  const handleNetopiaPayment = async () => {
    setError(null);
    const validationError = validateBilling();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessingNetopia(true);
    const session = JSON.parse(localStorage.getItem('weddingPro_session') || '{}');
    try {
      const billing = getBillingPayload();
      const res = await fetch(`${API_URL}/netopia/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          email: billing.email,
          billing,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Eroare la initierea platii Netopia.');
        return;
      }
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentUrl;
      [['iv', data.iv], ['env_key', data.env_key], ['data', data.data], ['cipher', data.cipher]].forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Netopia payment error:', err);
      setError('Eroare de conexiune cu serverul de plati.');
    } finally {
      setIsProcessingNetopia(false);
    }
  };

  const features = [
    'Invitatii Nelimitate',
    'Planificator Mese Nelimitat',
    'Acces la Tema Modern Dark & Floral',
    'Calculator Buget Automat',
    'Export PDF (In curand)',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-2xl">
        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 flex flex-col items-center justify-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="mb-4 p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <CartIcon />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Upgrade la Premium</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center max-w-[360px] leading-relaxed">
            Deblocheaza toate functionalitatile.
          </p>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
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

          <div className="mb-6 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50/60 dark:bg-neutral-900/30">
            <div className="mb-3">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Date de facturare</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Aceste date sunt trimise catre Stripe si salvate in contul tau.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tip facturare</label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value === 'company' ? 'company' : 'individual')}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="individual">Persoana fizica</option>
                  <option value="company">Companie</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email facturare</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder={userEmail || 'adresa@email.com'}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Nume complet</label>
                <Input value={billingName} onChange={(e) => setBillingName(e.target.value)} placeholder="Ex: Maria Popescu" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Telefon</label>
                <Input value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} placeholder="07xxxxxxxx" />
              </div>

              {billingType === 'company' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Companie</label>
                    <Input value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} placeholder="SC Exemplu SRL" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">CUI</label>
                    <Input value={billingVatCode} onChange={(e) => setBillingVatCode(e.target.value)} placeholder="RO12345678" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">Nr. Reg. Comertului</label>
                    <Input value={billingRegNo} onChange={(e) => setBillingRegNo(e.target.value)} placeholder="J40/0000/2026" />
                  </div>
                </>
              )}

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Adresa</label>
                <Input
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Strada, numar, bloc, apartament"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Oras</label>
                <Input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} placeholder="Bucuresti" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Judet</label>
                <Input value={billingCounty} onChange={(e) => setBillingCounty(e.target.value)} placeholder="Ilfov" />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Tara</label>
                <Input value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} placeholder="Romania" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/10 rounded-md text-red-600 text-xs font-medium animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pret unic</span>
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
            disabled={isProcessing || isProcessingNetopia}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se initiaza plata...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" /> Plateste cu Stripe
              </>
            )}
          </Button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
            <span className="text-[10px] text-neutral-400 font-medium">SAU</span>
            <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-sm font-medium border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
            onClick={handleNetopiaPayment}
            disabled={isProcessing || isProcessingNetopia}
          >
            {isProcessingNetopia ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se initiaza...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" /> Plateste cu Netopia
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-neutral-400 mt-4">
            Plata securizata. Nu stocam datele cardului tau.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
