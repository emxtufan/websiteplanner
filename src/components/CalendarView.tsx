
import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MoreHorizontal, MapPin } from "lucide-react";
import { Task } from "../types";
import { Card, CardContent } from "./ui/card";
import Button from "./ui/button";
import { cn } from "../lib/utils";

// --- DATE HELPERS (Native JS to avoid date-fns dependency issues) ---
const cloneDate = (d: Date) => new Date(d.getTime());

const addMonths = (d: Date, n: number) => {
    const newDate = cloneDate(d);
    newDate.setMonth(d.getMonth() + n);
    return newDate;
};

const subMonths = (d: Date, n: number) => {
    const newDate = cloneDate(d);
    newDate.setMonth(d.getMonth() - n);
    return newDate;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const startOfWeek = (d: Date) => {
    const date = cloneDate(d);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    // Week starts on Monday (1). If day is 0 (Sun), diff is -6. If 1 (Mon), diff is 0.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

const endOfWeek = (d: Date) => {
    const date = cloneDate(d);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    // End of week is Sunday (0).
    const diff = date.getDate() + (day === 0 ? 0 : 7 - day); 
    return new Date(date.setDate(diff));
};

const eachDayOfInterval = ({ start, end }: { start: Date, end: Date }) => {
    const days = [];
    const current = cloneDate(start);
    // Set time to 0 to compare dates accurately ignoring time
    current.setHours(0,0,0,0);
    const endDate = cloneDate(end);
    endDate.setHours(0,0,0,0);

    while (current <= endDate) {
        days.push(cloneDate(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};

const isSameMonth = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isToday = (d: Date) => isSameDay(d, new Date());

const parseISO = (s: string) => {
    // Tasks use 'yyyy-MM-dd'. We parse it as local time to avoid UTC shifts.
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const formatMonthYear = (d: Date) => d.toLocaleString('ro-RO', { month: 'long', year: 'numeric' });
const formatDayName = (d: Date) => d.toLocaleString('ro-RO', { weekday: 'short' });
const formatFullDate = (d: Date) => d.toLocaleString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDayNumber = (d: Date) => d.getDate();
const formatWeekdayName = (d: Date) => d.toLocaleString('ro-RO', { weekday: 'long' });
const formatISODate = (d: Date) => {
    // Return YYYY-MM-DD local
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onAddTask, onEditTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
      const now = new Date();
      setCurrentDate(now);
      setSelectedDate(now);
  };

  // Generate calendar grid
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Calculate start of grid (Monday of first week)
    const startDate = startOfWeek(monthStart);
    // Calculate end of grid (Sunday of last week)
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const weekDays = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

  const getCategoryColor = (tag: string) => {
      switch (tag) {
          case 'Nunta': return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
          case 'Botez': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
          default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
      }
  };

  // Filter and sort tasks for selected day
  const selectedDayTasks = useMemo(() => {
      return tasks
        .filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), selectedDate))
        .sort((a, b) => {
            if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
            if (a.dueTime && !b.dueTime) return -1;
            if (!a.dueTime && b.dueTime) return 1;
            return 0;
        });
  }, [tasks, selectedDate]);

  return (
    <div className="flex flex-col h-full bg-background">
        {/* Header Calendar Modern */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-8 md:py-6 border-b shrink-0 gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight text-foreground capitalize">
                    {formatMonthYear(currentDate)}
                </h2>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> 
                    Planificator Evenimente
                </p>
            </div>
            
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-background shadow-none">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToToday} className="h-8 text-xs font-medium px-3 hover:bg-background">
                    Azi
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-background shadow-none">
                    <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button onClick={() => onAddTask(formatISODate(selectedDate))} size="sm" className="h-8 px-3 gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> 
                    <span className="hidden sm:inline">Eveniment Nou</span>
                </Button>
            </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden ">
            {/* MAIN CALENDAR GRID */}
            <div className="flex-1 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/50 overflow-y-auto scrollbar-hide">
                {/* Week Header */}
                <div className="grid grid-cols-7 border-b bg-background sticky top-0 z-10 shadow-sm">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid - Using gap-px for clean borders */}
                <div className="grid grid-cols-7 auto-rows-fr bg-border gap-px flex-1 min-h-[500px]">
                    {days.map((day, idx) => {
                        const dateKey = formatISODate(day);
                        const dayTasks = tasks.filter(t => t.dueDate === dateKey);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);
                        const isSelected = isSameDay(day, selectedDate);

                        return (
                            <div 
                                key={idx} 
                                className={cn(
                                    "bg-background p-2 flex flex-col gap-1 transition-all cursor-pointer relative group min-h-[80px] md:min-h-[120px]",
                                    !isCurrentMonth && "bg-zinc-50/30 dark:bg-zinc-900/30 text-muted-foreground/30",
                                    isSelected && "bg-indigo-50/40 dark:bg-indigo-900/10 shadow-inner"
                                )}
                                onClick={() => setSelectedDate(day)}
                            >
                                {/* Date Number */}
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                        isTodayDate 
                                            ? "bg-primary text-primary-foreground shadow-sm font-bold" 
                                            : (isSelected ? "text-primary font-bold" : "text-foreground")
                                    )}>
                                        {formatDayNumber(day)}
                                    </span>
                                    {/* Mobile Dot Indicator */}
                                    <div className="md:hidden flex gap-0.5 mt-1.5">
                                        {dayTasks.length > 0 && (
                                            <div className={cn("w-1.5 h-1.5 rounded-full", dayTasks[0].priority === 'High' ? 'bg-red-500' : 'bg-primary')} />
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Task Pills */}
                                <div className="hidden md:flex flex-col gap-1 mt-1 overflow-hidden">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <div 
                                            key={task.id}
                                            onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                            className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded border truncate font-medium flex items-center gap-1 hover:brightness-95 transition-all",
                                                getCategoryColor(task.tag)
                                            )}
                                        >
                                            {task.dueTime && <span className="opacity-75 font-mono text-[9px]">{task.dueTime}</span>}
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <span className="text-[10px] text-muted-foreground pl-1">
                                            + încă {dayTasks.length - 3}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Add Button on Hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <div className="bg-primary/10 text-primary p-2 rounded-full backdrop-blur-sm shadow-sm pointer-events-auto hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); onAddTask(dateKey); }}>
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SIDE AGENDA (Desktop Right / Mobile Bottom) */}
            <div className="w-full lg:w-80 border-l bg-card flex flex-col h-[40vh] lg:h-full shrink-0 shadow-xl z-20">
                <div className="p-4 border-b flex items-center justify-between bg-muted/10">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 capitalize">
                            {formatWeekdayName(selectedDate)}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {formatFullDate(selectedDate)}
                        </p>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAddTask(formatISODate(selectedDate))}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {selectedDayTasks.length > 0 ? selectedDayTasks.map(task => (
                        <Card 
                            key={task.id} 
                            className="group hover:shadow-md transition-all cursor-pointer border-l-4 overflow-hidden"
                            style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981' }}
                            onClick={() => onEditTask(task)}
                        >
                            <CardContent className="p-3 flex gap-3 items-start">
                                <div className="flex flex-col items-center min-w-[3rem] pt-0.5">
                                    <span className="text-sm font-bold text-foreground">{task.dueTime || "--:--"}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{task.dueTime ? (parseInt(task.dueTime) < 12 ? 'AM' : 'PM') : ''}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn("font-medium text-sm truncate", task.status === 'Done' && "line-through text-muted-foreground")}>{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn("text-[10px] px-1.5 rounded-full border", getCategoryColor(task.tag))}>
                                            {task.tag}
                                        </span>
                                        {task.status === 'Done' && <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5"><Clock className="w-3 h-3" /> Done</span>}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                                    <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                                </Button>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 py-10 opacity-60">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                                <Clock className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-center px-6">Niciun eveniment planificat pentru această zi.</p>
                            <Button variant="link" onClick={() => onAddTask(formatISODate(selectedDate))}>
                                Adaugă unul acum
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default CalendarView;
