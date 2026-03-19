import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import {
  Plus, Edit2, Trash2, Search, Star, MapPin, Tag,
  Music2, Camera, Cake, Flower2, Utensils, Car,
  Sparkles, PartyPopper, Heart, Package, X, ChevronDown,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { API_URL } from '../constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
  _id?: string;
  name: string;
  category: string;
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
}

const CATEGORIES: Record<string, { label: string; icon: React.FC<any>; color: string }> = {
  candybar:     { label: 'Candy Bar',    icon: Cake,        color: '#d97706' },
  formatie:     { label: 'Formație',     icon: Music2,      color: '#7c3aed' },
  dj:           { label: 'DJ',           icon: Sparkles,    color: '#0891b2' },
  'foto-video': { label: 'Foto / Video', icon: Camera,      color: '#059669' },
  florarie:     { label: 'Florărie',     icon: Flower2,     color: '#db2777' },
  catering:     { label: 'Catering',     icon: Utensils,    color: '#ea580c' },
  decor:        { label: 'Decor',        icon: Heart,       color: '#be185d' },
  transport:    { label: 'Transport',    icon: Car,         color: '#1d4ed8' },
  cofetarie:    { label: 'Cofetărie',    icon: Package,     color: '#b45309' },
  animatie:     { label: 'Animație',     icon: PartyPopper, color: '#7c3aed' },
  altele:       { label: 'Altele',       icon: Tag,         color: '#6b7280' },
};

const EMPTY = (): Service => ({
  name: '', category: 'candybar', description: '',
  priceFrom: 0, priceTo: undefined, priceUnit: 'total',
  location: '', phone: '', email: '', website: '', instagram: '',
  imageUrl: '', rating: 5.0, reviewCount: 0,
  tags: [], featured: false, available: true,
});

