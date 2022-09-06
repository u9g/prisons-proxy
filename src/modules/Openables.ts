import { Module, Item, ServerClient, Client, Config, StateManager } from './Module'
import mcdLoader from 'minecraft-data'
import { sendChat } from '../client_utilities'
const mcdata = mcdLoader('1.8.9')

export class Openables extends Module {
  override onPlayerSendsChatMessageToServerReturnTrueToCancel (msg: string, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): boolean {
    if (msg !== '/open') return false
    config.make_openables_different = !config.make_openables_different
    sendChat(toClient, `{"text": "§b§lYou have just toggled /open to: §a§n${config.make_openables_different ? 'on' : 'off'}\n§r§b§nRight Click§r §ca block§r§f to have the changes apply."}`)
    return true
  }

  override handleItem (item: Item, _lore: string[], nbt: any, _toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): void {
    let newBlockId = item.blockId
    if (!config.make_openables_different) return
    if (nbt?.cosmicData?.mysteryChest === 'loot_midas_sadistdepositbox') {
      newBlockId = mcdata.itemsByName['emerald_block']?.id ?? newBlockId
    } else if (nbt?._x === 'mysterychest') {
      newBlockId = mcdata.itemsByName['diamond_block']?.id ?? newBlockId
    } else {
      newBlockId = mcdata.itemsByName['stone']?.id ?? newBlockId
    }
    item.blockId = newBlockId
    item.itemDamage = 0
  }
}
