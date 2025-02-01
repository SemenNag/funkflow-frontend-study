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
    setBuildingInfo(undefined);
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

  const handleChangeBuildingSize = useCallback((size: Dimension2D) => {
    if (buildingInfo) {
      setBuildingInfo({
        ...buildingInfo,
        size,
      });
    }

    applicationRef.current?.setActiveBuildingSize(size);
  }, [buildingInfo]);
  const handleChangeBuildingFloors = useCallback((floors: number) => {
    if (buildingInfo) {
      setBuildingInfo({
        ...buildingInfo,
        floors,
      });
    }

    applicationRef.current?.setActiveBuildingFloors(floors);
  }, [buildingInfo]);
  const handleChangeBuildingFloorsHeight = useCallback((floorsHeight: number) => {
    if (buildingInfo) {
      setBuildingInfo({
        ...buildingInfo,
        floorsHeight,
      })
    }

    applicationRef.current?.setActiveBuildingFloorsHeight(floorsHeight);
  }, [buildingInfo]);
  const handleDeleteBuilding = useCallback(() => {
    applicationRef.current?.deleteActiveBuilding();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <canvas className="three-app" ref={canvasRef}></canvas>
      <div className="add-building-button-wrapper">
        <Button
          leftSection={<PlusIcon />}
          onClick={handleAddBuilding}
          variant="white"
        >Building</Button>
      </div>
      <BuildingInfoCard
        buildingInfo={buildingInfo}
        coords={coords}
        isOpen={isOpen}
        handleChangeBuildingSize={handleChangeBuildingSize}
        handleChangeBuildingFloors={handleChangeBuildingFloors}
        handleChangeBuildingFloorsHeight={handleChangeBuildingFloorsHeight}
        handleClickDeleteBuilding={handleDeleteBuilding}
      />
    </MantineProvider>
  );
}
