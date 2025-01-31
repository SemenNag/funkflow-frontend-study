import { ActionIcon, Card, Group, NumberInput, Text } from '@mantine/core';
import { TrashIcon } from '../../icons/TrashIcon.tsx';
import { BuildingInfo, Dimension2D } from '../../types';

interface BuildingInfoCardProps {
  coords: Dimension2D;
  isOpen: boolean;
  buildingInfo?: BuildingInfo;
  handleChangeBuildingSize: (uuid: string, size: Dimension2D) => void;
  handleChangeBuildingFloors: (uuid: string, floors: number) => void;
  handleChangeBuildingFloorsHeight: (uuid: string, floorsHeight: number) => void;
  handleClickDeleteBuilding: () => void;
}

export function BuildingInfoCard({
  coords,
  isOpen,
  buildingInfo,
  handleChangeBuildingSize,
  handleChangeBuildingFloors,
  handleChangeBuildingFloorsHeight,
  handleClickDeleteBuilding,
}: BuildingInfoCardProps) {
  if (!isOpen || !buildingInfo) return null;

  const handleChangeSizeX = (value: number | string) => {
    handleChangeBuildingSize(buildingInfo.uuid, { x: Number(value), y: buildingInfo.size.y });
  };
  const handleChangeSizeY = (value: number | string) => {
    handleChangeBuildingSize(buildingInfo.uuid, { x: buildingInfo.size.x, y: Number(value) });
  };
  const handleChangeFloors = (value: number | string) => {
    handleChangeBuildingFloors(buildingInfo.uuid, Number(value));
  };
  const handleChangeFloorsHeight = (value: number | string) => {
    handleChangeBuildingFloorsHeight(buildingInfo.uuid, Number(value));
  };

  return (
    <Card
      top={`${coords.y}px`}
      left={`${coords.x}px`}
      pos="absolute"
      style={{ zIndex: 1000, gap: '8px' }}
      withBorder
      radius="sm"
      w="270"
    >
      <Card.Section px="xs" pt="md">
        <Group justify="space-between">
          <Text size="md" fw={500}>{ buildingInfo.name }</Text>
          <ActionIcon variant="transparent" color="red" onClick={handleClickDeleteBuilding}>
            <TrashIcon size={20} />
          </ActionIcon>
        </Group>
      </Card.Section>

      <Card.Section px="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text size="xs" fw={500}>Size (m)</Text>
          <Group gap={8} flex="0 1" wrap="nowrap">
            <NumberInput
              value={buildingInfo.size.x}
              leftSection={<Text c="gray" size="xs">X</Text>}
              flex="0 1"
              size="xs"
              styles={{ wrapper: { minWidth: '80px' } }}
              onChange={handleChangeSizeX}
              min={0}
            />
            <NumberInput
              value={buildingInfo.size.y}
              leftSection={<Text c="gray" size="xs">Y</Text>}
              flex="0 1"
              size="xs"
              styles={{ wrapper: { minWidth: '80px' } }}
              onChange={handleChangeSizeY}
              min={0}
            />
          </Group>
        </Group>
      </Card.Section>

      <Card.Section px="xs">
        <Group justify="space-between">
          <Text size="xs" fw={500}>Floors</Text>
          <NumberInput
            value={buildingInfo.floors}
            flex="0 1"
            size="xs"
            styles={{ wrapper: { minWidth: '80px' } }}
            onChange={handleChangeFloors}
            min={1}
          />
        </Group>
      </Card.Section>

      <Card.Section px="xs" pb="md">
        <Group justify="space-between">
          <Text size="xs" fw={500}>Floors height (m)</Text>
          <NumberInput
            value={buildingInfo.floorsHeight}
            flex="0 1"
            size="xs"
            styles={{ wrapper: { minWidth: '80px' } }}
            onChange={handleChangeFloorsHeight}
            min={1}
          />
        </Group>
      </Card.Section>
    </Card>
  )
}
