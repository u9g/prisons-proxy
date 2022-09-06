import { Config, Item } from '../types'
import { ArmorType } from '../constants'
import { Client, PacketMeta, ServerClient } from 'minecraft-protocol'
import { Packet } from '../packet_types'
import { StateManager } from '../core/StateManager'

export type ChatPacket = Packet & {_name: 'chat'}
export { NBT } from '../types'
export { ArmorType } from '../constants'

export class Module {
  onArmorPieceSent (_item: Item, _nbt: any, _armorType: ArmorType, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  onPlayerSendsChatMessageToServerReturnTrueToCancel (_msg: string, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): boolean { return false }
  handleItem (_item: Item, _lore: string[], _nbt: any, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  messageReceivedFromServerReturnTrueToCancel (_msgString: string, _packet: ChatPacket, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): boolean { return false }
  beforeSendPacketToClient (_data: any, _meta: PacketMeta, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  afterSendPacketToClient (_data: any, _meta: PacketMeta, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  proxyStart (_config: Config, _StateManager: StateManager): void {}
  proxyEnd (_config: Config, _StateManager: StateManager): void {}
  setSlot (_item: Item, _slotNum: number, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  openWindow (_windowTitle: string, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  closeWindow (_toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): void {}
  playerSendPacketToServerReturnTrueToCancel (_data: any, _meta: PacketMeta, _toClient: ServerClient, _toServer: Client, _config: Config, _StateManager: StateManager): boolean { return false }
}

export { Client, ServerClient, PacketMeta } from 'minecraft-protocol'
export { Config, Item } from '../types'
export { StateManager } from '../core/StateManager'
