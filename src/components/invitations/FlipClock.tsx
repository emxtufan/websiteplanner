import React, { useEffect, useRef, useState, memo } from 'react';
import { InlineEdit } from './InlineEdit'; // Ajustează path-ul dacă e diferit

// --- STYLES FOR FLIP ANIMATION (Injected locally to avoid global css pollution) ---
const flipStyles = `
.flip-card {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 6px;
}

.top-half,
.bottom-half,
.top-flip,
.bottom-flip {
  height: 0.75em;
  line-height: 1;
  padding: 0.25em;
  overflow: hidden;
  text-align: center;
}

.top-half,
.top-flip {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.bottom-half,
.bottom-flip {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.top-flip {
  position: absolute;
  width: 100%;
  animation: flip-top 0.25s ease-in forwards;
  transform-origin: bottom;
  z-index: 2;
}

.bottom-flip {
  position: absolute;
  bottom: 0;
  width: 100%;
  animation: flip-bottom 0.25s ease-out 0.25s;
  transform-origin: top;
  transform: rotateX(90deg);
  z-index: 2;
}

@keyframes flip-top {
  100% { transform: rotateX(90deg); }
}

@keyframes flip-bottom {
  100% { transform: rotateX(0deg); }
}
`;

const FlipUnit = memo(({ 
  value, 
  label, 
  topBgColor,
  bottomBgColor,
  textColor,
  labelColor,
}: { 
  value: number, 
  label: string,
  topBgColor: string,
  bottomBgColor: string,
  textColor: string,
  labelColor: string,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentValue = useRef(value);
  const previousValue = useRef(value);

  // Pad number
  const format = (n: number) => n < 10 ? `0${n}` : n;

  useEffect(() => {
    if (value !== currentValue.current) {
      previousValue.current = currentValue.current;
      currentValue.current = value;
      
      const container = containerRef.current;
      if (!container) return;

      const prev = format(previousValue.current);
      const curr = format(currentValue.current);

      // DOM Manipulation for animation (performant way for flip effect)
      const topHalf = container.querySelector('.top-half') as HTMLElement;
      const bottomHalf = container.querySelector('.bottom-half') as HTMLElement;

      const topFlip = document.createElement('div');
      topFlip.className = 'top-flip';
      topFlip.style.backgroundColor = topBgColor;
      topFlip.style.color = textColor;
      topFlip.innerText = String(prev);

      const bottomFlip = document.createElement('div');
      bottomFlip.className = 'bottom-flip';
      bottomFlip.style.backgroundColor = bottomBgColor;
      bottomFlip.style.color = textColor;
      bottomFlip.innerText = String(curr);

      topFlip.addEventListener('animationstart', () => {
        if(topHalf) {
          topHalf.innerText = String(curr);
        }
      });

      topFlip.addEventListener('animationend', () => {
        topFlip.remove();
      });

      bottomFlip.addEventListener('animationend', () => {
        if(bottomHalf) {
          bottomHalf.innerText = String(curr);
        }
        bottomFlip.remove();
      });

      container.appendChild(topFlip);
      container.appendChild(bottomFlip);
    }
  }, [value, topBgColor, bottomBgColor, textColor]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        ref={containerRef} 
        className="flip-card text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tighter"
        style={{ backgroundColor: 'transparent' }}
      >
        <div 
          className="top-half"
          style={{ 
            backgroundColor: topBgColor, 
            color: textColor,
            borderBottomColor: `rgba(0,0,0,0.1)`
          }}
        >
          {format(value)}
        </div>
        <div 
          className="bottom-half"
          style={{ 
            backgroundColor: bottomBgColor, 
            color: textColor,
            borderTopColor: `rgba(0,0,0,0.1)`
          }}
        >
          {format(value)}
        </div>
      </div>
      <span 
        className="text-[10px] sm:text-xs uppercase tracking-widest font-medium"
        style={{ color: labelColor }}
      >
        {label}
      </span>
    </div>
  );
});

interface FlipClockProps {
  targetDate: string;
  bgColor?: string;           // Background din template (PINK_DARK)
  textColor?: string;          // Text alb/light
  accentColor?: string;        // PINK_L - culoarea deschisă
  labelColor?: string;         // Opțional - culoarea labelurilor
  titleText?: string;          // Text titlu editabil
  titleTextKey?: string;
  titleTextLabel?: string;
  onTitleChange?: (text: string) => void;  // Callback pentru schimbare titlu
  editMode?: boolean;          // Mode editare
}

const FlipClock: React.FC<FlipClockProps> = ({ 
  targetDate, 
  bgColor = '#be185d',
  textColor = '#ffffff',
  accentColor = '#fbcfe8',
  labelColor = 'rgba(255, 255, 255, 0.7)',
  titleText = 'Timp rămas până la Marele Eveniment',
  titleTextKey,
  titleTextLabel,
  onTitleChange,
  editMode = false,
}) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Culori mai deschise pentru top, mai închise pentru bottom
  const topBg = accentColor;      // Light pink
  const bottomBg = bgColor;        // Dark pink

  return (
    <div 
      className="w-full py-8 flex flex-col items-center justify-center border-b"
      style={{ backgroundColor: bgColor, borderRadius: '16px' }}
    >
      <style>{flipStyles}</style>
      <InlineEdit 
  tag="h2"
  editMode={editMode}
  value={titleText}
  onChange={onTitleChange || (() => {})}
  textKey={titleTextKey}
  textLabel={titleTextLabel}
  placeholder="Text titlu..."
  style={{
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.125em',
    marginBottom: '1.5rem',
    color: textColor,
    opacity: 0.9,
    fontFamily: 'inherit',

    // 🔥 IMPORTANT
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    textAlign: 'center',
    maxWidth: '100%',
  }}
/>
      <div className="flex gap-4 sm:gap-6 md:gap-8">
        <FlipUnit 
          value={timeLeft.days} 
          label="Zile"
          topBgColor={topBg}
          bottomBgColor={bottomBg}
          textColor={textColor}
          labelColor={labelColor}
        />
        <FlipUnit 
          value={timeLeft.hours} 
          label="Ore"
          topBgColor={topBg}
          bottomBgColor={bottomBg}
          textColor={textColor}
          labelColor={labelColor}
        />
        <FlipUnit 
          value={timeLeft.minutes} 
          label="Min"
          topBgColor={topBg}
          bottomBgColor={bottomBg}
          textColor={textColor}
          labelColor={labelColor}
        />
        <FlipUnit 
          value={timeLeft.seconds} 
          label="Sec"
          topBgColor={topBg}
          bottomBgColor={bottomBg}
          textColor={textColor}
          labelColor={labelColor}
        />
      </div>
    </div>
  );
};

export default FlipClock;
