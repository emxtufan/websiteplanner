
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Baby, Utensils, Users, Calendar, Eye, Printer, Download, FileDown } from 'lucide-react';
import Button from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { CanvasElement, ElementType } from '../types';
import { cn } from '../lib/utils';
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts to support Romanian characters (Diacritics)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
  fontWeight: 300
});
Font.register({
  family: 'Roboto-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
  fontWeight: 700
});

// PDF Styles
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30, fontFamily: 'Roboto' },
  header: { borderBottomWidth: 2, borderBottomColor: '#f4f4f5', paddingBottom: 10, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 24, fontFamily: 'Roboto-Bold', textTransform: 'uppercase', color: '#18181b' },
  subtitle: { fontSize: 10, color: '#71717a', marginTop: 5 },
  statsContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 4, border: '1pt solid #e2e8f0' },
  statLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: 'Roboto-Bold', color: '#0f172a' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  tableCard: { width: '48%', marginBottom: 15, border: '1pt solid #e4e4e7', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f4f4f5', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e4e4e7' },
  tableName: { fontSize: 12, fontFamily: 'Roboto-Bold', color: '#18181b' },
  tableCapacity: { fontSize: 8, backgroundColor: '#ffffff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, border: '1pt solid #d4d4d8' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f4f4f5', padding: 6, alignItems: 'center' },
  colIndex: { width: 20, fontSize: 9, color: '#a1a1aa', textAlign: 'center', fontFamily: 'Roboto-Bold' },
  colName: { flex: 1, fontSize: 10, color: '#18181b' },
  colTags: { flexDirection: 'row', gap: 4 },
  tag: { fontSize: 6, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2, textTransform: 'uppercase' },
  tagChild: { backgroundColor: '#fdf2f8', color: '#db2777', border: '1pt solid #fce7f3' },
  tagMenu: { backgroundColor: '#eff6ff', color: '#2563eb', border: '1pt solid #dbeafe' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#f4f4f5', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#a1a1aa', textTransform: 'uppercase' }
});

