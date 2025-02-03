import { ActionIcon, Card, Group, NumberInput, Text } from '@mantine/core';
import { TrashIcon } from '../../icons/TrashIcon.tsx';
import { BuildingInfo, Dimension2D } from '../../types';

interface BuildingInfoCardProps {
  coords: Dimension2D;
  buildingInfo: BuildingInfo;
  handleChangeBuildingSize: (size: Dimension2D) => void;
  handleChangeBuildingFloors: (floors: number) => void;
  handleChangeBuildingFloorsHeight: (floorsHeight: number) => void;
  handleClickDeleteBuilding: () => void;
}

const style = {
  zIndex: 1000,
  gap: '8px',
  transform: 'translateY(-50%)',
};

export function BuildingInfoCard({
  coords,
  buildingInfo,
  handleChangeBuildingSize,
  handleChangeBuildingFloors,
  handleChangeBuildingFloorsHeight,
  handleClickDeleteBuilding,
}: BuildingInfoCardProps) {
  const handleChangeSizeX = (value: number | string) => {
    handleChangeBuildingSize({ x: Number(value), y: buildingInfo.size.y });
  };
  const handleChangeSizeY = (value: number | string) => {
    handleChangeBuildingSize({ x: buildingInfo.size.x, y: Number(value) });
  };
  const handleChangeFloors = (value: number | string) => {
    handleChangeBuildingFloors(Number(value));
  };
  const handleChangeFloorsHeight = (value: number | string) => {
    handleChangeBuildingFloorsHeight(Number(value));
  };

  return (
    <Card
      top={`${coords.y}px`}
      left={`${coords.x + 50}px`}
      pos="absolute"
      style={style}
      withBorder
      radius="sm"
      w="270"
    >
      <Card.Section px="xs" pt="md">
        <Group justify="space-between">
          <Text size="md" fw={500}>{buildingInfo.name}</Text>
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
              value={buildingInfo.size.x.toPrecision(3)}
              leftSection={<Text c="gray" size="xs">X</Text>}
              flex="0 1"
              size="xs"
              styles={{ wrapper: { minWidth: '80px' } }}
              onChange={handleChangeSizeX}
              min={1}
            />
            <NumberInput
              value={buildingInfo.size.y.toPrecision(3)}
              leftSection={<Text c="gray" size="xs">Y</Text>}
              flex="0 1"
              size="xs"
              styles={{ wrapper: { minWidth: '80px' } }}
              onChange={handleChangeSizeY}
              min={1}
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
