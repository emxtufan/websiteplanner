import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import CanvasItem from "./CanvasItem";
import { CanvasConfig, CanvasElement, ElementType, Language, TableShape } from "../types";
import { translations, MIN_ELEMENT_SIZE, FIXED_CANVAS_WIDTH, FIXED_CANVAS_HEIGHT } from "../constants";

interface CanvasProps {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  config: CanvasConfig;
  setConfig: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  placementMode: { type: ElementType, config: any } | null;
  onPlace: (x: number, y: number) => void;
  onDelete: (id: string) => void;
  onSeatClick: (elId: string, idx: number) => void;
  onTableClick?: (elId: string) => void; // NOU: click pe corpul mesei
  onMoveGuest: (fromElId: string, fromIdx: number, toElId: string) => void;
  onUpdateCapacity: (id: string, delta: number) => void;
  lang: Language;
}

const Canvas: React.FC<CanvasProps> = memo(({ 
  elements, setElements, config, setConfig, 
  selectedId, setSelectedId, placementMode, onPlace, onDelete, onSeatClick, onTableClick, onMoveGuest, onUpdateCapacity, lang
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [dragInfo, setDragInfo] = useState<{ id: string, startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const [rotateInfo, setRotateInfo] = useState<{ id: string, startAngle: number, initialRotation: number, currentRotation: number } | null>(null);
  const [resizeInfo, setResizeInfo] = useState<{ id: string, startWidth: number, startHeight: number, startX: number, startY: number, startMouseX: number, startMouseY: number, currentWidth: number, currentHeight: number, currentX: number, currentY: number } | null>(null);

  const touchRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const MARGIN_PX = 20; 
        
        const initialPanX = MARGIN_PX;
        const initialPanY = MARGIN_PX;
        
        setConfig(prev => ({
            ...prev,
            width: FIXED_CANVAS_WIDTH,
            height: FIXED_CANVAS_HEIGHT,
            panX: initialPanX,
            panY: initialPanY,
            scale: rect.width < 768 ? 0.5 : 1
        }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left - config.panX) / config.scale, y: (clientY - rect.top - config.panY) / config.scale };
  }, [config.panX, config.panY, config.scale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setMousePos(coords); 

    if (isPanning) { setConfig(prev => ({ ...prev, panX: prev.panX + e.movementX, panY: prev.panY + e.movementY })); return; }
    
    if (dragInfo) setDragInfo(prev => prev ? { ...prev, currentX: coords.x, currentY: coords.y } : null);
    
    if (rotateInfo) {
      const el = elements.find(item => item.id === rotateInfo.id);
      if (el) {
        const centerX = el.x + el.width / 2, centerY = el.y + el.height / 2;
        const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);
        setRotateInfo(prev => prev ? { ...prev, currentRotation: rotateInfo.initialRotation + (angle - rotateInfo.startAngle) } : null);
      }
    }

    if (resizeInfo) {
      const el = elements.find(item => item.id === resizeInfo.id);
      if (el) {
        const dx = coords.x - resizeInfo.startMouseX;
        const dy = coords.y - resizeInfo.startMouseY;
        const rad = (el.rotation * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        
        const localDx = dx * cos + dy * sin;
        const localDy = -dx * sin + dy * cos;
        
        let newW = Math.max(MIN_ELEMENT_SIZE, resizeInfo.startWidth - localDx);
        let newH = Math.max(MIN_ELEMENT_SIZE, resizeInfo.startHeight - localDy);

        let finalX, finalY;

        if (el.shape === TableShape.ROUND) {
          const s = Math.max(newW, newH);
          newW = s;
          newH = s;
          finalX = resizeInfo.startX + (resizeInfo.startWidth - newW) / 2;
          finalY = resizeInfo.startY + (resizeInfo.startHeight - newH) / 2;
        } else {
          const actualDw = newW - resizeInfo.startWidth;
          const actualDh = newH - resizeInfo.startHeight;
          const oldCx = resizeInfo.startX + resizeInfo.startWidth / 2;
          const oldCy = resizeInfo.startY + resizeInfo.startHeight / 2;
          const localShiftX = -actualDw / 2;
          const localShiftY = -actualDh / 2;
          const worldShiftX = localShiftX * cos - localShiftY * sin;
          const worldShiftY = localShiftX * sin + localShiftY * cos;
          finalX = (oldCx + worldShiftX) - newW / 2;
          finalY = (oldCy + worldShiftY) - newH / 2;
        }

        setResizeInfo(prev => prev ? { 
          ...prev, 
          currentWidth: newW, 
          currentHeight: newH, 
          currentX: finalX,
          currentY: finalY
        } : null);
      }
    }
  }, [isPanning, dragInfo, rotateInfo, resizeInfo, elements, getCanvasCoords, setConfig]);

  const handleMouseUp = useCallback(() => {
    const TOLERANCE = 1;
    if (dragInfo) {
      const dx = dragInfo.currentX - dragInfo.startX, dy = dragInfo.currentY - dragInfo.startY;
      if (Math.abs(dx) > TOLERANCE || Math.abs(dy) > TOLERANCE) setElements(prev => prev.map(el => el.id === dragInfo.id ? { ...el, x: el.x + dx, y: el.y + dy } : el));
      setDragInfo(null);
    }
    if (rotateInfo) {
      if (Math.abs(rotateInfo.currentRotation - rotateInfo.initialRotation) > 0.1) setElements(prev => prev.map(el => el.id === rotateInfo.id ? { ...el, rotation: rotateInfo.currentRotation } : el));
      setRotateInfo(null);
    }
    if (resizeInfo) {
      if (Math.abs(resizeInfo.currentWidth - resizeInfo.startWidth) > TOLERANCE || Math.abs(resizeInfo.currentHeight - resizeInfo.startHeight) > TOLERANCE) {
        setElements(prev => prev.map(el => el.id === resizeInfo.id ? { ...el, width: resizeInfo.currentWidth, height: resizeInfo.currentHeight, x: resizeInfo.currentX, y: resizeInfo.currentY } : el));
      }
      setResizeInfo(null);
    }
    setIsPanning(false);
  }, [dragInfo, rotateInfo, resizeInfo, setElements]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
       if (e.target === containerRef.current) {
           touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
           setIsPanning(true);
       }
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1 && touchRef.current) {
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        const dx = clientX - touchRef.current.x;
        const dy = clientY - touchRef.current.y;
        
        setConfig(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
        touchRef.current = { x: clientX, y: clientY };
    }
  }, [isPanning, setConfig]);

  const handleTouchEnd = useCallback(() => {
      setIsPanning(false);
      touchRef.current = null;
  }, []);

  const getDecorStyles = useCallback((name: string = ''): React.CSSProperties => {
    const n = name.toLowerCase(); const t = translations[lang];
    if (n.includes('candy') || n === t.candyBar.toLowerCase()) return { 
        background: 'repeating-linear-gradient(45deg, hsl(var(--card)) 0px, hsl(var(--card)) 10px, hsl(var(--muted)) 10px, hsl(var(--muted)) 20px)', 
        borderColor: 'hsl(var(--border))' 
    };
    if (n.includes('bar') || n === t.mainBar.toLowerCase()) return { 
        background: 'hsl(var(--secondary))', 
        color: 'hsl(var(--secondary-foreground))', 
        borderColor: 'hsl(var(--primary))',
        borderWidth: '2px'
    };
    if (n.includes('photo') || n === t.photoCorner.toLowerCase()) return { 
        background: 'hsl(var(--muted))', 
        border: '2px dashed hsl(var(--muted-foreground))' 
    };
    if (n.includes('lounge') || n === t.lounge.toLowerCase()) return { 
        background: 'hsl(var(--secondary))', 
        borderColor: 'hsl(var(--border))' 
    };
    return { 
        background: 'hsl(var(--card))', 
        borderColor: 'hsl(var(--border))' 
    };
  }, [lang]);

  const sortedElements = [...elements].sort((a, b) => {
      if (a.type === ElementType.ROOM && b.type !== ElementType.ROOM) return -1;
      if (a.type !== ElementType.ROOM && b.type === ElementType.ROOM) return 1;
      return 0;
  });

  return (
    <div 
        ref={containerRef} 
        className={`w-full h-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-950 canvas-grid ${placementMode ? 'cursor-none' : 'cursor-default'} ${dragInfo || rotateInfo || resizeInfo ? 'select-none' : ''}`}
        style={{ touchAction: 'none' }}
        onMouseDown={e => { if (placementMode) { const coords = getCanvasCoords(e.clientX, e.clientY); onPlace(coords.x, coords.y); return; } if (e.target === containerRef.current) setIsPanning(true); }} 
        onWheel={e => { const factor = e.deltaY > 0 ? 0.95 : 1.05; setConfig(prev => ({ ...prev, scale: Math.min(Math.max(0.1, prev.scale * factor), 5) })); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      
      <div style={{ transform: `translate3d(${config.panX}px, ${config.panY}px, 0) scale(${config.scale})`, width: config.width, height: config.height, transformOrigin: '0 0' }} className="relative pointer-events-none">
        
        <div 
          className="absolute inset-0 z-0 bg-white dark:bg-zinc-900 shadow-2xl border border-border" 
          style={{
             backgroundImage: 'linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px)',
             backgroundSize: '20px 20px'
          }}
        />

        {sortedElements.map(el => {
          let dX = el.x, dY = el.y, dRot = el.rotation, dW = el.width, dH = el.height;
          const isM = dragInfo?.id === el.id, isR = rotateInfo?.id === el.id, isRes = resizeInfo?.id === el.id;
          
          if (isM) { dX += (dragInfo.currentX - dragInfo.startX); dY += (dragInfo.currentY - dragInfo.startY); }
          if (isR) dRot = rotateInfo.currentRotation;
          if (isRes) { dW = resizeInfo.currentWidth; dH = resizeInfo.currentHeight; dX = resizeInfo.currentX; dY = resizeInfo.currentY; }

          return (
            <CanvasItem 
              key={el.id} el={el} isSelected={selectedId === el.id} isDropTarget={dropTargetId === el.id} isMoving={isM || isR} isResizing={isRes} 
              displayX={dX} displayY={dY} displayWidth={dW} displayHeight={dH} displayRotation={dRot} 
              decorStyle={el.type === ElementType.DECOR ? getDecorStyles(el.name) : {}} 
              onSelect={(id, sC) => { setSelectedId(id); const c = getCanvasCoords(sC.x, sC.y); setDragInfo({ id, startX: c.x, startY: c.y, currentX: c.x, currentY: c.y }); }} 
              onDelete={onDelete}
              // NOU: pasăm onTableClick la CanvasItem
              onTableClick={onTableClick}
              onRotateStart={(id, sC) => { 
                const c = getCanvasCoords(sC.x, sC.y); 
                const item = elements.find(i => i.id === id); 
                if (item) { 
                  const centerX = item.x + item.width / 2, centerY = item.y + item.height / 2; 
                  const sA = Math.atan2(c.y - centerY, c.x - centerX) * (180 / Math.PI); 
                  setRotateInfo({ id, startAngle: sA, initialRotation: item.rotation, currentRotation: item.rotation }); 
                } 
              }} 
              onResizeStart={(id, sC) => { 
                const c = getCanvasCoords(sC.x, sC.y); 
                setResizeInfo({ 
                  id, 
                  startWidth: el.width, startHeight: el.height, 
                  startX: el.x, startY: el.y,
                  startMouseX: c.x, startMouseY: c.y, 
                  currentWidth: el.width, currentHeight: el.height,
                  currentX: el.x, currentY: el.y
                }); 
              }} 
              onSeatClick={onSeatClick}
              onDragOver={id => setDropTargetId(id)} onDragLeave={() => setDropTargetId(null)} onDrop={(toId, data) => { setDropTargetId(null); const { fromElId, fromIdx } = JSON.parse(data); onMoveGuest(fromElId, fromIdx, toId); }} onUpdateCapacity={onUpdateCapacity} 
            />
          );
        })}

        {placementMode && (
          <CanvasItem
            el={{
                ...placementMode.config,
                id: 'ghost',
                type: placementMode.type,
                x: mousePos.x - (placementMode.config.width / 2),
                y: mousePos.y - (placementMode.config.height / 2),
                rotation: 0,
                guests: placementMode.config.capacity ? Array(placementMode.config.capacity).fill(null) : undefined
            }}
            displayX={mousePos.x - (placementMode.config.width / 2)}
            displayY={mousePos.y - (placementMode.config.height / 2)}
            displayWidth={placementMode.config.width}
            displayHeight={placementMode.config.height}
            displayRotation={0}
            isGhost={true}
            decorStyle={placementMode.type === ElementType.DECOR ? getDecorStyles(placementMode.config.name) : {}}
          />
        )}
      </div>
    </div>
  );
});

export default Canvas;