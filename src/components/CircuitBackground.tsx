import React, { useEffect, useRef } from 'react';

export const CircuitBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

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
    const nodeCount = Math.min(Math.floor(window.innerWidth / 120), 16);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 1.5,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        color: i % 2 === 0 ? 'rgba(56, 189, 248, ' : 'rgba(2, 132, 199, '
      });
    }

    // Fixed engineering bus traces with moving data packets
    const circuitLines: CircuitLine[] = [
      { x1: 0, y1: height * 0.2, x2: width * 0.4, y2: height * 0.2, packetPos: 0, packetSpeed: 0.003, packetColor: '#38bdf8' },
      { x1: width * 0.4, y1: height * 0.2, x2: width * 0.6, y2: height * 0.4, packetPos: 0.3, packetSpeed: 0.002, packetColor: '#0ea5e9' },
      { x1: width * 0.6, y1: height * 0.4, x2: width, y2: height * 0.4, packetPos: 0.7, packetSpeed: 0.003, packetColor: '#38bdf8' },
      { x1: width * 0.2, y1: height, x2: width * 0.3, y2: height * 0.7, packetPos: 0.2, packetSpeed: 0.0025, packetColor: '#0284c7' },
      { x1: width * 0.3, y1: height * 0.7, x2: width * 0.8, y2: height * 0.7, packetPos: 0.5, packetSpeed: 0.002, packetColor: '#38bdf8' }
    ];

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render Fixed Circuit Traces
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.setLineDash([4, 4]);

      for (const line of circuitLines) {
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

      // Render Floating Signal Nodes & Connecting Fiber Links
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;

        // Wrap around boundaries gently
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        const currentAlpha = 0.2 + 0.2 * Math.sin(node.pulse);

        // Draw node
        ctx.fillStyle = `${node.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw light connecting lines between close nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const lineAlpha = (1 - dist / 180) * 0.12;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Background Engineering Blueprint Grid */}
      <div className="absolute inset-0 engineering-grid opacity-30" />

      {/* Hardware Accelerated Canvas for Circuit Traces & Waveform Packets */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Radial Soft Ambient Atmosphere */}
      <div className="absolute -top-40 right-1/4 w-[32rem] h-[32rem] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
