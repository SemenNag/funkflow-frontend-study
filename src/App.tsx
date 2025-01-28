import './App.css';
import { useEffect, useRef } from 'react';
import { Application } from './components/Application.ts';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    new Application(canvasRef.current);
  }, []);

  return (
    <canvas id="three-app" ref={canvasRef}></canvas>
  );
}
