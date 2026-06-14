import { useEffect, useRef, useCallback } from 'react';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { DrawingPath } from '@/types';

interface DrawingCanvasProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function DrawingCanvas({ containerRef }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const paths = useCopybookStore((s) => s.paths);
  const penColor = useCopybookStore((s) => s.penColor);
  const penWidth = useCopybookStore((s) => s.penWidth);
  const drawingEnabled = useCopybookStore((s) => s.drawingEnabled);
  const addPath = useCopybookStore((s) => s.addPath);

  const getCanvasCoords = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();

      let clientX: number, clientY: number;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const path of paths) {
      if (path.points.length < 2) continue;

      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }
  }, [paths]);

  const drawCurrentPath = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || currentPathRef.current.length < 2) return;

    const points = currentPathRef.current;
    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }, [penColor, penWidth]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!drawingEnabled) return;
      e.preventDefault();

      const coords = getCanvasCoords(e.nativeEvent);
      if (!coords) return;

      isDrawingRef.current = true;
      currentPathRef.current = [coords];
      lastPointRef.current = coords;
    },
    [drawingEnabled, getCanvasCoords]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!drawingEnabled || !isDrawingRef.current) return;
      e.preventDefault();

      const coords = getCanvasCoords(e);
      if (!coords) return;

      const lastPoint = lastPointRef.current;
      if (lastPoint) {
        const dx = coords.x - lastPoint.x;
        const dy = coords.y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 1) {
          currentPathRef.current.push(coords);
          lastPointRef.current = coords;
          redrawCanvas();
          drawCurrentPath();
        }
      }
    },
    [drawingEnabled, getCanvasCoords, redrawCanvas, drawCurrentPath]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!drawingEnabled || !isDrawingRef.current) return;
      e.preventDefault();
      handleMouseMove(e.nativeEvent);
    },
    [drawingEnabled, handleMouseMove]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;

    if (currentPathRef.current.length >= 2) {
      const path: DrawingPath = {
        points: [...currentPathRef.current],
        color: penColor,
        lineWidth: penWidth,
      };
      addPath(path);
    }

    currentPathRef.current = [];
    lastPointRef.current = null;
    redrawCanvas();
  }, [penColor, penWidth, addPath, redrawCanvas]);

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDrawingRef.current) {
        handleMouseMove(e);
      }
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDrawingRef.current) {
        handleMouseMove(e);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('touchcancel', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchcancel', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      redrawCanvas();
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, redrawCanvas]);

  const handleCanvasMouseUp = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-10 ${
        drawingEnabled ? 'cursor-crosshair' : 'pointer-events-none'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
      onTouchStart={handleMouseDown}
    />
  );
}
