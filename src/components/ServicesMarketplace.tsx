import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, SlidersHorizontal, Plus, X, Edit2, Trash2, Star,
  MapPin, Phone, Globe, ChevronDown, ChevronUp,
  Music2, Camera, Cake, Flower2, Utensils, Car, Sparkles,
  PartyPopper, Heart, Tag, Package,
  Mail, Instagram,
} from 'lucide-react';
import { UserSession } from '../types';
import { ContactModal } from './ServiceRequests';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3005/api';

export interface Service {
  _id?: string;
  id?: string;
  name: string;
  category: ServiceCategory;
  description: string;
  priceFrom: number;
  priceTo?: number;
  priceUnit: 'total' | 'perPerson' | 'perHour' | 'negociabil';
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  available: boolean;
  createdAt: string;
}

export type ServiceCategory =
  | 'candybar' | 'formatie' | 'dj' | 'foto-video'
  | 'florarie' | 'catering' | 'decor' | 'transport'
  | 'cofetarie' | 'animatie' | 'altele';

type SortKey = 'name' | 'priceFrom' | 'rating' | 'createdAt';
type SortDir = 'asc' | 'desc';

const CATEGORIES: Record<ServiceCategory, { label: string; icon: React.FC<any>; color: string; bg: string }> = {
  candybar:    { label: 'Candy Bar',    icon: Cake,        color: '#d97706', bg: 'rgba(217,119,6,0.12)'   },
  formatie:    { label: 'Formație',     icon: Music2,      color: '#7c3aed', bg: 'rgba(124,58,237,0.12)'  },
  dj:          { label: 'DJ',           icon: Sparkles,    color: '#0891b2', bg: 'rgba(8,145,178,0.12)'   },
  'foto-video':{ label: 'Foto / Video', icon: Camera,      color: '#059669', bg: 'rgba(5,150,105,0.12)'   },
  florarie:    { label: 'Florărie',     icon: Flower2,     color: '#db2777', bg: 'rgba(219,39,119,0.12)'  },
  catering:    { label: 'Catering',     icon: Utensils,    color: '#ea580c', bg: 'rgba(234,88,12,0.12)'   },
  decor:       { label: 'Decor',        icon: Heart,       color: '#be185d', bg: 'rgba(190,24,93,0.12)'   },
  transport:   { label: 'Transport',    icon: Car,         color: '#1d4ed8', bg: 'rgba(29,78,216,0.12)'   },
  cofetarie:   { label: 'Cofetărie',    icon: Package,     color: '#b45309', bg: 'rgba(180,83,9,0.12)'    },
  animatie:    { label: 'Animație',     icon: PartyPopper, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)'  },
  altele:      { label: 'Altele',       icon: Tag,         color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const PRICE_UNITS: Record<Service['priceUnit'], string> = {
  total: '/ eveniment', perPerson: '/ persoană', perHour: '/ oră', negociabil: '',
};

const serviceId = (s: Service) => s._id || s.id || '';

const formatPrice = (s: Service) => {
  if (s.priceUnit === 'negociabil') return 'Preț negociabil';
  const unit = PRICE_UNITS[s.priceUnit];
  if (s.priceTo) return `${s.priceFrom.toLocaleString()} – ${s.priceTo.toLocaleString()} RON${unit ? ' ' + unit : ''}`;
  return `de la ${s.priceFrom.toLocaleString()} RON${unit ? ' ' + unit : ''}`;
};

const Stars = ({ rating }: { rating: number }) => (
  <span style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={11}
        fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
        stroke={i <= Math.round(rating) ? '#f59e0b' : '#9ca3af'}
      />
    ))}
  </span>
);

const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)', border: '1px solid var(--card-border)',
  borderRadius: 8, padding: '8px 10px', fontSize: 13, color: 'var(--text-primary)',
  outline: 'none', width: '100%', boxSizing: 'border-box',
};

const btnSecondary: React.CSSProperties = {
  background: 'var(--tag-bg)', color: 'var(--text-secondary)',
  border: '1px solid var(--card-border)', borderRadius: 10,
  padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label}
    </label>
    {children}
  </div>
);

// ─── Service Card ─────────────────────────────────────────────────────────────

