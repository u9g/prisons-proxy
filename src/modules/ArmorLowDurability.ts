import { Module, Item, ArmorType, ServerClient, Client, Config, StateManager } from './Module'
import { ARMOR_SUFFIXES, CRITICAL_DURABILITY } from '../constants'
import { sendBigTitleAndManyChat } from '../client_utilities'
import mcdLoader from 'minecraft-data'
const mcdata = mcdLoader('1.8.9')

const debounce = new Map()

export class ArmorLowDurability extends Module {
  override onArmorPieceSent (item: Item, nbt: any, armorType: ArmorType, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): void {
    if (!config.notify_on_low_durability) return
    if (nbt?._xl == null) return
    if (item.blockId === -1) return
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mcdItem = mcdata.items[item.blockId]!
    const { name, maxDurability: maxDurability_ } = mcdItem
    const maxDurability = maxDurability_ as number
    const _xl = nbt._xl.toString()
    if (ARMOR_SUFFIXES.some(suffix => name.endsWith(suffix)) && !debounce.has(_xl)) {
      if ((maxDurability - item.itemDamage) / maxDurability < 0.1) {
        sendBigTitleAndManyChat(toClient, CRITICAL_DURABILITY(armorType))
      }
      debounce.set(_xl, true)
      setTimeout(() => { debounce.delete(_xl) }, 2000)
    }
  }
}
