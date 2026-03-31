
import React, { useState } from "react";
import { Check, CreditCard, Download, ShieldCheck, RefreshCw, X, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import Button from "./ui/button";
import { UserSession, PaymentRecord } from "../types";
import { cn } from "../lib/utils";
import { useToast } from "./ui/use-toast";
import { API_URL } from "../constants";
import { Dialog, DialogContent } from "./ui/dialog";

interface BillingViewProps {
  session: UserSession;
  onUpgrade: () => void;
}

const BillingView: React.FC<BillingViewProps> = ({ session, onUpgrade }) => {
  const isPremium = session.plan === 'premium';
  const isBasic = session.plan === 'basic';
  const isPaidPlan = isPremium || isBasic;
  const planLabel = isPremium ? "Premium" : isBasic ? "Basic" : "Gratuit";
  const payments = session.payments || [];
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
        window.location.reload();
    }, 800);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
  };

  const resolveInvoiceUrl = (payment: PaymentRecord) => {
    if (payment.invoicePdfUrl) {
      return payment.invoicePdfUrl.startsWith('/')
        ? `${API_URL.replace('/api', '')}${payment.invoicePdfUrl}`
        : payment.invoicePdfUrl;
    }
    if (payment.hostedInvoiceUrl) return payment.hostedInvoiceUrl;
    return '';
  };

  const handleDownloadReceipt = async (payment: PaymentRecord) => {
    const fileUrl = resolveInvoiceUrl(payment);
    if (!fileUrl) {
      toast({
        title: 'Lipsa document',
        description: 'Nu exista URL pentru factura acestui payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${payment.invoiceNumber || payment.invoiceId || 'factura'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Invoice download failed:', error);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: 'Download fallback',
        description: 'Am deschis factura intr-un tab nou pentru descarcare.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Facturare & Plan</h2>
              <p className="text-muted-foreground">Gestionează planul tău și vezi istoricul plăților.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                Actualizează Datele
            </Button>
        </div>

        {/* Plan Section */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card className={cn("relative overflow-hidden", isPaidPlan ? "border-green-200 dark:border-green-900" : "border-zinc-200")}>
                {isPaidPlan && (
                    <div className="absolute top-0 right-0 p-4">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Activ
                        </span>
                    </div>
                )}
                <CardHeader>
                    <CardTitle>Planul Tău</CardTitle>
                    <CardDescription>
                        {isPremium
                          ? "Ai acces la toate funcționalitățile."
                          : isBasic
                            ? "Ai acces la invitații și RSVP. Restul modulelor sunt Premium."
                            : "Ești pe planul gratuit limitat."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{planLabel}</span>
                        {isPaidPlan && <span className="text-sm text-muted-foreground">/ Plată Unică</span>}
                    </div>
                    
                    {!isPremium ? (
                        <Button onClick={onUpgrade} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isBasic ? "Upgrade la Premium" : "Alege Basic sau Premium"}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <ShieldCheck className="w-4 h-4" /> Licență activă pe viață pentru acest eveniment.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Metodă de Plată</CardTitle>
                    <CardDescription>Ultima metodă folosită.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="w-10 h-6 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center text-[10px] font-bold text-zinc-500">
                            CARD
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Card Bancar</p>
                            <p className="text-xs text-muted-foreground">Procesat securizat prin Stripe</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Invoices Table */}
        <Card>
            <CardHeader>
                <CardTitle>Istoric Plăți</CardTitle>
                <CardDescription>
                    Descarcă facturile și chitanțele fiscale.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {payments.length > 0 ? (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Eveniment</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Data Plății</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Sumă</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {payments.map((payment, idx) => (
                                    <tr key={idx} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{payment.relatedEventName || 'Eveniment Necunoscut'}</span>
                                                <span
                                                  className="text-[10px] text-muted-foreground font-mono break-all"
                                                  title={payment.invoiceId || "N/A"}
                                                >
                                                  ID: {payment.invoiceId || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{formatDate(payment.date)}</td>
                                        <td className="p-4 align-middle font-medium">{payment.amount} LEI</td>
                                        <td className="p-4 align-middle">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                                payment.status === 'Paid' 
                                                    ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400"
                                                    : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                                            )}>
                                                {payment.status === 'Paid' ? 'Plătit' : payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                onClick={() => setSelectedPayment(payment)}
                                                disabled={!payment.invoicePdfUrl && !payment.hostedInvoiceUrl}
                                            >
                                                Detalii & Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                        <CreditCard className="w-8 h-8 opacity-20" />
                        Nu există plăți înregistrate încă.
                    </div>
                )}
            </CardContent>
        </Card>

        {/* INVOICE DETAILS MODAL (STRIPE STYLE) */}
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
            <DialogContent className="max-w-[480px] w-full p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl">
                {selectedPayment && (
                    <>
                        {/* 1. Header Area: Status & Amount */}
                        <div className="flex flex-col items-center pt-10 pb-8 px-6 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 relative">
                             {/* Close button inside absolute for visual alignment */}
                             <button onClick={() => setSelectedPayment(null)} className="absolute right-4 top-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <X className="w-4 h-4 text-zinc-400" />
                             </button>

                             <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-4 relative">
                                <div className="absolute inset-0 bg-green-500/10 rounded-full blur-md"></div>
                                <Check className="w-6 h-6 text-green-500 relative z-10" />
                             </div>
                             
                             <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                Invoice paid
                             </h3>
                             <div className="mt-2 text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                {selectedPayment.amount}.00 <span className="text-2xl text-zinc-400 font-normal">RON</span>
                             </div>
                             
                             {/* "View details" link visual */}
                             <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-default">
                                <ShieldCheck className="w-3 h-3" />
                                {selectedPayment.invoiceNumber ? 'Payment processed securely by Netopia' : 'Payment processed securely by Stripe'}
                             </div>
                        </div>

                        {/* 2. Details List */}
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/50 p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 dark:text-zinc-400">Pentru Eveniment</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200">
                                    {selectedPayment.relatedEventName || 'N/A'}
                                </span>
                            </div>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 dark:text-zinc-400">Invoice number</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200 font-mono">
                                    {selectedPayment.invoiceNumber || 'N/A'}
                                </span>
                            </div>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />

                            <div className="flex justify-between items-center text-sm gap-3">
                                <span className="text-zinc-500 dark:text-zinc-400">Processor ID</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200 font-mono break-all text-right">
                                    {selectedPayment.invoiceId || 'N/A'}
                                </span>
                            </div>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 dark:text-zinc-400">Payment date</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-200">
                                    {formatDate(selectedPayment.date)}
                                </span>
                            </div>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 dark:text-zinc-400">Payment method</span>
                                <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-200">
                                    <div className="bg-zinc-200 dark:bg-zinc-700 px-1.5 rounded text-[10px] font-bold text-zinc-600 dark:text-zinc-300">CARD</div>
                                    Credit Card
                                </div>
                            </div>
                            
                            {/* 3. Action Buttons */}
                            <div className="flex flex-col gap-3 mt-8">
                                {/* View / Print Invoice */}
                                <Button
                                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all"
                                    onClick={() => handleDownloadReceipt(selectedPayment)}
                                    disabled={(!selectedPayment.invoicePdfUrl && !selectedPayment.hostedInvoiceUrl) || isDownloading}
                                >
                                    <Receipt className="w-4 h-4 mr-2" />
                                    {isDownloading ? 'Se descarca...' : 'Download receipt'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default BillingView;
