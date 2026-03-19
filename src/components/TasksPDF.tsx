
import React, { useState } from 'react';
import { FileDown, Loader2, ClipboardList } from 'lucide-react';
import Button from './ui/button';
import { Task } from '../types';
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
  table: { width: '100%', borderLeftWidth: 0, borderTopWidth: 0 },
  tableRow: { flexDirection: 'row', borderBottomColor: '#e4e4e7', borderBottomWidth: 1, alignItems: 'center', paddingVertical: 6 },
  tableHeader: { backgroundColor: '#f4f4f5' },
  tableCol: { paddingHorizontal: 4 },
  colStatus: { width: '15%' },
  colTitle: { width: '45%' },
  colCategory: { width: '15%' },
  colPriority: { width: '10%' },
  colDate: { width: '15%' },
  cellText: { fontSize: 9, color: '#333' },
  headerText: { fontSize: 9, fontFamily: 'Roboto-Bold', color: '#18181b', textTransform: 'uppercase' },
  statusBadge: { fontSize: 8, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#f4f4f5', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#a1a1aa', textTransform: 'uppercase' }
});

const TasksDocument = ({ tasks }: { tasks: Task[] }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
                <Text style={styles.title}>Planificare Sarcini</Text>
                <Text style={styles.subtitle}>Generat la {new Date().toLocaleDateString('ro-RO')}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
             <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Sarcini</Text>
                <Text style={styles.statValue}>{total}</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: '#ecfccb', borderColor: '#d9f99d' }]}>
                <Text style={[styles.statLabel, { color: '#65a30d' }]}>Finalizate</Text>
                <Text style={[styles.statValue, { color: '#365314' }]}>{completed}</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                <Text style={[styles.statLabel, { color: '#ea580c' }]}>De Făcut</Text>
                <Text style={[styles.statValue, { color: '#7c2d12' }]}>{pending}</Text>
             </View>
             <View style={[styles.statBox, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
                <Text style={[styles.statLabel, { color: '#dc2626' }]}>Prioritate Maximă</Text>
                <Text style={[styles.statValue, { color: '#7f1d1d' }]}>{highPriority}</Text>
             </View>
          </View>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCol, styles.colStatus]}><Text style={styles.headerText}>Status</Text></View>
                <View style={[styles.tableCol, styles.colTitle]}><Text style={styles.headerText}>Sarcina</Text></View>
                <View style={[styles.tableCol, styles.colCategory]}><Text style={styles.headerText}>Categorie</Text></View>
                <View style={[styles.tableCol, styles.colPriority]}><Text style={styles.headerText}>Prioritate</Text></View>
                <View style={[styles.tableCol, styles.colDate]}><Text style={styles.headerText}>Termen</Text></View>
            </View>

            {/* Rows */}
            {tasks.map((task, index) => (
                <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colStatus]}>
                        <Text style={[styles.statusBadge, { backgroundColor: task.status === 'Done' ? '#dcfce7' : '#f4f4f5', color: task.status === 'Done' ? '#166534' : '#52525b' }]}>
                            {task.status}
                        </Text>
                    </View>
                    <View style={[styles.tableCol, styles.colTitle]}>
                        <Text style={[styles.cellText, { fontFamily: 'Roboto-Bold' }]}>{task.title}</Text>
                        {task.notes && <Text style={{ fontSize: 8, color: '#71717a', marginTop: 2 }}>{task.notes}</Text>}
                    </View>
                    <View style={[styles.tableCol, styles.colCategory]}>
                        <Text style={styles.cellText}>{task.tag}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colPriority]}>
                        <Text style={[styles.cellText, { color: task.priority === 'High' ? '#dc2626' : '#333' }]}>{task.priority}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colDate]}>
                        <Text style={styles.cellText}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ro-RO') : '-'}</Text>
                    </View>
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

const TasksPDF = ({ tasks }: { tasks: Task[] }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const blob = await pdf(<TasksDocument tasks={tasks} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Lista_Taskuri_${new Date().toISOString().split('T')[0]}.pdf`;
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
            disabled={isGenerating || tasks.length === 0}
            className="gap-2"
        >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span className="hidden sm:inline">Export PDF</span>
        </Button>
    );
};

export default TasksPDF;
