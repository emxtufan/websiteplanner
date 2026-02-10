
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

// Context to store position coordinates
const TooltipContext = React.createContext<{ 
  open: boolean; 
  setOpen: (v: boolean) => void; 
  coords: { x: number; y: number; width: number; height: number } | null; 
  setCoords: (c: any) => void 
} | null>(null);

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Tooltip = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  return (
    <TooltipContext.Provider value={{ open, setOpen, coords, setCoords }}>
      <div 
        className={cn("relative inline-block", className)} 
        onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCoords({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            });
            setOpen(true);
        }} 
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = ({ children, asChild, className, ...props }: any) => {
  return (
    <button 
      type="button" 
      className={cn("cursor-help bg-transparent border-0 p-0 focus:outline-none", className)} 
      {...props}
    >
      {children}
    </button>
  );
};

export const TooltipContent = ({ children, className, side = "top", ...props }: any) => {
  const context = React.useContext(TooltipContext);
  
  // Render nothing if closed or coordinates aren't ready
  if (!context?.open || !context.coords) return null;

  const { x, y, width, height } = context.coords;

  // Determine fixed position based on trigger coordinates
  let style: React.CSSProperties = { position: "fixed" };
  
  if (side === "top") {
    style = { ...style, top: y - 8, left: x + width / 2, transform: "translate(-50%, -100%)" };
  } else if (side === "bottom") {
    style = { ...style, top: y + height + 8, left: x + width / 2, transform: "translate(-50%, 0)" };
  } else if (side === "left") {
    style = { ...style, top: y + height / 2, left: x - 8, transform: "translate(-100%, -50%)" };
  } else if (side === "right") {
    style = { ...style, top: y + height / 2, left: x + width + 8, transform: "translate(0, -50%)" };
  }

  // Use createPortal to render outside the current DOM hierarchy (in body)
  return createPortal(
    <div
      className={cn(
        "z-[9999] overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
};
