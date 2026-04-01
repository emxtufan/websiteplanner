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
  onTableClick?: (elId: string) => void;
  onMoveGuest: (fromElId: string, fromIdx: number, toElId: string) => void;
  onUpdateCapacity: (id: string, delta: number) => void;
  lang: Language;
  onCheckActive?: () => boolean;
}

const Canvas: React.FC<CanvasProps> = memo(({ 
  elements, setElements, config, setConfig, 
  selectedId, setSelectedId, placementMode, onPlace, onDelete, onSeatClick, onTableClick, onMoveGuest, onUpdateCapacity, lang, onCheckActive
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const [dragInfo, setDragInfo] = useState<{ id: string, startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const dragInfoRef = useRef<typeof dragInfo>(null); // ref în sync cu state — evită stale closure în touch handlers
  const [rotateInfo, setRotateInfo] = useState<{ id: string, startAngle: number, initialRotation: number, currentRotation: number } | null>(null);
  const rotateInfoRef = useRef<typeof rotateInfo>(null);
  const [resizeInfo, setResizeInfo] = useState<{
    id: string,
    startWidth: number,
    startHeight: number,
    startX: number,
    startY: number,
    startMouseX: number,
    startMouseY: number,
    centerX: number,
    centerY: number,
    signX: number,
    signY: number,
    baseRotation: number,
    currentWidth: number,
    currentHeight: number,
    currentX: number,
    currentY: number
  } | null>(null);
  const resizeInfoRef = useRef<typeof resizeInfo>(null);
  const elementsRef = useRef<CanvasElement[]>(elements);

  const touchRef = useRef<{ x: number, y: number } | null>(null);
  useEffect(() => { dragInfoRef.current = dragInfo; }, [dragInfo]);
  useEffect(() => { rotateInfoRef.current = rotateInfo; }, [rotateInfo]);
  useEffect(() => { resizeInfoRef.current = resizeInfo; }, [resizeInfo]);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

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
  const placeAtClientPoint = useCallback((clientX: number, clientY: number) => {
    if (!placementMode) return;
    const coords = getCanvasCoords(clientX, clientY);
    onPlace(coords.x, coords.y);
  }, [placementMode, getCanvasCoords, onPlace]);

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
        const rad = (resizeInfo.baseRotation * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const relX = coords.x - resizeInfo.centerX;
        const relY = coords.y - resizeInfo.centerY;
        const localX = relX * cos + relY * sin;
        const localY = -relX * sin + relY * cos;

        const halfW = Math.max(MIN_ELEMENT_SIZE / 2, localX * resizeInfo.signX);
        const halfH = Math.max(MIN_ELEMENT_SIZE / 2, localY * resizeInfo.signY);

        let newW = halfW * 2;
        let newH = halfH * 2;
        if (el.shape === TableShape.ROUND) {
          const s = Math.max(newW, newH);
          newW = s;
          newH = s;
        }

        const finalX = resizeInfo.centerX - newW / 2;
        const finalY = resizeInfo.centerY - newH / 2;

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
      dragInfoRef.current = null;
    }
    if (rotateInfo) {
      if (Math.abs(rotateInfo.currentRotation - rotateInfo.initialRotation) > 0.1) setElements(prev => prev.map(el => el.id === rotateInfo.id ? { ...el, rotation: rotateInfo.currentRotation } : el));
      setRotateInfo(null);
      rotateInfoRef.current = null;
    }
    if (resizeInfo) {
      if (Math.abs(resizeInfo.currentWidth - resizeInfo.startWidth) > TOLERANCE || Math.abs(resizeInfo.currentHeight - resizeInfo.startHeight) > TOLERANCE) {
        setElements(prev => prev.map(el => el.id === resizeInfo.id ? { ...el, width: resizeInfo.currentWidth, height: resizeInfo.currentHeight, x: resizeInfo.currentX, y: resizeInfo.currentY } : el));
      }
      setResizeInfo(null);
      resizeInfoRef.current = null;
    }
    setIsPanning(false);
  }, [dragInfo, rotateInfo, resizeInfo, setElements]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  // ── Touch handlers cu suport drag elemente ────────────────────────────────
  // ── Touch handlers ─────────────────────────────────────────────────────────
  // touchmove/touchend ascultate pe window (ca mousemove/mouseup) pentru că
  // touch events rămân pe elementul unde a pornit touchstart — chiar și după stopPropagation.
  // dragInfoRef evită problema stale closure: state-ul async nu e vizibil imediat în listeners.

  const isPanningRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (placementMode) {
      if (onCheckActive && !onCheckActive()) return;
      e.preventDefault();
      e.stopPropagation();
      placeAtClientPoint(touch.clientX, touch.clientY);
      return;
    }
    touchRef.current = { x: touch.clientX, y: touch.clientY };
    // Panning doar dacă touch-ul pornește pe fundalul gol (nu pe un element)
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.canvas-bg')) {
      setSelectedId(null);
      isPanningRef.current = true;
      setIsPanning(true);
    }
  }, [placementMode, placeAtClientPoint, setSelectedId, onCheckActive]);

  // Listeners globali pentru touchmove + touchend — adăugați pe window
  useEffect(() => {
    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const current = dragInfoRef.current;
      const currentRotate = rotateInfoRef.current;
      const currentResize = resizeInfoRef.current;
      const isInteracting = !!(current || currentRotate || currentResize || isPanningRef.current);

      if (!isInteracting) return;
      e.preventDefault(); // previne scroll-ul paginii în timpul interacțiunii pe canvas

      if (current) {
        // Mișcăm un element
        const coords = getCanvasCoords(clientX, clientY);
        const updated = { ...current, currentX: coords.x, currentY: coords.y };
        dragInfoRef.current = updated;
        setDragInfo(updated);
        return;
      }

      if (currentRotate) {
        const el = elementsRef.current.find(item => item.id === currentRotate.id);
        if (!el) return;
        const coords = getCanvasCoords(clientX, clientY);
        const centerX = el.x + el.width / 2;
        const centerY = el.y + el.height / 2;
        const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);
        const updated = {
          ...currentRotate,
          currentRotation: currentRotate.initialRotation + (angle - currentRotate.startAngle),
        };
        rotateInfoRef.current = updated;
        setRotateInfo(updated);
        return;
      }

      if (currentResize) {
        const el = elementsRef.current.find(item => item.id === currentResize.id);
        if (!el) return;
        const coords = getCanvasCoords(clientX, clientY);
        const rad = (currentResize.baseRotation * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const relX = coords.x - currentResize.centerX;
        const relY = coords.y - currentResize.centerY;
        const localX = relX * cos + relY * sin;
        const localY = -relX * sin + relY * cos;

        const halfW = Math.max(MIN_ELEMENT_SIZE / 2, localX * currentResize.signX);
        const halfH = Math.max(MIN_ELEMENT_SIZE / 2, localY * currentResize.signY);
        let newW = halfW * 2;
        let newH = halfH * 2;

        if (el.shape === TableShape.ROUND) {
          const s = Math.max(newW, newH);
          newW = s;
          newH = s;
        }
        const finalX = currentResize.centerX - newW / 2;
        const finalY = currentResize.centerY - newH / 2;

        const updated = {
          ...currentResize,
          currentWidth: newW,
          currentHeight: newH,
          currentX: finalX,
          currentY: finalY,
        };
        resizeInfoRef.current = updated;
        setResizeInfo(updated);
        return;
      }

      if (!touchRef.current) return;

      if (isPanningRef.current) {
        // Pan canvas
        const dx = clientX - touchRef.current.x;
        const dy = clientY - touchRef.current.y;
        setConfig(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
        touchRef.current = { x: clientX, y: clientY };
      }
    };

    const handleTouchEndGlobal = () => {
      const TOLERANCE = 1;
      const current = dragInfoRef.current;
      if (current) {
        const dx = current.currentX - current.startX;
        const dy = current.currentY - current.startY;
        if (Math.abs(dx) > TOLERANCE || Math.abs(dy) > TOLERANCE) {
          setElements(prev => prev.map(el =>
            el.id === current.id ? { ...el, x: el.x + dx, y: el.y + dy } : el
          ));
        }
        dragInfoRef.current = null;
        setDragInfo(null);
      }
      const currentRotate = rotateInfoRef.current;
      if (currentRotate) {
        if (Math.abs(currentRotate.currentRotation - currentRotate.initialRotation) > 0.1) {
          setElements(prev => prev.map(el =>
            el.id === currentRotate.id ? { ...el, rotation: currentRotate.currentRotation } : el
          ));
        }
        rotateInfoRef.current = null;
        setRotateInfo(null);
      }
      const currentResize = resizeInfoRef.current;
      if (currentResize) {
        if (
          Math.abs(currentResize.currentWidth - currentResize.startWidth) > TOLERANCE ||
          Math.abs(currentResize.currentHeight - currentResize.startHeight) > TOLERANCE
        ) {
          setElements(prev => prev.map(el =>
            el.id === currentResize.id
              ? {
                  ...el,
                  width: currentResize.currentWidth,
                  height: currentResize.currentHeight,
                  x: currentResize.currentX,
                  y: currentResize.currentY,
                }
              : el
          ));
        }
        resizeInfoRef.current = null;
        setResizeInfo(null);
      }
      isPanningRef.current = false;
      setIsPanning(false);
      touchRef.current = null;
    };

    window.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
    window.addEventListener('touchend', handleTouchEndGlobal);
    window.addEventListener('touchcancel', handleTouchEndGlobal);
    return () => {
      window.removeEventListener('touchmove', handleTouchMoveGlobal);
      window.removeEventListener('touchend', handleTouchEndGlobal);
      window.removeEventListener('touchcancel', handleTouchEndGlobal);
    };
  }, [getCanvasCoords, setConfig, setElements]);

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
        onMouseDown={e => {
          if (placementMode) {
            if (onCheckActive && !onCheckActive()) return;
            placeAtClientPoint(e.clientX, e.clientY);
            return;
          }
          if (e.target === containerRef.current) {
            setSelectedId(null);
            setIsPanning(true);
          }
        }} 
        onWheel={e => { const factor = e.deltaY > 0 ? 0.95 : 1.05; setConfig(prev => ({ ...prev, scale: Math.min(Math.max(0.1, prev.scale * factor), 5) })); }}
        onTouchStart={handleTouchStart}
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
              onSelect={(id, sC) => {
                if (onCheckActive && !onCheckActive()) return;
                setSelectedId(id);
                touchRef.current = { x: sC.x, y: sC.y };
                const c = getCanvasCoords(sC.x, sC.y);
                const di = { id, startX: c.x, startY: c.y, currentX: c.x, currentY: c.y };
                dragInfoRef.current = di;
                setDragInfo(di);
              }} 
              onDelete={onDelete}
              onTableClick={onTableClick}
              onRotateStart={(id, sC) => { 
                if (onCheckActive && !onCheckActive()) return;
                const c = getCanvasCoords(sC.x, sC.y); 
                const item = elements.find(i => i.id === id); 
                if (item) { 
                  const centerX = item.x + item.width / 2, centerY = item.y + item.height / 2; 
                  const sA = Math.atan2(c.y - centerY, c.x - centerX) * (180 / Math.PI); 
                  const ri = { id, startAngle: sA, initialRotation: item.rotation, currentRotation: item.rotation };
                  rotateInfoRef.current = ri;
                  setRotateInfo(ri); 
                } 
              }} 
              onResizeStart={(id, sC) => { 
                if (onCheckActive && !onCheckActive()) return;
                const c = getCanvasCoords(sC.x, sC.y); 
                const centerX = el.x + el.width / 2;
                const centerY = el.y + el.height / 2;
                const rad = (el.rotation * Math.PI) / 180;
                const cos = Math.cos(rad), sin = Math.sin(rad);
                const relX = c.x - centerX;
                const relY = c.y - centerY;
                const localX = relX * cos + relY * sin;
                const localY = -relX * sin + relY * cos;
                const rs = { 
                  id, 
                  startWidth: el.width, startHeight: el.height, 
                  startX: el.x, startY: el.y,
                  startMouseX: c.x, startMouseY: c.y, 
                  centerX,
                  centerY,
                  signX: localX >= 0 ? 1 : -1,
                  signY: localY >= 0 ? 1 : -1,
                  baseRotation: el.rotation,
                  currentWidth: el.width, currentHeight: el.height,
                  currentX: el.x, currentY: el.y
                };
                resizeInfoRef.current = rs;
                setResizeInfo(rs); 
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
