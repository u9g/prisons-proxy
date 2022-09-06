import { Item } from './types'

interface SpawnEntityBase {
  type: number
}

interface InventoryBase {
  windowId: number
}

interface ChatPacket {
  _name: 'chat'
  message: string
}

type SpawnEntityPacket = {
  _name: 'spawn_entity'
} & SpawnEntityBase

type SpawnEntityLivingPacket = {
  _name: 'spawn_entity_living'
  metadata: Array<{key: number, value: any}>
} & SpawnEntityBase

interface WorldParticlesPacket {
  _name: 'world_particles'
}

type SetSlotPacket = {
  _name: 'set_slot'
  slot: number
  item: Item
} & InventoryBase

type WindowItemsPacket = {
  _name: 'window_items'
  items: Item[]
} & InventoryBase

type OpenWindowPacket = {
  _name: 'open_window'
  windowTitle: string
} & InventoryBase

type CloseWindowPacket = {
  _name: 'close_window'
} & InventoryBase

interface RespawnPacket {
  _name: 'respawn'
}

interface WorldEventPacket { // 1.12.2
  _name: 'world_event'
  effectId: number
}

export type Packet =
| ChatPacket
| SpawnEntityLivingPacket
| SpawnEntityPacket
| WorldParticlesPacket
| SetSlotPacket
| WindowItemsPacket
| OpenWindowPacket
| CloseWindowPacket
| RespawnPacket
| WorldEventPacket

interface ChatEvent {
  action: string
  value: string
}

export interface ChatComponent {
  hoverEvent?: ChatEvent
  clickEvent?: ChatEvent
  color: 'black' | 'dark_blue' | 'dark_green' | 'dark_aqua' | 'dark_red' | 'dark_purple' | 'gold' | 'gray' | 'dark_gray' | 'blue' | 'green' | 'aqua' | 'red' | 'red' | 'yellow' | 'white'
  text: string
  bold: boolean
  extra: ChatComponent[]
}
