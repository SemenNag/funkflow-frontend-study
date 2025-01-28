import './App.css';
import { useCallback, useEffect, useRef } from 'react';
import { Application } from './components/Application.ts';
import { Button, createTheme, MantineProvider } from '@mantine/core';
import { PlusIcon } from './icons/PlusIcon.tsx';

const theme = createTheme({});

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const applicationRef = useRef<Application>();

  useEffect(() => {
    if (!canvasRef.current) return;

    applicationRef.current = new Application(canvasRef.current);
  }, []);

  const handleAddBuilding = useCallback(() => {
    if (!applicationRef.current) return;

    applicationRef.current.addBuilding();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <canvas className="three-app" ref={canvasRef}></canvas>
      <Button
        leftSection={<PlusIcon />}
        onClick={handleAddBuilding}
        className="add-building-button"
        variant="white"
      >Building</Button>
    </MantineProvider>
  );
}
