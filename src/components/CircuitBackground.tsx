import React, { useEffect, useRef } from 'react';

export const CircuitBackground: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isScrolling = false;
    let scrollTimeout: any = null;
    let isTabVisible = !document.hidden;

    // Handle Window Resize with debounce
    let resizeTimer: any = null;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };

    // Pause rendering during heavy scroll for 60/120fps native scroll smoothness
    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 80);
    };

    // Pause rendering when tab is inactive
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Dynamic signal packet simulation on circuit nodes
    interface SignalNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      pulse: number;
      pulseSpeed: number;
      color: string;
    }

    interface CircuitLine {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      packetPos: number;
      packetSpeed: number;
      packetColor: string;
    }

    const nodes: SignalNode[] = [];
    const nodeCount = Math.min(Math.floor(window.innerWidth / 140), 12);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 1.2,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.015 + Math.random() * 0.015,
        color: i % 2 === 0 ? 'rgba(56, 189, 248, ' : 'rgba(2, 132, 199, '
      });
    }

    // Fixed engineering bus traces with moving data packets
    const circuitLines: CircuitLine[] = [
      { x1: 0, y1: height * 0.2, x2: width * 0.4, y2: height * 0.2, packetPos: 0, packetSpeed: 0.002, packetColor: '#38bdf8' },
      { x1: width * 0.4, y1: height * 0.2, x2: width * 0.6, y2: height * 0.4, packetPos: 0.3, packetSpeed: 0.0015, packetColor: '#0ea5e9' },
      { x1: width * 0.6, y1: height * 0.4, x2: width, y2: height * 0.4, packetPos: 0.7, packetSpeed: 0.002, packetColor: '#38bdf8' },
      { x1: width * 0.2, y1: height, x2: width * 0.3, y2: height * 0.7, packetPos: 0.2, packetSpeed: 0.0018, packetColor: '#0284c7' },
      { x1: width * 0.3, y1: height * 0.7, x2: width * 0.8, y2: height * 0.7, packetPos: 0.5, packetSpeed: 0.0015, packetColor: '#38bdf8' }
    ];

    let lastDrawTime = 0;
    const TARGET_INTERVAL_MS = 1000 / 30; // 30 FPS cap is butter smooth for slow background pulses & saves 60% GPU/CPU

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Skip render if tab is hidden or actively scrolling fast
      if (!isTabVisible || isScrolling) return;

      const elapsed = time - lastDrawTime;
      if (elapsed < TARGET_INTERVAL_MS) return;
      lastDrawTime = time - (elapsed % TARGET_INTERVAL_MS);

      ctx.clearRect(0, 0, width, height);

      // Render Fixed Circuit Traces
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.setLineDash([4, 4]);

      for (let i = 0; i < circuitLines.length; i++) {
        const line = circuitLines[i];
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();

        // Update & Render Moving Data Packet along trace
        line.packetPos = (line.packetPos + line.packetSpeed) % 1;
        const px = line.x1 + (line.x2 - line.x1) * line.packetPos;
        const py = line.y1 + (line.y2 - line.y1) * line.packetPos;

        ctx.fillStyle = line.packetColor;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.setLineDash([]);

      const MAX_DIST_SQ = 180 * 180; // Avoid Math.sqrt inside loop

      // Render Floating Signal Nodes & Connecting Links
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        const currentAlpha = 0.18 + 0.15 * Math.sin(node.pulse);

        // Draw node
        ctx.fillStyle = `${node.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Connecting lines using fast squared distance
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < MAX_DIST_SQ) {
            const lineAlpha = (1 - distSq / MAX_DIST_SQ) * 0.1;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      style={{
        contain: 'strict',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70"
        style={{
          contain: 'strict'
        }}
      />
    </div>
  );
});
