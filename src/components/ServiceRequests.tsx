import React, { useState, useEffect } from 'react';
import { X, Clock, Send, CheckCircle2, ChevronDown, Phone, Mail, MapPin, Wallet, Calendar, User, Inbox } from 'lucide-react';
import { UserSession } from '../types';
import toast from 'react-hot-toast';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3005/api';

export interface ServiceRequest {
  _id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactTime: string;
  budget: string;
  gdprAccepted: boolean;
  callApproved: boolean;
  status: 'pending' | 'sent_to_provider' | 'finalized';
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending:           { label: 'Pending - trimis la furnizor', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  sent_to_provider:  { label: 'Trimis către furnizor',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: Send },
  finalized:         { label: 'Finalizat',                     color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle2 },
};

const CONTACT_TIMES = [
  'Dimineața (8:00 - 12:00)',
  'Prânz (12:00 - 15:00)',
  'După-amiaza (15:00 - 18:00)',
  'Seara (18:00 - 21:00)',
  'Oricând',
];

// ─── Contact Modal (shown on service card) ───────────────────────────────────

export const ContactModal: React.FC<{
  service: { id: string; name: string; category: string };
  onClose: () => void;
  session: UserSession;
}> = ({ service, onClose, session }) => {
  const [form, setForm] = useState({
    name: (session?.profile?.firstName || '') + ' ' + (session?.profile?.lastName || ''),
    email: session?.profile?.email || '',
    phone: session?.profile?.phone || '',
    address: '',
    contactTime: 'Oricând',
    budget: '',
    gdprAccepted: false,
    callApproved: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.name.trim() && form.email.trim() && form.phone.trim() && form.gdprAccepted;

  const submit = async () => {
    if (!canSubmit) return;
    setSending(true); setError('');
    try {
      const res = await fetch(`${API_URL}/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.token || ''}`,
        },
        body: JSON.stringify({ ...form, serviceId: service.id, serviceName: service.name, serviceCategory: service.category }),
      });
      if (!res.ok) throw new Error('Eroare server');
      setSent(true);
    } catch {
      setError('A apărut o eroare. Încearcă din nou.');
    } finally {
      setSending(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 10, padding: '10px 14px',
    fontSize: 13, color: '#111827', outline: 'none',
  };
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative' }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color="#6b7280" />
        </button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#111827' }}>Cerere trimisă!</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
              Cererea ta pentru <strong>{service.name}</strong> a fost înregistrată.<br />
              Vei fi contactat în curând.
            </p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '12px 32px', background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff', border: 'none', borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Închide
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contactează furnizor</p>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#111827' }}>{service.name}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Nume și prenume *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Maria Popescu" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Telefon *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="07xx xxx xxx" style={inp} />
                </div>
              </div>

              <div>
                <label style={lbl}>Adresă email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplu.ro" style={inp} />
              </div>

              <div>
                <label style={lbl}>Adresă / Localitate</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ex: București, Sector 3" style={inp} />
              </div>

              <div>
                <label style={lbl}>Buget estimativ</label>
                <input value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="Ex: 2000-3000 RON" style={inp} />
              </div>

              <div>
                <label style={lbl}>Interval orar preferat pentru contact</label>
                <div style={{ position: 'relative' }}>
                  <select value={form.contactTime} onChange={e => set('contactTime', e.target.value)}
                    style={{ ...inp, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                    {CONTACT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} color="#9ca3af" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={form.gdprAccepted} onChange={e => set('gdprAccepted', e.target.checked)}
                    style={{ marginTop: 2, flexShrink: 0, accentColor: '#d97706' }} />
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                    * Sunt de acord cu <strong>prelucrarea datelor personale</strong> în conformitate cu GDPR, în scopul transmiterii cererii către furnizor.
                  </span>
                </label>
                <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={form.callApproved} onChange={e => set('callApproved', e.target.checked)}
                    style={{ marginTop: 2, flexShrink: 0, accentColor: '#d97706' }} />
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                    Sunt de acord să fiu contactat telefonic de către furnizor.
                  </span>
                </label>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{error}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px 0', background: '#f3f4f6', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>
                Anulează
              </button>
              <button onClick={submit} disabled={!canSubmit || sending}
                style={{ flex: 2, padding: '12px 0', background: canSubmit ? 'linear-gradient(135deg,#d97706,#b45309)' : '#e5e7eb', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: canSubmit ? '#fff' : '#9ca3af', cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {sending ? '...' : <><Send size={14} /> Trimite cererea</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── ServiceRequests View (dashboard) ────────────────────────────────────────

const ServiceRequests: React.FC<{ session: UserSession }> = ({ session }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceRequest['status']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const isAdmin = !!(session as any)?.isAdmin;

  const token = (session as any)?.token || '';

  const fetchRequests = async () => {
    try {
      const url = isAdmin ? `${API_URL}/admin/service-requests` : `${API_URL}/service-requests/mine`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: ServiceRequest['status']) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_URL}/admin/service-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } finally { setUpdatingId(null); }
  };

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    sent_to_provider: requests.filter(r => r.status === 'sent_to_provider').length,
    finalized: requests.filter(r => r.status === 'finalized').length,
  };

  const card: React.CSSProperties = {  border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <style>{`
        :root { --page-bg:#f9f7f4; --card-bg:#fff; --card-border:#e5e7eb; --text-primary:#111827; --text-muted:#6b7280; }
        .dark { --page-bg:#0f0f11; --card-bg:#18181b; --card-border:#27272a; --text-primary:#f4f4f5; --text-muted:#71717a; }
        .sr-row:hover { background: #fafafa; }
        .dark .sr-row:hover { background: #1c1c1f; }
      `}</style>

      {/* Header */}
      <div
        style={{ borderBottom: "1px solid #e5e7eb", padding: "24px 28px 20px" }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Cereri Servicii
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
            {requests.length} cereri înregistrate
          </p>

          {/* Status filter tabs */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}
          >
            {(
              [
                ["all", "Toate"],
                ["pending", "Pending"],
                ["sent_to_provider", "Trimise"],
                ["finalized", "Finalizate"],
              ] as const
            ).map(([key, lbl]) => {
              const active = statusFilter === key;
              const cfg = key !== "all" ? STATUS_CONFIG[key] : null;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${active ? cfg?.color || "#111827" : "#e5e7eb"}`,
                    background: active
                      ? cfg?.bg || "transparent"
                      : "transparent",
                    color: active ? cfg?.color || "inherit" : "inherit",
                  }}
                  className={
                    document.documentElement.classList.contains("dark")
                      ? "dark-btn"
                      : "light-btn"
                  }
                >
                  {lbl} ({counts[key]})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 28px 40px" }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Inbox
              size={40}
              strokeWidth={1}
              style={{ marginBottom: 12, opacity: 0.4 }}
            />
            <p style={{ margin: 0 }}>Se încarcă...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Inbox
              size={40}
              strokeWidth={1}
              style={{ marginBottom: 12, opacity: 0.4 }}
            />
            <p style={{ margin: 0, fontSize: 15 }}>
              Nicio cerere{" "}
              {statusFilter !== "all" ? "cu acest status" : "înregistrată"}.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((req) => {
              const cfg = STATUS_CONFIG[req.status];
              const StatusIcon = cfg.icon;
              const isOpen = expanded === req._id;
              return (
                <div key={req._id} style={card}>
                  {/* Row */}
                  <div
                    className="sr-row"
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer",
                    }}
                    onClick={() => setExpanded(isOpen ? null : req._id)}
                  >
                    {/* Status badge */}
                    <div
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}30`,
                        borderRadius: 20,
                        padding: "4px 10px",
                      }}
                    >
                      <StatusIcon size={12} color={cfg.color} />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: cfg.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {req.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#d97706",
                            fontWeight: 600,
                            background: "rgba(217,119,6,0.1)",
                            borderRadius: 6,
                            padding: "2px 8px",
                          }}
                        >
                          {req.serviceName}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Phone size={10} /> {req.phone}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Mail size={10} /> {req.email}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Calendar size={10} />{" "}
                          {new Date(req.createdAt).toLocaleDateString("ro-RO")}
                        </span>
                      </div>
                    </div>
                    
                    
                    {isAdmin && (
                            <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const text = `Nume: ${req.name}
Service Name: ${req.serviceName}
Email: ${req.email}
Telefon: ${req.phone}
Adresă: ${req.address || "—"}
Buget: ${req.budget || "—"}
Orar contact: ${req.contactTime}
GDPR: ${req.gdprAccepted ? "Da" : "Nu"}
Apel aprobat: ${req.callApproved ? "Da" : "Nu"}`;
                              navigator.clipboard.writeText(text);
                              toast.success("Detaliile au fost copiate în clipboard!"); // <--- aici
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              border: "1px solid #3b82f6",
                              color: "#3b82f6",
                              marginLeft: "auto",
                            }}
                          >
                            Copiază detalii
                          </button>
                          )}


                    <ChevronDown
                      size={16}
                      color="#9ca3af"
                      style={{
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        padding: "16px 20px",
                      }}
                    >
                      {/* Grid cu detalii */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        {[
                          { icon: User, label: "Nume", val: req.name },
                          { icon: Mail, label: "Email", val: req.email },
                          { icon: Phone, label: "Telefon", val: req.phone },
                          {
                            icon: MapPin,
                            label: "Adresă",
                            val: req.address || "—",
                          },
                          {
                            icon: Wallet,
                            label: "Buget",
                            val: req.budget || "—",
                          },
                          {
                            icon: Clock,
                            label: "Orar contact",
                            val: req.contactTime,
                          },
                        ].map(({ icon: Icon, label, val }) => (
                          <div
                            key={label}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: 10,
                              padding: "10px 14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginBottom: 4,
                              }}
                            >
                              <Icon size={11} color="#d97706" />
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#9ca3af",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                {label}
                              </span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginRight: 4,
                          }}
                        >
                          GDPR: {req.gdprAccepted ? "✅" : "❌"} &nbsp; Apel:{" "}
                          {req.callApproved ? "✅" : "❌"}
                        </span>

                        {isAdmin && (
                          <>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#6b7280",
                                marginLeft: "auto",
                              }}
                            >
                              Schimbă status:
                            </span>
                            {(
                              [
                                "pending",
                                "sent_to_provider",
                                "finalized",
                              ] as const
                            ).map((s) => {
                              const c = STATUS_CONFIG[s];
                              const isActive = req.status === s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(req._id, s)}
                                  disabled={isActive || updatingId === req._id}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: isActive ? "default" : "pointer",
                                    border: `1px solid ${c.color}40`,
                                    color: c.color,
                                    opacity: updatingId === req._id ? 0.5 : 1,
                                  }}
                                >
                                  {c.label}
                                </button>
                              );
                            })}

                            {/* Buton copiere detalii */}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequests;