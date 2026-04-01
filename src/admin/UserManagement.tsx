import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Search,
  User as UserIcon,
  ShieldAlert,
  ChevronDown,
  Crown,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import { API_URL } from "../constants";
import { useToast } from "../components/ui/use-toast";

const EVENT_TYPE_OPTIONS = [
  { value: "wedding", label: "Nunta" },
  { value: "baptism", label: "Botez" },
  { value: "anniversary", label: "Aniversare" },
  { value: "kids", label: "Copii" },
  { value: "office", label: "Corporate" },
  { value: "birthday", label: "Zi de nastere" },
];

const EVENT_TYPE_LABELS: Record<string, string> = EVENT_TYPE_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {} as Record<string, string>,
);

const formatDate = (value?: string | Date) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString();
};

const formatDateTime = (value?: string | Date) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toInputDate = (value?: string | Date) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const inferPaymentMethod = (payment: any): string => {
  const direct = String(payment?.paymentMethod || "").trim().toLowerCase();
  if (direct) return direct;

  const invoiceId = String(payment?.invoiceId || "").toLowerCase();
  if (invoiceId.startsWith("ord_")) return "netopia_card";
  if (invoiceId.startsWith("in_") || invoiceId.startsWith("cs_")) return "stripe_card";
  if (String(payment?.hostedInvoiceUrl || "").includes("stripe.com")) return "stripe_card";
  return "necunoscut";
};

const paymentMethodLabel = (methodRaw: string) => {
  const method = String(methodRaw || "").toLowerCase();
  if (method === "stripe_card") return "Stripe card";
  if (method === "netopia_card") return "Netopia card";
  return "Necunoscut";
};

const profileDisplayName = (user: any) => {
  const first = String(user?.profile?.firstName || "").trim();
  const last = String(user?.profile?.lastName || "").trim();
  if (first || last) return `${first} ${last}`.trim();

  const p1 = String(user?.profile?.partner1Name || "").trim();
  const p2 = String(user?.profile?.partner2Name || "").trim();
  if (p1 || p2) return `${p1}${p2 ? ` & ${p2}` : ""}`;

  return "-";
};

const profilePrimaryAddress = (profile: any) => {
  if (!profile) return "-";
  const streetLine = [profile.shippingStreet, profile.shippingNumber].filter(Boolean).join(" ");
  const extras = [
    profile.shippingBlock ? `Bl. ${profile.shippingBlock}` : "",
    profile.shippingStaircase ? `Sc. ${profile.shippingStaircase}` : "",
    profile.shippingFloor ? `Et. ${profile.shippingFloor}` : "",
    profile.shippingApartment ? `Ap. ${profile.shippingApartment}` : "",
  ]
    .filter(Boolean)
    .join(", ");
  const locality = [profile.shippingCity || profile.city, profile.shippingCounty || profile.county]
    .filter(Boolean)
    .join(", ");
  const postal = profile.shippingPostalCode ? `CP ${profile.shippingPostalCode}` : "";
  return [streetLine || profile.address, extras, locality, postal].filter(Boolean).join(" | ") || "-";
};

const paymentAddressSummary = (payment: any) => {
  const source = payment?.checkoutAddressSource === "saved_account" ? "Adresa din cont" : "Adresa introdusa manual";
  const contact = [payment?.checkoutFirstName, payment?.checkoutLastName].filter(Boolean).join(" ") || "-";
  const phone = payment?.checkoutPhone || "-";
  const email = payment?.checkoutEmail || payment?.billingEmail || "-";
  const usedAddress = [
    [payment?.checkoutStreet, payment?.checkoutNumber].filter(Boolean).join(" "),
    payment?.checkoutBlock ? `Bl. ${payment.checkoutBlock}` : "",
    payment?.checkoutStaircase ? `Sc. ${payment.checkoutStaircase}` : "",
    payment?.checkoutFloor ? `Et. ${payment.checkoutFloor}` : "",
    payment?.checkoutApartment ? `Ap. ${payment.checkoutApartment}` : "",
    [payment?.checkoutCity, payment?.checkoutCounty].filter(Boolean).join(", "),
    payment?.checkoutPostalCode ? `CP ${payment.checkoutPostalCode}` : "",
    payment?.checkoutLandmark ? `Reper: ${payment.checkoutLandmark}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  const savedSnapshot = payment?.savedAddressSnapshot || {};
  const savedAddress = [
    [savedSnapshot.street, savedSnapshot.number].filter(Boolean).join(" "),
    savedSnapshot.block ? `Bl. ${savedSnapshot.block}` : "",
    savedSnapshot.staircase ? `Sc. ${savedSnapshot.staircase}` : "",
    savedSnapshot.floor ? `Et. ${savedSnapshot.floor}` : "",
    savedSnapshot.apartment ? `Ap. ${savedSnapshot.apartment}` : "",
    [savedSnapshot.city, savedSnapshot.county].filter(Boolean).join(", "),
    savedSnapshot.postalCode ? `CP ${savedSnapshot.postalCode}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    source,
    contact,
    phone,
    email,
    usedAddress: usedAddress || payment?.billingAddress || "-",
    savedAddress: savedAddress || "-",
  };
};

