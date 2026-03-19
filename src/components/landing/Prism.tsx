
import React, { useRef, useEffect } from 'react';

// A lightweight Prism effect implementation using Canvas
export default function Prism() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Shapes configuration
    const shapes = [
        { x: width * 0.5, y: height * 0.3, size: 400, color: 'rgba(232, 121, 249, 0.15)', speedX: 0.2, speedY: 0.1, rot: 0 },
        { x: width * 0.2, y: height * 0.7, size: 300, color: 'rgba(129, 140, 248, 0.15)', speedX: -0.15, speedY: 0.2, rot: 45 },
        { x: width * 0.8, y: height * 0.6, size: 350, color: 'rgba(52, 211, 153, 0.1)', speedX: 0.1, speedY: -0.15, rot: 90 }
    ];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      
      // Draw standard gradient background
      // ctx.fillStyle = 'rgba(9, 9, 11, 0)'; // Transparent to let main bg show
      // ctx.fillRect(0,0,width,height);

      // Composite mode for "light" effect
      ctx.globalCompositeOperation = 'screen';

      shapes.forEach(shape => {
          shape.x += shape.speedX;
          shape.y += shape.speedY;
          shape.rot += 0.002;

          // Bounce
          if(shape.x < -100 || shape.x > width + 100) shape.speedX *= -1;
          if(shape.y < -100 || shape.y > height + 100) shape.speedY *= -1;

          ctx.save();
          ctx.translate(shape.x, shape.y);
          ctx.rotate(shape.rot);
          
          // Draw Prism-like Triangle/Poly
          const grad = ctx.createLinearGradient(-shape.size, -shape.size, shape.size, shape.size);
          grad.addColorStop(0, shape.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size, shape.size);
          ctx.lineTo(-shape.size, shape.size);
          ctx.closePath();
          ctx.fill();
          
          // Add blur
          ctx.filter = 'blur(40px)';
          ctx.fill();
          ctx.filter = 'none';

          ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} 
    />
  );
}
