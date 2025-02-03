import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, createTheme, MantineProvider } from '@mantine/core';

import './App.css';

import { Application, ApplicationEventMap } from './classes/Application.ts';
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

  const handleOpenActiveBuildingPopover = useCallback(({ coords, buildingInfo }: ApplicationEventMap['setActiveBuilding']) => {
    setIsOpen(true);
    setCoords(coords);
    setBuildingInfo(buildingInfo);
  }, []);
  const handleCloseActiveBuildingPopover = useCallback(() => {
    setIsOpen(false);
    setCoords({ x: 0,y: 0 });
    setBuildingInfo(undefined);
  }, []);
  const handleUpdateBuildingInfo = useCallback(({ buildingInfo }: ApplicationEventMap['activeBuildingInfoUpdated']) => {
    setBuildingInfo(buildingInfo);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    applicationRef.current = new Application(canvasRef.current);

    applicationRef.current.addEventListener('setActiveBuilding', handleOpenActiveBuildingPopover);
    applicationRef.current.addEventListener('unsetActiveBuilding', handleCloseActiveBuildingPopover);
    applicationRef.current.addEventListener('activeBuildingInfoUpdated', handleUpdateBuildingInfo);

    return () => {
      applicationRef.current?.removeEventListener('setActiveBuilding', handleOpenActiveBuildingPopover);
      applicationRef.current?.removeEventListener('unsetActiveBuilding', handleCloseActiveBuildingPopover);
      applicationRef.current?.removeEventListener('activeBuildingInfoUpdated', handleUpdateBuildingInfo);
      applicationRef.current?.destroy();
      applicationRef.current = undefined;
    }
  }, []);

  const handleAddBuilding = useCallback(() => {
    if (!applicationRef.current) return;

    applicationRef.current.addBuilding();
  }, []);

  const handleChangeBuildingSize = useCallback((size: Dimension2D) => {
    applicationRef.current?.setActiveBuildingSize(size);
  }, [buildingInfo]);
  const handleChangeBuildingFloors = useCallback((floors: number) => {
    applicationRef.current?.setActiveBuildingFloors(floors);
  }, [buildingInfo]);
  const handleChangeBuildingFloorsHeight = useCallback((floorsHeight: number) => {
    applicationRef.current?.setActiveBuildingFloorsHeight(floorsHeight);
  }, [buildingInfo]);
  const handleDeleteBuilding = useCallback(() => {
    applicationRef.current?.deleteActiveBuilding();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <canvas className="three-app" ref={canvasRef} />
      <div className="add-building-button-wrapper">
        <Button
          leftSection={<PlusIcon />}
          onClick={handleAddBuilding}
          variant="white"
        >Building</Button>
      </div>
      {isOpen && buildingInfo && (
        <BuildingInfoCard
          buildingInfo={buildingInfo}
          coords={coords}
          handleChangeBuildingSize={handleChangeBuildingSize}
          handleChangeBuildingFloors={handleChangeBuildingFloors}
          handleChangeBuildingFloorsHeight={handleChangeBuildingFloorsHeight}
          handleClickDeleteBuilding={handleDeleteBuilding}
        />
      )}
    </MantineProvider>
  );
}
