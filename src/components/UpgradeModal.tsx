import React, { useEffect, useState } from 'react';
import { Loader2, Check, ExternalLink, AlertTriangle, CreditCard } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import Button from './ui/button';
import Input from './ui/input';
import { API_URL } from '../constants';
import { UserProfile } from '../types';
import {
  RO_COUNTIES,
  ShippingAddressDraft,
  composeAddressLine,
  isAddressComplete,
  isBucharest,
  isValidRoPhone,
  isValidRoPostalCode,
  shortAddressSummary,
} from '../lib/roAddress';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentPlan?: 'free' | 'basic' | 'premium';
  userEmail?: string;
  userProfile?: Partial<UserProfile>;
  onUpgradeSuccess: (payments?: any[]) => void;
  basicPrice?: number;
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

const BUCHAREST_KEYS = new Set(['bucuresti', 'bucharest', 'municipiul bucuresti', 'mun bucuresti']);
const SECTOR_OPTIONS = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'];

const normalizeText = (value: string) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();

const isBucharestCity = (city: string) => BUCHAREST_KEYS.has(normalizeText(city));

const normalizeSector = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const m = raw.match(/([1-6])/);
  if (!m) return '';
  return `Sector ${m[1]}`;
};

type CheckoutContactAddress = ShippingAddressDraft & {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const createEmptyCheckoutAddress = (): CheckoutContactAddress => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  county: '',
  city: '',
  street: '',
  number: '',
  block: '',
  staircase: '',
  floor: '',
  apartment: '',
  postalCode: '',
  landmark: '',
  country: 'Romania',
});

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentPlan,
  userEmail,
  userProfile,
  onUpgradeSuccess,
  basicPrice,
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
  const [billingSector, setBillingSector] = useState('');
  const [savedCheckoutAddress, setSavedCheckoutAddress] = useState<CheckoutContactAddress>(createEmptyCheckoutAddress);
  const [checkoutAddress, setCheckoutAddress] = useState<CheckoutContactAddress>(createEmptyCheckoutAddress);
  const [addressMode, setAddressMode] = useState<'saved_account' | 'manual_entry'>('manual_entry');
  const [isCheckoutAddressEditable, setIsCheckoutAddressEditable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('premium');
  const [error, setError] = useState<string | null>(null);
  const bucharestSelected = isBucharest(checkoutAddress.city);
  const normalizedCurrentPlan: 'free' | 'basic' | 'premium' =
    currentPlan === 'basic' || currentPlan === 'premium' ? currentPlan : 'free';
  const planRank: Record<'free' | 'basic' | 'premium', number> = { free: 0, basic: 1, premium: 2 };
  const priceMapCents: Record<'free' | 'basic' | 'premium', number> = {
    free: 0,
    basic: Number.isFinite(Number(basicPrice)) ? Number(basicPrice) : 1900,
    premium: Number.isFinite(Number(premiumPrice)) ? Number(premiumPrice) : 4900,
  };
  const selectedPlanPriceCents = priceMapCents[selectedPlan];
  const currentPlanPriceCents = priceMapCents[normalizedCurrentPlan];
  const payableCents = Math.max(0, selectedPlanPriceCents - currentPlanPriceCents);
  const isCurrentSelection = selectedPlan === normalizedCurrentPlan;
  const isDowngradeSelection = planRank[selectedPlan] < planRank[normalizedCurrentPlan];
  const canProceedToPayment = payableCents > 0 && !isCurrentSelection && !isDowngradeSelection;

  const displayBasicPrice = (priceMapCents.basic / 100).toFixed(0);
  const displayPremiumPrice = (priceMapCents.premium / 100).toFixed(0);
  const displayCurrentPlanPrice = (currentPlanPriceCents / 100).toFixed(0);
  const displayOldPrice =
    normalizedCurrentPlan === 'free' && selectedPlan === 'premium' && oldPrice
      ? (oldPrice / 100).toFixed(0)
      : null;
  const displayPrice = (payableCents / 100).toFixed(0);
  const taxCodeLabel = billingType === 'company' ? 'CUI / CIF' : 'CNP (optional)';
  const taxCodePlaceholder =
    billingType === 'company'
      ? 'RO12345678'
      : '13 cifre (daca il lasi gol, se genereaza automat)';
  const hasSavedAddress = isAddressComplete(savedCheckoutAddress);
  const displayCheckoutAddressSummary = shortAddressSummary(checkoutAddress);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSelectedPlan('premium');

    const profile = userProfile || {};
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    const savedFromProfile: CheckoutContactAddress = {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || profile.billingPhone || '',
      email: (profile.email || profile.billingEmail || userEmail || '').trim(),
      county: profile.shippingCounty || profile.county || profile.billingCounty || '',
      city: profile.shippingCity || profile.city || profile.billingCity || '',
      street: profile.shippingStreet || '',
      number: profile.shippingNumber || '',
      block: profile.shippingBlock || '',
      staircase: profile.shippingStaircase || '',
      floor: profile.shippingFloor || '',
      apartment: profile.shippingApartment || '',
      postalCode: profile.shippingPostalCode || '',
      landmark: profile.shippingLandmark || '',
      country: profile.shippingCountry || profile.country || profile.billingCountry || 'Romania',
    };
    const fallbackForManual = {
      ...createEmptyCheckoutAddress(),
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      email: (profile.email || userEmail || '').trim(),
      county: profile.shippingCounty || profile.county || '',
      city: profile.shippingCity || profile.city || '',
      country: profile.shippingCountry || profile.country || 'Romania',
    };
    const initialMode: 'saved_account' | 'manual_entry' = isAddressComplete(savedFromProfile)
      ? 'saved_account'
      : 'manual_entry';
    setAddressMode(initialMode);
    setSavedCheckoutAddress(savedFromProfile);
    setCheckoutAddress(initialMode === 'saved_account' ? savedFromProfile : fallbackForManual);
    setIsCheckoutAddressEditable(initialMode !== 'saved_account');

    setBillingType(profile.billingType === 'company' ? 'company' : 'individual');
    setBillingName(profile.billingName || fullName || '');
    setBillingCompany(profile.billingCompany || '');
    setBillingVatCode(profile.billingVatCode || '');
    setBillingRegNo(profile.billingRegNo || '');
    setBillingSector(normalizeSector(profile.billingSector || ''));

    const initialEmail = (profile.billingEmail || userEmail || profile.email || '').trim();
    setBillingEmail(initialEmail);
  }, [isOpen, userEmail, userProfile]);

  const getBillingPayload = () => {
    const email = (checkoutAddress.email || billingEmail || userEmail || '').trim();
    const normalizedSector = normalizeSector(billingSector);
    const normalizedCounty = (isBucharest(checkoutAddress.city) ? 'Bucuresti' : checkoutAddress.county).trim();
    const normalizedCountry = (checkoutAddress.country || 'Romania').trim() || 'Romania';
    const composedAddress = composeAddressLine({
      county: normalizedCounty,
      city: checkoutAddress.city,
      street: checkoutAddress.street,
      number: checkoutAddress.number,
      block: checkoutAddress.block,
      staircase: checkoutAddress.staircase,
      floor: checkoutAddress.floor,
      apartment: checkoutAddress.apartment,
      postalCode: checkoutAddress.postalCode,
      landmark: checkoutAddress.landmark,
      country: normalizedCountry,
    });
    const contactFullName = `${checkoutAddress.firstName} ${checkoutAddress.lastName}`.trim();
    return {
      type: billingType,
      name: (billingName || contactFullName).trim(),
      company: billingCompany.trim(),
      vatCode: billingVatCode.trim(),
      regNo: billingRegNo.trim(),
      address: composedAddress,
      city: checkoutAddress.city.trim(),
      sector: normalizedSector,
      county: normalizedCounty,
      country: normalizedCountry,
      email,
      phone: checkoutAddress.phone.trim(),
      firstName: checkoutAddress.firstName.trim(),
      lastName: checkoutAddress.lastName.trim(),
      shippingCounty: normalizedCounty,
      shippingCity: checkoutAddress.city.trim(),
      shippingStreet: checkoutAddress.street.trim(),
      shippingNumber: checkoutAddress.number.trim(),
      shippingBlock: checkoutAddress.block?.trim() || '',
      shippingStaircase: checkoutAddress.staircase?.trim() || '',
      shippingFloor: checkoutAddress.floor?.trim() || '',
      shippingApartment: checkoutAddress.apartment?.trim() || '',
      shippingPostalCode: checkoutAddress.postalCode.trim(),
      shippingLandmark: checkoutAddress.landmark?.trim() || '',
      shippingCountry: normalizedCountry,
      source: addressMode,
      addressSource: addressMode,
      accountCounty: savedCheckoutAddress.county || '',
      accountCity: savedCheckoutAddress.city || '',
      accountStreet: savedCheckoutAddress.street || '',
      accountNumber: savedCheckoutAddress.number || '',
      accountBlock: savedCheckoutAddress.block || '',
      accountStaircase: savedCheckoutAddress.staircase || '',
      accountFloor: savedCheckoutAddress.floor || '',
      accountApartment: savedCheckoutAddress.apartment || '',
      accountPostalCode: savedCheckoutAddress.postalCode || '',
      accountLandmark: savedCheckoutAddress.landmark || '',
      accountCountry: savedCheckoutAddress.country || '',
    };
  };

  const validateBilling = () => {
    const payload = getBillingPayload();
    if (!payload.firstName || !payload.lastName) {
      return 'Completeaza prenumele si numele pentru checkout.';
    }
    if (!payload.email || !payload.email.includes('@')) {
      return 'Te rugam sa introduci o adresa de email valida pentru factura.';
    }
    if (!payload.phone || !isValidRoPhone(payload.phone)) {
      return 'Completeaza un numar de telefon valid.';
    }
    if (!payload.shippingCounty || !payload.shippingCity || !payload.shippingStreet || !payload.shippingNumber) {
      return 'Completeaza judetul, localitatea, strada si numarul.';
    }
    if (!isValidRoPostalCode(payload.shippingPostalCode)) {
      return 'Codul postal trebuie sa aiba 6 cifre.';
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
    if (payload.type === 'company' && isBucharestCity(payload.city) && !payload.sector) {
      return 'Pentru firme din Bucuresti, selecteaza sectorul.';
    }
    if (!payload.county) {
      return 'Completeaza judetul de facturare.';
    }
    if (!payload.country) {
      return 'Completeaza tara de facturare.';
    }
    return null;
  };

  const handlePayment = async () => {
    setError(null);
    if (!canProceedToPayment) {
      if (isCurrentSelection) {
        setError('Acesta este deja planul tau curent.');
      } else if (isDowngradeSelection) {
        setError('Ai deja un plan superior activ.');
      } else {
        setError('Nu exista diferenta de plata pentru acest plan.');
      }
      return;
    }
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
          addressSource: addressMode,
          targetPlan: selectedPlan,
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
    if (!canProceedToPayment) {
      if (isCurrentSelection) {
        setError('Acesta este deja planul tau curent.');
      } else if (isDowngradeSelection) {
        setError('Ai deja un plan superior activ.');
      } else {
        setError('Nu exista diferenta de plata pentru acest plan.');
      }
      return;
    }
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
          addressSource: addressMode,
          targetPlan: selectedPlan,
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

  const features =
    selectedPlan === 'basic'
      ? [
          'Editor invitatie complet',
          'Link public de invitatie',
          'RSVP (cine vine / cine nu vine)',
          'Gestionare lista invitati',
        ]
      : [
          'Toate functiile din Basic',
          'Planificator mese & seating',
          'Calendar, task-uri, buget complet',
          'Servicii, istoric, tool-uri premium',
        ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 shadow-2xl">
        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 flex flex-col items-center justify-center border-b border-neutral-100 dark:border-neutral-800">
          <div className="mb-4 p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
            <CartIcon />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Alege planul potrivit</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center max-w-[360px] leading-relaxed">
            Basic pentru invitatii si RSVP, Premium pentru acces complet.
          </p>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                if (planRank.basic < planRank[normalizedCurrentPlan]) return;
                setSelectedPlan('basic');
              }}
              disabled={planRank.basic < planRank[normalizedCurrentPlan]}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedPlan === 'basic'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-300/70'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-300'
              } ${planRank.basic < planRank[normalizedCurrentPlan] ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Plan</p>
              <p className="text-base font-semibold flex items-center gap-2">
                Basic
                {normalizedCurrentPlan === 'basic' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Plan curent
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{displayBasicPrice} LEI</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan('premium')}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedPlan === 'premium'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-300/70'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-300'
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Plan</p>
              <p className="text-base font-semibold flex items-center gap-2">
                Premium
                {normalizedCurrentPlan === 'premium' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Plan curent
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{displayPremiumPrice} LEI</p>
            </button>
          </div>

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
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Checkout rapid</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Folosim datele din cont ca sa completezi cat mai putin.
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-muted-foreground">Folosesti adresa salvata in cont?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!hasSavedAddress) return;
                    setAddressMode('saved_account');
                    setCheckoutAddress(savedCheckoutAddress);
                    setIsCheckoutAddressEditable(false);
                  }}
                  disabled={!hasSavedAddress}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    addressMode === 'saved_account'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300'
                  } ${!hasSavedAddress ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Da, folosesc adresa din cont
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddressMode('manual_entry');
                    setIsCheckoutAddressEditable(true);
                    setCheckoutAddress(createEmptyCheckoutAddress());
                  }}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    addressMode === 'manual_entry'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300'
                  }`}
                >
                  Nu, folosesc alta adresa
                </button>
              </div>
            </div>

            {addressMode === 'saved_account' && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 p-3 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Adresa salvata in cont
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {checkoutAddress.firstName} {checkoutAddress.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{displayCheckoutAddressSummary || 'Adresa incompleta'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCheckoutAddressEditable((v) => !v)}
                  >
                    {isCheckoutAddressEditable ? 'Ascunde editarea' : 'Editeaza'}
                  </Button>
                </div>
              </div>
            )}

            {(addressMode === 'manual_entry' || isCheckoutAddressEditable) && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Prenume *</label>
                    <Input
                      autoComplete="given-name"
                      value={checkoutAddress.firstName}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Nume *</label>
                    <Input
                      autoComplete="family-name"
                      value={checkoutAddress.lastName}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Telefon *</label>
                    <Input
                      autoComplete="tel"
                      value={checkoutAddress.phone}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Email *</label>
                    <Input
                      autoComplete="email"
                      type="email"
                      value={checkoutAddress.email}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCheckoutAddress((prev) => ({ ...prev, email: next }));
                        setBillingEmail(next);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Judet *</label>
                    <select
                      value={checkoutAddress.county}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, county: e.target.value }))}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Selecteaza judet</option>
                      {RO_COUNTIES.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Localitate *</label>
                    <Input
                      autoComplete="address-level2"
                      value={checkoutAddress.city}
                      onChange={(e) => {
                        const city = e.target.value;
                        setCheckoutAddress((prev) => ({
                          ...prev,
                          city,
                          county: isBucharest(city) ? 'Bucuresti' : prev.county,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Strada *</label>
                    <Input
                      autoComplete="address-line1"
                      value={checkoutAddress.street}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, street: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Numar *</label>
                    <Input
                      value={checkoutAddress.number}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Bloc (optional)</label>
                    <Input
                      value={checkoutAddress.block || ''}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, block: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Scara (optional)</label>
                    <Input
                      value={checkoutAddress.staircase || ''}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, staircase: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Etaj (optional)</label>
                    <Input
                      value={checkoutAddress.floor || ''}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, floor: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Apartament (optional)</label>
                    <Input
                      value={checkoutAddress.apartment || ''}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, apartment: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Cod postal *</label>
                    <Input
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      value={checkoutAddress.postalCode}
                      onChange={(e) =>
                        setCheckoutAddress((prev) => ({
                          ...prev,
                          postalCode: String(e.target.value || '').replace(/\D/g, '').slice(0, 6),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Reper / detalii livrare (optional)
                    </label>
                    <Input
                      value={checkoutAddress.landmark || ''}
                      onChange={(e) => setCheckoutAddress((prev) => ({ ...prev, landmark: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
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
                <label className="text-xs font-semibold text-muted-foreground">{taxCodeLabel}</label>
                <Input value={billingVatCode} onChange={(e) => setBillingVatCode(e.target.value)} placeholder={taxCodePlaceholder} />
              </div>
              {billingType === 'company' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Companie *</label>
                    <Input value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)} placeholder="SC Exemplu SRL" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Nr. Reg. Comertului</label>
                    <Input value={billingRegNo} onChange={(e) => setBillingRegNo(e.target.value)} placeholder="J40/0000/2026" />
                  </div>
                  {bucharestSelected && (
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Sector (obligatoriu pentru firme din Bucuresti)</label>
                      <select
                        value={normalizeSector(billingSector)}
                        onChange={(e) => setBillingSector(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Alege sectorul</option>
                        {SECTOR_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
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
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {normalizedCurrentPlan === 'basic' && selectedPlan === 'premium' ? 'De plata (diferenta)' : 'Pret de plata'}
              </span>
              <div className="flex items-baseline gap-1.5">
                {displayOldPrice && (
                  <span className="text-sm text-neutral-400 line-through decoration-neutral-400/50">{displayOldPrice} LEI</span>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 mt-1">
                Plan curent: {normalizedCurrentPlan === 'free' ? 'Free' : normalizedCurrentPlan === 'basic' ? 'Basic' : 'Premium'} ({displayCurrentPlanPrice} LEI)
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{displayPrice} LEI</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-[#635BFF] hover:bg-[#5851E3] text-white"
            onClick={handlePayment}
            disabled={isProcessing || isProcessingNetopia || !canProceedToPayment}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se initiaza plata...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" /> {canProceedToPayment ? `Plateste upgrade la planul ${selectedPlan === 'basic' ? 'Basic' : 'Premium'} cu Stripe` : 'Plan deja activ'}
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
            disabled={isProcessing || isProcessingNetopia || !canProceedToPayment}
          >
            {isProcessingNetopia ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se initiaza...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" /> {canProceedToPayment ? `Plateste upgrade la planul ${selectedPlan === 'basic' ? 'Basic' : 'Premium'} cu Netopia` : 'Plan deja activ'}
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
