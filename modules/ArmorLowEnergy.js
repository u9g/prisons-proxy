const Module = require('./Module')
const clientUtils = require('../client_utilities')
const { OUT_OF_SYSTEMS_ENERGY, OUT_OF_ANTIVIRUS_ENERGY } = require('../constants')

const debounce = {}

module.exports = class ArmorLowEnergy extends Module {
  onArmorPieceSent (item, nbt, armorType, toClient, toServer, config) {
    if (!nbt?._xl) return
    const _xl = nbt._xl.toString()
    if (config.notify_on_low_energy && item.nbtData) {
      if (debounce[_xl] || nbt?._x !== 'gear') return

      const enchants = nbt.chargable?.givenEnchants ?? nbt.chargable?.enchants
      if (!enchants) return

      if (armorType === 'Boots' && 'SYSTEMREBOOT' in enchants) {
        if (enchants.SYSTEMREBOOT === 3 && +nbt.chargable.energy < 25_000_000) {
          clientUtils.sendManyChat(toClient, OUT_OF_SYSTEMS_ENERGY)
        } else if (+nbt.chargable.energy <= 100_000_000) {
          clientUtils.sendManyChat(toClient, OUT_OF_SYSTEMS_ENERGY)
        }
      } else if ('ANTIVIRUS' in enchants) {
        if (+nbt.chargable.energy <= 60_000_000) {
          clientUtils.sendManyChat(toClient, OUT_OF_ANTIVIRUS_ENERGY(armorType))
        }
      }

      debounce[_xl] = true
      setTimeout(() => { delete debounce[_xl] }, 2000)
    }
  }
}
