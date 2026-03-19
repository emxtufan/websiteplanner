import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  memo,
  useCallback,
} from "react";
import {
  LayoutDashboard,
  Users,
  Utensils,
  Settings,
  Moon,
  Sun,
  LogOut,
  Armchair,
  Square,
  Circle,
  Wine,
  GripVertical,
  ChevronRight,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  UserPlus,
  Mail,
  Lock,
  ArrowRight,
  Home,
  Camera,
  Gift,
  Coffee,
  Plus,
  Minus,
  MoreHorizontal,
  LayoutGrid,
  CheckCircle2,
  Maximize,
  Save,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronLeft,
  Mic2,
  Layers,
  Speaker,
  Baby,
  AlertCircle,
  ClipboardList,
  Wallet,
  ShoppingBag,
  Palette,
  Eraser,
  UserCheck,
  Menu,
  Map,
  Star,
  Crown,
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  Calendar as CalendarIcon,
  Split,
  Trash2,
  PartyPopper,
  History,
  Heart,
  Type,
  Clock,
  Inbox,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  API_URL,
  FIXED_CANVAS_WIDTH,
  FIXED_CANVAS_HEIGHT,
  MARGIN_PX,
  INITIAL_TASKS,
  INITIAL_BUDGET_CATEGORIES,
  PLAN_LIMITS,
} from "../constants";
import {
  CanvasConfig,
  CanvasElement,
  ElementType,
  TableShape,
  UserSession,
  Guest,
  UserProfile,
  Task,
  BudgetCategory,
  GuestListEntry,
} from "../types";
import Button from "./ui/button";
import Input from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import AuthForm from "./AuthForm";
import DashboardStats from "./DashboardStats";
import SettingsView from "./SettingsView";
import HistoryView from "./HistoryView";
import TasksView from "./TasksView";
import BudgetView from "./BudgetView";
import GuestListView from "./GuestListView";
import InvitationMarketplace from "./InvitationMarketplace";
import ServicesMarketplace from "./ServicesMarketplace";
import ServiceRequests from "./ServiceRequests";
import BillingView from "./BillingView";
import Canvas from "./Canvas";
import CalendarView from "./CalendarView";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import UpgradeModal from "./UpgradeModal";
import { getTemplateMeta } from "./invitations/registry";

const initialPanX = MARGIN_PX;
const initialPanY = MARGIN_PX;

const MobileOverlay = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <div
    className={cn(
      "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
    )}
    onClick={onClose}
  />
);

// Grouped Navigation Structure
const navGroups = [
  [
    { id: "dashboard", label: "Panou Control", icon: LayoutDashboard },
    { id: "planner", label: "Planificator", icon: LayoutGrid },
  ],
  [
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "tasks", label: "Sarcini", icon: ClipboardList },
  ],
  [{ id: "budget", label: "Buget", icon: Wallet }],
  [
    { id: "guests", label: "Invitați", icon: Users },
   
    { id: "invitations", label: "Invitații", icon: Mail },
  ],
  [ { id: "services", label: "Servicii", icon: ShoppingBag },
    { id: "service-requests", label: "Cereri", icon: Inbox },
  ],
  [
    { id: "settings", label: "Setări", icon: Settings },
    { id: "history", label: "Istoric", icon: History },
  ],
];

// Flattened list helper for title finding
const allNavItems = navGroups.flat();

