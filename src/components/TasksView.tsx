
import React, { useState, useRef, useEffect } from "react";
import { 
  Circle, CheckCircle2, Clock, HelpCircle, ArrowUp, ArrowRight, ArrowDown, 
  MoreHorizontal, Plus, Filter, Search, X, User, Trash2, Edit, CalendarIcon, Check, FileText
} from "lucide-react";
import { Task } from "../types";
import Button from "./ui/button";
import Input from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { cn } from "../lib/utils";
import { useToast } from "./ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"; 
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "./ui/alert-dialog";
import { PLAN_LIMITS } from "../constants"; 
import TasksPDF from "./TasksPDF"; 

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  isPremium?: boolean;
  onShowUpgrade?: () => void;
  // Props for external control (from Calendar)
  variant?: 'full' | 'form'; 
  externalOpenModal?: boolean;
  externalTaskDate?: string;
  externalTaskToEdit?: Task | null;
  onCloseExternalModal?: () => void;
  onCheckActive?: () => boolean; // NEW: Global restriction check
}

// ... FilterPopover remains same ...
const FilterPopover = ({ title, options, selected, onChange, onClose }: any) => {
    return (
        <div className="absolute top-10 left-0 w-48 bg-background border rounded-md shadow-lg z-50 p-2 animate-in fade-in zoom-in-95">
             <div className="flex items-center justify-between mb-2 px-2">
                 <span className="text-xs font-semibold">{title}</span>
                 <X className="w-3 h-3 cursor-pointer" onClick={onClose}/>
             </div>
             <div className="space-y-1">
                 {options.map((opt: string) => (
                     <div key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer" onClick={(e) => { e.stopPropagation(); onChange(opt); }}>
                         <Checkbox 
                            id={`filter-${opt}`}
                            checked={selected.includes(opt)} 
                            onCheckedChange={() => onChange(opt)}
                            className="pointer-events-none"
                            readOnly
                         />
                         <label htmlFor={`filter-${opt}`} className="text-sm cursor-pointer flex-1">{opt}</label>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const TasksView: React.FC<TasksViewProps> = ({ 
    tasks, setTasks, isPremium = false, onShowUpgrade,
    variant = 'full', 
    externalOpenModal, externalTaskDate, externalTaskToEdit, onCloseExternalModal,
    onCheckActive
}) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  
  // Advanced Filters
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [openFilterMenu, setOpenFilterMenu] = useState<'status' | 'priority' | null>(null);

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState(""); 
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskTag, setTaskTag] = useState<'General' | 'Nunta' | 'Botez'>('General');
  const [taskStatus, setTaskStatus] = useState<'Todo' | 'In Progress' | 'Backlog' | 'Done' | 'Canceled'>('Todo');
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskDueTime, setTaskDueTime] = useState(""); 

  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Initialize form if variant is 'form' (used in Calendar Modal)
  useEffect(() => {
      if (variant === 'form') {
          if (externalTaskToEdit) {
              openEditModal(externalTaskToEdit);
          } else {
              openAddModal(externalTaskDate);
          }
      }
  }, [variant, externalTaskDate, externalTaskToEdit]);

  // Handle external open requests for 'full' view
  useEffect(() => {
      if (variant === 'full' && externalOpenModal) {
          if (externalTaskToEdit) openEditModal(externalTaskToEdit);
          else openAddModal(externalTaskDate);
      }
  }, [externalOpenModal, variant]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilterMenu(null);
      }
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-trigger') && !target.closest('.action-menu-content')) {
          setOpenActionMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(filter.toLowerCase()) || 
                          task.id.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(task.status);
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(task.priority);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openAddModal = (prefilledDate?: string) => {
      if (onCheckActive && !onCheckActive()) return;

      if (!isPremium && tasks.filter(t => t.isCustom).length >= PLAN_LIMITS.free.maxCustomTasks) {
          if (onShowUpgrade) onShowUpgrade();
          if (onCloseExternalModal) onCloseExternalModal();
          return;
      }
      setIsEditing(false);
      setEditingId(null);
      setTaskTitle("");
      setTaskNotes(""); 
      setTaskPriority("Medium");
      setTaskTag("General");
      setTaskStatus("Todo");
      setTaskDueDate(prefilledDate || "");
      setTaskDueTime(""); 
      setIsModalOpen(true);
      setIsSuccess(false);
  };

  const openEditModal = (task: Task) => {
      if (onCheckActive && !onCheckActive()) return;

      setIsEditing(true);
      setEditingId(task.id);
      setTaskTitle(task.title);
      setTaskNotes(task.notes || ""); 
      setTaskPriority(task.priority);
      setTaskTag(task.tag);
      setTaskStatus(task.status as any);
      setTaskDueDate(task.dueDate || "");
      setTaskDueTime(task.dueTime || ""); 
      setIsModalOpen(true);
      setIsSuccess(false);
      setOpenActionMenuId(null);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsSuccess(false);
      if (onCloseExternalModal) onCloseExternalModal();
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCheckActive && !onCheckActive()) return;
    if (!taskTitle.trim()) return;

    if (isEditing && editingId) {
        setTasks(prev => prev.map(t => t.id === editingId ? {
            ...t,
            title: taskTitle,
            notes: taskNotes, // Save notes
            priority: taskPriority,
            tag: taskTag,
            status: taskStatus,
            dueDate: taskDueDate,
            dueTime: taskDueTime
        } : t));
    } else {
        const newTask: Task = {
            id: `TSK-${Math.floor(Math.random() * 9000) + 1000}`,
            title: taskTitle,
            notes: taskNotes, // Save notes
            priority: taskPriority,
            tag: taskTag,
            status: taskStatus,
            type: 'Custom',
            isCustom: true,
            dueDate: taskDueDate,
            dueTime: taskDueTime
        };
        setTasks(prev => [newTask, ...prev]);
    }

    // --- SUCCESS FEEDBACK ---
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        setIsSuccess(true);
        setTimeout(() => {
            handleCloseModal();
        }, 1500);
    } else {
        toast({ title: isEditing ? "Task actualizat" : "Task salvat", variant: "success" });
        handleCloseModal();
    }
  };

  const confirmDelete = (id: string) => { setTaskToDelete(id); setOpenActionMenuId(null); };
  
  const handleDeleteTask = () => { 
      if (onCheckActive && !onCheckActive()) return;
      if (taskToDelete) { 
          setTasks(prev => prev.filter(t => t.id !== taskToDelete)); 
          toast({ title: "Sarcină ștearsă", variant: "default" }); 
          setTaskToDelete(null);
          // If deleted from modal form, close the modal
          if (variant === 'form') {
              handleCloseModal();
          }
      } 
  };

  const handleToggleStatus = (id: string) => { 
      if (onCheckActive && !onCheckActive()) return;
      setTasks(prev => prev.map(t => { if (t.id !== id) return t; const newStatus = t.status === 'Done' ? 'Todo' : 'Done'; toast({ title: newStatus === 'Done' ? "Felicitări! Sarcină finalizată" : "Status actualizat", variant: newStatus === 'Done' ? "success" : "default" }); return { ...t, status: newStatus }; })); setOpenActionMenuId(null); 
  };

  const toggleFilter = (type: 'status' | 'priority', value: string) => { if (type === 'status') { setStatusFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]); } else { setPriorityFilters(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]); } };
  const getStatusIcon = (status: string) => { switch (status) { case 'Done': return <CheckCircle2 className="w-4 h-4 text-green-600" />; case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />; case 'Backlog': return <HelpCircle className="w-4 h-4 text-muted-foreground" />; case 'Canceled': return <X className="w-4 h-4 text-red-500" />; default: return <Circle className="w-4 h-4 text-muted-foreground" />; } };
  const getPriorityIcon = (priority: string) => { switch (priority) { case 'High': return <ArrowUp className="w-4 h-4 text-red-500" />; case 'Medium': return <ArrowRight className="w-4 h-4 text-amber-500" />; case 'Low': return <ArrowDown className="w-4 h-4 text-green-500" />; default: return <ArrowRight className="w-4 h-4 text-muted-foreground" />; } };

  // --- FORM CONTENT (Reusable) ---
  const FormContent = () => (
      <div className="space-y-4 py-2 relative min-h-[350px]">
          {/* SUCCESS OVERLAY FOR MOBILE */}
          {isSuccess && (
              <div className="absolute inset-0 bg-background z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 shadow-sm border border-green-200 dark:border-green-800">
                      <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Salvat cu succes!</h3>
                  <p className="text-muted-foreground text-sm">Se actualizează...</p>
              </div>
          )}

          <div className="space-y-2">
              <label className="text-sm font-medium">Titlu Sarcină</label>
              <Input 
                  placeholder="Ex: Rezervare cabină foto..." 
                  value={taskTitle} 
                  onChange={(e: any) => setTaskTitle(e.target.value)}
                  autoFocus
                  className="bg-zinc-50 dark:bg-zinc-900"
              />
          </div>
          
          <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> Data Scadență
                  </label>
                  <Input 
                      type="date"
                      value={taskDueDate} 
                      onChange={(e: any) => setTaskDueDate(e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-900 w-full"
                  />
              </div>
              <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Ora
                  </label>
                  <Input 
                      type="time"
                      value={taskDueTime} 
                      onChange={(e: any) => setTaskDueTime(e.target.value)}
                      className="bg-zinc-50 dark:bg-zinc-900 w-full"
                  />
              </div>
          </div>

          <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Note / Detalii
              </label>
              <textarea 
                  className="w-full min-h-[80px] rounded-md border border-input bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                  placeholder="Detalii suplimentare, contacte furnizori, etc..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium">Categorie</label>
                  <select 
                      className="w-full h-10 rounded-md border border-input bg-zinc-50 dark:bg-zinc-900 px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={taskTag}
                      onChange={(e: any) => setTaskTag(e.target.value)}
                  >
                      <option value="General">General</option>
                      <option value="Nunta">Nuntă</option>
                      <option value="Botez">Botez</option>
                  </select>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium">Prioritate</label>
                  <select 
                      className="w-full h-10 rounded-md border border-input bg-zinc-50 dark:bg-zinc-900 px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={taskPriority}
                      onChange={(e: any) => setTaskPriority(e.target.value)}
                  >
                      <option value="High">High 🔥</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                  </select>
              </div>
              {isEditing && (
                  <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">Status</label>
                      <select 
                          className="w-full h-10 rounded-md border border-input bg-zinc-50 dark:bg-zinc-900 px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={taskStatus}
                          onChange={(e: any) => setTaskStatus(e.target.value)}
                      >
                          <option value="Todo">De făcut</option>
                          <option value="In Progress">În Lucru</option>
                          <option value="Backlog">Backlog</option>
                          <option value="Done">Finalizat</option>
                          <option value="Canceled">Anulat</option>
                      </select>
                  </div>
              )}
          </div>
          
          <div className="pt-4 flex items-center justify-between gap-3">
               <div className="flex gap-3">
                   <Button type="button" onClick={handleSaveTask} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
                       {isEditing ? 'Actualizează' : 'Salvează'}
                   </Button>
                   <Button type="button" variant="outline" onClick={handleCloseModal}>Anulează</Button>
               </div>

               {isEditing && editingId && (
                   <Button 
                       type="button" 
                       variant="ghost" 
                       onClick={() => confirmDelete(editingId)} 
                       className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
                   >
                       <Trash2 className="w-4 h-4 mr-2" /> Șterge
                   </Button>
               )}
          </div>
      </div>
  );

  // If variant is form, we render JUST the form content (Dialog wrapper is in parent)
  if (variant === 'form') {
      return (
        <>
            <FormContent />
            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ștergi sarcina selectată?</AlertDialogTitle>
                        <AlertDialogDescription>Această acțiune nu poate fi anulată.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600">Șterge</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      );
  }

  // --- FULL VIEW RENDER ---
  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-8 h-full" ref={actionsRef}>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Sarcini & Organizare</h2>
          <p className="text-muted-foreground">Urmărește progresul evenimentului tău pas cu pas.</p>
        </div>
        <div className="flex items-center gap-2">
           <TasksPDF tasks={tasks} />
           <Button onClick={() => openAddModal()}>
             <Plus className="w-4 h-4 mr-2" /> Adaugă Sarcină
           </Button>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex flex-col gap-4" ref={filterRef}>
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Input 
                    placeholder="Filtrează sarcini..." 
                    className="h-8 w-[150px] lg:w-[250px]"
                    value={filter}
                    onChange={(e: any) => setFilter(e.target.value)}
                />
                
                {/* Status Filter */}
                <div className="relative">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn("h-8 border-dashed gap-1", statusFilters.length > 0 && "bg-accent border-solid")}
                        onClick={() => setOpenFilterMenu(openFilterMenu === 'status' ? null : 'status')}
                    >
                        <Plus className="w-4 h-4" /> Status 
                        {statusFilters.length > 0 && <span className="ml-1 rounded-sm bg-secondary px-1 text-xs font-normal">{statusFilters.length}</span>}
                    </Button>
                    {openFilterMenu === 'status' && (
                        <FilterPopover 
                            title="Filter Status" 
                            options={['Todo', 'In Progress', 'Done', 'Backlog', 'Canceled']} 
                            selected={statusFilters}
                            onChange={(val: string) => toggleFilter('status', val)}
                            onClose={() => setOpenFilterMenu(null)}
                        />
                    )}
                </div>

                {/* Priority Filter */}
                <div className="relative hidden lg:block">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn("h-8 border-dashed gap-1", priorityFilters.length > 0 && "bg-accent border-solid")}
                        onClick={() => setOpenFilterMenu(openFilterMenu === 'priority' ? null : 'priority')}
                    >
                        <Plus className="w-4 h-4" /> Prioritate
                        {priorityFilters.length > 0 && <span className="ml-1 rounded-sm bg-secondary px-1 text-xs font-normal">{priorityFilters.length}</span>}
                    </Button>
                     {openFilterMenu === 'priority' && (
                        <FilterPopover 
                            title="Filter Priority" 
                            options={['High', 'Medium', 'Low']} 
                            selected={priorityFilters}
                            onChange={(val: string) => toggleFilter('priority', val)}
                            onClose={() => setOpenFilterMenu(null)}
                        />
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* TASK TABLE */}
      <div className="rounded-md border bg-background flex flex-col flex-1 min-h-0">
          <div className="relative w-full overflow-auto flex-1">
              <table className="w-full caption-bottom text-sm text-left">
                  <thead className="[&_tr]:border-b sticky top-0 bg-background z-10 shadow-sm">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]">
                              <Checkbox />
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">ID</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Tip</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Titlu</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">Data</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[140px]">Status</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">Prioritate</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground text-right w-[60px]"></th>
                      </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                      {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                          <tr key={task.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group">
                              <td className="p-4 align-middle"><Checkbox /></td>
                              <td className="p-4 align-middle font-mono text-xs text-muted-foreground">{task.id.slice(-4)}</td>
                              <td className="p-4 align-middle">
                                  <div className="flex gap-2">
                                      <span className={cn(
                                          "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap border-transparent bg-secondary text-secondary-foreground",
                                          task.tag === 'Nunta' && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
                                          task.tag === 'Botez' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                      )}>
                                          {task.tag}
                                      </span>
                                  </div>
                              </td>
                              <td className="p-4 align-middle">
                                  <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                          <span className={cn("font-medium truncate max-w-[250px]", task.status === 'Done' && "line-through text-muted-foreground")}>{task.title}</span>
                                          {task.isCustom && (
                                              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold text-primary shrink-0" title="Added by Owner">
                                                  <User className="w-3 h-3 mr-1" /> My Task
                                              </span>
                                          )}
                                      </div>
                                      {task.notes && <span className="text-xs text-muted-foreground truncate max-w-[250px] italic">{task.notes}</span>}
                                  </div>
                              </td>
                              <td className="p-4 align-middle">
                                  <div className="flex flex-col gap-0.5">
                                      {task.dueDate ? (
                                          <div className="flex items-center text-xs text-muted-foreground">
                                              <CalendarIcon className="w-3 h-3 mr-1.5" />
                                              {new Date(task.dueDate).toLocaleDateString()}
                                          </div>
                                      ) : <span className="text-xs text-muted-foreground">-</span>}
                                      {task.dueTime && (
                                          <div className="flex items-center text-xs font-mono text-muted-foreground pl-5">
                                              {task.dueTime}
                                          </div>
                                      )}
                                  </div>
                              </td>
                              <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2 w-[100px] cursor-pointer hover:bg-muted p-1 rounded transition-colors" onClick={() => handleToggleStatus(task.id)}>
                                      {getStatusIcon(task.status)}
                                      <span className="text-xs">{task.status}</span>
                                  </div>
                              </td>
                              <td className="p-4 align-middle">
                                  <div className="flex items-center gap-2">
                                      {getPriorityIcon(task.priority)}
                                      <span className="text-xs">{task.priority}</span>
                                  </div>
                              </td>
                              <td className="p-4 align-middle text-right relative">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 action-menu-trigger"
                                    onClick={(e) => { e.stopPropagation(); setOpenActionMenuId(openActionMenuId === task.id ? null : task.id); }}
                                  >
                                      <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                  {openActionMenuId === task.id && (
                                      <div className="action-menu-content absolute right-8 top-0 w-40 bg-background border rounded-md shadow-xl z-50 animate-in fade-in zoom-in-95 flex flex-col py-1">
                                          <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left" onClick={(e) => { e.stopPropagation(); handleToggleStatus(task.id); }}>
                                              <CheckCircle2 className="w-4 h-4 mr-2" /> 
                                              {task.status === 'Done' ? 'Mark Undone' : 'Mark Done'}
                                          </button>
                                          <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent w-full text-left" onClick={(e) => { e.stopPropagation(); openEditModal(task); }}>
                                              <Edit className="w-4 h-4 mr-2" /> Edit Task
                                          </button>
                                          <div className="h-px bg-border my-1" />
                                          <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 w-full text-left text-red-500" onClick={(e) => { e.stopPropagation(); confirmDelete(task.id); }}>
                                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                                          </button>
                                      </div>
                                  )}
                              </td>
                          </tr>
                      )) : (
                          <tr>
                              <td colSpan={8} className="p-8 text-center text-muted-foreground h-40">
                                  <div className="flex flex-col items-center justify-center gap-2">
                                      <Search className="w-8 h-8 opacity-20" />
                                      <p>Nu am găsit sarcini care să corespundă filtrului.</p>
                                      <Button variant="link" onClick={() => { setFilter(""); setStatusFilters([]); setPriorityFilters([]); }}>Resetează filtrele</Button>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground flex-1">
                Afișare {filteredTasks.length} din {tasks.length} sarcini
            </div>
          </div>
      </div>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Ștergi sarcina selectată?</AlertDialogTitle>
                <AlertDialogDescription>Această acțiune nu poate fi anulată.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600">Șterge</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* INTERNAL ADD/EDIT MODAL FOR FULL VIEW */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{isEditing ? "Editează Sarcina" : "Adaugă Sarcină"}</DialogTitle>
                  <DialogDescription>
                      Gestionează detaliile sarcinii pentru a rămâne organizat.
                  </DialogDescription>
              </DialogHeader>
              <FormContent />
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksView;
