export const InventoryItemType = {
  ROOM: 'room',
  DESK: 'desk',
} as const;

export type InventoryItemType =
  (typeof InventoryItemType)[keyof typeof InventoryItemType];

export type RoomData = { capacity: number };
export type DeskData = { equipment: string[] };

export type InventoryItem = {
  id: number;
  title: string;
  type: InventoryItemType;
  data: RoomData | DeskData;
  location: {
    title: string;
    address: string;
  };
};
