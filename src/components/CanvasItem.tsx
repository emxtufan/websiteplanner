import React, { memo, useState } from "react";
import { createPortal } from "react-dom";
import { RefreshCcw, Maximize, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { CanvasElement, ElementType, TableShape, Guest } from "../types";
import { MIN_ELEMENT_SIZE } from "../constants";

interface CanvasItemProps {
  el: CanvasElement;
  isSelected?: boolean;
  isDropTarget?: boolean;
  isMoving?: boolean;
  isResizing?: boolean;
  isGhost?: boolean;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
  displayRotation: number;
  decorStyle: React.CSSProperties;
  onSelect?: (id: string, coords: { x: number, y: number }) => void;
  onDelete?: (id: string) => void;
  onRotateStart?: (id: string, coords: { x: number, y: number }) => void;
  onResizeStart?: (id: string, coords: { x: number, y: number }) => void;
  onSeatClick?: (elId: string, idx: number) => void;
  onTableClick?: (elId: string) => void;
  onDragOver?: (id: string) => void;
  onDragLeave?: () => void;
  onDrop?: (id: string, data: string) => void;
  onUpdateCapacity?: (id: string, delta: number) => void;
}

const CanvasItem = memo(({ 
  el, isSelected, isDropTarget, isMoving, isResizing, isGhost, displayX, displayY, 
  displayWidth, displayHeight, displayRotation, decorStyle, 
  onSelect, onDelete, onRotateStart, onResizeStart, onSeatClick, onTableClick, onDragOver, onDragLeave, onDrop, onUpdateCapacity
}: CanvasItemProps) => {
  const isPresidium = el.type === ElementType.PRESIDIUM;
  const isStage = el.type === ElementType.STAGE;
  const isDancefloor = el.type === ElementType.DANCEFLOOR;
  const isDecor = el.type === ElementType.DECOR;
  const isRoom = el.type === ElementType.ROOM;
  const isTable = el.type === ElementType.TABLE || isPresidium;

  const isActive = (isMoving || isResizing) && !isGhost;
  const hasSeats = isTable && (el.capacity || 0) > 0;
  
  const [tooltipData, setTooltipData] = useState<{ x: number, y: number, content: React.ReactNode } | null>(null);
  const [hoveredSeatIdx, setHoveredSeatIdx] = useState<number | null>(null);
  const rotationRad = (displayRotation * Math.PI) / 180;
  const controlDistance = Math.max(displayWidth, displayHeight) / 2 + 68;
  const controlAnchorLocalX = -Math.cos(rotationRad) * controlDistance;
  const controlAnchorLocalY = Math.sin(rotationRad) * controlDistance;

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      left: 0, 
      top: 0,
      width: displayWidth, 
      height: displayHeight,
      transformOrigin: 'center center',
      transform: `translate3d(${displayX}px, ${displayY}px, 0) rotate(${displayRotation}deg)`,
      willChange: 'transform, width, height',
      color: 'hsl(var(--foreground))',
      ...decorStyle
    };

    if (isRoom) return { 
        ...base, 
        background: 'hsl(var(--background))', 
        border: '2px solid hsl(var(--border))', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.02)', 
        zIndex: 1, 
        borderRadius: '12px' 
    };

    let background = 'hsl(var(--card))';
    let border = '1px solid hsl(var(--border))';

    if (isTable) {
        background = `
            linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%),
            repeating-linear-gradient(45deg, rgba(128,128,128,0.03) 0px, rgba(128,128,128,0.03) 2px, transparent 2px, transparent 8px),
            hsl(var(--card))
        `;
        border = isPresidium ? '4px double hsl(var(--primary))' : '1px solid hsl(var(--border))';
    }

    if (isStage) {
        background = 'repeating-linear-gradient(90deg, hsl(var(--muted)) 0px, hsl(var(--muted)) 20px, hsl(var(--card)) 20px, hsl(var(--card)) 21px)';
        border = '1px solid hsl(var(--border))';
    }

    if (isDancefloor) {
        background = `
            conic-gradient(
                hsl(var(--muted)) 90deg, 
                hsl(var(--card)) 90deg 180deg, 
                hsl(var(--muted)) 180deg 270deg, 
                hsl(var(--card)) 270deg
            )
        `;
        const bgSize = Math.min(displayWidth, displayHeight) / 4;
        base.backgroundSize = `${bgSize}px ${bgSize}px`;
        border = '1px solid hsl(var(--border))';
    }

    return {
      ...base,
      borderRadius: (el.shape === TableShape.ROUND && !isPresidium && !isStage && !isDecor && !isDancefloor) ? '50%' : '8px', 
      border,
      background: !isDancefloor ? (base.background || background) : background,
      zIndex: isSelected ? 40 : (isGhost ? 100 : 10),
      boxShadow: isGhost ? 'none' : (isSelected ? '0 20px 40px rgba(0,0,0,0.2)' : (isTable ? '0 8px 24px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.05)')),
      pointerEvents: isGhost ? 'none' : 'auto'
    };
  };

  // Handler comun selectare + drag (mouse și touch)
  const handleSelectStart = (clientX: number, clientY: number) => {
    onTableClick?.(el.id);
    onSelect?.(el.id, { x: clientX, y: clientY });
  };

  return (
    <>
      <div
        className={`absolute ${!isActive && !isGhost ? 'transition-all duration-300' : ''} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} ${isDropTarget ? 'bg-primary/5' : ''} ${isGhost ? 'opacity-50' : ''}`}
        style={getStyle()}
        title={el.name}
        onDragOver={e => { if (el.guests && !isGhost) { e.preventDefault(); onDragOver?.(el.id); } }}
        onDragLeave={onDragLeave}
        onDrop={e => {
          if (isGhost) return;
          e.preventDefault();
          const data = e.dataTransfer.getData("seatTransfer");
          if (data) onDrop?.(el.id, data);
        }}
        onMouseDown={e => {
          if (isGhost) return;
          const target = e.target as HTMLElement;
          if (
            target.closest('.seat-handle') ||
            target.closest('.rotate-handle') ||
            target.closest('.delete-handle') ||
            target.closest('.resize-handle') ||
            target.closest('.control-bar')
          ) return;
          e.stopPropagation();
          handleSelectStart(e.clientX, e.clientY);
        }}
        onTouchStart={e => {
          if (isGhost) return;
          const target = e.target as HTMLElement;
          if (
            target.closest('.seat-handle') ||
            target.closest('.rotate-handle') ||
            target.closest('.delete-handle') ||
            target.closest('.resize-handle') ||
            target.closest('.control-bar')
          ) return;
          // stopPropagation previne activarea panning-ului în Canvas.handleTouchStart
          e.stopPropagation();
          const touch = e.touches[0];
          handleSelectStart(touch.clientX, touch.clientY);
        }}
      >
        {!isRoom && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 select-none pointer-events-none tracking-tight transition-opacity ${isSelected ? 'opacity-20' : 'opacity-100'}`} style={{ transform: `rotate(${-displayRotation}deg)` }}>
            {el.isStaff && <span className="text-[9px] bg-zinc-800 text-white px-1.5 py-0.5 rounded mb-1">STAFF</span>}
            <span className={cn("font-bold text-xs uppercase text-center leading-tight", isDancefloor ? "opacity-30" : "")}>{el.name}</span>
          </div>
        )}

        {isSelected && !isGhost && (
          <>
            {!isRoom && (
              <div
                className="rotate-handle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center border-2 border-primary z-50"
                onMouseDown={(e) => { e.stopPropagation(); onRotateStart?.(el.id, { x: e.clientX, y: e.clientY }); }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const t = e.touches[0];
                  if (!t) return;
                  onRotateStart?.(el.id, { x: t.clientX, y: t.clientY });
                }}
              >
                <RefreshCcw className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div
              className="control-bar absolute flex flex-col gap-2 z-[60]"
              onTouchStart={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              style={{
                left: `calc(50% + ${controlAnchorLocalX}px)`,
                top: `calc(50% + ${controlAnchorLocalY}px)`,
                transform: `translate(-50%, -50%) rotate(${-displayRotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              <div 
                  className="w-9 h-9 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-foreground dark:text-zinc-200 rounded-lg flex items-center justify-center shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-nwse-resize"
                  title="Trage pentru redimensionare"
                  onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(el.id, { x: e.clientX, y: e.clientY }); }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const t = e.touches[0];
                    if (!t) return;
                    onResizeStart?.(el.id, { x: t.clientX, y: t.clientY });
                  }}
              >
                  <Maximize className="w-4 h-4" />
              </div>
              {hasSeats && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateCapacity?.(el.id, 1); }} 
                    className="w-9 h-9 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-foreground dark:text-zinc-200 rounded-lg flex items-center justify-center shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    title="Adaugă Scaun"
                  >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {hasSeats && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateCapacity?.(el.id, -1); }} 
                    className="w-9 h-9 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-foreground dark:text-zinc-200 rounded-lg flex items-center justify-center shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    title="Scoate Scaun"
                  >
                  <Minus className="w-4 h-4" />
                </button>
              )}
              <button 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(el.id); }} 
                  className="w-9 h-9 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  title="Șterge Element"
              >
                  <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div 
                className="resize-handle absolute -bottom-1 -right-1 w-6 h-6 cursor-nwse-resize z-[60] flex items-end justify-end p-1"
                onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(el.id, { x: e.clientX, y: e.clientY }); }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const t = e.touches[0];
                  if (!t) return;
                  onResizeStart?.(el.id, { x: t.clientX, y: t.clientY });
                }}
            >
                 <div className="w-3 h-3 border-r-2 border-b-2 border-primary bg-white dark:bg-zinc-900" />
            </div>
          </>
        )}

        {hasSeats && el.guests?.map((guest: Guest | null, idx: number) => {
          let left, top, seatRotation = 0;
          const seatSize = 34;
          
          if (isPresidium) {
            const spacing = displayWidth / (el.capacity! + 1);
            left = spacing * (idx + 1); 
            top = displayHeight + (seatSize/2) + 5; 
            seatRotation = -displayRotation;
          } else if (el.shape === TableShape.SQUARE || el.shape === TableShape.RECT) {
            const totalCapacity = el.capacity || 1;
            const perimeter = 2 * (displayWidth + displayHeight);
            const step = perimeter / totalCapacity;
            const d = (idx + 0.5) * step;
            const offset = (seatSize/2) + 5;
            
            if (d <= displayWidth) { left = d; top = -offset; }
            else if (d <= displayWidth + displayHeight) { left = displayWidth + offset; top = d - displayWidth; }
            else if (d <= 2 * displayWidth + displayHeight) { left = displayWidth - (d - (displayWidth + displayHeight)); top = displayHeight + offset; }
            else { left = -offset; top = displayHeight - (d - (2 * displayWidth + displayHeight)); }
            seatRotation = -displayRotation;
          } else {
            const angle = (360 / (el.capacity || 1) * idx - 90) * (Math.PI / 180);
            const radius = Math.min(displayWidth, displayHeight) / 2 + (seatSize/2) + 5;
            left = displayWidth / 2 + radius * Math.cos(angle); 
            top = displayHeight / 2 + radius * Math.sin(angle);
            seatRotation = -displayRotation;
          }

          const guestName = guest ? guest.name : null;
          const guestInitials = guestName ? guestName.split(' ').map((n:string) => n[0]).join('').substring(0,2).toUpperCase() : (idx + 1);
          
          let seatColorClass = 'bg-primary text-primary-foreground border-primary shadow-sm dark:bg-zinc-700 dark:text-white dark:border-zinc-600';
          if (guest?.isChild) {
            seatColorClass = 'bg-pink-500 text-white border-pink-600';
          } else if (guest?.menuType === 'vegetarian' || guest?.menuType === 'vegan') {
            seatColorClass = 'bg-green-600 text-white border-green-700';
          }

          return (
            <div 
              key={idx} 
              draggable={!!guest && !isGhost} 
              onDragStart={e => { if (isGhost) return; e.dataTransfer.setData("seatTransfer", JSON.stringify({ fromElId: el.id, fromIdx: idx })); }} 
              onClick={e => {
                if (!isGhost) {
                  e.stopPropagation();
                  onSeatClick?.(el.id, idx);
                }
              }} 
              onMouseEnter={(e) => {
                  if (guest && !isGhost) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipData({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                          content: (
                              <div className="bg-black text-white text-xs px-2 py-1.5 rounded shadow-xl whitespace-nowrap flex flex-col items-center">
                                  <span className="font-semibold">{guest.name}</span>
                                  {(guest.isChild || guest.menuType !== 'standard') && (
                                      <span className="text-[10px] opacity-80 uppercase tracking-wider">{guest.menuType}</span>
                                  )}
                              </div>
                          )
                      });
                      setHoveredSeatIdx(idx);
                  }
              }}
              onMouseLeave={() => {
                  setTooltipData(null);
                  setHoveredSeatIdx(null);
              }}
              className={`seat-handle absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all z-20 cursor-pointer shadow-sm
                ${guest 
                  ? seatColorClass 
                  : 'bg-white dark:bg-zinc-950 text-muted-foreground border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary hover:text-primary'}
                ${hoveredSeatIdx === idx ? 'scale-110 ring-2 ring-offset-1 ring-primary' : ''}
              `}
              style={{ 
                  left, top, 
                  width: seatSize, height: seatSize,
                  transform: `translate(-50%, -50%) rotate(${seatRotation}deg)` 
              }}
            >
              {guest ? guestInitials : <span className="opacity-50">{idx + 1}</span>}
            </div>
          );
        })}
      </div>

      {tooltipData && createPortal(
          <div 
              className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-150"
              style={{ 
                  left: tooltipData.x, 
                  top: tooltipData.y, 
                  transform: 'translate(-50%, -100%)' 
              }}
          >
              {tooltipData.content}
              <div className="w-2 h-2 bg-black rotate-45 absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
          </div>,
          document.body
      )}
    </>
  );
});

export default CanvasItem;
