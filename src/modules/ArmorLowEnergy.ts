import { Module, Item, ArmorType, ServerClient, Client, Config, StateManager } from './Module'
// const clientUtils = require('../client_utilities')
import { sendManyChat } from '../client_utilities'
import { OUT_OF_SYSTEMS_ENERGY, OUT_OF_ANTIVIRUS_ENERGY } from '../constants'

const debounce = new Map()

export class ArmorLowEnergy extends Module {
  override onArmorPieceSent (_item: Item, nbt: any, armorType: ArmorType, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): void {
    if (nbt?._xl == null) return
    const _xl = (nbt)._xl.toString()
    if (config.notify_on_low_energy) {
      if (debounce.has(_xl) || nbt?._x !== 'gear') return

      const enchants = nbt.chargable?.givenEnchants ?? nbt.chargable?.enchants
      if (enchants == null) return

      if (armorType === 'Boots' && 'SYSTEMREBOOT' in enchants) {
        if (enchants.SYSTEMREBOOT === 3 && +nbt.chargable.energy < 25_000_000) {
          sendManyChat(toClient, OUT_OF_SYSTEMS_ENERGY)
        } else if (+nbt.chargable.energy <= 100_000_000) {
          sendManyChat(toClient, OUT_OF_SYSTEMS_ENERGY)
        }
      } else if ('ANTIVIRUS' in enchants) {
        if (+(nbt.chargable).energy <= 60_000_000) {
          sendManyChat(toClient, OUT_OF_ANTIVIRUS_ENERGY(armorType))
        }
      }

      debounce.set(_xl, true)
      setTimeout(() => { debounce.delete(_xl) }, 2000)
    }
  }
}