const UserManagement = ({ token }: { token: string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedDraft, setExpandedDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notifyDraft, setNotifyDraft] = useState<{
    title: string;
    message: string;
    priority: "normal" | "high";
  }>({ title: "", message: "", priority: "normal" });
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower) return users;

    return users.filter((u) => {
      const eventType = String(u?.profile?.eventType || "").toLowerCase();
      const eventName = String(u?.profile?.eventName || "").toLowerCase();
      const fullName = profileDisplayName(u).toLowerCase();
      return (
        String(u?.user || "").toLowerCase().includes(lower) ||
        eventType.includes(lower) ||
        eventName.includes(lower) ||
        fullName.includes(lower)
      );
    });
  }, [search, users]);

  const paymentsForExpanded = useMemo(() => {
    if (!expandedDraft?.payments || !Array.isArray(expandedDraft.payments)) return [];
    return [...expandedDraft.payments].sort(
      (a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime(),
    );
  }, [expandedDraft]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Nu am putut incarca utilizatorii.");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut incarca utilizatorii.",
        variant: "destructive",
      });
    }
  };

  const openOrCloseRow = (user: any) => {
    if (expandedUserId === user._id) {
      setExpandedUserId(null);
      setExpandedDraft(null);
      setNotifyDraft({ title: "", message: "", priority: "normal" });
      setIsNotifyModalOpen(false);
      return;
    }
    setExpandedUserId(user._id);
    setExpandedDraft({
      ...user,
      profile: { ...(user?.profile || {}) },
    });
    setIsNotifyModalOpen(false);
    setNotifyDraft({
      title: "Actualizare cont WeddingPro",
      message: "",
      priority: "normal",
    });
  };

  const updateDraftProfileField = (field: string, value: any) => {
    setExpandedDraft((prev: any) => ({
      ...prev,
      profile: {
        ...(prev?.profile || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveExpanded = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedDraft?._id) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${expandedDraft._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: expandedDraft.plan,
          user: expandedDraft.user,
          emailVerified: expandedDraft.emailVerified !== false,
          profile: expandedDraft.profile || {},
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      toast({ title: "Utilizator actualizat", variant: "success" });
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: "Update esuat",
        description: err?.message || "Nu s-a putut salva utilizatorul.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDowngrade = async (userId: string) => {
    if (!confirm("Sigur vrei sa anulezi abonamentul premium pentru acest utilizator?")) return;
    try {
      await fetch(`${API_URL}/admin/cancel-sub`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      toast({ title: "Abonament anulat", variant: "success" });
      await fetchUsers();
    } catch {
      toast({ title: "Eroare", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Stergi definitiv utilizatorul ${email}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");

      toast({
        title: "Utilizator sters",
        description: "Contul si datele asociate au fost eliminate.",
        variant: "success",
      });
      if (expandedUserId === userId) {
        setExpandedUserId(null);
        setExpandedDraft(null);
      }
      await fetchUsers();
    } catch {
      toast({
        title: "Eroare stergere",
        description: "Nu s-a putut sterge utilizatorul.",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = async () => {
    if (!expandedDraft?._id) return;
    const title = notifyDraft.title.trim();
    const message = notifyDraft.message.trim();
    if (!title || !message) {
      toast({
        title: "Notificare incompleta",
        description: "Completeaza titlul si mesajul.",
        variant: "destructive",
      });
      return;
    }

    setSendingNotification(true);
    try {
      const res = await fetch(`${API_URL}/admin/users/${expandedDraft._id}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          priority: notifyDraft.priority,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Nu am putut trimite notificarea.");

      toast({
        title: "Notificare trimisa",
        description:
          notifyDraft.priority === "high"
            ? data?.emailSent
              ? "Notificarea high a fost trimisa si pe email."
              : "Notificarea high a fost salvata in aplicatie (email indisponibil)."
            : "Notificarea a fost trimisa in aplicatie.",
        variant: "success",
      });

      setNotifyDraft((prev) => ({
        ...prev,
        message: "",
      }));
      setIsNotifyModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: "Eroare notificare",
        description: err?.message || "Nu am putut trimite notificarea.",
        variant: "destructive",
      });
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Baza de date utilizatori</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cauta email, nume, eveniment..."
              className="pl-8"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isOpen = expandedUserId === user._id;
              const displayName = profileDisplayName(user);
              const eventDate = formatDate(user?.profile?.weddingDate);
              const eventType = String(user?.profile?.eventType || "wedding");
              const eventTypeLabel = EVENT_TYPE_LABELS[eventType] || eventType;

              return (
                <div
                  key={user._id}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900"
                >
                  <button
                    type="button"
                    onClick={() => openOrCloseRow(user)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="truncate">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</div>
                        <div className="font-medium truncate">{user.user}</div>
                      </div>

                      <div className="truncate">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Nume</div>
                        <div className="font-medium truncate">{displayName}</div>
                      </div>

                      <div className="truncate">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          Data evenimentului
                        </div>
                        <div className="font-medium truncate">{eventDate}</div>
                      </div>

                      <div className="truncate">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Telefon</div>
                        <div className="font-medium truncate">{user?.profile?.phone || "-"}</div>
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && expandedDraft && expandedDraft._id === user._id && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {user.isAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            <ShieldAlert className="w-3 h-3" />
                            Admin
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            expandedDraft.emailVerified === false
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}
                        >
                          {expandedDraft.emailVerified === false ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              Neverificat
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Verificat
                            </>
                          )}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            expandedDraft.plan === "premium"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : expandedDraft.plan === "basic"
                                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {expandedDraft.plan === "premium" && <Crown className="w-3 h-3" />}
                          {expandedDraft.plan === "basic" && <UserIcon className="w-3 h-3" />}
                          {String(expandedDraft.plan || "free").toUpperCase()}
                        </span>

                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {eventTypeLabel}
                        </span>
                      </div>

                      <form onSubmit={handleSaveExpanded} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email login</label>
                            <Input
                              value={expandedDraft.user || ""}
                              onChange={(e: any) =>
                                setExpandedDraft({ ...expandedDraft, user: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email verificat</label>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              value={expandedDraft.emailVerified === false ? "false" : "true"}
                              onChange={(e) =>
                                setExpandedDraft({
                                  ...expandedDraft,
                                  emailVerified: e.target.value === "true",
                                })
                              }
                            >
                              <option value="true">Verificat</option>
                              <option value="false">Neverificat</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Plan abonament</label>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              value={expandedDraft.plan || "free"}
                              onChange={(e) =>
                                setExpandedDraft({ ...expandedDraft, plan: e.target.value })
                              }
                            >
                              <option value="free">Free</option>
                              <option value="basic">Basic</option>
                              <option value="premium">Premium</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Tip eveniment</label>
                            <select
                              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              value={expandedDraft?.profile?.eventType || "wedding"}
                              onChange={(e) => updateDraftProfileField("eventType", e.target.value)}
                            >
                              {EVENT_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nume eveniment</label>
                            <Input
                              value={expandedDraft?.profile?.eventName || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("eventName", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Data eveniment</label>
                            <Input
                              type="date"
                              value={toInputDate(expandedDraft?.profile?.weddingDate)}
                              onChange={(e: any) =>
                                updateDraftProfileField("weddingDate", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Prenume profil</label>
                            <Input
                              value={expandedDraft?.profile?.firstName || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("firstName", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nume profil</label>
                            <Input
                              value={expandedDraft?.profile?.lastName || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("lastName", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Telefon</label>
                            <Input
                              value={expandedDraft?.profile?.phone || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("phone", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Judet (adresa principala)</label>
                            <Input
                              value={expandedDraft?.profile?.shippingCounty || expandedDraft?.profile?.county || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingCounty", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Localitate</label>
                            <Input
                              value={expandedDraft?.profile?.shippingCity || expandedDraft?.profile?.city || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingCity", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Strada</label>
                            <Input
                              value={expandedDraft?.profile?.shippingStreet || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingStreet", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Numar</label>
                            <Input
                              value={expandedDraft?.profile?.shippingNumber || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingNumber", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Cod postal</label>
                            <Input
                              value={expandedDraft?.profile?.shippingPostalCode || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingPostalCode", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Bloc</label>
                            <Input
                              value={expandedDraft?.profile?.shippingBlock || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingBlock", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Scara</label>
                            <Input
                              value={expandedDraft?.profile?.shippingStaircase || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingStaircase", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Etaj</label>
                            <Input
                              value={expandedDraft?.profile?.shippingFloor || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingFloor", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Apartament</label>
                            <Input
                              value={expandedDraft?.profile?.shippingApartment || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingApartment", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Reper</label>
                            <Input
                              value={expandedDraft?.profile?.shippingLandmark || ""}
                              onChange={(e: any) =>
                                updateDraftProfileField("shippingLandmark", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-xs text-muted-foreground">
                          <div className="font-semibold text-foreground mb-1">Adresa principala (rezumat)</div>
                          <div>{profilePrimaryAddress(expandedDraft?.profile || {})}</div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                          <div className="font-semibold mb-2">Activitate cont</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between gap-2 rounded bg-zinc-50 dark:bg-zinc-900/40 px-2 py-1.5">
                              <span>Ultima logare</span>
                              <span>{formatDateTime(expandedDraft?.activity?.lastLoginAt)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded bg-zinc-50 dark:bg-zinc-900/40 px-2 py-1.5">
                              <span>Ultimele setari</span>
                              <span>{formatDateTime(expandedDraft?.activity?.lastProfileUpdateAt)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded bg-zinc-50 dark:bg-zinc-900/40 px-2 py-1.5">
                              <span>Ultimul proiect</span>
                              <span>{formatDateTime(expandedDraft?.activity?.lastProjectUpdateAt)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded bg-zinc-50 dark:bg-zinc-900/40 px-2 py-1.5">
                              <span>Ultima lista invitati</span>
                              <span>{formatDateTime(expandedDraft?.activity?.lastGuestsUpdateAt)}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs italic text-muted-foreground">
                            {expandedDraft?.activity?.lastActionLabel || "Fara modificari recente"}
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
                          <div className="font-semibold">Trimite notificare in aplicatie</div>
                          <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-2">
                            <p className="text-xs text-muted-foreground">
                              Foloseste popup-ul mare pentru editare mai clara.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsNotifyModalOpen(true)}
                            >
                              Deschide popup
                            </Button>
                          </div>
                          <div className="hidden">
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-xs font-medium">Titlu</label>
                              <Input
                                value={notifyDraft.title}
                                onChange={(e: any) =>
                                  setNotifyDraft((prev) => ({ ...prev, title: e.target.value }))
                                }
                                placeholder="Titlu notificare"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Prioritate</label>
                              <select
                                className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={notifyDraft.priority}
                                onChange={(e) =>
                                  setNotifyDraft((prev) => ({
                                    ...prev,
                                    priority: e.target.value === "high" ? "high" : "normal",
                                  }))
                                }
                              >
                                <option value="normal">Normal</option>
                                <option value="high">High (trimite si email)</option>
                              </select>
                            </div>
                          </div>
                          <div className="hidden">
                            <label className="text-xs font-medium">Mesaj</label>
                            <textarea
                              value={notifyDraft.message}
                              onChange={(e) =>
                                setNotifyDraft((prev) => ({ ...prev, message: e.target.value }))
                              }
                              rows={4}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                              placeholder="Scrie mesajul care apare in popup-ul utilizatorului..."
                            />
                          </div>
                          <div className="hidden">
                            <Button
                              type="button"
                              onClick={handleSendNotification}
                              disabled={sendingNotification}
                            >
                              {sendingNotification ? "Se trimite..." : "Trimite notificarea"}
                            </Button>
                          </div>

                          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3">
                            <div className="text-xs font-semibold mb-2">Ultime notificari trimise</div>
                            {!Array.isArray(expandedDraft?.notifications) || expandedDraft.notifications.length === 0 ? (
                              <p className="text-xs text-muted-foreground">Nu exista notificari inregistrate.</p>
                            ) : (
                              <div className="space-y-2 max-h-52 overflow-auto pr-1">
                                {expandedDraft.notifications.slice(0, 8).map((n: any, idx: number) => (
                                  <div key={`${n?._id || idx}`} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold">{n?.title || "-"}</span>
                                      <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                          n?.priority === "high"
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                        }`}
                                      >
                                        {(n?.priority || "normal").toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="text-muted-foreground mt-1 whitespace-pre-wrap">
                                      {n?.message || ""}
                                    </div>
                                    <div className="text-muted-foreground mt-1">
                                      {formatDateTime(n?.createdAt)} {n?.createdBy ? `• ${n.createdBy}` : ""}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                          <div className="font-semibold mb-2">Istoric plati</div>
                          {paymentsForExpanded.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Acest utilizator nu are plati inregistrate.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-auto pr-1">
                              {paymentsForExpanded.map((p: any, idx: number) => {
                                const method = paymentMethodLabel(inferPaymentMethod(p));
                                const addressInfo = paymentAddressSummary(p);
                                return (
                                  <div
                                    key={`${p?.invoiceId || "payment"}-${idx}`}
                                    className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-foreground">
                                        {Number(p?.amount || 0).toFixed(2)} RON
                                      </span>
                                      <span className="text-muted-foreground">{formatDate(p?.date)}</span>
                                    </div>
                                    <div className="mt-1 text-muted-foreground">
                                      Status: {p?.status || "-"} | Metoda: {method}
                                    </div>
                                    <div className="text-muted-foreground break-all">
                                      Invoice: {p?.invoiceNumber || p?.invoiceId || "-"}
                                    </div>
                                    <div className="mt-2 rounded border border-dashed border-zinc-200 dark:border-zinc-700 p-2 space-y-1">
                                      <div>
                                        <span className="font-semibold text-foreground">Client:</span>{" "}
                                        {addressInfo.contact}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-foreground">Email:</span>{" "}
                                        {addressInfo.email}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-foreground">Telefon:</span>{" "}
                                        {addressInfo.phone}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-foreground">Sursa adresei:</span>{" "}
                                        {addressInfo.source}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-foreground">Adresa folosita la checkout:</span>{" "}
                                        {addressInfo.usedAddress}
                                      </div>
                                      <div>
                                        <span className="font-semibold text-foreground">Adresa salvata in cont:</span>{" "}
                                        {addressInfo.savedAddress}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 pt-1">
                          {expandedDraft.plan === "premium" && (
                            <Button
                              type="button"
                              variant="outline"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleDowngrade(expandedDraft._id)}
                            >
                              Downgrade premium
                            </Button>
                          )}

                          {!expandedDraft.isAdmin && (
                            <Button
                              type="button"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteUser(expandedDraft._id, expandedDraft.user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sterge utilizator
                            </Button>
                          )}

                          <Button type="submit" disabled={saving}>
                            {saving ? "Se salveaza..." : "Salveaza modificarile"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {isNotifyModalOpen && expandedDraft && (
        <div
          className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-[1px] p-4 md:p-8"
          onClick={() => setIsNotifyModalOpen(false)}
        >
          <div
            className="mx-auto w-full max-w-4xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold">Trimite notificare</h3>
                <p className="text-sm text-muted-foreground">
                  Utilizator: {expandedDraft?.user || "-"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsNotifyModalOpen(false)}
                className="h-9 w-9 p-0"
                aria-label="Inchide popup"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium">Titlu</label>
                  <Input
                    value={notifyDraft.title}
                    onChange={(e: any) =>
                      setNotifyDraft((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Titlu notificare"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prioritate</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={notifyDraft.priority}
                    onChange={(e) =>
                      setNotifyDraft((prev) => ({
                        ...prev,
                        priority: e.target.value === "high" ? "high" : "normal",
                      }))
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (trimite si email)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mesaj</label>
                <textarea
                  value={notifyDraft.message}
                  onChange={(e) =>
                    setNotifyDraft((prev) => ({ ...prev, message: e.target.value }))
                  }
                  rows={10}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Scrie mesajul care apare in popup-ul utilizatorului..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 px-5 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNotifyModalOpen(false)}
              >
                Inchide
              </Button>
              <Button
                type="button"
                onClick={handleSendNotification}
                disabled={sendingNotification}
              >
                {sendingNotification ? "Se trimite..." : "Trimite notificarea"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
