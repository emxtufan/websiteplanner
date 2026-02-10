
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2, Edit2, Search, Crown, User as UserIcon, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { API_URL } from '../constants';
import { useToast } from '../components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';

const UserManagement = ({ token }: { token: string }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const [editingUser, setEditingUser] = useState<any>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFilteredUsers(users.filter(u => 
            u.user.toLowerCase().includes(lower) || 
            (u.profile?.firstName || '').toLowerCase().includes(lower) ||
            (u.profile?.lastName || '').toLowerCase().includes(lower)
        ));
    }, [search, users]);

    const fetchUsers = () => {
        fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setUsers(data);
            setFilteredUsers(data);
        });
    };

    const handleDowngrade = async (userId: string) => {
        if (!confirm("Sigur vrei să anulezi abonamentul acestui utilizator?")) return;
        
        try {
            await fetch(`${API_URL}/admin/cancel-sub`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ userId })
            });
            toast({ title: "Subscription Cancelled", variant: "default" });
            fetchUsers();
        } catch (e) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast({ title: "Utilizator Șters", description: "Toate datele asociate au fost eliminate.", variant: "success" });
                fetchUsers();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (e) {
            toast({ title: "Eroare Ștergere", description: "Nu s-a putut șterge utilizatorul.", variant: "destructive" });
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            await fetch(`${API_URL}/admin/users/${editingUser._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    plan: editingUser.plan,
                    user: editingUser.user, // Email
                    profile: editingUser.profile
                })
            });
            toast({ title: "User Updated", variant: "success" });
            setEditingUser(null);
            fetchUsers();
        } catch (e) {
            toast({ title: "Update Failed", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Bază de Date Utilizatori</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Caută utilizatori..." 
                            className="pl-8" 
                            value={search}
                            onChange={(e: any) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-100 dark:bg-zinc-900 text-muted-foreground font-medium border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="p-4">Utilizator / Email</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Nume Profil</th>
                                    <th className="p-4">Înregistrat</th>
                                    <th className="p-4 text-right">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <td className="p-4 font-medium flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            {user.user}
                                            {user.isAdmin && (
                                                <span title="Admin">
                                                    <ShieldAlert className="w-4 h-4 text-red-500 ml-1" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${user.plan === 'premium' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                {user.plan === 'premium' && <Crown className="w-3 h-3" />}
                                                {user.plan.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {user.profile?.firstName} {user.profile?.lastName}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-xs">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingUser(user)} title="Editează">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            
                                            {user.plan === 'premium' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                                                    onClick={() => handleDowngrade(user._id)}
                                                    title="Anulează Premium"
                                                >
                                                    Downgrade
                                                </Button>
                                            )}

                                            {!user.isAdmin && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100" title="Șterge Utilizator">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Această acțiune este ireversibilă. Contul utilizatorului <b>{user.user}</b> și toate datele asociate (plan, invitați, setări) vor fi șterse permanent.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Anulează</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUser(user._id)} className="bg-red-600 hover:bg-red-700">Șterge Contul</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* EDIT USER DIALOG */}
            <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editare Utilizator</DialogTitle>
                        <DialogDescription>Modifică detaliile sau abonamentul direct.</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Login</label>
                                <Input 
                                    value={editingUser.user} 
                                    onChange={(e:any) => setEditingUser({...editingUser, user: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Plan Abonament</label>
                                <select 
                                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={editingUser.plan}
                                    onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                                >
                                    <option value="free">Free</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit">Salvează Modificările</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