const GuestInput = memo(
  ({
    initialName,
    idx,
    allGuests,
    seatedGuestNames,
    onAssign,
    onManualChange,
    onFocus,
    onBlur,
    inputRef,
    elementType, // NEW PROP to identify table type
  }: any) => {
    const [value, setValue] = useState(initialName || "");
    const [suggestions, setSuggestions] = useState<GuestListEntry[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    // Sync state with props when parent updates
    useEffect(() => {
      setValue(initialName || "");
    }, [initialName]);

    const availableGuests = useMemo(() => {
      const currentNameNormalized = initialName
        ? initialName.trim().toLowerCase()
        : "";

      return allGuests.filter((g: GuestListEntry) => {
        const guestNameNormalized = g.name.trim().toLowerCase();
        if (
          currentNameNormalized &&
          currentNameNormalized.includes(guestNameNormalized)
        ) {
          return true;
        }
        return !seatedGuestNames.has(guestNameNormalized);
      });
    }, [allGuests, seatedGuestNames, initialName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setValue(text);

      // DISABLE SUGGESTIONS FOR PRESIDIUM
      if (elementType === ElementType.PRESIDIUM) {
        setSuggestions([]);
        return;
      }

      if (text.length > 0) {
        const lowerText = text.toLowerCase();
        const matches = availableGuests
          .filter((g: GuestListEntry) => {
            return g.name.toLowerCase().includes(lowerText);
          })
          .sort((a: GuestListEntry, b: GuestListEntry) => {
            const aConfirmed = a.status === "confirmed" ? 1 : 0;
            const bConfirmed = b.status === "confirmed" ? 1 : 0;
            return bConfirmed - aConfirmed;
          })
          .slice(0, 6);

        setSuggestions(matches);
      } else {
        setSuggestions([]);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (onFocus) onFocus();

      if (elementType === ElementType.PRESIDIUM) return;

      if (value.length === 0) {
        const confirmedOnly = availableGuests
          .filter((g: GuestListEntry) => g.status === "confirmed")
          .slice(0, 5);
        setSuggestions(confirmedOnly);
      } else {
        handleChange({ target: { value } } as any);
      }
    };

    const handleBlur = () => {
      // Delay slighty to allow click events on suggestions or the check button
      setTimeout(() => {
        setIsFocused(false);
        if (onBlur) onBlur();

        // STRICT REVERT LOGIC:
        // If the user clicks away without hitting the check button or a suggestion,
        // revert the input to the last saved state (initialName).
        // This effectively "clears" the input if it was a new entry that wasn't confirmed.
        setValue(initialName || "");
      }, 200);
    };

    const handleManualConfirm = () => {
      // Explicitly confirm the current text
      onManualChange(value);
      setSuggestions([]);
    };

    const handleManualRemove = () => {
      // Clear value and notify parent
      setValue("");
      onManualChange("");
      setSuggestions([]);
    };

    const isDirty = value !== (initialName || "") && value.trim().length > 0;
    const isAssigned = !!initialName && !isDirty; // Shows delete if assigned and not editing
    const isNewEntry = !initialName && value.length > 0; // True if adding a fresh person

    return (
      <div className="flex-1 relative flex items-center">
        <input
          ref={inputRef}
          className="w-full bg-transparent text-sm md:text-sm text-base border-b border-transparent focus:border-primary focus:outline-none placeholder:text-muted-foreground/50 py-1 font-medium transition-colors pr-8"
          placeholder={
            elementType === ElementType.PRESIDIUM
              ? "Rol (ex: Mire)..."
              : "Caută invitat..."
          }
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          name={`guest-input-${idx}-${Math.random()}`}
          data-lpignore="true"
        />

        {/* MINIMALIST ADD/SAVE BUTTON - Matching Delete Style */}
        {isDirty && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-muted/50 hover:bg-green-100 text-muted-foreground hover:text-green-600 rounded-md transition-colors animate-in zoom-in duration-200 z-10"
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent blur so click registers
              handleManualConfirm();
            }}
            title={isNewEntry ? "Adaugă" : "Salvează"}
          >
            {isNewEntry ? (
              <Plus className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* DELETE BUTTON - Only visible when assigned and NOT editing */}
        {isAssigned && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-muted/50 hover:bg-red-100 text-muted-foreground hover:text-red-600 rounded-md transition-colors animate-in zoom-in duration-200 z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              handleManualRemove();
            }}
            title="Eliberează Locul"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border shadow-xl rounded-md z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-[200px] overflow-y-auto">
            {suggestions.map((g) => (
              <div
                key={g._id}
                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm flex items-center justify-between border-b last:border-0 border-border/50"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
                onClick={(e) => {
                  e.stopPropagation();
                  setValue(g.name); // Optimistic UI
                  setSuggestions([]);
                  onAssign(g);
                }}
              >
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "font-medium flex items-center gap-1",
                      g.status === "confirmed"
                        ? "text-green-600 dark:text-green-400"
                        : "",
                    )}
                  >
                    {g.name}
                    {g.status === "confirmed" && (
                      <UserCheck className="w-3 h-3" />
                    )}
                  </span>
                  {g.rsvp?.message && (
                    <span className="text-[10px] text-muted-foreground italic truncate max-w-[140px]">
                      "{g.rsvp.message}"
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {g.status === "confirmed" ? (
                    <div className="flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> (
                      {g.rsvp?.confirmedCount || 1})
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {g.status === "opened" ? "Văzut" : "În așteptare"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

const DashboardApp = () => {
  const { toast } = useToast();

  // --- STATE ---
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("weddingPro_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<
    | "dashboard"
    | "planner"
    | "settings"
    | "tasks"
    | "budget"
    | "guests"
    | "invitations"
    | "billing"
    | "calendar"
    | "history"
    | "services"
    | "service-requests"
  >(() => {
    return (localStorage.getItem("weddingPro_view") as any) || "dashboard";
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightedGuestIdx, setHighlightedGuestIdx] = useState<number | null>(
    null,
  );
  const [placementMode, setPlacementMode] = useState<{
    type: ElementType;
    config: any;
  } | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("weddingPro_theme");
    return saved ? saved === "dark" : true; // default dark
  });
  // UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );

  const [config, setConfig] = useState<CanvasConfig>({
    scale: 1,
    panX: 0,
    panY: 0,
    width: FIXED_CANVAS_WIDTH,
    height: FIXED_CANVAS_HEIGHT,
    rotation: 0,
  });
  const [elements, setElements] = useState<CanvasElement[]>([]);

  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    INITIAL_BUDGET_CATEGORIES,
  );
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");

  const [allGuests, setAllGuests] = useState<GuestListEntry[]>([]);
  const guestInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarTaskDate, setCalendarTaskDate] = useState<string | undefined>(
    undefined,
  );
  const [calendarTaskEdit, setCalendarTaskEdit] = useState<Task | null>(null);

  const [isResetting, setIsResetting] = useState(false);

  // --- SETUP / ONBOARDING STATES ---
  const [setupEventType, setSetupEventType] = useState("wedding");
  const [setupDate, setSetupDate] = useState("");
  const [setupName, setSetupName] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);

  // --- ARCHIVED VIEW STATE ---
  const [viewingSnapshotId, setViewingSnapshotId] = useState<string | null>(
    null,
  );

  // --- CONFLICT DIALOG STATE ---
  const [conflictData, setConflictData] = useState<{
    guestEntry: GuestListEntry;
    currentTableId: string;
    currentTableStartIdx: number;
    nearestTable?: CanvasElement;
    needed: number;
    available: number;
  } | null>(null);

  const isPremium = session?.plan === "premium";
  // Event is active if NO active completion flag AND we are NOT viewing a read-only snapshot
  const isEventActive = !session?.isEventCompleted && !viewingSnapshotId;
  const activeLimits =
    session?.limits || (isPremium ? PLAN_LIMITS.premium : PLAN_LIMITS.free);
  const needsSetup =
    session && session.profile && !session.profile.isSetupComplete;

  // --- GLOBAL MODIFICATION CHECK ---
  const handleActionAttempt = useCallback(() => {
    if (!isEventActive) {
      // Only show modal if user is attempting action on active-but-expired event.
      // If viewing snapshot, maybe show a different toast?
      if (viewingSnapshotId) {
        toast({
          title: "Mod Vizualizare",
          description: "Aceasta este o arhivă Read-Only.",
          variant: "warning",
        });
      } else {
        setShowExpiredModal(true);
      }
      return false;
    }
    return true;
  }, [isEventActive, viewingSnapshotId]);

  // TITLU DINAMIC REACTIV
  const getDynamicTitle = useCallback(() => {
    const type = session?.profile?.eventType || "wedding";
    switch (type) {
      case "baptism":
        return "Botez Pro";
      case "anniversary":
        return "Aniversare Pro";
      case "kids":
        return "Kids Party Pro";
      default:
        return "WeddingPro";
    }
  }, [session?.profile?.eventType]);

  const seatedGuestNames = useMemo(() => {
    const names = new Set<string>();
    elements.forEach((el) => {
      if (el.guests) {
        el.guests.forEach((g) => {
          if (g && g.name) {
            const lowerName = g.name.trim().toLowerCase();
            names.add(lowerName);
            const groupMatch = lowerName.match(/^(.*?)\s\(\d+\)$/);
            if (groupMatch && groupMatch[1]) names.add(groupMatch[1]);
          }
        });
      }
    });
    return names;
  }, [elements]);

  const handleLogout = () => {
    localStorage.removeItem("weddingPro_session");
    setSession(null);
    setElements([]);
    setTasks(INITIAL_TASKS);
    setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
    toast({
      title: "Deconectat",
      description: "Te așteptăm să revii!",
      variant: "default",
    });
  };

  const handleSetupSubmit = async () => {
    if (!setupDate) {
      toast({
        title: "Dată lipsă",
        description: "Te rugăm să alegi data evenimentului.",
        variant: "destructive",
      });
      return;
    }
    setIsSettingUp(true);
    try {
      const res = await fetch(`${API_URL}/user/setup-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          eventType: setupEventType,
          weddingDate: setupDate,
          eventName: setupName.trim() || `Eveniment ${setupEventType}`,
        }),
      });

      if (res.ok) {
        const updatedSession = {
          ...session,
          profile: {
            ...session?.profile,
            isSetupComplete: true,
            eventType: setupEventType,
            weddingDate: setupDate,
            eventName: setupName.trim() || `Eveniment ${setupEventType}`,
          },
        };
        setSession(updatedSession as any);
        localStorage.setItem(
          "weddingPro_session",
          JSON.stringify(updatedSession),
        );
        toast({
          title: "Eveniment Creat!",
          description: "Spor la planificare!",
          variant: "success",
        });
      } else {
        toast({
          title: "Eroare",
          description: "Nu am putut crea evenimentul.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Eroare de conexiune", variant: "destructive" });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleArchiveAndReset = async () => {
    if (
      !confirm(
        "Ești sigur că vrei să arhivezi evenimentul curent și să începi unul nou? Datele vor fi salvate în istoric, dar planul tău va reveni la Free pentru noul eveniment.",
      )
    )
      return;

    setIsResetting(true);
    try {
      const res = await fetch(`${API_URL}/user/archive-event`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.token}` },
      });

      if (res.ok) {
        toast({
          title: "Eveniment Arhivat",
          description: "Puteți începe planificarea noului eveniment.",
          variant: "success",
        });
        // Force a full refresh to clear all states and re-fetch clean data
        window.location.reload();
      } else {
        toast({
          title: "Eroare",
          description: "Nu am putut arhiva evenimentul.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Eroare", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  // --- ARCHIVE VIEWER LOGIC ---
  const handleLoadSnapshot = async (snapshotId: string) => {
    if (!session?.token) return;
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/archived-event/${snapshotId}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error("Nu am putut încărca arhiva.");

      const data = await res.json();

      // Set UI to Snapshot Data
      setViewingSnapshotId(snapshotId);

      // Override active data states with snapshot data
      // Profile override (temporary, just for display)
      if (data.profile) {
        setSession((prev) => ({ ...prev!, profile: data.profile }));
      }
      // Project Data
      if (data.project) {
        setElements(data.project.elements || []);
        setTasks(data.project.tasks || []);
        setBudgetCategories(data.project.budget || []);
        setTotalBudget(data.project.totalBudget || 0);
        setSelectedTemplate(data.project.selectedTemplate || "classic");
      }
      // Guests
      if (data.guests) {
        setAllGuests(data.guests);
      }

      setView("dashboard");
      toast({
        title: "Mod Arhivă",
        description:
          "Vizualizezi un eveniment trecut. Modificările sunt dezactivate.",
        variant: "default",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Eroare",
        description: "Arhiva nu a putut fi încărcată.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExitSnapshot = () => {
    // Simple way to reset state: reload page.
    // Or refetch current active data. Reload is cleaner to ensure no state pollution.
    window.location.reload();
  };

  // Objects Menu Definition
  const objectsMenu = [
    {
      label: "Mese",
      items: [
        {
          label: "Rotundă",
          icon: Circle,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.TABLE,
                config: {
                  width: 130,
                  height: 130,
                  shape: TableShape.ROUND,
                  capacity: 10,
                  name: "Masă Rotundă",
                },
              });
          },
        },
        {
          label: "Dreptunghi",
          icon: Square,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.TABLE,
                config: {
                  width: 180,
                  height: 90,
                  shape: TableShape.RECT,
                  capacity: 10,
                  name: "Masă Lungă",
                },
              });
          },
        },
        {
          label: "Pătrată",
          icon: Square,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.TABLE,
                config: {
                  width: 110,
                  height: 110,
                  shape: TableShape.SQUARE,
                  capacity: 8,
                  name: "Masă Pătrată",
                },
              });
          },
        },
      ],
    },
    // ... (Rest of objectsMenu same as before) ...
    {
      label: "Zone",
      items: [
        {
          label: "Prezidiu",
          icon: Armchair,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.PRESIDIUM,
                config: {
                  width: 250,
                  height: 80,
                  shape: TableShape.RECT,
                  capacity: 4,
                  name: "Prezidiu",
                },
              });
          },
        },
        {
          label: "Ring Dans",
          icon: GripVertical,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DANCEFLOOR,
                config: {
                  width: 350,
                  height: 350,
                  name: "Ring Dans",
                  icon: GripVertical,
                },
              });
          },
        },
        {
          label: "Scenă",
          icon: Speaker,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.STAGE,
                config: { width: 300, height: 150, name: "Scenă" },
              });
          },
        },
      ],
    },
    {
      label: "Decor",
      items: [
        {
          label: "Candy Bar",
          icon: Utensils,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 120, height: 60, name: "Candy Bar" },
              });
          },
        },
        {
          label: "Photo Corner",
          icon: Camera,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 100, height: 100, name: "Photo Corner" },
              });
          },
        },
        {
          label: "Bar",
          icon: Wine,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 150, height: 80, name: "Bar" },
              });
          },
        },
        {
          label: "Lounge",
          icon: Coffee,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 120, height: 120, name: "Lounge" },
              });
          },
        },
        {
          label: "Cadouri",
          icon: Gift,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 80, height: 80, name: "Cadouri" },
              });
          },
        },
      ],
    },
    {
      label: "Structural",
      items: [
        {
          label: "Stâlp",
          icon: Circle,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 30, height: 30, name: "Stâlp" },
              });
          },
        },
        {
          label: "Perete",
          icon: Square,
          onClick: () => {
            if (handleActionAttempt())
              setPlacementMode({
                type: ElementType.DECOR,
                config: { width: 10, height: 200, name: "Perete" },
              });
          },
        },
        // { label: 'Sala', icon: Home, onClick: () => { if(handleActionAttempt()) setPlacementMode({ type: ElementType.ROOM, config: { width: 1000, height: 800, name: 'Sală' } }) } },
      ],
    },
  ];

  const refreshSession = async (overrideToken?: string) => {
    const tokenToUse = overrideToken || session?.token;
    if (!tokenToUse) return null;
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSession((prev) => {
          // Only update if NOT viewing snapshot to prevent overwriting read-only view
          if (viewingSnapshotId) return prev;
          const newSession = { ...prev, ...data };
          localStorage.setItem(
            "weddingPro_session",
            JSON.stringify(newSession),
          );
          return newSession;
        });
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // ... (Effects same as before, simplified) ...
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("payment") === "success") {
      toast({
        title: "Plată Înregistrată!",
        description: "Activăm contul Premium...",
        duration: 5000,
      });
      const verifyPremium = async () => {
        let attempts = 0;
        let updated = false;
        while (attempts < 6 && !updated) {
          const userData = await refreshSession();
          if (userData && userData.plan === "premium") {
            updated = true;
            toast({ title: "Cont Premium Activat!", variant: "success" });
            if (session?.userId && session?.token && !viewingSnapshotId)
              loadUserData(session.userId, session.token);
          } else await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        }
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      };
      verifyPremium();
    }
  }, [session?.userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // MAIN INITIALIZATION EFFECT
  useEffect(() => {
    const initData = async () => {
      let currentToken = session?.token;
      let currentUserId = session?.userId;

      // If no session in state, try localStorage
      if (!session) {
        const storedSession = localStorage.getItem("weddingPro_session");
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          currentToken = parsedSession.token;
          currentUserId = parsedSession.userId;
        }
      }

      if (currentToken && currentUserId && !viewingSnapshotId) {
        // Load project data
        loadUserData(currentUserId, currentToken);
        // Load guest list
        fetchGuestList(currentUserId, currentToken);
        // Refresh session to get latest Admin Configs (Price/Limits)
        await refreshSession(currentToken);
      }
    };

    initData();
  }, []); // Only runs once on mount

  useEffect(() => {
    localStorage.setItem("weddingPro_theme", isDarkMode ? "dark" : "light");
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("weddingPro_view", view);
  }, [view]);

  // ... (loadUserData, fetchGuestList same as before) ...
  const fetchGuestList = async (userId: string, token: string) => {
    try {
      const res = await fetch(`${API_URL}/guests/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAllGuests(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const loadUserData = async (userId: string, token: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`${API_URL}/project/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.elements) {
        setElements(data.elements);
        localStorage.setItem(
          "weddingPro_localBackup",
          JSON.stringify(data.elements),
        );
      } else {
        const local = localStorage.getItem("weddingPro_localBackup");
        if (local) setElements(JSON.parse(local));
        else setElements([]);
      }

      if (data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
      } else {
        setTasks(INITIAL_TASKS);
      }

      if (data.budget) setBudgetCategories(data.budget);
      if (data.totalBudget) setTotalBudget(data.totalBudget);
      if (data.selectedTemplate) setSelectedTemplate(data.selectedTemplate);

      // ── Always refresh profile from server to get latest blocks ──────────
      // This ensures default blocks injected server-side are picked up
      await refreshSession(token);

    } catch (e) {
      console.error(e);
      setTasks(INITIAL_TASKS);
      setBudgetCategories(INITIAL_BUDGET_CATEGORIES);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem("weddingPro_session", JSON.stringify(newSession));
    if (newSession.token) {
      loadUserData(newSession.userId, newSession.token);
      fetchGuestList(newSession.userId, newSession.token);
      refreshSession(newSession.token);
    }
  };

  // ACTUALIZARE PROFIL (SETTINGS) CU PERSISTENȚĂ FIXATĂ
  const handleUpdateProfile = useCallback(async (newProfile: UserProfile) => {
    if (!session?.token) return;

    // Strip base64 imageData before storing in localStorage (photos live on server)
    const profileForStorage = (() => {
      const p = { ...newProfile };
      if (p.customSections) {
        try {
          const blocks = JSON.parse(p.customSections);
          const clean  = blocks.map((b: any) => {
            if (b.type === 'photo' && b.imageData?.startsWith('data:')) {
              const { imageData, ...rest } = b;
              return rest;
            }
            return b;
          });
          p.customSections = JSON.stringify(clean);
        } catch { /* leave as-is */ }
      }
      return p;
    })();

    // Optimistic UI Update (IMPORTANT: SettingsView relies on this to not lag)
    const updatedSession = { ...session, profile: profileForStorage };
    setSession(updatedSession);
    localStorage.setItem("weddingPro_session", JSON.stringify(updatedSession));

    setSaveStatus("unsaved");
  }, [session]);

  const handleUpgradeSuccess = (payments?: any[]) => {
    if (!session) return;
    const newSession = {
      ...session,
      plan: "premium",
      limits: PLAN_LIMITS.premium,
      payments: payments || session.payments,
    } as UserSession;
    setSession(newSession);
    localStorage.setItem("weddingPro_session", JSON.stringify(newSession));
    toast({ title: "Felicitări! Ești Premium!", variant: "success" });
  };

  useEffect(() => {
    localStorage.setItem("weddingPro_localBackup", JSON.stringify(elements));
  }, [elements]);

  // MAIN AUTO-SAVE LOOP: Now includes session.profile
  useEffect(() => {
    if (!session || !session.token || isLoadingData) return;
    // Don't auto-save if event is completed/read-only OR if viewing a snapshot
    if (!isEventActive || viewingSnapshotId) return;

    setSaveStatus("unsaved");
    const timeoutId = setTimeout(() => saveProjectToBackend(false), 1500);
    return () => clearTimeout(timeoutId);
  }, [
    elements,
    tasks,
    budgetCategories,
    totalBudget,
    selectedTemplate,
    session?.profile,
  ]);

  const saveProjectToBackend = async (isManual = true) => {
    if (!session?.token || !session.profile) return;

    // Final guard against saving in read-only mode
    if (!isEventActive || viewingSnapshotId) {
      return;
    }

    if (isManual) setIsSaveModalOpen(true);
    setSaveStatus("saving");
    try {
      // Save Project Data
      const resProject = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          elements,
          tasks,
          budget: budgetCategories,
          totalBudget,
          selectedTemplate,
        }),
      });

      // Save Profile Data (Settings) simultaneously
      // Strip base64 imageData from blocks — photos are stored on server as /uploads/...
      const profileToSave = (() => {
        const p = { ...session.profile };
        if (p.customSections) {
          try {
            const blocks = JSON.parse(p.customSections);
            const clean  = blocks.map((b: any) => {
              if (b.type === 'photo' && b.imageData && b.imageData.startsWith('data:')) {
                // base64 not yet uploaded — drop it rather than crash the server
                const { imageData, ...rest } = b;
                return rest;
              }
              return b;
            });
            p.customSections = JSON.stringify(clean);
          } catch { /* leave as-is */ }
        }
        return p;
      })();

      const resProfile = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ profile: profileToSave }),
      });

      if (!resProject.ok || !resProfile.ok) {
        setSaveStatus("unsaved");
        if (isManual) setIsSaveModalOpen(false);
        return;
      }

      setSaveStatus("saved");
      if (isManual) setTimeout(() => setIsSaveModalOpen(false), 1500);
    } catch (err) {
      setSaveStatus("unsaved");
      if (isManual) setIsSaveModalOpen(false);
    }
  };

  // ... (Scrolling/Focus effects same as before) ...
  useEffect(() => {
    if (selectedId && highlightedGuestIdx !== null) {
      setTimeout(() => {
        const el = guestInputRefs.current[highlightedGuestIdx];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (window.innerWidth >= 768) el.focus();
        }
      }, 350);
    }
  }, [selectedId, highlightedGuestIdx]);

  // ... (Table logic: handlePlace, handleDelete, etc. same as before, wrapped in handleActionAttempt) ...
  const handlePlace = (x: number, y: number) => {
    if (!handleActionAttempt()) return;
    if (!placementMode) return;
    if (!isPremium && elements.length >= activeLimits.maxElements) {
      setShowUpgradeModal(true);
      setPlacementMode(null);
      return;
    }
    const newEl: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: placementMode.type,
      x: x - placementMode.config.width / 2,
      y: y - placementMode.config.height / 2,
      width: placementMode.config.width,
      height: placementMode.config.height,
      rotation: 0,
      name: placementMode.config.name,
      capacity: placementMode.config.capacity,
      guests: placementMode.config.capacity
        ? Array(placementMode.config.capacity).fill(null)
        : undefined,
      shape: placementMode.config.shape,
      isStaff: placementMode.config.isStaff,
      icon: placementMode.config.icon,
    };
    setElements((prev) => [...prev, newEl]);
    setPlacementMode(null);
    toast({ title: "Element adăugat" });
  };

  const handleDelete = (id: string) => {
    if (!handleActionAttempt()) return;
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({ title: "Element șters" });
  };

  const handleClearCanvas = () => {
    if (!handleActionAttempt()) return;
    setElements([]);
    setSelectedId(null);
    toast({ title: "Canvas Resetat" });
  };

  const handleUpdateCapacity = (id: string, delta: number) => {
    if (!handleActionAttempt()) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== id || !el.capacity) return el;
        const newCap = Math.max(1, el.capacity + delta);
        const newGuests = [...(el.guests || [])];
        if (delta > 0) newGuests.push(null);
        else newGuests.pop();
        return { ...el, capacity: newCap, guests: newGuests };
      }),
    );
  };

  // ... (placeGuestOnTable, handleAssignGroup, resolveConflict, handleManualNameCommit, handleGuestDetailChange, handleMoveGuest - ALL WRAPPED WITH handleActionAttempt() same as before) ...
  // Note: I'm omitting re-pasting the full functions to save space if logic hasn't changed besides wrapper check,
  // but in full XML I will include them to ensure correctness.

  const placeGuestOnTable = (
    targetTableId: string,
    startIdx: number,
    guestEntry: GuestListEntry,
    countToPlace: number,
    groupOffset: number = 0,
  ) => {
    const message = guestEntry.rsvp?.message;
    const totalInGroup = countToPlace;

    const adultsCount =
      guestEntry.rsvp?.adultsCount !== undefined
        ? guestEntry.rsvp.adultsCount
        : guestEntry.rsvp?.confirmedCount || 1;

    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== targetTableId || !el.guests) return el;

        let newGuests = [...el.guests];
        const capacity = newGuests.length;
        const isPresidium = el.type === ElementType.PRESIDIUM;

        const openSeatAt = (targetIdx: number) => {
          if (isPresidium) return;

          if (newGuests[targetIdx] === null) return;
          let ptr = targetIdx;
          let steps = 0;
          while (newGuests[ptr] !== null && steps < capacity) {
            ptr = (ptr + 1) % capacity;
            steps++;
          }
          if (newGuests[ptr] === null) {
            let curr = ptr;
            while (curr !== targetIdx) {
              const prevIdx = (curr - 1 + capacity) % capacity;
              newGuests[curr] = newGuests[prevIdx];
              curr = prevIdx;
            }
          }
        };

        for (let i = 0; i < countToPlace; i++) {
          const currentSeatIdx = (startIdx + i) % capacity;
          if (newGuests[currentSeatIdx] !== null) openSeatAt(currentSeatIdx);

          const absoluteMemberIdx = groupOffset + i;
          const isChild = absoluteMemberIdx >= adultsCount;

          newGuests[currentSeatIdx] = {
            id: Math.random().toString(36).substr(2, 9),
            name:
              (guestEntry.rsvp?.confirmedCount || 1) > 1
                ? `${guestEntry.name} (${absoluteMemberIdx + 1})`
                : guestEntry.name,
            menuType: isChild ? "kids" : "standard",
            isChild: isChild,
            allergies:
              absoluteMemberIdx === 0 && message ? `Msg: ${message}` : "",
          };
        }
        return { ...el, guests: newGuests };
      }),
    );
  };

  const handleAssignGroup = (
    elId: string,
    startIdx: number,
    guestEntry: GuestListEntry,
  ) => {
    if (!handleActionAttempt()) return;
    const confirmedCount = guestEntry.rsvp?.confirmedCount || 1;
    const currentTable = elements.find((el) => el.id === elId);
    if (!currentTable || !currentTable.guests) return;

    const emptySlots = currentTable.guests.filter((g) => g === null).length;

    // CONFLICT DETECTION
    if (confirmedCount > emptySlots) {
      const availableTables = elements
        .filter(
          (el) =>
            el.id !== elId &&
            (el.type === ElementType.TABLE ||
              el.type === ElementType.PRESIDIUM) &&
            !el.isStaff &&
            (el.guests?.filter((g) => g === null).length || 0) > 0,
        )
        .map((el) => {
          const dx =
            el.x + el.width / 2 - (currentTable.x + currentTable.width / 2);
          const dy =
            el.y + el.height / 2 - (currentTable.y + currentTable.height / 2);
          return { ...el, distance: Math.sqrt(dx * dx + dy * dy) };
        })
        .sort((a, b) => a.distance - b.distance);

      setConflictData({
        guestEntry,
        currentTableId: elId,
        currentTableStartIdx: startIdx,
        nearestTable: availableTables[0],
        needed: confirmedCount,
        available: emptySlots,
      });
      return;
    }

    placeGuestOnTable(elId, startIdx, guestEntry, confirmedCount, 0);
    toast({ title: "Grup Adăugat", variant: "success" });
  };

  const resolveConflict = (action: "move_all" | "split") => {
    if (!handleActionAttempt()) return;
    if (!conflictData) return;
    const {
      guestEntry,
      currentTableId,
      currentTableStartIdx,
      nearestTable,
      needed,
      available,
    } = conflictData;

    if (action === "move_all") {
      if (!nearestTable) {
        toast({
          title: "Eroare",
          description: "Nu există alte mese disponibile.",
          variant: "destructive",
        });
        return;
      }
      const targetIdx = nearestTable.guests?.indexOf(null) ?? 0;
      placeGuestOnTable(nearestTable.id, targetIdx, guestEntry, needed, 0);
      toast({
        title: "Grup Mutat",
        description: `Tot grupul a fost așezat la ${nearestTable.name}.`,
        variant: "default",
      });
    } else if (action === "split") {
      placeGuestOnTable(
        currentTableId,
        currentTableStartIdx,
        guestEntry,
        available,
        0,
      );
      const remaining = needed - available;
      if (nearestTable && remaining > 0) {
        const targetIdx = nearestTable.guests?.indexOf(null) ?? 0;
        placeGuestOnTable(
          nearestTable.id,
          targetIdx,
          guestEntry,
          remaining,
          available,
        );
        toast({
          title: "Grup Împărțit",
          description: `${available} aici, ${remaining} la ${nearestTable.name}.`,
          variant: "success",
        });
      } else {
        toast({
          title: "Grup Împărțit",
          description: `${available} așezați. ${remaining} au rămas pe dinafară (fără locuri).`,
          variant: "warning",
        });
      }
    }
    setConflictData(null);
  };

  const handleManualNameCommit = (elId: string, idx: number, name: string) => {
    if (!handleActionAttempt()) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== elId || !el.guests) return el;
        const newGuests = [...el.guests];
        if (name.trim() === "") newGuests[idx] = null;
        else
          newGuests[idx] = newGuests[idx]
            ? { ...newGuests[idx]!, name }
            : {
                id: Math.random().toString(),
                name,
                menuType: "standard",
                isChild: false,
                allergies: "",
              };
        return { ...el, guests: newGuests };
      }),
    );
  };

  const handleGuestDetailChange = (
    elId: string,
    idx: number,
    field: keyof Guest,
    value: any,
  ) => {
    if (!handleActionAttempt()) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id !== elId || !el.guests) return el;
        const newGuests = [...el.guests];
        if (newGuests[idx])
          newGuests[idx] = { ...newGuests[idx]!, [field]: value };
        return { ...el, guests: newGuests };
      }),
    );
  };

  const handleMoveGuest = (
    fromElId: string,
    fromIdx: number,
    toElId: string,
  ) => {
    if (!handleActionAttempt()) return;
    setElements((prev) => {
      const sourceEl = prev.find((e) => e.id === fromElId);
      const targetEl = prev.find((e) => e.id === toElId);
      if (!sourceEl || !targetEl || !sourceEl.guests || !targetEl.guests)
        return prev;
      const guestObj = sourceEl.guests[fromIdx];
      if (!guestObj) return prev;
      const newSourceGuests = [...sourceEl.guests];
      newSourceGuests[fromIdx] = null;
      const emptyIdx = targetEl.guests.indexOf(null);
      if (emptyIdx === -1) return prev;
      const newTargetGuests = [...targetEl.guests];
      newTargetGuests[emptyIdx] = guestObj;
      return prev.map((el) => {
        if (el.id === fromElId) return { ...el, guests: newSourceGuests };
        if (el.id === toElId) return { ...el, guests: newTargetGuests };
        return el;
      });
    });
  };

  if (!session) return <AuthForm onLogin={handleLogin} />;
  if (isLoadingData)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const selectedEl = isRightSidebarOpen ? elements.find((e) => e.id === selectedId) : null;

  const dynamicTitle = getDynamicTitle();

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden font-sans">
      <MobileOverlay
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* MANDATORY SETUP DIALOG */}
      {needsSetup && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            {/* ... (Same setup form) ... */}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shadow-inner">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Bine ai venit! 👋
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Hai să configurăm primul tău eveniment.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Numele Evenimentului
                </label>
                <Input
                  type="text"
                  className="h-11"
                  placeholder="ex: Nunta Mariei & Ion"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Tipul Evenimentului
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["wedding", "baptism", "anniversary", "kids"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSetupEventType(type)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all",
                        setupEventType === type
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                          : "border-input bg-background hover:bg-accent",
                      )}
                    >
                      {type === "wedding" && <Heart className="w-4 h-4" />}
                      {type === "baptism" && <Baby className="w-4 h-4" />}
                      {type === "anniversary" && (
                        <PartyPopper className="w-4 h-4" />
                      )}
                      {type === "kids" && <Gift className="w-4 h-4" />}
                      <span className="capitalize">
                        {type === "wedding"
                          ? "Nuntă"
                          : type === "baptism"
                            ? "Botez"
                            : type === "anniversary"
                              ? "Aniversare"
                              : "Copii"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Data Evenimentului
                </label>
                <Input
                  type="date"
                  className="h-11"
                  value={setupDate}
                  onChange={(e) => setSetupDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Atenție: Evenimentul se
                  finalizează automat la 24 de ore după această dată.
                </p>
              </div>
              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handleSetupSubmit}
                disabled={!setupDate || isSettingUp}
              >
                {isSettingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Creează Evenimentul"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EVENT EXPIRED MODAL */}
      <Dialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-amber-700">
              Eveniment Expirat
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Acest eveniment a avut loc deja și a trecut în modul "Read Only"
              (Offline).
              <br />
              Nu mai poți face modificări asupra datelor.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                setShowExpiredModal(false);
                setView("history");
              }}
            >
              Mergi la Istoric & Arhivare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={session.userId}
        userEmail={session.profile?.email || session.user}
        onUpgradeSuccess={handleUpgradeSuccess}
        premiumPrice={session.premiumPrice}
        oldPrice={session.pricing?.oldPrice}
      />

      {/* ARCHIVED VIEW BANNER (Read Only Mode) */}
      {viewingSnapshotId && (
        <div className="absolute top-0 left-0 right-0 h-16 bg-blue-600 z-[100] flex items-center justify-between px-6 shadow-md animate-in slide-in-from-top-full">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-full">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Mod Vizualizare Arhivă</h3>
              <p className="text-xs opacity-90">
                Ești în modul Read-Only. Modificările nu sunt salvate.
              </p>
            </div>
          </div>
          <Button
            onClick={handleExitSnapshot}
            className="bg-white text-blue-600 hover:bg-white/90 border-none shadow-sm"
          >
            Ieși din Arhivă
          </Button>
        </div>
      )}

      {/* EVENT COMPLETED BANNER (For Active but Expired Events) */}
      {!isEventActive && !needsSetup && !viewingSnapshotId && (
        <div className="absolute top-0 left-0 right-0 h-16 bg-amber-100 dark:bg-amber-900/30 z-[100] flex items-center justify-between px-6 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="p-2 bg-amber-200 dark:bg-amber-800/50 rounded-full">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Eveniment Finalizat (Offline)
              </h3>
              <p className="text-xs opacity-90">
                Mod "Read-Only". Arhivează pentru a începe unul nou.
              </p>
            </div>
          </div>
          <Button
            onClick={handleArchiveAndReset}
            className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-md"
            disabled={isResetting}
          >
            {isResetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Arhivează & Eveniment Nou"
            )}
          </Button>
        </div>
      )}

      {/* ... (Conflict Dialog & Save Dialog same as before) ... */}
      <Dialog
        open={!!conflictData}
        onOpenChange={(open) => !open && setConflictData(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" /> Capacitate Insuficientă
            </DialogTitle>
            <DialogDescription className="pt-2">
              Grupul <strong>{conflictData?.guestEntry.name}</strong> are{" "}
              <strong>{conflictData?.needed}</strong> persoane, dar la această
              masă mai sunt doar <strong>{conflictData?.available}</strong>{" "}
              locuri libere.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
                !conflictData?.nearestTable && "opacity-50 cursor-not-allowed",
              )}
              onClick={() =>
                conflictData?.nearestTable && resolveConflict("move_all")
              }
            >
              <div className="flex flex-col">
                <span className="font-semibold flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-500" /> Mută tot
                  grupul
                </span>
                <span className="text-xs text-muted-foreground">
                  Găsește loc la{" "}
                  <strong>{conflictData?.nearestTable?.name || "..."}</strong>{" "}
                  (cea mai apropiată).
                </span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={!conflictData?.nearestTable}
              >
                Selectează
              </Button>
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
              onClick={() => resolveConflict("split")}
            >
              <div className="flex flex-col">
                <span className="font-semibold flex items-center gap-2">
                  <Split className="w-4 h-4 text-orange-500" /> Împarte grupul
                </span>
                <span className="text-xs text-muted-foreground">
                  Umple masa curentă ({conflictData?.available} pers), restul{" "}
                  {conflictData?.nearestTable
                    ? `la ${conflictData.nearestTable.name}`
                    : "în așteptare"}
                  .
                </span>
              </div>
              <Button size="sm" variant="secondary">
                Selectează
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConflictData(null)}>
              Anulează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-[300px] flex flex-col items-center justify-center p-6 text-center focus:outline-none">
          {saveStatus === "saving" ? (
            <>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <h3 className="font-semibold text-lg">Se salvează...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sincronizăm datele cu serverul.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400 animate-in zoom-in">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-lg">Salvat cu succes!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Toate modificările au fost înregistrate.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={calendarModalOpen}
        onOpenChange={(open) => {
          setCalendarModalOpen(open);
          if (!open) {
            setCalendarTaskDate(undefined);
            setCalendarTaskEdit(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {calendarTaskEdit ? "Editează Sarcina" : "Adaugă Sarcină"}
            </DialogTitle>
            <DialogDescription>
              Adaugă detalii în calendar. Salvarea se face automat în lista de
              sarcini.
            </DialogDescription>
          </DialogHeader>
          {isEventActive ? (
            <TasksView
              tasks={tasks}
              setTasks={setTasks}
              isPremium={isPremium}
              onShowUpgrade={() => setShowUpgradeModal(true)}
              variant="form"
              externalTaskDate={calendarTaskDate}
              externalTaskToEdit={calendarTaskEdit}
              onCloseExternalModal={() => {
                setCalendarModalOpen(false);
                setCalendarTaskDate(undefined);
                setCalendarTaskEdit(null);
              }}
              onCheckActive={handleActionAttempt}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Eveniment finalizat. Nu se pot adăuga sarcini noi.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <aside
        className={cn(
          "border-r bg-white dark:bg-zinc-950 flex flex-col z-50 fixed inset-y-0 left-0 md:relative",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-[70px]" : "md:w-64",
          "w-64",
          (!isEventActive && !needsSetup) || viewingSnapshotId
            ? "mt-16 h-[calc(100%-4rem)]"
            : "",
        )}
      >
        <div
          className={cn(
            "h-16 flex items-center border-b",
            isCollapsed ? "justify-center px-0" : "justify-between px-4",
          )}
        >
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <span
              className={cn(
                "font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden",
                isCollapsed
                  ? "w-0 opacity-0 ml-0"
                  : "w-auto max-w-[200px] opacity-100 ml-3",
              )}
            >
              {dynamicTitle}
            </span>
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-8 w-8 text-muted-foreground shrink-0"
              onClick={() => setIsCollapsed(true)}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1 relative">
              {groupIdx > 0 && (
                <div
                  className={cn(
                    "my-2 mx-2 border-t border-border/60",
                    isCollapsed && "mx-1",
                  )}
                />
              )}

              {group.map((item) => (
                <Button
                  key={item.id}
                  variant={view === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full mb-1 group overflow-hidden",
                    isCollapsed
                      ? "justify-center px-2"
                      : "justify-start px-4 gap-3",
                    view === item.id
                      ? "bg-white dark:bg-zinc-800 font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => {
                    setView(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span
                    className={cn(
                      "whitespace-nowrap overflow-hidden",
                      isCollapsed
                        ? "max-w-0 opacity-0 translate-x-[-10px]"
                        : "max-w-[200px] opacity-100 translate-x-0",
                    )}
                  >
                    {item.label}
                  </span>
                </Button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 p-2 mt-auto border-t bg-background">
          {/* ... (Upgrade Banner & User Menu same as before) ... */}
          {!isPremium &&
            !isCollapsed &&
            showUpgradeBanner &&
            isEventActive &&
            !viewingSnapshotId && (
              <div className="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm mb-3 py-0 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 relative group">
                <div className="p-4 relative">
                  <button
                    onClick={() => setShowUpgradeBanner(false)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md flex items-center justify-center text-muted-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Close notification</span>
                  </button>
                  <div className="pr-6">
                    <h3 className="flex items-center gap-3 font-semibold text-neutral-900 dark:text-neutral-100 mb-2 mt-1 text-sm">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                        <Sparkles className="w-4 h-4 fill-current" />
                      </div>{" "}
                      Upgrade to Pro
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-neutral-400 leading-relaxed mb-3">
                      Deblochează funcții nelimitate și teme exclusive.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm transition-all hover:bg-accent hover:text-accent-foreground outline-none ring-offset-background focus-visible:ring-2",
                isUserMenuOpen && "bg-accent",
                isCollapsed ? "justify-center" : "justify-start",
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg border">
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                  {session.user.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session.user}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {isPremium ? "Premium Plan" : "Free Plan"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </>
              )}
            </button>
            {isUserMenuOpen && !isCollapsed && (
              <div className="absolute bottom-full left-0 mb-2 w-full min-w-[240px] rounded-lg border bg-popover text-popover-foreground shadow-lg z-50 animate-in slide-in-from-bottom-2 fade-in zoom-in-95">
                <div className="p-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-left">
                    <Avatar className="h-8 w-8 rounded-lg border">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                        {session.user.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session.profile?.firstName || session.user}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session.profile?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-border my-1" />
                {!isPremium && isEventActive && !viewingSnapshotId && (
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowUpgradeModal(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Upgrade to Pro
                    </button>
                  </div>
                )}
                <div className="h-px bg-border my-1" />
                <div className="p-1">
                  <button
                    onClick={() => {
                      setView("settings");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <BadgeCheck className="w-4 h-4 mr-2" /> Account
                  </button>
                  <button
                    onClick={() => {
                      setView("billing");
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-2" /> Billing
                  </button>
                  <button
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 mr-2" />
                    ) : (
                      <Moon className="w-4 h-4 mr-2" />
                    )}{" "}
                    Switch to {isDarkMode ? "Light" : "Dark"}
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Bell className="w-4 h-4 mr-2" /> Notifications
                  </button>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main
        className={cn(
          "flex-1 flex flex-col min-w-0 h-full bg-background relative overflow-hidden",
          (!isEventActive && !needsSetup) || viewingSnapshotId
            ? "mt-16 h-[calc(100%-4rem)]"
            : "",
        )}
      >
        {/* ... (Header same as before) ... */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-8 bg-background shrink-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2"
              onClick={() => {
                setIsMobileMenuOpen(true);
                setIsRightSidebarOpen(false);
              }}
            >
              <Menu className="w-5 h-5" />
            </Button>
            {isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex -ml-2 text-muted-foreground"
                onClick={() => setIsCollapsed(false)}
              >
                <PanelLeftOpen className="w-5 h-5" />
              </Button>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Dashboard
              </span>
              <span className="text-base md:text-lg font-bold capitalize leading-none truncate max-w-[120px] md:max-w-none">
                {allNavItems.find((i) => i.id === view)?.label || view}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex items-center text-xs text-muted-foreground mr-2 gap-2 bg-muted/30 px-3 py-1.5 rounded-full border">
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Salvat
                </>
              )}
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Se salvează...
                </>
              )}
              {saveStatus === "unsaved" && (
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => saveProjectToBackend(true)}
                >
                  Nesalvat
                </span>
              )}
            </div>
            <Button
              onClick={() => saveProjectToBackend(true)}
              size="sm"
              className="flex items-center gap-2"
              disabled={!isEventActive}
            >
              <Save className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Salvează</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          {/* Updated HistoryView Prop */}
          {view === "dashboard" ? (
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <DashboardStats
                elements={elements}
                tasks={tasks}
                guests={allGuests}
                weddingDate={session.profile?.weddingDate}
                budgetCategories={budgetCategories}
                totalBudget={totalBudget}
                onViewBudget={() => setView("budget")}
              />
            </div>
          ) : view === "settings" ? (
            <SettingsView
              session={session}
              onUpdateProfile={handleUpdateProfile}
              selectedTemplate={selectedTemplate}
              templateMeta={getTemplateMeta(selectedTemplate)}
              onCheckActive={handleActionAttempt}
            />
          ) : view === "history" ? (
            <HistoryView
              session={session}
              onViewEvent={() => setView("dashboard")}
              onLoadSnapshot={handleLoadSnapshot}
            />
          ) : view === "tasks" ? (
            <TasksView
              tasks={tasks}
              setTasks={setTasks}
              isPremium={isPremium}
              onShowUpgrade={() => setShowUpgradeModal(true)}
              onCheckActive={handleActionAttempt}
            />
          ) : view === "calendar" ? (
            <CalendarView
              tasks={tasks}
              onAddTask={(date) => {
                if (handleActionAttempt()) {
                  setCalendarTaskDate(date);
                  setCalendarTaskEdit(null);
                  setCalendarModalOpen(true);
                }
              }}
              onEditTask={(task) => {
                if (handleActionAttempt()) {
                  setCalendarTaskEdit(task);
                  setCalendarTaskDate(undefined);
                  setCalendarModalOpen(true);
                }
              }}
            />
          ) : view === "budget" ? (
            <BudgetView
              categories={budgetCategories}
              setCategories={setBudgetCategories}
              totalBudget={totalBudget}
              setTotalBudget={setTotalBudget}
              isPremium={isPremium}
              onShowUpgrade={() => setShowUpgradeModal(true)}
              maxCalculatorBudget={activeLimits?.maxCalculatorBudget}
              onCheckActive={handleActionAttempt}
              isEventActive={isEventActive}
            />
          ) : view === "guests" ? (
            <GuestListView
              session={session}
              isPremium={isPremium}
              onShowUpgrade={() => setShowUpgradeModal(true)}
              onNavigateToSettings={() => setView("settings")}
              onCheckActive={handleActionAttempt}
              isEventActive={isEventActive}
              snapshotGuests={!isEventActive ? allGuests : undefined}
            />
          ) : view === "services" ? (
            <ServicesMarketplace session={session} />
          ) : view === "service-requests" ? (
            <ServiceRequests session={session} />
          ) : view === "invitations" ? (
            <InvitationMarketplace
              selectedTemplate={selectedTemplate}
              onSelectTemplate={(id) => {
                if (handleActionAttempt()) setSelectedTemplate(id);
              }}
              eventType={session.profile?.eventType || 'wedding'}
            />
          ) : view === "billing" ? (
            <BillingView
              session={session}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          ) : (
            <div className="flex-1 flex relative h-full min-h-0">
              {/* ... (Canvas layout same as before, simplified for space) ... */}
              <div
                className={cn(
                  "bg-white dark:bg-zinc-950 flex flex-col transition-all duration-300 ease-in-out z-40 relative h-full border-r",
                  isLibraryOpen ? "w-64" : "w-0 border-r-0",
                )}
              >
                <button
                  onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 h-12 w-5 bg-background border border-l-0 rounded-r-md shadow-md flex items-center justify-center hover:bg-accent transition-all z-50 text-muted-foreground hover:text-primary focus:outline-none"
                  style={{ pointerEvents: "auto" }}
                  title={isLibraryOpen ? "Ascunde Meniul" : "Arată Meniul"}
                >
                  {isLibraryOpen ? (
                    <ChevronLeft className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                <div className="flex flex-col h-full overflow-hidden ">
                  <div
                    className={cn(
                      "flex-1 overflow-y-auto p-2 space-y-4 scrollbar-hide",
                      !isEventActive && "opacity-50 pointer-events-none",
                    )}
                  >
                    {objectsMenu.map((section, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 truncate">
                          {section.label}
                        </h4>
                        <div className="grid gap-2 grid-cols-2">
                          {section.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center justify-center rounded-md border bg-background hover:border-primary/50 hover:bg-accent cursor-pointer transition-all text-center group relative p-3 gap-2 h-24"
                              onClick={item.onClick}
                            >
                              <item.icon className="stroke-[1.5] transition-all w-6 h-6" />
                              <span className="text-[10px] font-medium leading-tight">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                        {idx < objectsMenu.length - 1 && (
                          <div className="h-px bg-border w-8 mx-auto my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-t bg-background transition-all overflow-hidden p-4">
                    {placementMode ? (
                      <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Plasează:{" "}
                          {placementMode.config.name}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPlacementMode(null)}
                          className="w-full h-8 text-xs"
                        >
                          Anulează
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground">
                        Selectează un obiect
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 relative bg-zinc-100 dark:bg-zinc-950 overflow-hidden h-full">
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <Card className="p-1 flex items-center gap-1 shadow-md bg-background/90 backdrop-blur">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          scale: Math.min(prev.scale + 0.1, 3),
                        }))
                      }
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          scale: Math.max(prev.scale - 0.1, 0.2),
                        }))
                      }
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          scale: 1,
                          panX: initialPanX,
                          panY: initialPanY,
                        }))
                      }
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!isEventActive}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Eraser className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Ștergi Tot Planul?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Această acțiune este ireversibilă.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={handleClearCanvas}
                          >
                            Șterge Tot
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      variant={isRightSidebarOpen ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8 ml-1"
                      onClick={() => {
                        setIsRightSidebarOpen(!isRightSidebarOpen);
                        if (!isRightSidebarOpen) setIsMobileMenuOpen(false);
                      }}
                    >
                      {isRightSidebarOpen ? (
                        <PanelRightClose className="w-4 h-4" />
                      ) : (
                        <PanelRightOpen className="w-4 h-4" />
                      )}
                    </Button>
                  </Card>
                </div>
                <Canvas
                  elements={elements}
                  setElements={setElements}
                  config={config}
                  setConfig={setConfig}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  placementMode={placementMode}
                  onPlace={handlePlace}
                  onDelete={handleDelete}
                  onSeatClick={(elId, idx) => {
                    setSelectedId(elId);
                    setIsRightSidebarOpen(true);
                    setIsMobileMenuOpen(false);
                    setHighlightedGuestIdx(idx);
                    
                  }}
                  
                  onMoveGuest={handleMoveGuest}
                  onUpdateCapacity={handleUpdateCapacity}
                  lang="ro"
                />
              </div>
              <div
                className={cn(
                  "absolute top-0 right-0 bottom-0 z-[60] bg-white dark:bg-zinc-950 border-l shadow-xl flex flex-col transition-all duration-300 ease-in-out w-full md:w-80",
                  isRightSidebarOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0 pointer-events-none",
                )}
              >
                <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/10 shrink-0">
                  <span className="font-semibold text-sm">
                    Proprietăți Element
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsRightSidebarOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {selectedEl ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="space-y-3">
                      <label className="text-xs font-medium text-muted-foreground uppercase">
                        Nume
                      </label>
                      <Input
                        className="font-bold text-lg h-10"
                        value={selectedEl.name}
                        onChange={(e: any) =>
                          isEventActive &&
                          setElements((prev) =>
                            prev.map((el) =>
                              el.id === selectedId
                                ? { ...el, name: e.target.value }
                                : el,
                            ),
                          )
                        }
                        disabled={!isEventActive}
                      />
                    </div>
                    {selectedEl.capacity && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium">
                            Locuri Total
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              disabled={!isEventActive}
                              onClick={() =>
                                handleUpdateCapacity(selectedEl.id, -1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-4 text-center font-mono text-sm">
                              {selectedEl.capacity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              disabled={!isEventActive}
                              onClick={() =>
                                handleUpdateCapacity(selectedEl.id, 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground uppercase flex justify-between">
                            <span>Invitați Așezați</span>
                            <span>
                              {selectedEl.guests?.filter(Boolean).length}/
                              {selectedEl.capacity}
                            </span>
                          </label>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {selectedEl.guests?.map((guest, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "p-2 rounded-md border text-sm flex flex-col gap-2 transition-colors",
                                  highlightedGuestIdx === idx
                                    ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                    : "bg-card hover:bg-accent/50",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 flex items-center justify-center bg-muted text-[10px] rounded-full font-bold shrink-0">
                                    {idx + 1}
                                  </span>
                                  <GuestInput
                                    inputRef={(el: HTMLInputElement | null) => {
                                      guestInputRefs.current[idx] = el;
                                    }}
                                    initialName={guest?.name || ""}
                                    idx={idx}
                                    allGuests={allGuests}
                                    seatedGuestNames={seatedGuestNames}
                                    onAssign={(g: GuestListEntry) =>
                                      handleAssignGroup(selectedEl.id, idx, g)
                                    }
                                    onManualChange={(name: string) =>
                                      handleManualNameCommit(
                                        selectedEl.id,
                                        idx,
                                        name,
                                      )
                                    }
                                    onFocus={() => setHighlightedGuestIdx(idx)}
                                    elementType={selectedEl.type}
                                  />
                                </div>
                                {guest && (
                                  <div className="pl-7 grid grid-cols-2 gap-2 text-xs">
                                    <div className="col-span-1">
                                      <select
                                        className="w-full bg-transparent border-none p-0 h-auto text-muted-foreground focus:ring-0 cursor-pointer"
                                        disabled={!isEventActive}
                                        value={guest.menuType}
                                        onChange={(e) =>
                                          handleGuestDetailChange(
                                            selectedEl.id,
                                            idx,
                                            "menuType",
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="standard">
                                          Standard
                                        </option>
                                        <option value="vegetarian">
                                          Vegetarian
                                        </option>
                                        <option value="kids">Copil</option>
                                      </select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                      <label className="flex items-center gap-1 cursor-pointer">
                                        <Checkbox
                                          className="h-3 w-3"
                                          disabled={!isEventActive}
                                          checked={guest.isChild}
                                          onCheckedChange={(c) =>
                                            handleGuestDetailChange(
                                              selectedEl.id,
                                              idx,
                                              "isChild",
                                              c,
                                            )
                                          }
                                        />
                                        <span className="text-[10px]">
                                          Copil
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={!isEventActive}
                        onClick={() => handleDelete(selectedEl.id)}
                      >
                        Șterge Element
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <Settings className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-sm">
                      Selectează un element din plan pentru a-l edita.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardApp;