// PDF Document Component
const MyDocument = ({ elements, eventName, stats }: { elements: CanvasElement[], eventName: string, stats: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>{eventName}</Text>
            <Text style={styles.subtitle}>{new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={{ backgroundColor: '#18181b', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 4 }}>
            <Text style={{ color: 'white', fontSize: 8, textTransform: 'uppercase', textAlign: 'center' }}>Total Invitați</Text>
            <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Roboto-Bold', textAlign: 'center' }}>{stats.totalGuests}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
         <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mese</Text>
            <Text style={styles.statValue}>{stats.tableCount}</Text>
         </View>
         <View style={styles.statBox}>
            <Text style={styles.statLabel}>Adulți</Text>
            <Text style={styles.statValue}>{stats.totalGuests - stats.totalKids}</Text>
         </View>
         <View style={[styles.statBox, { backgroundColor: '#fff1f2', borderColor: '#fce7f3' }]}>
            <Text style={[styles.statLabel, { color: '#fb7185' }]}>Copii</Text>
            <Text style={[styles.statValue, { color: '#be123c' }]}>{stats.totalKids}</Text>
         </View>
         <View style={[styles.statBox, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
            <Text style={[styles.statLabel, { color: '#60a5fa' }]}>Meniuri Speciale</Text>
            <Text style={[styles.statValue, { color: '#1d4ed8' }]}>{stats.totalSpecialMenus}</Text>
         </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {elements.map((table, i) => (
            <View key={table.id} style={styles.tableCard} wrap={false}>
                <View style={[styles.tableHeader, table.type === ElementType.PRESIDIUM ? { backgroundColor: '#18181b' } : {}]}>
                    <Text style={[styles.tableName, table.type === ElementType.PRESIDIUM ? { color: 'white' } : {}]}>
                        {table.name}
                    </Text>
                    <Text style={styles.tableCapacity}>
                        {table.guests?.filter(Boolean).length || 0} / {table.capacity}
                    </Text>
                </View>
                {table.guests?.map((guest, idx) => {
                    if(!guest) return null;
                    return (
                        <View key={idx} style={styles.row}>
                            <Text style={styles.colIndex}>{idx + 1 < 10 ? `0${idx+1}` : idx+1}</Text>
                            <Text style={styles.colName}>{guest.name}</Text>
                            <View style={styles.colTags}>
                                {guest.isChild && <Text style={[styles.tag, styles.tagChild]}>Copil</Text>}
                                {guest.menuType !== 'standard' && !guest.isChild && <Text style={[styles.tag, styles.tagMenu]}>{guest.menuType}</Text>}
                            </View>
                        </View>
                    );
                })}
                {(table.guests?.filter(Boolean).length || 0) === 0 && (
                    <View style={{ padding: 15 }}>
                        <Text style={{ fontSize: 8, color: '#d4d4d8', fontStyle: 'italic', textAlign: 'center' }}>Niciun invitat alocat</Text>
                    </View>
                )}
            </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
         <Text style={styles.footerText}>Generat cu WeddingPro</Text>
         <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Pagina ${pageNumber} / ${totalPages}`
          )} />
      </View>

    </Page>
  </Document>
);

interface GuestListPDFProps {
    elements: CanvasElement[];
    eventName?: string;
}

const GuestListPDF: React.FC<GuestListPDFProps> = ({ elements, eventName = "Planificare Eveniment" }) => {
    const [showPreview, setShowPreview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // 1. Filter and Sort Tables
    const tables = elements
        .filter(el => (el.type === ElementType.TABLE || el.type === ElementType.PRESIDIUM) && !el.isStaff)
        .filter(el => el.guests && el.guests.some(g => g !== null))
        .sort((a, b) => {
            if (a.type === ElementType.PRESIDIUM) return -1;
            if (b.type === ElementType.PRESIDIUM) return 1;
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });

    const totalGuests = tables.reduce((acc, t) => acc + (t.guests?.filter(Boolean).length || 0), 0);
    const totalKids = tables.reduce((acc, t) => acc + (t.guests?.filter(g => g && g.isChild).length || 0), 0);
    const totalSpecialMenus = tables.reduce((acc, t) => acc + (t.guests?.filter(g => g && g.menuType !== 'standard' && !g.isChild).length || 0), 0);

    const stats = { totalGuests, totalKids, totalSpecialMenus, tableCount: tables.length };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const blob = await pdf(<MyDocument elements={tables} eventName={eventName} stats={stats} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Lista_Invitati_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("PDF Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Reusable Content Component - Designed to look identical in Preview and Print
    const PrintableContent = (
        <div className="bg-white text-zinc-900 w-full font-sans p-8 max-w-[210mm] mx-auto flex flex-col relative print:w-full print:max-w-none print:p-0">
            {/* DECORATIVE HEADER BORDER */}
            <div className="h-3 bg-zinc-900 mb-6 print:mb-4"></div>

            {/* HEADER */}
            <div className="flex justify-between items-end border-b-2 border-zinc-100 pb-6 mb-8 mt-2 print:pb-4 print:mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase print:text-2xl">{eventName}</h1>
                    <div className="flex items-center gap-2 text-zinc-500 mt-2 font-medium text-sm print:text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-zinc-900 text-white px-6 py-3 rounded-lg shadow-sm print:bg-transparent print:text-black print:border print:border-black print:shadow-none print:px-4 print:py-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block text-center">Total Invitați</span>
                        <span className="text-3xl font-black block text-center print:text-2xl">{totalGuests}</span>
                    </div>
                </div>
            </div>

            {/* SUMMARY STATS GRID */}
            <div className="grid grid-cols-4 gap-4 mb-10 print:mb-6 print:gap-2">
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col items-center justify-center print:border-black print:p-2">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 print:text-black">Mese</span>
                    <span className="text-2xl font-bold text-zinc-800 print:text-lg">{tables.length}</span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col items-center justify-center print:border-black print:p-2">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1 print:text-black">Adulți</span>
                    <span className="text-2xl font-bold text-zinc-800 print:text-lg">{totalGuests - totalKids}</span>
                </div>
                <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 flex flex-col items-center justify-center print:border-black print:bg-transparent print:p-2">
                    <span className="text-pink-400 text-[10px] font-bold uppercase tracking-widest mb-1 print:text-black">Copii</span>
                    <span className="text-2xl font-bold text-pink-700 print:text-lg">{totalKids}</span>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center print:border-black print:bg-transparent print:p-2">
                    <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1 print:text-black">Meniuri Speciale</span>
                    <span className="text-2xl font-bold text-blue-700 print:text-lg">{totalSpecialMenus}</span>
                </div>
            </div>

            {/* TABLES GRID - Keep columns in print */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 items-start print:gap-y-4 print:gap-x-6">
                {tables.map(table => {
                    const occupiedSeats = table.guests?.filter(Boolean).length || 0;
                    const isPresidium = table.type === ElementType.PRESIDIUM;

                    return (
                        <div 
                            key={table.id} 
                            className={cn(
                                "bg-white border rounded-lg overflow-hidden shadow-sm break-inside-avoid print:shadow-none print:border-black",
                                isPresidium ? "border-zinc-800 ring-2 ring-zinc-800 col-span-2 print:ring-0 print:border-2" : "border-zinc-200"
                            )}
                        >
                            {/* TABLE HEADER */}
                            <div className={cn(
                                "px-5 py-3 flex justify-between items-center border-b print:py-2 print:border-black",
                                isPresidium ? "bg-zinc-900 text-white print:bg-black print:text-white" : "bg-zinc-50 border-zinc-200 print:bg-zinc-100"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm shadow-sm print:shadow-none print:border-black",
                                        isPresidium ? "bg-white text-zinc-900" : "bg-white border border-zinc-200 text-zinc-700"
                                    )}>
                                        {isPresidium ? <Users className="w-4 h-4"/> : (table.name.match(/\d+/) ? table.name.match(/\d+/)![0] : '#')}
                                    </div>
                                    <h3 className="font-bold text-lg leading-none">{table.name}</h3>
                                </div>
                                <div className={cn(
                                    "text-xs font-bold px-3 py-1 rounded-full print:border-black",
                                    isPresidium ? "bg-zinc-800 text-zinc-300 border border-zinc-700 print:bg-white print:text-black" : "bg-white border border-zinc-200 text-zinc-500"
                                )}>
                                    {occupiedSeats} / {table.capacity}
                                </div>
                            </div>

                            {/* GUEST LIST - STRUCTURED TABLE LAYOUT */}
                            <div className="p-0">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[9px] uppercase tracking-wider text-zinc-400 font-bold print:border-black">
                                            <th className="py-2 text-center w-16 print:text-black">Loc</th>
                                            <th className="py-2 text-left print:text-black">Nume Invitat</th>
                                            <th className="py-2 pr-4 text-right print:text-black">Info</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.guests?.map((guest, idx) => {
                                            if (!guest) return null; 

                                            const seatNum = idx + 1;
                                            return (
                                                <tr key={guest.id || idx} className="border-b border-zinc-100 last:border-0 even:bg-zinc-50/30 print:border-zinc-300">
                                                    <td className="py-2.5 text-center font-bold text-zinc-400 print:text-black">
                                                        {seatNum < 10 ? `0${seatNum}` : seatNum}
                                                    </td>
                                                    <td className="py-2.5 text-left font-semibold text-zinc-800 print:text-black">
                                                        {guest.name}
                                                    </td>
                                                    <td className="py-2.5 pr-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            {guest.isChild && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-pink-50 text-pink-600 px-2 py-0.5 rounded border border-pink-100 print:border-black print:text-black print:bg-transparent">
                                                                    <Baby className="w-3 h-3" /> Copil
                                                                </span>
                                                            )}
                                                            {guest.menuType !== 'standard' && !guest.isChild && (
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 print:border-black print:text-black print:bg-transparent">
                                                                    <Utensils className="w-3 h-3" /> {guest.menuType}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {occupiedSeats === 0 && (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-zinc-300 text-xs italic print:text-black">
                                                    Niciun invitat alocat la această masă.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER - Moved margin to top instead of auto to avoid huge gaps */}
            <div className="mt-12 pt-6 flex justify-between items-center text-[10px] text-zinc-400 border-t-2 border-zinc-100 uppercase tracking-widest print:border-black print:text-black">
                <p>Generat automat cu <strong>WeddingPro</strong></p>
                <p>Pagina 1</p>
            </div>
        </div>
    );

    return (
        <div className="flex gap-2">
            {/* DIRECT DOWNLOAD BUTTON */}
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                onClick={handleDownload}
                disabled={tables.length === 0 || isGenerating}
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                <span className="hidden sm:inline">Descarcă PDF</span>
            </Button>

            {/* PREVIEW BUTTON */}
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400"
                onClick={() => setShowPreview(true)}
                disabled={tables.length === 0}
            >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Previzualizare & Print</span>
            </Button>

            {/* PREVIEW MODAL */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    <DialogHeader className="p-4 border-b bg-white dark:bg-zinc-900 shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Printer className="w-5 h-5 text-indigo-500" /> Previzualizare Export
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-auto p-8 flex justify-center bg-zinc-200/50 dark:bg-zinc-900/50">
                        <div className="w-full max-w-[210mm] bg-white shadow-2xl origin-top">
                            {PrintableContent}
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t bg-white dark:bg-zinc-900 shrink-0 gap-2">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>
                            Închide
                        </Button>
                        <Button 
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handlePrint}
                        >
                            <Download className="w-4 h-4" />
                            Printează
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PRINT PORTAL - Hidden from screen, visible in print */}
            {createPortal(
                <div className="print-content">
                    {PrintableContent}
                </div>,
                document.body
            )}

            <style>{`
                @media screen {
                    .print-content {
                        display: none;
                    }
                }
                @media print {
                    body > *:not(.print-content) {
                        display: none !important;
                    }
                    .print-content {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height:100vh;
                        background: white;
                        z-index: 9999;
                    }
                    /* Ensure backgrounds and colors match preview */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        margin: 10mm;
                        size: A4 portrait;
                    }
                }
            `}</style>
        </div>
    );
};

export default GuestListPDF;
