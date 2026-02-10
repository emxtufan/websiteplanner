import React, { useEffect, useRef, useState, memo } from 'react';

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

const FlipUnit = memo(({ value, label }: { value: number, label: string }) => {
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
      topFlip.className = 'top-flip bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100';
      topFlip.innerText = String(prev);

      const bottomFlip = document.createElement('div');
      bottomFlip.className = 'bottom-flip bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100';
      bottomFlip.innerText = String(curr);

      topFlip.addEventListener('animationstart', () => {
        if(topHalf) topHalf.innerText = String(curr);
      });

      topFlip.addEventListener('animationend', () => {
        topFlip.remove();
      });

      bottomFlip.addEventListener('animationend', () => {
        if(bottomHalf) bottomHalf.innerText = String(curr);
        bottomFlip.remove();
      });

      container.appendChild(topFlip);
      container.appendChild(bottomFlip);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        ref={containerRef} 
        className="flip-card text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tighter bg-transparent"
      >
        <div className="top-half bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
          {format(value)}
        </div>
        <div className="bottom-half bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100">
          {format(value)}
        </div>
      </div>
      <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
});

const FlipClock = ({ targetDate }: { targetDate: string }) => {
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

  return (
    <div className="w-full py-8 flex flex-col items-center justify-center bg-background border-b mb-6">
      <style>{flipStyles}</style>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
        Timp rămas până la Marele Eveniment
      </h2>
      <div className="flex gap-4 sm:gap-6 md:gap-8">
        <FlipUnit value={timeLeft.days} label="Zile" />
        <FlipUnit value={timeLeft.hours} label="Ore" />
        <FlipUnit value={timeLeft.minutes} label="Min" />
        <FlipUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
};

export default FlipClock;