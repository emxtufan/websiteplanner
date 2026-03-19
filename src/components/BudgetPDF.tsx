
import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import Button from './ui/button';
import { BudgetCategory } from '../types';
import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
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

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30, fontFamily: 'Roboto' },
  header: { borderBottomWidth: 2, borderBottomColor: '#f4f4f5', paddingBottom: 10, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 24, fontFamily: 'Roboto-Bold', textTransform: 'uppercase', color: '#18181b' },
  subtitle: { fontSize: 10, color: '#71717a', marginTop: 5 },
  statsContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 4, border: '1pt solid #e2e8f0' },
  statLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: 'Roboto-Bold', color: '#0f172a' },
  
  categoryContainer: { marginBottom: 15 },
  categoryHeader: { backgroundColor: '#f0f9ff', padding: 6, borderBottomWidth: 1, borderBottomColor: '#bae6fd', flexDirection: 'row', justifyContent: 'space-between' },
  categoryTitle: { fontSize: 10, fontFamily: 'Roboto-Bold', color: '#0369a1' },
  
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f4f4f5', padding: 5, alignItems: 'center' },
  colName: { width: '40%' },
  colEst: { width: '20%', textAlign: 'right' },
  colFinal: { width: '20%', textAlign: 'right' },
  colPaid: { width: '20%', textAlign: 'right' },
  
  cellText: { fontSize: 9, color: '#333' },
  cellNumber: { fontSize: 9, fontFamily: 'Roboto-Bold', color: '#333' },
  
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#f4f4f5', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#a1a1aa', textTransform: 'uppercase' }
});

const BudgetDocument = ({ categories, totalBudget }: { categories: BudgetCategory[], totalBudget: number }) => {
    const totalEstimated = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0), 0);
    const totalFinal = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + (item.finalCost || 0), 0), 0);
    const totalPaid = categories.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + (item.paidAmount || 0), 0), 0);
    const totalSpent = totalFinal > 0 ? totalFinal : totalEstimated;

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
                <Text style={styles.title}>Raport Buget</Text>
                <Text style={styles.subtitle}>Generat la {new Date().toLocaleDateString('ro-RO')}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
             <View style={styles.statBox}>
                <Text style={styles.statLabel}>Buget Total</Text>
                <Text style={styles.statValue}>{totalBudget.toLocaleString()} LEI</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                <Text style={[styles.statLabel, { color: '#166534' }]}>Cheltuit (Estimat/Final)</Text>
                <Text style={[styles.statValue, { color: '#14532d' }]}>{totalSpent.toLocaleString()} LEI</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                <Text style={[styles.statLabel, { color: '#1e40af' }]}>Achitat</Text>
                <Text style={[styles.statValue, { color: '#1e3a8a' }]}>{totalPaid.toLocaleString()} LEI</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: '#fff1f2', borderColor: '#fecdd3' }]}>
                <Text style={[styles.statLabel, { color: '#be123c' }]}>Rest de Plată</Text>
                <Text style={[styles.statValue, { color: '#881337' }]}>{(totalSpent - totalPaid).toLocaleString()} LEI</Text>
             </View>
          </View>

          <View>
             <View style={[styles.row, { borderBottomWidth: 2, borderBottomColor: '#e5e7eb' }]}>
                 <Text style={[styles.colName, { fontSize: 8, fontFamily: 'Roboto-Bold', color: '#6b7280', textTransform: 'uppercase' }]}>ARTICOL</Text>
                 <Text style={[styles.colEst, { fontSize: 8, fontFamily: 'Roboto-Bold', color: '#6b7280', textTransform: 'uppercase' }]}>ESTIMAT</Text>
                 <Text style={[styles.colFinal, { fontSize: 8, fontFamily: 'Roboto-Bold', color: '#6b7280', textTransform: 'uppercase' }]}>FINAL</Text>
                 <Text style={[styles.colPaid, { fontSize: 8, fontFamily: 'Roboto-Bold', color: '#6b7280', textTransform: 'uppercase' }]}>ACHITAT</Text>
             </View>

             {categories.map((cat) => (
                 <View key={cat.id} style={styles.categoryContainer} wrap={false}>
                     <View style={styles.categoryHeader}>
                         <Text style={styles.categoryTitle}>{cat.name}</Text>
                     </View>
                     {cat.items.map((item) => (
                         <View key={item.id} style={styles.row}>
                             <Text style={styles.colName}>{item.name}</Text>
                             <Text style={styles.colEst}>{item.estimatedCost > 0 ? item.estimatedCost.toLocaleString() : '-'}</Text>
                             <Text style={styles.colFinal}>{item.finalCost > 0 ? item.finalCost.toLocaleString() : '-'}</Text>
                             <Text style={styles.colPaid}>{item.paidAmount > 0 ? item.paidAmount.toLocaleString() : '-'}</Text>
                         </View>
                     ))}
                 </View>
             ))}
          </View>

          <View style={styles.footer} fixed>
             <Text style={styles.footerText}>Generat cu WeddingPro</Text>
             <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      </Document>
    );
};

const BudgetPDF = ({ categories, totalBudget }: { categories: BudgetCategory[], totalBudget: number }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const blob = await pdf(<BudgetDocument categories={categories} totalBudget={totalBudget} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Buget_Eveniment_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("PDF Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2"
        >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span className="hidden sm:inline">Export PDF</span>
        </Button>
    );
};

export default BudgetPDF;
