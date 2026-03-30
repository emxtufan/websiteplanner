import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { API_URL } from "../constants";
import { Mail, Send, BellRing } from "lucide-react";

type EmailType = "welcome" | "login_alert" | "reminder";

const EmailCenter = ({ token }: { token: string }) => {
  const { toast } = useToast();

  const [status, setStatus] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [emailType, setEmailType] = useState<EmailType>("welcome");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [daysAhead, setDaysAhead] = useState(3);
  const [bulkResult, setBulkResult] = useState<any>(null);

  useEffect(() => {
    loadStatus();
    loadUsers();
  }, [token]);

  const loadStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/email/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Status unavailable");
      setStatus(data);
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut citi statusul emailurilor.",
        variant: "destructive",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Users unavailable");
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      if (list.length && !selectedUserId) setSelectedUserId(list[0]._id);
    } catch (err: any) {
      toast({
        title: "Eroare",
        description: err?.message || "Nu am putut incarca utilizatorii.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = useMemo(() => {
    const lower = search.trim().toLowerCase();
    if (!lower) return users;
    return users.filter((u) => {
      const fullName = `${u?.profile?.firstName || ""} ${u?.profile?.lastName || ""}`.toLowerCase();
      return String(u?.user || "").toLowerCase().includes(lower) || fullName.includes(lower);
    });
  }, [users, search]);

  const selectedUser = useMemo(
    () => users.find((u) => u._id === selectedUserId) || null,
    [users, selectedUserId],
  );

  const sendTestEmail = async () => {
    if (!selectedUserId) {
      toast({ title: "Alege un utilizator", variant: "destructive" });
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch(`${API_URL}/admin/email/send-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          type: emailType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Send failed");
      toast({ title: "Email trimis", variant: "success" });
    } catch (err: any) {
      toast({
        title: "Eroare trimitere",
        description: err?.message || "Nu am putut trimite emailul.",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const sendBulkReminders = async () => {
    setSendingBulk(true);
    setBulkResult(null);
    try {
      const res = await fetch(`${API_URL}/admin/email/send-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          daysAhead,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Bulk send failed");
      setBulkResult(data);
      toast({ title: "Reminder-ele au fost procesate", variant: "success" });
    } catch (err: any) {
      toast({
        title: "Eroare reminder",
        description: err?.message || "Nu am putut trimite reminder-ele.",
        variant: "destructive",
      });
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            Email Center
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
              <div className="text-xs uppercase tracking-wide mb-1">Provider</div>
              <div className="font-medium text-foreground">{status?.provider || "resend"}</div>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
              <div className="text-xs uppercase tracking-wide mb-1">Status</div>
              <div className={`font-medium ${status?.enabled ? "text-emerald-600" : "text-red-600"}`}>
                {status?.enabled ? "Activ" : "Inactiv (verifica RESEND_API_KEY)"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-500" />
            Trimite email test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Cauta utilizator dupa email sau nume..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />

          <select
            className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {filteredUsers.map((u) => {
              const fullName = `${u?.profile?.firstName || ""} ${u?.profile?.lastName || ""}`.trim();
              return (
                <option key={u._id} value={u._id}>
                  {u.user} {fullName ? `- ${fullName}` : ""}
                </option>
              );
            })}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as EmailType)}
            >
              <option value="welcome">Welcome</option>
              <option value="login_alert">Alerta conectare</option>
              <option value="reminder">Reminder eveniment</option>
            </select>
            <Button onClick={sendTestEmail} disabled={sendingTest || !selectedUserId}>
              {sendingTest ? "Se trimite..." : "Trimite email test"}
            </Button>
          </div>

          {selectedUser && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-xs text-muted-foreground">
              <div>Email: {selectedUser.user}</div>
              <div>
                Eveniment: {selectedUser?.profile?.eventName || "-"} (
                {selectedUser?.profile?.eventType || "wedding"})
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-500" />
            Reminder automat (manual trigger)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">
                Zile in avans
              </label>
              <Input
                type="number"
                min={0}
                max={30}
                value={daysAhead}
                onChange={(e: any) => setDaysAhead(Number(e.target.value || 0))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={sendBulkReminders} disabled={sendingBulk}>
                {sendingBulk ? "Se proceseaza..." : "Trimite reminder-e"}
              </Button>
            </div>
          </div>

          {bulkResult && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-sm">
              <div>Scanate: {bulkResult.scanned}</div>
              <div>Trimise: {bulkResult.sent}</div>
              <div>Eroare: {bulkResult.failed}</div>
              <div>Ignorate: {bulkResult.skipped}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCenter;