const ServiceCard: React.FC<{
  service: Service;
  isAdmin: boolean;
  onEdit: (s: Service) => void;
  onDelete: (id: string) => void;
  onContact: (s: Service) => void;
}> = ({ service, isAdmin, onEdit, onDelete, onContact }) => {
  const cat = CATEGORIES[service.category];
  const CatIcon = cat.icon;
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease', position: 'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.13)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ position: 'relative', height: 180, background: cat.bg, overflow: 'hidden', flexShrink: 0 }}>
        {service.imageUrl && !imgErr ? (
          <img src={service.imageUrl} alt={service.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CatIcon size={48} color={cat.color} strokeWidth={1.2} />
          </div>
        )}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(6px)',
          borderRadius: 20, padding: '3px 10px',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <CatIcon size={11} color={cat.color} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '0.04em' }}>{cat.label}</span>
        </div>
        {service.featured && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: 20, padding: '3px 9px',
            fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.05em',
          }}>★ RECOMANDAT</div>
        )}
        {isAdmin && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
            <button onClick={() => onEdit(service)} style={{
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 8,
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}><Edit2 size={13} color="#374151" /></button>
            <button onClick={() => onDelete(serviceId(service))} style={{
              background: 'rgba(239,68,68,0.88)', border: 'none', borderRadius: 8,
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}><Trash2 size={13} color="#fff" /></button>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {service.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Stars rating={service.rating} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{service.rating.toFixed(1)} ({service.reviewCount})</span>
          </div>
        </div>
        <p style={{
          margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {service.description}
        </p>
        {service.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {service.tags.slice(0, 3).map(t => (
              <span key={t} style={{
                fontSize: 10.5, fontWeight: 500, background: cat.bg, color: cat.color,
                borderRadius: 6, padding: '2px 8px', border: `1px solid ${cat.color}30`,
              }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); onContact(service); }}
            style={{
              width: '100%', padding: '9px 0', marginBottom: 8,
              background: 'linear-gradient(135deg,#d97706,#b45309)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.03em',
            }}>
            Contactează furnizor
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}>{formatPrice(service)}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {service.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: 'var(--text-muted)' }}>
                <MapPin size={11} /> {service.location}
              </span>
            )}
            {service.phone && (
              <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, color: 'var(--text-muted)', textDecoration: 'none' }}>
                <Phone size={11} /> {service.phone}
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {service.website && (
              <a href={`https://${service.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none' }}>
                <Globe size={11} /> Website
              </a>
            )}
            {service.instagram && (
              <a href={`https://instagram.com/${service.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none' }}>
                <Instagram size={11} /> Instagram
              </a>
            )}
            {service.email && (
              <a href={`mailto:${service.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none' }}>
                <Mail size={11} /> Email
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Modal ──────────────────────────────────────────────────────────────

const EMPTY_SERVICE = (): any => ({
  name: '', category: 'candybar', description: '',
  priceFrom: 0, priceTo: undefined, priceUnit: 'total',
  location: '', phone: '', email: '', website: '', instagram: '',
  imageUrl: '', rating: 5.0, reviewCount: 0, tags: [], featured: false, available: true,
});

const AdminModal: React.FC<{
  service: Service | null;
  onClose: () => void;
  onSave: (s: any) => void;
}> = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState<any>(service ? { ...service } : EMPTY_SERVICE());
  const [tagInput, setTagInput] = useState('');

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--modal-bg)', border: '1px solid var(--card-border)',
          borderRadius: 20, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto', padding: 28,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {service ? 'Editează serviciu' : 'Adaugă serviciu nou'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Denumire *">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Ex: Sweet Dreams Candy Bar" style={inputStyle} />
          </Field>

          <Field label="Categorie *">
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Descriere">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Descriere scurtă..." style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Preț de la (RON)">
              <input type="number" value={form.priceFrom} onChange={e => set('priceFrom', Number(e.target.value))} style={inputStyle} />
            </Field>
            <Field label="Până la (RON)">
              <input type="number" value={form.priceTo || ''} onChange={e => set('priceTo', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="opțional" style={inputStyle} />
            </Field>
            <Field label="Unitate">
              <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)} style={inputStyle}>
                <option value="total">/ eveniment</option>
                <option value="perPerson">/ persoană</option>
                <option value="perHour">/ oră</option>
                <option value="negociabil">Negociabil</option>
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Locație">
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ex: București" style={inputStyle} />
            </Field>
            <Field label="Telefon">
              <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="07xx xxx xxx" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Website">
              <input value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="www.exemplu.ro" style={inputStyle} />
            </Field>
            <Field label="Instagram">
              <input value={form.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="@profil" style={inputStyle} />
            </Field>
          </div>

          <Field label="Email">
            <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="contact@exemplu.ro" style={inputStyle} />
          </Field>

          <Field label="URL Imagine">
            <input value={form.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Rating (1-5)">
              <input type="number" min="1" max="5" step="0.1" value={form.rating}
                onChange={e => set('rating', Math.min(5, Math.max(1, Number(e.target.value))))} style={inputStyle} />
            </Field>
            <Field label="Nr. recenzii">
              <input type="number" value={form.reviewCount} onChange={e => set('reviewCount', Number(e.target.value))} style={inputStyle} />
            </Field>
          </div>

          <Field label="Tag-uri">
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Adaugă tag și apasă Enter" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addTag} style={{ ...btnSecondary, padding: '0 12px' }}>+</button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {form.tags.map((t: string) => (
                  <span key={t} style={{ background: 'var(--tag-bg)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t}
                    <button onClick={() => set('tags', form.tags.filter((x: string) => x !== t))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              Recomandat
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} />
              Disponibil
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Anulează</button>
          <button
            onClick={() => { if (form.name.trim()) onSave(form); }}
            disabled={!form.name.trim()}
            style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              opacity: form.name.trim() ? 1 : 0.5,
            }}>
            {service ? 'Salvează' : 'Adaugă serviciu'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface ServicesMarketplaceProps {
  session: UserSession;
}

export default function ServicesMarketplace({ session }: ServicesMarketplaceProps) {
  const isAdmin = !!session?.isAdmin;
  const [adminMode, setAdminMode] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingApi, setLoadingApi] = useState(true);
  const [comingSoon, setComingSoon] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [adminModal, setAdminModal] = useState<{ open: boolean; service: Service | null }>({ open: false, service: null });
  const [contactModal, setContactModal] = useState<{ open: boolean; service: Service | null }>({ open: false, service: null });

  const fetchServices = () => {
    Promise.all([
      fetch(`${API_URL}/services`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/config/services-coming-soon`).then(r => r.json()).catch(() => ({ enabled: false })),
    ]).then(([data, cfg]) => {
      setServices(Array.isArray(data) ? data : []);
      setComingSoon(!!cfg?.enabled);
      setLoadingApi(false);
    });
  };

  useEffect(() => {
    fetchServices();
    window.addEventListener('focus', fetchServices);
    return () => window.removeEventListener('focus', fetchServices);
  }, []);

  const filtered = useMemo(() => {
    let list = [...services];
    if (onlyAvailable) list = list.filter(s => s.available);
    if (onlyFeatured) list = list.filter(s => s.featured);
    if (activeCategory !== 'all') list = list.filter(s => s.category === activeCategory);
    if (priceMax !== '') list = list.filter(s => s.priceFrom <= Number(priceMax));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q)) ||
        s.location.toLowerCase().includes(q) ||
        CATEGORIES[s.category].label.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va: any = a[sortKey], vb: any = b[sortKey];
      if (sortKey === 'name') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [services, search, activeCategory, sortKey, sortDir, priceMax, onlyFeatured, onlyAvailable]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const saveService = async (data: any) => {
    const token = (session as any)?.token;
    if (!token) { alert('Token lipsă. Reconectează-te.'); return; }
    const id = data._id || data.id;
    const isNew = !id;
    const url = isNew ? `${API_URL}/admin/services` : `${API_URL}/admin/services/${id}`;
    try {
      await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      fetchServices();
    } catch (e) { console.error('Save failed', e); }
    setAdminModal({ open: false, service: null });
  };

  const deleteService = async (id: string) => {
    if (!confirm('Ștergi acest serviciu?')) return;
    const token = (session as any)?.token;
    if (!token) return;
    try {
      await fetch(`${API_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
    } catch (e) { console.error('Delete failed', e); }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--page-bg)' }}>
      <style>{`
        :root {
          --page-bg: hsl(var(--background)); --card-bg: #ffffff; --card-border: #e5e7eb;
          --text-primary: #111827; --text-secondary: #374151; --text-muted: #6b7280;
          --input-bg: #f9fafb; --modal-bg: #ffffff; --tag-bg: #f3f4f6; --header-bg: hsl(var(--background));
        }
        .dark {
          --page-bg: rgb(9 9 11 / 0.5); --card-bg: #18181b; --card-border: #27272a;
          --text-primary: #f4f4f5; --text-secondary: #a1a1aa; --text-muted: #71717a;
          --input-bg: #1c1c1f; --modal-bg: #1c1c1f; --tag-bg: #27272a; --header-bg: #111113;
        }
        .svc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }
        @media (max-width: 640px) { .svc-grid { grid-template-columns: 1fr; gap: 14px; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--card-border)', padding: '24px 28px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Servicii Evenimente
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
                {filtered.length} servicii disponibile pentru nunta sau evenimentul tău
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isAdmin && (
                <button onClick={() => setAdminMode(v => !v)} style={{
                  background: adminMode ? 'rgba(239,68,68,0.1)' : 'var(--card-bg)',
                  color: adminMode ? '#ef4444' : 'var(--text-muted)',
                  border: `1px solid ${adminMode ? '#ef444440' : 'var(--card-border)'}`,
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <Edit2 size={14} />
                  {adminMode ? 'Ieși din admin' : 'Admin'}
                </button>
              )}
              {isAdmin && adminMode && (
                <button onClick={() => setAdminModal({ open: true, service: null })} style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <Plus size={16} /> Adaugă serviciu
                </button>
              )}
            </div>
          </div>

          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Caută servicii, locații, tag-uri..."
                style={{ ...inputStyle, paddingLeft: 32, height: 40 }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {(['name', 'priceFrom', 'rating', 'createdAt'] as SortKey[]).map(key => {
              const labels: Record<SortKey, string> = { name: 'Nume', priceFrom: 'Preț', rating: 'Rating', createdAt: 'Dată' };
              return (
                <button key={key} onClick={() => toggleSort(key)} style={{
                  background: sortKey === key ? 'var(--text-primary)' : 'var(--card-bg)',
                  color: sortKey === key ? 'var(--card-bg)' : 'var(--text-secondary)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 10, padding: '0 12px', height: 40,
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {labels[key]}
                  {sortKey === key && (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                </button>
              );
            })}
            <button onClick={() => setShowFilters(v => !v)} style={{
              background: showFilters ? '#f59e0b' : 'var(--card-bg)',
              color: showFilters ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--card-border)',
              borderRadius: 10, padding: '0 12px', height: 40,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <SlidersHorizontal size={14} /> Filtre
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 14, padding: 16, background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Preț max:</span>
                <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="orice" style={{ ...inputStyle, width: 110 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>RON</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={onlyFeatured} onChange={e => setOnlyFeatured(e.target.checked)} />
                Doar recomandate
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} />
                Doar disponibile
              </label>
              <button onClick={() => { setPriceMax(''); setOnlyFeatured(false); setOnlyAvailable(true); setSearch(''); setActiveCategory('all'); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 12, color: '#ef4444', cursor: 'pointer', fontWeight: 500 }}>
                Resetează filtrele
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 40px' }}>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button onClick={() => setActiveCategory('all')} style={{
            background: activeCategory === 'all' ? '#111827' : 'var(--card-bg)',
            color: activeCategory === 'all' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Toate ({services.filter(s => !onlyAvailable || s.available).length})
          </button>
          {Object.entries(CATEGORIES).map(([k, v]) => {
            const CatIcon = v.icon;
            const count = services.filter(s => s.category === k && (!onlyAvailable || s.available)).length;
            if (count === 0) return null;
            const active = activeCategory === k;
            return (
              <button key={k} onClick={() => setActiveCategory(k as ServiceCategory)} style={{
                background: active ? v.color : 'var(--card-bg)',
                color: active ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${active ? v.color : 'var(--card-border)'}`,
                borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CatIcon size={13} /> {v.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loadingApi ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--card-border)', borderTopColor: '#d97706', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14 }}>Se încarcă serviciile...</p>
          </div>
        ) : comingSoon ? (
          <div style={{ textAlign: 'center', padding: '72px 20px' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 420 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                🚀
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Coming Soon
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Lucrăm la o colecție completă de furnizori verificați pentru evenimentul tău. Revino în curând!
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Candy Bar', 'Formații', 'Foto & Video', 'Florărie', 'Catering'].map(t => (
                  <span key={t} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Package size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 15 }}>Nu există servicii momentan.</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Revino în curând!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Package size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 15 }}>Niciun serviciu găsit.</p>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>Încearcă să modifici filtrele sau căutarea.</p>
          </div>
        ) : (
          <div className="svc-grid">
            {filtered.map(s => (
              <ServiceCard
                key={serviceId(s)}
                service={s}
                isAdmin={adminMode}
                onEdit={svc => setAdminModal({ open: true, service: svc })}
                onDelete={deleteService}
                onContact={svc => setContactModal({ open: true, service: svc })}
              />
            ))}
          </div>
        )}

      </div>

      {adminModal.open && (
        <AdminModal
          service={adminModal.service}
          onClose={() => setAdminModal({ open: false, service: null })}
          onSave={saveService}
        />
      )}
      {contactModal.open && contactModal.service && (
        <ContactModal
          service={{ id: serviceId(contactModal.service), name: contactModal.service.name, category: contactModal.service.category }}
          onClose={() => setContactModal({ open: false, service: null })}
          session={session}
        />
      )}
    </div>
  );
}