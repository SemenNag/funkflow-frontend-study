import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Application } from './components/Application.ts';
import { Button, createTheme, MantineProvider } from '@mantine/core';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { BuildingInfoCard } from './components/BuildingInfoCard/BuildingInfoCard.tsx';
import { BuildingInfo, Dimension2D } from './types';

const theme = createTheme({});

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const applicationRef = useRef<Application>();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<Dimension2D>({ x: 0, y: 0 });
  const [buildingInfo, setBuildingInfo] = useState<BuildingInfo>();

  const handleOpenActiveBuildingPopover = useCallback((coords: Dimension2D, buildingInfo: BuildingInfo) => {
    setIsOpen(true);
    setCoords(coords);
    setBuildingInfo(buildingInfo);
  }, []);
  const handleCloseActiveBuildingPopover = useCallback(() => {
    setIsOpen(false);
    setCoords({ x: 0,y: 0 });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    applicationRef.current = new Application(canvasRef.current, {
      handleOpenActiveBuildingPopover,
      handleCloseActiveBuildingPopover,
    });

    return () => applicationRef.current?.destroy();
  }, []);

  const handleAddBuilding = useCallback(() => {
    if (!applicationRef.current) return;

    applicationRef.current.addBuilding();
  }, []);

  const handleChangeBuildingSize = useCallback((uuid: string, size: Dimension2D) => {
    if (buildingInfo) {
      setBuildingInfo({
        ...buildingInfo,
        size,
      });
    }

    applicationRef.current?.setBuildingSize(uuid, size);
  }, [buildingInfo]);
  const handleChangeBuildingFloors = useCallback((uuid: string, floors: number) => {
    if (buildingInfo) {
      setBuildingInfo({
        ...buildingInfo,
        floors,
      });
    }

    applicationRef.current?.setBuildingFloors(uuid, floors);
  }, [buildingInfo]);
  const handleChangeBuildingFloorsHeight = useCallback((uuid: string, floorsHeight: number) => {
    if (buildingInfo) {
      setBuildingInfo({
        ...buildingInfo,
        floorsHeight,
      })
    }

    applicationRef.current?.setBuildingFloorHeight(uuid, floorsHeight);
  }, [buildingInfo]);

  return (
    <MantineProvider theme={theme}>
      <canvas className="three-app" ref={canvasRef}></canvas>
      <Button
        leftSection={<PlusIcon />}
        onClick={handleAddBuilding}
        className="add-building-button"
        variant="white"
      >Building</Button>
      <BuildingInfoCard
        buildingInfo={buildingInfo}
        coords={coords}
        isOpen={isOpen}
        handleChangeBuildingSize={handleChangeBuildingSize}
        handleChangeBuildingFloors={handleChangeBuildingFloors}
        handleChangeBuildingFloorsHeight={handleChangeBuildingFloorsHeight}
      />
    </MantineProvider>
  );
}