// ─── Inline field helper ──────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode; half?: boolean }> = ({ label, children, half }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: half ? '0 0 calc(50% - 5px)' : '1 1 100%' }}>
    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const ServiceModal: React.FC<{
  service: Service | null;
  onClose: () => void;
  onSave: (s: Service) => Promise<void>;
}> = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState<Service>(service ? { ...service } : EMPTY());
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Service, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="text-lg font-bold">{service?._id ? 'Editează serviciu' : 'Serviciu nou'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Completează detaliile serviciului pentru marketplace</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name + Category */}
          <div className="flex gap-3 flex-wrap">
            <Field label="Denumire *" half>
              <Input value={form.name} onChange={(e:any) => set('name', e.target.value)} placeholder="Ex: Sweet Dreams Candy Bar" />
            </Field>
            <Field label="Categorie *" half>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full">
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label="Descriere">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Descriere scurtă a serviciului..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-y" />
          </Field>

          {/* Price */}
          <div className="flex gap-3 flex-wrap">
            <Field label="Preț de la (RON)" half>
              <Input type="number" value={form.priceFrom} onChange={(e:any) => set('priceFrom', Number(e.target.value))} />
            </Field>
            <Field label="Preț până la (RON)" half>
              <Input type="number" value={form.priceTo ?? ''} onChange={(e:any) => set('priceTo', e.target.value ? Number(e.target.value) : undefined)} placeholder="opțional" />
            </Field>
            <Field label="Unitate preț">
              <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value as any)}
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full">
                <option value="total">/ eveniment</option>
                <option value="perPerson">/ persoană</option>
                <option value="perHour">/ oră</option>
                <option value="negociabil">Negociabil</option>
              </select>
            </Field>
          </div>

          {/* Contact */}
          <div className="flex gap-3 flex-wrap">
            <Field label="Locație" half>
              <Input value={form.location} onChange={(e:any) => set('location', e.target.value)} placeholder="Ex: București" />
            </Field>
            <Field label="Telefon" half>
              <Input value={form.phone ?? ''} onChange={(e:any) => set('phone', e.target.value)} placeholder="07xx xxx xxx" />
            </Field>
            <Field label="Email" half>
              <Input type="email" value={form.email ?? ''} onChange={(e:any) => set('email', e.target.value)} placeholder="contact@exemplu.ro" />
            </Field>
            <Field label="Website" half>
              <Input value={form.website ?? ''} onChange={(e:any) => set('website', e.target.value)} placeholder="www.exemplu.ro" />
            </Field>
            <Field label="Instagram" half>
              <Input value={form.instagram ?? ''} onChange={(e:any) => set('instagram', e.target.value)} placeholder="@profil" />
            </Field>
            <Field label="URL Imagine" half>
              <Input value={form.imageUrl ?? ''} onChange={(e:any) => set('imageUrl', e.target.value)} placeholder="https://..." />
            </Field>
          </div>

          {/* Preview imagine */}
          {form.imageUrl && (
            <div className="rounded-xl overflow-hidden h-32 bg-muted">
              <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}

          {/* Rating + Reviews */}
          <div className="flex gap-3">
            <Field label="Rating (1–5)" half>
              <Input type="number" min="1" max="5" step="0.1" value={form.rating}
                onChange={(e:any) => set('rating', Math.min(5, Math.max(1, Number(e.target.value))))} />
            </Field>
            <Field label="Nr. recenzii" half>
              <Input type="number" value={form.reviewCount} onChange={(e:any) => set('reviewCount', Number(e.target.value))} />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tag-uri">
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e:any) => setTagInput(e.target.value)}
                onKeyDown={(e:any) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Scrie tag și apasă Enter..." className="flex-1" />
              <Button type="button" variant="outline" onClick={addTag} className="shrink-0">+</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                    {t}
                    <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))}
                      className="text-muted-foreground hover:text-foreground transition-colors leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          {/* Toggles */}
          <div className="flex gap-6 pt-2 border-t border-border">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div onClick={() => set('featured', !form.featured)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.featured ? 'bg-amber-500' : 'bg-muted'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium">Recomandat (featured)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div onClick={() => set('available', !form.available)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.available ? 'bg-green-500' : 'bg-muted'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium">Disponibil</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-background">
          <Button variant="outline" onClick={onClose}>Anulează</Button>
          <Button onClick={handleSave} disabled={!form.name.trim() || saving}
            className="bg-amber-600 hover:bg-amber-700 text-white">
            {saving ? 'Se salvează...' : service?._id ? 'Salvează modificările' : 'Adaugă serviciu'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ServiceManagement = ({ token }: { token: string }) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; service: Service | null }>({ open: false, service: null });
  const [comingSoon, setComingSoon] = useState(false);

  const fetchServices = async () => {
    try {
      const [svcRes, cfgRes] = await Promise.all([
        fetch(`${API_URL}/admin/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/config/services-coming-soon`),
      ]);
      setServices(await svcRes.json());
      const cfg = await cfgRes.json();
      setComingSoon(!!cfg?.enabled);
    } catch (e) {
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca serviciile.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleComingSoon = async (val: boolean) => {
    await fetch(`${API_URL}/admin/config/services-coming-soon`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ enabled: val }),
    });
    setComingSoon(val);
    toast({ title: val ? '🚀 Coming Soon activat' : '✅ Servicii vizibile', variant: 'default' });
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async (form: Service) => {
    try {
      const isNew = !form._id;
      const url = isNew ? `${API_URL}/admin/services` : `${API_URL}/admin/services/${form._id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: isNew ? 'Serviciu adăugat' : 'Serviciu actualizat', variant: 'success' as any });
      setModal({ open: false, service: null });
      fetchServices();
    } catch {
      toast({ title: 'Eroare la salvare', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ștergi acest serviciu definitiv?')) return;
    try {
      await fetch(`${API_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Serviciu șters', variant: 'default' });
      fetchServices();
    } catch {
      toast({ title: 'Eroare ștergere', variant: 'destructive' });
    }
  };

  const toggleAvailable = async (s: Service) => {
    await handleSave({ ...s, available: !s.available });
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORIES[s.category]?.label.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Package className="w-8 h-8 animate-pulse mr-3" /> Se încarcă serviciile...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Servicii Marketplace</h2>
          <p className="text-muted-foreground text-sm">{services.length} servicii în baza de date</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm"
            onClick={async () => {
              if (!confirm('Resetezi toate serviciile la cele default?')) return;
              await fetch(`${API_URL}/admin/services/reseed`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
              fetchServices();
            }}
            className="text-xs text-muted-foreground">
            Resetează seed
          </Button>
          <Button variant="outline" size="sm"
            onClick={async () => {
              const r = await fetch(`${API_URL}/admin/services/fix-available`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
              const d = await r.json();
              toast({ title: `Fixed ${d.fixed} servicii`, variant: 'default' });
              fetchServices();
            }}
            className="text-xs text-muted-foreground">
            Fix disponibilitate
          </Button>
          <Button onClick={() => setModal({ open: true, service: null })}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adaugă serviciu nou
          </Button>
        </div>
      </div>

      {/* Coming Soon banner toggle */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${comingSoon ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-muted/30 border-border'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{comingSoon ? '🚀' : '✅'}</span>
          <div>
            <p className="text-sm font-semibold">{comingSoon ? 'Modul Coming Soon activ' : 'Serviciile sunt vizibile'}</p>
            <p className="text-xs text-muted-foreground">
              {comingSoon
                ? 'Utilizatorii văd pagina "Coming Soon" în loc de servicii.'
                : 'Utilizatorii văd serviciile disponibile din marketplace.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">{comingSoon ? 'Coming Soon' : 'Live'}</span>
          <div onClick={() => toggleComingSoon(!comingSoon)}
            className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex items-center px-1 ${comingSoon ? 'bg-amber-500' : 'bg-green-500'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${comingSoon ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: services.length, color: 'border-l-zinc-400' },
          { label: 'Disponibile', value: services.filter(s => s.available).length, color: 'border-l-green-500' },
          { label: 'Featured', value: services.filter(s => s.featured).length, color: 'border-l-amber-500' },
          { label: 'Categorii', value: new Set(services.map(s => s.category)).size, color: 'border-l-indigo-500' },
        ].map(stat => (
          <Card key={stat.label} className={`border-l-4 ${stat.color} shadow-sm`}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Listă Servicii</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Caută..." className="pl-9"
              value={search} onChange={(e:any) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-y border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Serviciu</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Categorie</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Preț</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Rating</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Niciun serviciu găsit.
                  </td></tr>
                )}
                {filtered.map(s => {
                  const cat = CATEGORIES[s.category] || CATEGORIES.altele;
                  const CatIcon = cat.icon;
                  return (
                    <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                      {/* Name + location */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0"
                              onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: `${cat.color}15` }}>
                              <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold leading-tight">{s.name}</p>
                            {s.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />{s.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: `${cat.color}15`, color: cat.color }}>
                          <CatIcon className="w-3 h-3" />{cat.label}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 text-sm font-medium">
                        {s.priceUnit === 'negociabil' ? (
                          <span className="text-muted-foreground italic text-xs">Negociabil</span>
                        ) : (
                          <span>{s.priceFrom.toLocaleString()}{s.priceTo ? `–${s.priceTo.toLocaleString()}` : ''} RON</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          <span className="text-sm font-semibold">{s.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({s.reviewCount})</span>
                        </div>
                      </td>

                      {/* Status badges */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${s.available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {s.available ? '● Disponibil' : '○ Ascuns'}
                          </span>
                          {s.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 w-fit">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleAvailable(s)}
                            title={s.available ? 'Ascunde' : 'Activează'}
                            className={`p-1.5 rounded-lg transition-colors ${s.available ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-zinc-400 hover:bg-muted'}`}>
                            {s.available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setModal({ open: true, service: s })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Editează">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id!)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                            title="Șterge">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {modal.open && (
        <ServiceModal
          service={modal.service}
          onClose={() => setModal({ open: false, service: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ServiceManagement;